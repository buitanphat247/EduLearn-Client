# EXAM_LOGIC_DOCUMENTATION.md (Cập nhật phiên bản: No-Mercy Robotic Edition)

Tài liệu này cung cấp cái nhìn chi tiết nhất về logic vận hành của hệ thống thi trực tuyến AIO, tập trung vào các cơ chế bảo mật "Máy móc", tính toàn vẹn dữ liệu và trải nghiệm người dùng cao cấp.

---

## 1. QUY TRÌNH KHỞI CHẠY (ENGINE STARTUP)

### 1.1. Màn hình Chào (Splash Screen)

- **Cơ chế**: Hiển thị Logo AIO cùng hiệu ứng Loading chuyên nghiệp.
- **Ép buộc thời gian**: Màn hình này tồn tại tối thiểu **2 giây** bất kể tốc độ mạng, nhằm đảm bảo các tài nguyên hệ thống và Socket được khởi tạo ổn định trước khi học sinh nhìn thấy giao diện.

### 1.2. Hàng rào Kỹ thuật (DevTools Check)

- **Mục tiêu**: Ngăn chặn gian lận mã nguồn ngay từ đầu.
- **Hành động**: Nếu phát hiện Developer Tools đang mở, hệ thống sẽ khóa toàn bộ trang thi và yêu cầu đóng công cụ lập trình mới được tiếp tục.

### 1.3. Xác thực Danh tính (Identity Check)

- Ưu tiên kiểm soát qua `user_id` trong **Cookie** (Bảo mật cao hơn).
- Dự phòng qua **LocalStorage** nếu Cookie không khả dụng.
- Nếu không tìm thấy danh tính, hệ thống sẽ tự động đá văng người dùng và yêu cầu đăng nhập lại.

---

## 2. CÁNH CỬA CHIẾN THUẬT (THE STRATEGIC GATEWAY)

Sau khi dữ liệu được nạp xong, hệ thống dừng lại ở màn hình **Nội quy phòng thi**.

### 2.1. Glassmorphism & Blur Perspective

- **Giao diện đề thi**: Đã được render bên dưới nhưng bị ẩn sau một lớp **mờ ảo (Blur 20px)** và giảm độ sáng.
- **Mục tiêu**: Giúp thí sinh cảm nhận được áp lực và không gian phòng thi nhưng không thể can thiệp hay đọc đề trước giờ G.

### 2.2. User Gesture & Fullscreen Bridge

- Trình duyệt yêu cầu một hành động thực tế từ người dùng để bật các tính năng bảo mật (như Toàn màn hình).
- Nút **"Tôi đã hiểu & Bắt đầu"** chính là chiếc cầu nối để bật chế độ Toàn màn hình và giải phóng lớp mờ để bắt đầu làm bài.

---

## 3. CHẾ ĐỘ "MÁY MÓC" (NO-MERCY ROBOTIC MODE)

Đây là tầng bảo mật đanh thép nhất của hệ thống, xử lý mọi tình huống dựa trên luật lệ cứng nhắc, không nhân nhượng.

### 3.1. Giám sát Kết nối (Socket Persistence)

- **Biến cố bất ngờ**: Nếu kết nối Socket bị ngắt do mất điện, rút dây mạng, hoặc tắt máy đột ngột.
- **Phản ứng**: Hệ thống ngay lập tức gọi API nộp bài dựa trên dữ liệu mới nhất và khóa phiên thi vĩnh viễn với thông báo: _"Dòng điện/Kết nối bị ngắt - Hệ thống đã nộp bài"_.

### 3.2. Giám sát Thoát trang (Page Exit Enforcement)

- **Hành động**: Học sinh cố tình đóng Tab, chuyển Tab quá lâu (Pagehide/Visibility Change).
- **Phản ứng**: Không có thông báo "Bạn có chắc muốn rời đi?". Hệ thống coi đây là hành động bỏ thi. Bài thi được nộp ngay lập tức và học sinh bị đá ra khỏi phòng thi.

### 3.3. Đồng bộ Dữ liệu Snapshot (Final Data Sync)

- Để đảm bảo công bằng kể cả khi xử lý "không tình người", hệ thống luôn duy trì một bản **Snapshot** (Ảnh chụp tức thời) dữ liệu:
  - `latestAnswersRef`: Ghi lại đáp án cuối cùng ngay khi học sinh nhấn chọn.
  - `latestViolationsRef`: Ghi lại lỗi vi phạm cuối cùng.
- Khi rơi vào tình trạng kết thúc bài thi đột ngột, hệ thống sẽ dùng bản Snapshot này để nộp bài, đảm bảo thành quả tích lũy của học sinh không bị rơi rớt.

---

## 4. CƠ CHẾ BẢO MẬT & CHỐNG GIAN LẬN (SECURITY LAYER)

### 4.1. Anti-Cheat Hook

- **Visibility Change**: Theo dõi hành động chuyển sang Tab khác hoặc thu nhỏ trình duyệt.
- **Window Blur**: Theo dõi khi học sinh click ra ngoài cửa sổ thi.
- **Input Blocking**: Vô hiệu hóa chuột phải, Copy, Paste, Cut và các phím tắt can thiệp hệ thống.

### 4.2. Ngưỡng Khóa Bài (Violation Threshold)

- Mỗi hành động gian lận sẽ tăng 1 đơn vị vi phạm.
- **Cột mốc 5 lần**: Khi đạt đủ 5 lần vi phạm, hệ thống tự động khóa bài thi và thu hồi quyền làm bài ngay lập tức.

---

## 5. XỬ LÝ TRƯỜNG HỢP HỢP LỆ (GRACEFUL NAVIGATION)

Để tránh việc "Máy móc" bắt nhầm các hành động nộp bài đúng quy trình:

- **Nộp bài thủ công**: Khi học sinh nhấn "Nộp bài", hệ thống sẽ đánh dấu `isSubmitted = true` ngay lập tức. Hành động này sẽ vô hiệu hóa "Giám thị máy móc", giúp Socket và Tab có thể đóng lại một cách êm đẹp mà không gây báo động giả.
- **Thoát an toàn**: Nút "Thoát" (khi có xác nhận) cũng được trang bị cơ chế đánh dấu an toàn tương tự để học sinh quay về lớp học mượt mà.

---

## 6. HIỆU ỨNG TRẢI NGHIỆM (REVEAL EXPERIENCE)

- Khi bắt đầu, lớp kính mờ tan biến trong **0.8 giây** với hiệu ứng _Cubic-bezier_ sang trọng.
- Đề thi trượt nhẹ từ dưới lên kèm hiệu ứng _Fade-in_.
- Các câu hỏi được chia trang thông minh để tối ưu hiệu suất và sự tập trung.

---

_Tài liệu được cập nhật tự động bởi Antigravity. Hệ thống hiện đã đạt chuẩn bảo mật thép và trải nghiệm quốc tế._
