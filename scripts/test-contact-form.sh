#!/usr/bin/env bash
#
# Integration checks for the enquiry form: schema validation, spam heuristics,
# persistence, rate limiting and the enquiries RLS policy.
#
# Requires a running server (BASE, default http://127.0.0.1:3000) and the local
# Supabase stack from `.cursor/start.sh`. Row assertions go through psql in the
# Supabase container because `enquiries` is deliberately unreadable with the anon
# key. Each case sends a distinct X-Forwarded-For so the in-memory rate limiter
# does not bleed between cases.
#
# Usage: bash scripts/test-contact-form.sh
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="${BASE:-http://127.0.0.1:3000}"
PASS=0
FAIL=0

psql_q() {
  docker exec "$(docker ps --filter name=supabase_db -q | head -1)" \
    psql -U postgres -d postgres -tAc "$1" 2>/dev/null
}

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

# Cloudflare's documented always-pass test secret. Any response string verifies
# against it, so with these keys configured the suite can mint its own tokens.
# A real secret cannot be satisfied without a browser, so the Turnstile-dependent
# cases are skipped instead of reported as failures.
TURNSTILE_TEST_SECRET='1x0000000000000000000000000000000AA'
CONFIGURED_SECRET="$(sed -n 's/^TURNSTILE_SECRET_KEY=//p' "$REPO_ROOT/.env.local" 2>/dev/null)"

if [[ -z "$CONFIGURED_SECRET" ]]; then
  TURNSTILE_MODE=off
  TT_TOKEN=''
elif [[ "$CONFIGURED_SECRET" == "$TURNSTILE_TEST_SECRET" ]]; then
  TURNSTILE_MODE=test-keys
  TT_TOKEN='suite-generated-token'
else
  TURNSTILE_MODE=real-keys
  TT_TOKEN=''
fi

# post <ip> <json> -> prints "STATUS<TAB>BODY"
# Splices in a CAPTCHA token when one is available, so the same payloads work
# whether or not Turnstile is switched on.
post() {
  local ip="$1" body="$2"
  if [[ -n "$TT_TOKEN" && "$body" == '{'* && "$body" != *turnstileToken* ]]; then
    body="{\"turnstileToken\":\"$TT_TOKEN\",${body#\{}"
  fi
  curl -s -o /tmp/contact_form_body -w '%{http_code}' \
    -X POST "$BASE/api/contact" \
    -H 'Content-Type: application/json' \
    -H "X-Forwarded-For: $ip" \
    -d "$body"
  printf '\t'
  cat /tmp/contact_form_body
}

status() { cut -f1 <<<"$1"; }
body()   { cut -f2- <<<"$1"; }

now_ms() { date +%s%3N; }
# A plausible human dwell time: rendered 30s ago.
human_ts() { echo $(( $(now_ms) - 30000 )); }

# The rate limiter keys on client IP and holds counters for ten minutes, so a
# rerun within that window would start from an exhausted budget. Each run gets a
# fresh block of synthetic addresses to stay repeatable.
RUN_BLOCK="$(( RANDOM % 200 + 20 )).$(( RANDOM % 200 + 20 ))"
ip() { echo "10.$RUN_BLOCK.$1"; }

echo "=============================================================="
echo "Enquiry form — validation / spam / persistence / rate limiting"
echo "base: $BASE"
echo "turnstile: $TURNSTILE_MODE"
echo "=============================================================="

echo
echo "-- Zod validation ------------------------------------------------"

r=$(post "$(ip 1)" "{\"name\":\"\",\"email\":\"a@b.com\",\"message\":\"hello there\",\"renderedAt\":$(human_ts)}")
check "empty name rejected" 400 "$(status "$r")"
check "  message names the field" 1 "$(grep -qi 'name' <<<"$(body "$r")" && echo 1 || echo 0)"

r=$(post "$(ip 2)" "{\"name\":\"Ada\",\"email\":\"not-an-email\",\"message\":\"hello there\",\"renderedAt\":$(human_ts)}")
check "malformed email rejected" 400 "$(status "$r")"

r=$(post "$(ip 3)" "{\"name\":\"Ada\",\"email\":\"a@b.com\",\"message\":\"\",\"renderedAt\":$(human_ts)}")
check "empty message rejected" 400 "$(status "$r")"

long=$(head -c 5001 /dev/zero | tr '\0' 'x')
r=$(post "$(ip 4)" "{\"name\":\"Ada\",\"email\":\"a@b.com\",\"message\":\"$long\",\"renderedAt\":$(human_ts)}")
check "over-length message rejected (>5000)" 400 "$(status "$r")"

r=$(post "$(ip 5)" '{"name":"Ada"}')
check "missing email+message rejected" 400 "$(status "$r")"

r=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/contact" \
  -H 'Content-Type: application/json' -H "X-Forwarded-For: $(ip 6)" -d 'not json')
check "malformed JSON rejected" 400 "$r"

echo
echo "-- Spam heuristics (silent accept, nothing stored) --------------"

before=$(psql_q "select count(*) from public.enquiries")

r=$(post "$(ip 11)" "{\"name\":\"Bot\",\"email\":\"bot@spam.test\",\"message\":\"buy cheap things\",\"botField\":\"http://spam.example\",\"renderedAt\":$(human_ts)}")
check "honeypot filled -> 200 (no signal to bot)" 200 "$(status "$r")"

r=$(post "$(ip 12)" "{\"name\":\"Fast\",\"email\":\"fast@spam.test\",\"message\":\"instant submit\",\"renderedAt\":$(now_ms)}")
check "sub-2s submit -> 200 (no signal to bot)" 200 "$(status "$r")"

r=$(post "$(ip 13)" "{\"name\":\"Stale\",\"email\":\"stale@spam.test\",\"message\":\"day old form\",\"renderedAt\":$(( $(now_ms) - 13 * 60 * 60 * 1000 ))}")
check "stale form -> 200 (no signal to bot)" 200 "$(status "$r")"

after=$(psql_q "select count(*) from public.enquiries")
check "no spam rows persisted" "$before" "$after"
check "no spam addresses in table" 0 \
  "$(psql_q "select count(*) from public.enquiries where email like '%@spam.test'")"

echo
echo "-- Happy path persistence --------------------------------------"

stamp="probe-$(date +%s)@example.com"
r=$(post "$(ip 21)" "{\"name\":\"Dhruv Test\",\"email\":\"$stamp\",\"phone\":\"+91 99999 00000\",\"company\":\"Acme\",\"projectType\":\"Retail\",\"location\":\"Noida\",\"message\":\"We would like a fit-out quote for a 4000 sqft store.\",\"renderedAt\":$(human_ts)}")
check "valid submission accepted" 200 "$(status "$r")"
check "  row persisted" 1 "$(psql_q "select count(*) from public.enquiries where email='$stamp'")"
check "  fields stored intact" "Dhruv Test|Retail|Noida|Acme" \
  "$(psql_q "select name||'|'||project_type||'|'||location||'|'||company from public.enquiries where email='$stamp'")"
check "  status defaults to new" "new" "$(psql_q "select status from public.enquiries where email='$stamp'")"

# RESEND_API_KEY is absent in local dev, so the mail step fails. The
# visitor must still get a success (the lead is safe) and the admin list must be
# able to show that the notification did not go out.
check "  mail failure still reports success" 200 "$(status "$r")"
check "  email_sent flagged false for admin" "f" \
  "$(psql_q "select email_sent from public.enquiries where email='$stamp'")"

echo
echo "-- No internal detail leaked to the client ----------------------"
b=$(body "$r")
check "no vendor name in response" 0 "$(grep -ci 'resend\|supabase\|api.key\|postgres' <<<"$b")"
check "response is a bare ok" '{"ok":true}' "$b"

echo
echo "-- Email normalisation -----------------------------------------"
mixed="MiXeD-$(date +%s)@Example.COM"
lower=$(tr '[:upper:]' '[:lower:]' <<<"$mixed")
r=$(post "$(ip 31)" "{\"name\":\"Case Test\",\"email\":\"$mixed\",\"message\":\"checking lowercase normalisation\",\"renderedAt\":$(human_ts)}")
check "mixed-case email accepted" 200 "$(status "$r")"
check "  stored lowercased" 1 "$(psql_q "select count(*) from public.enquiries where email='$lower'")"

echo
echo "-- Rate limiting (5 per 10 min per IP) -------------------------"
codes=()
for i in 1 2 3 4 5 6 7; do
  r=$(post "$(ip 41)" "{\"name\":\"RL $i\",\"email\":\"rl$i@example.com\",\"message\":\"rate limit probe number $i\",\"renderedAt\":$(human_ts)}")
  codes+=("$(status "$r")")
done
check "requests 1-5 allowed" "200 200 200 200 200" "${codes[0]} ${codes[1]} ${codes[2]} ${codes[3]} ${codes[4]}"
check "request 6 throttled" 429 "${codes[5]}"
check "request 7 throttled" 429 "${codes[6]}"

ra=$(curl -s -D - -o /dev/null -X POST "$BASE/api/contact" \
  -H 'Content-Type: application/json' -H "X-Forwarded-For: $(ip 41)" \
  -d '{"name":"RL","email":"rl@example.com","message":"another probe attempt"}' \
  | grep -i '^retry-after:' | tr -d '\r' | awk '{print $2}')
check "throttled response carries Retry-After" 1 "$([[ -n "$ra" && "$ra" -gt 0 ]] && echo 1 || echo 0)"

check "a different IP is unaffected" 200 \
  "$(status "$(post "$(ip 42)" "{\"name\":\"Other IP\",\"email\":\"other@example.com\",\"message\":\"separate bucket probe\",\"renderedAt\":$(human_ts)}")")"

echo
echo "-- Turnstile ----------------------------------------------------"
case "$TURNSTILE_MODE" in
  off)
    # No keys configured is a supported setup: the CAPTCHA is skipped so the form
    # keeps working, which the passing cases above already demonstrate.
    echo "  SKIP  no keys configured; verification is bypassed by design"
    ;;
  real-keys)
    echo "  SKIP  a real secret is configured; tokens need a browser"
    ;;
  test-keys)
    r=$(curl -s -o /tmp/contact_form_body -w '%{http_code}' -X POST "$BASE/api/contact" \
      -H 'Content-Type: application/json' -H "X-Forwarded-For: $(ip 51)" \
      -d "{\"name\":\"No Token\",\"email\":\"notoken@example.com\",\"message\":\"submitted with no captcha token at all\",\"renderedAt\":$(human_ts)}")
    check "missing token rejected when configured" 400 "$r"
    check "  no row persisted for the rejected attempt" 0 \
      "$(psql_q "select count(*) from public.enquiries where email='notoken@example.com'")"

    tok_email="turnstile-$(date +%s)@example.com"
    r=$(post "$(ip 52)" "{\"name\":\"With Token\",\"email\":\"$tok_email\",\"message\":\"submitted with a verified captcha token\",\"renderedAt\":$(human_ts)}")
    check "verified token accepted" 200 "$(status "$r")"
    check "  row persisted" 1 "$(psql_q "select count(*) from public.enquiries where email='$tok_email'")"
    ;;
esac

echo
echo "-- Enquiries RLS ------------------------------------------------"
ANON=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$REPO_ROOT/.env.local" | cut -d= -f2-)
SUPA=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$REPO_ROOT/.env.local" | cut -d= -f2-)

anon_read=$(curl -s "$SUPA/rest/v1/enquiries?select=email" -H "apikey: $ANON" -H "Authorization: Bearer $ANON")
check "anon SELECT returns no rows" "[]" "$anon_read"

anon_write=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SUPA/rest/v1/enquiries" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' \
  -d '{"name":"RLS","email":"rls@spam.test","message":"should be blocked"}')
check "anon INSERT blocked (not 201)" 1 "$([[ "$anon_write" != "201" ]] && echo 1 || echo 0)"

echo
echo "=============================================================="
printf 'passed: %d   failed: %d\n' "$PASS" "$FAIL"
echo "=============================================================="
[[ "$FAIL" -eq 0 ]]
