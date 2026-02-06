# API Proxy Services Architecture

Tài liệu này mô tả kiến trúc mới của API Proxy sau khi refactor thành các services riêng biệt.

## 📁 Cấu trúc Services

### 1. **Rate Limiting Service** (`rateLimiter.ts`)
**Chức năng:** Quản lý rate limiting cho API requests

**Features:**
- In-memory rate limiting với configurable limits
- IP-based rate limiting
- Auto cleanup expired records
- Rate limit stats

**Usage:**
```typescript
import { rateLimiter } from './rateLimiter';

const clientIP = rateLimiter.getClientIP(request.headers);
const identifier = rateLimiter.createIdentifier('api-proxy', clientIP);
const result = rateLimiter.checkRateLimit(identifier);

if (!result.success) {
  // Handle rate limit exceeded
}
```

---

### 2. **Cookie Filtering Service** (`cookieFilter.ts`)
**Chức năng:** Lọc và sanitize cookies để bảo mật

**Features:**
- Filter cookies theo whitelist
- Extract user ID từ cookies
- Clean Set-Cookie headers
- Process Set-Cookie headers từ response

**Usage:**
```typescript
import { cookieFilter } from './cookieFilter';

// Filter cookies
const filtered = cookieFilter.filterCookies(cookieHeader);

// Extract user ID
const userId = cookieFilter.extractUserId(cookieHeader);

// Clean Set-Cookie headers
const cleaned = cookieFilter.cleanSetCookie(setCookieHeader);
```

---

### 3. **SSRF Protection Service** (`ssrfProtection.ts`)
**Chức năng:** Bảo vệ chống SSRF (Server-Side Request Forgery) attacks

**Features:**
- Validate API paths (whitelist)
- Validate target URLs
- Build target URLs safely
- Extract paths từ request URLs

**Usage:**
```typescript
import { ssrfProtection } from './ssrfProtection';

// Validate request
const validation = ssrfProtection.validateRequest(requestUrl, backendUrl);
if (!validation.valid) {
  // Handle invalid request
}
```

---

### 4. **Request Handler Service** (`requestHandler.ts`)
**Chức năng:** Xây dựng và thực thi requests đến backend

**Features:**
- Build request headers
- Extract request body
- Build request configuration
- Execute requests với timeout

**Usage:**
```typescript
import { requestHandler } from './requestHandler';

// Build request config
const config = await requestHandler.buildRequestConfig(
  request,
  method,
  targetUrl
);

// Execute request
const response = await requestHandler.executeRequest(config);
```

---

### 5. **Response Handler Service** (`responseHandler.ts`)
**Chức năng:** Xử lý và format responses từ backend

**Features:**
- Process response data (JSON/text)
- Build response headers
- Process Set-Cookie headers
- Create error responses
- Create rate limit responses

**Usage:**
```typescript
import { responseHandler } from './responseHandler';

// Process response
const processed = await responseHandler.processResponse(response, 'MISS');

// Create error response
const errorResponse = responseHandler.createErrorResponse('Error message', 500);
```

---

## 🔄 Request Flow

```
1. Request arrives
   ↓
2. Rate Limiting Check (rateLimiter)
   ↓
3. SSRF Protection (ssrfProtection)
   ↓
4. Cache Check (proxyCache) - for GET requests
   ↓
5. Build Request (requestHandler)
   ↓
6. Execute Request (requestHandler)
   ↓
7. Process Response (responseHandler)
   ↓
8. Cache Response (proxyCache) - for GET requests
   ↓
9. Return Response
```

---

## ✅ Lợi ích của kiến trúc mới

### 1. **Separation of Concerns**
- Mỗi service có trách nhiệm riêng biệt
- Dễ hiểu và maintain

### 2. **Testability**
- Mỗi service có thể test độc lập
- Dễ mock dependencies
- Unit tests dễ viết hơn

### 3. **Reusability**
- Services có thể reuse ở nơi khác
- Không duplicate code

### 4. **Maintainability**
- Code dễ đọc hơn
- Dễ thêm features mới
- Dễ fix bugs

### 5. **Scalability**
- Dễ thay thế implementation (e.g., Redis cho rate limiting)
- Dễ thêm services mới

---

## 🧪 Testing

### Unit Tests Example

```typescript
// rateLimiter.test.ts
import { rateLimiter } from './rateLimiter';

describe('RateLimiterService', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  it('should allow requests within limit', () => {
    const result = rateLimiter.checkRateLimit('test:ip', 10, 60000);
    expect(result.success).toBe(true);
  });

  it('should reject requests over limit', () => {
    for (let i = 0; i < 10; i++) {
      rateLimiter.checkRateLimit('test:ip', 10, 60000);
    }
    const result = rateLimiter.checkRateLimit('test:ip', 10, 60000);
    expect(result.success).toBe(false);
  });
});
```

---

## 📝 Notes

- Tất cả services là singleton instances
- Services tự cleanup expired data
- Services có error handling riêng
- Services có thể được extend dễ dàng

---

**Last updated:** 2026-01-23  
**Version:** 1.0
