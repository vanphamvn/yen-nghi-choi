# G04 · Ngón tay biết thở (#145)

Trang: `/lab/ngon-tay/` · Mã: `lab/ngon-tay/` (HTML, `ngon-tay.css`, `ngon-tay.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ: khách tự đi theo nhịp của mình, nên không dùng engine thời gian và không có tạm dừng.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Ngón tay biết thở · rê ngón tay theo viền bàn tay, lên một ngón hít vào nhẹ, xuống thở ra nhẹ; một hoặc hai lượt năm ngón, khoảng 1–3 phút tùy nhịp của khách. |
| Nhu cầu | Muốn thở chậm một chút mà có việc cho tay làm. Không hỏi tâm trạng. |
| Phương pháp nền | Thở chậm có dẫn dắt (paced attention), dạng “five-finger breathing” quen thuộc. |
| Nguồn · ngày | EVIDENCE.md G04: [S1](https://www.nature.com/articles/s41598-022-27247-y), [S5](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/) · rà câu chữ cuối 20/11/2026. |
| Giới hạn bằng chứng | **Indirect / adapted.** Nghiên cứu nói về thở chậm ở người lớn; việc rê ngón tay chưa được nghiên cứu riêng và trò **chưa được kiểm chứng**. Không có huy hiệu “khoa học”. |
| Luồng | Chọn “một lượt / hai lượt” → bắt đầu → bàn tay to với đường chấm. Rê ngón trên bàn tay (hướng nào cũng được, không cần trúng đường): đi chừng một đoạn thì sang đoạn sau. “tiếp” hoàn tất đoạn đang đi. Mười đoạn mỗi lượt: lên ngón út / xuống / lên ngón áp út / … / lên ngón cái / xuống. Lời nhắc lớn “hít vào nhẹ” / “thở ra nhẹ”, dòng nhỏ “ngón giữa · lên · 3 / 5”. Xong → “Xong rồi. Không cần thấy khác đi.”; “dừng hẳn” ở mọi lúc; “làm lại” về đầu. |
| Trạng thái | idle · running · complete · stopped · về idle bằng “làm lại”. Không có pause vì không có đồng hồ (AC: “pause nếu có timer”). |
| Lưu ý an toàn | Ngay trên “bắt đầu”: lời nhắc thở của G01 và “Thở theo nhịp của bạn, ngón tay đi theo hơi thở.” Khi chơi: “Ngón tay đi chậm hay nhanh cũng được; cứ thở theo nhịp của bạn.” Không nín thở, không hít sâu, không điểm. Có thể rê trên bàn tay thật thay vì màn hình. |
| Vận động | Không đòi rê chính xác: mọi chuyển động trên bàn tay đều tính, nên tay run, chậm hay chỉ chạm nhẹ đều đi tiếp được; không chạm được thì “tiếp”. Một ngón rê một lúc; nhấc tay, `pointercancel` hay mất capture chỉ dừng rê, giữ nguyên chỗ đã tới. `touch-action: none` chỉ trên bàn tay khi đang chơi. Các từ đổi chỗ dưới ngón tay bỏ qua chạm trong 400 ms; bàn tay cũng bỏ qua chạm ngay sau “bắt đầu”. |
| Reduced motion | Không có animation; điểm đánh dấu chỉ di chuyển theo ngón tay hoặc “tiếp”. |
| Riêng tư | Chỉ giữ vị trí đang đi trong bộ nhớ trang; không storage, cookie, request sau khi tải, URL hay history. |
| Trình đọc màn hình | Bàn tay `aria-hidden`; mỗi đoạn mới đọc một câu qua vùng live lịch sự (“Lên ngón giữa: hít vào nhẹ.”), không đọc theo từng pixel. “tiếp” là đường chính bằng bàn phím; xong thì focus vào dòng kết quả. |
| Kiểm tra | `tests/yen-lab-ngon-tay.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`). Smoke, privacy, catalog và sổ thực đơn có trò thứ chín. |
| Phát hành | Link trong thực đơn ở `/lab/`: trải sổ thứ hai, trang phải. Cục Yên có thể gợi ý: “Lúc chờ nước, mình hay chơi Ngón tay biết thở trên bàn tay.” Cổng toàn catalog là #139. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G04). Hình là sprite `g04-ngon-tay-biet-tho.webp` của #189 (agent tự duyệt, chủ quán duyệt sau); bàn tay lớn là ô đầu của sprite, cắt bằng CSS, đường rê vẽ bằng SVG.
