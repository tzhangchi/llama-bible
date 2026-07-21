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
| `backend.llamagen.ai` | API-oriented Next.js checkout: generation/public APIs, files, marketing jobs, OpenAPI, Prisma | `npm run dev` (`:3001`), targeted Jest tests |
| `context_base` | Cloudflare/Vinext public pages, OC Maker, SEO, localization, redirects, page configs, CDN-backed content | `npm run dev` (`:3005`), `npm run test-pages`, `npm run test:unit` |
| `draw` | LlamaGen Draw canvas, shortcuts, save/history, export, character-image flows | `npm run dev`, targeted Jest/Playwright checks |
| `generate-server` | Trigger.dev generation orchestration, model/provider behavior, comic crops/layouts, HTTP generation server | `npm test`, `npm run dev`, `npm start` |
| `help.llamagen.ai` | Fumadocs support site, FAQ content, localization, help integrations | `npm run dev`, `npm run build:local` |
| `heyform` | Not present in this workspace snapshot | Locate the checkout or ask before creating it |
| `llama-canvas.llamagen.ai` | Not present in this workspace snapshot | Locate the checkout or ask before creating it |
| `llamagen-cli` | Chat-agent CLI, scenario simulation, regression evaluation, quality reports | `npm test`; read its README for command modes |
| `llamagen.ai` | Main product checkout and principal integration surface: product UI, shared API routes, workflow/story proxies, billing and Prisma | `npm run dev` (`:3000`), targeted Jest/Playwright checks |
| `manga-translator` | `/translate` application: OCR/translation/typesetting, image projects, export, R2/CDN integration | `npm run dev` (`:5002`), `npm test`, `npm run lint`, `npm run build:local` |
| `manga.llamagen.ai` | Browser-first Manga Editor: canvas/layers, prompt composer, AI providers, persistence/version history | `npm run dev`, `npm run test:pages`, `npm run format:check` |
| `oss.llamagen.ai` | Admin/operations UI, reporting, feedback, flags, billing analytics, internal SDK tooling | `npm run dev` (`:4000`), targeted Jest/Playwright checks |
| `story.llamagen.ai` | Story workspace, collaborative editing, image/story prompts, organization flows | `npm run dev` (`:9000`), `npm run build:local`, targeted tests |
| `waiting-animation` | Small Next.js waiting-animation prototype; no independent `.git` directory | `pnpm dev`, `pnpm lint`, `pnpm build` |
| `workflow.llamagen.ai` | Workflow editor frontend, templates, chatbot UI, canvas operations, sharing UI | `npm run dev` (`:5001`), `npm run test:jest`, `npm run test:templates` |

Read `.codex/skills/maintain-llamagen/references/workspace-map.md` for detailed ownership, recent maintenance themes, and repository-specific validation.

## Cross-project boundaries

### Main site and specialized frontends

- The main site at `llamagen.ai` runs locally on port 3000 and proxies selected product routes to specialized frontends.
- `context_base` owns OC Maker/public-page rendering on port 3005. Access it through the main-site route when testing integrated behavior, and keep browser API requests relative so the main site serves the real APIs.
- `workflow.llamagen.ai` owns workflow UI on port 5001. Workflow session/message/operation persistence, permissions, feedback, and backend API truth live in the main/API checkout, not in duplicated frontend proxy routes.
- `story.llamagen.ai` owns the Story UI on port 9000. Respect its explicit database-change restrictions and use the main/API checkout for backend schema or API work.

### Overlapping API checkouts

- `backend.llamagen.ai` and `llamagen.ai` both contain overlapping Next.js API and Prisma trees but have different remotes and histories.
- Determine the deployment/source-of-truth repository from the task, current routing, local instructions, and recent commits before editing. Do not mirror a change between them automatically.
- If ownership remains ambiguous, present the concrete duplicate paths and ask which deployment target is authoritative before making schema migrations or broad API changes.

### Admin and operations

- Keep admin pages and dashboards in `oss.llamagen.ai`.
- Keep public/admin APIs and marketing-schema migrations in the selected main/API checkout. Do not create a second API merely to make local admin development easier.
- Use relative `/api/**` requests through the integrated development proxy unless a repository's local instructions explicitly require an isolated origin.

### Generation and creative tools

- Treat provider selection, request shaping, comic layout/cropping, reference-image limits, and remaining-panel semantics as cross-layer contracts. Check `generate-server`, the selected API checkout, and the calling UI before declaring the change complete.
- For editor persistence, version history, undo/redo, autosave, or export changes, test reload/recovery as well as the immediate UI action.
- `manga.llamagen.ai` must continue to support `file://`; follow its own `AGENTS.md` and update the relevant `llm_doc/` file when behavior changes.

## Common verification rules

- Public page/SEO work: verify metadata, canonical/hreflang, JSON-LD, sitemap/route manifests, redirects, localized content, and at least one representative route.
- API work: test success, validation failure, authorization, idempotency/duplicate protection, and structured error behavior.
- Generation work: cover blank/partial provider output, reference-image constraints, layout dimensions, retries, and analytics/credit side effects where relevant.
- UI work: verify desktop and mobile layouts, loading/empty/error states, text overflow, keyboard/touch behavior, and the existing design language.
- Data/schema work: generate and inspect migrations in the authoritative repository; never run a production migration as part of routine verification.
- Generated/CDN content: validate locally or in dry-run mode before any upload or purge command.

## Handoff

At completion, report:

- every child repository changed;
- the contract or ownership boundary affected;
- exact validation commands and results;
- generated files, migrations, uploads, or deployments intentionally not run;
- any sibling repository that still requires synchronization.
