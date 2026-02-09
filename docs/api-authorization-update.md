# 🔐 API Authorization Configuration - Frontend Update

## 📋 Tóm tắt

Đã cấu hình lại toàn bộ frontend API calls để sử dụng JWT authorization thông qua NestJS proxy thay vì gọi trực tiếp đến Python server.

## 🎯 Vấn đề trước đó

### Backend (NestJS + Python)

✅ **Đã có bảo vệ**: Tất cả AI endpoints trong `ai.controller.ts` đã được bảo vệ bởi `@UseGuards(JwtAuthGuard)`
✅ **Đã extract user**: Sử dụng `req.user.user_id` từ JWT token

### Frontend (React/Next.js)

❌ **Vấn đề**: Các file API client đang gọi **trực tiếp** đến Python server
❌ **Thiếu auth**: Không có Authorization header trong requests
❌ **Bypass security**: Bỏ qua layer bảo vệ của NestJS

## ✅ Giải pháp đã triển khai

### 1. **Refactor `rag-exams.ts`**

**Trước:**

```typescript
import axios, { AxiosInstance } from "axios";
const AI_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL + "/ai-exam";
const aiApiClient: AxiosInstance = axios.create({
  baseURL: AI_API_URL,
  // Không có auth interceptor
});
```

**Sau:**

```typescript
import apiClient from "@/app/config/api";
// ✅ Sử dụng apiClient với JWT interceptor tích hợp
```

### 2. **Refactor `exam-attempts.ts`**

**Trước:**

```typescript
import axios from "axios";
const AI_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL;
// Gọi trực tiếp: axios.post(`${AI_API_URL}/api/exams/...`)
```

**Sau:**

```typescript
import apiClient from "@/app/config/api";
// ✅ Gọi qua proxy: apiClient.post("/api/exams/...")
```

### 3. **Cập nhật Endpoint Paths**

| Endpoint cũ (Direct Python) | Endpoint mới (NestJS Proxy)               |
| --------------------------- | ----------------------------------------- |
| `/tests/class/:id/teacher`  | `/ai-exam/tests/class/:id/teacher`        |
| `/test/:id`                 | `/ai-exam/test/:id`                       |
| `/test/:id/publish`         | `/ai-exam/test/:id/publish`               |
| `/question/:id`             | `/ai-exam/question/:id`                   |
| `/api/exams/attempt/start`  | `/api/exams/attempt/start` _(unchanged)_  |
| `/api/exams/attempt/submit` | `/api/exams/attempt/submit` _(unchanged)_ |

## 🔄 Flow mới

```
Frontend Component
    ↓
apiClient (với JWT interceptor)
    ↓ (Authorization: Bearer <token>)
NestJS Controller (@UseGuards(JwtAuthGuard))
    ↓ (Extract user từ token)
NestJS AI Service (Proxy)
    ↓ (Thêm X-Internal-Secret header)
Python AI Server
```

## 📁 Files đã thay đổi

### Modified Files

1. **`/lib/api/rag-exams.ts`**
   - Thay `aiApiClient` → `apiClient`
   - Cập nhật tất cả endpoint paths với `/ai-exam` prefix
   - Functions: `getRagTestsByClass`, `getRagTestDetail`, `deleteRagTest`, `deleteRagTestsByClass`, `updateRagTest`, `publishRagTest`, `updateRagQuestion`

2. **`/lib/api/exam-attempts.ts`**
   - Thay `axios` → `apiClient`
   - Loại bỏ `AI_API_URL` constant
   - Functions: `startExamAttempt`, `submitExamAttempt`, `logSecurityEvent`, `getTestAttempts`

### Unchanged Files (Already Correct)

- **`/lib/api/writing.ts`** - Đã sử dụng `apiClient` từ đầu ✅

## 🔒 Security Benefits

1. **JWT Authentication**: Mọi request đều có Authorization header
2. **Token Refresh**: Tự động refresh token khi hết hạn
3. **Centralized Auth**: Tất cả auth logic ở một nơi (`apiClient`)
4. **CSRF Protection**: Có thể bật CSRF token nếu cần
5. **Rate Limiting**: Backend có thể áp dụng rate limiting theo user
6. **Audit Trail**: Backend có thể log tất cả actions theo user

## 🧪 Testing Checklist

### Functional Tests

- [ ] Tạo đề thi AI (Create Exam)
- [ ] Xem danh sách đề thi (List Exams)
- [ ] Xem chi tiết đề thi (View Exam Detail)
- [ ] Cập nhật đề thi (Update Exam)
- [ ] Xuất bản/Hủy xuất bản (Publish/Unpublish)
- [ ] Xóa đề thi (Delete Exam)
- [ ] Cập nhật câu hỏi (Update Question)
- [ ] Bắt đầu làm bài (Start Attempt)
- [ ] Nộp bài (Submit Attempt)
- [ ] Xem lịch sử làm bài (View Attempts)

### Security Tests

- [ ] Verify Authorization header được gửi
- [ ] Test với token hết hạn (should auto-refresh)
- [ ] Test với token không hợp lệ (should redirect to login)
- [ ] Test với user không có quyền (should return 403)

### Error Handling

- [ ] Network error handling
- [ ] Server error (500) handling
- [ ] Validation error (400) handling
- [ ] Unauthorized (401) handling

## 📊 Impact Analysis

### Components sử dụng API này

1. `/app/admin/classes/page.tsx` - Xóa đề thi khi xóa lớp
2. `/app/admin/classes/[id]/page.tsx` - Quản lý đề thi trong lớp
3. `/app/admin/classes/[id]/exams/[examId]/page.tsx` - Xem chi tiết đề thi
4. `/app/admin/classes/[id]/examinate/ai_editor/` - Editor đề thi AI

### Breaking Changes

**KHÔNG CÓ** - API signatures không thay đổi, chỉ thay đổi implementation

## 🚀 Deployment Notes

### Environment Variables (Không thay đổi)

```env
NEXT_PUBLIC_API_URL=https://api.edulearning.io.vn/api
```

### Backend Requirements

- NestJS server phải chạy và có `ai.controller.ts` với `@UseGuards(JwtAuthGuard)`
- Python AI server phải chạy và accept `X-Internal-Secret` header

## 📝 Next Steps

1. **Test thoroughly** trên development environment
2. **Monitor logs** để đảm bảo không có lỗi auth
3. **Update documentation** nếu có API mới
4. **Consider adding** request/response logging cho debugging

## 🔗 Related Files

### Backend

- `/Sever_Linux/Edulearn-Sever/src/ai/ai.controller.ts`
- `/Sever_Linux/Edulearn-Sever/src/ai/ai.service.ts`
- `/Sever_Linux/Edulearn-Sever/src/auth/strategy/jwt-auth.guard.ts`

### Frontend

- `/EduLearn-Client/app/config/api.ts` - Main API client với JWT interceptor
- `/EduLearn-Client/lib/api/rag-exams.ts` - RAG exam APIs
- `/EduLearn-Client/lib/api/exam-attempts.ts` - Exam attempt APIs
- `/EduLearn-Client/lib/api/writing.ts` - Writing tutor APIs

---

**Date**: 2026-02-09
**Author**: Antigravity AI
**Status**: ✅ Completed
