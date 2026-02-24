#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist/deployapp-diagram-studio-mvp.zip"
mkdir -p "$ROOT/dist"
cd "$ROOT"
rm -f "$OUT"
zip -r "$OUT" extension -x '*.DS_Store' >/dev/null
printf 'Created %s\n' "$OUT"
