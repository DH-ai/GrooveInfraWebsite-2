#!/usr/bin/env bash
# Launch the Next.js dev server against the LOCAL Supabase stack.
# Injected hosted secrets are unset here so that /workspace/.env.local (local
# Supabase + dev admin credentials) takes effect — Next.js does not override
# environment variables that are already set in the shell.
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

unset NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
      ADMIN_USERNAME ADMIN_PASSWORD ADMIN_TOKEN \
      ENQUIRY_INBOX ENQUIRY_FROM NOREPLY_FROM PUBLIC_CONTACT_EMAIL TEST_EMAIL_TO

exec npm run dev
