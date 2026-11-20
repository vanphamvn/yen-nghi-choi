# F12 · Gợi ý trò qua Cục Yên (#136)

Quyết định của chủ quán (20/11/2026): ticket gốc xin “ba nút lựa chọn ban đầu” (cơ thể / suy nghĩ / cảm xúc) và “Xem tất cả”. Điều đó trái quy tắc không UI chrome trong Lab (19/11/2026: không nút, tag, nhãn hiển thị; không đóng khung “nhu cầu”). Khi được hỏi, chủ quán chọn: **Cục Yên gợi ý**. Chọc Cục Yên thì thỉnh thoảng nó gợi ý một trò trong bong bóng thoại, tên trò là link. Cuốn sổ vẫn là danh sách đầy đủ.

## Cách chạy

| Mục | Nội dung |
| --- | --- |
| Ở đâu | `/lab/`, bong bóng thoại của Cục Yên (`#buddy-says`, `role="status"`). Mã: `lab/lab.js`, kiểu link trong `lab/lab.css`. |
| Khi nào | Lần chọc lẻ: một câu gợi ý; lần chọc chẵn: câu tán gẫu như trước. Không bao giờ tự chuyển trang; khách phải tự chạm tên trò. |
| Mapping tĩnh | Viết tay trong `lab.js`, ba nhóm lỏng, xen kẽ để hai gợi ý liền nhau khác nhóm: **người** (Thở cùng Yên, Căng rồi thả), **đầu óc** (Lá trôi, nghĩ trôi; Thám tử hiện tại), **lòng** (Gọi tên cơn bực, Ba điều nhỏ xíu). Sáu gợi ý xoay vòng: mọi trò đang mở đều được gợi ý. |
| Không chẩn đoán, không đoán | Không hỏi tuổi, tâm trạng hay lý do; không lưu lần chọc. Cục Yên kể chuyện của chính nó (“Hôm nào bực bực, mình chơi …”, “Đầu mình nhiều chữ quá thì chơi …”), không đoán khách đang thấy gì; chỉ có một lời rủ “Muốn rời màn hình một chút?” cho Thám tử hiện tại (manh mối ở ngoài đời). Không có chữ “nhu cầu”. |
| Đổi / thoát | Chọc tiếp là sang gợi ý khác (hoặc câu tán gẫu); sổ trên bàn luôn mở được và liệt kê đủ 6 trò; header và footer vẫn có lối về Yên. |
| Không tracking | Không request, storage, cookie, URL hay history khi gợi ý; tải lại hoặc quay lại thì Cục Yên bắt đầu lại từ câu đầu. |
| Trình đọc màn hình | Bong bóng là `role="status"` `aria-live="polite"`: câu gợi ý (kể cả tên trò) được đọc khi chọc; vùng thông báo đọc chữ nhưng không nói đó là link, khách biết có link khi Tab/vuốt tiếp. Bong bóng nằm **sau** nút Cục Yên trong thứ tự đọc, nên chọc bằng Enter rồi Tab là tới link trò, Enter để mở. Link có viền focus. |
| Chạm | Link cao ≥ 44 px ở mọi khung (padding âm, không đổi dòng chữ), không bị gì che, và không bao giờ đè lên thân Cục Yên (iPad dọc: bong bóng nhích lên và sang trái). |
| Khi thêm trò | Thêm một dòng vào `suggestions` trong `lab.js`; test bắt buộc mọi link gợi ý là trò `released` trong sổ và mọi trò `released` đều được gợi ý. |

## Kiểm tra

Mapping được kiểm bằng Playwright thay cho unit test riêng (ticket ghi “Unit mapping”): đủ ba nhóm, đúng và đủ 6 trò đang mở, tên khớp sổ. `tests/yen-lab-route.spec.mjs`: chọc 12 lần (chuột/chạm): đủ ba nhóm, chỉ trò đang mở, tên link khớp tên trong sổ, mọi trò được gợi ý, hai gợi ý liền nhau khác nhóm, xen câu tán gẫu, không tự chuyển trang, không request/storage/URL, sổ vẫn đủ 6 trò; bàn phím + trình đọc màn hình (Enter chọc, Tab tới link, viền focus, Enter mở trò, back về phòng bắt đầu lại); 320/360/390/768/820/1024/1280/1440: link nằm trên cùng, trong phòng, cao ≥ 44 px, 32 điểm trên thân Cục Yên vẫn chọc được Cục Yên, không tràn ngang. Chưa thử VoiceOver/TalkBack thật: bài bàn phím chỉ kiểm focus và vùng thông báo, không kiểm lời đọc. Bài chọc Cục Yên cũ (chuột/chạm/bàn phím, không lưu) vẫn chạy.

Không đổi: sổ thực đơn, các trò, CSP, privacy. Không kiểm tra trên máy thật hay VoiceOver/TalkBack.

## Phát hành

PR #199 squash-merge thành `e3b83133b2594105bce928aba0a68ac45f788df4`; production `build-info.json` phục vụ đúng SHA đó, deployed smoke run 44668350582 57/57 (20/11/2026). Kiểm tay trên production: chọc Cục Yên → “Mình hay thở chậm vài nhịp với Thở cùng Yên.” → chạm link → `/lab/tho/`, không storage.
