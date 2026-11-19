# Yên Lab · painted room assets

Copied from the paused 2D game's painted sprite set (`game/preview-2d/assets/scene/*-painted-v1.*`, style `yen-painted-chibi-v1`) so `/lab/` does not depend on the archived game folder.

| File | Source | Note |
| --- | --- | --- |
| `room-backdrop.jpg` | `backdrop-painted-v1.png` | Converted to JPEG q72 with macOS `sips` (2.3 MB → 0.37 MB), same 1586×992 |
| `book.webp` | `book-painted-v1.webp` | Unchanged (shown large as the menu) |
| `table.webp` 650w, `bench.webp` 652w, `cup.webp` 160w, `cushion.webp` 200w, `plant.webp` 280w, `door.webp` 160w | `<name>-painted-v1.webp` | Re-encoded at ~2× largest display width with Chromium canvas WebP q0.86 (props 1.35 MB → 0.17 MB) |

Review status (from `game/preview-2d/assets/scene/art-style-policy.json`): agent-reviewed under the owner's delegation on 2026-11-16, **owner review still pending**. Do not add hand-coded SVG/CSS "drawings" as visible room props; new props must match this painted set (see `.agents/skills/yen-sprite-style/SKILL.md`).

| `cuc-yen-tea.webp` 480×480 | `assets/cuc-yen/mascot.svg#cuc-yen-tea` | Rendered by Chromium to a transparent WebP (q0.9). Replaces the external `<use>`, whose gradients/patterns iOS WebKit does not resolve (body showed transparent on iPhone). |
