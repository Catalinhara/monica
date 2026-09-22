#!/usr/bin/env bash
# Run on the VPS as root after the project is in /opt/romantic-journey
set -euo pipefail

APP_DIR="/opt/romantic-journey"
DOMAIN_WWW="www.enigmademonica.es"
DOMAIN_APEX="enigmademonica.es"
PORT="3847"

echo "==> Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Installing..."
  apt-get update -y
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

docker --version
docker compose version

echo "==> Building and starting container..."
cd "$APP_DIR"
docker compose up -d --build
docker compose ps
curl -sI "http://127.0.0.1:${PORT}/monica" | head -n 5 || true

echo "==> Locating Caddyfile..."
CADDYFILE=""
for candidate in /etc/caddy/Caddyfile /etc/caddy/Caddyfile.d/Caddyfile; do
  if [[ -f "$candidate" ]]; then
    CADDYFILE="$candidate"
    break
  fi
done

if [[ -z "$CADDYFILE" ]]; then
  # Try caddy environ / systemd
  if systemctl cat caddy 2>/dev/null | grep -q Caddyfile; then
    CADDYFILE=$(systemctl cat caddy 2>/dev/null | grep -oE '/[^ ]*Caddyfile[^ ]*' | head -1 || true)
  fi
fi

if [[ -z "$CADDYFILE" || ! -f "$CADDYFILE" ]]; then
  echo "ERROR: No Caddyfile found. Paste deploy/Caddyfile.snippet manually into your Caddy config."
  ls -la /etc/caddy 2>/dev/null || true
  exit 1
fi

echo "Using Caddyfile: $CADDYFILE"
cp -a "$CADDYFILE" "${CADDYFILE}.bak.$(date +%Y%m%d%H%M%S)"

MARKER="# enigmademonica.es — managed by deploy/bootstrap.sh"
if grep -q "www.enigmademonica.es" "$CADDYFILE"; then
  echo "Caddy already has enigmademonica.es — leaving existing blocks untouched."
else
  echo "==> Appending site block..."
  cat >> "$CADDYFILE" <<EOF

${MARKER}
${DOMAIN_APEX} {
	redir https://${DOMAIN_WWW}{uri} permanent
}

${DOMAIN_WWW} {
	encode gzip
	reverse_proxy 127.0.0.1:${PORT}
}
EOF
fi

echo "==> Validating and reloading Caddy..."
if command -v caddy >/dev/null 2>&1; then
  caddy validate --config "$CADDYFILE"
  if systemctl is-active --quiet caddy; then
    systemctl reload caddy
  else
    caddy reload --config "$CADDYFILE"
  fi
else
  echo "WARNING: caddy binary not in PATH; reload manually."
fi

echo "==> Done."
echo "Open https://${DOMAIN_WWW}"
