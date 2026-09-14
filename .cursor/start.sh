#!/usr/bin/env bash
# Per-boot startup for the Groove Infra Cloud Agent environment.
# Brings up the Docker daemon and the local Supabase stack, applies pending
# migrations, and writes a local .env.local. Idempotent and safe to re-run.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

# --- 1. Docker daemon --------------------------------------------------------
if ! sudo docker info >/dev/null 2>&1; then
  echo "==> Starting Docker daemon"
  sudo mkdir -p /etc/docker
  echo '{"storage-driver":"fuse-overlayfs"}' | sudo tee /etc/docker/daemon.json >/dev/null
  sudo bash -c 'nohup dockerd >/var/log/dockerd.log 2>&1 &'
  for _ in $(seq 1 30); do
    sudo docker info >/dev/null 2>&1 && break
    sleep 1
  done
fi

# Nested Docker: the legacy iptables FORWARD chain defaults to DROP and
# silently blocks container-to-container traffic. Allow forwarding on both
# the nft and legacy backends so the Supabase containers can reach each other.
sudo iptables -P FORWARD ACCEPT 2>/dev/null || true
sudo iptables-legacy -P FORWARD ACCEPT 2>/dev/null || true

# Make the Docker socket usable without sudo for the rest of this session.
sudo groupadd -f docker
sudo usermod -aG docker "$(id -un)" 2>/dev/null || true
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# --- 2. Supabase stack -------------------------------------------------------
echo "==> Starting local Supabase stack"
supabase start
# Apply any migrations that are not yet applied (no-op when already current).
supabase migration up --local 2>/dev/null || true

# --- 3. Local environment file ----------------------------------------------
if [ ! -f "$REPO_DIR/.env.local" ]; then
  echo "==> Writing .env.local (local Supabase + dev admin credentials)"
  ANON_KEY="$(supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"$/\1/p')"
  SERVICE_KEY="$(supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"$/\1/p')"
  cat > "$REPO_DIR/.env.local" <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_KEY}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
ADMIN_TOKEN=local-dev-admin-token
RESEND_USE_TEST_SENDER=true
ENQUIRY_INBOX=dev@example.com
EOF
fi

echo "==> start.sh complete — Supabase Studio: http://127.0.0.1:54323"
