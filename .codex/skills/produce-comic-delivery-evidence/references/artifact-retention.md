# Artifact retention

## Purpose

Retain the complete evidence trail without committing hundreds of megabytes of generated binaries to the umbrella Git repository.

## Storage contract

| Location                                             | Purpose                                              | Git status                         |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `llamagen.ai/tmp/comic-delivery-evidence/<case-id>/` | Active working bundle                                | Ignored and temporary              |
| `assets/local-run-archives/<case-id>/`               | Complete retained run                                | Ignored independent local snapshot |
| `assets/run-manifests/<case-id>.json`                | File list, sizes, and SHA-256 values                 | Tracked                            |
| `llamagen.ai/public/evidence/<case-id>/`             | Approved public/CDN source set                       | Child-repository content           |
| `assets/local-public-archives/<case-id>/`            | Retained PDF, CBZ, and public originals              | Ignored independent local snapshot |
| `assets/public-manifests/<case-id>.json`             | Public-delivery file list, sizes, and SHA-256 values | Tracked                            |

The default archive uses filesystem copy-on-write cloning and falls back to a full copy when cloning is unavailable. Both modes create an independent inode, so deleting or overwriting the source cannot change the retained evidence. Use `--copy` to force a full physical copy when moving the archive to storage without clone guarantees.

## Required retained groups

- input source, plans, briefs, page drafts, and exact requested-change text;
- prompts, model/seed metadata, timestamps, generation state, and provider attempts;
- character references and other reference images;
- every raw or rejected image, every before-revision image, and every accepted image;
- composed pages, contact sheets, comparisons, PDF/CBZ, and delivery metadata;
- evidence, quality review, integration review, and approved rendered section.

Do not retain `.env*`, credentials, tokens, `rclone.conf`, customer-private inputs, or unrelated reports. The archive script refuses suspicious filenames.

## Archive and verify

Dry-run first:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id>
```

Create an independent local snapshot and a tracked manifest:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --apply
```

Create independent copies instead of hard links when required:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --apply --copy
```

Re-running `--apply` against an existing archive fails closed. Verify an existing archive with:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --verify
```

Repeat the dry-run, apply, and verify commands with `--public` to retain and check the approved public-delivery directory:

```bash
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --public
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --public --apply
node .codex/skills/produce-comic-delivery-evidence/scripts/archive-evidence-case.mjs <case-id> --public --verify
```

Never make the script delete, overwrite, prune, or silently refresh an existing archive. Create a new case ID for a materially different run.
