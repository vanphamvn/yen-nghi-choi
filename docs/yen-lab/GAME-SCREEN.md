# Yên Lab · Màn hình trò dùng chung (LAB-F06, #130)

Ngày: 19/11/2026 · M1 · Thành phần giao diện, **chưa phải trò đã phát hành**.

## Quyết định của chủ quán (19/11/2026)

- Cuốn sổ trên bàn ở `/lab/` **chỉ là thực đơn**: chạm tên trò để mở **màn hình riêng của trò đó** (`/lab/<trò>/`). Không chơi trong sổ.
- Điều khiển trong trò là **chữ viết tay bằng mực trên tờ giấy** (“bắt đầu”, “tạm dừng”, “tiếp tục”, “dừng hẳn”, “làm lại”, “về góc ngồi chơi”): không pill, viền, tag hay nhãn. Vẫn là `<button>`/`<a>` thật, vùng chạm ≥ 48px.

## Cách dùng

Trang trò nạp `/lab/lab.css` (token, header, footer) và `/lab/game.css` (màn hình trò). Bản mẫu đủ trạng thái: [`game-kit.html`](game-kit.html) (`?state=idle|running|paused|complete|stopped|error` để xem từng trạng thái). Trang trò thật chép khung HTML của bản mẫu; engine F07 (#131) điều khiển `data-state` và thời gian.

| Thành phần | Class | Ghi chú |
| --- | --- | --- |
| Màn hình | `main.game[data-state]` | Nền là phòng vẽ sẵn (`room-backdrop.jpg`) làm mờ; không vẽ thêm đạo cụ bằng CSS/SVG |
| Tờ giấy | `.game-sheet` | Viền mực + bóng giấy lệch như homepage, tối đa 560px |
| Tiêu đề | `.game-head h1[tabindex=-1]` | Serif nghiêng xanh; nhận focus khi đổi màn |
| Sân khấu | `.game-stage` (`aria-hidden`) | Điểm nhìn duy nhất; thu nhỏ khi xong để giữ “làm lại” trong màn hình đầu |
| Hướng dẫn | `.game-cue` | Một câu hiện tại, chữ to, nghĩa đen |
| Tiến độ | `.game-progress` + `.game-dots` | Chữ “vòng 2 / 6” là nguồn nghĩa; chấm mực chỉ minh họa |
| Lưu ý | `.game-note` | Lưu ý an toàn đặt ngay trên “bắt đầu” (SAFETY.md) |
| Điều khiển | `.game-words > .ink-word` (`--lead`, `--small`) | Gạch chân mờ = chạm được; hover/focus đậm; focus outline cam |
| Kết quả | `.game-result`, `.game-reflect` | Không điểm, không pháo hoa; phản hồi bỏ qua được, trả lời xong là quên |
| “Toast” | `.game-whisper[role=status]` | Một dòng viết ở chân tờ giấy, thông báo nhẹ |

**Hiển thị theo trạng thái:** phần tử có `data-when="running paused"` chỉ hiện ở các trạng thái đó; kiểu hiển thị lấy từ biến `--show`. Không cần JS ẩn/hiện từng nút. Lưu ý: `--show` được kế thừa, nên một phần tử `data-when` lồng trong khối có `--show: flex` (ví dụ `<span>` trong `.game-progress`) sẽ thành `flex`; hãy tự đặt `--show` cho phần tử đó.

**Focus:** chữ vừa bấm biến mất ở trạng thái mới, nên focus chuyển sang chữ chính kế tiếp (không rơi về `<body>`). Back/forward cache trở về `idle`, không tự chạy tiếp.

**Reduced motion:** tắt mọi transition/animation (lab.css); trạng thái vẫn đọc được qua chữ hướng dẫn và tiến độ.

## Bằng chứng kiểm tra (trước merge)

- `tests/yen-lab-game-kit.spec.mjs` (Chromium, desktop 1440 + touch giả lập 360): luồng idle → running → paused → running → stopped → idle bằng chuột, chạm và bàn phím (Tab/Enter/Space); focus không mất; phản hồi không lưu (storage/cookie/URL trống); controls không có nền/viền/bóng; reduced-motion không còn chuyển động; tương phản WCAG AA mọi chữ trên giấy ở 4 trạng thái; 320/360/390/768/1440 không tràn ngang, chữ điều khiển ≥ 44px và không xuống dòng; “làm lại” nằm trong màn hình đầu 360×800.
- Ảnh chụp idle/running/complete ở 5 chiều rộng: artifact CI `yen-lab-ux-browser-evidence` → `game-kit-shots/`. Agent đã xem ảnh 320/360/768/1440 và bản Browser pane 390px; chưa có duyệt của chủ quán.
- Chưa kiểm tra: VoiceOver/TalkBack, iPhone/Android thật. Không có trò nào phát hành trong ticket này.
