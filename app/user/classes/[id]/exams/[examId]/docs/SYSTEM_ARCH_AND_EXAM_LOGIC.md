# HỆ THỐNG THI TRỰC TUYẾN AIO: KIẾN TRÚC & LOGIC NGHIỆP VỤ (FULL-STACK)

Tài liệu này mô tả chi tiết hệ sinh thái thi trực tuyến AIO, từ lớp giao diện người dùng (Frontend) đến hệ thống điều phối (Backend JS) và lõi xử lý dữ liệu/AI (Backend Python). Hệ thống được thiết kế theo tiêu chuẩn bảo mật đa lớp, đảm bảo tính toàn vẹn và kỷ luật tuyệt đối.

---

## 1. MÔ HÌNH KIẾN TRÚC TỔNG QUÁT (SYSTEM ARCHITECTURE)

Hệ thống vận hành theo mô hình **Microservices Orchestration**:

1.  **Frontend (Next.js)**: Lớp tương tác người dùng, xử lý UI/UX cao cấp và các cơ chế bảo mật phía Client (Anti-cheat).
2.  **API Gateway & Orchestrator (Node.js/Next.js)**: Đóng vai trò là trung tâm điều phối, xác thực quyền truy cập và quản lý kết nối thời gian thực (Socket.io).
3.  **Core Exam Engine (Python/FastAPI)**: Lõi xử lý nghiệp vụ nặng, quản lý đề thi, chấm điểm tự động và các thuật toán phân tích hành vi gian lận.

---

## 2. CHIẾN LƯỢC XÁC THỰC ĐA LỚP (MULTI-LAYER AUTHENTICATION)

Quy trình xác thực được thiết kế theo mô hình "API chồng API" để đảm bảo dù học sinh có bypass được một lớp cũng không thể can thiệp vào lõi hệ thống.

### Lớp 1: Client -> Backend JS (JWT v1)

- Khi học sinh đăng nhập, Server JS cấp một **Access Token (JWT)** chứa thông tin cơ bản (`userId`, `role`).
- Mọi yêu cầu từ Frontend lên Backend JS phải đính kèm Token này trong Header `Authorization`.

### Lớp 2: Backend JS -> Backend Python (Internal Service Token - JWT v2)

- Server JS đóng vai trò là "người bảo vệ". Sau khi xác thực học sinh, nếu cần dữ liệu từ Server Python, nó sẽ tạo một **Internal JWT Token**.
- Token này được ký bằng một `SECRET_KEY` nội bộ mà chỉ hai Server biết.
- **Payload**: Ngoài thông tin học sinh, nó còn chứa `transactionId` và `expiry` cực ngắn (30-60 giây) để ngăn chặn tấn công Replay.
- Server Python kiểm tra Token này trước khi trả về dữ liệu đề thi. Học sinh không bao giờ có thể gọi trực tiếp lên Server Python.

---

## 3. LOGIC NGHIỆP VỤ & QUY TRÌNH THI (RUNTIME LOGIC)

### 3.1. Giai đoạn: Khởi tạo Phiên (Handshake)

1.  **Frontend**: Gửi yêu cầu `startExam`.
2.  **JS Backend**:
    - Kiểm tra giới hạn (Rate limiting) và quyền của học sinh trong lớp.
    - Gọi sang **Python Backend** để lấy đề thi và khởi tạo `Attempt` trong Database.
    - Trả về `AttemptId` cho Frontend.
3.  **Frontend**: Hiển thị màn hình **Splash** (2s) và nạp dữ liệu mờ (Blur) đè lên quy tắc phòng thi.

### 3.2. Giai đoạn: Thực thi (No-Mercy Robotic Mode)

Trong lúc thi, sự phối hợp giữa Frontend và Backend diễn ra liên tục:

- **Socket.io Connection**: Kết nối duy nhất giữa Client và Server JS.
  - JS Server giữ "mối liên kết sống". Nếu mất kết nối, JS Server ngay lập tức thông báo cho Python Server khóa bài.
- **Heartbeat & Event Logging**:
  - Mỗi 10 giây, Client gửi tín hiệu sống.
  - Mọi hành động gian lận (Thoát Fullscreen, F12, Chuyển Tab) được Frontend đóng gói và đẩy trực tiếp vào luồng bảo mật.
- **Snapshot Persistence**:
  - Mỗi câu trả lời được lưu tức thì vào **Redis** thông qua Socket.
  - Cuối buổi thi, JS Server đồng bộ toàn bộ snapshot này từ Redis vào Postgres (thông qua Python Core) để lưu trữ vĩnh viễn.

### 3.3. Giai đoạn: Kết thúc bài thi (Termination)

- **Hợp lệ**: Học sinh nhấn nộp bài -> JS Server gọi API Python chấm điểm -> Trả kết quả và ngắt kết nối an toàn.
- **Bất thường (Robotic Termination)**:
  - Đóng Tab/Rớt mạng: Server JS phát hiện Socket ngắt đột ngột -> Tự động kích hoạt quy trình nộp bài "Cưỡng bức" với dữ liệu snapshot cuối cùng có được.
  - Không cảnh báo, không nhân nhượng.

---

## 4. CÔNG NGHỆ SỬ DỤNG (TECH STACK REVEAL)

- **Frontend**: Next.js 14, Ant Design, Tailwind CSS, Framer Motion (cho hiệu ứng Reveal).
- **Backend Orchestrator**: Node.js (Next.js API Routes), Socket.io.
- **Core Engine**: Python 3.10+, FastAPI (Hiệu suất cao cho tính toán).
- **Security Logic**:
  - `useAntiCheat` (Frontend): Hook quản lý sự kiện DOM & Browser API.
  - `Security Middleware` (Python): Chặn IP lạ, chỉ chấp nhận request từ Server IP của Node.js.
- **Storage**:
  - **PostgreSQL**: Lưu trữ dữ liệu quan hệ (Học sinh, Lớp, Kết quả).
  - **Redis**: Lưu trữ bộ nhớ tạm (Phiên thi, Snapshot đáp án, Violations).

---

## 5. CÁC LỚP BẢO MẬT TRỌNG YẾU (SECURITY HIERARCHY)

1.  **Lớp 0 (Vật lý)**: Chỉ cho phép truy cập Web qua HTTPS/SSL.
2.  **Lớp 1 (Browser)**: Chặn DevTools, chuột phải, Coppy/Paste và giám sát Visibility.
3.  **Lớp 2 (Network)**: Xác thực JWT v1 (User) và JWT v2 (Service-to-Service).
4.  **Lớp 3 (Logic)**: Robotic Mode xử lý các hành vi "Disconnect" và "Pagehide".
5.  **Lớp 4 (Data)**: Toàn bộ đáp án được ghi nhận theo Snapshot, không cho phép sửa đổi dữ liệu đã ghi.

---

_Tài liệu này được biên soạn cho đội ngũ phát triển và vận hành hệ thống AIO. Đảm bảo tính minh bạch từ những dòng code Frontend đến những logic xử lý sâu nhất tại Backend Python._
