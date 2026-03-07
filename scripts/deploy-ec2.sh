#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/shopsmart}"
BRANCH="${BRANCH:-main}"
WEB_ROOT="${WEB_ROOT:-/var/www/html}"
REPO_URL="${REPO_URL:-https://github.com/${GITHUB_REPOSITORY}.git}"

mkdir -p "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

npm ci --prefix server
npm ci --prefix client

npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

if pm2 describe shopsmart-server >/dev/null 2>&1; then
  pm2 restart shopsmart-server --update-env
else
  pm2 start server/src/index.js --name shopsmart-server
fi

npm run build --prefix client

sudo mkdir -p "$WEB_ROOT"
if command -v rsync >/dev/null 2>&1; then
  sudo rsync -a --delete "$APP_DIR/client/dist/" "$WEB_ROOT/"
else
  sudo cp -r "$APP_DIR/client/dist/." "$WEB_ROOT/"
fi

pm2 save
