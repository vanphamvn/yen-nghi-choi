# Một Tháng Không Yên · Visual Art Bible v1

**Scope:** VN-F02 #220 · painted scene identity and quality gate for all 90 incidents.
**Status:** foundational reference sheet, manifest and QA. **No new world prop/actor pose is approved by this document.**

Reference sheet: [/tinh-huong/art-reference/](/tinh-huong/art-reference/) · Machine-readable art manifest: `docs/visual-novel/art-manifest.json`.

## What the player must actually see

A visual novel is not an illustration behind a quiz. Every incident requires **a clear illustrated situation**, characters who speak naturally, answer choices shown beside the image, and a **visibly different outcome** after the player chooses. Do not require tapping props or placing objects. Dialogue explains reactions but does not replace the artwork.

Every incident Dxx-yy has an art triptych:

| Stage | Required shot | What must change |
|---|---|---|
| Establishing | Wide scene with time/weather, actors and risk/object in context | Character entering, prop malfunctioning, environmental cue |
| Decision (`interactive` in the manifest) | Contextual close-up of characters and the specific incident | Dialogue and 2–4 answer buttons appear immediately; no clickable props, drag or hotspots |
| Resolution | Choice-specific outcome with human reaction | Character pose or expression AND/OR prop state, possibly background lighting/weather; no text-only change |

**Do not** substitute three captions on the same unchanged backdrop for three stages. Frame sources may share a background *only if* the actor/prop composition meaningfully changes. Failure to find a suitable visual asset keeps the incident planned.

## Canonical visual identity

Use the real Yên Coffee & Tea painted-web materials in `lab/assets/`: `room-backdrop.jpg`, `cuc-yen-tea.webp`, `bench.webp`, `table.webp`, `cup.webp`, `plant.webp`, `book.webp`, `door.webp`. They originate in the existing Yên painted room set, as documented in `lab/assets/README.md`. They are **reference assets**, not a free pass to fake all 90 scenes with one background.

Look for warm paper/wood/tea colors, visible imperfect painted texture, soft brush edges, dimensional shading and one coherent light source. Match the muted palette from `DESIGN.md` (`#f7f3e9`, `#243c35`, `#2e5a46`, etc.) but **color match alone does not establish style match**. Avoid flat geometric SVG or CSS illustration as a substitute for new painted world props. Answer controls can use CSS; in-world props should keep the painted art direction.

Do not import archived Phaser sprites **without an actual image/style inspection**. The existing painted barista and courier character frames were compared alongside Yên's active web Cục Yên, background, painted counter and coffee tools before limited static reuse in Day 1; this does not restart Phaser or establish final owner art approval. A dedicated generic guest sprite and painted wet-floor asset are still missing.

## Character and prop scale

| Role | Runtime reference and placement | Consistency rule |
|---|---|---|
| Main painted room | 1586×992 original, desktop 16:10 | Fixed camera and floor line; don't stretch the image |
| Cục Yên tea mascot | 480×480 source, shown ~20% of desktop room width / 46% of cropped mobile scene | Ground contact behind table, consistent outline and shading |
| Bench | 652×430 source, ~31% desktop / 72% mobile crop | Seat behind character; preserve seat vs character heights |
| Table | 650×403 source, ~29% desktop / 68% mobile crop | Table must overlap actor lower body; cups stand on tabletop |
| Cup | 160×156 source, ~6% desktop / 14% mobile crop | Avoid human-sized drinks; align to tabletop |
| Plant | 280×363 source, ~10% desktop / 17% mobile crop | Base touches floor; no floating props |
| Door/book | 160×268 / 384×188 source | Perspective/texture must match actual scene |

These are reference proportions from Yên Lab, **not** universally correct character scales. For other camera angles, first define floor/vanishing direction and the actor's physical height relative to the countertop and doors; then measure props at runtime. In scenes with human NPCs, proportions must be realistic *within the chosen painted stylization*. Do not resize everything arbitrarily until it fits.

## Camera grammar (five intentional shots)

1. **Establishing wide:** show location, weather/time and what is physically at risk.
2. **Evidence close-up:** reveal the receipt, water, machine status, label or injury hazard; on-screen enough to read without zooming.
3. **Dialogue decision:** focus the character and evidence; show answer choices outside the illustration, ready for keyboard/touch selection.
4. **Dialogue pair:** the right actor addresses the player and changes pose/face, not just speech bubble text.
5. **After action:** confirm the hazard was isolated or remains, show visible consequence and recovery opportunity.

Shift angle only to clarify information. Avoid looping character bobbing, automatic camera movement and unnecessary zooms. At 320px, the evidence and CTA must remain in view; safe-area paddings and screen-reader narration are required.

## Production asset contract

Each new image needs: unique asset ID; incident ID; role (background, actor pose, world prop, effect); source/provenance and rights; original dimensions; transparency and pivot for props/actors; expected visible size and camera anchor; default and alternate states; accessibility alt; still fallback; optimized delivery reference; style review evidence.

Output painted assets as transparent WebP/PNG for props, AVIF/WebP for large backgrounds only with a reliable WebP/JPEG fallback. Trim transparent padding deliberately, avoid halos, keep consistent baseline/ground pivot. For animated states, create separate scene states with a stable camera, not a CSS transform pretending a new drawn pose.

Performance goals (targets, not verified until measured): lazy-load future day packs, cache shared approved sources; avoid shipping 90 backgrounds at page load. Aim to keep initial scene image around 250 KB when practical without obscuring the visual clues. Ship a compression report with each art pack.


### Reproducible image optimization

Use `tools/optimize-yen-art.mjs` to convert a reviewed painted PNG/JPEG/WebP source via locally installed Chromium. The tool is offline and uses browser-native canvas encoding; it does not invent new art or require an external image API.

```bash
node tools/optimize-yen-art.mjs --input path/to/painted-prop.png --output tinh-huong/assets/prop-name --alpha --max-width 640
node tools/optimize-yen-art.mjs --input path/to/painted-background.jpg --output tinh-huong/assets/background-name --max-width 1600
```

The first command writes `.webp` **and** a `.png` transparency-safe fallback; the second writes `.webp` **and** `.jpg` fallback. Use an HTML `<picture>` element with WebP source and the JPEG/PNG fallback for browsers that cannot decode WebP. Input is not overwritten. AVIF may be supplied as an additional source format only after an encoder and browser fallback have been verified; do not generate fake AVIF file extensions.

**Verify** visual similarity at display size, alpha edges, native dimensions, alternative format, decode success and measured file-size delta before checking in new files. Compression passing does not constitute art review.
## QA process and proof sheet

1. Use `/tinh-huong/art-reference/` to check the **existing** painted reference on desktop and mobile. Capture real browser screenshots at 320, 360, 390, 768, 1440 widths. Note: current sheet contains reference images only.
2. For each *new* asset, produce side-by-side proof against current painted room and at least two relevant character poses, at actual runtime scale and at a neutral background. If the pose references are unavailable, flag art review blocked rather than fabricate an approval.
3. Record camera, object dimensions, ground pivot, soft brush edges, shadow direction, occlusion, legible cues, crop, transparent alpha and source fingerprint.
4. Review exact current asset revision. Record reviewer type and evidence, `ownerReviewPending=true` until actual owner review. Agent visual assessment may be delegated but may not impersonate the owner.
5. Verify each scenario background and character composition on mobile and desktop, answer selection by keyboard/touch, reduced-motion, image-load failure, layout and choice-specific visual outcome. Screenshots show before and after decision.
6. Run content + art manifest audit, interactive browser checks and production SHA verification before calling a scene shipped.

## Incident asset slots

`art-manifest.json` declares all 90 incident IDs and requires three actual art frames plus choice-specific `visualChanges`. The first 3 (Day 1) contain painted-asset compositions with agent review evidence; 87 remain `planned` with null frame refs. Owner art review is still pending. A future PR may mark **only its implemented incident IDs** ready, and then the audit requires real asset files, source/licensing, distinct visual states and review evidence. Reducing the number of incidents or silently replacing null slots with an identical placeholder is not accepted.

### First production illustration set (VN-F04 / Day 1)

- **D01-01:** three paper tickets and espresso machine physically on the painted service counter; employee behind counter, takeaway customer in front and Cục Yên on the floor. The player immediately chooses how to handle queue fairness; the ticket grouping and guest reaction change.
- **D01-02:** tipped pitcher and wet-floor cue in the walkway, staff leaving the service side, a guest approaching and Cục Yên on the floor. The player chooses the safe response, not a prop action. The wet area remains/changes according to the choice or recovery. Current tinted shadow is provisional, not an approved painted puddle.
- **D01-03:** menu and a paper receipt on the counter, customer on the opposite side and staff behind it, Cục Yên on the floor. The player chooses whether to refund the wrong amount; paper state and customer reaction change.

**Spatial gate:** Read `.agents/skills/yen-visual-novel-staging/SKILL.md` and `docs/visual-novel/SCENE-SPATIAL-RULES.md` for floor/counter contacts, character placement, surface projection and 50/50 viewport QA. Do not invent image-based physical interactions. **Release gate:** all choice-driven scenes need coherent painterly context and visibly different outcomes; unresolved provisional water/guest art remains documented. See #220 → #221 → #222.