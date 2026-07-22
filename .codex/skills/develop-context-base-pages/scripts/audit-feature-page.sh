#!/usr/bin/env bash

set -u

usage() {
  cat <<'EOF'
Usage: audit-feature-page.sh <slug> [relevant-source-file ...]

Run read-only structural checks for a context_base /features/<slug> page.
Additional source files are resolved relative to context_base and scanned for
explicit production image URLs.
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

slug=${1:-}
if [[ -z "$slug" || ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  usage >&2
  exit 2
fi
shift

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
workspace_root=$(cd "$script_dir/../../../.." && pwd)
context_root=${CONTEXT_BASE_ROOT:-"$workspace_root/context_base"}
page_file="$context_root/src/app/[locale]/(public)/features/$slug/page.tsx"

failures=0
warnings=0

pass() {
  printf 'PASS  %s\n' "$1"
}

fail() {
  printf 'FAIL  %s\n' "$1" >&2
  failures=$((failures + 1))
}

warn() {
  printf 'WARN  %s\n' "$1" >&2
  warnings=$((warnings + 1))
}

require_file() {
  if [[ -f "$1" ]]; then
    pass "$2"
  else
    fail "$2 ($1)"
  fi
}

require_text() {
  local file=$1
  local pattern=$2
  local label=$3
  if [[ -f "$file" ]] && rg -q --fixed-strings "$pattern" "$file"; then
    pass "$label"
  else
    fail "$label"
  fi
}

warn_text() {
  local file=$1
  local pattern=$2
  local label=$3
  if [[ -f "$file" ]] && rg -q --fixed-strings "$pattern" "$file"; then
    pass "$label"
  else
    warn "$label"
  fi
}

if [[ ! -d "$context_root" ]]; then
  fail "context_base checkout exists ($context_root)"
  exit 1
fi

require_file "$page_file" "localized page exists"
require_text "$context_root/worker/index.ts" "\"/features/$slug\"" "Worker rewrite allowlist includes /features/$slug"
require_text "$context_root/wrangler.jsonc" "\"pattern\": \"llamagen.ai/features/$slug\"" "Cloudflare apex route exists"
require_text "$context_root/wrangler.jsonc" "\"pattern\": \"www.llamagen.ai/features/$slug\"" "Cloudflare www route exists"
require_text "$context_root/public/sitemap/context_base_sitemap.json" "\"/features/$slug\"" "sitemap contains canonical path"
require_text "$context_root/worker/index.ts" "stripLocalePrefix(pathname)" "Worker normalizes locale prefixes"
require_text "$context_root/wrangler.jsonc" '*llamagen.ai/es/features/*' "localized feature Worker patterns exist"
warn_text "$context_root/src/components/MainFooter/MainFooter.tsx" "\"/features/$slug\"" "MainFooter links the feature where appropriate"

if [[ -f "$page_file" ]]; then
  require_text "$page_file" "generateMetadata" "page defines localized metadata"
  require_text "$page_file" "generateStaticParams" "page generates locale params"
  require_text "$page_file" "locale" "page consumes locale"
fi

asset_files=("$page_file")
for relative_file in "$@"; do
  candidate="$context_root/$relative_file"
  if [[ -f "$candidate" ]]; then
    asset_files+=("$candidate")
  else
    fail "additional source file exists ($relative_file)"
  fi
done

bad_image_urls=""
for asset_file in "${asset_files[@]}"; do
  [[ -f "$asset_file" ]] || continue
  matches=$(rg -o 'https?://[^[:space:]"'"'"'`)]+\.(avif|gif|jpeg|jpg|png|webp)' "$asset_file" 2>/dev/null || true)
  while IFS= read -r image_url; do
    [[ -n "$image_url" ]] || continue
    if [[ "$image_url" != https://cdn.llamagen.ai/* ]]; then
      bad_image_urls+="$asset_file: $image_url"$'\n'
    fi
  done <<< "$matches"
done

if [[ -n "$bad_image_urls" ]]; then
  fail "all explicit static image URLs use https://cdn.llamagen.ai/"
  printf '%s' "$bad_image_urls" >&2
else
  pass "all explicit static image URLs in audited sources use the owned CDN"
fi

printf '\nSummary: %d failure(s), %d warning(s)\n' "$failures" "$warnings"
if (( failures > 0 )); then
  exit 1
fi
