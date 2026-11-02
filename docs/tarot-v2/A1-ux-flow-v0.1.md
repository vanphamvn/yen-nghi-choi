# Yên Tarot v2 · A1 UX & interaction specification · Draft v0.1

**Status:** Design draft for review. **Parent:** [#2](https://github.com/vanphamvn/yen-nghi-choi/issues/2) · **A1:** [#3](https://github.com/vanphamvn/yen-nghi-choi/issues/3) · **Art direction:** [#10](https://github.com/vanphamvn/yen-nghi-choi/issues/10)  
**Branch:** \`feature/tarot-v2-foundations\` · No production release.  
**Scope:** Interaction architecture, wireframes, state transitions, UX copy, accessibility and testable requirements. Does not change the existing Mood oracle or Tarot production code.

## Product intent

Create a **90-second reflection ritual** in section 01 that someone can understand in five seconds without reading a manual. Three draws follow the contemplative meanings **Gốc rễ → Hiện tại → Hướng tiếp theo**. Position three is a possible next action, **not a certain future**.

- Two modes remain: **Bói tâm trạng** (existing 52 cards) and **Tarot** (78 cards). Existing Mood content, daily 7-card rotation, carousel and controls must not be rewritten.
- Tarot begins on a **quiet choice screen**, not seven permanently exposed cards.
- One clear primary CTA at a time, progressive disclosure instead of a permanent control dashboard.
- Every card has a meaningful front illustration when the art workstream lands; card rendering must not depend on artwork loading.
- No personal-data input, storage, tracking, login, or health/finance/legal predictions.

## Information architecture

1. Mode selector (always above panel): \`Bói tâm trạng\` / \`Tarot 78 lá\`
2. In Tarot panel: top eyebrow and context line; progress stepper (1 Chọn → 2 Xào → 3 Rút → 4 Đọc)
3. Main scene: one phase at a time
4. Secondary controls: optional reversals, \`Bắt đầu lại\`, help, never visually larger than primary CTA
5. Final reading: quick summary in three cards, details collapsed, synthesis & action
6. Bottom: concise entertainment disclaimer

### Four screens and microcopy

| Phase | Visible headline | Primary CTA | Helpful microcopy | Fallback |
|---|---|---|---|---|
| Choose | **Bạn đang nghĩ về chuyện gì?** | **Xào bài thôi** | “Chọn một chủ đề. Không cần kể bí mật cho Cục Yên.” | Topic default = Tổng quan |
| Shuffling | **Cục Yên đang xào bài...** | Disabled, busy | “Đừng thò tay vô, bài đang bay.” | After 1.0s (or 0ms reduced motion), draw is ready |
| Draw 1 | **Rút lá Gốc rễ** | Choose any available face-down card | “Chuyện này bắt đầu từ đâu?” | Tap cards; no drag required |
| Draw 2 | **Rút lá Hiện tại** | Choose any available card | “Điều gì đang diễn ra?” | Slot #1 stays visible |
| Draw 3 | **Rút lá Hướng tiếp theo** | Choose any available card | “Một hướng để thử, không phải định mệnh.” | Slots #1 and #2 stay visible |
| Reading | **Cục Yên đọc xong rồi.** | **Trải bài mới** | “Đọc tới đâu thì đọc. Bài không chấm điểm.” | Details collapsed until opened |
| Reset confirm | **Xào lại từ đầu nha?** | **Xào lại** / **Giữ trải bài** | “Ba lá đang rút sẽ được bỏ khỏi bàn.” | Cancel preserves all state |
| Error recovery | **Có một lá bị kẹt.** | **Thử lại** | “Cục Yên mở lại bàn, không mất phần còn lại.” | Artwork fallback, never block reading |

### Choice screen

Four tappable themes, all have contextual questions in Vietnamese:

- **Tổng quan:** “Mình cần nhìn rõ điều gì ở hiện tại?”
- **Tình cảm:** “Trong chuyện này, điều gì cần được lắng nghe?”
- **Công việc:** “Mình có thể thay đổi điều gì trong cách làm việc?”
- **Bản thân:** “Mình cần chăm sóc điều gì ở chính mình?”

A single reversal switch with short tooltip: “Lá ngược gợi một góc nhìn bị cản trở hoặc hướng vào bên trong. Không mặc định là điềm xấu.” Off by default. Switching this after shuffle requires reset confirmation.

### Shuffle screen

- Deck is centered, front artwork hidden; at rest about 5 stacked backs.
- User clicks \`Xào bài thôi\`, engine shuffles 78 card IDs **before** animation.
- 0.95–1.25-second sequence: split deck sideways → overlap shuffle → stack → fan out seven backs.
- When reduced-motion is set: immediate switch with a short, nonmoving state change.
- Result always independently determined from the animation. \`animationend\` may finish the visual, never serve as the only mechanism to advance game state.
- 7 backs are presented without revealing identity until chosen; random order and hidden card IDs are not DOM text for players.

### Draw screen

Three persistent slots always stay in order. Current slot has a soft highlight and label \`Đang chờ lá #/3\`.

- Each available card is a **real \`button\`**, minimum practical touch area 44×44 CSS px; disabled once chosen.
- Each tap commits one ID to the current position, locks input for card-travel/flip, reveals the card and restores input for next draw. No duplicate selections.
- Motion plan: lift selected back (0–180 ms), fly to active slot (180–500 ms), rotate Y (500–900 ms), appear settled (900 ms); reduced-motion skips.
- Do not auto-scroll on draws 1 or 2, especially when keyboard is being used. If needed, only on completing draw 3 scroll the reading title into view after layout stabilizes.
- The selected position is labeled near the card and spoken using an \`aria-live=polite\` region. Do not announce card names from the hidden deck before drawing.

### Reading screen

- Keep spread visible above a concise three-item quick reading. Each card: correct illustration, \`Gốc rễ / Hiện tại / Hướng tiếp theo\`, Vietnamese name, \`Xuôi / Ngược\`, 1–2 keywords, **one simple 12–22-word line**.
- Below each card one \`Xem kỹ hơn\` disclosure: tailored meaning by position, thought question, small action. Only one open at a time on mobile, multiple optional on desktop.
- Synthesis connects the three readings as a sequence, not a stitched list. Tone: thoughtful, brief, gently absurd. Avoid predicting physical death, medical prognosis, wealth, partner infidelity or other unknown facts.
- Final actions: \`Trải bài mới\` (confirmation only if current reading is partly unfinished), \`Chơi Bói tâm trạng\` (preserves Tarot state in memory until page reload).
- No result export/social share in v2 scope.

## Wireframes

\`\`\`text
MOBILE 375 × 812                                   DESKTOP >= 1024
┌───────────────────────────┐                       ┌───────────────────────────────────────────┐
│ Yên · Cục Yên             │                       │ 01 / BÓI BÀI CÙNG CỤC YÊN                 │
│ 01 / BÓI BÀI             │                       │ [Bói tâm trạng] [Tarot 78 lá*]           │
│ [Tâm trạng] [Tarot*]      │                       ├───────────────────────────────────────────┤
│ 1 CHỌN · 2 XÀO · 3 RÚT    │                       │  CHỌN      │ Main ritual surface          │
├───────────────────────────┤                       │            │                                │
│ Bạn đang nghĩ về...      │                       │ Topics     │       ┌────────────┐            │
│ [Tổng quan*][Tình cảm]   │                       │ ⦿ Tổng quan│       │ DECK STACK │            │
│ [Công việc] [Bản thân]   │                       │ ○ Tình cảm │       └────────────┘            │
│                           │                       │ ○ Công việc│                                │
│ [ ] Có lá ngược          │                       │ ○ Bản thân│       [ XÀO BÀI THÔI ]       │
│                           │                       │ [ ] Ngược  │                                │
│       [DECK STACK]       │                       ├───────────────────────────────────────────┤
│       ✦  ✦  ✦            │                       │  GỐC RỄ    HIỆN TẠI    TIẾP THEO        │
│                           │                       │ [ slot ]   [ slot ]     [ slot ]          │
│ [ XÀO BÀI THÔI ]        │                       └───────────────────────────────────────────┘
├───────────────────────────┤
│ 01 GỐC 02 NAY 03 HƯỚNG   │                       DRAW: center stage becomes seven backs.
│  ▯      ▯      ▯         │                       READING: spread + 3 quick readings +
│                           │                       synthesis + disclosures below stage.
│ [ 7 BACKS SWIPE ⇆ ]     │
│ ▯ ▯ ▯ ▯ ▯ ▯ ▯           │
│                           │
│ Cục Yên sẽ không đọc...  │
└───────────────────────────┘
\`\`\`

### Responsive decisions

| Breakpoint | Scene structure | Seven card backs | Spread | Controls |
|---|---|---|---|---|
| 320–359px | One column, max content width | Horizontal snap rail; edge fade; no 7-in-a-row tiny cards | Three compact readable slots, labels outside art | CTA full-width, safe-area-aware |
| 360–430px | One column, ample padding 12–16 | Horizontal rail, reveal 1.8–2.4 cards at a time | Three compact slots visible as a row | One main CTA, reset in secondary text |
| 431–760px | One column, larger art | Horizontal or compact fan | Three slots in row | Fixed hierarchy |
| 761–1023px | Scene width-constrained | Fan centered, no unwanted clipping | Three slots in row | Sidebar only if room |
| ≥1024px | Topics/guide at left, card stage at right | Full arc of seven | Three slots aligned below | Reading underneath full width |

### Focus and screen reader contract

- Tabs: \`role=tablist\`, \`role=tab\`, \`aria-selected\`, arrow/Home/End key support. Activation follows focus. Returning to Mood must not reset its deck.
- Each back: descriptive \`aria-label="Rút lá thứ [n] cho vị trí Gốc rễ"\`, not an announced unknown title.
- On pick: focus next available back or active slot title; avoid focus vanishing when the original button disappears.
- Progress live region announces at most once per phase, not every CSS animation tick.
- Slot \`aria-label\` includes position, card name and orientation after reveal.
- \`dialog\` or inline modal used for reset confirmation; keep focus trapped and return focus to initiating control after cancel.
- Images decorative when same information given in adjacent text, otherwise alt describes relevant illustration succinctly.
- All interactive elements distinguish hover, focus and active states. Aim ≥4.5:1 body copy contrast.

## Transition contract

| Current | Event | Next | Allowed? | Result |
|---|---|---|---|---|
| choose | SELECT_TOPIC | choose | yes | Update question |
| choose | TOGGLE_REVERSED | choose | yes | Update preference |
| choose | SHUFFLE | shuffling | yes | Commit deterministic shuffled deck |
| shuffling | SHUFFLE / TAP_CARD | shuffling | no | Ignore, no double action |
| shuffling | SHUFFLE_DONE | draw-1 | yes | Reveal 7 backs |
| draw-n | SELECT_AVAILABLE_CARD | animating-draw | yes | Reserve unique cardId, lock input |
| animating-draw | CARD_SETTLED | draw-(n+1) / reading | yes | Reveal card + next step |
| draw-n | SELECT_USED_CARD | draw-n | no | Ignore |
| any phase after shuffle | RESET / OPTION_CHANGE | confirm-reset | yes | Capture pending change, preserve prior state |
| confirm-reset | CANCEL | previous | yes | Restore exact prior state |
| confirm-reset | CONFIRM | choose | yes | Clear draw, apply changed option |
| reading | NEW_SPREAD | choose or shuffle | yes | Explicit new reading flow |
| any | SWITCH_MODE | same internal phase | yes | Visually switch without destroying state |

Animation stale-closure guard: every shuffle/draw has a monotonically increasing \`roundToken\`, checked before committing later visual callbacks.

## Exact copy inventory

**Success:** “Xào xong. Cục Yên không nhìn trộm.” / “Lá đầu tiên đã chịu ra mặt.” / “Ba lá đủ rồi. Cục Yên nhường bạn đọc.”

**Errors:** “Có lá bị kẹt. Thử lại nha.” / “Chuyện chưa xong mà bạn xào lại hả?” / “Đang xào, từ từ đã.”

**Warning:** “Tarot gợi câu hỏi, không đưa ra quyết định thay bạn.”

Avoid “Định mệnh đã chọn bạn”, “Tương lai chắc chắn”, “Xấu lắm”, “Người ấy đang nghĩ…”.

## Handoff & QA

- [ ] Review the 4-screen design and copy with owner.
- [ ] Approve 320/375/430/1024 desktop/mobile layouts.
- [ ] Validate screen reader + keyboard path in a real browser prototype.
- [ ] Approve toast, reset-dialog and failure copy.
- [ ] Baseline tests for existing Mood (daily 7 cards, flip, navigation, random).
- [ ] Create state-machine tests before integrating motion.
- [ ] Do not deploy to production before approval and regression pass.

**Tarot system check:** RWS convention 78 cards = 22 Major (Fool to World) + 56 Minor (four suits × Ace–Ten/Page/Knight/Queen/King); three-card positions here are a *deliberate reflective adaptation* of the common past/present/potential model. Sources: [Rider–Waite deck inventory](https://learntarot.org/owdesc.htm), [three-card layout](https://www.simplytarot.com/pages/9-card-past-present-and-future-tarot-spread).
