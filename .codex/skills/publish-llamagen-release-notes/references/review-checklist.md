# Release review checklist

Use this checklist for the human-facing review pass. The CMS repository's `docs/release-draft-guidelines.md` and `lib/admin/release-public-guidelines.ts` remain authoritative.

## Evidence and schedule

- Confirm the latest live release date and version before planning the batch.
- Confirm every claimed change exists in a user-visible product flow.
- Keep catch-up dates seven days apart and patch versions sequential.
- Exclude incomplete, private, or unannounced work.

## Public copy

- Lead with the creator problem or goal, not the implementation.
- State where the user acts and what improves.
- Use public product names and URLs only.
- Remove internal files, routes, endpoints, schemas, migrations, databases, configs, environment variables, tests, commits, branches, providers, SDKs, model internals, and codenames.
- Avoid unsupported launch claims, metrics, pricing mechanics, quotas, or availability promises.
- Keep four or five feature summaries and a substantial Markdown body.

## Product availability

- Chrome extension is public.
- Required Chrome URL: `https://chromewebstore.google.com/detail/ai-comic-generator-comic/obcddklbppihbimomfdlafpefpdbhdik`
- Treat iOS, iPhone, iPad, Android app, mobile app, native app, App Store, and TestFlight as prohibited until the canonical CMS policy changes.

## Image contract

- Require at least four distinct images per release: one cover and three body images.
- Require every final image to use `https://cdn.llamagen.ai/`.
- Require each body URL in `imagePrompts`, `featureImages`, and the Markdown body.
- Place each body image beside the feature it explains.
- Reject duplicate body images, placeholders, temporary local paths, data URLs, and third-party hotlinks.

## Cover review

- Use one exact `LlamaGen XXX` headline.
- Use the official logo source `https://cdn.llamagen.ai/web_public/icons/light-logo-v3.jpg` through deterministic post-processing.
- Keep a clean top-left logo area and a simple left-side brand field.
- Use one hero visual and no more than one supporting badge or card.
- Reject generated text, misspelled text, mascot-led art, copied external branding, watermarks, dense dashboards, monitor scenes, thumbnail grids, and layered multi-card compositions.

## Approval gate

- Review all English copy together as one batch.
- Review every cover and every body image before CDN import.
- Run `npm run release:audit-copy` before image preparation.
- Run `npm run release:audit-mdx` after CDN URLs are prepared.
- Run `npm run release:ship-mdx -- --dry-run --require-prepared` before publication.
- Do not translate, publish, build public JSON, deploy, or purge caches without explicit publication approval.

## Live verification

- Verify English plus at least one translated locale.
- Verify every dated page, not only the CDN list.
- Verify the homepage latest version after cache revalidation.
- Count one cover and at least three body images on every release.
- Confirm all body images are visible in the page HTML and match `featureImages`.
- Confirm the public Chrome URL and prohibited-platform scan.
