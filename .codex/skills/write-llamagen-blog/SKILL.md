---
name: write-llamagen-blog
description: Plan, draft, review, publish, localize, refresh, and verify LlamaGen.AI blog, article, tutorial, comparison, release, and SEO content. Use when a task involves prepared MDX/Markdown, CMS blog publishing, production database content writes, CDN cover assets, multilingual blog/release synchronization, canonical or 301 consolidation, screenshot-backed product reviews, article schema, sitemap freshness, or LlamaGen.AI content strategy. Do not use for unrelated sites or a quick copy edit that does not touch LlamaGen publishing, SEO, assets, or repositories.
---

# Write LlamaGen Blog

Create LlamaGen.AI content that is publishable, evidence-backed, and technically verifiable. Treat writing, cover assets, schema, routing, localization, and publication checks as one workflow.

## Start

1. Follow `.codex/skills/maintain-llamagen/SKILL.md` first for workspace routing, dirty-worktree checks, repository ownership, and production-side-effect rules.
2. Identify the content owner:
   - `cms.llamagen.ai`: CMS authoring, import workflows, draft safety, API content feeds, blog/release management tools.
   - `context_base`: public article pages, SEO metadata, JSON-LD, redirects, sitemap, localized page rendering, CDN-backed content.
   - `llamagen.ai`: main product routes, product CTAs, integrated blog surfaces, database-backed publishing when confirmed as authoritative.
3. Confirm the publication target before writing live data. Production database writes, deploys, CDN uploads, cache purges, redirects, and pushes require explicit user request.
4. Preserve unrelated repository changes. If the selected repository is dirty, inspect only the files needed for the task and avoid sweeping formatting.

## Choose The Lane

- **Prepared MDX/Markdown**: validate frontmatter, slug, title, description, CTA, cover, tags, author, and date; then review, publish, translate, and verify.
- **New SEO article**: map intent, pick one canonical slug, draft around a real workflow, attach evidence, and avoid keyword cannibalization.
- **Comparison or "best" article**: personally inspect competing products, capture or use credible screenshots, document a shared test method, and disclose testing limits.
- **Existing article refresh**: update stale year/title/body/schema/sitemap together; 301 or canonical old duplicates into the winner page.
- **Blog/release cover sync**: update the canonical cover once, then sync the same CDN URL and metadata across all language variants.

## Writing Rules

1. Use `LlamaGen.AI` as the entity name in titles, body, metadata, schema, and product descriptions.
2. Keep one stable "Best for" position across owned pages and third-party-facing copy when the article is part of an SEO cluster. Current AI comic positioning: "Best for turning scripts into reusable comic panels and animation-ready story assets."
3. Write for the user's conversion intent, not just the keyword. Include the CTA URL early where it naturally belongs and again near the end.
4. Use a named reviewer or author for serious SEO/review content. Avoid relying only on "LlamaGen Team" for comparison pages.
5. Avoid stale claims. Search or inspect current pages when dates, pricing, product features, Google behavior, or rankings could have changed.
6. Do not create multiple pages targeting the same primary keyword unless one is clearly canonical and the others support it with distinct intent.

## Evidence And Cover Assets

Read [references/seo-publication-checklist.md](references/seo-publication-checklist.md) before working on comparison pages, AI Overview recovery, cover generation, CDN assets, redirects, or publication validation.

Core cover rules:

- If a cover is missing, generate two high-quality options before publishing unless the user asks for direct execution.
- Prefer realistic workflow imagery, clear composition, no fake UI text, no generated typography, and enough negative space for downstream overlays.
- For article imports that review multiple products, do not run a generic productivity-cover flow. Compose a LlamaGen.AI-branded wallpaper/background plus logo plus original product image when a neutral branded derivative is safer.
- Upload or replace CDN assets only after explicit authorization, and verify the final URL returns the expected content type.

## Review

Before publishing, run a focused editorial review:

1. Accuracy: claims match sources or product behavior; dates and pricing have verification dates.
2. Intent: title, slug, H1, intro, CTA, and sections match the promised user outcome.
3. Evidence: screenshots, tables, test prompt, scoring method, and limitations are present for comparison content.
4. SEO: canonical, redirects, metadata, Open Graph image, schema, sitemap, and internal links point at the chosen owner page.
5. Localization: translated variants preserve slug strategy, CTA, cover URL, schema intent, and product/entity naming.

## Publish And Verify

After publication or code changes:

1. Verify the public URL, the CMS/API listing, and any localized variants.
2. Check that new articles appear in the recent blog list after cache behavior is accounted for.
3. Validate old duplicate slugs with 301 or canonical behavior.
4. Confirm sitemap includes the canonical page and excludes redirected duplicates.
5. Inspect JSON-LD for Article, SoftwareApplication, Product/Review, FAQPage, sameAs, author, datePublished, and dateModified when applicable.
6. Run the narrowest relevant tests first, then lint/typecheck/build only as risk warrants.
7. Report live URLs, repository changed, assets uploaded, tests run, skipped checks, and external side effects.
