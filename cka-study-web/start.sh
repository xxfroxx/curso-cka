#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

port="${1:-8000}"
url="http://127.0.0.1:${port}/cka-study-web/"

echo "Servidor local del Curso CKA"
echo "URL: ${url}"
echo
echo "Pulsa Ctrl+C para detenerlo."
echo

python3 -m http.server "${port}" --bind 127.0.0.1
