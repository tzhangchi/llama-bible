# AI White Background Page Pattern

Use this reference when translating the `/features/ai-white-background` quality bar to another feature. Copy the system, not the subject matter.

## Source of truth

- Route: `context_base/src/app/[locale]/(public)/features/ai-white-background/page.tsx`
- Shared implementation: `context_base/src/components/pages/AiPhotoUtilityLandingPage.tsx`
- Page content: `context_base/src/lib/ai-photo-utility-configs.ts`
- Gallery content: `context_base/src/lib/ai-photo-tool-galleries.ts`

## Why it feels premium

The page is product-led. The user sees the promise, input, action, and expected result inside one framed composition before encountering explanatory content. Large type and visual proof provide impact; cool neutrals, fine borders, and restrained shadows keep the interface quiet.

The layout repeats a small set of structural rules instead of a single card component:

- one large tool canvas;
- asymmetric editorial splits;
- edge-to-edge proof boards;
- divider-based highlight grids;
- sparse workflow cards;
- list-like review and FAQ rows;
- one black closing panel.

## Core geometry

| Role | Baseline pattern |
| --- | --- |
| Hero gutters | `px-3 pt-8 pb-16`, then `md:px-6 md:pb-24` |
| Hero canvas | `max-w-[1500px]`, radius `32px → 46px`, border `#dfe3e9` |
| Tool split | `lg:grid-cols-[0.88fr_1.12fr]` |
| Editorial width | `max-w-[1180px]` |
| Section spacing | `py-20 md:py-28` |
| Editorial split | near `0.8fr / 1.2fr` or `0.85fr / 1.15fr` |
| Card radius | usually `20–30px`, never applied to every text block |
| Control height | minimum `44px`; primary controls commonly `48–56px` |

## Typography

- Primary color: `#111827`.
- Hero eyebrow: 14px, semibold, muted slate.
- Hero title: about `3.15rem → 4.8rem`, `font-black`, line height `0.92`, tracking `-0.055em`.
- Section eyebrow: 12px, bold, restrained uppercase tracking.
- Section title: about `2.4rem → 3.65rem`, `font-black`, line height `0.98`, tracking `-0.045em`.
- Body: 16–18px, line height near 32px, `#525d70` or `#5c6678`.
- Supporting copy: 12–14px, line height 20–28px, cool slate.

Use weight and measure before adding color. Keep long content left-aligned.

## Palette and surfaces

| Token | Use |
| --- | --- |
| `#ffffff` | primary canvas and cards |
| `#111827` | headings and black actions |
| `#293244` | secondary strong text |
| `#525d70` / `#5c6678` | body copy |
| `#697386` / `#7b8494` | supporting labels |
| `#dfe3e9` / `#e1e5ea` | borders and dividers |
| `#f3f4f6` | alternate section background |
| `#f7f8fa` / `#eef1f4` | nested controls and media stages |

Use a shadow such as `0 24px 70px rgba(15,23,42,0.06)` only on the hero canvas or major proof board. Avoid stacking shadows on nested controls.

## Tool composition

The baseline tool puts product copy and controls on the left and a stable demonstration/result surface on the right.

Required behaviors:

- keep input and result in the same visual shell;
- show a meaningful synthetic example before user input;
- preserve source/result aspect ratio with `object-contain`;
- disable or explain actions until prerequisites are satisfied;
- make selected, locked, loading, error, and result states obvious;
- scroll repeated CTAs back to the same tool id;
- keep premium gates inside the relevant control, not in a detached sales block.

For multi-phase tools, show phase progress inside the shell. Replace phase one with phase two after validation and provide an edit/back action. Do not render two full tool cards consecutively.

## Section grammar

### Overview

Use an asymmetric heading/body split. Follow with one large proof image when it adds product evidence. Place key benefits in a shared-border numbered strip rather than three floating cards.

### Examples

Use examples only when different edge cases build trust. Keep source and result fully visible. Number and caption each example consistently.

### Workflow

Use three or four spacious cards. Put the step number at the top and the title/copy at the bottom. Keep one tool-return CTA below the sequence.

### Review

Pair a proof image with a numbered review list, or use an editorial split with divider rows. Make the checklist specific to production risk.

### FAQ

Use a heading column and a separate divider-based disclosure list. Keep disclosure controls keyboard accessible and visibly stateful.

### Final CTA

Use one black panel, a short outcome-led heading, one paragraph, and one light primary action. Point back to the same tool. Add a secondary related workflow only when useful.

## Adaptation rules

Preserve the hierarchy while adapting the content and tool mechanics.

- A casting poster page should foreground roles, logistics, deadline, application method, inclusion, and QR verification.
- A movie poster page should foreground title, genre promise, focal image, campaign crop, typography, and billing review.
- An image-edit page should foreground source quality, subject preservation, edge review, and download-ready output.

Change section count according to evidence. A page with one credible hero asset should not invent a gallery. A complex form may use progressive disclosure, but never hide required high-intent decisions.

## Audit checklist

- [ ] One primary action is visible within two seconds.
- [ ] One primary tool state is visible initially.
- [ ] Hero, controls, and result feel like one product surface.
- [ ] Copy names this exact workflow and its failure modes.
- [ ] Repeated formats, benefits, and CTAs are removed.
- [ ] Section layouts vary while sharing the same spacing and tokens.
- [ ] Images use meaningful alt text and preserve natural framing.
- [ ] All controls have hover, focus, active, disabled, and async feedback where applicable.
- [ ] Mobile text remains at least 14px and touch controls at least 44px.
- [ ] The page has no horizontal overflow at 390px.
- [ ] Reduced motion, keyboard navigation, and contrast remain usable.
- [ ] The final CTA returns to the same tool instead of starting a competing flow.
