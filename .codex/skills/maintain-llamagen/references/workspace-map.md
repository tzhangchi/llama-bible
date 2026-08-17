# LlamaGen workspace map

Snapshot: 2026-07-21. Refresh facts with each repository's current files and `git log`; do not treat branches, framework versions, or recent themes as permanent.

## Workspace shape

The umbrella root is a small Git repository that tracks shared guidance while ignoring product directories. Most listed projects are independent Git repositories with their own remotes and histories. `waiting-animation` is currently a local ignored directory without its own `.git`; `heyform` and `llama-canvas.llamagen.ai` are absent.

Use `../scripts/workspace-status.sh` for a current snapshot.

## Local integration and database authority

- Use [local-development.md](local-development.md) for the current `llamagen.ai/next.config.js` rewrite topology, origin variables, startup order, route families, and troubleshooting.
- Enter integrated routes through `llamagen.ai` on port 3000. Start only the required downstream services first and keep browser API requests relative.
- The primary Prisma schema authority is always `llamagen.ai/prisma/schema.prisma`. Same-named schemas in Backend, Story, OSS, and Manga Translator are consumer copies, even when their current contents have drifted.
- Generate the primary migration history only in `llamagen.ai`; copy the complete schema into affected consumers and regenerate their clients there.

## Project ownership and maintenance history

### `backend.llamagen.ai`

- Remote: `aregrid/backend.llamagen.ai`, branch observed: `master`.
- Stack: Next.js 14, React 18, Prisma, Jest; local port 3001.
- Owns an API-oriented checkout with public/generation endpoints, file management, OpenAPI, and marketing jobs. Its primary `prisma/schema.prisma` is copied from `llamagen.ai` and is not authoritative.
- Recent maintenance themes: unknown-API alert filtering, duplicate marketing-email prevention, comic reference-image support, batch file deletion, folder/label file management, and OpenAPI v1 exposure.
- Verify with targeted Jest tests. A full build can trigger `postbuild` upload behavior, so do not use it casually.

### `context_base`

- Remote: `aregrid/context_base`, branch observed: `master`.
- Stack: Vinext/Vite plus Next compatibility, React 19, Cloudflare Workers, Jest, Playwright; local port 3005.
- Owns OC Maker and public-page rendering, page-config JSON, SEO/i18n, redirects, cache keys, route manifests, and CDN-backed assets.
- Main-site integration: access `/oc-maker/**` through `llamagen.ai` on port 3000; keep browser API requests relative.
- Recent maintenance themes: JSON-LD/metadata, comparison pages, AI photo utilities, edge redirects, worker-bundled configs, page health tests, and marketing reports.
- Prefer `npm run test-pages`, `npm run test:unit`, targeted Jest, and development smoke tests. Use upload/purge commands only when explicitly requested.

### `draw`

- Remote: `aregrid/draw`, branch observed: `master`.
- Stack: Next.js 14 canvas application, Jest, Playwright.
- Owns drawing/canvas interactions, shortcuts, history persistence, export, and saved character-image flows.
- Recent maintenance themes: drawing history save/load/delete/clear, delete-key behavior, mobile clipboard/export handling, and removal of obsolete bundles.
- Verify targeted state/history tests plus keyboard, touch, reload, and export behavior. `build` uploads CDN assets; prefer targeted tests or `build:local`.

### `generate-server`

- Remote: `aregrid/generate-server`, branch observed: `main`.
- Stack: TypeScript, Trigger.dev, Jest, standalone HTTP server.
- Owns generation orchestration and provider-specific request/response handling.
- Recent maintenance themes: webtoon panel layouts, Gemini direct comic generation, whole-page video comics, crop/upscale rules, reference-image limits, aspect-ratio guides, and analytics DB resolution.
- Verify with `npm test` and focused provider/layout fixtures. Check blank and partial outputs, retries, dimensions, panel counts, and downstream payload compatibility.

### `help.llamagen.ai`

- Remote: `aregrid/help.llamagen.ai`, branch observed: `main`.
- Stack: Next.js/Fumadocs, MDX content, localized FAQ sets.
- Owns the support/help site, documentation content, language variants, and customer-help integrations.
- Recent maintenance themes: FAQ expansion and translation, locale synchronization, AHA SDK bootstrapping, responsive language selection, and mobile chat behavior.
- Use `npm run dev` and `npm run build:local`. The normal build uploads assets.

### `heyform`

- The directory is absent in this workspace snapshot.
- Do not create a replacement or assume the similarly named import scripts in other projects are the source repository. Ask for the checkout location when a task targets it.

### `llama-canvas.llamagen.ai`

- The directory is absent in this workspace snapshot.
- Do not conflate it with `draw`, the Workflow canvas, or Manga Editor without explicit evidence.

### `llamagen-cli`

- Remote: `aregrid/llamagen-cli`, branch observed: `main`.
- Stack: TypeScript/Node CLI with Vitest.
- Owns single-turn and interactive chat commands, standalone agent runs, scenario suites, regression batches, quality scoring, and local report viewing.
- Recent maintenance themes: runtime config without environment variables, modular chatbot runners, 12-turn simulations, batch quality reports, and a standalone chat agent.
- Run `npm test`; consult the README before live-backend scenarios because some commands make real service calls.

### `llamagen.ai`

- Remote: `tzhangchi/llamagen.ai`, branch observed: `master`.
- Stack: Next.js 14, React 18, Prisma, Jest, Playwright; main local port 3000.
- Owns the principal product checkout and integration surface, including shared APIs and the backends consumed by Workflow/Story proxies.
- Owns the authoritative primary database schema at `prisma/schema.prisma` and the authoritative marketing schema at `prisma/marketing/schema.prisma`.
- Recent maintenance themes: Storyboard/outfit/character asset workflows, model-tier selection, GPT Image support, iOS receipts/privacy manifests, security path guards, SEO recovery, editorial content, and workflow chatbot persistence.
- Use targeted Jest/Playwright checks. Treat schema changes, migrations, provider activation, emails, and CDN scripts as explicit-effect operations.

### `manga-translator`

- Remote: `aregrid/translate.llamagen.ai`, branch observed: `main`.
- Stack: Next.js 16, React 19, Prisma, Node test runner; local port 5002.
- Owns `/translate` routes, image projects, OCR/manual editing, translation, cleaned-page typesetting, batch export, R2/CDN uploads, and structured API errors.
- Its primary `prisma/schema.prisma` is a consumer copy from `llamagen.ai`; do not originate schema changes or migrations here.
- Recent maintenance themes: route namespace/proxy fixes, production asset prefixes, R2 endpoint normalization, Vertex permission errors, typeset endpoints, multipart parameters, and ZIP export.
- Run `npm test`, `npm run lint`, and `npm run build:local`; normal `build` uploads CDN assets.

### `manga.llamagen.ai`

- Remote: `aregrid/manga.llamagen.ai`, branch observed: `master`.
- Stack: browser-first JavaScript application with Python local server, Node tests, ESLint, Prettier, and a bundled production entry.
- Owns Manga Editor canvas/layers, prompt composer, AI provider adapters, local persistence, project versions, and browser/file operation.
- Recent maintenance themes: prompt attachments/mentions, touch caching, notification rules, auto-save tracing, project version rollback, and rich prompt references.
- Its own `AGENTS.md` is authoritative: preserve `file://`, flexible layouts, consistent copy, no misleading fallback, and update relevant `llm_doc/` documentation.
- Run `npm run test:pages`, `npm run lint`, and `npm run format:check` as relevant.

### `oss.llamagen.ai`

- Remote: `aregrid/oss.llamagen.ai`, branch observed: `master`.
- Stack: Next.js 16, React 19, Prisma, Jest, Playwright; local port 4000.
- Owns admin/operations UI and internal tools: reports, feedback, flags, billing analytics, emails, SDKs, and prototypes.
- Its primary `prisma/schema.prisma` is a consumer copy from `llamagen.ai`; keep database schema design and migration history in the main checkout.
- Recent maintenance themes: feedback summary email/cron diagnostics, cancellation metrics, Redis flag editing, manual-search gating, Node upgrades, and internal SDK/extension work.
- Keep admin APIs and database truth in the selected main/API checkout. Verify UI here and API authorization/idempotency there.

### `story.llamagen.ai`

- Remote: `aregrid/story.llamagen.ai`, branch observed: `master`.
- Stack: Next.js 14, React 18, Prisma client, Jest, Playwright; local port 9000.
- Owns the Story workspace and Story-specific UI, collaboration, prompts, organizations, and route behavior.
- Its primary `prisma/schema.prisma` is a consumer copy from `llamagen.ai`; local package scripts already forbid database migrations here.
- Recent maintenance themes: collaborative editing and undo/redo, visual-scene briefs, wordless image prompt constraints, organization invitations, and Cloudflare location headers.
- Use `npm run build:local` rather than upload builds. Its package scripts deliberately forbid local database migrations; change schema/API in the authoritative main/API checkout.

### `velika`

- Remote: `aregrid/velika`, branch observed: `master`; read-only upstream source: `KDE/krita` `master` snapshot `40ca754a8c9a384f2f65ed18e88553bb0986a571`.
- Stack: KDE/Krita C++17 desktop application using Qt and KDE Frameworks; GPL-licensed.
- Owns the Velika professional painting desktop client, `.velika` project/context format, native Story Docker, and future LlamaGen Context/Memory integration.
- During v0.1, preserve Krita's paint engine, image pipeline, canvas, layer, color, PSD/KRA and animation foundations. New domain code belongs in `libs/velika`; new desktop UI belongs in `plugins/dockers/velika`.
- `.vlk` is the visual source of truth, while `.kra` remains a legacy interchange format. `.velika` stores versioned story, character, scene, memory and style context and must never contain credentials.
- Verify focused CMake targets `velikaproject` and `kritavelikastorydocker`, then `ctest -R VelikaProjectTest`. Full configuration requires the same Qt/KDE prerequisites as Krita.
- Respect Krita's upstream AI moratorium: never submit AI-assisted Velika work to KDE/Krita. Treat packaging, signing, update feeds and live cloud calls as separate explicit effects.

### `waiting-animation`

- Local ignored Next.js 16/React 19 prototype with a pnpm lockfile and no independent Git repository.
- Owns waiting/loading animation components only unless the user expands its scope.
- Run `pnpm lint` and `pnpm build`; explicitly state that changes are not captured by an independent child Git history.

### `workflow.llamagen.ai`

- Remote: `aregrid/workflow.llamagen.ai`, branch observed: `master`.
- Stack: Next.js 16, React 19, Drizzle, Jest; local port 5001.
- Owns Workflow editor UI, templates, project screens, sharing UI, chatbot presentation, and Chat-to-Canvas application events.
- The main/API checkout owns workflow permissions and session/message/operation persistence. Keep integrated browser requests relative and do not add duplicate frontend proxy APIs.
- Recent maintenance themes: private submodule preparation, template pipelines, chatbot operations and quality evals, project versioning, and storyboard timeline/editor UI.
- Read its full `AGENTS.md`. Run `npm run test:jest`, `npm run test:templates`, `npm run llamagen:source:check`, and targeted UI checks.

## Shared risk areas

- Several repositories carry copied Next.js/Prisma structures. Similar paths do not prove shared ownership.
- Some `build` scripts upload CDN assets through `postbuild`; choose `build:local` or targeted checks when available.
- Some live evaluation, email, marketing, provider, migration, sync, and purge scripts can mutate external systems. Inspect the script and require explicit authorization before running it.
- Absolute paths in older guidance predate this umbrella layout. Resolve them against the current workspace and verify the file exists.
