---
name: design-premium-feature-pages
description: Design, redesign, normalize, and review premium public LlamaGen feature pages using `/features/ai-white-background` as the quality bar. Use when a `/features/**` page feels generic, visually dated, card-heavy, repetitive, less polished than the AI photo utility pages, or needs a focused tool-first hero, editorial content hierarchy, responsive refinement, and final visual QA. Pair with the repository page-contract skill when routing, SEO, localization, APIs, or publishing also change.
---

# Design Premium Feature Pages

Create a focused product experience, not a decorative landing-page collage. Treat the tool, its evidence, and the user's decision flow as the visual system.

## Read the baseline

1. Inspect the target page, its shared component, config, route, assets, and dirty worktree.
2. Inspect these baseline sources before changing structure or styling:
   - `context_base/src/components/pages/AiPhotoUtilityLandingPage.tsx`
   - `context_base/src/lib/ai-photo-utility-configs.ts`
   - `context_base/src/lib/ai-photo-tool-galleries.ts`
   - `context_base/src/app/[locale]/(public)/features/ai-white-background/page.tsx`
3. Read [references/ai-white-background-pattern.md](references/ai-white-background-pattern.md) completely.
4. When the request changes route ownership, SEO, Worker registration, localization, APIs, analytics, or assets, also read `../develop-context-base-pages/SKILL.md` and follow its full page contract.

## Define the page's one job

Write down the page's primary user, input, decision, output, and proof requirement. Keep one obvious primary action and one real tool surface.

- Make the tool usable before presenting general marketing content.
- Remove repeated controls, duplicated format cards, repeated CTAs, and multiple blocks that look like separate tools.
- If a workflow has phases such as brief and generate, render them progressively in one shell. Replace or collapse the previous phase; keep a clear edit/back action.
- Keep required domain decisions visible. Put optional art direction or power-user controls behind progressive disclosure.
- Do not repeat information already visible inside the tool unless the later section adds evidence or a different decision context.

## Build the tool-first hero

Place the hero and working interface inside one restrained framed canvas:

- Outer section: compact page gutters, generous bottom spacing.
- Canvas: `max-w-[1500px]`, white surface, cool-gray border, 32–46px radius, low-contrast shadow.
- Desktop layout: approximately `0.88fr / 1.12fr`; stack naturally below `lg`.
- Heading: heavy, compact, nearly black, 0.92–0.98 line height, tight negative tracking.
- Body: cool slate, 1.75–2rem line height, readable 45–75 character measure.
- Primary action: black rounded control; secondary action: quiet outline.
- Preview/result: `object-contain`, stable aspect ratio, neutral stage, useful caption, no decorative crop.

Use color as information. Keep the interface primarily white, black, and cool gray. Reserve a warm accent for artwork, success, selected state, or one brand detail.

## Compose an editorial landing flow

Choose only sections that add evidence or resolve a user question. Use this order as a menu, not a mandatory checklist:

1. Tool-first hero.
2. Two-column overview with domain-specific explanation.
3. One visual proof board and a numbered highlight strip.
4. Example gallery when multiple outcomes materially build trust.
5. Three- or four-step workflow with bottom-aligned card content.
6. Practical use cases when they differ meaningfully.
7. Review/proofing notes for high-risk output details.
8. Split-layout FAQ.
9. Related tools only when they continue the workflow.
10. Black final CTA that returns to the same tool.

Alternate white and `#f3f4f6` sections to create rhythm. Use `max-w-[1180px]` for editorial content and 80px mobile / 112px desktop vertical spacing. Prefer divider grids and editorial rows over isolated rounded cards.

## Write domain-specific copy

Derive every heading and supporting sentence from the target workflow. Do not inherit movie language on casting pages, image-edit language on generation pages, or generic phrases such as “unlock creativity.”

- Name the decision the user is making.
- Explain the failure the structure prevents.
- Make review notes specific to the output: dates and QR codes for casting, typography and billing for posters, edges and material fidelity for background edits.
- Use consistent nouns for the tool, input, output, and final action.
- Keep labels direct and buttons action-led.

## Avoid template degradation

Do not introduce:

- gradients, glow, glassmorphism, or decorative blobs as the main aesthetic;
- card soup, repeated four-column grids, or identical rounded cards in every section;
- oversized pills for non-interactive labels;
- multiple competing accent colors;
- centered text for long explanations;
- fake product screenshots or previews that do not explain the workflow;
- an always-visible marketing hero followed by a second disconnected tool hero;
- hidden required fields, unreadable mobile crops, or controls below 44px touch size.

## Verify before handoff

1. Exercise the primary flow, including empty, validation, loading, success, and edit/back states that are available without spending credits.
2. Compare the result side by side with `/features/ai-white-background` at the same viewport.
3. Inspect desktop and 390px mobile layouts for overflow, hierarchy, touch targets, long copy, image containment, and focus visibility.
4. Confirm the initial DOM exposes only one primary tool state.
5. Check that every later section adds new information rather than restating the tool.
6. Run the narrowest relevant tests, formatter, type check where clean, and `git diff --check`.
7. Report unrelated pre-existing failures separately. Preserve all unrelated worktree changes.
