---
name: yen-sprite-style
description: Mandatory art-direction and release gate when creating, editing, importing, converting, animating or positioning Yên 2D character sprites, scene props, backgrounds and sprite sheets. Prevents style drift between painted chibi character sheets and scenery.
---

# Yên 2D Sprite Style Cohesion

## Non-negotiable principle

**A prop is not finished when it is a separate texture. It is finished when it looks as if the SAME illustrator painted it in the SAME world as the playable character.** Palette similarity, matching dimensions, correct alpha, smooth animation or passing unit tests do not prove style cohesion.

The canonical character references are `game/preview-2d/assets/sprites/barista.png` and `waiter.png`, with `guard.png`, `shipper.png` and `cat.png` as supplementary references. The character pack is 4×4 frames, each 256×320, RGBA, bottom-center aligned. See [the visual specification](references/STYLE_BIBLE.md).

## When to trigger

Run this skill **before** any change to:
- `game/preview-2d/assets/scene/**`, `assets/sprites/**`, old `cafe-*.webp` files, sprite import tooling, animation frames, or their scene composition;
- rendering code that changes sprite art style, visual scale, object perspective, camera/framing, alpha edges, compositing, depth or shadows;
- prompts that request a game prop, scenery, background, new character, or animation.

Do not wait until after code has been merged.

## Workflow

1. **Inspect first, don't infer style from CSS colors.** Read the canonical PNG role sheets. Display frame 0 (front), 4 (side), 8 (back) at the *actual in-game height*, beside the current background and a representative prop. Record silhouette, edge treatment, painterly texture, highlight direction, saturation, shading and camera projection. If the reference cannot be viewed, stop art generation and explain the blocker. You may still implement nonvisual infrastructure.
2. **Write a brief art contract before image generation:** subject, approximate human-relative size, viewpoint, materials, light source, brush/edge treatment, intended animations, separated transparency, pivot, collision footprint, overlap/occlusion and state. Use the approved character frame as a *visual input reference* when the image tool supports it. Text prompts alone are not a sufficient substitute.
3. **Produce an asset, not a flat mockup.** Generate or paint a matching-quality transparent RGBA prop (or coherent painted full background). Do not use programmatic gradients, geometric SVG primitives, stock icons, clip art, flat CSS or unreviewed vector art as a substitute for painterly game sprites. SVG is permitted for invisible masks, editor guides or interface controls, not as an unreviewed visible world prop.
4. **Make independent animation states and stable geometry.** Separate interactions into frames/layers (e.g. idle machine, steam; clean table, cup present/removed). Preserve constant canvas and feet/base pivot across frames, keep outlines inside frame bounds, bleed RGB into transparent alpha edges and check for halos. The collision shape matches *ground contact*, not the visible sprite bounding box.
5. **Create a side-by-side proof sheet** showing at least two character poses plus the new prop/background at *the same runtime scale*, once on a neutral checkerboard and once in the actual scene. Include native resolution and a small-phone crop. Place the evidence under `game/preview-2d/art-reviews/`, not just in a chat message. Use `art-review.html` for the current baseline inspection.
6. **Use the actual review authority.** Under explicit user delegation (2026-11-16: "ưu tiên tự duyệt artwork trước tôi sẽ kiểm tra sau"), Codex may visually assess and integrate assets before the owner inspects them. Record reviewerType=agent, reviewAuthority=user-delegated, ownerReviewPending=true, actual visual checks, source fingerprint and proof; do not claim owner approval. Without delegation, require a human reviewer. Check: shared brushwork/texture, outlines, light/shadow, perspective, saturation, proportions, alpha quality and scene integration. An agent must never self-certify “approved by owner.” Record the actual agent or human assessment for the particular revision, with reviewer type, date and proof in `assets/scene/art-style-policy.json` under `approvedArt`.
7. **Run gates:** `node game/preview-2d/tools/audit-art-style.mjs`, `node --test game/preview-2d/tests/art-style-policy.test.mjs`, the NPC/game contract tests, and build/visual checks at 1440×900 and 390×844. `--strict` also refuses the currently quarantined legacy-vector style debt.
8. **Ship a testable product.** Merge only after CI and user-visible side-by-side QA. Confirm the deployment's exact commit on production and provide its URL. If quota/deploy is blocked, report **not shipped**, never label a PR as production.

## Acceptance checklist

- [ ] Character PNG references physically inspected, not inferred from manifest.
- [ ] Prop/background painterly character-coherent at in-game scale, not just same palette.
- [ ] Consistent outline softness, hand-painted texture, ambient lighting and material response.
- [ ] Perspective and human-relative dimensions reviewed, with contact-point pivots.
- [ ] Independent animation frame/layer state, correct alpha edge and foot alignment.
- [ ] Contact-sheet proof exists; actual delegated agent or human review is recorded for this exact revision; owner review status remains explicit.
- [ ] Policy, CI, gameplay and browser checks pass; release commit verified in production.

## Existing known mismatch and remediation

The 10 files `assets/scene/{backdrop,door,counter,table,bench,plant,scooter,cup,cushion,book}.svg` were produced in PR #91 from simple SVG shapes and gradients **without a comparison to the real PNG character art**. They remain visibly unapproved and are frozen as a *legacy style-debt baseline* in the art policy. CI allows them unchanged to avoid breaking the current game, but **new world SVG props or modifications to these files fail**. Replace them, one by one, with actually matching painted PNG/WebP art and a reviewed evidence sheet; never “fix” merely by exporting the same SVG to PNG.

## Reference files

- [Style Bible and measurable visual checks](references/STYLE_BIBLE.md)
- [Art-style policy manifest](../../../game/preview-2d/assets/scene/art-style-policy.json)
- [Automated audit](../../../game/preview-2d/tools/audit-art-style.mjs)
- [Visual comparison board](../../../game/preview-2d/art-review.html)

**Important:** The Node audit checks provenance, art inventory, review evidence, legacy hashes and release prerequisites, **not actual perceptual similarity**. Only an actual human or explicitly delegated agent visual assessment can approve art; a green unit test cannot.
