# G03 · Quét người tìm căng thẳng (#144)

Trang: `/lab/quet-nguoi/` · Mã: `lab/quet-nguoi/` (HTML, `quet-nguoi.css`, `quet-nguoi.mjs`) trên màn hình chung (`lab/game.css`). Không có đồng hồ (khách tự bấm tiếp), nên không có tạm dừng.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Quét người tìm căng thẳng · để ý lần lượt năm vùng cơ thể, mỗi vùng bao lâu tùy khách; khoảng 2–5 phút. |
| Nhu cầu | Ngồi lâu, muốn để ý cơ thể một chút. Không hỏi tâm trạng, không hỏi đau. |
| Phương pháp nền | Quét cơ thể (body scan) trong chánh niệm, rút ngắn. |
| Nguồn · ngày | EVIDENCE.md G03: [S4](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) · rà câu chữ, quy trình và giọng đọc 20/11/2026. |
| Giới hạn bằng chứng | **Indirect / adapted.** Nghiên cứu nói về chương trình chánh niệm nói chung, không riêng bài ngắn này; trò **chưa được kiểm chứng**. Không chẩn đoán, không điểm căng thẳng. |
| Luồng | (Nếu máy có giọng tiếng Việt cài sẵn: “đọc to: tắt / bật”, mặc định tắt) → bắt đầu → Đầu và mặt → Vai và cổ → Hai tay → Bụng và ngực → Hai chân. Mỗi vùng: tên vùng, một câu nhắc để ý, “3 / 5”, đốm sáng trên hình. “tiếp”, “bỏ qua vùng này”, “dừng hẳn”. Xong → “Xong một lượt. Không cần thấy khác đi.” (bỏ qua hết → “Hôm nay bỏ qua hết cũng được.”); “làm lại” về đầu. |
| Trạng thái | idle · running (`data-zone`) · complete · stopped · về idle bằng “làm lại”. Không có pause vì không có đồng hồ. |
| Lưu ý an toàn | Ngay trên “bắt đầu”: mở mắt cũng được; để ý cơ thể có lúc làm khó chịu hơn; bỏ qua, nhìn ra ngoài, hoặc dừng. Khi chơi: “Tự bấm ‘tiếp’ khi xong. Không thoải mái thì bỏ qua vùng này hoặc nhìn ra ngoài.” Không vùng nào bắt chọn mức đau hay căng. |
| Giọng đọc | Tùy chọn, mặc định tắt, chỉ hiện khi trình duyệt báo có giọng tiếng Việt chạy trên máy (`localService`), không chọn giọng qua mạng. Đọc đúng câu trên màn hình, chỉ sau khi khách bật; “tắt đọc to” tắt ngay khi đang chơi mà không mất lượt; im khi chuyển vùng, dừng, xong, ẩn trang hay rời trang. Khi giọng bật, vùng live chỉ đọc tên vùng để trình đọc màn hình không đọc trùng. `tools/check-yen-lab-privacy.mjs` chỉ cho phép `speechSynthesis` ở file này với các điều kiện đó. |
| Reduced motion | Đốm sáng đổi chỗ không chuyển động; chữ vẫn dẫn từng vùng, trò vẫn hoàn tất. |
| Riêng tư | Chỉ giữ vùng đang ở trong bộ nhớ trang; không storage, cookie, request sau khi tải, URL hay history. |
| Trình đọc màn hình | Hình `aria-hidden`; mọi hướng dẫn là chữ, đọc một lần mỗi vùng qua `.game-whisper`. Focus ở “tiếp”; xong thì vào dòng kết quả. |
| Kiểm tra | `tests/yen-lab-quet-nguoi.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`), kể cả giọng đọc với một giọng giả lập. Smoke, privacy, catalog và sổ thực đơn có trò thứ mười. |
| Phát hành | Link trong thực đơn ở `/lab/`: trải sổ thứ hai, trang phải. Cục Yên có thể gợi ý: “Ngồi lâu rồi thì mình chơi Quét người tìm căng thẳng.” Cổng toàn catalog là #139. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G03). Hình là sprite `g03-quet-nguoi.webp` của #189 (agent tự duyệt, chủ quán duyệt sau); hình người là ô đầu của sprite, cắt bằng CSS.
