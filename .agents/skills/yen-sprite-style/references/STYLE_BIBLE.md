# Yên 2D art bible · v1.0

## Source of truth

**Primary visual references:** `game/preview-2d/assets/sprites/barista.png` and `waiter.png`. Supplement with `guard.png`, `shipper.png` and `cat.png`. Use reference frames 0 (front), 4 (right), 8 (back) and 12–15 (action) from each 4×4 sheet. The original PNG art, not a prose style label, is authoritative. If you cannot inspect the PNGs visually, **do not invent measurements of their paint texture or claim a match**.

Known from the manifest: all five sprite sheets are 1024×1280 RGBA, four columns by four rows, 256×320 cells, transparent, bottom-center pivot near (128,312). Human game sprites currently display around 109–117 wide by 138–146 tall in a 1440×900 scene. These are runtime values, not an approved physical scale.

## Target look

- **Visual family:** warm, hand-drawn, storybook/anime chibi, coherent with character sheets. Painted or painterly raster shapes, nuanced material color changes, irregular organic edges and soft shadows. Let the *character reference pixels* determine the exact brush, outline weight and roughness.
- **Materials:** wooden tabletop shows variation and wood grain; fabric has softer boundaries and fold shadows; foliage has layered leaves and irregular highlights; metal/glass have appropriate reflections. No generic uniformly filled rectangles, circle-heavy icon silhouettes or broad default linear-gradient fills.
- **Lighting:** one consistent warm environmental light direction, with objects receiving matching highlights, ambient occlusion and contact shadows. Shadows share the same softness and color family as the reference world.
- **Perspective:** establish one shared 2D/2.5D scene camera (approximate eye-height, floor contact and top-surface visibility) by comparing a front-facing character next to props. Avoid mixing pure side view with excessive top-down ellipses in the same location.
- **Outlines:** thickness, darkness, anti-aliasing, irregularity and internal line density are calibrated on the real character PNG at runtime scale. Do not adopt a constant 7–12 px dark SVG stroke just because it reads well independently.
- **Palette:** warm wood, paper, muted foliage are only *supporting constraints*. Using identical hex colors is **not** sufficient style evidence.

## Relative-size guide: start, then adjust visually

Use one frame of the barista at its *actual displayed height* as a scale bar. For every prop, document visible width/height **and** floor-contact footprint. A counter should feel waist/chest-high relative to the barista; chair seat near their bent-knee height; a mug should be hand-held, not head-sized; a sofa depth and floor-contact area must agree with its illustrated volume. **Do not rigidly enforce numerical ratios without looking at the art.** Preserve a single world unit system and fixed sprite pivot rather than per-object independent “looks OK” scaling.

| Asset | Required readable details | Interaction variants | Required overlap |
| --- | --- | --- | --- |
| Counter / coffee machine | Hand-painted wooden grain, equipment details | Idle, brew/steam | Actor behind counter partially hidden by front fascia |
| Round table | Painterly top, thickness, legs and grounded chairs | Cup present/removed, book open/closed | Character passes behind table and can stand in front |
| Bench | Cushion material, seams, folds and leg shadows | Cushion displaced/restored; later seated NPC | Seated character behind seat front, in front of backrest |
| Potted plant | Irregular layered leaves and glazed/terracotta pot | Idle, watered/leaf response | Leaves may occlude upper character when in foreground |
| Delivery scooter | Vehicle material and realistic painterly wheel volume | Light off/on | Wheels visibly ground and block walkable area |
| Door | Painted wood/glass and handle depth | Closed/open/sign change | Actor transitions across threshold |
| Small props | Cup, book, cushion match material and outline language | State per interacting object | Place them on parent prop with correct depth and hand alignment |
| Architecture | Ground/wall shading, signage integrated with same brush character | Day/night/ambient | Static environment may differ in detail, never a different illustration style |

## Alpha, frame and animation specification

1. Keep original high-resolution RGBA source, with each independent pose on a transparent background; no checkerboard rasterized into alpha.
2. Normalize all animation frame canvases and pivot; compensate for animation silhouette changes, not by repositioning the actor every frame.
3. Remove isolated specks and bleed edge RGB while retaining anti-aliased alpha; check halos against light and dark scene backgrounds.
4. Use texture atlases to avoid network cost; frame metadata must have explicit crop rectangle, pivot, animation ID, fps and direction.
5. Draw *real alternate art* for sitting, standing up, handling cups and material changes. Tweaking `scaleY`, rotating the whole object, or translating a vector copy is an **effect**, not a substitute for the missing animation art.
6. Depth sort by ground-contact y, with separate foreground occlusion masks where needed. Collision footprint is a smaller ground-contact region, not the visible rectangle.

## Side-by-side review test

Create a contact sheet in `game/preview-2d/art-reviews/` at 1440×900 or sufficiently high-res. It should show:
- a reference character in **two different poses** (front and side) plus a new asset;
- the new asset isolated at its **intended game-rendered dimensions** beside the character, not separately zoomed;
- the same objects in the actual Phaser scene with depth, lighting and shadow;
- one small-device screenshot/crop to reveal line weight, texture and aliasing changes.

Compare: silhouette, line softness, brush texture, saturation, directional lighting, specularity, spatial projection, relative human size, edge alpha and gameplay readability. Mark every check **Pass / Needs revision**. If any major dimension needs revision, keep `styleStatus: needs-review`; do not publish a claim of approval.

## Why PR #91 failed visually

PR #91 replaced the previous painted WebP café with `backdrop.svg` and authored nine additional visible scene SVGs using paths, rectangles, ellipses, broad gradients and dark constant strokes. The original character sprites were still PNG RGBA chibi paintings. There was **no shared character image conditioning, no side-by-side render, no art approval and no style-review artifact**. Existing tests verified XML validity, numeric geometry, collision reachability and animation frames. They could not catch “vector icon art inside a painted anime world.” This is a process failure, not a coordinate scale defect.

## Revision process for the 10 quarantined SVGs

Start with **one representative furniture item**, ideally table or counter. Paint a new transparent raster asset explicitly referenced to the barista art. Generate its interaction states; compare at runtime scale; fix perspective and outline until the owner approves. Then approve the method, recreate the remaining props with the same art bible and asset treatment, and finally repaint the architecture layer. Keep old SVGs unchanged until their replacements pass gameplay QA; then remove runtime references and retire the SVG baseline.

## Release proof

When an art revision is ready, update `art-style-policy.json` with:
- `path` relative to `game/preview-2d/`, e.g. `assets/scene/table-painted.png`;
- `styleStatus: "approved"`, `styleId: "yen-painted-chibi-v1"`;
- at least two real character reference paths;
- `proof` pointing to an existing PNG/WebP contact sheet;
- `reviewer` and ISO `reviewedOn` from an **actual human approval**, not the artist/assistant's own assertion.

The automated audit verifies that those records are complete and the files exist, but **cannot determine whether the images look right**. An explicit human visual review is the final art gate.
