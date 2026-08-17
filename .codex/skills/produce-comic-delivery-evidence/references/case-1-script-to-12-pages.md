# Case 1: 2,150-word script to 12 comic pages

## Published claim

One original 2,150-word screenplay became a 12-page, 48-panel English landscape comic with six registered characters. The canonical evidence owner is `/features/story-to-comic-generator`.

## Observed run

| Field                     | Recorded result                                                    |
| ------------------------- | ------------------------------------------------------------------ |
| Case ID                   | `script-2000-to-12-pages`                                          |
| Generated                 | `2026-08-11T06:10:26.705Z`                                         |
| Model                     | ByteDance Seedream 5 Lite                                          |
| Input SHA-256             | `f09dd8ed3a73b2d2703550f92e3ae4d310de72ced010e8e6011ced5c2963b1a0` |
| Output                    | 12 pages, 48 panels, 6 characters                                  |
| Raw first-pass acceptance | 33/48 panels, 68.8%                                                |
| Revisions                 | 16 events across 15 unique panels                                  |
| Elapsed generation        | 45.23 minutes                                                      |
| Human review              | Not separately measured                                            |
| Settled cost              | Not measured; no invoice or credit ledger was returned             |
| Evidence SHA-256          | `111e16d6f5ba2b978e2b8460906bc81e3de74acafa3977a3b1a69693c3c58fc4` |

The first pass means the first generated image for each planned panel before targeted regeneration. Do not reuse 33/48 as the acceptance definition for a later user-facing delivery cycle.

## Generation and review method

- Generate a structured panel plan and six character references before the 48 panel calls.
- Preserve all raw panel outputs, including rejected results.
- Review each panel against required cast identities and story action.
- Repair identity failures with targeted character references; never silently regenerate a whole page.
- Compose four approved panels per 1800×1200 page with a deterministic authored text band.
- Build the 12-page PDF and CBZ only after all panels pass final review.
- Review the complete contact sheet and representative pages at full resolution, then verify page count, order, dimensions, hashes, and archive integrity.
- No standalone review-model API was invoked; review used Codex multimodal inspection plus deterministic checks.

## Retained artifacts

- Complete local archive: `assets/local-run-archives/script-2000-to-12-pages/`
- Tracked hash manifest: `assets/run-manifests/script-2000-to-12-pages.json`
- Public-delivery archive: `assets/local-public-archives/script-2000-to-12-pages/`
- Public-delivery manifest: `assets/public-manifests/script-2000-to-12-pages.json`
- Canonical generation script: `generate-server/scripts/seo/generate-script-to-comic-evidence.ts`
- Approved public data: `llamagen.ai/src/data/seo-evidence/script-2000-to-12-pages.json`
- Public delivery source: `llamagen.ai/public/evidence/script-2000-to-12-pages/`
- Original working bundle: `llamagen.ai/tmp/comic-delivery-evidence/script-2000-to-12-pages/`

The retained run contains the source and panel plan, prompts and generation state, six character-reference images, 48 raw panel images, every before-revision image, 12 composed pages, contact sheet, CBZ, evidence/review JSON, and approved rendered copy. The separate public-delivery archive retains the downloadable PDF and CBZ plus all 12 original-resolution page images and the contact sheet.

## Known limitations

- Model-rendered diegetic text and small uniform patches contain occasional unreadable glyphs.
- Distant faces and extreme angles retain minor micro-variation.
- The PDF is a 3:2 on-screen delivery, not print bleed or a vertical Webtoon.
- Dialogue uses a deterministic bottom text band rather than conventional speech balloons.
- Active human-review time and settled provider cost were not separately measured.

## Reusable lesson

The evidence is persuasive because it exposes the input, all 48 planned units, rejected attempts, repair counts, downloadable result, and remaining defects. A curated gallery alone would not support the delivery claim.
