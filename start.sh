#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to launch the local module server."
  exit 1
fi

node server.mjs
