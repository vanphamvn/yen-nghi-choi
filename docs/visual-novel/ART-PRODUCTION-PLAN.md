# Một Tháng Không Yên · Art production execution plan

Source: [ChatGPT prompt pack](art-briefs/chatgpt-prompt-pack.md) · Parent [#218](https://github.com/vanphamvn/yen-nghi-choi/issues/218).
This plan is the production queue, **not proof that any art exists or is owner approved**.

## Active batch: style calibration
- [ ] [#244](https://github.com/vanphamvn/yen-nghi-choi/issues/244) Create real painted `wet-floor-sign/folded`, `wet-floor-sign/placed` and `guest-adult-a/waiting`; store originals, optimized images and contact sheet.
- [ ] Inspect actual canonical PNG, room, counter and grinder **visually** as provided by the pack; abort image production if reference viewing is unavailable.
- [ ] Compare proportions, warm-brown contour, hand-painted texture, facial construction, 2.5D perspective, left key light and ground contact with canonical sprite.
- [ ] Test at 320×480, 375×667 and 390×844, alongside the barista, not in isolation.
- [ ] Record evidence, tool/model, input references and rights review in the manifest; ownerReviewPending remains true.

## Shared production order
1. [#245](https://github.com/vanphamvn/yen-nghi-choi/issues/245) Nine base locations, then edit-in-place variants. Backgrounds remain people-free and text-free.
2. [#246](https://github.com/vanphamvn/yen-nghi-choi/issues/246) Recurring cast, staff, Cục Yên and shared prop family states.
3. [#247](https://github.com/vanphamvn/yen-nghi-choi/issues/247) D02 three incident compositions, visual response per choice, complete QA.
4. D03–D07 in one playable-day slice per PR; next D08–D14, D15–D21, D22–D28, D29–D30. Generate only missing day-specific art. File follow-up issues after inspecting each actual episode script and art gap analysis.

## Per-asset checklist (must pass before runtime integration)
- [ ] Stable asset ID, descriptive variant and source file under `tinh-huong/assets/source/`.
- [ ] Original generated/painterly media with recorded prompt, model as displayed, creation date, exact reference filenames, origin and licensing/rights review.
- [ ] Alpha-safe isolated props/actors; original camera/foot/base pivot; stable canvas across state edits.
- [ ] Optimized WebP and proper fallback from `tools/optimize-yen-art.mjs`, dimensions, actual file size report.
- [ ] Visual contact sheet with canonical references at runtime size, small mobile crop and screenshot review notes.
- [ ] Reviewer is accurately `agent` or `human`; no false owner approval; `ownerReviewPending: true` until owner inspection.
- [ ] Scene evidence: no face occlusion, no floating feet/props, staff behind counter, focus hazard visible; before/after outcomes differ.
- [ ] Art validation, Node tests and browser QA; exact commit SHA, no production release claim until verified.

## Workflow and ownership
One family or playable day per PR. Use the existing art bible, spatial rules and sprite-style skill. Do not edit the archived Phaser game. The coordinator can prepare briefs and review, but may never invent generated source files, model IDs or screenshot evidence. A prompt alone does not mark an asset complete.

**Release:** no Vercel deployment. Keep art changes on a reviewable branch; merge only after applicable CI and real asset/browser evidence.