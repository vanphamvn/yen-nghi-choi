# G06 · Vườn cát không mục tiêu (#147)

Trang: `/lab/vuon-cat/` · Mã: `lab/vuon-cat/` (HTML, `vuon-cat.css`, `vuon-cat.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ nên không dùng engine thời gian và không có tạm dừng; trạng thái vẫn theo hợp đồng `data-state`.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Vườn cát không mục tiêu · cào vài đường trên khay cát, đặt vài viên đá, thích thì làm phẳng; khoảng 1–5 phút, tùy khách. |
| Nhu cầu | Rảnh tay, muốn nghịch một chút. Không hỏi tâm trạng. |
| Phương pháp nền | Chơi bằng tay / chú ý nhẹ nhàng vào một việc nhỏ (tactile play, focused attention). |
| Nguồn · ngày | EVIDENCE.md G06: [S4](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) (chỉ làm bối cảnh) · rà câu chữ cuối 20/11/2026. |
| Giới hạn bằng chứng | **Exploratory / creative.** Chưa có nghiên cứu nào kiểm chứng trò này (nghiên cứu về sandtray ảo là một hoạt động khác, có người hướng dẫn); trò **chưa được kiểm chứng**. Không nói “sand therapy”, không nói giảm căng thẳng. |
| Luồng | Bắt đầu → khay cát. Dụng cụ “cào / đá / sỏi / vỏ sò”: với “cào”, kéo ngón tay hoặc chuột để cào rãnh ba răng; với đá/sỏi/vỏ sò, chạm để đặt. Không vẽ được thì “thêm vòng / thêm sóng / thêm đá” (lần lượt ở bảy chỗ cố định). “hoàn tác” bỏ nét cuối (một vòng ba đường là một nét); “làm phẳng” xóa hết nhưng hoàn tác được; “xong” giữ vườn trên màn hình để ngắm (“Vườn của bạn đó.”); “dừng hẳn” làm phẳng; “chơi lại” về đầu. |
| Trạng thái | idle · running · complete · stopped · về idle bằng “chơi lại”; error khi máy không vẽ được canvas (“Máy này chưa vẽ được cát. Mình về góc ngồi chơi chơi trò khác nhé.”, chỉ còn lối về; các từ thêm vòng/sóng/đá cũng cần canvas nên không phải lối thay thế ở đây). Đá, sỏi, vỏ sò và “thêm đá” chỉ hiện khi đã cắt xong hình từ sprite. |
| Hình | Cát là canvas có hạt cố định (không ngẫu nhiên mỗi lần); rãnh có bóng và viền sáng. Đá, sỏi, vỏ sò cắt từ sprite G06 (`games/g06-vuon-cat.webp`), tách nền giấy bằng màu, vẽ trên canvas thứ hai nên rãnh không bao giờ đè lên đá. Vẽ lại theo danh sách nét khi khay đổi kích thước. |
| Chạm và chuột | Một ngón vẽ một lúc (ngón thứ hai bị bỏ qua); `setPointerCapture`; nhấc tay, `pointercancel` hoặc mất capture đều kết thúc nét ở chỗ đó; dùng `getCoalescedEvents` cho nét mượt; không dùng lực nhấn (pressure) nên bút hay ngón đều như nhau. `touch-action: none` chỉ trên khay khi đang chơi, ngoài khay vẫn cuộn trang được. Các từ đổi chỗ dưới ngón tay (bắt đầu, xong, dừng, câu hỏi sau trò) bỏ qua chạm trong 400 ms. |
| Lưu ý an toàn | Không có gì tự chuyển động; không âm thanh; không có mục tiêu hay hình mẫu phải theo. |
| Reduced motion | Không có animation nào; trò như cũ. |
| Riêng tư | Vườn chỉ là danh sách nét trong bộ nhớ trang (tối đa 400 nét, 1.500 điểm một nét), xóa khi dừng, chơi lại, rời trang hoặc quay lại từ back/forward cache. Không lưu ảnh, không tải xuống, không chia sẻ; không storage, cookie, request sau khi tải, URL hay history. |
| Trình đọc màn hình | Khay là `role="img"` với mô tả cập nhật (“Khay cát có 3 đường cào và 1 thứ đặt lên.”); mỗi thao tác đọc một câu ngắn qua `.game-whisper` (“Đã thêm một vòng.”, “Đã hoàn tác.”, “Đã làm phẳng cát. Hoàn tác nếu muốn lấy lại.”). Mọi việc làm được bằng từ: chọn dụng cụ, thêm vòng/sóng/đá, hoàn tác, làm phẳng, xong. Khi xong focus vào dòng kết quả. |
| Kiểm tra | `tests/yen-lab-vuon-cat.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`). Smoke, privacy, catalog và sổ thực đơn có trò thứ tám. |
| Phát hành | Link trong thực đơn ở `/lab/`: trải sổ thứ hai, trang trái, dưới Ngồi nhìn mây. Cục Yên có thể gợi ý: “Rảnh tay thì mình ra Vườn cát không mục tiêu cào vài đường.” Cổng toàn catalog là #139. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G06). Hình là sprite `g06-vuon-cat.webp` của #189 (agent tự duyệt, chủ quán duyệt sau), cắt bằng canvas, không sửa file ảnh.
