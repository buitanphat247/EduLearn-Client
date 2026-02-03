# 🔍 Loading States Audit Report - app/(root)

**Ngày kiểm tra:** 2026-01-23  
**Scope:** Tất cả pages trong `app/(root)/`  
**Mục tiêu:** Xác định pages thiếu loading states

---

## 📊 TỔNG QUAN

- **Tổng số pages:** 20 pages
- **Pages có loading states:** 9 pages ✅
- **Pages thiếu loading states:** 11 pages ❌
- **Tỷ lệ coverage:** 45%

---

## ✅ PAGES CÓ LOADING STATES

### 1. `app/(root)/listening/[id]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `ListeningDetailSkeleton`
- **Implementation:**
  ```typescript
  if (loading) {
    return <ListeningDetailSkeleton />;
  }
  ```

### 2. `app/(root)/vocabulary/quiz/[folderId]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `Spin` với tip
- **Implementation:**
  ```typescript
  if (loading) {
    return (
      <main>
        <Spin size="large" tip="Đang tải câu hỏi..." />
      </main>
    );
  }
  ```

### 3. `app/(root)/vocabulary/typing/[folderId]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `Spin` với tip
- **Implementation:**
  ```typescript
  if (loading) {
    return (
      <main>
        <Spin size="large" tip="Đang tải câu hỏi..." />
      </main>
    );
  }
  ```

### 4. `app/(root)/vocabulary/[folderId]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `VocabularyDetailSkeleton`
- **Implementation:**
  ```typescript
  if (loading) {
    return <VocabularyDetailSkeleton />;
  }
  ```

### 5. `app/(root)/vocabulary/flashcard/[folderId]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `VocabularyFlashcardSkeleton`
- **Implementation:**
  ```typescript
  if (loading) {
    return <VocabularyFlashcardSkeleton />;
  }
  ```

### 6. `app/(root)/writing/[id]/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `WritingPracticeSkeleton`
- **Implementation:**
  ```typescript
  if (loading) {
    return <WritingPracticeSkeleton />;
  }
  ```

### 7. `app/(root)/events/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `EventsSkeleton`
- **Implementation:**
  ```typescript
  {loading ? (
    <EventsSkeleton />
  ) : (
    // content
  )}
  ```

### 8. `app/(root)/news/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `PageSkeleton`
- **Implementation:**
  ```typescript
  {isLoading ? (
    <PageSkeleton itemCount={pageSize} variant="grid" columns={3} showHeader={false} />
  ) : (
    // content
  )}
  ```

### 9. `app/(root)/profile/page.tsx`
- **Status:** ✅ **CÓ**
- **Loading Component:** `ProfileSkeleton`
- **Implementation:**
  ```typescript
  if (loading) {
    return <ProfileSkeleton />;
  }
  ```

---

## ❌ PAGES THIẾU LOADING STATES

### 1. `app/(root)/page.tsx` (Home Page)
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Sử dụng `Suspense` với fallback `<div className="h-64" />` (quá đơn giản)
  - Không có loading state cho initial page load
  - Dynamic imports có fallback nhưng không phải skeleton loader
- **Đề xuất:**
  - Tạo `HomeSkeleton` component
  - Thêm loading state cho Hero, Stats, Features sections
  - Cải thiện Suspense fallbacks

### 2. `app/(root)/vocabulary/page.tsx`
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Dynamic import `VocabularyFeature` không có loading fallback
  - Không có loading state khi component đang load
- **Đề xuất:**
  - Thêm `loading` prop cho dynamic import
  - Tạo `VocabularyPageSkeleton` component
  - Hiển thị skeleton khi component đang load

### 3. `app/(root)/listening/page.tsx`
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Dynamic import `ListeningFeature` không có loading fallback
  - Không có loading state khi component đang load
- **Đề xuất:**
  - Thêm `loading` prop cho dynamic import
  - Tạo `ListeningPageSkeleton` component
  - Hiển thị skeleton khi component đang load

### 4. `app/(root)/writing/page.tsx`
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Dynamic import `WritingFeature` không có loading fallback
  - Không có loading state khi component đang load
- **Đề xuất:**
  - Thêm `loading` prop cho dynamic import
  - Tạo `WritingPageSkeleton` component
  - Hiển thị skeleton khi component đang load

### 5. `app/(root)/faq/page.tsx`
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Server component, không có loading state
  - Client component `FAQClient` có thể cần loading state khi fetch data
- **Đề xuất:**
  - Kiểm tra `FAQClient` component có loading state không
  - Nếu không, thêm loading state cho client component

### 6. `app/(root)/about/page.tsx`
- **Status:** ❌ **THIẾU** (Nhưng có thể chấp nhận được)
- **Vấn đề:**
  - Static content, không fetch data
  - Images có thể cần loading states
- **Đề xuất:**
  - Thêm image loading states nếu cần
  - Có thể bỏ qua vì là static content

### 7. `app/(root)/news/[id]/page.tsx`
- **Status:** ❌ **THIẾU**
- **Vấn đề:**
  - Sử dụng mock data, không fetch từ API
  - Không có loading state
  - Có import `NewsDetailSkeleton` nhưng không sử dụng
- **Đề xuất:**
  - Nếu chuyển sang fetch từ API, cần thêm loading state
  - Sử dụng `NewsDetailSkeleton` khi fetch data

### 8. `app/(root)/guide/page.tsx`
- **Status:** ❌ **THIẾU** (Nhưng có thể chấp nhận được)
- **Vấn đề:**
  - Server component, đọc file từ filesystem
  - Không có loading state cho client-side navigation
- **Đề xuất:**
  - Thêm loading state cho client-side navigation giữa các docs
  - Có thể sử dụng `Suspense` với skeleton

### 9. `app/(root)/innovation/page.tsx`
- **Status:** ❌ **THIẾU** (Nhưng có thể chấp nhận được)
- **Vấn đề:**
  - Server component, đọc file từ filesystem
  - Không có loading state cho client-side navigation
- **Đề xuất:**
  - Thêm loading state cho client-side navigation giữa các docs
  - Có thể sử dụng `Suspense` với skeleton

### 10. `app/(root)/system/page.tsx`
- **Status:** ❌ **THIẾU** (Nhưng có thể chấp nhận được)
- **Vấn đề:**
  - Static content, không fetch data
  - Hiển thị hardcoded system status
- **Đề xuất:**
  - Nếu chuyển sang fetch từ API, cần thêm loading state
  - Có thể bỏ qua vì là static content

### 11. `app/(root)/test-error/page.tsx`
- **Status:** ❌ **CHƯA KIỂM TRA**
- **Vấn đề:**
  - File này có thể là test file
- **Đề xuất:**
  - Kiểm tra file này có cần loading state không

---

## 🎯 ƯU TIÊN FIX

### 🔴 High Priority (Cần fix ngay)
1. **`app/(root)/vocabulary/page.tsx`** - Feature page quan trọng
2. **`app/(root)/listening/page.tsx`** - Feature page quan trọng
3. **`app/(root)/writing/page.tsx`** - Feature page quan trọng
4. **`app/(root)/page.tsx`** - Home page, first impression

### 🟡 Medium Priority (Nên fix)
5. **`app/(root)/faq/page.tsx`** - Kiểm tra FAQClient component
6. **`app/(root)/news/[id]/page.tsx`** - Nếu chuyển sang fetch từ API

### 🟢 Low Priority (Có thể bỏ qua)
7. **`app/(root)/about/page.tsx`** - Static content
8. **`app/(root)/guide/page.tsx`** - Server component, có thể thêm Suspense
9. **`app/(root)/innovation/page.tsx`** - Server component, có thể thêm Suspense
10. **`app/(root)/system/page.tsx`** - Static content

---

## 📝 ĐỀ XUẤT IMPLEMENTATION

### 1. Tạo Skeleton Components
- `HomeSkeleton.tsx` - Cho home page
- `VocabularyPageSkeleton.tsx` - Cho vocabulary listing page
- `ListeningPageSkeleton.tsx` - Cho listening listing page
- `WritingPageSkeleton.tsx` - Cho writing listing page

### 2. Cải thiện Dynamic Imports
```typescript
// Before
const VocabularyFeature = dynamic(
  () => import("@/app/components/features/vocabulary/VocabularyFeature"),
  { ssr: true }
);

// After
const VocabularyFeature = dynamic(
  () => import("@/app/components/features/vocabulary/VocabularyFeature"),
  {
    ssr: true,
    loading: () => <VocabularyPageSkeleton />
  }
);
```

### 3. Thêm Loading States cho Home Page
```typescript
// Thêm loading state cho initial load
const [isInitialLoading, setIsInitialLoading] = useState(true);

useEffect(() => {
  // Simulate initial load
  const timer = setTimeout(() => {
    setIsInitialLoading(false);
  }, 500);
  return () => clearTimeout(timer);
}, []);

if (isInitialLoading) {
  return <HomeSkeleton />;
}
```

---

## ✅ KẾT LUẬN

**Tổng kết:**
- 9/20 pages có loading states (45%)
- 11/20 pages thiếu loading states (55%)
- **Priority:** Cần fix 4 pages High Priority trước
- **Estimated time:** ~2-3 giờ cho High Priority pages

**Next Steps:**
1. Tạo skeleton components cho các pages thiếu
2. Cải thiện dynamic imports với loading fallbacks
3. Thêm loading states cho home page
4. Test và verify UX improvements
