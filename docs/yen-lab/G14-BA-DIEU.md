# G14 · Ba điều nhỏ xíu (#155)

Trang: `/lab/ba-dieu/` · Mã: `lab/ba-dieu/` (HTML, `ba-dieu.css`, `ba-dieu.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ nên không dùng engine thời gian; trạng thái vẫn theo hợp đồng `data-state` của game.css.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Ba điều nhỏ xíu · ghi lại vài điều nhỏ của hôm nay, từ 0 tới 3 điều, khoảng 1–3 phút. |
| Nhu cầu | Ngồi chơi, muốn để ý một chút tới những thứ nhỏ đã có trong ngày. Không hỏi tâm trạng. |
| Phương pháp nền | Ghi lại điều biết ơn / “three good things”. |
| Nguồn · ngày | EVIDENCE.md G14: [S3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10393216/), [S6](https://pubmed.ncbi.nlm.nih.gov/12585811/) · rà câu chữ cuối 19/11/2026. |
| Giới hạn bằng chứng | Thử nghiệm gratitude rất khác nhau, thường ghi lặp lại hằng ngày/tuần; S3 đánh giá nguy cơ sai lệch cao và độ chắc thấp/rất thấp. Một lần chơi vài phút **chưa được kiểm chứng**; không nói trò này làm vui hơn hay hết buồn. |
| Luồng | Bắt đầu → ba mẩu giấy (gõ ngắn, tối đa 60 ký tự) hoặc chạm gợi ý (điền vào mẩu trống kế tiếp, không mở bàn phím) → “xong” (hoặc Enter ở mẩu cuối) → các mẩu giấy hiện lên để đọc lại → “xóa và làm lại” hoặc rời đi. “hôm nay chưa có điều gì” là câu trả lời hợp lệ, kết thúc nhẹ nhàng: “Hôm nay chưa có điều gì cũng được.” “dừng hẳn” xóa chữ ngay. |
| Trạng thái | idle · running (đang viết) · complete (đọc lại) · stopped · về idle bằng “xóa và làm lại”. Không có pause vì không có đồng hồ (AC: “pause nếu có timer”). |
| Lưu ý an toàn | Ngay trên “bắt đầu”, nguyên văn SAFETY.md: “Một điều cũng được. Hôm nay không nghĩ ra điều gì cũng được.” Không bắt đủ ba, không bắt vui, không điểm/chuỗi ngày. Gợi ý là những thứ bình thường (ly trà ấm, bữa ăn ngon…), không nhắc người hay chuyện có thể gây tổn thương. |
| Riêng tư | Chữ chỉ ở trong ô nhập và danh sách trên trang. Không có form (Enter không bao giờ gửi đi hay đưa chữ lên URL), không nút chia sẻ, `autocomplete="off"`, `spellcheck="false"` (tránh kiểm tra chính tả trên máy chủ). Xóa khi “dừng hẳn”, “xóa và làm lại”, rời trang (`pagehide`), quay lại bằng back/forward cache, và khi tải lại (trang tự xóa giá trị trình duyệt khôi phục). Lời thông báo cho trình đọc màn hình chỉ nói số lượng, không đọc lại chữ đã gõ. Dòng “Chữ bạn viết chỉ ở trên trang này, không gửi, không lưu; rời đi là mất.” hiện trước khi bắt đầu. |
| Bàn phím điện thoại | Input 17px (iOS không tự phóng to), viewport `interactive-widget=resizes-content`; khi focus một mẩu giấy, trang cuộn mẩu đó vào giữa sau khi bàn phím mở; trên điện thoại ẩn hình, câu dẫn và dòng riêng tư lúc đang viết để mẩu giấy, gợi ý và “xong” vừa một màn hình (320×640 trở lên). |
| Reduced motion | Mẩu giấy hiện ra không animation, không nghiêng; trò vẫn hoàn tất. |
| Trình đọc màn hình | Mẩu giấy là `textbox` có nhãn (“Điều nhỏ thứ nhất”, “…thứ hai, không bắt buộc”…), nhóm theo câu dẫn; gợi ý là nhóm “gợi ý”; kết quả là danh sách có nhãn; mốc chính qua `.game-whisper`. |
| Âm thanh | Không có. |
| Kiểm tra | `tests/yen-lab-ba-dieu.spec.mjs` (15 bài × desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`): Unicode tiếng Việt + emoji, Enter chuyển mẩu và kết thúc; một điều, rỗng, chỉ khoảng trắng, “hôm nay chưa có điều gì”; gợi ý không ghi đè, không mở bàn phím; dừng/xóa/tải lại/back-forward không giữ chữ; 60 ký tự, chuỗi dài không tràn ở 320 px; bàn phím, chạm, nhãn trình đọc màn hình; viewport 360×420 (bàn phím mở) giữ mẩu đang gõ trong màn hình; 320/360/390 copy + “bắt đầu” + “xong” trong màn hình; reduced motion. `tests/yen-lab-privacy.spec.mjs` gõ một câu bí mật, xác nhận không xuất hiện trong bất kỳ request nào (URL/body, thô hoặc mã hóa), không storage/cookie/URL/history push. Smoke: luồng không đồng hồ (bắt đầu → dừng → xóa → viết → xong) + reduced motion. |
| Phát hành | Link trong thực đơn (sổ) ở `/lab/`. Cổng Core Beta 3 là #135. SHA production: ghi trong #155 sau khi merge. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Câu chữ lấy nguyên văn SAFETY.md “Reflection, gratitude and sensory tasks” và câu dẫn đã duyệt trong EVIDENCE.md G14; review độc lập ghi trong PR.
