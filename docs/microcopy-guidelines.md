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
4. Tên trò, chữ trên con dấu, giấy phép PNG, nhãn logo, thẻ meta và `aria-label` hữu ích **không thuộc diện cần cắt**. Tuy nhiên, trong một khu trò chơi nên có **một điểm nhận diện thương hiệu nổi bật**; tránh lặp tên trong tiêu đề, bảng quầy, phụ kiện nhân vật, nút bấm và lời chú thích cùng lúc.
5. Khách cần biết món nước/game giả tưởng có thể **không phải món thật/khuyến mãi thật**. Không khiến người xem tưởng vòng quay có voucher có thể đổi.
6. **Quy tắc nội dung cho ngày ra mắt:** viết nội dung chính như quán đang hoạt động và mời khách ghé quán ngay. Không dùng “sắp khai trương”, “đang xây”, “dự kiến mở”. Chỉ công bố website khi quán thực sự mở cửa và đã xác minh mọi thông tin thực tế.
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
- [ ] Thông báo sản phẩm giả tưởng, ảnh PNG và không lưu data vẫn chính xác; không còn thông tin chờ khai trương trong bản phát hành.
- [ ] Xem bằng điện thoại để phát hiện overflow, line wrapping trong nút, con dấu và biên lai.


### Ví dụ bổ sung: Vòng quay (#47)

- **Giữ:** chữ `yên · COFFEE & TEA` ở tâm vòng quay như điểm nhận diện chính.
- **Đổi:** `Vòng quay Yên` → `Quay một vòng`; `VÒNG QUAY MAY MẮN · CỤC YÊN` → `QUẦY VẬN MAY · SỐ 02`; `QUAY YÊN!` → `QUAY THỬ!`; bảng tên nhỏ trên mũ thành dấu `!`.
- **Giữ nguyên:** số tiền/topping hiển thị trên 8 lát vòng quay, thông báo quà mô phỏng, điều hướng game, ID và logic quay.

## 6. Release gate: bản nội dung viết sẵn cho ngày khai trương

- Website có thể được **soạn và kiểm thử** trước ngày khai trương, nhưng copy công khai viết theo trạng thái quán đã hoạt động.
- Trong thời gian chưa khai trương, **không quảng bá link** và phải nhớ rằng URL Vercel có thể mở trực tiếp dù đặt `noindex`. `noindex` không phải chế độ riêng tư hay khóa truy cập; nếu cần bảo mật thật, bật bảo vệ deployment.
- Trước ngày phát hành, kiểm tra quán đã mở thật; liên kết Google Maps, TikTok, đồ uống/menu, giờ hoạt động (nếu đăng) và giá trị ưu đãi (nếu có) đã xác nhận.
- Giữ riêng cảnh báo vòng quay và giấy phép là **trải nghiệm mô phỏng**, không phải voucher đổi tại quán, cho đến khi chủ quán chính thức triển khai chương trình thật.
- Ảnh Open Graph PNG và fallback SVG phải khớp nội dung ngày ra mắt, không còn mốc “tháng 12/2026”.
