#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
workspace_root="$(cd -- "$script_dir/../../../.." && pwd -P)"
source_schema="$workspace_root/llamagen.ai/prisma/schema.prisma"
mode="${1:-status}"

if [[ "$mode" != "status" && "$mode" != "--check" ]]; then
  printf 'Usage: %s [--check]\n' "$0" >&2
  exit 2
fi

if [[ ! -f "$source_schema" ]]; then
  printf 'Authoritative schema is missing: %s\n' "$source_schema" >&2
  exit 2
fi

consumers=(
  "backend.llamagen.ai/prisma/schema.prisma"
  "story.llamagen.ai/prisma/schema.prisma"
  "oss.llamagen.ai/prisma/schema.prisma"
  "manga-translator/prisma/schema.prisma"
)

printf 'Source: %s\n\n' "${source_schema#"$workspace_root/"}"
printf '%-48s %s\n' "CONSUMER" "STATE"
printf '%-48s %s\n' "------------------------------------------------" "-------"

has_drift=0
for relative_path in "${consumers[@]}"; do
  consumer_schema="$workspace_root/$relative_path"
  if [[ ! -f "$consumer_schema" ]]; then
    state="MISSING"
    has_drift=1
  elif cmp -s "$source_schema" "$consumer_schema"; then
    state="MATCH"
  else
    state="DRIFT"
    has_drift=1
  fi

  printf '%-48s %s\n' "$relative_path" "$state"
done

if [[ "$mode" == "--check" && "$has_drift" -ne 0 ]]; then
  exit 1
fi
