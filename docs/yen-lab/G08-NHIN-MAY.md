# G08 · Ngồi nhìn mây (#149)

Trang: `/lab/nhin-may/` · Mã: `lab/nhin-may/` (HTML, `nhin-may.css`, `nhin-may.mjs`) trên màn hình chung (`lab/game.css`). Đồng hồ dùng engine chung (`lab/engine.mjs`), giống Thở cùng Yên.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Ngồi nhìn mây · ngồi xem mây trôi 1–3 phút; lơ đãng thì nhận ra và nhìn lại. |
| Nhu cầu | Đang ngồi chơi, không muốn làm gì hết. Không hỏi tâm trạng. |
| Phương pháp nền | Tập chú ý nhẹ nhàng (focused attention): đặt chú ý vào một thứ, lơ đãng thì nhẹ nhàng quay lại. |
| Nguồn · ngày | EVIDENCE.md G08: [S4](https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety) (chỉ làm bối cảnh) · rà câu chữ cuối 20/11/2026. |
| Giới hạn bằng chứng | **Exploratory / creative.** Chưa có thử nghiệm nào về hoạt ảnh mây hay liều dùng; trò **chưa được kiểm chứng**. Không nói trò giúp thư giãn, tập trung hay “reset” gì. |
| Luồng | Chọn “bao lâu” (1 / 2 / 3 phút, mặc định 1) và “mây” (trôi / đứng yên) → bắt đầu → “Nhìn một đám mây”, “còn m:ss”. “mình lơ đãng rồi” hiện một câu nhẹ (4 câu cố định, lần lượt), không đếm, không chấm điểm, không ghi lại. “tạm dừng” / “tiếp tục”, “dừng hẳn” ở mọi lúc. Hết giờ → “Hết giờ rồi. Ngồi thêm hay đi lúc nào cũng được.”; dừng → “Mình dừng ở đây nhé.”; “làm lại” về đầu. |
| Trạng thái | idle · running ⇄ paused · complete · stopped · về idle bằng “làm lại” (engine chung). |
| Chuyển động | Bốn đám mây cắt từ sprite G08 (`games/g08-ngoi-nhin-may.webp`), mép mờ bằng mask, chỉ trôi khi đang chạy với “trôi”: mỗi đám qua hết trời trong 2,5–4 phút (khoảng 2 px/giây trên điện thoại), chỉ dịch ngang, không nhấp nháy. Tạm dừng thì mây đứng lại đúng chỗ; trước khi bắt đầu và sau khi xong, mây đứng yên. Chỉ CSS (`translate`), không có vòng lặp JS. |
| Lưu ý an toàn | Ngay trên “bắt đầu”: “Mỏi mắt hay chóng mặt thì cho mây đứng yên, nhìn ra xa, hoặc dừng lúc nào cũng được.” (EVIDENCE G08: say tàu xe, mỏi mắt → có bản trời đứng yên). Lơ đãng là chuyện thường, không phải lỗi. Không âm thanh. |
| Reduced motion | `lab.css` tắt mọi animation nên trời luôn đứng yên; chọn “trôi / đứng yên” không hiện (vì “trôi” sẽ không làm gì). Đồng hồ và chữ vẫn chạy, trò vẫn hoàn tất. |
| Rời trang | Ẩn trang (đổi tab, khóa màn hình) thì engine tạm dừng, mây đứng lại, không tự chạy tiếp; quay lại thấy “Bấm ‘tiếp tục’ khi bạn sẵn sàng. Mây chờ bạn.” Rời trang hoặc quay lại từ back/forward cache thì về đầu. |
| Riêng tư | Không ô nhập, không lưu gì: chỉ lựa chọn thời gian/mây của lượt đang chơi trong bộ nhớ trang. Không storage, cookie, request sau khi tải, URL hay history. |
| Trình đọc màn hình | Mọi từ điều khiển là `button` có chữ; bầu trời `aria-hidden`. “còn m:ss” không phải vùng live (không đọc mỗi giây, nhưng đọc được khi dò tới); bắt đầu, tạm dừng, tiếp tục, dừng, hết giờ và câu lơ đãng đọc một lần qua `.game-whisper`. Hết giờ thì focus vào dòng kết quả, không vào “làm lại”. |
| Kiểm tra | `tests/yen-lab-nhin-may.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`). Smoke, privacy, catalog và sổ thực đơn có trò thứ bảy. |
| Phát hành | Link trong thực đơn ở `/lab/`: trải sổ thứ hai, trang trái. Cục Yên có thể gợi ý: “Không muốn làm gì hết thì mình qua Ngồi nhìn mây một lát.” Cổng toàn catalog là #139. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G08). Hình là sprite `g08-ngoi-nhin-may.webp` của #189 (agent tự duyệt, chủ quán duyệt sau), cắt thành bốn đám mây bằng CSS, không sửa file ảnh.
