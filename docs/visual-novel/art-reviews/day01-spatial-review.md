# Day 1 · Scene staging QA

**Date:** 21 November 2026
**PR:** #238
**Target:** /tinh-huong/campaign/ (Netlify Deploy Preview #238)
**Sources:** tinh-huong/campaign/scene-composition.mjs and .agents/skills/yen-visual-novel-staging/SKILL.md

## Visual review

The [Day 1 contact sheet](day01-spatial-contact-sheet.jpg) captures the upper visual half of three real 390×844 Chromium frames, reduced in resolution for repository reference. The agent also inspected individual browser frames at runtime crop. This is not new painted artwork or proof of owner approval.

- **D01-01:** Painted counter supports the espresso machine and smaller tickets. Staff is partly occluded by counter but visible above it. Takeaway customer stands in front; Cục Yên's feet are on floor.
- **D01-02:** Staff steps toward walkway, guest stands beyond hazard, Cục Yên stays on floor. Tipped pitcher and wet area are visible. The tinted shadow asset is a **temporary visual proxy**, not finished painted spilled water.
- **D01-03:** Painted counter supports espresso machine, menu and paper receipt. Staff is behind counter, guest opposite; receipt no longer hides the staff's face.
- **Customer limitation:** An existing painterly courier frame is used provisionally as a takeaway customer. A dedicated customer illustration would be clearer.

Scene code projects paper and espresso footprint to the top edge of the real painted 768×195 counter, using a foot/base contact pivot. Actors use individual front 256×320 frames from 4×4 sprite sheets. The background no longer zooms while feet stay fixed.

## QA against Netlify Preview

- **Node:** 34/34 tests passed, including spatial constraints, all Day 1 paths, art/reference and engine regression.
- **Playwright Chromium:** 33/33 tests passed. Verifies floor feet, actual countertop alignment within 2.5px, no-scroll 50/50 portrait, keyboard/touch, three incidents, recovery, and sizes from 320×480 through 1440×900.
- **Visual finding fixed:** First-load zero-height image during mascot expression changes; intrinsic dimensions are now set for all painted image elements.
- **Hosted CI limitation:** GitHub Actions runner jobs failed before any reported test steps. Vercel build quota limitations may block an unrelated provider. These are not falsely reported as green tests.

## Outstanding art debt

1. Draw an appropriate ordinary customer sprite, matching the painterly staff and Cục Yên.
2. Draw actual wet floor/puddle and dry floor outcome art, rather than the temporary tinted shadow.
3. Owner art review remains pending. Current status is agent assessment with a real Chromium contact sheet.

The archived Phaser game remains stopped. Existing paintings alone are reused for the separate visual-novel page.
