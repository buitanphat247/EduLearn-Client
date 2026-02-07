# Phân quyền & Kiểm soát truy cập

Cơ chế phân quyền chặt chẽ đảm bảo tính bảo mật và riêng tư của hệ thống.

## 1. Vai trò người dùng (Roles)

Hệ thống phân chia người dùng thành các nhóm quyền hạn khác nhau:

- **Admin:** Quản trị viên hệ thống, có toàn quyền quản lý người dùng và nội dung.
- **Giáo viên:** Tạo và quản lý lớp học, bài tập, đề thi.
- **Học sinh:** Tham gia lớp học, làm bài tập, xem tài liệu.

## 2. Kiểm soát truy cập

- **Xác thực:** Đăng nhập an toàn qua Email/Mật khẩu.
- **Token:** Sử dụng JWT (JSON Web Token) để xác thực phiên làm việc.
- **Phạm vi (Scope):** Giáo viên chỉ có quyền quản lý dữ liệu trong các lớp mình phụ trách.
