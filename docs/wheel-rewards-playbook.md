# Quầy phát quà Yên: từ website tới nhận quà tại quầy

Trạng thái: **chuẩn bị cho ngày khai trương, chưa kích hoạt phát thưởng.**
Owner quyết định chuyển vòng quay số 02 từ game demo thành chương trình quà thật khi khách tới Yên Coffee & Tea.

## Các ô hiện có

| Ô | Kết quả | Lưu ý thể lệ cần xác định |
|---|---|---|
| 1 | Giảm 5.000đ | Món/hoá đơn đủ điều kiện, có cộng dồn không |
| 2 | Tặng topping | Topping nào, mức giá tối đa |
| 3 | Giảm 10% | Mức trần giảm tối đa và đơn hàng đủ điều kiện |
| 4 | Upsize 0đ | Cỡ/món đủ điều kiện, chi phí |
| 5 | Giảm 3.000đ | Món/hoá đơn đủ điều kiện |
| 6 | Quà bí mật | **Phải định nghĩa cụ thể** phần quà, số lượng, trị giá trước khi đăng ký và triển khai |
| 7 | Giảm 5% | Mức trần giảm tối đa |
| 8 | Giảm 8.000đ | Món/hoá đơn đủ điều kiện |

Vòng quay dùng tám ô bằng nhau, thuật toán chọn chỉ số ngẫu nhiên đều, không gán trọng số: **mỗi ô 12,5% trên mỗi lượt hợp lệ**, khi kho quà và thể lệ có thể đáp ứng. Nếu muốn chia tỷ lệ khác hoặc có giới hạn số lượng, cần thiết kế lại giải thuật và kiểm chứng cách công bố kết quả.

## Cách khách dùng khi chương trình hoạt động

1. Khách đến quầy và yêu cầu nhân viên chứng kiến lượt quay.
2. Nhân viên đối chiếu điều kiện tham gia theo thể lệ công bố; khách mở trang vòng quay trên điện thoại.
3. Khách nhấn **QUAY NHẬN QUÀ**, hệ thống chọn một kết quả, chạy animation và giữ nguyên kết quả trên màn hình.
4. Nhân viên chứng kiến và đối chiếu tên giải trên màn hình, ghi nhận vào biên bản/sổ theo quy trình đã đăng ký, sau đó trao quà/áp dụng giảm giá.
5. Lượt quay đã hoàn thành **không thể quay lần thứ hai trong cùng một lần tải trang**. Nếu trang tải lại, trạng thái client reset. **Đây không phải biện pháp chống gian lận hay bằng chứng đổi quà dùng độc lập.** Nhân viên phải trực tiếp kiểm soát và ghi nhận.

Không lưu dữ liệu cá nhân, không có tài khoản, cookie, localStorage hay cơ sở dữ liệu; trang không tạo mã voucher xác thực được. Không nên nhận ảnh chụp màn hình hoặc lời khai từ xa làm căn cứ trao thưởng vì người dùng có thể tự làm giả hoặc quay lại sau reload.

## Trước khi bật

- [ ] Chốt thể lệ chính thức: thời gian và địa điểm, đối tượng khách, điều kiện hóa đơn, số lượt/người hoặc hóa đơn, các trường hợp không hợp lệ, giải thưởng cụ thể, số lượng, giới hạn % giảm, thời hạn sử dụng, cộng dồn.
- [ ] Kiểm tra ngân sách và năng lực phục vụ; xác nhận đủ hàng/topping/upsize/quà bí mật.
- [ ] Thực hiện thủ tục **đăng ký hoạt động khuyến mại mang tính may rủi** và nhận xác nhận của cơ quan có thẩm quyền trước khi tổ chức, căn cứ Nghị định 81/2018/NĐ-CP và các văn bản sửa đổi hiện hành.
- [ ] Chuẩn bị thể lệ công khai, cơ chế khách chứng kiến và biên bản xác định trúng thưởng theo Nghị định 239/2026/NĐ-CP ngày 26/6/2026; nhân viên biết cách ghi nhận, đối soát và xử lý khi khách tải lại trang.
- [ ] Kiểm tra tính hợp lệ của tám giải, tỷ lệ, quà bí mật và tổng giá trị giải thưởng với hồ sơ đăng ký.
- [ ] Test iOS, Android, refresh, rời tab giữa chừng, reduced-motion và luồng nhân viên trước khi công bố.
- [ ] Bật cờ chương trình khi đã sẵn sàng, rồi kiểm tra Vercel production.

**Cờ bật chính thức:** trong script `yen-wheel-inline-script` ở `index.html`, đổi `const WHEEL_PROGRAM_ACTIVE=false;` thành `true` qua một PR riêng. Không bật bằng query parameter hoặc localStorage (dễ bị tự ý kích hoạt), và không coi cờ front-end là cơ chế an ninh hay chứng nhận pháp lý.

**Thời điểm hiện tại:** cờ `false`, khách không quay nhận voucher được. Nội dung thương hiệu đã viết cho ngày khai trương, nhưng deployment có thể được truy cập bằng URL trước khi website chính thức được quảng bá.

## Nguồn tham khảo pháp lý

- Nghị định 81/2018/NĐ-CP, Điều 13 (khuyến mại may rủi) và Điều 19 (đăng ký).
- Nghị định 128/2024/NĐ-CP sửa đổi Nghị định 81/2018.
- Nghị định 239/2026/NĐ-CP, hiệu lực 26/6/2026: https://chinhphu.vn/?docid=218591&pageid=27160
- Báo Điện tử Chính phủ tổng hợp: https://baochinhphu.vn/sua-doi-bo-sung-mot-so-quy-dinh-ve-hoat-dong-xuc-tien-thuong-mai-102260626180824344.htm

Nội dung này là checklist triển khai, không thay thế việc xác nhận thủ tục với cơ quan có thẩm quyền.
