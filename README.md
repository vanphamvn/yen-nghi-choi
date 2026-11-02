# Yên · Coffee & Tea

Một góc website tương tác của quán **Yên Coffee & Tea**, với nhân vật Cục Yên và 20 hoạt cảnh SVG. Đây không phải website đặt hàng.

Website: https://yen-nghi-choi.vercel.app/

## Chạy cục bộ

Không cần framework, package manager hay database. Chạy bằng bất kỳ static server:

```bash
python -m http.server 8000
```

Sau đó mở http://localhost:8000/ . Tránh mở bằng `file://` vì một số trình duyệt giới hạn tải file liên quan.

## Deploy lên Vercel

1. Import repository GitHub này vào Vercel.
2. Chọn **Framework Preset: Other** và **Root Directory: /**.
3. Giữ `vercel.json` và `robots.txt` như cấu hình hiện tại.

> **Lưu ý quan trọng:** Dự án `yen-nghi-choi` đang có trên Vercel nhưng chưa liên kết GitHub. Nếu muốn GitHub push tự deploy lên URL cũ, cần kết nối Git repository với **dự án hiện tại**, không tạo một Vercel project mới.

## Font tiếng Việt

Bản GitHub-ready sử dụng Google Fonts Noto Sans, Noto Serif và Noto Sans Mono. Đã loại bỏ 9 khai báo `@font-face` trỏ tới các file WOFF2 không tồn tại trong bộ source, tránh request 404 khi deploy mới. Có CSS fallback hệ thống nếu Google Fonts không tải được.

## Bảo mật & SEO

`vercel.json` và `robots.txt` vẫn đang ngăn lập chỉ mục. Nội dung website hiện viết theo trạng thái quán đã mở, nhưng chỉ gỡ `noindex` sau khi chủ quán xác nhận ngày mở thực tế và duyệt SEO/ảnh chia sẻ/thông tin vận hành.

## Mã nguồn

- `index.html`: giao diện, hoạt cảnh, trò chơi, lời thoại, JS và CSS.
- `yen-logo.svg`: logo chính thức.
- `vercel.json`, `robots.txt`: cấu hình deploy và SEO.
- Font được tải qua Google Fonts; không lưu trữ file font trong repository.

Không chứa API key, database connection hoặc tài khoản người dùng.