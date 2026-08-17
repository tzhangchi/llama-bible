# LlamaGen workspace guidance

## Scope and precedence

- Treat `/Users/terry/code/llamagen` as an umbrella workspace containing multiple independent Git repositories. The root repository intentionally ignores the product directories, so a clean root `git status` says nothing about child repositories.
- Before editing a child project, read its nearest `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, or `.CLAUDE.md`. More specific project instructions override this summary.
- Use the `maintain-llamagen` skill for repository routing, cross-project changes, recurring maintenance, debugging, or release-oriented verification.
- Follow `.codex/CONTRIBUTING.md` before changing this guidance, onboarding another project, or adding or updating a workspace skill.
- Use workspace-relative paths in documentation and commands. Historical instructions may still refer to `/Users/terry/code/llamagen.ai`; in this workspace the checkout is `./llamagen.ai`.

## Working agreements

1. Identify every affected repository before changing code. Run `git -C <project> status --short` in each one and preserve unrelated changes.
2. Keep commits, branches, dependency changes, and verification scoped per child repository. Do not assume the umbrella repository records child changes.
3. Inspect the target repository's `package.json`, lockfile, README, and local guidance before choosing commands. Respect its existing package manager and lockfile.
4. Prefer targeted tests first, then the smallest relevant lint, typecheck, or local build. Report checks that were skipped or unavailable.
5. Do not deploy, upload CDN assets, migrate a database, send email, run cron/manual production jobs, activate providers, or push changes unless the user explicitly requests that external effect.
6. Treat `.env*`, credential JSON files, tokens embedded in scripts, customer data, and local reports as sensitive. Never quote, commit, or copy their contents into guidance or logs.
7. When an API contract, proxy boundary, generated artifact, or shared source changes, update all affected consumers or explicitly record the remaining follow-up.
8. Avoid broad mechanical rewrites across sibling repositories. Similar-looking projects have diverged in framework version, deployment path, and runtime constraints.

## Repository map

| Project | Primary responsibility | Safe local entry points |
| --- | --- | --- |
| `backend.llamagen.ai` | API-oriented Next.js checkout: generation/public APIs, files, marketing jobs, OpenAPI, copied Prisma schema | `npm run dev` (`:3001`), targeted Jest tests |
| `context_base` | Cloudflare/Vinext public pages, OC Maker, SEO, localization, redirects, page configs, CDN-backed content | `npm run dev` (`:3005`), `npm run test-pages`, `npm run test:unit` |
| `draw` | LlamaGen Draw canvas, shortcuts, save/history, export, character-image flows | `npm run dev`, targeted Jest/Playwright checks |
| `generate-server` | Trigger.dev generation orchestration, model/provider behavior, comic crops/layouts, HTTP generation server | `npm test`, `npm run dev`, `npm start` |
| `help.llamagen.ai` | Fumadocs support site, FAQ content, localization, help integrations | `npm run dev`, `npm run build:local` |
| `heyform` | Not present in this workspace snapshot | Locate the checkout or ask before creating it |
| `llama-canvas.llamagen.ai` | Not present in this workspace snapshot | Locate the checkout or ask before creating it |
| `llamagen-cli` | Chat-agent CLI, scenario simulation, regression evaluation, quality reports | `npm test`; read its README for command modes |
| `llamagen.ai` | Main product checkout and principal integration surface: product UI, shared API routes, workflow/story proxies, billing, and authoritative Prisma schemas | `npm run dev` (`:3000`), targeted Jest/Playwright checks |
| `manga-translator` | `/translate` application: OCR/translation/typesetting, image projects, export, R2/CDN integration | `npm run dev` (`:5002`), `npm test`, `npm run lint`, `npm run build:local` |
| `manga.llamagen.ai` | Browser-first Manga Editor: canvas/layers, prompt composer, AI providers, persistence/version history | `npm run dev`, `npm run test:pages`, `npm run format:check` |
| `oss.llamagen.ai` | Admin/operations UI, reporting, feedback, flags, billing analytics, internal SDK tooling | `npm run dev` (`:4000`), targeted Jest/Playwright checks |
| `story.llamagen.ai` | Story workspace, collaborative editing, image/story prompts, organization flows | `npm run dev` (`:9000`), `npm run build:local`, targeted tests |
| `velika` | Independent GPL desktop painting client based on KDE/Krita, with Velika project/context modules and native Story Docker | Focused CMake targets `velikaproject`, `kritavelikastorydocker`; `ctest -R VelikaProjectTest` |
| `waiting-animation` | Small Next.js waiting-animation prototype; no independent `.git` directory | `pnpm dev`, `pnpm lint`, `pnpm build` |
| `workflow.llamagen.ai` | Workflow editor frontend, templates, chatbot UI, canvas operations, sharing UI | `npm run dev` (`:5001`), `npm run test:jest`, `npm run test:templates` |

Read `.codex/skills/maintain-llamagen/references/workspace-map.md` for detailed ownership, recent maintenance themes, and repository-specific validation.

## Cross-project boundaries

### Local integrated development

- Treat `llamagen.ai/next.config.js` as the executable routing map for local multi-project development. Read `.codex/skills/maintain-llamagen/references/local-development.md` before starting or debugging an integrated route.
- Start the required downstream services first, start `llamagen.ai` on port 3000 last, and access the feature through `http://localhost:3000` so rewrites, cookies, authentication, and relative `/api/**` calls follow the real integration path.
- Current default local ports are Backend 3001, Context Base 3005, OSS 4000, Workflow 5001, Manga Translator 5002, Manga Editor 8000, and Story 9000. Do not assume a silently selected replacement port updates the main-site proxy.
- Rewrite phase matters: `beforeFiles` routes bypass matching main-site filesystem routes, while `afterFiles` routes allow a matching `llamagen.ai` page or API to win first.
- `context_base` requires `CONTEXT_BASE_ORIGIN=http://localhost:3005` (or the legacy `CONTEXT_BASE_DEV_ORIGIN`) for local integration; otherwise the main site uses the remote Context Base origin even in development.
- The main site currently keeps `/draw` pointed at the remote Draw deployment; starting `draw` does not locally wire `localhost:3000/draw`.

### Main site and specialized frontends

- The main site at `llamagen.ai` runs locally on port 3000 and proxies selected product routes to specialized frontends.
- `context_base` owns OC Maker/public-page rendering on port 3005. Access it through the main-site route when testing integrated behavior, and keep browser API requests relative so the main site serves the real APIs.
- `workflow.llamagen.ai` owns workflow UI on port 5001. Workflow session/message/operation persistence, permissions, feedback, and backend API truth live in the main/API checkout, not in duplicated frontend proxy routes.
- `story.llamagen.ai` owns the Story UI on port 9000. Respect its explicit database-change restrictions and use the main/API checkout for backend schema or API work.

### Public Context Base routing

- Production traffic also passes through the Cloudflare Worker `llamagen-id-proxy`, which chooses between `global.llamagen.ai` and `contextbase-cloudflare.llamagen.ai`. Context Base route matching must run before the generic `/:locale/** -> global` fallback.
- Keep the Worker's Context Base feature allowlist synchronized with Context Base's actual feature routes, `llamagen.ai/next.config.js`, and `llamagen.ai/public/sitemap/context_base_sitemap.json`. A stale allowlist can turn an indexed localized URL such as `/:locale/features/ai-white-background` into `/api/lightweight-404` while the Context Base page itself remains healthy.
- Do not proxy every `/features/**` path to Context Base; main-owned feature pages must continue to use the global origin. Test both an allowed Context Base slug and a main-owned negative control.
- Context Base proxy requests must preserve the public host in `X-Forwarded-Host`, use `X-Forwarded-Proto: https`, and target the Context Base deployment host. Diagnose production routing with `x-llamagen-route-target`, `x-llamagen-target-host`, and `x-matched-path` before changing page code.
- Whenever a Context Base public route or proxy allowlist changes, add localized production E2E coverage (including `id`), verify representative URLs return 200 through `llamagen.ai`, and treat Worker deployment as a separate explicitly authorized action.
- Treat routing ownership as one contract rather than maintaining unrelated allowlists in the Worker, both Next.js projects, tests, and sitemap generation. Prefer deriving those consumers from one reviewed route manifest; until that exists, compare every consumer in the same change.
- Sitemap `loc` and `hreflang` targets must be direct 200 canonical pages. Do not expand locale variants for Context Base route families that intentionally redirect to an unprefixed canonical URL, and fail production checks when an indexed URL returns a redirect or 404.
- Keep the Worker's `global.llamagen.ai` target on the same intended main-site revision as the public deployment. Feature-only E2E is insufficient: include a non-feature public route and an authenticated/studio route added in the current release so an `id`-only stale-origin 404 cannot pass production checks.

### Registration reliability

- Use the same case-normalization rule when generating, storing, looking up, and verifying email tokens. Cover mixed-case non-Gmail addresses with an integration test, not only a mocked normalizer.
- Do not display an email-sent or registration-success state until the provider confirms the send request succeeded. A deliberate risk/temp-email rejection must return a handled failure instead of an ignored boolean.
- Do not mutate a shared NextAuth options object with a request-capturing callback. Build request-scoped auth options so concurrent OAuth, session, and email requests cannot use another request's CAPTCHA or callback context.

### Overlapping API checkouts

- `backend.llamagen.ai` and `llamagen.ai` both contain overlapping Next.js API and Prisma trees but have different remotes and histories.
- Determine API deployment ownership from the task, `llamagen.ai/next.config.js`, local instructions, and recent commits before editing overlapping API routes. Do not mirror API changes automatically.
- Prisma ownership is not ambiguous: primary schema changes originate only in `llamagen.ai/prisma/schema.prisma`; `backend.llamagen.ai/prisma/schema.prisma` is a consumer copy.

### Prisma schema source of truth

- The sole source of truth for the primary application database schema is `llamagen.ai/prisma/schema.prisma`. Never originate a model, enum, field, relation, index, or mapping change in another repository.
- `backend.llamagen.ai`, `story.llamagen.ai`, `oss.llamagen.ai`, and `manga-translator` consume copied `prisma/schema.prisma` files. After changing and reviewing the source, copy the complete file only to affected consumers and review each repository diff separately.
- Generate primary-schema migrations only in `llamagen.ai`. Consumer repositories may regenerate their Prisma clients from the copied schema but must not create an independent migration history for the same database.
- Treat differences in a consumer schema as drift to reconcile through the authoritative source, not as permission to maintain a fork. Use `.codex/skills/maintain-llamagen/scripts/schema-copy-status.sh` to inspect current drift.
- The marketing database has a separate authoritative file at `llamagen.ai/prisma/marketing/schema.prisma`; marketing-schema changes must also originate in `llamagen.ai`, never in consumer copies.

### Admin and operations

- Keep admin pages and dashboards in `oss.llamagen.ai`.
- Keep public/admin APIs in their verified authoritative API checkout. Keep marketing schema design and migrations only in `llamagen.ai`; do not create a second API or schema authority merely to make local admin development easier.
- Use relative `/api/**` requests through the integrated development proxy unless a repository's local instructions explicitly require an isolated origin.

### Generation and creative tools

- Treat provider selection, request shaping, comic layout/cropping, reference-image limits, and remaining-panel semantics as cross-layer contracts. Check `generate-server`, the selected API checkout, and the calling UI before declaring the change complete.
- For editor persistence, version history, undo/redo, autosave, or export changes, test reload/recovery as well as the immediate UI action.
- `manga.llamagen.ai` must continue to support `file://`; follow its own `AGENTS.md` and update the relevant `llm_doc/` file when behavior changes.

### Velika desktop fork

- `velika` is an independent GPL repository based on KDE/Krita. Its `origin` is `aregrid/velika`; KDE/Krita is a read-only `upstream` source and must never receive AI-assisted Velika changes.
- During v0.1, keep Krita's paint engine, image pipeline, canvas, layers, color management, PSD/KRA import, and animation foundations unchanged. Put new project/context code under `libs/velika` and desktop UI under `plugins/dockers/velika`.
- Keep `.vlk` authoritative for pixels and layers, with `.kra` supported as a legacy interchange format. Use the versioned `.velika` manifest for story, character, scene, memory, style, and future generation provenance.
- Treat desktop packaging, code signing, update feeds, LlamaGen authentication, and live Context API calls as explicit follow-up effects; do not infer them from a local client change.

## Common verification rules

- Public page/SEO work: verify metadata, canonical/hreflang, JSON-LD, sitemap/route manifests, redirects, localized content, and at least one representative route.
- API work: test success, validation failure, authorization, idempotency/duplicate protection, and structured error behavior.
- Generation work: cover blank/partial provider output, reference-image constraints, layout dimensions, retries, and analytics/credit side effects where relevant.
- UI work: verify desktop and mobile layouts, loading/empty/error states, text overflow, keyboard/touch behavior, and the existing design language.
- Data/schema work: change and generate primary-schema migrations only in `llamagen.ai`, synchronize complete schema copies to affected consumers, regenerate their clients, and never run a production migration as part of routine verification.
- Generated/CDN content: validate locally or in dry-run mode before any upload or purge command.

## Handoff

At completion, report:

- every child repository changed;
- the contract or ownership boundary affected;
- exact validation commands and results;
- generated files, migrations, uploads, or deployments intentionally not run;
- any sibling repository that still requires synchronization.
