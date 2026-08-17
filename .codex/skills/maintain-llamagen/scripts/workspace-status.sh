#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
default_root="$(cd "$script_dir/../../../.." && pwd -P)"
workspace_root="${1:-$default_root}"

projects=(
  backend.llamagen.ai
  context_base
  draw
  generate-server
  help.llamagen.ai
  heyform
  llama-canvas.llamagen.ai
  llamagen-cli
  llamagen.ai
  manga-translator
  manga.llamagen.ai
  oss.llamagen.ai
  story.llamagen.ai
  velika
  waiting-animation
  workflow.llamagen.ai
)

printf 'Workspace: %s\n\n' "$workspace_root"
printf '%-27s %-10s %-24s %-8s %s\n' PROJECT STATE BRANCH DIRTY PACKAGE_MANAGER
printf '%-27s %-10s %-24s %-8s %s\n' '---------------------------' '----------' '------------------------' '--------' '---------------'

for project in "${projects[@]}"; do
  project_path="$workspace_root/$project"

  if [[ ! -d "$project_path" ]]; then
    printf '%-27s %-10s %-24s %-8s %s\n' "$project" MISSING - - -
    continue
  fi

  state=NO_GIT
  branch=-
  dirty=-

  if git -C "$project_path" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    project_top="$(git -C "$project_path" rev-parse --show-toplevel)"
    if [[ "$project_top" == "$project_path" ]]; then
      state=GIT
      dirty="$(git -C "$project_path" status --porcelain --untracked-files=normal | wc -l | tr -d ' ')"
    else
      state=PARENT_GIT
    fi
    branch="$(git -C "$project_path" branch --show-current)"
    [[ -n "$branch" ]] || branch=DETACHED
  fi

  manager=-
  if [[ -f "$project_path/package.json" ]] && command -v node >/dev/null 2>&1; then
    manager="$(node -e 'const p=require(process.argv[1]); process.stdout.write(p.packageManager || "")' "$project_path/package.json" 2>/dev/null || true)"
  fi
  if [[ -z "$manager" ]]; then
    if [[ -f "$project_path/pnpm-lock.yaml" ]]; then
      manager=pnpm
    elif [[ -f "$project_path/yarn.lock" ]]; then
      manager=yarn
    elif [[ -f "$project_path/package-lock.json" ]]; then
      manager=npm
    else
      manager=-
    fi
  fi

  printf '%-27s %-10s %-24s %-8s %s\n' "$project" "$state" "$branch" "$dirty" "$manager"
done
