---
name: publish-llamagen-release-notes
description: Plan, draft, audit, illustrate, translate, publish, and verify customer-facing LlamaGen.AI release notes from product changes across cms.llamagen.ai, llamagen.ai, manga.llamagen.ai, and context_base. Use when asked to prepare weekly or catch-up release logs, create English drafts/releases/*.mdx files, generate or review release artwork, enforce public-copy and availability rules, add public download links, translate releases, publish an approved batch, or verify https://llamagen.ai/releases. Do not use for engineering changelogs, app-store submissions, or unapproved production deployment.
---

# Publish LlamaGen Release Notes

Turn product evidence into public, illustrated release notes while keeping drafting, approval, publication, and verification as distinct stages.

## Establish the workspace

1. Locate the LlamaGen umbrella root. Prefer the repository containing `.codex/AGENTS.md` and `.codex/skills/maintain-llamagen/`.
2. Read `.codex/AGENTS.md`, `.codex/skills/maintain-llamagen/SKILL.md`, and its workspace map before selecting product repositories.
3. Locate the CMS checkout. Prefer the existing sibling `../cms.llamagen.ai`; use a user-supplied path when provided. Do not create a replacement checkout.
4. Read the CMS repository guidance, `package.json`, `docs/release-draft-guidelines.md`, and `lib/admin/release-public-guidelines.ts`. Treat those CMS files as the enforcement source of truth when this skill and the repository differ.
5. Run `git status --short` in every repository inspected or changed. Preserve unrelated work.

Use `llamagen.ai` and `manga.llamagen.ai` as common evidence sources. Include `context_base` or another owning repository when the release surface lives there.

## Keep two approval stages

Use these stages unless the user explicitly narrows the task:

1. **Prepare locally:** research changes, write all English MDX drafts, generate local artwork, run copy audits, and present the complete batch for review. Do not publish release rows, translate, deploy, purge caches, or upload assets without the required authorization.
2. **Publish after confirmation:** import approved images, run prepared-asset audits, publish the complete batch, translate it, rebuild public JSON, deploy, and verify live pages.

Treat image upload as an external effect even though it does not publish release rows. Obtain explicit authorization before running the CDN image-preparation command.

## Collect release evidence

1. Read the latest public release from the live CDN release list before assigning dates or versions.
2. Define the requested date window and inspect relevant commits, changed user flows, tests, and public UI in each owning repository.
3. Use code and commits as evidence only. Rewrite findings around creator scenarios, visible actions, reduced friction, and improved outcomes.
4. Group related changes into coherent weekly themes. Do not expose one internal commit per bullet.
5. For catch-up batches, use seven-day cadence and sequential patch versions unless the user specifies another schedule.
6. Exclude work that is incomplete, private, behind an unannounced surface, or unsupported by evidence.

## Draft English MDX

Create English drafts under the CMS `drafts/releases/` directory. Follow the current frontmatter contract and a recent approved draft.

For every release:

- Write a title containing the public version.
- Include four or five concise feature summaries.
- Structure the body around user problems, visible changes, and outcomes.
- Name only public product surfaces, public URLs, and approved availability.
- Keep implementation details, internal routes, schemas, databases, migrations, providers, model internals, file paths, commits, repositories, and codenames out of public copy.
- Include the exact Chrome Web Store link when discussing the public Chrome extension.
- Exclude iOS, iPhone, iPad, Android app, mobile app, native app, App Store, and TestFlight claims until the CMS policy explicitly allows them.
- Provide one distinct cover and at least three distinct body images.
- Register each body image in both `featureImages` and `imagePrompts`, then reference it beside the matching Markdown section.

Run the copy audit before creating or uploading final images:

```bash
cd ../cms.llamagen.ai
npm run release:audit-copy
```

Read [references/review-checklist.md](references/review-checklist.md) before declaring the copy ready.

## Prepare artwork

Use the built-in image-generation workflow for new bitmap assets. Generate each distinct asset separately and visually inspect it before using it.

### Cover

- Use a simple 16:9 American consumer-software launch-card composition.
- Reserve the left 42 percent and top-left corner for deterministic branding.
- Use one hero visual and at most one small supporting element.
- Generate no readable text, logo, watermark, mascot, copied UI, third-party logo, dense dashboard, monitor scene, thumbnail grid, or layered card collage.
- Define exactly one `LlamaGen XXX` headline in `coverPrompt`.
- Let the CMS image-import pipeline add the official logo and exact headline after generation.

### Body images

- Generate at least three 16:9 images that each demonstrate one feature or workflow.
- Keep the visual story direct, low-density, and legible at article width.
- Avoid decorative filler; every image must support the adjacent section.

Save reviewed local files using the CMS naming contract:

```text
drafts/releases/images/final/<date>-cover-base.png
drafts/releases/images/final/<date>-<imagePrompt.key>.png
```

After explicit approval to upload the reviewed batch, run:

```bash
npm run release:prepare-images -- --local-assets-dir=drafts/releases/images/final
```

This stage may upload approved images and patch local MDX URLs, but it must not write release rows.

## Reach the publish-ready gate

Run all checks before requesting publication approval:

```bash
npm run release:audit-mdx
npm run release:ship-mdx -- --dry-run --require-prepared
```

Confirm each release has:

- one approved CDN cover;
- at least three unique CDN body images;
- matching `imagePrompts`, `featureImages`, and Markdown references;
- reviewed public copy with no internal or unreleased details;
- correct date and version sequence;
- correct public links.

Stop and report the complete batch when publication has not been explicitly approved.

## Publish the approved batch

After explicit approval, publish only prepared assets:

```bash
npm run release:ship-mdx -- --publish --skip-images --translate --build-json --deploy
```

Add `--force` only when the user explicitly approves replacing already-published rows. Do not generate images during publication. Require all translations to finish before the production write, and preserve the script's atomic batch behavior.

Never substitute manual database edits, piecemeal locale publishing, direct generated-JSON edits, or ad hoc CDN uploads for the repository workflow.

## Verify production

Do not treat a successful database write as completion. Verify:

1. The English and representative translated CDN release lists contain every published version.
2. Every release has one cover and at least three unique body images.
3. Body URLs match `featureImages` and use the LlamaGen CDN.
4. Every dated public page contains the expected version, date, cover, and body images.
5. The releases homepage resolves to the latest published version after cache revalidation.
6. Chrome copy contains the exact public store URL, and no prohibited app-platform claims were introduced.

Use the bundled read-only verifier after publishing:

```bash
node .codex/skills/publish-llamagen-release-notes/scripts/verify-live-releases.mjs \
  --dates=2026-06-11,2026-06-18,2026-06-25
```

Run the same command with `--locale=zh-cn` or another supported locale for a representative translation check.

## Finish cleanly

Report:

- evidence repositories inspected;
- local draft and image files created;
- audit and test commands with results;
- image uploads, database writes, translations, builds, deployments, and cache purges actually performed;
- live page and image counts per release;
- any external effects intentionally not performed.

Re-run the workspace status script and inspect diffs separately in the umbrella workspace and every modified child repository.
