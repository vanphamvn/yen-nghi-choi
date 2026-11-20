# G07 · Lá trôi, nghĩ trôi (#148)

Trang: `/lab/la-troi/` · Mã: `lab/la-troi/` (HTML, `la-troi.css`, `la-troi.mjs`) trên màn hình chung (`lab/game.css`). Không dùng engine thời gian: cả lượt không có đồng hồ; mỗi lá chỉ trôi 8 giây.

## Bản ghi bài thực hành (theo QA-CHECKLIST)

| Mục | Nội dung |
| --- | --- |
| Tên · mục tiêu | Lá trôi, nghĩ trôi · đặt một ý nghĩ lên lá rồi nhìn nó trôi qua, bao nhiêu lá cũng được, khoảng 1–3 phút. |
| Nhu cầu | Đang ngồi chơi, có vài ý nghĩ lởn vởn, muốn thử nhìn chúng đi ngang. Không hỏi tâm trạng. |
| Phương pháp nền | Bài “lá trôi trên suối” (leaves on a stream) của ACT, kỹ thuật defusion: nhìn ý nghĩ như một thứ đi ngang, không cãi, không xua. |
| Nguồn · ngày | EVIDENCE.md G07: [S7](https://pubmed.ncbi.nlm.nih.gov/20689153/) · rà câu chữ và cách xóa 20/11/2026. |
| Giới hạn bằng chứng | **Indirect / adapted.** S7 là thí nghiệm ngắn trên sinh viên, không phải phần mềm lá trôi, không trích được liều. Trò **chưa được kiểm chứng**; không nói trò xóa, giảm hay sửa ý nghĩ. |
| Luồng | Bắt đầu → chọn một ý nghĩ có sẵn (một chạm là đặt lên lá) hoặc viết tối đa 60 ký tự rồi “đặt lên lá” / Enter → mẩu giấy trôi qua dải suối 8 giây (“cho lá trôi luôn” để thả ngay) → lá trôi qua, chữ mất → chọn tiếp hoặc “xong”. “xong” không cần lá nào: “Hôm nay chỉ ngồi nhìn suối cũng được.” “dừng hẳn” ở mọi lúc, xóa chữ ngay. |
| Trạng thái | idle · running (`data-phase` choose ⇄ drift) · complete · stopped · về idle bằng “chơi lại”. Không có pause: không có đồng hồ của cả lượt, và một lá 8 giây có “cho lá trôi luôn” và “dừng hẳn” (AC: “pause nếu có timer”). |
| Lưu ý an toàn | Ngay trên “bắt đầu”: “Không cần viết chuyện nặng lòng. Thấy khó chịu hơn thì dừng lúc nào cũng được.” và “Không cần đẩy nó đi hay nghĩ khác đi; ý nghĩ quay lại cũng bình thường.” Gợi ý là ý nghĩ thường ngày, trung tính; có “không biết nghĩ gì”. Không đếm số lá, không điểm, không chấm hay đọc nội dung. |
| Riêng tư | Chữ chỉ ở ô nhập rồi trên mẩu giấy đang trôi. Ô nhập xóa ngay khi đặt lên lá; mẩu giấy xóa khi lá trôi qua, khi dừng, chơi lại, rời trang (`pagehide`), quay lại bằng back/forward cache (test bằng sự kiện giả lập; Playwright không có bfcache thật) và khi tải lại. Không form (Enter không gửi đi), `autocomplete="off"`, `spellcheck="false"`. Lời thông báo cho trình đọc màn hình không đọc lại chữ. |
| Chạm nhanh | Sau khi đặt lá, thả lá, xong hay dừng, các lần chạm trong 400 ms bị bỏ (kể cả link “về góc ngồi chơi”), để một cú chạm dư không đặt thêm lá hay kết thúc. Giữ Enter/Space chỉ tính một lần; Enter của bộ gõ tiếng Việt (`isComposing`/`keyCode 229`) không đặt lá. |
| Reduced motion | Mẩu giấy nằm yên giữa dòng suối (không animation), rồi biến mất khi hết 8 giây hoặc khi “cho lá trôi luôn”; trò vẫn hoàn tất. Bật reduced motion giữa chừng thì lá đứng yên ngay. |
| Trình đọc màn hình | Ô nhập có nhãn “Viết một ý nghĩ, không bắt buộc”; gợi ý là nhóm theo câu dẫn; mốc qua `.game-whisper` (“Đã đặt ý nghĩ lên lá. Lá đang trôi.”, “Lá đã trôi qua…”). Dải suối `aria-hidden`. Focus: vào gợi ý đầu (không vào ô nhập, để bàn phím điện thoại không tự mở), sang “cho lá trôi luôn” khi lá trôi, về gợi ý đầu khi lá qua, vào dòng kết quả khi xong. |
| Hình | Dải 4 khung lá trôi `g07-la-troi.webp` (#189, agent tự duyệt, chủ quán duyệt sau). Mẩu giấy chữ là phần tử HTML cùng kiểu mẩu giấy của Ba điều nhỏ xíu. |
| Âm thanh | Không có. |
| Kiểm tra | `tests/yen-lab-la-troi.spec.mjs` (desktop + chạm giả lập; thêm iPhone 15 WebKit, Pixel 7 khi `LAB_UX_DEVICES=1`): vào từ sổ; copy được phép, không ép nghĩ tích cực; gợi ý một chạm, trôi 8 s, chữ mất; viết tiếng Việt + emoji, Enter, rỗng/khoảng trắng; không lá nào; dừng giữa lúc trôi, chơi lại, pagehide/pageshow, back; chữ không vào request/storage/URL/history/IndexedDB; chạm dồn; bàn phím + giữ Enter; IME Enter; trình đọc màn hình; 320/360/390 và chữ dài; reduced motion; offline. `tests/yen-lab-privacy.spec.mjs` gõ câu bí mật và chơi trọn trò với probe. Smoke: luồng lá (đặt → dừng → chơi lại → viết → thả → tự trôi hết → xong) + reduced motion ở 5 khung. |
| Phát hành | Link trong thực đơn ở `/lab/`: trang phải của trải sổ đầu tiên, dưới Thám tử hiện tại. Cổng Beta 6 là #137. SHA production: ghi trong #148 sau khi merge. |

## Review nội dung và an toàn

`reviewerType=agent`, `reviewAuthority=coordinator-delegated`, chưa có duyệt của chủ quán hay chuyên môn. Bản ghi review trong EVIDENCE.md (20/11/2026, G07).
