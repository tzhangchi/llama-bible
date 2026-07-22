# LlamaGen maintenance playbooks

Use these playbooks after selecting the owning repositories from `workspace-map.md`.

## Cross-repository API or proxy contract

1. Identify the data and authorization source of truth before editing consumers.
2. Search both `backend.llamagen.ai` and `llamagen.ai` when the API exists in both checkouts; determine which one deploys the route in scope.
3. Change the authoritative API, schema, serialization, and focused tests first.
4. Update specialized frontends (`workflow.llamagen.ai`, `context_base`, `story.llamagen.ai`, or `oss.llamagen.ai`) without introducing a duplicate proxy route.
5. Keep integrated browser calls relative when the main site is intended to intercept `/api/**`.
6. Test success, validation, authorization, missing resources, stale/duplicate requests, and backwards-compatible history or persisted data.
7. Record deployment order when producer and consumer cannot ship atomically.

For Workflow chatbot changes, preserve structured `meta.operation` as the executable truth; natural-language message text is presentation, not the protocol. Require user confirmation before a proposed operation mutates the canvas.

## Public page, SEO, localization, or redirect

1. Find the source representation: page-config JSON, locale data, content archive, route manifest, or component.
2. Avoid hand-editing generated maps or bundles when an existing generator owns them.
3. Keep metadata, canonical URL, hreflang, JSON-LD, breadcrumbs, internal links, sitemap entries, and redirects consistent.
4. Preserve all supported locales. Verify missing-key and long-text behavior, not just English.
5. Use owned CDN URLs for production assets; do not leave temporary local images or third-party hotlinks in page configs.
6. Run representative page tests, redirect tests, and one browser smoke check through the real integrated route.
7. Treat CDN uploads, cache purges, IndexNow submissions, and deployment as separate explicit actions.

Typical checks:

- `context_base`: `npm run test-pages`, targeted Jest, `npm run e2e-test:smoke:development`.
- `llamagen.ai` or `backend.llamagen.ai`: targeted public-page Jest tests.
- `help.llamagen.ai`: `npm run build:local` plus localized content inspection.

## Generation provider, model, reference image, or comic layout

1. Trace the request from UI/model selection through the selected API checkout to `generate-server` and back.
2. Write down the contract: model identifier, prompt fields, reference-image limits/order, aspect ratio, panel count/layout, crop behavior, retry/fallback policy, credits, and analytics.
3. Reuse provider adapters and existing layout definitions. Avoid provider-specific branching in generic callers when the adapter can own it.
4. Validate blank, partial, malformed, and multi-image outputs; make continuity and remaining-panel behavior explicit.
5. Update UI capabilities and error copy only after backend support is confirmed.
6. Test a focused fixture/unit path first, then a live provider call only when the user authorizes cost and external effects.

## Editor persistence, undo/redo, project versions, or export

1. Identify the canonical document state, derived canvas state, persistence format, and asset ownership.
2. Test create/edit/delete, undo/redo, autosave debounce, reload recovery, stale-version conflicts, and clear/reset behavior.
3. Preserve stable object IDs and links across serialization.
4. Check large assets, `data:` URLs, remote URLs, failed uploads, and partial project data.
5. Verify keyboard and touch input plus mobile layouts.
6. For `manga.llamagen.ai`, test `file://` and update the relevant `llm_doc/` reference.

## Admin, marketing, email, flags, billing, or cron

1. Keep the operator UI in `oss.llamagen.ai`; place the authenticated API and database change in the authoritative main/API checkout.
2. Require manual search or an explicit action before expensive or sensitive queries where the existing UI follows that pattern.
3. Make job handlers idempotent and protect against duplicate sends or overlapping schedules.
4. Test authorization, dry-run/manual-test modes, empty data, pagination, time zones, and retry behavior.
5. Never execute a real send, cron, billing mutation, production query, or migration unless explicitly requested.
6. Redact user data, tokens, email content, and production response bodies from logs and handoff notes.

## Shared-code drift between sibling checkouts

1. Compare remotes, branches, recent commits, and the exact files before assuming one repository was copied from another.
2. Identify the source repository and the intended sync mechanism or script.
3. Port only the requested behavior and preserve repository-specific framework, build, routing, and deployment differences.
4. Review the resulting diff in each repository separately.
5. Do not mass-copy lockfiles, generated files, environment files, Prisma migrations, or deployment configuration.

## Primary Prisma schema change

Read [local-development.md](local-development.md) before changing the database contract.

1. Make models, enums, fields, relations, indexes, and mappings authoritative in `llamagen.ai/prisma/schema.prisma` only.
2. Generate and inspect the primary migration only in `llamagen.ai`; do not create competing migrations in Backend, Story, OSS, or Manga Translator.
3. Copy the complete source schema into each explicitly affected consumer after the source diff is accepted.
4. Review each consumer diff and regenerate its Prisma client using that repository's existing toolchain.
5. Run `scripts/schema-copy-status.sh`; use `--check` only when all known copies are intentionally included.
6. Treat production migration execution as a separate explicit action.

## Final review

- Run `scripts/workspace-status.sh`.
- Inspect `git -C <project> diff --check` and `git -C <project> diff --stat` for every modified child repository.
- Confirm no secret, generated cache, report, credential, or environment file was added.
- Report the exact repositories changed and the exact checks run.
