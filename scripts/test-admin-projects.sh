#!/usr/bin/env bash
#
# Integration checks for the admin project routes: schema validation on
# create/update, and whether an edit reaches the public pages without a redeploy.
#
# Requires a running server (BASE, default http://127.0.0.1:3000), the local
# Supabase stack from `.cursor/start.sh`, and at least one seeded project.
#
# Usage: bash scripts/test-admin-projects.sh
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="${BASE:-http://127.0.0.1:3000}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

PASS=0
FAIL=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf '  PASS  %-52s %s\n' "$label" "$actual"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-52s expected=%s actual=%s\n' "$label" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

env_val() { sed -n "s/^$1=//p" "$REPO_ROOT/.env.local"; }

SERVICE_KEY="$(env_val SUPABASE_SERVICE_ROLE_KEY)"
SUPABASE_URL="$(env_val NEXT_PUBLIC_SUPABASE_URL)"

# POST JSON to an admin route as the logged-in admin; prints the status code.
admin_post() {
  local path="$1" payload="$2"
  curl -s -o /tmp/admin_projects_body -w '%{http_code}' \
    -X POST "$BASE$path" \
    -H 'Content-Type: application/json' \
    -b "$COOKIE_JAR" \
    -d "$payload"
}

echo "=============================================================="
echo "Admin project routes — validation + public revalidation"
echo "base: $BASE"
echo "=============================================================="

echo
echo "-- Sign in ------------------------------------------------------"
login_status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/admin/login" \
  -c "$COOKIE_JAR" \
  --data-urlencode "username=$(env_val ADMIN_USERNAME)" \
  --data-urlencode "password=$(env_val ADMIN_PASSWORD)")
check "login redirects" 307 "$login_status"
check "session cookie stored" 1 "$(grep -c 'admin_auth' "$COOKIE_JAR")"

SLUG=$(curl -s "$SUPABASE_URL/rest/v1/projects?select=slug&limit=1" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" |
  python3 -c 'import sys,json; rows=json.load(sys.stdin); print(rows[0]["slug"] if rows else "")')

if [[ -z "$SLUG" ]]; then
  echo "  no seeded project found; run the local seed first" >&2
  exit 1
fi
echo "  using project: $SLUG"

echo
echo "-- Update validation (Zod) --------------------------------------"

valid_update() {
  cat <<JSON
{"title":"$1","category":"retail","location":"New Delhi","client_name":"Cartier",
 "basic_description":"Flagship boutique fit-out.",
 "description":"A flagship boutique fit-out executed over 14 weeks.",
 "duration":"14 weeks","area":"3,200 sq ft","year":$2}
JSON
}

check "unknown category rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" \
    "$(valid_update 'Bad Category' 2024 | sed 's/"retail"/"not-a-category"/')")"

check "blank title rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" "$(valid_update '' 2024)")"

check "non-numeric year rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" \
    "$(valid_update 'Bad Year' 2024 | sed 's/"year":2024/"year":"not-a-year"/')")"

check "year far in the future rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" "$(valid_update 'Future' 2999)")"

check "year before 1900 rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" "$(valid_update 'Ancient' 1700)")"

check "malformed JSON rejected" 400 \
  "$(admin_post "/api/admin/projects/$SLUG" 'not json')"

echo
echo "-- Create validation (Zod) --------------------------------------"

check "create without images rejected" 400 \
  "$(admin_post /api/admin/projects '{"title":"No Images","images":[]}')"

check "create with off-bucket image rejected" 400 \
  "$(admin_post /api/admin/projects \
    '{"title":"Bad Host","images":["https://evil.example.com/a.jpg"]}')"

check "create with non-URL image rejected" 400 \
  "$(admin_post /api/admin/projects '{"title":"Not A URL","images":["../../etc/passwd"]}')"

echo
echo "-- Valid update reaches the public page -------------------------"

title_of() {
  curl -s "$BASE/projects/$SLUG" |
    grep -o '<title>[^<]*</title>' | head -1 | sed -E 's#</?title>##g'
}
db_title() {
  curl -s "$SUPABASE_URL/rest/v1/projects?slug=eq.$SLUG&select=title" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" |
    python3 -c 'import sys,json; print(json.load(sys.stdin)[0]["title"])'
}

check "detail page reachable" 200 \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/projects/$SLUG")"

# The page <title> carries a " | Groove Infra" suffix, so the value to restore
# afterwards has to come from the database rather than the rendered page.
original_title="$(db_title)"
before_title="$(title_of)"
new_title="Cartier Boutique $RANDOM"

check "valid update accepted" 200 \
  "$(admin_post "/api/admin/projects/$SLUG" "$(valid_update "$new_title" 2024)")"
check "  database updated" "$new_title" "$(db_title)"

sleep 2
after_title="$(title_of)"
check "  public page no longer stale" 1 \
  "$([[ "$after_title" != "$before_title" ]] && echo 1 || echo 0)"
check "  public page shows the new title" 1 \
  "$(grep -qF "$new_title" <<<"$after_title" && echo 1 || echo 0)"

echo
echo "-- Rejected update left the record untouched --------------------"
check "bad payload did not overwrite title" "$new_title" "$(db_title)"

echo
echo "-- Restore ------------------------------------------------------"
check "original title restored" 200 \
  "$(admin_post "/api/admin/projects/$SLUG" "$(valid_update "$original_title" 2024)")"
check "  database back to original" "$original_title" "$(db_title)"

echo
echo "=============================================================="
printf 'passed: %d   failed: %d\n' "$PASS" "$FAIL"
echo "=============================================================="
[[ "$FAIL" -eq 0 ]]
