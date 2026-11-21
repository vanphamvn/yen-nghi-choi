# Scene spatial rules · Một Tháng Không Yên

**Applies to:** All 90 visual-novel incidents. **Implementation reference:** \`tinh-huong/campaign/scene-composition.mjs\`. These are composition rules, not an animation request or a Phaser restart.

## Coordinate system

The playable world is the **upper 50% of portrait screen** and the left stage on landscape. Each layer declares an **anchor contact point** in percentages of the visible stage (x from left, y from top). Contact is **the feet/base**, not the sprite's visual center. Use a 4×4 character sheet's **first 256×320 cell** as the default front pose. The renderer's 4× background sizing and 4:5 crop prevent an entire sheet from appearing.

Surfaces:
- \`floor\`: standing people's shoes, free-standing counter/bench legs, puddles and floor hazards.
- \`counter\`: espresso-machine base, POS/receipts, tickets, serving trays, menu, cups within reach.
- \`table\`: table cups/books. The low round tea table is **not** the espresso station.
- \`held\`: only when the actor artwork actually depicts a held object; otherwise use a counter surface.

Each surface must be **drawn or part of the background**. A machine cannot belong to \`counter\` if the scene has no painted counter. No placement by arbitrary midpoint.

## Rendering layers and visual reading

| Depth | Content | Rule |
|---|---|---|
| 0 | Painted café backdrop | Room, lighting, wall and floor |
| 10–19 | Staff standing behind counter | Feet rest on rear floor; counter may occlude lower body |
| 20–29 | Fixed furniture | Painted counter has its foot/base on floor |
| 30–39 | Items on furniture | Machine, receipts, tickets have bases aligned to visible countertop |
| 40–49 | Physical incident | Spill/pitcher on floor; incident remains visible |
| 50–59 | Foreground guest and Cục Yên | Ground contact; credible scale; no floating or standing on counter |
| 60+ | Essential scene HUD | Exit, short day/time label, one clue, no duplicate copy |

Avoid piling people directly on top of the focus prop. Z-order alone cannot repair wrong geometry; adjust anchor and scale first.

## Day 1 contract

| Incident | Incident focus | Staff | Guest | Cục Yên | Furniture/surface |
|---|---|---|---|---|---|
| D01-01 | Three mixed-order paper tickets | Painted barista behind service counter | Takeaway guest waiting in front | Feet on floor beside guest | Painted service counter, coffee machine resting on top |
| D01-02 | Tipped pitcher, wet floor hazard | Barista approaching safe side of walkway | Guest near but outside wet footprint | Feet on floor near hazard | Counter left, spill only on floor |
| D01-03 | Incorrect receipt beside menu/POS | Barista at cashier counter | Guest across cashier side | Feet on floor beside counter | Painted counter, receipt/menu resting on top |

The repository currently has a painted \`barista.png\` sheet, a painted \`shipper.png\` character (used provisionally as a **takeaway customer** rather than inventing a non-existent generic guest illustration), a Cục Yên asset, a painted counter, and coffee props. The wet-floor illustration currently reuses a tinted painted shadow with a tipped pitcher; **replace it with genuinely painted puddle art when available**. Do not label either provisional role/prop as final custom illustration.

## Review checklist

1. At runtime scale, can we point to the exact line where **each person touches the floor**?
2. Does the café machine actually contact the counter surface, with no table-height mismatch?
3. Are service-side staff at least partly behind the counter and guests in front?
4. Does each incident have one clear sprite/object that explains what went wrong?
5. Do choice outcomes move/change related visual objects without contradicting the narrative?
6. Are all visible materials from verified painted assets and in a reasonably consistent brushwork/palette?
7. Does stage fit top 50% portrait and are all three answers visible without scrolling or clipping at 320px?
8. Did someone actually review screenshots? Record reviewer type, artifact URL, and any remaining debt.

## Regression rule: avoid giant barista and floating espresso (21/11/2026)

- **Rear staff must be smaller than front guest:** `staff.size <= guest.size * 0.92` in this Day 1 perspective. For D01-01 and D01-03, painted staff uses 20% width vs foreground guest 23%; their foot contact is at y≈71% (deeper floor) rather than y80%. A staff member away from the counter can be 21% with a more forward contact point.
- **Machine must touch the counter with its visible metal foot, not the transparent shadow:** artwork contact fraction = **0.90** of the 256×262 canvas. Verify `machine.getBoundingClientRect().top + 0.90 * machineHeight` matches `counter.getBoundingClientRect().top` within 1.5 CSS pixels. The former test using the element's anchor alone incorrectly passed even while the screenshot showed a gap.
- Test on **375×667**, **390×660**, **390×844**, **320×480** and desktop. The rule applies before declaring scene artwork finished.

## Painted silhouette and collision contract (D01-02 fix)

- **D01-01/D01-03:** Staff remains rear of counter. Never allow wood artwork to obscure the face; if crop changes, anchor foot position to the deeper floor plane instead of scaling barista into a giant.
- **D01-02:** Staff has stepped **out from behind** the service counter. Render staff as **foreground** immediately to the right of the shortened counter, then an independently visible floor-level Cục Yên toward the left, the wet footprint and tipped pitcher toward the center-right, and visitor at the far right. No overlapping of character painted silhouettes. The floor hazard must be legible without relying on labels.
- Compare actual painted alpha silhouettes: character element bounding boxes often contain transparent padding and are not sufficient evidence for a visible collision. For scene layout, maintain a visible horizontal gap between **staff–mascot** and **staff–customer**, and ensure the top-of-counter occlusion does not intersect the head or face of rear staff.
- Wet floor art is **transparent WebP/PNG** with an organic edge and reflective watercolor washes. Never use the old tinted rectangular shadow or any legible text inside the water. After cleaning or recovery, the spill is completely hidden, not a weakly visible colored patch. During unsafe/delayed responses, it remains visible.
- Ensure tipped pitcher is proportionate to the wet area, placed next to it, and does not overlap Cục Yên. Other Day 1 scenes retain their staged coffee/receipt/ticket relations and receive the same silhouette rules.
- **Owner-preview gate:** commit changes on PR #241, share a real successful Netlify Deploy Preview link, and wait for approval. Full QA, merge and production follow only after that approval.
