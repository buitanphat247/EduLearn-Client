# Hướng Dẫn Debug RefreshToken

## Các Vị Trí Quan Trọng Để Đặt Breakpoint

### 1. **API Interceptor - Xử Lý 401 Error** 
📁 File: `app/config/api.ts`

#### Breakpoint 1: Khi nhận 401 error
```typescript
// Line ~287-290
if (status !== 401) {
  return Promise.reject({ ...error, message: errorMessage, code: errorCode });
}
```
**Đặt breakpoint tại:** `if (status !== 401)` để kiểm tra khi nào 401 được trigger

#### Breakpoint 2: Bắt đầu refresh token
```typescript
// Line ~345-347
// Start refresh
isRefreshing = true;
if (isDev) console.log("[API] Refreshing token...");
```
**Đặt breakpoint tại:** `isRefreshing = true;` để xem khi nào refresh bắt đầu

#### Breakpoint 3: Gọi API refresh
```typescript
// Line ~350-357
const response = await axios.post(
  "/api-proxy/auth/refresh",
  {},
  {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  },
);
```
**Đặt breakpoint tại:** `await axios.post(...)` để xem request được gửi như thế nào

#### Breakpoint 4: Nhận response từ refresh
```typescript
// Line ~359-362
const accessToken =
  response.data?.access_token || response.data?.data?.access_token || response.data?.accessToken || response.data?.cookies?._at?.value;

if (!accessToken) throw new Error("No access token received from server");
```
**Đặt breakpoint tại:** `const accessToken = ...` để kiểm tra response data

#### Breakpoint 5: Xử lý cookies từ response
```typescript
// Line ~365-373
const cookies = response.data?.cookies;
if (cookies?._at) {
  const exp = new Date(Date.now() + cookies._at.maxAge);
  document.cookie = `_at=${encodeURIComponent(cookies._at.value)}; path=/; expires=${exp.toUTCString()}; SameSite=Lax`;
}
if (cookies?._u) {
  const exp = new Date(Date.now() + cookies._u.maxAge);
  document.cookie = `_u=${encodeURIComponent(cookies._u.value)}; path=/; expires=${exp.toUTCString()}; SameSite=Lax`;
}
```
**Đặt breakpoint tại:** `const cookies = response.data?.cookies;` để kiểm tra cookies

#### Breakpoint 6: Xử lý lỗi refresh
```typescript
// Line ~382-390
} catch (refreshError: any) {
  const code = refreshError?.response?.data?.code;
  if (isDev) console.log("[API] Refresh failed:", code);

  clearTokens();
  processQueue(refreshError as AxiosError, null);
  isRefreshing = false;
  if (typeof window !== "undefined") window.location.href = "/auth";
  return Promise.reject(refreshError);
}
```
**Đặt breakpoint tại:** `catch (refreshError: any)` để debug khi refresh fail

---

### 2. **API Proxy Route - Forward Request Đến Backend**
📁 File: `app/api-proxy/auth/refresh/route.ts`

#### Breakpoint 7: Nhận request từ frontend
```typescript
// Line ~7-17
export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';
  const url = `${backendUrl}/auth/refresh`;

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookieHeader) headers['Cookie'] = cookieHeader;
```
**Đặt breakpoint tại:** `const cookieHeader = request.headers.get('cookie') || '';` để kiểm tra cookies được forward

#### Breakpoint 8: Gọi backend API
```typescript
// Line ~22-27
const backendResponse = await fetch(url, {
  method: 'POST',
  headers,
  body: JSON.stringify({}),
  signal: controller.signal,
}).finally(() => clearTimeout(timeoutId));
```
**Đặt breakpoint tại:** `await fetch(url, ...)` để xem request gửi đến backend

#### Breakpoint 9: Nhận response từ backend
```typescript
// Line ~35-36
const data = await backendResponse.json();
const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
```
**Đặt breakpoint tại:** `const data = await backendResponse.json();` để kiểm tra response từ backend

#### Breakpoint 10: Xử lý Set-Cookie headers
```typescript
// Line ~38-51
// Forward Set-Cookie headers
const setCookies = typeof backendResponse.headers.getSetCookie === 'function'
  ? backendResponse.headers.getSetCookie()
  : [];

if (setCookies.length === 0) {
  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') setCookies.push(value);
  });
}

setCookies.forEach(cookie => {
  responseHeaders.append('Set-Cookie', cookie.replace(/;\s*domain=[^;]*/gi, ''));
});
```
**Đặt breakpoint tại:** `const setCookies = ...` để kiểm tra cookies từ backend

---

### 3. **Request Interceptor - Kiểm Tra Refresh Request**
📁 File: `app/config/api.ts`

#### Breakpoint 11: Request interceptor
```typescript
// Line ~243-256
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
    const isRefreshReq = config.url?.includes("/auth/refresh");
    const isRetry = config._retry === true;

    if (!isRefreshReq && !isRetry) {
      const auth = getCachedAuthHeader();
      if (auth) config.headers.Authorization = auth;
    } else if (isRetry && config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
```
**Đặt breakpoint tại:** `const isRefreshReq = config.url?.includes("/auth/refresh");` để kiểm tra request interceptor

---

## Cách Sử Dụng Breakpoint

### Trong VS Code:
1. Mở file cần debug
2. Click vào số dòng bên trái để đặt breakpoint (chấm đỏ)
3. Mở Debug panel (Ctrl+Shift+D)
4. Chọn "Next.js: debug server-side" hoặc "Next.js: debug full stack"
5. Start debugging (F5)
6. Trigger refresh token (ví dụ: đợi token hết hạn hoặc gọi API)

### Trong Chrome DevTools:
1. Mở DevTools (F12)
2. Vào tab "Sources"
3. Tìm file trong "Page" > "app" > "config" > "api.ts"
4. Click vào số dòng để đặt breakpoint
5. Trigger refresh token

---

## Các Biến Quan Trọng Cần Kiểm Tra

### Trong API Interceptor:
- `status` - HTTP status code (nên là 401)
- `errorCode` - Error code từ backend
- `isRefreshing` - Trạng thái đang refresh
- `response.data` - Response từ refresh API
- `accessToken` - Token mới nhận được
- `cookies` - Cookies từ response

### Trong API Proxy:
- `cookieHeader` - Cookies từ request
- `authHeader` - Authorization header
- `backendResponse` - Response từ backend
- `data` - Parsed JSON data
- `setCookies` - Set-Cookie headers

---

## Common Issues & Debug Tips

### Issue 1: "Cannot read properties of undefined (reading 'cookies')"
- **Check:** `response.data?.cookies` có undefined không?
- **Breakpoint:** Line 365 trong `api.ts`

### Issue 2: Refresh không được gọi
- **Check:** `status === 401` và `errorCode` là gì?
- **Breakpoint:** Line 287 trong `api.ts`

### Issue 3: Cookies không được set
- **Check:** `setCookies` có data không?
- **Breakpoint:** Line 38 trong `route.ts`

### Issue 4: Backend không nhận cookies
- **Check:** `cookieHeader` có giá trị không?
- **Breakpoint:** Line 12 trong `route.ts`

---

## Quick Debug Checklist

- [ ] Breakpoint tại 401 handler
- [ ] Breakpoint tại start refresh
- [ ] Breakpoint tại API call
- [ ] Breakpoint tại response handling
- [ ] Breakpoint tại cookie setting
- [ ] Breakpoint tại error handling
- [ ] Check Network tab trong DevTools
- [ ] Check Application > Cookies trong DevTools
- [ ] Check Console logs
