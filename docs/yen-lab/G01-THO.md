# G01 · Thở cùng Yên (#142)

Trang: `/lab/tho/` · Mã: `lab/tho/` (HTML, `tho.css`, `tho.mjs`) trên màn hình chung (`lab/game.css`) và engine (`lab/engine.mjs`).

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Thở cùng Yên · thử thở nhẹ theo nhịp trong 1/3/5 phút, dừng lúc nào cũng được. |
| Nhu cầu | Ngồi chơi, muốn chậm lại một chút. Không hỏi tâm trạng trước. |
| Phương pháp nền | Thở chậm có nhịp (paced / slow breathing). |
| Nguồn · ngày | EVIDENCE.md G01 (thời lượng 1–5 phút re-review 19/11/2026, PR #179): [S1](https://www.nature.com/articles/s41598-022-27247-y), [S5](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/) · rà 19/11/2026. Issue gợi ý thêm [PubMed 36624160](https://pubmed.ncbi.nlm.nih.gov/36624160/). |
| Giới hạn bằng chứng | Nghiên cứu ở người lớn, thiết kế khác nhau (vd. 5 phút/ngày trong một tháng). Nhịp của Yên và một lần ghé ngắn **chưa được kiểm chứng**; không nói trò này giảm lo âu/stress. |
| Luồng 1–5 phút | Chọn bao lâu (1 · 3 · 5 phút; mặc định 1) và nhịp (chậm: vào 4 s · ra 6 s; vừa: vào 3 s · ra 4 s; tự nhiên: không theo nhịp) → bắt đầu → “Hít vào nhẹ” / “Thở ra nhẹ” + “còn N giây” + vòng (nhịp tự nhiên: không đếm vòng, chỉ “còn m:ss”) → tạm dừng / tiếp tục / dừng hẳn → xong → phản hồi tùy chọn → làm lại / về góc ngồi chơi. Không pha nín thở. Số vòng = thời lượng ÷ chu kỳ, làm tròn (vd. 3 phút ở nhịp vừa = 26 vòng). |
| Trạng thái | idle · running · paused (bấm, ẩn trang, máy ngủ) · complete · stopped · error, theo engine F07. |
| Lưu ý an toàn | Ngay trên “bắt đầu”: “Không cần hít sâu hay nín thở. Nếu chóng mặt, hụt hơi hoặc khó chịu, hãy dừng và thở tự nhiên.” Có nhịp “tự nhiên”. Không điểm, không chuỗi ngày, không khen thành tích. |
| Reduced motion | Không có animation; hướng dẫn bằng chữ + “còn N giây” vẫn đủ để theo, và trò vẫn hoàn tất. |
| Trình đọc màn hình | Mỗi pha đọc một lần, lịch sự (“Hít vào nhẹ” / “Thở ra nhẹ”, 3–6 s một lần) qua vùng live ẩn; mốc chính (bắt đầu kèm nhịp, tạm dừng, kết thúc) qua `.game-whisper`. Không đọc từng giây. |
| Âm thanh | Không có. |
| Riêng tư | Lựa chọn chỉ trong bộ nhớ trang; phản hồi không lưu, không gửi. Kiểm bởi `tests/yen-lab-privacy.spec.mjs` (chơi trọn 3 phút, không storage/mạng/URL). |
| Hình | Cục Yên phồng/xẹp nhẹ (scale 0.9 ↔ 1.06) bằng Web Animations API. Mỗi pha một animation hữu hạn đặt `currentTime` theo đồng hồ engine; tạm dừng thì ghim đúng thời điểm engine dừng; ẩn khi reduced-motion. Không phụ thuộc FPS. |
| Kiểm tra | `tests/yen-lab-tho.spec.mjs` (nhịp theo đồng hồ giả, đếm giây, vòng, hoàn tất; animation đặt theo đồng hồ và đóng băng khi dừng; lựa chọn; ẩn trang → tạm dừng, không chạy bù; reduced motion; bàn phím + chạm; 320 px; nút chính trong màn hình đầu ở 320/360/390); smoke 5 khung + byte-identity production (`yen-lab-smoke.spec.mjs`); privacy runtime + tĩnh. |
| Phát hành | Link trong thực đơn (sổ) ở `/lab/`. Link homepage vẫn ẩn tới cổng M1 #134. SHA production: ghi trong #142 sau khi merge. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn y tế. Câu chữ lấy nguyên văn SAFETY.md “Breathing Alpha” và câu giới hạn bằng chứng dùng chung; kết quả review độc lập ghi trong PR.
