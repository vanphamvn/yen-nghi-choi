# Quy chuẩn microcopy cho website Yên

> Áp dụng từ issue #47. Mục tiêu: để người chơi nhớ hành động của Cục Yên, không phải đọc tên nhân vật ở mọi câu.

## 1. Ba vai trò tên gọi

- **`yên` / `Yên Coffee & Tea`**: tên thương hiệu. Giữ ở logo, tên quán, metadata, tên đầy đủ khi khách cần biết đang nói về nơi nào.
- **`Cục Yên`**: tên nhân vật. Giữ khi giới thiệu, làm rõ chủ thể của hành động lạ, làm tiêu đề quan trọng hoặc khi chữ xuất hiện như con dấu/chứng nhận trong trò chơi.
- **`quầy`, `nhân viên`, `cái máy`, `tờ đơn`, `chiếc ly`**: các chủ thể thay thế khi tên đã rõ qua hình ảnh và ngữ cảnh. Không thay tất cả bằng `nó`, `mình` hay `nhân viên` theo mẫu cố định.

## 2. Nguyên tắc viết

1. Một đoạn chỉ nhắc tên nhân vật khi thực sự cần phân biệt ai đang làm gì. Đã có hình Cục Yên ngay cạnh thì ưu tiên câu hành động.
2. Chuyển từ kể chuyện về Cục Yên sang cho khách **chơi**: “Chọn ba điều rồi đóng mộc”, không phải “Cục Yên bảo bạn chọn ba điều”.
3. Trò đùa phải ngắn, dễ hình dung, có kết quả cụ thể. Tránh nhắc tên chỉ để làm câu có vẻ dễ thương.
4. Tên trò, chữ trên con dấu, giấy phép PNG, nhãn logo, thẻ meta và `aria-label` hữu ích **không thuộc diện cần cắt**.
5. Khách cần biết món nước/game giả tưởng có thể **không phải món thật/khuyến mãi thật**. Không khiến người xem tưởng vòng quay có voucher có thể đổi.
6. **Yên chưa mở cửa** tại thời điểm cập nhật. Dùng “dự kiến khai trương tháng 12/2026” nếu nhắc tình trạng quán; không tự tuyên bố “đã mở”.
7. Không thêm cookie, telemetry, database, đăng nhập hoặc lưu thông tin cá nhân chỉ để thay câu chữ.

## 3. Trước → sau (mẫu)

| Trước | Sau |
|---|---|
| Cục Yên nhận đơn xin nghỉ, không hỏi lương, không cần chữ ký sếp. | Ở đây nhận đơn xin nghỉ, không hỏi lương, không cần chữ ký sếp. |
| Cục Yên đã để sẵn tờ đơn. Bạn chỉ cần chọn ba điều, còn thủ tục khó để Cục Yên lo. | Tờ đơn có sẵn rồi. Bạn chọn ba điều, chuyện đóng mộc để nhân viên lo. |
| Cục Yên đứng quầy phát quà. Bạn chỉ việc quay, nó sẽ hồi hộp giùm. | Bạn cứ quay đi. Có nhân viên đứng cạnh hồi hộp giùm rồi. |
| Cục Yên ôm cái muỗng chờ bạn chọn. Hai đứa đều sốt ruột. | Cái muỗng đã vào vị trí. Hồi hộp tới mức muốn xin nghỉ. |

## 4. Số đo audit (#47)

Đếm chuỗi `Yên` trong **phần text HTML**, loại CSS, JavaScript và SVG. Bao gồm text trong các state ẩn; không phản ánh số lượt hiển thị đồng thời trên một viewport.

| Chỉ số | Trước | Sau |
|---|---:|---:|
| Mọi chữ “Yên” (không phân biệt hoa/thường) | 73 | 41 |
| “Cục Yên” (không phân biệt viết hoa) | 45 | 17 |

Đây là số liệu code-content, không phải đánh giá trải nghiệm của khách thật hay hiệu quả chuyển đổi. Để biết liệu việc lược tên có cải thiện UX, thực hiện usability test trong issue #38.

## 5. Regression checklist

- [ ] Giữ tên brand/logo, tên bốn trò, dấu và chữ ký trên giấy phép, aria-label quan trọng.
- [ ] Các id/anchor, data attributes và 6 khối script JavaScript không đổi cấu trúc.
- [ ] Không lặp chủ thể làm câu tối nghĩa; đọc thử copy riêng từng section.
- [ ] Thông báo sản phẩm giả tưởng, ảnh PNG, không lưu data và sắp khai trương vẫn chính xác.
- [ ] Xem bằng điện thoại để phát hiện overflow, line wrapping trong nút, con dấu và biên lai.

