# Bảo mật dữ liệu

Cam kết bảo vệ quyền riêng tư và dữ liệu của người dùng.

## 1. Bảo mật tài khoản

- **Mã hóa mật khẩu:** Mật khẩu người dùng được mã hóa một chiều (Hashing) trước khi lưu vào cơ sở dữ liệu, đảm bảo không ai có thể đọc được, kể cả quản trị viên.
- **Token an toàn:** Sử dụng cơ chế JWT với thời gian hết hạn ngắn hạn để bảo vệ phiên đăng nhập.

## 2. Bảo mật đường truyền

Hệ thống sử dụng giao thức HTTPS để mã hóa toàn bộ dữ liệu truyền tải giữa thiết bị người dùng và máy chủ, ngăn chặn việc nghe lén.

## 3. Sao lưu dữ liệu

Cơ sở dữ liệu được sao lưu định kỳ để đảm bảo an toàn và khả năng khôi phục trong trường hợp sự cố.
