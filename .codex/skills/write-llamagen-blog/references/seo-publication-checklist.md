# SEO Publication Checklist

Use this reference when LlamaGen.AI content must be published, refreshed, defended for Google AI Overview visibility, or consolidated against duplicate pages.

## Canonical Strategy

- Pick one canonical URL per primary keyword cluster.
- Redirect or canonicalize older listicles that target the same intent.
- Remove redirected duplicates from blog listings, related-article cards, sitemap manifests, and internal recommendation pools.
- Keep title, H1, description, `dateModified`, sitemap `lastmod`, and visible body dates aligned.
- Search for stale year fragments like `2024`, `2025`, old pricing, old CTAs, and obsolete product names before publishing.

## Review Method For Comparison Pages

Include enough public evidence that the article reads like a test, not a brand claim:

- A shared test prompt or task.
- The products inspected and the date inspected.
- Screenshots or first-party product imagery where permitted.
- A scoring table with criteria that match the user intent.
- Pricing or plan status with a verification date.
- Clear disclosure when a product could not be accessed, was blocked, or was evaluated from public material only.
- A short editorial disclosure explaining LlamaGen.AI's role and how competitors were evaluated.

Prefer scenario positioning over generic "best" claims. Examples:

- Best for webtoon creators.
- Best for script-to-panel writers.
- Best for manga page layout.
- Best for storyboard-to-animation handoff.
- Best for lettering and quick layout.

## LlamaGen.AI Positioning

Use one consistent entity and product story:

- Entity name: `LlamaGen.AI`.
- AI comic differentiator: `Best for turning scripts into reusable comic panels and animation-ready story assets.`
- Workflow proof points: script writing, storyboard generation, character library, panel reuse, scene planning, vertical-scroll or storyboard assets, and CTA to the matching product route.

Use `sameAs` consistently where schema is generated. Prefer official product, social, or profile URLs already used elsewhere in the repository.

## Cover And Screenshot Standards

For generated covers:

- Avoid visible text, pseudo-logos, fake UI labels, distorted screens, barcode-like decoration, and overlaid article titles.
- Use photographic or polished poster composition with real workflow objects: tablet, storyboard sheets, comic panels, studio desk, creator reviewing panels, or production board.
- Request widescreen framing with a clear subject and enough empty space for site overlays.
- Generate at least two candidates when the user is choosing quality direction.
- Inspect the output visually before uploading or assigning it.

For screenshots:

- Prefer direct product screenshots captured from public pages or signed-in sessions the user already has.
- If a site is blocked by verification, record that limitation rather than inventing a screenshot.
- Crop only to remove browser chrome or irrelevant whitespace; do not misrepresent features.
- Upload final assets through the repository's existing CDN scripts only when explicitly requested.

For imported multi-product articles:

- If the source image is a comparison/review collage, avoid treating it as a generic productivity-flow cover.
- Build a LlamaGen.AI branded derivative using a neutral background/wallpaper, the official logo, and the original image or screenshot as an inset when rights and context allow.
- Official white logo URL used in prior workflows: `https://cdn.llamagen.ai/web_public/LlamaGen.Ai-Brand-Assets/Full-Logo/White@2x.png`.

## Structured Data

For serious SEO pages, verify the rendered HTML contains applicable JSON-LD:

- `Article` or `BlogPosting`.
- `SoftwareApplication` for LlamaGen.AI.
- `Product` and `Review` when the page evaluates a product category.
- `FAQPage` when the page includes FAQs.
- `sameAs`, author, publisher, image, `datePublished`, and `dateModified`.

Do not add schema claims that are not visible or supported by the page body.

## Publication Workflow

1. Draft from the user's topic, CTA, audience, and knowledge base.
2. Review for accuracy, conversion intent, stale claims, duplicate keyword overlap, and LlamaGen.AI naming.
3. Generate or select the cover; upload only when authorized.
4. Publish to the confirmed CMS/database or content repository.
5. Translate/localize while preserving CTA, cover URL, schema intent, and slug strategy.
6. Deploy only when requested or already implied by the task.
7. Verify live URL, API/listing freshness, schema, sitemap, redirects, CDN assets, and cache behavior.
8. Commit and push only when explicitly requested.

## Delivery Report

Report:

- Canonical URL and any redirects created.
- Article title, slug, author, date, CTA, and language coverage.
- Evidence assets or screenshots used.
- Schema and sitemap checks.
- Commands/tests run and their results.
- External effects performed: database writes, CDN uploads, deployments, cache purges, commits, or pushes.
- Known limitations, skipped checks, and unrelated dirty files left untouched.
