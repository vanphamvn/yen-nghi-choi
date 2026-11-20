# Yên Lab · Riêng tư, truy cập và CSP (LAB-F08, #132)

Ngày: 19/11/2026 · M1 · Áp dụng cho mọi trang dưới `/lab/` và mọi trò sau này. Đây là chính sách kỹ thuật của trang, không phải tư vấn pháp lý.

## Chính sách

| Chủ đề | Quy định |
| --- | --- |
| Tài khoản | Không có. Không đăng nhập, không hồ sơ, không email. |
| Lưu trữ | Không cookie, `localStorage`, `sessionStorage`, IndexedDB, Cache API. Lựa chọn và chữ khách nhập (vd. “Ba điều nhỏ xíu”) chỉ nằm trong bộ nhớ trang; xóa khi “làm lại”, rời trang (`pagehide`) hoặc quay lại từ bộ nhớ đệm back/forward. |
| Mạng | Trang chỉ tải file tĩnh cùng nguồn (`GET`). Không `fetch`/XHR/beacon/WebSocket, không gửi phản hồi, không analytics, không API bên thứ ba, không font ngoài. |
| URL | Không đưa cảm xúc, lựa chọn hay nội dung vào URL/history. |
| Thiết bị | Camera, micro, vị trí tắt bằng `Permissions-Policy` toàn site; Lab không gọi các API đó, không cảm biến chuyển động, không thông báo. |
| Âm thanh | Mặc định tắt; không `autoplay`. Âm thanh chỉ khi khách bấm, có nút tắt/dừng nhìn thấy, và phải review riêng. Duy nhất hiện có: giọng đọc tùy chọn của G03 Quét người (#144), mặc định tắt, chỉ hiện khi trình duyệt báo có giọng tiếng Việt chạy trên máy (`localService`, không dùng giọng qua mạng), đọc đúng câu có sẵn trên màn hình sau khi khách bật, có “tắt đọc to” khi đang chơi, im khi dừng, xong, ẩn hay rời trang. `localService` là trình duyệt tự báo; với một số bộ đọc trên Android, hệ thống vẫn có thể tự dùng mạng, nhưng chỉ đọc câu cố định của trang, không có gì khách nhập. |
| Nội dung | Không hứa chữa stress/lo âu, không “khoa học chứng minh” cho trò của Yên, không chẩn đoán. Mọi trang có câu “không thay thế tư vấn hoặc điều trị chuyên môn” và liên kết “Nguồn phương pháp”. |
| Phản hồi sau trò | Tùy chọn, có “không rõ” và “bỏ qua”; trả lời xong là quên, không đếm, không gửi. |

## CSP

Mỗi trang có `<meta>` CSP, và host gửi thêm header HTTP cho `/lab/*` (Netlify `netlify.toml`, Vercel `vercel.json`, giống hệt nhau):

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'none'; connect-src 'none';
media-src 'none'; worker-src 'none'; manifest-src 'none'; frame-src 'none'; frame-ancestors 'none';
form-action 'none'; base-uri 'none'; object-src 'none'
```

kèm `Cross-Origin-Opener-Policy: same-origin`. Header thêm `frame-ancestors 'none'` (thẻ meta không làm được): trang khác không nhúng được Lab. Không inline script/style/event handler; không `eval`/`innerHTML`. Server test cục bộ (`tools/serve-lab-ux.mjs`) đọc đúng header này từ `netlify.toml`, nên Playwright chạy dưới CSP như production.

## Truy cập (baseline cho mỗi trò)

`lang="vi"`, một `h1`, một `main`; mọi nút/link có tên (chữ hoặc nhãn ẩn `.lab-sr`); ảnh có `alt` (trang trí: `alt=""`); outline focus ≥ 2px nhìn thấy ở mọi điểm dừng Tab; vùng chạm ≥ 44px; tương phản WCAG AA; reduced-motion tắt mọi chuyển động mà trò vẫn chơi được; luôn có đường về `/lab/` hoặc `/`; “dừng hẳn” không bị chặn. Chi tiết màn hình trò: [GAME-SCREEN.md](GAME-SCREEN.md). Kiểm tra tự động: tên/alt/landmark/focus/Tab và reduced-motion ở `yen-lab-privacy.spec.mjs`; vùng chạm 44px ở `yen-lab-route.spec.mjs` và `yen-lab-game-kit.spec.mjs`; tương phản AA ở `yen-lab-game-kit.spec.mjs` (màn hình trò). Trò mới phải thêm trang của mình vào các test đó.

## Kiểm tra tự động

- `node tools/check-yen-lab-privacy.mjs` (CI): header `/lab/*` hai host; CSP meta mỗi trang nghiêm; không inline code, form, iframe, autoplay, tài nguyên khác nguồn; không API lưu trữ/mạng/thiết bị/âm thanh/URL-state/`eval` trong script (ngoại lệ đã review: `speechSynthesis` chỉ trong `lab/quet-nguoi/quet-nguoi.mjs`, với giọng `localService === true`, đặt giọng cho mỗi câu, một lời gọi `speak` sau điều kiện khách đã bật); không tài nguyên tạo URL động (dữ liệu có thể đi qua query string); không câu hứa hẹn sức khỏe; có câu không thay thế điều trị và liên kết “Nguồn phương pháp”. Đã thử chèn lỗi: bắt được inline style, `localStorage`, `fetch` và “Khoa học đã chứng minh”.
- `tests/yen-lab-privacy.spec.mjs` (Playwright, CI): theo dõi storage, cookie, fetch/XHR/beacon/WebSocket, camera, vị trí, `play()`, `speechSynthesis.speak`, history và vi phạm CSP từ trước khi trang chạy, rồi chơi thật phòng + trò mẫu; chỉ có `GET` cùng nguồn, không body, không query string; history chỉ tăng theo số lần tải trang. Đã thử chèn `localStorage` ngụy trang vào trò mẫu: test bắt được. Kèm header CSP, baseline a11y từng trang, reduced-motion, không audio/video.
- Chưa kiểm tra: VoiceOver/TalkBack thật, thiết bị thật. Netlify có thể chèn script HUD của chính Netlify cho người quản trị; CSP chặn nó (lỗi console đó không đến từ Lab).
