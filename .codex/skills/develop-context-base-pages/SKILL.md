---
name: develop-context-base-pages
description: Build, extend, review, and verify production public feature and tool pages owned by the LlamaGen context_base repository, including localized routes, Worker registration, SEO, CDN-backed original media, image-generation forms, login/credit funnels, analytics tags, and responsive image presentation. Use when a request adds or changes `/features/**` or another public context_base landing page, ports a reference landing page, batches related AI photo tools, or audits whether such a page is ready to publish. Do not use for product pages owned only by llamagen.ai, OC Maker content-only updates, or deployment/CDN uploads without explicit authorization.
---

# Develop Context Base Pages

Build a complete page contract, not only a visual route. Keep rendering in `context_base`, reuse authoritative APIs from their owning repository, and verify every advertised locale and asset.

## Establish ownership

1. Read `../maintain-llamagen/SKILL.md` completely and follow its startup checks.
2. Read the nearest guidance in `context_base`, inspect its package scripts and dirty state, and preserve unrelated work.
3. Read [references/page-contract.md](references/page-contract.md) before implementing an interactive tool, localized feature route, reference-page adaptation, or media-heavy landing page.
4. Locate every producer and consumer of the page route, API payload, tags, translation bundle, asset URL, and generated result.
5. Keep public rendering, SEO, Worker routing, page configs, translations, footer links, and CDN-backed marketing content in `context_base`. Keep the existing generation or upload API in its authoritative checkout, commonly `llamagen.ai`.

## Choose the page architecture

- Extend an existing data-driven family when the new page shares its upload flow, controls, result state, and landing sections. For AI photo tools, inspect `src/lib/ai-photo-utility-configs.ts`, `src/lib/ai-photo-tool-galleries.ts`, and `src/components/pages/AiPhotoUtilityLandingPage.tsx` before creating another component.
- Create a bespoke component only when the interaction cannot be expressed coherently by the shared schema. Reuse shared auth, upgrade, translation, SEO, layout, upload, and error patterns.
- Treat a reference site as product research. Reproduce the required information architecture and capability, but write original copy and use new synthetic or properly licensed media. Never hotlink or closely reproduce its models, photos, or branded artwork.
- Define the tool contract before coding: required files and order, prompt construction, controls and defaults, aspect-ratio semantics, premium options, output, tags, error states, and success criteria.

## Implement the full contract

1. Add the localized App Router page under `src/app/[locale]/...`; keep locale static params, metadata, JSON-LD, canonical, hreflang, and translated strings on the same source of truth.
2. Register the localeless path in Worker routing, Cloudflare routes, sitemap sources, and relevant internal navigation. Confirm the shared locale-prefixed Worker patterns cover every advertised hreflang locale.
3. Call main-site APIs with relative URLs when the integrated main-site proxy owns them. Preserve the existing request field names and verify the backend accepts every new tag, file ordering rule, and aspect-ratio value.
4. Preserve source framing for editing tools. Default to `match_input_image` unless changing composition is an explicit user option. Render source, demo, and result images with their natural aspect ratio and `object-contain`; do not crop faces, garments, products, or results for card convenience.
5. Use only original synthetic or licensed production media. Upload final static assets to `https://cdn.llamagen.ai/...`; return generated assets through the product CDN such as `https://s.llamagen.ai/...`. Keep `blob:` URLs temporary and revoke them when replaced or unmounted.
6. Add feature-specific `userFile.tags` for attribution. Verify unauthenticated login with the localized callback path, paid-option gating, insufficient-credit upgrade, rate-limit handling, timeout/cancel behavior, and accessible loading/error states.
7. Keep `src/i18n/locales/**` intact. Never move, prune, delete, or temporarily hide locale resources to make a build pass. Use the repository translation/page-config pipeline and English fallback without advertising untranslated or unreachable routes.
8. Match or exceed the reference page's useful example coverage and visual quality. Optimize final images, lazy-load below-fold media, provide meaningful alt text, and verify desktop and mobile layouts.

## Verify before handoff

1. Run the read-only structural audit:

   ```bash
   bash .codex/skills/develop-context-base-pages/scripts/audit-feature-page.sh <slug> [relevant-source-file ...]
   ```

2. Run the narrowest targeted Jest test, then `npm run test-pages` or `npm run test:unit` when warranted.
3. Verify representative English and non-English routes through the integrated main-site URL. Exercise upload prerequisites, premium gates, login callback, `401`, `402`, `429`, timeout, result display, and download where test credentials and credits are authorized.
4. Validate every final static image URL with status, content type, and cache headers. Add a deterministic CDN-domain regression test for a reusable page family; do not make the normal test suite depend on live network availability.
5. Inspect desktop and 390px mobile layouts for horizontal overflow, focus visibility, 44px touch targets, long translations, and uncropped source/result images.
6. Run `git diff --check`, inspect the exact diff, and rerun the workspace status script. Confirm no locale resource, secret, build cache, provider output, or unrelated child repository was added.

## Respect external-effect boundaries

- Do not upload assets, deploy Workers, purge CDN caches, submit IndexNow, spend generation credits, push, or publish unless the user explicitly requests that action.
- When upload or deployment is authorized, perform it as a separate visible step, verify the public URL, and keep source locale directories untouched.
- Report repositories changed, ownership decisions, tests and browser checks run, skipped paid/live generation checks, and external effects intentionally not performed.
