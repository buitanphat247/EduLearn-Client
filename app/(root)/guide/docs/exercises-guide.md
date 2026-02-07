# Bài Tập & Kiểm Tra

Hệ thống quản lý bài tập của EduLearn cho phép giáo viên giao bài, thu bài và chấm điểm trực tuyến một cách hiệu quả.

## 1. Tổng Quan Hệ Thống Bài Tập

Hệ thống hiện tại hỗ trợ hình thức **Bài tập tự luận / Nộp file**, phù hợp cho các dạng bài tập về nhà, đồ án, hoặc bài kiểm tra viết.

### Đặc Điểm Chính

- **Giao bài tập**: Giáo viên tạo bài tập với tiêu đề, mô tả chi tiết và hạn nộp.
- **Đính kèm tài liệu**: Hỗ trợ giáo viên đính kèm file đề bài hoặc tài liệu tham khảo.
- **Nộp bài trực tuyến**: Học sinh nộp bài bằng cách nhập nội dung văn bản hoặc tải lên file đính kèm.
- **Chấm điểm & Nhận xét**: Giáo viên chấm điểm và gửi phản hồi trực tiếp cho từng học sinh.

### Trạng Thái Bài Tập (Học Sinh)

- 🟢 **Được giao (Assigned)**: Bài tập mới được giao, chưa nộp bài.
- 🟡 **Đã nộp (Submitted)**: Học sinh đã nộp bài, đang chờ giáo viên chấm.
- 🔵 **Đã chấm (Graded)**: Giáo viên đã chấm điểm và có thể kèm nhận xét.

---

## 2. Hướng Dẫn Cho Hệ Thống (Dành Cho Nhà Phát Triển / Tích Hợp)

### 2.1. Cấu Trúc Dữ Liệu Bài Tập (Assignment)

Mỗi bài tập bao gồm các thông tin cơ bản:

- **Tiêu đề (Title)**: Tên ngắn gọn của bài tập.
- **Mô tả (Description)**: Nội dung chi tiết, yêu cầu của bài tập.
- **Thời hạn (Due Date)**: Thời gian kết thúc nộp bài.
- **File đính kèm (Attachments)**: Các file tài liệu do giáo viên tải lên.

### 2.2. Quy Trình Nộp Bài (Submission)

Hệ thống hỗ trợ học sinh thực hiện nộp bài thông qua:

1.  **Ghi chú (Note)**: Nhập văn bản trực tiếp trả lời câu hỏi hoặc ghi chú cho giáo viên.
2.  **File đính kèm (Attachments)**: Tải lên các file bài làm (Word, PDF, Ảnh, v.v.).

Mỗi học sinh có thể nộp bài nhiều lần (nếu giáo viên cho phép hoặc chưa hết hạn), hệ thống sẽ ghi nhận lần nộp cuối cùng hoặc lịch sử các lần nộp (tùy cấu hình).

### 2.3. Quy Trình Chấm Điểm (Grading)

Giáo viên thực hiện chấm bài thông qua giao diện quản lý:

1.  Xem danh sách học sinh đã nộp.
2.  Xem chi tiết nội dung nộp (file/text) của từng học sinh.
3.  **Nhập điểm (Score)**: Điểm số cho bài làm.
4.  **Cập nhật trạng thái**: Chuyển trạng thái sang "Đã chấm".

---

## 3. Lưu Ý Khi Sử Dụng

### Định Dạng File Hỗ Trợ

Hệ thống hỗ trợ tải lên đa dạng các loại file phổ biến phục vụ cho việc học tập:

- Tài liệu: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX.
- Hình ảnh: JPG, PNG, JPEG.

### Thời Hạn Nộp Bài

- Hệ thống ghi nhận thời gian nộp bài thực tế (`submitted_at`).
- Bài nộp sau thời hạn (`due_at`) có thể được đánh dấu là "Nộp muộn" (Late) tùy theo logic hiển thị, nhưng hệ thống vẫn cho phép nộp nếu chưa bị khóa.

---

> **Lưu ý**: Hiện tại hệ thống **chưa hỗ trợ** các dạng bài tập trắc nghiệm tự động (Quiz), bài tập điền từ hay kéo thả. Mọi bài tập đều được xử lý theo quy trình Giao bài -> Nộp file/Text -> Chấm thủ công.
