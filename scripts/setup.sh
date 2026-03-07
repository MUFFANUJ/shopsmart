#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$ROOT_DIR/logs"
mkdir -p "$ROOT_DIR/tmp"

npm ci --prefix "$ROOT_DIR/server"
npm ci --prefix "$ROOT_DIR/client"
npm ci --prefix "$ROOT_DIR"

npm run prisma:generate --prefix "$ROOT_DIR/server"
npm run prisma:migrate --prefix "$ROOT_DIR/server"

printf 'Setup completed successfully.\n'
