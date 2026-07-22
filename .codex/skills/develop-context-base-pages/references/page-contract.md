# Context Base Public Page Contract

Use this checklist for `/features/**` pages and other public landing tools rendered by `context_base`. Confirm current repository code before relying on a named file or field.

## 1. Route and ownership

- Put the localized route under `context_base/src/app/[locale]/(public)/...` and reuse `NormalLayout` or the nearest established public layout.
- Keep the localeless canonical path in page configuration. Derive the localized callback URL from the current pathname so login returns to the same locale.
- Add the route to `context_base/worker/index.ts` when the main-site rewrite allowlist requires it.
- Add apex and `www` route patterns to `context_base/wrangler.jsonc`. Preserve the shared locale-prefixed `/features/*` patterns rather than adding incomplete language-specific exceptions.
- Add the canonical path to the owning sitemap source and to relevant footer or internal-navigation groups.
- Do not duplicate `/api/**` implementation in `context_base`. Trace the relative request through the main-site proxy to the authoritative checkout.

## 2. Page family selection

For AI photo/image-editing tools, prefer extending the established shared family:

- `src/lib/ai-photo-utility-configs.ts`: product contract, copy, controls, prompts, tags, SEO.
- `src/lib/ai-photo-tool-galleries.ts`: independent CDN example sets.
- `src/components/pages/AiPhotoUtilityLandingPage.tsx`: uploads, premium controls, generation, errors, results, landing sections.
- `src/lib/ai-photo-utility-seo.ts`: localized metadata, canonical/alternates, Open Graph, JSON-LD.
- `src/lib/ai-photo-tool-i18n-server.ts` and `public/page-configs/features/ai-photo-tools.json`: translated source/fallback.

Use a dedicated component for a genuinely different workflow, then retain the same cross-cutting contracts. Do not fork the shared component merely to change copy or a small control set.

## 3. Functional generation contract

Write down and verify:

- required upload slots, their semantic order, accepted MIME types, maximum size, replacement/removal, drag/drop, paste, and keyboard behavior;
- prompt template and every user-controlled interpolation;
- `name`, `keyword`, `modelType`, `num_outputs`, file order, `aspect_ratio`, and feature-specific `tags` sent to the API;
- editing-page framing (`match_input_image`) versus an explicitly chosen creative output ratio;
- premium options, free defaults, and whether selecting a locked option opens the upgrade flow without silently changing state;
- timeout, abort on unmount/new request, retry behavior, and stale-result prevention;
- `401` login recovery, `402` credit upgrade, `429` busy/rate-limit copy, malformed/non-JSON failures, and successful result/download behavior;
- backend merging of landing tags into `userFile.tags` and CDN upload of the final provider output before returning `imageUrl`.

Do not claim brush/mask precision, hidden-detail recovery, identity preservation, or exact editing behavior unless the implemented UI and prompt/API contract support it.

## 4. Login and monetization

- Use the existing auth hook and login modal; pass the current localized page path as the success callback.
- Gate generation after validating required user inputs so a user understands what is missing before seeing auth UI.
- Use the shared paid-plan guard for premium controls and the shared upgrade modal for insufficient credits.
- Attach the feature keyword/tag to upgrade analytics and generation attribution.
- Keep the UI honest: mark premium options visibly, preserve the free selection, and do not expose a locked option as if it were active.

## 5. Media and copyright

- Create new fictional/synthetic models or use assets with verified rights. Change identity, pose, clothing, setting, composition, and art direction rather than making a near-copy of a reference model.
- Use the reference page to define coverage, not to source media. Do not hotlink `imagehub.ai` or another competitor.
- Keep all final static images on `https://cdn.llamagen.ai/`. Generated/user-file results may use the product delivery host `https://s.llamagen.ai/` after backend upload.
- Use optimized WebP/AVIF when practical, meaningful filenames, explicit dimensions or stable aspect-ratio containers, `sizes`, eager loading only for the true first-view asset, and lazy loading below the fold.
- Render previews and demos at natural ratio with `object-contain`, `h-auto`, or an aspect-ratio derived from `naturalWidth / naturalHeight`. Avoid fixed-height `object-cover` when cropping would hide source or result content.
- Keep temporary user previews as `blob:` URLs only in memory; revoke old URLs.
- Match or exceed the reference's number of materially different examples. Do not duplicate one generated board under multiple captions.

## 6. Localization and SEO

- Generate static params from the supported locale source used by the project.
- Localize visible copy, form labels, errors, premium messaging, metadata, Open Graph text, JSON-LD, FAQs, and alt text.
- Keep structural values such as slugs, hrefs, image URLs, IDs, tags, and option values untranslated.
- Maintain an English fallback while ensuring advertised non-English routes resolve and load their translated bundle.
- Preserve every file under `src/i18n/locales/**`. Never move or delete locales during build/deploy work, even temporarily.
- Verify canonical and hreflang URLs correspond to Worker-routable pages. Do not publish alternates that return 404.
- Include descriptive title/description, canonical, alternates, Open Graph/Twitter image, SoftwareApplication or appropriate JSON-LD, sitemap entry, breadcrumbs/internal links when used by the page family.

## 7. UX and accessibility

- Keep source upload and generated result fully visible on desktop and mobile.
- Use visible focus states on upload triggers and controls; expose selection with `aria-pressed`, labels, and semantic form controls rather than color alone.
- Provide at least 44px touch targets for primary mobile controls.
- Disable generation only for a clear reason and show the missing prerequisite.
- Prevent horizontal overflow at 390px. Test long German/Russian strings and RTL layout for Arabic/Hebrew where supported.
- Keep loading progress credible, support cancellation/timeouts, and maintain result layout without large shifts.

## 8. Registration and verification matrix

| Area | Source/check |
| --- | --- |
| Localized page | `src/app/[locale]/(public)/.../page.tsx` |
| Shared config/component | Nearest existing family; AI photo files listed above |
| SEO/JSON-LD | Family SEO helper plus metadata tests |
| Translation | Owning page-config/locale pipeline plus fallback |
| Worker rewrite | `worker/index.ts` |
| Cloudflare route | `wrangler.jsonc`, including locale wildcard coverage |
| Sitemap | Owning JSON/generator source |
| Footer/internal links | Relevant navigation group only |
| CDN media | Owned CDN domain, HTTP 200, image content type, cache header |
| Functional API | Relative request plus authoritative backend route |
| Regression | Targeted Jest, route tests, page tests, CDN-domain guard |
| Browser | English + non-English, desktop + 390px, login/credit/error states |

Prefer these existing checks when applicable:

```bash
cd context_base
npm run test:critical-public-pages
npm run test-pages
npm run test:unit
```

Run a local Vinext build only when its risk is justified and the command has no upload side effect. Treat Worker deploy, CDN upload/purge, live generation, and IndexNow as separately authorized operations.
