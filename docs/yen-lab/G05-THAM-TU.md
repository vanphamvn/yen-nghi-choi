# G05 · Thám tử hiện tại (#146)

Trang: `/lab/tham-tu/` · Mã: `lab/tham-tu/` (HTML, `tham-tu.css`, `tham-tu.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ nên không dùng engine thời gian; trạng thái vẫn theo hợp đồng `data-state` của game.css.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Thám tử hiện tại · để ý vài thứ quanh mình bằng mắt, tai và vài giác quan khác, khoảng 1–3 phút. |
| Nhu cầu | Đang ngồi chơi, muốn rời màn hình một chút để nhìn quanh. Không hỏi tâm trạng. |
| Phương pháp nền | Cách “5-4-3-2-1” (5 thứ thấy, 4 thứ cảm nhận, 3 tiếng, 2 mùi, 1 vị) để chú ý vào hiện tại. |
| Nguồn · ngày | EVIDENCE.md G05: [S4](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) (chỉ chánh niệm nói chung) · rà câu chữ cuối 20/11/2026. |
| Giới hạn bằng chứng | **Exploratory / creative.** Chưa có thử nghiệm hay liều dùng trực tiếp cho 5-4-3-2-1; trò **chưa được kiểm chứng**. Không nói trò giúp hết hoảng, hết lo hay chữa gì. |
| Luồng | Bắt đầu → 5 bước theo thứ tự thấy → cảm thấy trên người → nghe → mùi → vị. Mỗi lần để ý được một thứ ngoài đời thì chạm từ chính (“thấy một thứ”, “cảm thấy một thứ”, “nghe một tiếng”, “có một mùi”, “có một vị”); đủ số thì tự sang bước sau. “bỏ qua bước này” ở mọi bước, và ở mùi/vị là “không có mùi nào” / “không có vị nào”; khi bước đã đếm được ít nhất một thứ, từ này đổi thành “đủ rồi” (không nói “không có mùi nào” sau khi vừa đếm một mùi). Xong → “Xong vụ án.” + số thứ đã để ý; bỏ qua hết → “Hôm nay không tìm manh mối nào cũng được.” “dừng hẳn” ở mọi bước; “chơi lại” về đầu. |
| Trạng thái | idle · running (`data-step` 1–5, `data-sense`) · complete · stopped · về idle bằng “chơi lại”. Không có pause vì không có đồng hồ (AC: “pause nếu có timer”). |
| Lưu ý an toàn | Ngay trên “bắt đầu”: “Mở mắt, nhìn và nghe quanh chỗ bạn ngồi. Không cần chạm, ngửi hay nếm gì, và đừng thử thứ lạ; bước nào không hợp thì bỏ qua.” (SAFETY.md Grounding). Bước “4 thứ bạn cảm thấy trên người” (không phải cảm xúc) gợi ý cảm giác thụ động (chân chạm sàn, tay trên bàn, gió quạt), không bảo nhặt hay sờ đồ lạ. Bước mùi/vị nói rõ không có cũng được và đừng ngửi/nếm thứ lạ. Không điểm, không chuỗi ngày, không đếm giờ. |
| Không phải trò tìm đồ | Hình (bộ sprite #189: kính lúp và các ô mắt/tai/mũi/tay; ô lá bị cắt bằng `clip-path` để không gợi ý “nếm lá/cây” cạnh bước vị) chỉ minh họa, `aria-hidden`, không bấm được; manh mối là đồ thật quanh khách. Dòng “Không phải trò tìm đồ trên màn hình: manh mối ở ngoài đời, trang chỉ đếm giúp bạn.” hiện trước khi bắt đầu. |
| Riêng tư | Không có ô nhập, form hay lựa chọn nào mang nội dung: trang chỉ giữ số lần chạm của lượt đang chơi trong bộ nhớ, xóa khi dừng, chơi lại, hoặc quay lại từ back/forward cache. Không storage, cookie, request sau khi tải, URL hay history. |
| Chạm nhanh | Đếm là chạm liên tục, nên sau mỗi lần đổi bước, dừng hay xong, các lần chạm trong 400 ms bị bỏ (kể cả link “về góc ngồi chơi”): một cú chạm dư không đếm sang bước mới, không bỏ qua hai bước, không xóa kết quả hay rời trang. Giữ Enter/Space (lặp phím) chỉ tính một lần. `touch-action: manipulation` tránh phóng to khi chạm đúp trên iOS. |
| Reduced motion | Không có animation riêng; trò vẫn hoàn tất, không có gì chuyển động. |
| Trình đọc màn hình | Mọi từ điều khiển là `button` có chữ; mỗi lần chạm đọc số (“1 / 5”), mỗi bước mới đọc “Đủ 5 thứ bạn thấy. Bước 2 / 5: …” hoặc “Bỏ qua. Bước 2 / 5: …” qua `.game-whisper`. Chấm tiến độ `aria-hidden`, chữ “2 / 4” mang ý nghĩa. Focus ở lại từ chính qua mọi bước (kể cả sau khi bỏ qua); khi xong focus vào dòng kết quả, không vào “chơi lại”; quay lại từ back/forward cache thì focus về tiêu đề. |
| Âm thanh | Không có. |
| Kiểm tra | `tests/yen-lab-tham-tu.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`): vào từ sổ; copy an toàn và không có ô nhập; đủ 5-4-3-2-1 với số đọc cho trình đọc màn hình; ngoài trời/không mùi không vị và đếm dở; bỏ qua hết; dừng ở giữa, chơi lại, `pageshow` giả lập từ cache (Playwright không có bfcache thật; phần back chỉ kiểm tải lại); chạm dồn (chạm đúp ở số cuối, ở “bỏ qua”, sau khi xong) và giữ Enter; bàn phím (Enter/Space, Tab tới bỏ qua, Enter lỡ ở kết quả không làm gì); 320/360/390 copy + “bắt đầu”, rồi câu dẫn + số + từ chính + bỏ qua + dừng trong màn hình đầu, không tràn ngang; reduced motion; offline sau khi tải. `tests/yen-lab-privacy.spec.mjs` chơi trọn trò với probe storage/mạng/thiết bị/âm thanh; a11y baseline cho trang. Smoke: luồng đếm (bắt đầu → dừng → chơi lại → đếm + bỏ qua → xong) + reduced motion ở 5 khung. |
| Phát hành | Link trong thực đơn ở `/lab/`: trang phải của trải sổ đầu tiên, dưới Ba điều nhỏ xíu. Cổng Beta 6 là #137. PR #193 squash-merge thành `a00a280b8bb9cd46b73e47c2f7bb4b35fe2a0275`; production `build-info.json` phục vụ đúng SHA đó, deployed smoke run 44645763430 43/43 (20/11/2026). |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G05). Hình minh họa dùng sprite `g05-tham-tu-hien-tai.webp` của #189 (agent tự duyệt, chủ quán duyệt sau); kính lúp sạch hơn trong bộ #191 (`positive-psychology/emotion-magnifying-glass.webp`) là ứng viên thay thế khi chủ quán duyệt bộ đó.
