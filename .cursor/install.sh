#!/usr/bin/env bash
# Idempotent bootstrap for the Groove Infra Cloud Agent environment.
# Runs after the repo is checked out. Installs Node deps and the tooling
# (Docker + Supabase CLI) needed to run a self-contained local Supabase
# stack, and pre-pulls the Supabase container images so they are baked
# into the environment snapshot. Per-boot service startup lives in start.sh.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> Installing Node dependencies (npm ci)"
npm ci

echo "==> Installing system packages (docker, fuse-overlayfs)"
export DEBIAN_FRONTEND=noninteractive
sudo -E apt-get update -y
sudo -E apt-get install -y \
  -o Dpkg::Options::="--force-confdef" \
  -o Dpkg::Options::="--force-confold" \
  docker.io docker-compose-v2 fuse-overlayfs uidmap

echo "==> Installing Supabase CLI"
if ! command -v supabase >/dev/null 2>&1; then
  ARCH="$(dpkg --print-architecture)"
  TMP="$(mktemp -d)"
  curl -fsSL "https://github.com/supabase/cli/releases/latest/download/supabase_linux_${ARCH}.tar.gz" -o "$TMP/supabase.tar.gz"
  tar -xzf "$TMP/supabase.tar.gz" -C "$TMP"
  sudo mv "$TMP/supabase" /usr/local/bin/supabase
  sudo chmod +x /usr/local/bin/supabase
  rm -rf "$TMP"
fi
supabase --version

echo "==> Configuring Docker daemon (fuse-overlayfs storage driver)"
sudo mkdir -p /etc/docker
echo '{"storage-driver":"fuse-overlayfs"}' | sudo tee /etc/docker/daemon.json >/dev/null

# Bring the full stack up once. This pulls the Supabase images (so they are
# cached into the snapshot), applies migrations, and writes .env.local.
echo "==> Bootstrapping local Supabase stack (pulls images, applies migrations)"
"$REPO_DIR/.cursor/start.sh"

# Stop the containers so the snapshot only carries the images and the backed-up
# database volume, not running processes. start.sh brings them back per boot.
echo "==> Stopping containers (images remain cached for the snapshot)"
supabase stop --project-id workspace >/dev/null 2>&1 || true

echo "==> install.sh complete"
