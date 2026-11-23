# ChatGPT image prompt pack: art gaps for Days 2–30

Prompts for generating the missing art for "Một Tháng Không Yên" with ChatGPT image generation.
Source data: `docs/visual-novel/episodes.json` (each incident's `visual.establishing`), the Day 2 gap
analysis in `d02.md` and the style gate in `.agents/skills/yen-sprite-style/SKILL.md`.

The Day 2 brief `d02.md` (same folder) lands with the Day 2 pull request (VN-P01, branch `vn/d02`).

Days 3–30 are not written yet, so their lists come from the planned incident descriptions. When a day's script is
written, its art director pass may add or drop items. Treat this as the starting library, not the final list.

**Generated art is not approved art.** Every file still goes through section 6 of `d02.md`: provenance
recorded, optimised, contact sheet, agent review marked `ownerReviewPending: true`, owner inspection later.

---

## 0. How to run it in ChatGPT

1. **New chat per asset group** (one location, one character or one prop family). Long chats drift in style.
2. **Attach the reference images to the first message of every chat.** A text prompt alone does not hold the style.
   - Always: `game/preview-2d/assets/sprites/barista.png` (crop frames 0, 4 and 12 into one image if the full sheet
     confuses it) and `lab/assets/room-backdrop.jpg`.
   - Props: also `game/preview-2d/assets/scene/counter-painted-v1.webp` and
     `lab/assets/sprites/collections/assets/coffee-tea/v2-coffee-grinder.webp`.
   - Characters: also `waiter.png` frame 0 and `shipper.png` frame 0.
   - Cục Yên: `assets/cuc-yen/sprites/front.webp`.
3. Paste the **master style block** (section 1) first, then one template from section 2 with the subject filled in from
   sections 3–5.
4. **States of the same object** (dry → wet, plugged → unplugged): generate the first state, then in the same chat
   ask *"Edit this image. Change only: … Keep the object, framing, canvas, light and outline identical."*
   Generating each state from scratch gives a different object each time.
5. **Sizes ChatGPT gives:** 1536×1024, 1024×1024, 1024×1536.
   - Backgrounds: ask for 1536×1024, then crop to 1536×960 (16:10) and scale to 1586×992.
   - Props: 1024×1024, transparent background.
   - Characters: 1024×1536, transparent background, one pose per image; scaled into a 256×320 cell later.
6. **No readable text in any image.** ChatGPT misspells Vietnamese. Phone screens, receipts, boards, labels and
   contracts get blank or abstract marks; the game draws real text on top.
7. **Name and record every download** before using it:
   `tinh-huong/assets/source/<asset-id>__<state>.png`, and note in `docs/visual-novel/art-manifest.json`:
   `origin: "generated"`, `author: "ChatGPT image generation (OpenAI)"`, the model name ChatGPT shows, the date, the
   prompt text and the reference files attached. Check OpenAI's current terms for the licence line; the owner
   confirms it.
8. Then: `node tools/optimize-yen-art.mjs` (`--alpha` for props and characters), contact sheet, agent review.

---

## 1. Master style block (paste first in every chat)

```text
You are painting assets for a cozy Vietnamese coffee-and-tea shop called Yên, for a mobile visual novel.
The attached images are the canonical style. Match them exactly: same illustrator, same world.

Style: hand-painted chibi storybook illustration. Warm painterly fills with visible paper and brush texture.
Soft, slightly irregular warm-brown outlines (never black, never a uniform vector stroke). Gentle cel shading plus
soft ambient occlusion. Soft warm-brown contact shadows under every foot and object base.
NOT: flat vector, SVG look, gradients, 3D render, photo, pixel art, anime screenshot, clip art, stock icon.

Palette anchors: paper cream #f7f3e9, deep green #243c35, leaf green #2e5a46, warm honey wood, sage wainscot.
Interior lamps are always warm. Rain, night and shade are cool blue-grey only outside and in reflections.
Water is a translucent cool tint with small white highlights, never opaque blue.

Light: one warm key light from the upper left for interiors.
Camera: frontal 2.5D at standing eye level, like the attached room. Horizon at about 38% of image height.
Wall-to-floor line at about 55–62% of image height. Floor tops visible, no top-down views, no fisheye.

Characters: chibi proportions exactly like the attached barista (large head, about 2.5 heads tall, simple dot-and-
line facial features, rosy cheeks). Full body, feet visible, standing on an implied floor line.

Never put any readable text, letters, numbers, logos of real brands, watermarks or signatures in the image.
Never paint people into backgrounds.
Keep it gentle and safe for all ages: accidents are shown by posture and props, never injury or blood.

Confirm you understand, then wait for the asset request.
```

---

## 2. Templates

### 2a. Background

```text
BACKGROUND: <ID> — <variant>
Paint a full-bleed background, 1536×1024, landscape, no people, no text.
Scene: <scene description>.
Time and weather: <time / weather / light>.
Story focus (must be clearly visible and sit in the CENTRAL HALF of the width, between 25% and 75%, because the
game crops this to a 4:5 portrait frame): <focal hazard or detail>.
Keep the floor band from 65% to 97% of the height mostly clear: characters will stand there.
Same camera height, horizon and wall/floor line as the attached room.
```

For a variant of a background already made, use the edit pattern:
`Edit this image. Change only: <weather/time/detail>. Keep architecture, camera, furniture positions identical.`

### 2b. Prop with states

```text
PROP: <ID>
Paint one isolated object on a fully transparent background, 1024×1024, centred, base touching the bottom-centre,
no floor, no shadow except a soft contact shadow directly under the base, no text.
Object: <object description>.
Real-world size: <size compared with the barista>. Seen from the same frontal eye-level camera as the room.
State 1 of <n>: <state>.
```
Then, for each further state: `Edit this image. Change only: <state change>. Keep everything else identical.`

### 2c. Character pose

```text
CHARACTER: <ID> — pose "<pose>"
Paint one full-body chibi character on a fully transparent background, 1024×1536, feet at the bottom-centre,
same proportions, outline and face style as the attached barista. No text, no props unless listed.
Character: <who they are, clothing, hair, age, distinguishing detail>.
Pose and expression: <pose description>.
```
Then for the same character's next pose: `Same character, same outfit and colours. New pose: <pose>.`

---

## 3. Shared library

Build these first: most days reuse them. IDs match what the stager will reference.

### 3a. Backgrounds (9 locations)

| ID | Scene description (paste into 2a) | Variants (time / weather / focus) | Used on days |
| --- | --- | --- | --- |
| `bg-counter` | Behind-the-bar view of Yên's service counter: wooden counter across the middle (top at ~62–68% height), espresso machine and grinder on it, a ticket rail above, a round wall clock, shelves of jars behind, a wall power outlet low on the left wall next to the counter end | `day` (sunny), `rain-leak` (overcast window, water streak running down the left wall toward the outlet — focus), `evening-closing` (amber dimmed lamps, chairs half up, broom leaning by door), `outage` (all lamps off, grey daylight from window, machine indicator blinking), `rush` (ticket rail overflowing with blank paper slips) | 2, 3, 7, 9, 10, 11, 15, 22, 25, 26, 27, 30 |
| `bg-seating` | Customer seating area: round wooden tables and chairs, a reading corner with bookshelf, plants, arched window | `day`, `after-school` (afternoon light, two table zones clearly separated), `evening`, `crowded-extra-tables` (extra chairs narrowing the aisle to the door — focus), `birthday` (balloons and garland strung across the walkway — focus) | 4, 6, 12, 14, 16, 21, 23, 25, 26, 28 |
| `bg-porch` | Front of the shop seen from the street side under the eaves: wooden porch deck as the floor, glass front door centre-left, a hanging wooden shop signboard (no letters), corrugated awning along the top, 2–3 front steps, two porch chairs | `morning-rain` (diagonal rain, awning seam dripping onto chairs, wet sheen on steps — focus), `harsh-sun` (hard noon sun on the deck, wilted potted plant), `storm-wind` (signboard swinging on taut ropes, leaves flying — focus), `drain-flood` (leaves clogging the gutter grate, water rising toward the door — focus), `night` (warm light from the door, dark street) | 2, 6, 17, 20 |
| `bg-garden` | Shop's side courtyard with outdoor tables under a timber pergola with a hanging lamp and visible cable, a gutter and drain channel, low fence to the neighbour's yard at the right | `rain-leak` (drips running along a beam toward the lamp and cable — focus), `rain-chairs` (water falling onto the outdoor set), `runoff` (water flowing from the drain toward the neighbour's fence — focus), `harsh-sun` (sun stripe across chairs, wilting plants), `storm` (tablecloths lifted, chairs shoved), `evening-smoke` (a thin smoke trail drifting across from one corner toward other tables), `party-afternoon` (birthday table, balloons), `party-aftermath-night` (paper cups and burst balloons on the ground, sorting bins nearly full) | 13, 17, 18, 20, 28 |
| `bg-backdoor` | Back of the shop: half-open wooden back door at the right, a storeroom shelf with dry sacks and jars at the left, a short prep bench across the middle | `evening-rain` (rain and dark street through the door, wet footprints at the threshold, warm pendant lamp — focus D02-03), `day-delivery` (daylight, open fruit crate on the bench), `day` | 2, 5, 19, 29 |
| `bg-prep` | Back prep area: tall fridge with a small temperature display (blank digits), ice machine with ice bin, a hand-wash sink, a labelling station with tape and marker, steel shelving | `day`, `outage` (dark, fridge silent, emergency daylight), `alarm` (fridge display glowing red-amber — focus), `ice-melting` (water pooling at the bottom of the ice bin — focus), `sink-blocked` (crates stacked half across the path to the sink — focus) | 5, 8, 10, 17, 19, 24, 27 |
| `bg-kids-corner` | Small play corner inside near the side exit: soft mat, low shelf of toys, a child-height table with a sharp corner close to the walkway | `day`, `crowded` (toys spread across the walkway to the exit — focus) | 6, 21 |
| `bg-lane` | The street lane outside: Yên's gate and porch on the left, the neighbour's house gate on the right, scooters parked along the curb | `day` (a scooter parked across the neighbour's gate — focus), `night` (neighbour's windows going dark, warm light still from Yên) | 14, 18 |
| `bg-backoffice` | Tiny staff nook: small desk with a cash drawer, a ledger, a POS terminal, a shift board on the wall (blank grid), a coat hook with an apron | `day`, `evening` | 7, 11, 19, 24, 25, 29 |

### 3b. Recurring cast (new characters)

Existing sheets cover the barista (main staff), waiter (co-worker), shipper (courier), guard and cat. New:

| ID | Character (paste into 2c) | Poses |
| --- | --- | --- |
| `guest-adult-a` | Office worker in her late 20s, cream blouse, green tote bag, short bob | waiting, pointing (at a cup), concerned, relieved (small smile, hand on chest — calm, not cheering), startled (leaning back, eyes open wide), sheltered (arms hugging herself, damp shoulders) |
| `guest-adult-b` | Man in his 40s, rolled-sleeve shirt, glasses, umbrella hooked on arm | waiting, impatient (checking watch), slipping (one foot sliding, arms out — no fall), seated, holding phone up to film |
| `guest-elder` | Kind grandmother, áo bà ba in soft blue, cloth bag | seated, dizzy (hand to forehead, sitting down), grateful |
| `regular-uncle` | Regular customer "chú Tư", 60s, flat cap, checked shirt, loyalty card in hand | friendly, asking-favour, embarrassed (forgot wallet), happy-return (Day 30 version with a small change, e.g. new scarf) |
| `students-group` | Four high-school friends in white shirts and navy, backpacks; make a group image and also each one alone | laughing-loud, splitting-bill (phones out), arguing over cards, worried friend (patting pockets) |
| `child` + `parent` | Little boy about 5 with a toy car; his mother in casual clothes | child-crying (rubbing forehead), child-running, parent-rushing, parent-calling (hand cupped to mouth), parent-relieved |
| `trainee` | New trainee barista, teen, same apron as the barista, oversized cap | confused (two bottles in hands), stamping (holding a stamp), tired, focused |
| `supplier` | Supplier rep, polo shirt, clipboard with blank paper | presenting (holding out a sheet), waiting, nodding |
| `inspector` | Food-safety inspector, neat jacket, clipboard, ID lanyard (blank badge) | waiting, asking, writing |
| `neighbour` | Middle-aged neighbour woman, house clothes, walking a scooter | blocked (scooter stuck at gate), annoyed (hands on hips), closing-door, reconciled |
| `filmer` | Young content creator with phone gimbal | filming (phone raised), showing phone screen, apologetic |
| `delivery-pitch` | Delivery-app sales rep with branded-colour jacket (no logo), tablet | presenting, waiting |

Staff poses to add to `barista.png` / `waiter.png` (as single 256×320 cells): worried, calling-turns (one hand raised,
open palm), flustered, watching, tired, relieved-calm (soft smile, exhale — use this instead of the cheering frame 14
after anything dangerous), pointing, apologising (small bow), on-phone.

Cục Yên (mascot) gaps only: `worried`, `investigating` (leaning, magnifier), `relieved-calm`. The other 21 sprites
already exist in `assets/cuc-yen/sprites/`.

### 3c. Shared props (reused across days)

| ID | Object | States (one file each) | Days |
| --- | --- | --- | --- |
| `wet-floor-sign` | Yellow A-frame caution sign with a simple slipping-figure pictogram (no letters), knee-high to the barista | folded, placed | 1, 2, 13, 20, 27 |
| `outlet-wall` | Wall power outlet with a plugged cable, low on a wall | dry, wet (water streak above), sparking (small white-yellow spark, no fire), power-off (cable unplugged and coiled), cordoned (two chairs in front) | 2, 16 |
| `power-strip-charger` | Power strip on a table edge with phone chargers | normal, cup-next-to-it, cup-moved-away | 16 |
| `delivery-box` | Cardboard supply carton, about knee height | dry, wet (one soaked dark corner, sagging flap), opened, set-aside | 2, 5, 19 |
| `supply-bags` | Kraft paper sacks of flour/sugar | dry, damp (water marks), sorted (labelled with blank tags), mixed-on-shelf | 2, 5 |
| `paper-slip` | Receipt / delivery slip / order ticket | blank, signed (scribble), noted (circled mark), piled | 2, 7, 9, 15, 22, 24 |
| `phone-hand` | A hand holding a phone, screen area left as a flat light rectangle for the game to draw on | held-low, held-up-filming, showing-screen | 4, 10, 12, 16, 21, 23 |
| `ice-bin` | Ice bin / cooler | full, low, melting (water at the bottom) | 5, 17, 27 |
| `fridge-tray` | Tray of milk cartons with blank tape labels | fresh, faded-labels, odd-batch (one carton visibly different), separated | 5, 10, 19, 27 |
| `cup-pair` | Two iced drinks in plastic cups with blank name stickers | matching, swapped-labels, corrected | 3, 7, 9 |
| `loyalty-card` | Small wooden-texture stamp card with 8 circles, stamp marks as leaf prints | 7-stamps, 8-stamps, smudged, two-cards | 15, 22 |
| `stroller` | Baby stroller, folded and open | open-in-doorway, folded-aside | 6 |
| `backpack` | Student backpack | under-chair, at-counter (claimed) | 4 |
| `cash-ledger` | Open cash book beside a POS terminal (blank screen) | match, mismatch (one line circled), closed | 7, 26 |
| `clock-wall` | Round wall clock, hands only | morning, noon, near-closing | 3, 9, 11, 14 |
| `broom` | Broom and dustpan | leaning, sweeping | 3, 28 |
| `chairs-outdoor` | Outdoor wooden chair set | dry, wet, shoved-by-wind, stacked | 2, 13, 20 |
| `syrup-bottle` | Syrup bottle with pump and a measuring line on a cup | normal, over-poured (darker drink) | 8, 9 |
| `board-game` | Open board game box with one missing piece slot, cards | complete, missing-piece, cards-on-table | 14 |
| `balloons-garland` | Balloons and paper garland | hung-across-walkway, moved-aside, burst-on-ground | 28 |
| `bins-sorting` | Three sorting bins (colours only, no labels) | normal, nearly-full, sorted | 28 |

---

## 4. Day by day

Each line lists only what that day adds or the variant it needs. "Lib:" means already in section 3.

### Chapter 1

**D02 Mưa đầu mùa** (full detail in `d02.md`)
- Backgrounds: `bg-porch/morning-rain` (D02-01, crop focus centre-top), `bg-counter/rain-leak` (D02-02, focus left third),
  `bg-backdoor/evening-rain` (D02-03, focus right half).
- Props: Lib `wet-floor-sign`, `outlet-wall` (all 5 states), `chairs-outdoor` (wet, stacked), `delivery-box`,
  `supply-bags`, `paper-slip`. New: `awning-tarp` — an old green tarp clipped under the awning edge: states
  `none`, `tarp-sagging` (bowed with collected water, dripping). New: `rain-fx` — a transparent overlay of diagonal
  rain streaks, 1536×1024, to layer over any background.
- Characters: `guest-adult-a` (huddled, sheltered), `guest-adult-b` (slipping, seated), staff worried / calling-turns /
  flustered / relieved-calm; `shipper` new poses: carrying-wet-box (rain on cap), waiting, nodding, leaving.

**D03 Một người trực quầy**
- Backgrounds: `bg-counter/rush` (D03-01), `bg-counter/day` (D03-02), `bg-counter/evening-closing` (D03-03, front door visible).
- Props: Lib `clock-wall`, `cup-pair`, `broom`. New: `ticket-rail` — order rail with blank slips: `normal`, `overflowing`.
- Characters: `guest-adult-a` + `guest-adult-b` reaching for a cup (pose "reaching-hand"); `guest-adult-b` at the door
  at closing (pose "hopeful-at-door"); staff tired.

**D04 Giờ tan trường**
- Backgrounds: `bg-seating/after-school` (all three).
- Props: Lib `phone-hand`, `backpack`. New: `coins-cash` — small coins and notes on a table: `spread`, `stacked`.
  New: `sound-waves-fx` — soft painted curved lines showing loudness (transparent overlay): `loud`, `calm`.
- Characters: `students-group` (splitting-bill, laughing-loud), new `guest-reader` (young man reading a book, seated,
  then wincing at noise, then relieved-calm).

**D05 Ngày nhập nguyên liệu**
- Backgrounds: `bg-prep/day` (D05-01, D05-03), `bg-backdoor/day-delivery` (D05-02).
- Props: Lib `ice-bin` (low), `fridge-tray` (faded-labels, fresh). New: `fruit-crate` — open crate of pineapples:
  `mixed` (sound and bruised fruit with clear dark bruises), `sorted`. New: `stock-board` — small whiteboard with blank
  bar marks: `low`, `updated`.
- Characters: `supplier` presenting; staff checking (pointing).

**D06 Chủ nhật có trẻ nhỏ**
- Backgrounds: `bg-seating/day` with `bg-kids-corner/day` (D06-01), `bg-kids-corner/crowded` (D06-02), `bg-porch/night` or
  door-side of `bg-seating` (D06-03).
- Props: Lib `stroller`. New: `corner-guard` — soft rubber corner guard on a table edge: `absent`, `fitted`.
  New: `water-cup-shaking` — glass of water on table: `still`, `wobbling` (tiny motion lines).
- Characters: `child` + `parent` (all poses); `guest-adult-b` pushing the door against the stroller.

**D07 Khép tuần đầu**
- Backgrounds: `bg-backoffice/evening` (D07-01, D07-03), `bg-counter/day` (D07-02).
- Props: Lib `cash-ledger`, `paper-slip`, `cup-pair` (one forgotten cup). New: `shift-board` — wall grid with many
  empty cells (no text): `empty`, `filled`.
- Characters: `waiter` new pose resting-exhausted (sitting on a stool); staff on-phone.

### Chapter 2

**D08 Khách muốn tự chọn**
- Backgrounds: `bg-counter/day` (all three; D08-02 close on the prep tray).
- Props: Lib `syrup-bottle`. New: `recipe-board` — menu card with sweetness level bars, no text: `default`.
  New: `allergen-tray` — tray with nuts and dairy touching shared tools: `touching`, `separated` (clean tools, separate
  board). New: `personal-bottle` — reusable bottle with a stained rim: `dirty-rim`, `washed`.
- Characters: `guest-adult-a` pointing at the board; `guest-elder` asking; new `guest-allergy` (young woman holding a
  small allergy card, blank).

**D09 Cao điểm trưa**
- Backgrounds: `bg-counter/rush`.
- Props: Lib `paper-slip` (two tickets same number), `clock-wall` (noon), `syrup-bottle` (over-poured).
  New: `queue-number-machine` — small ticket dispenser with a stuck slip: `stuck`, `cleared`.
- Characters: queue of `guest-adult-a`, `guest-adult-b`, `regular-uncle` in impatient poses.

**D10 Ngày cúp điện**
- Backgrounds: `bg-counter/outage` (D10-01, D10-03), `bg-prep/outage` (D10-02).
- Props: Lib `fridge-tray`, `phone-hand` (showing a payment code as a plain square pattern). New: `pos-terminal` —
  card/QR terminal: `on`, `dark`, `offline` (small amber light). New: `outage-log` — clipboard on the fridge with a
  blank time table: `blank`, `filled`.
- Characters: staff worried, on-phone; `guest-adult-b` holding phone waiting.

**D11 Thiếu người một buổi**
- Backgrounds: `bg-counter/rush` (D11-01, D11-03), `bg-prep/day` (D11-02).
- Props: Lib `clock-wall`. New: `apron-hook` — empty apron hanging on a hook: `empty-hook`, `apron-taken`.
  New: `twin-bottles` — two near-identical syrup bottles with blank labels: `confusing`, `colour-tagged`.
- Characters: `trainee` confused / focused; barista + waiter tired.

**D12 Một sao trên mạng**
- Backgrounds: `bg-counter/day` (D12-01), `bg-backoffice/evening` (D12-02, D12-03).
- Props: Lib `phone-hand`. Screens are drawn by the game; paint only devices with blank screens. New: `laptop` —
  open laptop on the desk, blank screen: `on`.
- Characters: `guest-adult-b` pointing at his cup and phone (pose "complaining-calm"); onlookers `guest-adult-a`.

**D13 Mái hiên bị dột**
- Backgrounds: `bg-garden/rain-leak` (D13-01), `bg-garden/rain-chairs` (D13-02), `bg-garden/runoff` (D13-03).
- Props: Lib `chairs-outdoor`, `wet-floor-sign`. New: `pergola-lamp` — hanging lamp with cable: `dry-lit`,
  `drip-on-cable` (water beads), `switched-off`. New: `drain-channel` — courtyard drain: `flowing-to-neighbour`,
  `diverted` (sandbag or board redirecting).
- Characters: staff watching / relieved-calm; `neighbour` annoyed at the fence.

**D14 Đêm chơi board game**
- Backgrounds: `bg-seating/evening` (D14-01, D14-02), `bg-lane/night` (D14-03).
- Props: Lib `board-game`, `clock-wall` (near-closing). Reuse `sound-waves-fx`.
- Characters: `students-group` arguing; new `guest-gamers` pair (two young adults, one searching under the table).

### Chapter 3

**D15 Khách quen và ưu tiên**
- Backgrounds: `bg-counter/day`.
- Props: Lib `loyalty-card` (7-stamps, 8-stamps), `paper-slip`, `queue-number-machine`. New: `tab-clip` — a hanging
  bill clip with an unpaid slip: `hanging`, `settled`.
- Characters: `regular-uncle` (friendly, asking-favour, embarrassed); queue guests watching.

**D16 Những chiếc điện thoại**
- Backgrounds: `bg-seating/day`.
- Props: Lib `phone-hand` (held-up-filming), `power-strip-charger`. New: `wallet` — `missing` (empty pocket gesture
  only), `found`.
- Characters: `filmer` filming; `guest-adult-a` noticing camera (covering face); `students-group` worried friend.

**D17 Trưa nóng như rang**
- Backgrounds: `bg-garden/harsh-sun` (D17-01), `bg-prep/ice-melting` (D17-02), `bg-seating/day` (D17-03, shaded corner).
- Props: Lib `ice-bin` (low). New: `sun-umbrella` — garden parasol: `closed`, `open-shade`. New: `water-glass-fan` —
  glass of water and a hand fan: `offered`.
- Characters: `guest-adult-a` shielding eyes; `guest-elder` dizzy, then grateful; staff offering water.

**D18 Chuyện với hàng xóm**
- Backgrounds: `bg-lane/day` (D18-01), `bg-lane/night` (D18-02), `bg-garden/evening-smoke` (D18-03).
- Props: New `speaker` — small indoor speaker: `loud` (with `sound-waves-fx`), `low`. New `no-smoking-area` — a sand
  ashtray stand moved to a far corner: `near-tables`, `moved-away`.
- Characters: `neighbour` (blocked, closing-door, reconciled); `guest-adult-b` moving scooter; new `guest-smoker`
  (man with cigarette, seated, then walking to the corner).

**D19 Giá nguyên liệu đổi**
- Backgrounds: `bg-backoffice/day` (D19-01), `bg-backdoor/day` (D19-02), `bg-prep/day` (D19-03).
- Props: Lib `fridge-tray` (odd-batch). New: `price-quotes` — two quotation sheets side by side, one with a red circle,
  no text: `compare`. New: `ingredient-shelf` — shelf with one empty bottle slot: `gap`, `restocked`.
- Characters: `supplier` presenting; staff thinking.

**D20 Cơn giông lớn**
- Backgrounds: `bg-porch/storm-wind` (D20-01), `bg-garden/storm` (D20-02), `bg-porch/drain-flood` (D20-03).
- Props: Lib `chairs-outdoor` (shoved-by-wind, stacked), `wet-floor-sign`. New: `signboard-hanging` — wooden sign on
  ropes (no letters): `swinging`, `taken-down`. New: `drain-grate` — `clogged-leaves`, `cleared`.
- Characters: `guest-adult-a` standing up startled; staff securing sign (pose "reaching-up").

**D21 Ngày quá đông**
- Backgrounds: `bg-seating/crowded-extra-tables` (D21-01, D21-02), same with crowd silhouettes as a separate
  foreground overlay (D21-03).
- Props: Lib `phone-hand` (several, held-up-filming). New: `crowd-foreground` — transparent overlay of blurred
  backs of heads and shoulders at the bottom edge: `dense`, `parted`.
- Characters: `parent` calling; `child` found; `guest-elder` needing help (sitting down, hand to forehead);
  companion signalling.

### Chapter 4

**D22 Thẻ mộc gặp trục trặc**
- Backgrounds: `bg-counter/day`.
- Props: Lib `loyalty-card` (two-cards, smudged), `paper-slip`. New: `gift-shelf` — little reward shelf: `stocked`,
  `empty`. New: `stamp` — wooden stamp and ink pad: `idle`, `in-hand`.
- Characters: `regular-uncle`, `guest-adult-a`; `trainee` stamping.

**D23 Yên xuất hiện trên mạng**
- Backgrounds: `bg-seating/day` (D23-01), `bg-backoffice/evening` (D23-02, D23-03).
- Props: Lib `phone-hand`. New: `tripod-phone` — phone on a small tripod beside a table: `recording`, `turned-away`.
  New: `storyboard` — cork board with two rows of blank photo cards: `side-by-side`. Social pages and the fake logo
  are drawn by the game, not painted.
- Characters: `filmer` (filming, apologetic); `guest-adult-b` showing phone screen.

**D24 Khách kiểm tra ghé quán**
- Backgrounds: `bg-backoffice/day` (D24-01, D24-02), `bg-prep/sink-blocked` (D24-03).
- Props: Lib `paper-slip`. New: `records-folder` — ring binder with tabbed blank pages: `neat`, `misfiled` (papers
  sticking out between menus). New: `thermometer-log` — fridge thermometer and log sheet: `ok`. New: `crates` —
  stacked plastic crates: `blocking-sink`, `moved`.
- Characters: `inspector` (all poses); staff calm-showing; waiter needing the sink.

**D25 Hai người không cùng nhịp**
- Backgrounds: `bg-counter/rush` (D25-01), `bg-backoffice/day` (D25-02), `bg-seating/day` (D25-03).
- Props: Lib `cup-pair` (both staff holding one). New: `assignment-board` — small whiteboard with smudged, erased
  marks: `smudged`, `rewritten`. New: `handover-log` — notebook open on a blank page: `blank`, `filled`.
- Characters: barista and waiter both reaching for the same cup; waiter looking away (pose "avoiding-eyes");
  `guest-adult-a` overhearing.

**D26 Đêm đông không ngờ**
- Backgrounds: `bg-counter/rush` (D26-01), `bg-seating/crowded-extra-tables` (D26-02), `bg-counter/evening-closing` (D26-03).
- Props: Lib `paper-slip` (piled covering the bar), `cash-ledger`. New: `change-tray` — coin tray: `empty`, `refilled`.
  New: `takeaway-stack` — stack of paper cups: `last-few`, `restocked`.
- Characters: `students-group` asking to join tables; `guest-adult-b` paying.

**D27 Máy móc phản đối**
- Backgrounds: `bg-counter/day` (D27-01), `bg-prep/ice-melting` (D27-02), `bg-prep/alarm` (D27-03).
- Props: Lib `ice-bin` (melting), `fridge-tray`, `wet-floor-sign`. New: `grinder-jam` — use the existing
  `v2-coffee-grinder` as input: `normal`, `jammed` (beans stuck in hopper, small amber warning light), `unplugged`.
- Characters: staff worried / on-phone; Cục Yên investigating.

**D28 Buổi sinh nhật nhỏ**
- Backgrounds: `bg-seating/birthday` (D28-01), `bg-garden/party-afternoon` (D28-02), `bg-garden/party-aftermath-night` (D28-03).
- Props: Lib `balloons-garland`, `bins-sorting`, `broom`. New: `birthday-cake` — small cake with candles: `lit`, `served`.
- Characters: `child` running (plus two more party kids, new `party-kids`), `parent`, `guest-reader` glancing over.

### Chapter 5

**D29 Chọn cách lớn lên**
- Backgrounds: `bg-counter/day` (D29-01), `bg-backoffice/day` (D29-02, D29-03).
- Props: New `menu-thick` — thick menu folder: `thick`, `trimmed`. New `contracts-pair` — two contract sheets (blank
  lines) with two ingredient trays of different quality: `compare`. New `calendar-full` — wall calendar with every cell
  filled by colour blocks.
- Characters: `delivery-pitch` presenting; `supplier`; barista and waiter discussing (poses "thinking",
  "pointing-at-paper").

**D30 Đêm cuối của tháng**
- Backgrounds: `bg-counter/evening-closing` (D30-01, D30-03) plus two state variants of the same image:
  `repaired` (sign, corner guard, fixed outlet visible) and `neglected` (old hazards still visible). D30-02 uses
  `bg-seating/evening`.
- Props: reuse earlier fixed / unfixed states (`outlet-wall`, `corner-guard`, `wet-floor-sign`, `drain-grate`).
  New: `closing-door` — front door from inside: `open`, `half-closed`, `closed` with warm night light.
- Characters: return poses for `regular-uncle`, `guest-elder`, `child` + `parent`, `neighbour` (happy-return), staff
  relieved-calm, Cục Yên waving.

---

## 5. Suggested order (most reuse first)

1. Master style test: one prop (`wet-floor-sign`) and one pose (`guest-adult-a` waiting). Put them next to the
   barista on `room-backdrop.jpg` and check style before going further.
2. The 9 base backgrounds (`day` variants), then their variants by edit.
3. Recurring cast, base pose first, then poses by edit.
4. Shared props (section 3c).
5. Per-day new props, one day at a time, in story order.

Rough count: 9 backgrounds with about 35 variants, 12 new characters with about 60 poses, 9 staff cells, 3 mascot
poses, about 21 shared props and about 50 day-specific props, most with 2–3 states.
