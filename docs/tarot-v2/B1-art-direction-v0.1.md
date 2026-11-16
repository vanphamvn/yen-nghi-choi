# Cục Yên Tarot · B1 art direction · Draft v0.1

**Status:** First visual direction for review (not signed off). **Epic:** [#9](https://github.com/vanphamvn/yen-nghi-choi/issues/9) · **B1:** [#10](https://github.com/vanphamvn/yen-nghi-choi/issues/10)  
**Other deliverables:** [78-card art brief matrix](./B1-78-card-scene-briefs.csv) · [Five original SVG sample concepts](./B1-five-art-concepts.svg) · [A1 UX spec](./A1-ux-flow-v0.1.md)

## Creative thesis: “Tarot có ý nghĩa, Cục Yên có biểu cảm.”

Make the cards unmistakably **Tarot first, Yên second**. Cục Yên is a storyteller appearing in each symbolic scene, not a replacement for the meaning of the card. A playful face may coexist with sorrow, uncertainty, rest, transformation, or disagreement. Never reduce every card to jokes and coffee mugs.

A customer should recognize each card by its scene and central symbols at the tiny on-phone size, even with names hidden. Every Major has a unique narrative; every Minor is differentiated by its rank **and** action. A repeated background, font, palette and framing creates consistency, not repeated icon-only graphics.

## Brand & visual tokens

| Role | Suggested token | Hex | Usage |
|---|---|---|---|
| Yên deep moss | \`--ink\` | \`#294B3B\` | Text, lines, active controls |
| Cream paper | \`--paper\` | \`#FCF7EA\` | Base card stock |
| Soft sage | \`--sage\` | \`#BFD2B7\` | Nature, quiet, supporting shapes |
| Honey gold | \`--gold\` | \`#E6C286\` | Major border, sun, hope, detail |
| Soft peach | \`--blush\` | \`#EBAE9D\` | Cục Yên cheeks, human warmth |
| Lake blue | \`--blue\` | \`#93BABF\` | Cups, water, reflection |
| Clay | \`--clay\` | \`#B57960\` | Wands, warmth, active energy |
| Lavender slate | \`--swords\` | \`#9F9BB9\` | Swords, mental air, rain |
| Leaf green | \`--coins\` | \`#8EA685\` | Pentacles, growth, tools |

- **Stroke:** round caps & joins, slight variation \`2.5–5 px\` at the artwork's 480px working width, dark moss outline. Avoid ultra-fine patterns that disappear on mobile.
- **Texture:** no external paper photography required. Draw modest dashes, 1%–2% decorative grain/lines via vectors; preserve text contrast and file size.
- **Type:** Noto Sans for card titles and reading; a calm serif for large numeral/title if desired. Keep Vietnamese Unicode composed text; prefer live text labels outside SVG art in final \`TarotCardFace\` so fonts render reliably across iOS/Android/Windows.
- **Logo:** do not distort or reconstruct official "yên / COFFEE & TEA" logo inside every card. Back design uses a **Cục Yên-specific insignia**, not the shop wordmark as decoration.
- **Mood:** warm, odd, gently self-aware; no 3D, stock emoji, generic AI gradient, ornate occult horror aesthetic or tarot template copy-paste.

## Canonical asset contract (handoff to A5)

- Master art viewport: **480 × 680** (illustration-only), transparent or cream background; safe zone of 24px all sides.
- Final full card container can use **480 × 800**, including external labels/number at top and bottom.
- Relative art URI: \`assets/tarot/v2/{cardId}.svg\` (or equivalent optimized .webp with matching \`artKey\`).
- Canonical stable IDs for 22 Major: \`major-00\` ... \`major-21\`. 56 Minor: \`wands-ace\`, \`wands-02\` ... \`wands-10\`, \`wands-page\`, \`wands-knight\`, \`wands-queen\`, \`wands-king\` and same for cups/swords/pentacles.
- Each illustration is **unique**, with source/author/license notes in manifest; do not copy a proprietary modern Tarot image.
- On reversal, only the **illustration image** rotates 180° if approved for UX; label, card number, upright/reversed badge and reading text must remain upright. Meaning changes from the \`orientation\` state, not from the SVG rotation.
- Alt text: short concrete description e.g. “Cục Yên cầm đèn tìm đường trên đồi tối” (not a prediction). Screen readers already have card name and role in nearby text.
- Export target: ideal SVG ≤25 KB and WebP ≤40 KB where complexity requires raster; test after real assets. Lazy load only cards revealed/soon to reveal; load errors show a purpose-built motif, not missing-image symbol.

### Card anatomy

\`\`\`text
┌─────────────────────────────────┐
│  MAJOR · IX            ✺         │  Live DOM labels, outside SVG
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │  UNIQUE STORY ILLUSTRATION  │ │
│ │  CỤC YÊN + SCENE SYMBOLS    │ │  480×680 artistic viewport
│ │  negative space around face │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│         ẨN SĨ / HERMIT          │  Live DOM label, legible at 320px
│        Xuôi • Tĩnh lại          │  Orientation & keyword
└─────────────────────────────────┘
\`\`\`

At 320px mobile, each of three spread cards will be small; keep title readable by moving names **under the art**, not shrinking to tiny lettering. A player can tap a card for a larger art detail view (future A3/A4 consideration).

## Character sheet: Cục Yên

Build the character from an imperfect round/leaf/potato-shaped body, two expressive eyes, peach cheeks, simple arms. Adapt pose without changing the core silhouette.

| Pose | Visual signals | Use cases |
|---|---|---|
| Curious / bắt đầu | lean forward, tiny knapsack, stepping foot | Fool, Page Wands |
| Confident / hành động | upright, raised arm, working tools | Magician, Chariot, 3/8 Pentacles |
| Contemplative / tĩnh | folded arms, downturned gaze, small lantern | High Priestess, Hermit, 4 Swords |
| Overloaded / rối | eyebrows, small bag straps, bent posture | 10 Wands, 9 Swords |
| Gentle / phục hồi | watering a sprout, softened eyes, open palms | Empress, Strength, Temperance |
| Serious / công bằng | small desk, scale, level eyes | Justice, King Swords |
| Transition / buông | carries a dead leaf to compost, new bud appears | Death, 8 Cups |
| Grieving / thất vọng | slumped at spilled cups, un-spilled cups nearby | 5 Cups, 3 Swords |

Do not portray \`Death\` as literal death, \`Devil\` as moral evil in a person, or \`Tower\` as imminent disaster. These cards illustrate *archetypal meanings*, not literal future events.

## Suits system

| Suit | Element shorthand | Motif | Editorial constraint |
|---|---|---|---|
| **Gậy / Wands** | fire / initiative | Branches, torches, sunset, climbing/working | Not every Wands card = flames; numbered scenes show action/conflict/effort. |
| **Cốc / Cups** | water / emotion | Distinct ceramic cups, waves, puddles, rainbows | Preserve cup counts when semantically meaningful (3, 5, 8, 10). |
| **Kiếm / Swords** | air / thought | Rounded safe-edged swords, ribbons, clouds, shadow | Even sorrowful imagery remains friendly, never graphic injury. |
| **Tiền / Pentacles** | earth / practical life | Coins/stamps, pottery wheels, gardens, masonry | Work and resources matter more than displaying money alone. |

**Court roles:** Page = exploring/learning, Knight = movement, Queen = mastery through care, King = stewardship. They each need differentiated **pose + setting + object**, not crowns alone.

## Five scene directions to validate early

| Card ID | Composition | Required meaning | Cục Yên expression | Avoid |
|---|---|---|---|---|
| \`major-00\` Fool | At the edge of a soft hill, Cục Yên takes a first step with a one-stick knapsack; small sprout and sunrise | Beginnings, possibility, openness | Wide-eyed hopeful | Falling off a real cliff or recklessness as fate |
| \`major-09\` Hermit | Evening hill; Cục Yên with a lantern; one clear pool of warm light and distant star | Solitude, searching for wisdom | Calm, alert | Creepy darkness |
| \`major-13\` Death | Fallen leaf turning to compost, new sprout and changing season; Cục Yên gently plants | Endings and transformation | Tender, steady | Skull and fatalistic prophecy |
| \`swords-03\` Three of Swords | A **paper** heart with three symbolic paper swords; Cục Yên holds glue and tape | Hurt, grieving, acknowledging pain | Sad but supported | Blood or bodily harm |
| \`pentacles-08\` Eight of Pentacles | Cục Yên chisels/stamps coin #8 beside seven coins already completed, little workbench | Practice, craft, focused effort | Concentrating | 8 generic identical circles with no action |

The attached SVG sheet is **rough visual research** rather than production art. Evaluate narrative clarity at 90px card width first.

## 78-scene matrix contract

The CSV lists all canonical \`cardId\`, \`arcana\`, \`suit\`, \`rank\`, \`nameVi\`, \`visualIdea\`, \`requiredSymbols\`, \`mood\`, and \`status\`. This is the **art storyboard inventory** for B2/B3, not a claim that 78 graphics are produced.

### Art acceptance checklist

- [ ] B1 tone / tokens approved by owner.
- [ ] Cục Yên character silhouette consistent in five prototypes.
- [ ] Five prototypes understandable without reading the title at thumbnail width.
- [ ] 78 scene concepts sufficiently distinct to illustrate individually.
- [ ] Font display, numbers and reversed label positions approved on 320–430px layouts.
- [ ] File contract and fallback approved with A5.
- [ ] Work split B2/B3 scheduled only after visual review.

**Creative references:** Rider–Waite–Smith structural terminology and symbolic meanings, not direct copies of illustrations: [RWS card inventory](https://learntarot.org/owdesc.htm), [four suits and court hierarchy](https://cards-tarot.com/en/articles/how-many-cards-in-a-tarot-deck/).
