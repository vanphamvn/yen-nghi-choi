# Yên Lab Beta · Product Roadmap

**Trạng thái:** M0 complete · M1 in progress (F05 /lab/ shell done, PR #167 · prod `dd72230`; F06 shared game screen done, PR #173 · prod `26059f1`; F07 engine done, PR #175 · prod `c827d3f`; F08 privacy/CSP done, PR #177 · prod `01ca195`; F09 smoke + release gate done, PR #178 · prod `c424928`; **G01 Thở cùng Yên live at `/lab/tho/`**, PR #179 · prod `065111b`; **homepage link live**, M1 gate PR #181 · prod `4a6a9c4`; physical-phone check by owner pending) · **Ngày quyết định:** 19/11/2026 · **Epic:** [#124](https://github.com/vanphamvn/yen-nghi-choi/issues/124) · **Source:** `vanphamvn/yen-nghi-choi`

> **QUYẾT ĐỊNH ĐÃ CHỐT:** Ngưng phát triển Game Yên Phaser 2D, giữ source cũ để lưu trữ. Website Yên sẽ dẫn đến `/lab/`, một bộ mini tools thực hành ngắn giúp khách có cơ hội thư giãn và nhận biết trạng thái của mình. **Nghiên cứu hỗ trợ phương pháp không đồng nghĩa đã chứng minh chính mini game có hiệu quả.**

**Research foundation:** F03 / [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127) reviewed; see [F03-REVIEW.md](F03-REVIEW.md). Completing the matrix does not approve deferred protocols or imply a /lab/ release.

## 1. Product contract

**Core user journey:** `Yên homepage → CTA vào Yên Lab → chọn nhu cầu hoặc trò → bắt đầu → tương tác 1–5 phút, dừng bất cứ lúc nào → đánh giá tùy chọn → trở về Yên hoặc chọn trò tiếp`.

- **Đối tượng:** Khách truy cập thông thường, trải nghiệm tự nguyện, mobile-first. Không đánh giá bệnh lý hay sức khỏe tâm thần.
- **Brand:** Tiếp tục Yên Coffee & Tea (màu giấy/ink, typography, giọng nói duyên vừa đủ); [UI Craft PR #123](https://github.com/vanphamvn/yen-nghi-choi/pull/123), `DESIGN.md`, `.agents/skills/yen-ui-craft/SKILL.md`.
- **Công nghệ:** ưu tiên vanilla HTML/CSS/JS, static site trên Netlify; không đổi host/framework/API nếu chưa có lý do và chấp thuận.
- **Privacy:** không account, không lưu tâm trạng/journal vào DB, URL, localStorage, không tracking/cookie, không microphone/camera, audio off theo mặc định.
- **Safety:** short friendly content, stop/skip dễ thấy, không khẳng định điều trị, nội dung biết ơn không ép tích cực, lưu ý ngừng nếu kỹ thuật thở/gồng cơ gây khó chịu.
- **Phát hành:** PR → CI → browser QA → merge → đối chiếu exact production SHA và route thực. Preview ≠ production.

## 2. Release roadmap

| Mốc | Giá trị giao cho khách | Issue scope | Release gate |
|---|---|---|---|
| **M0 · Foundation / Scientific Trust** | Tắt autopilot game; hoàn tất UI Craft và nghiên cứu; chốt IA và safety copy | [#125](https://github.com/vanphamvn/yen-nghi-choi/issues/125), [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126), [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127), [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128) | Source/docs reviewed |
| **M1 · Alpha 1 game** | Homepage → /lab/ → Thở cùng Yên; hệ thống state + privacy + CI; xác minh production SHA | [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130), [#131](https://github.com/vanphamvn/yen-nghi-choi/issues/131), [#132](https://github.com/vanphamvn/yen-nghi-choi/issues/132), [#133](https://github.com/vanphamvn/yen-nghi-choi/issues/133), [#142](https://github.com/vanphamvn/yen-nghi-choi/issues/142), [#134](https://github.com/vanphamvn/yen-nghi-choi/issues/134) | [#134](https://github.com/vanphamvn/yen-nghi-choi/issues/134) |
| **M2 · Core Beta 3** | Thêm Căng rồi thả và Ba điều nhỏ xíu; end-to-end test 3 game trên mobile | [#143](https://github.com/vanphamvn/yen-nghi-choi/issues/143), [#155](https://github.com/vanphamvn/yen-nghi-choi/issues/155), [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) | [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) |
| **M3 · Beta 6** | Thêm grounding, lá trôi, gọi tên cảm xúc; gợi ý theo nhu cầu, không phân loại tâm lý | [#136](https://github.com/vanphamvn/yen-nghi-choi/issues/136), [#146](https://github.com/vanphamvn/yen-nghi-choi/issues/146), [#148](https://github.com/vanphamvn/yen-nghi-choi/issues/148), [#150](https://github.com/vanphamvn/yen-nghi-choi/issues/150), [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137) | [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137) |
| **M4 · Catalog tới 20** | 14 trò còn lại có thể phát hành độc lập sau evidence gate; trò thiếu chứng cứ để nhãn exploratory hoặc hoãn | [#138](https://github.com/vanphamvn/yen-nghi-choi/issues/138), [#144](https://github.com/vanphamvn/yen-nghi-choi/issues/144), [#145](https://github.com/vanphamvn/yen-nghi-choi/issues/145), [#147](https://github.com/vanphamvn/yen-nghi-choi/issues/147), [#149](https://github.com/vanphamvn/yen-nghi-choi/issues/149), [#151](https://github.com/vanphamvn/yen-nghi-choi/issues/151), [#152](https://github.com/vanphamvn/yen-nghi-choi/issues/152), [#153](https://github.com/vanphamvn/yen-nghi-choi/issues/153), [#154](https://github.com/vanphamvn/yen-nghi-choi/issues/154), [#156](https://github.com/vanphamvn/yen-nghi-choi/issues/156), [#157](https://github.com/vanphamvn/yen-nghi-choi/issues/157), [#158](https://github.com/vanphamvn/yen-nghi-choi/issues/158), [#159](https://github.com/vanphamvn/yen-nghi-choi/issues/159), [#160](https://github.com/vanphamvn/yen-nghi-choi/issues/160), [#161](https://github.com/vanphamvn/yen-nghi-choi/issues/161) | Per-game + research gate |
| **M5 · Quality & Learning** | Review toàn bộ, QR quán nếu hợp lý, nghiên cứu khách tổng hợp, release/rollback | [#139](https://github.com/vanphamvn/yen-nghi-choi/issues/139), [#140](https://github.com/vanphamvn/yen-nghi-choi/issues/140), [#141](https://github.com/vanphamvn/yen-nghi-choi/issues/141) | [#139](https://github.com/vanphamvn/yen-nghi-choi/issues/139) |

**Không có deadline giả định.** Mốc trên là thứ tự ưu tiên và cổng nghiệm thu, không phải cam kết ngày. M4 có thể dừng ở ít hơn 20 trò nếu trò thiếu bằng chứng/cần review để phát hành an toàn.

## 3. Board: foundational, UX, security & release tickets

| Key | GitHub ticket | Mốc | Ưu tiên | Phụ thuộc |
|---|---|---|---|---|
| `LAB-F01` | [#125](https://github.com/vanphamvn/yen-nghi-choi/issues/125) Dừng game Phaser và triage issue/workflow | M0 | P0 | Không |
| `LAB-F02` | [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126) Hoàn tất skill PR #123 | M0 | P0 | [PR #123](https://github.com/vanphamvn/yen-nghi-choi/pull/123) |
| `LAB-F03` | [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127) Research matrix & safety | M0 | P0 | Không |
| `LAB-F04` | [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128) Information architecture & microcopy | M0 | P1 | [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127) |
| `LAB-F05` | [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129) Route /lab/ + link homepage ✅ done ([PR #167](https://github.com/vanphamvn/yen-nghi-choi/pull/167)) | M1 | P0 | [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126), [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128) |
| `LAB-F06` | [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130) UI components & tokens ✅ done ([PR #173](https://github.com/vanphamvn/yen-nghi-choi/pull/173), [GAME-SCREEN.md](GAME-SCREEN.md)) | M1 | P0 | [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126), [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128) |
| `LAB-F07` | [#131](https://github.com/vanphamvn/yen-nghi-choi/issues/131) Shared interaction engine & timers ✅ done ([PR #175](https://github.com/vanphamvn/yen-nghi-choi/pull/175), [GAME-SCREEN.md](GAME-SCREEN.md#engine-dùng-chung-lab-f07-131)) | M1 | P0 | [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130) |
| `LAB-F08` | [#132](https://github.com/vanphamvn/yen-nghi-choi/issues/132) Privacy, a11y & CSP ✅ done ([PR #177](https://github.com/vanphamvn/yen-nghi-choi/pull/177), [PRIVACY.md](PRIVACY.md)) | M1 | P0 | [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126), [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129) |
| `LAB-F09` | [#133](https://github.com/vanphamvn/yen-nghi-choi/issues/133) Playwright /lab/ & release smoke ✅ done ([PR #178](https://github.com/vanphamvn/yen-nghi-choi/pull/178), [RELEASE-SMOKE.md](RELEASE-SMOKE.md)) | M1 | P0 | [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#131](https://github.com/vanphamvn/yen-nghi-choi/issues/131) |
| `LAB-F10` | [#134](https://github.com/vanphamvn/yen-nghi-choi/issues/134) Alpha production release gate ✅ done ([PR #181](https://github.com/vanphamvn/yen-nghi-choi/pull/181), [RELEASE-M1.md](RELEASE-M1.md)) | M1 | P0 | [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130), [#131](https://github.com/vanphamvn/yen-nghi-choi/issues/131), [#132](https://github.com/vanphamvn/yen-nghi-choi/issues/132), [#133](https://github.com/vanphamvn/yen-nghi-choi/issues/133), [#142](https://github.com/vanphamvn/yen-nghi-choi/issues/142) |
| `LAB-F11` | [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) Core Beta 3 release gate ✅ done ([RELEASE-BETA3.md](RELEASE-BETA3.md), production `1d7c28a`) | M2 | P0 | [#143](https://github.com/vanphamvn/yen-nghi-choi/issues/143), [#155](https://github.com/vanphamvn/yen-nghi-choi/issues/155), [#134](https://github.com/vanphamvn/yen-nghi-choi/issues/134) |
| `LAB-F12` | [#136](https://github.com/vanphamvn/yen-nghi-choi/issues/136) Gợi ý theo nhu cầu ✅ done ([F12-GOI-Y.md](F12-GOI-Y.md): Cục Yên gợi ý, quyết định chủ quán 20/11; production `e3b8313`) | M3 | P1 | [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128), [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) |
| `LAB-F13` | [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137) Beta 6 release gate ✅ done ([RELEASE-BETA6.md](RELEASE-BETA6.md), production `364e7aa`) | M3 | P0 | [#136](https://github.com/vanphamvn/yen-nghi-choi/issues/136), [#146](https://github.com/vanphamvn/yen-nghi-choi/issues/146), [#148](https://github.com/vanphamvn/yen-nghi-choi/issues/148), [#150](https://github.com/vanphamvn/yen-nghi-choi/issues/150) |
| `LAB-F14` | [#138](https://github.com/vanphamvn/yen-nghi-choi/issues/138) Catalog 20 trò + lazy-loading ✅ done ([F14-CATALOG.md](F14-CATALOG.md), production `9dff5f2`) | M4 | P1 | [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) |
| `LAB-F15` | [#139](https://github.com/vanphamvn/yen-nghi-choi/issues/139) Full-catalog release & quality gate | M5 | P0 | [#138](https://github.com/vanphamvn/yen-nghi-choi/issues/138), [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137), [#144](https://github.com/vanphamvn/yen-nghi-choi/issues/144), [#145](https://github.com/vanphamvn/yen-nghi-choi/issues/145), [#147](https://github.com/vanphamvn/yen-nghi-choi/issues/147), [#149](https://github.com/vanphamvn/yen-nghi-choi/issues/149), [#151](https://github.com/vanphamvn/yen-nghi-choi/issues/151), [#152](https://github.com/vanphamvn/yen-nghi-choi/issues/152), [#153](https://github.com/vanphamvn/yen-nghi-choi/issues/153), [#154](https://github.com/vanphamvn/yen-nghi-choi/issues/154), [#156](https://github.com/vanphamvn/yen-nghi-choi/issues/156), [#157](https://github.com/vanphamvn/yen-nghi-choi/issues/157), [#158](https://github.com/vanphamvn/yen-nghi-choi/issues/158), [#159](https://github.com/vanphamvn/yen-nghi-choi/issues/159), [#160](https://github.com/vanphamvn/yen-nghi-choi/issues/160), [#161](https://github.com/vanphamvn/yen-nghi-choi/issues/161) |
| `LAB-F16` | [#140](https://github.com/vanphamvn/yen-nghi-choi/issues/140) QR tại quán và CTA | M5 | P2 | [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135) |
| `LAB-F17` | [#141](https://github.com/vanphamvn/yen-nghi-choi/issues/141) 15 khách test, evidence maintenance | M5 | P2 | [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135), [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137) |

## 4. Board: 20 mini games

| Key | GitHub ticket | Làn phát hành | Ưu tiên | Nhận xét bằng chứng sơ bộ |
|---|---|---|---|---|
| `LAB-G01` | [#142](https://github.com/vanphamvn/yen-nghi-choi/issues/142) Thở cùng Yên ✅ done ([PR #179](https://github.com/vanphamvn/yen-nghi-choi/pull/179), [G01-THO.md](G01-THO.md)) | M1 | P0 | Có nghiên cứu về breathing, **không phải validation game** |
| `LAB-G02` | [#143](https://github.com/vanphamvn/yen-nghi-choi/issues/143) Căng rồi thả ✅ done ([PR #183](https://github.com/vanphamvn/yen-nghi-choi/pull/183)) | M2 | P0 | Có nghiên cứu PMR, **liều lượng rút gọn chưa xác minh** |
| `LAB-G03` | [#144](https://github.com/vanphamvn/yen-nghi-choi/issues/144) Quét người tìm căng thẳng | M4 | P1 | Mindfulness gián tiếp |
| `LAB-G04` | [#145](https://github.com/vanphamvn/yen-nghi-choi/issues/145) Ngón tay biết thở ✅ done ([G04-NGON-TAY.md](G04-NGON-TAY.md), production `8253279`) | M4 | P2 | Biến thể breathing, chưa có chứng cứ riêng |
| `LAB-G05` | [#146](https://github.com/vanphamvn/yen-nghi-choi/issues/146) Thám tử hiện tại ✅ done ([G05-THAM-TU.md](G05-THAM-TU.md), production `a00a280`) | M3 | P1 | 5-4-3-2-1 trực tiếp còn hạn chế |
| `LAB-G06` | [#147](https://github.com/vanphamvn/yen-nghi-choi/issues/147) Vườn cát không mục tiêu ✅ done ([G06-VUON-CAT.md](G06-VUON-CAT.md), production `25b8809`) | M4 | P2 | Exploratory; chưa chứng minh game |
| `LAB-G07` | [#148](https://github.com/vanphamvn/yen-nghi-choi/issues/148) Lá trôi, nghĩ trôi ✅ done ([G07-LA-TROI.md](G07-LA-TROI.md), production `9043840`) | M3 | P1 | ACT defusion gián tiếp |
| `LAB-G08` | [#149](https://github.com/vanphamvn/yen-nghi-choi/issues/149) Ngồi nhìn mây ✅ done ([G08-NHIN-MAY.md](G08-NHIN-MAY.md), production `e1d7123`) | M4 | P2 | Mindfulness gián tiếp |
| `LAB-G09` | [#150](https://github.com/vanphamvn/yen-nghi-choi/issues/150) Gọi tên cơn bực ✅ done ([G09-GOI-TEN.md](G09-GOI-TEN.md), production `dd66e02`) | M3 | P1 | Affect labeling; cần review tình huống |
| `LAB-G10` | [#151](https://github.com/vanphamvn/yen-nghi-choi/issues/151) Hòm thư không gửi | M4 | P1 | Expressive writing; có thể gây khó chịu |
| `LAB-G11` | [#152](https://github.com/vanphamvn/yen-nghi-choi/issues/152) Đổi góc nhìn | M4 | P1 | Reappraisal gián tiếp |
| `LAB-G12` | [#153](https://github.com/vanphamvn/yen-nghi-choi/issues/153) Điều mình kiểm soát | M4 | P1 | Problem-solving/CBT-inspired |
| `LAB-G13` | [#154](https://github.com/vanphamvn/yen-nghi-choi/issues/154) Nói với mình tử tế | M4 | P1 | Self-compassion gián tiếp |
| `LAB-G14` | [#155](https://github.com/vanphamvn/yen-nghi-choi/issues/155) Ba điều nhỏ xíu ✅ done ([PR #185](https://github.com/vanphamvn/yen-nghi-choi/pull/185)) | M2 | P0 | Gratitude có nghiên cứu, **game chưa validation** |
| `LAB-G15` | [#156](https://github.com/vanphamvn/yen-nghi-choi/issues/156) Gửi một điều tử tế | M4 | P2 | Pro-social/gratitude gián tiếp |
| `LAB-G16` | [#157](https://github.com/vanphamvn/yen-nghi-choi/issues/157) Album chuyện vui | M4 | P2 | Positive reminiscence gián tiếp |
| `LAB-G17` | [#158](https://github.com/vanphamvn/yen-nghi-choi/issues/158) Việc tốt bé tẹo | M4 | P2 | Acts of kindness gián tiếp |
| `LAB-G18` | [#159](https://github.com/vanphamvn/yen-nghi-choi/issues/159) Đi dạo trong rừng | M4 | P2 | Nature exposure không đồng nghĩa virtual game |
| `LAB-G19` | [#160](https://github.com/vanphamvn/yen-nghi-choi/issues/160) Một phút không làm gì | M4 | P2 | Exploratory mindful pause |
| `LAB-G20` | [#161](https://github.com/vanphamvn/yen-nghi-choi/issues/161) Lắng nghe Yên | M4 | P2 | Mindful listening gián tiếp |

## 5. Ưu tiên triển khai và dependency graph

### Critical path → Alpha on production

1. **Freeze old work:** [#125](https://github.com/vanphamvn/yen-nghi-choi/issues/125) (không ảnh hưởng deploy website chính).
2. **Web design & trust:** [#126](https://github.com/vanphamvn/yen-nghi-choi/issues/126) (gắn PR #123), [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127) (research), [#128](https://github.com/vanphamvn/yen-nghi-choi/issues/128) (wireflow).
3. **Build route & reusable parts:** [#129](https://github.com/vanphamvn/yen-nghi-choi/issues/129), [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130), [#131](https://github.com/vanphamvn/yen-nghi-choi/issues/131), [#132](https://github.com/vanphamvn/yen-nghi-choi/issues/132), [#133](https://github.com/vanphamvn/yen-nghi-choi/issues/133) chạy theo phụ thuộc; những việc độc lập có thể song song.
4. **First user-visible tool:** [#142](https://github.com/vanphamvn/yen-nghi-choi/issues/142).
5. **Production alpha gate:** [#134](https://github.com/vanphamvn/yen-nghi-choi/issues/134); ghi URL/SHA và thử nghiệm thực tế.

Sau đó: **Core Beta** [#143](https://github.com/vanphamvn/yen-nghi-choi/issues/143) + [#155](https://github.com/vanphamvn/yen-nghi-choi/issues/155) → [#135](https://github.com/vanphamvn/yen-nghi-choi/issues/135); **Beta 6** [#146](https://github.com/vanphamvn/yen-nghi-choi/issues/146) + [#148](https://github.com/vanphamvn/yen-nghi-choi/issues/148) + [#150](https://github.com/vanphamvn/yen-nghi-choi/issues/150) + [#136](https://github.com/vanphamvn/yen-nghi-choi/issues/136) → [#137](https://github.com/vanphamvn/yen-nghi-choi/issues/137); **Full catalog** [#138](https://github.com/vanphamvn/yen-nghi-choi/issues/138) → 14 issues M4 → [#139](https://github.com/vanphamvn/yen-nghi-choi/issues/139).

**Source of truth phụ thuộc dạng máy đọc:** [`docs/yen-lab/ops/roadmap.json`](ops/roadmap.json). `status: todo` ở mọi task khi tạo roadmap, không giả hoàn thành. Dùng ID trong file thay vì suy ra theo số issue; tìm ticket blocking trước khi code.

## 6. Scientific evidence & content policy

Các nghiên cứu mở đầu cần xét đầy đủ tại [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127):
- Breathwork systematic review/meta-analysis: https://pubmed.ncbi.nlm.nih.gov/36624160/
- Progressive muscle relaxation systematic review: https://pubmed.ncbi.nlm.nih.gov/38322293/
- Gratitude interventions meta-analysis: https://pubmed.ncbi.nlm.nih.gov/37585888/
- NCCIH mindfulness effectiveness & safety: https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety

**Phân loại bắt buộc** trước khi public game:
1. **Supported technique:** có nghiên cứu về kỹ thuật, nêu rõ thời lượng/đối tượng khác với mini game.
2. **Indirect / adapted:** ý tưởng dựa từ một khung khoa học, bằng chứng gián tiếp; không hứa cải thiện.
3. **Exploratory / creative:** game sáng tạo để thử nghiệm, không tự gọi bằng chứng khoa học.
4. **Deferred:** bị chặn vì thiếu chứng cứ, độ an toàn, UX hay QA.

Không dùng copy như “đã được khoa học chứng minh giúp bạn hết lo âu”; phù hợp hơn là “một bài thực hành dựa trên kỹ thuật… đã được nghiên cứu”, nếu có nguồn và giới hạn.

## 7. Release Definition of Done cho từng mini tool

- [ ] Có mục tiêu/đối tượng/độ dài/caution và nguồn nền tảng đã review trong `EVIDENCE.md`.
- [ ] Một vòng chơi thực sự hoạt động: start, pause (nếu cần), stop, complete, reset; không phải animation demo.
- [ ] Keyboard, touch, focus, tiếng Việt, voiceover, 44×44 touch, reduced-motion fallback; bố cục 320/360/390/768/1440 không tràn.
- [ ] Privacy: không thu/lưu/nộp nội dung người dùng; script/CSP/network inspect; không autoplay âm thanh.
- [ ] Unit/Playwright test cho ít nhất happy path, stop-mid-task, reset, back/forward, private-text wipe nếu có.
- [ ] Screenshot & kiểm tra thực trên thiết bị, không báo đạt chỉ dựa vào screenshot tĩnh.
- [ ] PR/CI pass; kiểm tra `https://yencafeday.netlify.app/lab/` đang phục vụ **SHA trùng commit merge**; ghi blocker nếu không xác minh được.
- [ ] Link sang site Yên và ngược lại chính xác; rollback có sẵn.

## 8. Rủi ro cần quản lý

| Rủi ro | Kiểm soát |
|---|---|
| Hiểu lầm game có tác dụng điều trị | Evidence matrix [#127](https://github.com/vanphamvn/yen-nghi-choi/issues/127), copy review mọi game; ghi phân loại gián tiếp/experimental |
| Thư giãn biến thành nhiệm vụ tạo áp lực | Không score, leaderboard, streak; skip/stop luôn sẵn |
| Rò rỉ nội dung viết/tâm trạng | Không localStorage/analytics; network/privacy test [#132](https://github.com/vanphamvn/yen-nghi-choi/issues/132) |
| UI cầu kỳ, nặng và mệt mắt | Giới hạn motion, theo DESIGN.md; performance + reduced-motion [#130](https://github.com/vanphamvn/yen-nghi-choi/issues/130) |
| Không tương thích iPhone/Android | Playwright + real-device QA [#133](https://github.com/vanphamvn/yen-nghi-choi/issues/133); tái dùng QA site #37 |
| Game cũ tự chạy tiếp | Freeze/triage [#125](https://github.com/vanphamvn/yen-nghi-choi/issues/125); giữ source, tắt đúng automation |
| PR đã merge nhưng production stale | F10/F11/F13/F15 đòi exact SHA, URL và smoke |
| 20 trò nhưng nội dung trùng lặp | Release theo 1 → 3 → 6 → 20, phỏng vấn 15 khách, tận dụng existing #38 tại [#141](https://github.com/vanphamvn/yen-nghi-choi/issues/141) |

## 9. Quản lý ticket và thay đổi phạm vi

- Mỗi issue có **LAB-key**, stage, priority, phụ thuộc, acceptance và test evidence; parent [#124](https://github.com/vanphamvn/yen-nghi-choi/issues/124).
- Không đặt toàn bộ games vào một PR. Một mini game hoặc một increment hoạt động độc lập mỗi nhánh/PR.
- Khi code xong, cập nhật task trạng thái trong `ops/roadmap.json` thành `in-progress`/`blocked`/`done` **chỉ theo chứng cứ**. Luôn reconcile GitHub issue/PR trước khi chọn việc.
- Những issue cũ #37/#38 có thể tái sử dụng QA và nghiên cứu khách, **không** đóng/chuyển hướng mà chưa xem scope hiện hữu.
- Roadmap được đặt trong nhánh docs/PR riêng; **tạo ticket và tài liệu không đồng nghĩa triển khai**. Không tự khởi động lịch chạy background hay trả phí.

## 10. Active coordination · 19/11/2026

One coordinator selects eligible work, delegates isolated implementation and independent QA, and reconciles issue/roadmap state. Continue during an active session without repeated prompts; complete at least one actual ticket per implementation prompt with acceptance and test evidence. See AGENTS.md for the execution contract. The owner subsequently authorized the enabled hourly background task “Điều phối Yên Lab”; each invocation reconciles live work before assigning it. This is scheduled resumption, not an always-running process.

- F01 / #125 completed: PR #163, runner freeze and CI, 12 superseded Phaser issues triaged as not_planned, old QA automation disabled, actual homepage browser smoke passed. Exact provider revision and full homepage regression are not asserted.
- F02 / #126 completed: PR #123 merged and design audit passed.
- F03 / #127 completed through PR #165 after independent source/claims review and green CI. Deferred per-tool protocol gates remain in force.
- F04 / #128 completed through PR #166: interactive design prototype, independent review, 10/10 CI cases with emulated touch and browser walkthrough. Physical-device/runtime release gates remain separate; no /lab/ Alpha release claimed.
