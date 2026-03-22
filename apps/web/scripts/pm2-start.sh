#!/usr/bin/env bash
# PM2 entry: fail fast with a clear message if there is no production build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .next/BUILD_ID ]]; then
  echo "cipherpay-zkaudit: no production build (.next/BUILD_ID missing)." >&2
  echo "Run from repo root: cd cipherpay-zkaudit && pnpm install && pnpm build" >&2
  exit 1
fi

# Bind IPv4 loopback only (behind nginx on same host). Default Next binds :: and can
# EADDRINUSE on :::3100 while `lsof -i :3100` as a normal user shows nothing useful.
exec node ./node_modules/next/dist/bin/next start -H 127.0.0.1
