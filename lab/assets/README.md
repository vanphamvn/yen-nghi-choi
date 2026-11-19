# Yên Lab · painted room assets

Copied from the paused 2D game's painted sprite set (`game/preview-2d/assets/scene/*-painted-v1.*`, style `yen-painted-chibi-v1`) so `/lab/` does not depend on the archived game folder.

| File | Source | Note |
| --- | --- | --- |
| `room-backdrop.jpg` | `backdrop-painted-v1.png` | Converted to JPEG q72 with macOS `sips` (2.3 MB → 0.37 MB), same 1586×992 |
| `book.webp` | `book-painted-v1.webp` | Unchanged (shown large as the menu) |
| `table.webp` 650w, `bench.webp` 652w, `cup.webp` 160w, `cushion.webp` 200w, `plant.webp` 280w, `door.webp` 160w | `<name>-painted-v1.webp` | Re-encoded at ~2× largest display width with Chromium canvas WebP q0.86 (props 1.35 MB → 0.17 MB) |

Review status (from `game/preview-2d/assets/scene/art-style-policy.json`): agent-reviewed under the owner's delegation on 2026-11-16, **owner review still pending**. Do not add hand-coded SVG/CSS "drawings" as visible room props; new props must match this painted set (see `.agents/skills/yen-sprite-style/SKILL.md`).

| `cuc-yen-tea.webp` 480×480 | `assets/cuc-yen/mascot.svg#cuc-yen-tea` | Rendered by Chromium to a transparent WebP (q0.9). Replaces the external `<use>`, whose gradients/patterns iOS WebKit does not resolve (body showed transparent on iPhone). |

## Book page-turn atlas (#187)

- `book-flip.avif`: 8 horizontally packed frames, 320 × 208 px per frame, transparent AVIF, ~20 KB; sampled at 75 ms/frame on explicit Next/Previous click only. Painted-source generation: OpenAI ImageGen, 19 November 2026; derived from an eight-pose watercolor book illustration, trimmed and aligned to one fixed baseline. Asset source is the original generated 4×2 PNG held with the issue/creator; no external copyright assets.
- The original `book.webp` is intentionally retained for browsers without AVIF support, missing images, and rollback. The animation never carries text or action semantics. All navigation remains native HTML buttons and links.
- Visual review: assistant-generated and code-reviewed; **ownerReviewPending=true**. Check consistency against `book.webp`, button hit targets, text positioning at 320 and 390, and the open/close transition before production release.
