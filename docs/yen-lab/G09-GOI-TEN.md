# G09 · Gọi tên cơn bực (#150)

Trang: `/lab/goi-ten/` · Mã: `lab/goi-ten/` (HTML, `goi-ten.css`, `goi-ten.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ nên không dùng engine thời gian.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Gọi tên cơn bực · chọn một hai chữ gần nhất với điều đang cảm thấy, nhìn chúng một chút, khoảng 1–2 phút. |
| Nhu cầu | Đang ngồi chơi, thấy trong người có gì đó (bực, mệt, hay chẳng rõ) và muốn gọi tên nó. Trang không hỏi lý do. |
| Phương pháp nền | Gọi tên cảm xúc (affect labeling). |
| Nguồn · ngày | EVIDENCE.md G09: [S8](https://pubmed.ncbi.nlm.nih.gov/17576282/) · rà câu chữ và cách tự chọn 20/11/2026. |
| Giới hạn bằng chứng | **Indirect / adapted.** S8 là thí nghiệm trong phòng lab (fMRI), không phải can thiệp cho cơn giận đời thường, không trích được liều. Trò **chưa được kiểm chứng**; không nói gì về hạch hạnh nhân, kiểm soát cơn giận hay hết bực. |
| Luồng | Bắt đầu → chọn tối đa 2 trong 14 chữ (chạm lại để bỏ; chữ thứ ba được nhắc nhẹ “Đã có hai chữ rồi…”), tùy chọn độ mạnh “một chút / vừa / nhiều” (một lựa chọn, bỏ được) → “nhìn lại”: “Lúc này: mệt và lo, vừa.” + “Chỉ gọi tên thôi. Không cần đổi nó, không cần giải thích nó.” → “sửa lại” (giữ lựa chọn để đổi) hoặc “xong”. Không chọn gì cũng được: “Chưa gọi được tên cũng được.” “dừng hẳn” ở mọi lúc. |
| Nhãn | bực, cáu, khó chịu, mệt, lo, buồn, tủi thân, hụt hẫng, bồn chồn, chán, bình thường, nhẹ nhõm, vui, **không biết gọi tên** (đứng riêng: chọn nó thì bỏ các chữ khác và ngược lại). Có khó chịu, trung tính và dễ chịu; không chữ nào được chọn sẵn, không sắp theo tốt/xấu, không màu theo cảm xúc. |
| Trạng thái | idle · running (`data-phase` choose ⇄ view) · complete · stopped · về idle bằng “chơi lại”. Không có pause vì không có đồng hồ. |
| Lưu ý an toàn | Ngay trên “bắt đầu”: “Cảm giác nào cũng là cảm giác, như trời nào cũng là trời… Không có chữ đúng hay sai, và không cần nó dễ chịu.” và “Thấy nặng lòng hơn thì dừng lúc nào cũng được.” Không đoán bệnh, rủi ro hay nguy hiểm, không diễn giải, không gợi ý “nên” làm gì. Dải tranh thời tiết (#189) chỉ hiện trước khi bắt đầu, không hiện lúc chọn hay nhìn lại, để không thành “đi từ mưa tới nắng”. |
| Riêng tư | Lựa chọn chỉ là trạng thái `aria-pressed` và dòng chữ trên trang, xóa khi “xong”, dừng, chơi lại, rời trang (`pagehide`) và quay lại từ back/forward cache (test bằng sự kiện giả lập; Playwright không có bfcache thật). Không storage, cookie, request, URL hay history. |
| Chạm nhanh | Sau “nhìn lại”, “sửa lại”, xong, dừng, các lần chạm trong 400 ms bị bỏ (kể cả link “về góc ngồi chơi”); giữ Enter/Space chỉ tính một lần. |
| Chữ đã chọn | Đánh dấu như nét bút highlight trên giấy + mực đậm hơn (không chỉ dựa vào màu); trình đọc màn hình nghe “đã bật/tắt” qua `aria-pressed`. |
| Reduced motion | Không có animation riêng; trò vẫn hoàn tất. |
| Trình đọc màn hình | 14 chữ là nút bật/tắt trong nhóm “Lúc này bạn thấy thế nào?”, độ mạnh trong nhóm “mạnh cỡ nào, nếu muốn”; `.game-whisper` nói “Đã chọn. 1 / 2 chữ.”, “Đã bỏ chọn…”, và đọc dòng “Lúc này: …” khi nhìn lại. Focus: chữ đầu khi bắt đầu, dòng “Lúc này” khi nhìn lại, chữ đã chọn đầu tiên khi sửa lại, dòng kết quả khi xong. |
| Âm thanh | Không có. |
| Kiểm tra | `tests/yen-lab-goi-ten.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`): vào từ sổ; copy, không chữ chẩn đoán; nhãn đa dạng, không chọn sẵn; không chọn gì; nhiều nhãn (tối đa 2, đổi, độ mạnh); “không biết gọi tên” đứng riêng; sửa lại/xong/dừng/chơi lại; riêng tư (request/storage/URL/history/IndexedDB, pagehide/pageshow, back); trình đọc màn hình; bàn phím; chạm dồn; 320/360/390 mọi chữ trong màn hình đầu, vùng chạm ≥ 44 px; reduced motion; offline. Privacy probe và smoke (luồng chọn → nhìn → sửa → xong + reduced motion) cũng chạy trò này. |
| Phát hành | Link trong thực đơn ở `/lab/`: trang phải của trải sổ đầu tiên (ba trò mỗi trang). Trải sổ thứ hai giờ ghi các trò M4 chưa mở (Ngồi nhìn mây, Vườn cát không mục tiêu, Ngón tay biết thở, Quét người tìm căng thẳng), chữ thường, không link. Cổng Beta 6 là #137. SHA production: ghi trong #150 sau khi merge. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G09).
