# Hướng dẫn Test Prefetch

## Cách kiểm tra Prefetch đang hoạt động:

### 1. Mở Chrome DevTools
- Nhấn `F12` hoặc `Ctrl+Shift+I`
- Chọn tab **Console** để xem logs

### 2. Test Prefetch khi Hover
1. Hover vào bất kỳ link nào trong sidebar (ví dụ: "Quản lí lớp học")
2. Xem Console tab → Sẽ thấy log: `[Prefetch] Hovering over: /admin/classes`
3. Nếu thấy log → Prefetch đang hoạt động ✅

### 3. Kiểm tra trong Network Tab
1. Mở tab **Network**
2. **Clear** network log (icon 🚫)
3. **Bật "Preserve log"** (checkbox)
4. Hover vào link trong sidebar
5. Tìm requests có:
   - **Type**: `fetch` hoặc `xhr`
   - **Name**: Có pattern `?_rsc=...` hoặc route name
   - **Initiator**: `VM254:1` hoặc `next-router`
   - **Status**: `200` (thành công)

### 4. Filter để xem Prefetch
- Click vào filter **"Fetch/XHR"** hoặc **"Doc"**
- Prefetch requests thường nằm trong 2 loại này

### 5. Kiểm tra Performance
- Prefetch requests sẽ có **Time** rất nhanh (< 50ms)
- Nếu đã cache → **Size: (disk cache)** và **Time: 2-5ms**

## Lưu ý:
- Prefetch **CHỈ** xảy ra khi **hover** vào link
- Không hover → Không có prefetch request
- Prefetch requests có thể bị ẩn nếu đã được cache trước đó
