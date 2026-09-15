#!/usr/bin/env bash
#
# Verifies brute-force throttling on the admin login endpoint, and that the
# throttle is scoped per client rather than global.
#
# Usage: bash scripts/test-login-throttle.sh
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="${BASE:-http://127.0.0.1:3000}"
PASS=0
FAIL=0

# Attempt counters live for fifteen minutes, so a rerun inside that window needs
# addresses that have not already been throttled.
RUN_BLOCK="$(( RANDOM % 200 + 20 )).$(( RANDOM % 200 + 20 ))"
ip() { echo "198.$RUN_BLOCK.$1"; }
IP="$(ip 7)"

check() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf '  PASS  %-50s %s\n' "$label" "$actual"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-50s expected=%s actual=%s\n' "$label" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

# Prints the ?error= value from the redirect Location, or the status code.
attempt() {
  local ip="$1" user="$2" pass="$3"
  local loc
  loc=$(curl -s -D - -o /dev/null -X POST "$BASE/api/admin/login" \
    -H "X-Forwarded-For: $ip" \
    --data-urlencode "username=$user" \
    --data-urlencode "password=$pass" \
    | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  sed -E 's#^https?://[^/]+##' <<<"$loc"
}

echo "=============================================================="
echo "Admin login throttling (10 per 15 min per IP)"
echo "=============================================================="
echo

results=()
for i in $(seq 1 12); do
  results+=("$(attempt "$IP" "admin" "wrong-password-$i")")
done

bad=0
for i in $(seq 0 9); do
  [[ "${results[$i]}" == "/admin/login?error=invalid" ]] || bad=$((bad + 1))
done
check "attempts 1-10 rejected as invalid" 0 "$bad"
check "attempt 11 rate-limited" "/admin/login?error=rate-limited" "${results[10]}"
check "attempt 12 rate-limited" "/admin/login?error=rate-limited" "${results[11]}"

# A throttled IP must stay locked out even with the correct password.
USER=$(grep '^ADMIN_USERNAME=' "$REPO_ROOT"/.env.local | cut -d= -f2-)
PW=$(grep '^ADMIN_PASSWORD=' "$REPO_ROOT"/.env.local | cut -d= -f2-)
check "correct password still throttled on that IP" "/admin/login?error=rate-limited" \
  "$(attempt "$IP" "$USER" "$PW")"

# A clean IP is a separate bucket and can still log in.
check "clean IP can log in" "/admin" "$(attempt "$(ip 90)" "$USER" "$PW")"
check "clean IP wrong password -> invalid" "/admin/login?error=invalid" \
  "$(attempt "$(ip 91)" "$USER" "nope")"

echo
printf 'passed: %d   failed: %d\n' "$PASS" "$FAIL"
[[ "$FAIL" -eq 0 ]]
