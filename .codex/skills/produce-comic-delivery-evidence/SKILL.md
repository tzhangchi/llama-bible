---
name: produce-comic-delivery-evidence
description: Produce, review, retain, and integrate auditable LlamaGen comic-delivery evidence using generate-server and llamagen.ai. Use when a request asks to prove an AI comic delivery claim with real inputs and outputs, execute the ordered SEO evidence cases, publish first-delivery/revision/final comparisons, create downloadable PDF or CBZ samples, preserve raw attempts and intermediate artifacts, upload approved originals to the CDN, or add verified evidence to a LlamaGen public page. Do not use for speculative SEO copy, generic feature-page redesigns without an empirical run, or deployment without explicit authorization.
---

# Produce Comic Delivery Evidence

Turn a product claim into a reproducible evidence pack, approve the evidence before writing the claim, and retain the complete run for later audit.

## Start from the ordered evidence gate

1. Locate the LlamaGen umbrella root and read `.codex/AGENTS.md`.
2. Use `maintain-llamagen` to confirm ownership. Treat `generate-server` as the generation authority and `llamagen.ai` as the evidence workflow, public-page, SEO, and downloadable-delivery authority.
3. Inspect dirty state in both repositories and preserve unrelated changes.
4. From `llamagen.ai`, run:

   ```bash
   npm run seo:evidence:comic -- status --json
   npm run seo:evidence:comic -- next
   ```

5. Work only on the current unlocked case. Do not prepare the next case until quality review and page integration both pass.

## Produce the evidence before the copy

1. Prepare the current bundle with `npm run seo:evidence:comic -- prepare <case-id>`.
2. Publish or retain the exact rights-cleared input and record its SHA-256.
3. Write a dry-run-capable generation script in `generate-server/scripts/seo/`. Preserve model, seed, prompts, references, start/end times, provider attempts, revisions, and final files.
4. Require explicit user authorization before a live provider call or CDN upload.
5. Never manufacture a weak first pass. When a case reuses an earlier delivery, preserve the earlier files and hashes byte-for-byte.
6. Count provider retries separately from user-requested revisions. Reconcile every public count with the run state.
7. Report settled cost only when a ledger, invoice, credit record, or provider response exposes it. Otherwise use `null` and say that actual cost was not measured.
8. Record every known defect, including controlled-evaluation provenance, unchanged model glyphs, unmeasured review time, and format limitations.

## Apply the quality gate

1. Inspect raw attempts, accepted revisions, full pages, and the complete delivery at original resolution.
2. Verify hashes, counts, dimensions, page order, cast constraints, and revision scope deterministically.
3. For a panel-only revision, compare decoded pixels and require zero changes outside the locked rectangle.
4. Build PDF/CBZ deliverables only from approved pages. Use the PDF skill, render every PDF page, and inspect the rendered result.
5. Fill `evidence.json` and `quality-review.json`, then run:

   ```bash
   npm run seo:evidence:comic -- validate <case-id>
   npm run seo:evidence:comic -- approve <case-id> --reviewer "<reviewer>"
   npm run seo:evidence:comic -- render <case-id>
   ```

6. Upload only approved originals. Round-trip every CDN asset and verify its SHA-256 before page integration.

## Integrate the canonical page

1. Use the manifest's `primaryPage`; supporting pages receive summaries only.
2. Insert evidence after the real result gallery and before generic explanation unless the manifest specifies another anchor.
3. Display direct immutable CDN originals with correct intrinsic dimensions and `object-contain`. Do not enlarge contact sheets or route evidence images through an optimizer.
4. Show the exact input, date, output counts, first-pass definition, revisions, elapsed time, measured/unmeasured cost, downloads, methodology, evidence hash, and known defects.
5. Add JSON-LD containing only facts visible on the page.
6. Review desktop and mobile layouts, direct image sources, broken images, overflow, canonical/hreflang, downloads, and console errors.
7. Fill `integration-review.json`, run targeted tests, and complete the case. Stop before the newly unlocked case unless the user asks to continue.

## Retain every run

Immediately after approval, archive the complete bundle without deleting or rewriting the source:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id>
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --apply
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --public
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --public --apply
```

The commands without `--public` retain the complete generation run. The `--public` commands separately retain the user-facing PDF, CBZ, original-resolution page images, and comparisons. `--apply` creates independent copy-on-write clones where the filesystem supports them and full copies otherwise. This protects the archive from source deletion and in-place source edits without paying the initial storage cost of a full duplicate on APFS. The large local archives are intentionally ignored by Git; their tracked SHA-256 manifests live in `assets/run-manifests/` and `assets/public-manifests/`. Read [artifact-retention.md](references/artifact-retention.md) before moving, copying, or cleaning archived files.

## Read the proven examples when relevant

- Read [case-1-script-to-12-pages.md](references/case-1-script-to-12-pages.md) for a complete script-to-comic run with 48 raw panels and targeted identity repairs.
- Read [case-2-first-revision-final.md](references/case-2-first-revision-final.md) for a preserved first delivery, one exact panel request, pixel-scope proof, and a revised PDF/CBZ.
- Reuse the examples as methodology, not as a promise that future inputs will achieve the same rate, time, or quality.

## Finish safely

Report both repositories changed, every provider call and CDN upload, the evidence and CDN hashes, exact validation results, archive status, and any skipped full-repository checks. Do not deploy, purge, commit, push, or start another evidence case unless explicitly requested.
