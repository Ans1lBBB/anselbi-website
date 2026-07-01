#!/usr/bin/env bash
# One-shot: paste a Hardening API Token, save to .env, apply both domains.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ACCOUNT_ID="999ac06e111e7583f9540f81ea6aef2d"

token="${1:-}"
if [[ -z "$token" ]]; then
  echo "Paste Cloudflare Hardening API Token (see SETUP-CLOUDFLARE-TOKEN.md), then Enter:"
  read -r token
fi
if [[ -z "$token" ]]; then
  echo "No token provided." >&2
  exit 1
fi

test_zone() {
  local zone_id="$1"
  /usr/bin/curl -sS -H "Authorization: Bearer $token" \
    "https://api.cloudflare.com/client/v4/zones/$zone_id/bot_management" \
    | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)"
}

if ! test_zone "04d717bca29a0be9f2f19b83234d308e"; then
  echo "Token cannot read Bot Management. Check permissions in SETUP-CLOUDFLARE-TOKEN.md" >&2
  exit 1
fi

for dir in "$ROOT" "/Users/ansel/Projects/daughter-Ariel-website"; do
  [[ -f "$dir/.env" ]] || continue
  if /usr/bin/grep -q '^CLOUDFLARE_HARDENING_TOKEN=' "$dir/.env" 2>/dev/null; then
    /usr/bin/sed -i '' "s|^CLOUDFLARE_HARDENING_TOKEN=.*|CLOUDFLARE_HARDENING_TOKEN=$token|" "$dir/.env"
  else
    printf '\nCLOUDFLARE_HARDENING_TOKEN=%s\n' "$token" >> "$dir/.env"
  fi
  echo "Updated $dir/.env"
done

export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
export CLOUDFLARE_HARDENING_TOKEN="$token"

echo "=== arielglow.com ==="
( cd "/Users/ansel/Projects/daughter-Ariel-website" && bash scripts/harden-security.sh )

echo "=== anselbi.com ==="
( cd "$ROOT" && bash scripts/harden-security.sh )

echo "Done. Re-check Security Insights in Cloudflare after a few hours."
