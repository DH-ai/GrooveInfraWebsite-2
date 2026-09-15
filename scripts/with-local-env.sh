#!/usr/bin/env bash
# Runs a command with every variable declared in .env.local cleared from the
# environment first, so that Next's own .env.local loading is what defines them.
#
# Next deliberately never overwrites a variable that is already set in
# process.env. That is the right behaviour for a real deployment and a trap
# locally: any shell, CI runner or agent sandbox that exports its own
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ADMIN_PASSWORD silently
# wins over the file, and the app ends up talking to a different database and
# accepting different credentials than the .env.local you are reading.
#
#   scripts/with-local-env.sh npm run build
#   scripts/with-local-env.sh npm start
#   scripts/with-local-env.sh npm run dev
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "with-local-env.sh: $ENV_FILE not found; copy .env.example and fill it in." >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "usage: scripts/with-local-env.sh <command> [args...]" >&2
  exit 2
fi

unset_flags=()
while IFS= read -r key; do
  [ -n "$key" ] && unset_flags+=("-u" "$key")
done < <(sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "$ENV_FILE")

exec env "${unset_flags[@]}" "$@"
