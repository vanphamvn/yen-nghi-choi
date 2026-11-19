# G02 · Căng rồi thả (#143)

Trang: `/lab/cang/` · Mã: `lab/cang/` (HTML, `cang.css`, `cang.mjs`) trên màn hình chung (`lab/game.css`) và engine (`lab/engine.mjs`, thêm `skipTo` cho “bỏ qua chỗ này”).

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Căng rồi thả · thử nhận ra lúc cơ căng và lúc thả, khoảng 50 giây tới 3 phút 20 giây, dừng hay bỏ qua lúc nào cũng được. |
| Nhu cầu | Ngồi chơi, vai hay tay thấy cứng, muốn thả lỏng một chút. Không hỏi tâm trạng trước. |
| Phương pháp nền | Thả lỏng cơ tăng dần (progressive muscle relaxation, PMR), bản rút gọn 4 vùng theo thứ tự của Bernstein & Borkovec (tay · mặt · vai · chân). Có cách “chỉ thả lỏng” không gồng. |
| Nguồn · ngày | EVIDENCE.md G02 + protocol review 19/11/2026 (PR của ticket này): [S2](https://pubmed.ncbi.nlm.nih.gov/38322293/), [toàn văn PMC10844009](https://pmc.ncbi.nlm.nih.gov/articles/PMC10844009/). |
| Giới hạn bằng chứng | S2 là tổng quan ở người lớn, quy trình và liều khác nhau; buổi tự tập ngắn nhất trong tổng quan dài 5 phút, và các buổi một lần (20 phút) cho kết quả không đồng nhất. Bản của Yên **ngắn hơn mọi buổi đã được nghiên cứu**, nên không nói trò này giảm lo âu, stress hay đau. |
| Luồng | Chọn cách (căng nhẹ rồi thả · chỉ thả lỏng) và chỗ (tay · mặt · vai · chân, mặc định cả bốn; bỏ chọn chỗ đang đau) → bắt đầu → mỗi chỗ 2 lần: “Nắm nhẹ hai bàn tay” + “nhẹ thôi, vẫn thở bình thường” + “còn N giây” (5 giây) → “Thả tay ra, để ngón tay mềm” (20 giây) → chỗ kế → tạm dừng / tiếp tục / bỏ qua chỗ này / dừng hẳn → xong → phản hồi tùy chọn → làm lại / về góc ngồi chơi. |
| Động tác | Tay: nắm nhẹ. Mặt: nhíu nhẹ trán, mím nhẹ môi. Vai: nhún nhẹ lên một chút. Chân: ép nhẹ bàn chân xuống sàn. **Không** xoay/gập cổ, không quặp ngón chân (dễ chuột rút), không gồng hết sức, không nín thở. Chế độ “chỉ thả lỏng”: “Để ý …” 5 giây rồi “Thả lỏng …” 20 giây, không có câu gồng nào. |
| Thời lượng | 4 chỗ × 2 lần × (5 + 20 giây) = 3 phút 20 giây; bỏ chọn bớt chỗ thì ngắn hơn (1 chỗ = 50 giây). Thời gian là lựa chọn sản phẩm, không phải liều. |
| Trạng thái | idle · running · paused (bấm, ẩn trang, máy ngủ) · complete · stopped · error, theo engine F07. “Bỏ qua chỗ này” giữ nguyên trạng thái (đang tạm dừng thì vẫn tạm dừng); bỏ qua chỗ cuối thì trò kết thúc như bình thường, không có chữ “thất bại”. |
| Lưu ý an toàn | Ngay trên “bắt đầu”, nguyên văn SAFETY.md “Muscle relaxation”: “Chỉ căng nhẹ nếu thấy dễ chịu. Bỏ qua chỗ đang đau hoặc chấn thương. Không nín thở; dừng và thả lỏng nếu khó chịu.” Trong lúc gồng luôn có dòng “nhẹ thôi, vẫn thở bình thường”. Không điểm, không chuỗi ngày, không khen thành tích. |
| Hình | Cục Yên co nhẹ (scale 1.05 × 0.94) khi gồng, trở lại khi thả, bằng Web Animations API đặt `currentTime` theo đồng hồ engine; tạm dừng thì ghim đúng chỗ. Một vệt hồng mờ cùng màu má Cục Yên (multiply) chỉ vùng đang làm. Chế độ “chỉ thả lỏng” không co. Sân khấu `aria-hidden`; chữ hướng dẫn luôn nêu tên chỗ. |
| Reduced motion | Không animation, vệt hồng không chuyển động; chữ + “còn N giây” đủ để theo và trò vẫn hoàn tất. |
| Trình đọc màn hình | Mỗi pha đọc một lần, lịch sự, kèm tên chỗ (5–20 giây một lần) qua vùng live ẩn; mốc chính (bắt đầu, tạm dừng, bỏ qua, kết thúc) qua `.game-whisper`. Không đọc từng giây. |
| Màn hình nhỏ | 320–359 px: ẩn Cục Yên ở màn chờ để hai hàng lựa chọn, lưu ý an toàn và “bắt đầu” nằm trong màn hình đầu; Cục Yên hiện khi bắt đầu. |
| Âm thanh | Không có. |
| Riêng tư | Lựa chọn chỉ trong bộ nhớ trang; phản hồi không lưu, không gửi. `tests/yen-lab-privacy.spec.mjs` chơi trọn một lượt (bỏ chọn, tạm dừng, bỏ qua, hoàn tất, phản hồi): không storage/cookie/mạng/URL. |
| Kiểm tra | `tests/yen-lab-cang.spec.mjs` (17 bài × desktop + chạm giả lập; thêm iPhone 15 WebKit và Pixel 7 khi `LAB_UX_DEVICES=1`): nhịp 5/20 giây theo đồng hồ giả, 2 lần mỗi chỗ, thứ tự chỗ, hoàn tất 3:20; bỏ qua khi chạy và khi tạm dừng; bỏ chọn chỗ, không chọn chỗ nào thì “bắt đầu” bị khóa; chế độ chỉ thả lỏng không có câu gồng và không co; animation theo đồng hồ và đóng băng khi dừng; ẩn trang → tạm dừng, không chạy bù; reduced motion; bàn phím + chạm; trình đọc màn hình; 320 px; lưu ý + “bắt đầu” trong màn hình đầu ở 320/360/390; guard giao thức (gồng ≤ 5 giây, thả dài hơn gồng, không chữ “nín/hết sức/cổ/ngón chân”). Engine: 4 unit test `skipTo`. Smoke 5 khung + byte-identity production; privacy runtime + tĩnh. |
| Phát hành | Link trong thực đơn (sổ) ở `/lab/`. **Đã phát hành:** PR #183 → `8da36e7` trên https://yencafeday.netlify.app/lab/cang/ (deployed smoke run 44525688827, 29/29). Cổng Core Beta 3 là #135. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn y tế/vật lý trị liệu. Câu chữ lấy nguyên văn SAFETY.md “Muscle relaxation” và câu giới hạn bằng chứng dùng chung; protocol review ghi trong EVIDENCE.md, kết quả review độc lập ghi trong PR.
