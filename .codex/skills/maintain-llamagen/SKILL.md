---
name: maintain-llamagen
description: Route, implement, debug, review, and verify maintenance across the LlamaGen umbrella workspace and its independent repositories. Use when a task mentions backend.llamagen.ai, context_base, draw, generate-server, help.llamagen.ai, heyform, llama-canvas.llamagen.ai, llamagen-cli, llamagen.ai, manga-translator, manga.llamagen.ai, oss.llamagen.ai, story.llamagen.ai, waiting-animation, or workflow.llamagen.ai; also use for cross-repository API/proxy contracts, generation providers, public pages, SEO, localization, CDN assets, admin operations, editor persistence, or workspace-wide status checks. Do not use for unrelated repositories.
---

# Maintain LlamaGen

Maintain the umbrella workspace without confusing its independently versioned projects or triggering production side effects.

## Start every task

1. Locate the umbrella root. Prefer `/Users/terry/code/llamagen` when it exists; otherwise derive it from this skill's real path.
2. Read `.codex/AGENTS.md`.
3. Read [references/workspace-map.md](references/workspace-map.md) before selecting repositories.
4. Run `scripts/workspace-status.sh` to see missing projects, branches, dirty files, and package managers.
5. Map the request to one or more owning repositories. If a path is absent or ownership is ambiguous, stop before creating a new checkout or duplicating an API.

## Inspect the selected repositories

For every selected project:

1. Run `git -C <project> status --short` and preserve unrelated work.
2. Read the nearest `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, or `.CLAUDE.md` completely.
3. Inspect `package.json`, the active lockfile, relevant source files, tests, and recent commits.
4. Search for all producers and consumers of any changed API field, event, route, persisted shape, generated file, or asset URL.

Treat `backend.llamagen.ai` and `llamagen.ai` as overlapping but distinct checkouts. Establish the authoritative deployment target before changing shared APIs or Prisma schemas.

## Choose the playbook

Read [references/playbooks.md](references/playbooks.md) when the request involves any of these recurring lanes:

- cross-repository API or proxy contracts;
- public pages, SEO, localization, redirects, or CDN content;
- generation providers, comic layouts, reference images, or model UI;
- editor autosave, undo/redo, version history, export, or recovery;
- admin dashboards, marketing jobs, email, flags, billing, or migrations;
- shared code drift between similar LlamaGen checkouts.

## Implement safely

- Make the smallest coherent change in the owning repository first.
- Update consumers in the same task when a contract changes; otherwise record the exact follow-up.
- Reuse existing scripts, schemas, page-config sources, and generated-file pipelines instead of hand-editing generated outputs.
- Keep API calls relative when traffic is intentionally routed through the main-site development proxy.
- Do not deploy, upload, purge CDN caches, migrate production data, send messages, run cron jobs, activate providers, or push unless explicitly requested.
- Never expose `.env*`, credential JSON, API keys, customer content, or local reports.

## Verify proportionally

1. Run the narrowest relevant test first.
2. Run the repository's existing lint, typecheck, or local build command when risk warrants it.
3. Avoid build scripts that implicitly upload assets; prefer `build:local` where provided.
4. For cross-project work, validate both sides of the contract and one integrated route or workflow.
5. Re-run `scripts/workspace-status.sh` and inspect diffs separately in every modified child repository.

## Finish

Summarize repositories changed, ownership decisions, checks run, checks skipped, and any deployment or synchronization intentionally left to the user. Update `.codex` guidance only when a durable boundary, command, or recurring maintenance pattern has genuinely changed.

Before changing `AGENTS.md`, onboarding a child project, or adding or updating a workspace skill, read `.codex/CONTRIBUTING.md` and follow its placement and validation checklist.
