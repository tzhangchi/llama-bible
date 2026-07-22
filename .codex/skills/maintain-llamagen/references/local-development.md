# LlamaGen local integration and database schema

Use this reference for multi-project local development, `llamagen.ai/next.config.js` rewrites, origin environment variables, ports, and Prisma schema synchronization.

## Contents

- [Source of truth](#source-of-truth)
- [Recommended startup model](#recommended-startup-model)
- [Rewrite phases matter](#rewrite-phases-matter)
- [Current integration topology](#current-integration-topology)
- [Local integration workflow](#local-integration-workflow)
- [Primary Prisma schema ownership](#primary-prisma-schema-ownership)

## Source of truth

- Treat `llamagen.ai/next.config.js` as the executable source of truth for routes entering through `http://localhost:3000`.
- Treat `llamagen.ai/prisma/schema.prisma` as the sole source of truth for the primary application database schema.
- Re-read the current files before acting. This reference summarizes them but must not override newer executable configuration.
- Keep browser requests relative when the page is opened through the main site. The main site must decide whether `/api/**` stays local or is proxied.

## Recommended startup model

Start only the downstream services needed for the task, then start `llamagen.ai` last. Open the integrated feature through `http://localhost:3000`, not through the downstream service port, unless isolating that service is the explicit goal. The commands below name the package scripts; invoke them through the package manager and lockfile already used by each repository.

| Project | Default local port | Start command | Main-site origin setting |
| --- | ---: | --- | --- |
| `llamagen.ai` | 3000 | `npm run dev` | Integration entry point |
| `backend.llamagen.ai` | 3001 | `npm run dev` | `BACKEND_LOCAL_ORIGIN`; legacy fallback `NOW_API_LOCAL_ORIGIN` |
| `context_base` | 3005 | `npm run dev` | `CONTEXT_BASE_ORIGIN`; legacy fallback `CONTEXT_BASE_DEV_ORIGIN` |
| `oss.llamagen.ai` | 4000 | `npm run dev` | `OSS_LOCAL_ORIGIN`; `ADMIN_SERVICE_URL` overrides it |
| `workflow.llamagen.ai` | 5001 | `npm run dev` | `WORKFLOW_LOCAL_ORIGIN` |
| `manga-translator` | 5002 | `npm run dev` | `TRANSLATE_LOCAL_ORIGIN` |
| `story.llamagen.ai` | 9000 | `npm run dev:story-proxy` for integrated work; otherwise `npm run dev` | `STORY_LOCAL_ORIGIN`; `STORY_SERVICE_URL` overrides valid non-main origins |
| `manga.llamagen.ai` | 8000 | `npm run dev` | `MANGA_DEV_ORIGIN` |

`draw` is not locally wired into the main site at present. The development rewrites still send `/draw` to `https://draw.llamagen.ai`; starting `draw` alone does not make `localhost:3000/draw` use it.

Set only the non-secret origins needed by the task in `llamagen.ai/.env.local`. Do not commit this file. A full local topology uses:

```dotenv
BACKEND_LOCAL_ORIGIN=http://localhost:3001
CONTEXT_BASE_ORIGIN=http://localhost:3005
OSS_LOCAL_ORIGIN=http://localhost:4000
WORKFLOW_LOCAL_ORIGIN=http://localhost:5001
TRANSLATE_LOCAL_ORIGIN=http://localhost:5002
STORY_LOCAL_ORIGIN=http://localhost:9000
MANGA_DEV_ORIGIN=http://localhost:8000
```

`context_base` is the important exception to the development defaults: without a local context origin, the main site falls back to `https://contextbase-cloudflare.llamagen.ai` even when `NODE_ENV=development`.

## Rewrite phases matter

`llamagen.ai/next.config.js` returns three rewrite phases:

- `beforeFiles`: evaluated before the main site's filesystem routes. Story routes and selected backend API families are deliberately forced to downstream services.
- `afterFiles`: evaluated after the main site's filesystem routes. A matching main-site page or API wins before OSS, Translate, Workflow, Manga, or most Context Base fallback rewrites.
- `fallback`: unresolved page-like paths end at `/api/lightweight-404`.

Do not infer ownership only from a matching rewrite string. Check the phase, route order, and whether `llamagen.ai` already has a matching filesystem route.

## Current integration topology

### Backend API checkout

In development, `BACKEND_LOCAL_ORIGIN` wins, then `NOW_API_LOCAL_ORIGIN`, then `http://localhost:3001`.

After the earlier Story and forbidden-route exceptions have been evaluated, the main site sends these `beforeFiles` families to `backend.llamagen.ai`:

- `/api/now/**`
- `/api/email-job/**`
- `/api/email-marketing/**`
- `/api/uploads/**`
- `/api/files/**`
- `/api/teams/**`
- `/api/free/**`
- most `/api/v1/**` routes; Story-owned API families and `/api/v1/courses` are handled earlier

It also has `afterFiles` compatibility routes for `/v1/comics/**` and `/v1/artworks/**`.

These rewrites describe runtime routing. They do not make `backend.llamagen.ai` authoritative for the primary Prisma schema; its `prisma/schema.prisma` is a consumer copy.

### Context Base

Set `CONTEXT_BASE_ORIGIN=http://localhost:3005`, start `context_base`, then start the main site. Access routes from port 3000.

Context Base receives migrated or public/SEO route families declared in the main config, including representative routes such as:

- `/oc-maker/**`, `/blogs/**`, `/releases/**`, `/tools/**`;
- `/templates/**`, `/p/templates/**`, `/articles/**`;
- `/webtoon/**`, `/webtoons/**`, `/vs/**`, `/alternatives/**`;
- `/screenplay-editor/**`, `/childrens-books/**`;
- selected `/features/**`, image tools, marketing tools, and their localized variants.

The exact allowlist is intentionally maintained in `llamagen.ai/next.config.js`. Do not copy the full route regex into another frontend. Browser calls from proxied Context Base pages must stay relative so main-site APIs remain reachable.

### Workflow

In development, only `/workflows/:slug` and deeper slug routes are proxied to `workflow.llamagen.ai` on port 5001. The root `/workflows` list remains a main-site route.

Workflow is the editor frontend. Its server-side calls default back to the main site through `WORKFLOW_BACKEND_ORIGIN` (currently a local port-3000 default in Workflow code), and browser calls should remain relative. Keep project, permission, session, message, operation, feedback, billing, and profile truth in `llamagen.ai`.

### Story

Story routes are `beforeFiles` rewrites and therefore take precedence over similarly shaped main-site filesystem routes:

- `/story` and `/story/**` go to the Story app on port 9000.
- `/api/story/**` and selected `/api/v1/story|organizations|users|invitations.../**` go to Story's `/story/api/**` routes.

For full integration, use `npm run dev:story-proxy` in Story. It keeps Story-owned API routes local and proxies non-Story API calls back to `http://localhost:3000`. Start the main site as well and browse through `http://localhost:3000/story`.

### OSS admin

The main site proxies `/oss/**`, OSS assets, and OSS-scoped API routes to port 4000 through `afterFiles`. Because these are `afterFiles` rewrites, an existing `llamagen.ai` route is checked first. `/api/admin/**` is a fallback proxy route, not proof that all admin APIs belong in OSS.

Keep admin presentation in `oss.llamagen.ai`. Keep shared authenticated backend and database truth in `llamagen.ai` unless the actual matching route and local project guidance establish a narrower OSS-owned exception.

### Manga Translator

The main site sends `/translate`, `/translate/**`, localized Translate routes, and `/api/translate/**` to port 5002 through `afterFiles`. Start `manga-translator` first, keep its development asset origin on port 5002, then browse through `http://localhost:3000/translate`.

### Manga Editor

In development, `/:locale?/new/manga/:path*` is sent to the static Manga Editor server on port 8000. Start `manga.llamagen.ai` with `npm run dev`; preserve its `file://` support when changing the editor itself.

### External services

MCP and CMS rewrites still use remote service URLs unless their explicit service variables are changed. `/draw` also remains remote. Do not describe these routes as locally integrated merely because the main site rewrites them.

## Local integration workflow

1. Identify the browser route and find its exact rewrite in `llamagen.ai/next.config.js`.
2. Check whether it is in `beforeFiles` or `afterFiles`.
3. Start the owning downstream service with the port above.
4. Set the corresponding non-secret origin in `llamagen.ai/.env.local` when the default is insufficient.
5. Start `llamagen.ai` on port 3000.
6. Open the route on port 3000 and confirm page assets, relative API calls, cookies, authentication, and error responses.
7. If the request hits the wrong service, inspect the origin printed by main-site startup and confirm the actual listener before changing application code.

When ports are occupied, do not let a framework silently choose a new port and assume the proxy followed it. Restart on the documented port or update the matching origin explicitly.

## Primary Prisma schema ownership

The only place where primary application models, enums, fields, relations, indexes, or mappings may originate is:

```text
llamagen.ai/prisma/schema.prisma
```

Known consumer copies include:

```text
backend.llamagen.ai/prisma/schema.prisma
story.llamagen.ai/prisma/schema.prisma
oss.llamagen.ai/prisma/schema.prisma
manga-translator/prisma/schema.prisma
```

Apply this workflow:

1. Make and review the schema design change only in `llamagen.ai/prisma/schema.prisma`.
2. Generate and inspect the corresponding migration only in `llamagen.ai`. Never create an independent migration for the same primary database from a consumer repository.
3. After the source change is accepted, copy the complete source file into each explicitly affected consumer; do not manually retype or merge individual models into a copy.
4. Review each consumer diff separately, then run that repository's existing Prisma client generation and targeted checks.
5. Run `scripts/schema-copy-status.sh`. Use `scripts/schema-copy-status.sh --check` only when all known consumers are intentionally in the synchronization scope.
6. Deploy or apply a production migration only when the user explicitly requests that external effect.

Example copy and comparison from the umbrella root:

```bash
cp llamagen.ai/prisma/schema.prisma <consumer>/prisma/schema.prisma
cmp -s llamagen.ai/prisma/schema.prisma <consumer>/prisma/schema.prisma
git -C <consumer> diff -- prisma/schema.prisma
```

If a consumer contains a model that the source does not, treat that as schema drift. Reconcile the intended model into the authoritative source first; do not preserve a second schema authority by editing the copy.

The marketing database uses a distinct schema file. Its changes must likewise originate in `llamagen.ai/prisma/marketing/schema.prisma`, never in a consumer copy. Do not copy the primary schema over a marketing schema.
