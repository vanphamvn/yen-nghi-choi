---
name: yen-visual-novel-staging
description: Mandatory spatial and painterly composition rules for Yên visual-novel scenes. Use whenever positioning Cục Yên, employees, customers, furniture, equipment, or incident props on a café background, or changing responsive crop/depth.
---

# Yên visual novel · Scene staging

## Scope and prerequisites

Applies to \`tinh-huong/campaign/**\`, future 30-day visual-novel chapters and scene asset changes. Read **this file**, [SCENE-SPATIAL-RULES.md](../../../docs/visual-novel/SCENE-SPATIAL-RULES.md), \`docs/visual-novel/ART-BIBLE.md\`, \`DESIGN.md\`, and \`.agents/skills/yen-sprite-style/SKILL.md\` for any visual asset/position change.

This concerns the **visual novel with immediate dialogue choices**, not the archived Phaser 2D game. Reusing an existing painted static asset does not restart the Phaser roadmap. Do not add prop hotspots or drag interactions.

## Required process

1. **Inspect the actual background and art, not filenames.** View the room background at real crop size; locate the wall/floor boundary, counter surface, floor path and obstructions. Inspect a staff sprite's first 256×320 frame, a customer sprite and Cục Yên next to the props at runtime scale. Source spritesheets must be **cropped or displayed as one frame**, never rendered as an entire 4×4 sheet.
2. **Pick one story focal prop.** The concrete physical incident must be visible (tickets/queue, spill/wet floor, receipt/POS). People and furniture support that object instead of competing with it.
3. **Place using physical contact anchors.** Each prop declares \`surface\` (\`floor\`, \`counter\`, \`table\`, \`held\`) and \`anchor\` (where its feet or base make contact). Each scene declares the relevant surface and the supporting furniture. Never treat \`x,y\` as the picture center. No floating espresso machine or character foot above the floor.
4. **Require a social scene.** The scene needs one employee, one customer and Cục Yên. Employee behind/service-side counter; customer in front or near the incident; Cục Yên anchored to floor, not on a tabletop. When a scene has no café counter, show the staff walking near the incident.
5. **Use perspective and correct overlap.** Keep human-relative size within the scene, foreground characters larger than rear characters where appropriate. Staff can be partially hidden behind the painted counter, but their head and action must remain identifiable. The coffee machine's base rests on the counter surface. Use z-order for occlusion: back staff → counter → on-counter props → foreground customers/Cục Yên → interface.
6. **Keep stage content inside the upper half** on portrait screens. On mobile portrait the world remains exactly 50% of \`100dvh\`, with dialogue/buttons in the lower 50%. No clipping of the three 44px answers, “Tiếp tục”, “Khắc phục” or exit. Crop must preserve all characters and the focal incident.
7. **Show meaningful outcomes.** Choice changes Cục Yên expression, and at least one relevant character placement or focal prop state. Avoid misleading visual claims: if the spilled liquid has not been cleaned, it must still be visible; if the bill was not corrected, the original receipt remains.
8. **Do not declare artwork approved solely from tests.** The current painted source assets are reused with agent-only visual review; owner review pending. The original tinted rectangle was replaced by a transparent watercolor puddle for D01-02; owner review is still pending, and any new floor incident must use equally complete painted artwork.

## Code contract

Store physical layout and roles in \`tinh-huong/campaign/scene-composition.mjs\`, not ad hoc \`x,y,width\` on incident scripts. The engine keeps pure game state in \`day01.mjs\`. Each composition object contains \`background\`, \`layers\`, \`role\`, \`surface\`, \`contact\`, \`size\`, \`depth\`, \`src\` and \`artKind\`; sheet actors have an explicit selected frame. Use \`validateSceneComposition()\` to enforce roles and surfaces.

Standard anchors for the *current* painted café background, **not universal positions for all future art**:
- Floor starts visually near 55% vertical; feet for foreground customers/Cục Yên near 90–97%, staff on the deeper floor behind counter near 68–75% in D01-01/D01-03; D01-02 staff steps onto foreground floor with a separate depth and visible face.
- Counter prop artwork sits on the floor with bottom near 77–83%; its top edge defines the machine/receipt contact plane near 62–68%.
- A spilled-water asset belongs near the walkway floor (78–92%), never on the counter, and must have organic alpha edges. A receipt/menu belongs on the counter; a coffee machine's footprint belongs on its surface.

These percentages are a starting calibration. Always inspect browser screenshots and adjust for actual artwork, device crop and scene focus.

## Mandatory evidence and test gate

- Unit: \`node --test tests/yen-campaign-scene-composition.test.mjs\` checks all scene layers, role inventory, known asset paths, contact constraints, feet placement and depth order.
- Browser: \`npx playwright test --config playwright.yen-day01.config.mjs\` checks all three scenes and outcome states at 320×480, 320×568, 360×640, 390×844, 768×1024 and landscape/desktop, one-screen no overflow, 44px buttons and loaded sheet backgrounds.
- Inspect real screenshots at least 390×844 and 1440×900 with **two staff poses and the focal prop at runtime scale**. Capture what still needs repainting. Never claim human approval.
- PR → green CI if available → merge → verify exact production revision and the live route. If hosted CI cannot execute, document independent test evidence and limitation precisely.

## Perspective calibration regression (21/11/2026)

**Do not enlarge a rear barista merely to show more of the body above the counter.** Day 1 originally set staff width to 32% of the scene and foreground guest to 23%; this made the employee's head disproportionately large. The corrected rear staff uses 20% (less than 92% of the guest's 23%) and a farther **floor** contact around 71% of scene height. Keep the upper body legible by moving the foot anchor to the deeper floor plane, not by scaling the figure up. For a staff member approaching the walkway, 21% is acceptable against a 23% visitor.

**Visual bottom vs image box:** the painted espresso machine's *metal base* sits at about 90% of the asset's image height. The remaining 10% includes shadow/transparent pixels. Anchoring at 98% placed its apparent feet *above* the counter. Set `footOffset: 90` to align the painted metal with the actual countertop. Validate `machineRect.top + machineRect.height * 0.90 ≈ counterRect.top`, not only `machine.style.top ≈ counterRect.top`. Inspect at 375×667, 390×660 and desktop. Record image-level proof; browser geometry alone cannot approve visual art.

## Mandatory silhouette and illustration rules (owner screenshot, 21 Nov 2026)

The staging must be readable at actual portrait-screen crop. Use actual **nontransparent painted-pixel bounds**, not only the full `img`/sprite-sheet element box, when judging occlusion and collisions. No character may cover another character's head, face, or meaningful silhouette. Do not layer the painted counter over the employee's face. A barista standing behind the counter may be occluded at the legs/waist only, but **head and complete face stay visible**. A staff member who leaves the counter to address a floor hazard must become a foreground floor actor, rendered **in front of the counter** rather than using the universal rear-staff depth.

For wet-floor scenes, use a separately authored **transparent, organic watercolor puddle**. A blue tinted `shadow.webp`, rectangular block, placeholder, text-bearing sticker, or fake water made with a CSS rectangle is prohibited. The tip-over pitcher belongs beside/on the wet footprint and never masks Cục Yên. Cleared floor must visually lose the puddle rather than leaving a colored rectangle. Inspect the cutout artwork: alpha-transparent surrounding canvas and irregular painted edges. Maintain substantial side-by-side separation of staff, Cục Yên and visitor through outcomes, including alternate customer poses and movement.

Before sharing a preview, implement the arrangement in the scene registry and keep **D01-01/D01-03** rear staff behind the counter with face above the desk, while **D01-02** has a staff member out on the floor in front of the counter. Preserve choice-only gameplay and exactly 50/50 portrait composition. As directed by owner, **deploy a fresh Netlify Preview and stop for owner approval before running full QA, merging or pushing production**.
