# Case 2: first delivery to requested change to final delivery

## Published claim

The complete case-1 PDF was preserved as the first delivery. One controlled change request targeted page 7 panel 2, and the final 12-page PDF/CBZ changed only the locked art window. The canonical evidence owner is `/comic-agent`.

## Exact request

> On page 7, panel 2, replace the corrupted holographic lettering with a clean, non-verbal three-part contract diagram for the docks, mirror energy, and food supply. Keep Mara, Ilya, holographic Anja, the anonymous guards, the camera angle, and the authored dialogue unchanged. Do not alter any other panel.

This request was authored for a controlled delivery evaluation. Never present it as external customer feedback.

## Observed run

| Field                        | Recorded result                                                    |
| ---------------------------- | ------------------------------------------------------------------ |
| Case ID                      | `first-pass-revision-final`                                        |
| Generated                    | `2026-08-11T13:23:22.190Z`                                         |
| Model and seed               | `bytedance/seedream-5-lite`, `20260818`                            |
| First delivery               | Original case-1 12-page PDF, hash preserved                        |
| Delivered-version acceptance | 47/48 panels, 97.9%                                                |
| Revision                     | 1 event, 1 unique panel redraw                                     |
| Whole-page fallback          | Prohibited and unused                                              |
| Changed pixels inside lock   | 319,699                                                            |
| Changed pixels outside lock  | 0                                                                  |
| Elapsed revision delivery    | 1.37 minutes                                                       |
| Human review                 | Not separately measured                                            |
| Settled cost                 | Not measured; no invoice or credit ledger was returned             |
| Evidence SHA-256             | `0ff2e3cef04a9239a476aa19e84371eda58ae6055eb84392628714235a6f09a7` |

The 47/48 rate describes acceptance of the already delivered 48-panel version in this feedback cycle. It is intentionally distinct from case 1's 33/48 raw-generation first-pass rate.

## Generation and review method

- Copy the first-delivery page byte-for-byte and crop the exact source panel.
- Use one image-to-image generation call with identity, camera, cast, and no-text constraints.
- Preserve the raw model attempt before compositing.
- Replace only the locked art rectangle and retain the existing border and authored dialogue band.
- Encode the final page losslessly so decoded pixels outside the replacement rectangle remain identical.
- Compare the first panel, raw attempt, final panel, and full page at original resolution.
- Build a new 12-page PDF and CBZ from the original 11 pages plus the approved revised page.
- Render and inspect every PDF page, then round-trip all seven CDN files and verify their hashes.

## Retained artifacts

- Complete local archive: `assets/local-run-archives/first-pass-revision-final/`
- Tracked hash manifest: `assets/run-manifests/first-pass-revision-final.json`
- Public-delivery archive: `assets/local-public-archives/first-pass-revision-final/`
- Public-delivery manifest: `assets/public-manifests/first-pass-revision-final.json`
- Canonical generation script: `generate-server/scripts/seo/generate-first-pass-revision-evidence.ts`
- Approved public data: `llamagen.ai/src/data/seo-evidence/first-pass-revision-final.json`
- Public delivery source: `llamagen.ai/public/evidence/first-pass-revision-final/`
- Original working bundle: `llamagen.ai/tmp/comic-delivery-evidence/first-pass-revision-final/`

The retained run includes the original page and panel, raw Seedream attempt, final panel and page, all 12 final pages, exact request, comparison image, CBZ, generation state, evidence/review JSON, and approved page copy. The separate public-delivery archive retains the revised PDF and CBZ, first/final panel originals, final page, exact request, and comparison image.

## Known limitations

- This is one scoped controlled feedback cycle, not a long customer collaboration.
- The final diagram uses pictograms and a decorative approval seal, not legally meaningful contract text.
- Model glyph defects elsewhere in the unchanged comic remain visible.
- Active human-review time and settled provider cost were not separately measured.

## Reusable lesson

Revision evidence must preserve the real baseline, publish the exact request, enumerate every redraw, and prove untouched scope. A hand-made “bad before” image or an undocumented whole-page regeneration invalidates the comparison.
