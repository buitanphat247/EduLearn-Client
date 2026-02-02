# 📚 TÀI LIỆU KIẾN TRÚC FRONTEND - EduLearn Next.js

## 🏗️ TỔNG QUAN KIẾN TRÚC

Frontend được xây dựng trên **Next.js 16** với **App Router**, sử dụng:
- **React 19** với TypeScript
- **Ant Design** + **Tailwind CSS** cho UI
- **Socket.IO Client** cho real-time communication
- **Cookie-based Authentication** (JWT tokens)

---

## 📁 CẤU TRÚC THƯ MỤC CHI TIẾT

### 1. `/app` - Routes & Pages (Next.js App Router)

#### 1.1 `/app/layout.tsx` - Root Layout
- **Chức năng**: Layout gốc của toàn bộ ứng dụng
- **Tính năng**:
  - Load font Roboto (optimized)
  - Preconnect Google Fonts
  - Prefetch critical routes
  - Dark mode initialization script (inline)
  - Providers wrapper (ThemeProvider, AntdRegistry)

#### 1.2 `/app/providers.tsx` - Global Providers
- **Chức năng**: Wrap toàn bộ app với các providers cần thiết
- **Providers**:
  - `ThemeProvider`: Quản lý dark/light mode
  - `AntdConfigProvider`: Cấu hình Ant Design theo theme
  - `App`: Ant Design App component (cho message, notification)

#### 1.3 `/app/middleware.ts` - Route Protection
- **Chức năng**: Bảo vệ routes và xử lý authentication
- **Logic**:
  - Check cookie `_u` (user session) để xác định đã đăng nhập
  - Protected routes: `/admin`, `/user`, `/profile`, `/super-admin`
  - Redirect về `/auth` nếu chưa đăng nhập
  - Redirect về `/` nếu đã đăng nhập nhưng vào `/auth`
  - Skip middleware cho API routes và static files

#### 1.4 `/app/(root)/` - Public Routes
**Layout**: `/app/(root)/layout.tsx`
- Header + Footer cho public pages
- DarkConfigProvider

**Pages**:
- `/app/(root)/page.tsx` - Homepage
  - Hero section
  - Stats
  - Features
  - Testimonials
  - Integrations
  - Call to Action

- `/app/(root)/about/page.tsx` - Giới thiệu
- `/app/(root)/events/page.tsx` - Sự kiện
- `/app/(root)/news/` - Tin tức
  - `page.tsx` - Danh sách tin
  - `[id]/page.tsx` - Chi tiết tin

- `/app/(root)/features/` - Tính năng học tập
  - `[type]/page.tsx` - Dynamic route cho vocabulary/writing/listening
  - `vocabulary/`:
    - `[folderId]/page.tsx` - Danh sách từ vựng trong folder
    - `flashcard/[folderId]/page.tsx` - **Flashcard mode** (file bạn đang xem)
  - `writing/[id]/page.tsx` - Luyện viết
  - `listening/[id]/page.tsx` - Luyện nghe

- `/app/(root)/guide/` - Hướng dẫn
  - `page.tsx` - Guide page với sidebar
  - `docs/` - Markdown files cho documentation
  - `GuideContent.tsx`, `GuideSidebar.tsx` - Components

- `/app/(root)/innovation/` - Công nghệ & Đổi mới
  - Tương tự guide, có docs và components

- `/app/(root)/faq/` - FAQ
  - `page.tsx`, `FAQClient.tsx`
  - `docs/README.md` - FAQ content

- `/app/(root)/profile/page.tsx` - Profile cá nhân
- `/app/(root)/system/page.tsx` - Thông tin hệ thống

#### 1.5 `/app/auth/` - Authentication
- `layout.tsx` - Layout riêng cho auth (không có Header/Footer)
- `page.tsx` - **Auth Page Component**
  - Sign In / Sign Up form
  - Social login buttons (Google, Facebook - placeholder)
  - Form validation
  - Auto redirect nếu đã đăng nhập
  - Animated background blobs
  - Theme-aware styling

#### 1.6 `/app/admin/` - Admin Dashboard
- `layout.tsx` - Admin layout với sidebar
- `AdminLayoutClient.tsx` - Client component cho layout
- `page.tsx` - Dashboard chính
- `classes/` - Quản lý lớp học
  - `page.tsx` - Danh sách lớp
  - `[id]/` - Chi tiết lớp với nhiều sub-pages
- `students/page.tsx` - Quản lý học sinh
- `document-crawl/page.tsx` - Crawl tài liệu
- `settings/page.tsx` - Cài đặt

#### 1.7 `/app/user/` - Student Dashboard
- `layout.tsx` - User layout với sidebar
- `UserLayoutClient.tsx` - Client component
- `page.tsx` - Dashboard học sinh
- `classes/` - Lớp học của học sinh
  - `[id]/` - Chi tiết lớp
  - `exams/[examId]/` - Trang thi với anti-cheat
- `documents/page.tsx` - Tài liệu
- `settings/page.tsx` - Cài đặt

#### 1.8 `/app/super-admin/` - Super Admin
- Tương tự admin nhưng với quyền cao hơn
- `permissions/` - Quản lý phân quyền
- `accounts/` - Quản lý tài khoản
- `documents-crawl/` - Crawl tài liệu
- `events/`, `posts/`, `notification/` - Quản lý nội dung

#### 1.9 `/app/social/` - Social & Chat
- `layout.tsx` - Social layout
- `page.tsx` - Chat room list
- `SocialContext.tsx` - Context cho social features
- `SocialShell.tsx` - Shell component
- `contacts/page.tsx` - Danh bạ

#### 1.10 `/app/api-proxy/` - API Proxy Routes
**Mục đích**: Proxy requests đến backend, xử lý file upload lớn

- `[...path]/route.ts` - Catch-all proxy cho NestJS API
- `auth/` - Auth endpoints
  - `decrypt-user/route.ts` - Giải mã cookie `_u`
  - `refresh/route.ts` - Refresh token
  - `signout/route.ts` - Sign out
- `assignment-attachments/` - Upload file bài tập
- `friends/` - Friend requests
- `writing-chat-bot/` - AI writing chat

#### 1.11 `/app/components/` - Reusable Components

**1.11.1 `/app/components/layout/`**
- `Header.tsx` - Server component header (wrapper)
- `HeaderClient.tsx` - **Client header component**
  - Navigation menu
  - User dropdown
  - Theme toggle
  - Auth state management
- `Footer.tsx` - Footer với links và social
- `AdminSidebar.tsx`, `UserSidebar.tsx`, `SuperAdminSidebar.tsx` - Sidebars
- `NotificationPanel.tsx` - Notification dropdown
- `AIChatPanel.tsx` - AI chat panel
- `ScrollProgress.tsx` - Scroll progress bar
- `DashboardFooter.tsx` - Footer cho dashboards

**1.11.2 `/app/components/auth/`**
- (Empty - auth logic trong `/app/auth/page.tsx`)

**1.11.3 `/app/components/features/`**
- `FeaturesHeader.tsx` - Header cho features page
- `vocabulary/`:
  - `VocabularyFeature.tsx` - Main vocabulary feature page
  - `VocabularyDetailSkeleton.tsx` - Loading skeleton
  - `VocabularyFlashcardSkeleton.tsx` - **Flashcard skeleton**
- `writing/`:
  - `WritingFeature.tsx`
  - `WritingFeatureSkeleton.tsx`
  - `WritingPracticeSkeleton.tsx`
- `listening/`:
  - `ListeningFeature.tsx`
  - `ListeningFeatureSkeleton.tsx`
- `translator/TranslatorFeature.tsx`

**1.11.4 `/app/components/common/`**
- Common utilities và shared components
- `DarkConfigProvider.tsx` - Dark mode config
- `PrefetchRoutes.tsx` - Prefetch routes component
- `ScrollAnimation.tsx` - Scroll animations

**1.11.5 `/app/components/home/`**
- Homepage components:
  - `Hero.tsx`, `Stats.tsx`, `Features.tsx`
  - `Events.tsx`, `News.tsx`, `Testimonials.tsx`
  - `Integrations.tsx`, `ValueProps.tsx`, `CallToAction.tsx`

**1.11.6 `/app/components/classes/`**
- Class management components
- Class list, class detail, student management

**1.11.7 `/app/components/exams/`**
- Exam components với anti-cheat
- Exam session, question display, timer

**1.11.8 `/app/components/social/`**
- Chat components
- Friend list, chat room, message display

**1.11.9 `/app/components/vocabulary/`**
- Vocabulary-specific components

#### 1.12 `/app/context/` - React Contexts
- `ThemeContext.tsx` - **Theme Management**
  - Dark/Light mode toggle
  - View Transition API cho smooth theme switch
  - localStorage persistence
  - Initial theme từ inline script

#### 1.13 `/app/hooks/` - Custom Hooks
- `useUserId.ts` - **Get user ID from cookies**
  - SessionStorage cache
  - Async cookie decryption
  - Event-based cache updates
- `useExamSocket.ts` - **Exam socket connection**
  - Connect to Python Flask server
  - Join exam/attempt rooms
  - Report violations
- `useAntiCheat.ts` - Anti-cheat detection
- `useFileUpload.ts` - File upload handling

#### 1.14 `/app/config/` - Configuration
- `api.ts` - **Axios API Client**
  - Base URL configuration
  - Request/Response interceptors
  - Auto token refresh
  - Response caching
  - Error handling
  - Cookie-based auth

---

### 2. `/lib` - Utilities & API Clients

#### 2.1 `/lib/api/` - API Client Functions
- `auth.ts` - Authentication APIs
  - `signIn()`, `signUp()`, `signOut()`
  - `getProfile()`
- `vocabulary.ts` - Vocabulary APIs
  - `getFolders()`, `getVocabulariesByFolder()`
- `classes.ts` - Class management
- `assignments.ts` - Assignment APIs
- `chat-*.ts` - Chat APIs
- `friends.ts` - Friend management
- `notifications.ts` - Notifications
- `rag-exams.ts` - AI exam generation
- `writing.ts` - Writing APIs
- `index.ts` - Exports

#### 2.2 `/lib/socket/` - Socket.IO Clients
- `client.ts` - **Base Socket Client (Singleton)**
  - Connection management
  - Authentication
  - Event listeners
- `chat-client.ts` - Chat socket
- `class-client.ts` - Class socket
- `friend-client.ts` - Friend socket
- `notification-client.ts` - Notification socket
- `index.ts` - Exports

#### 2.3 `/lib/utils/` - Utility Functions
- `cookies.ts` - **Cookie Management**
  - `getCookie()` - Get cookie với caching
  - `getUserIdFromCookieAsync()` - Decrypt user cookie
  - `getUserIdFromSession()` - Get từ sessionStorage
  - `saveUserDataToSession()` - Save to sessionStorage
  - `clearUserCache()` - Clear all caches
- `auth-server.ts` - Server-side auth utilities
  - `getServerAuthState()` - Get auth state từ cookies
- `cookie-encryption.ts` - Cookie encryption helpers
- `server-cookie-decrypt.ts` - Server-side decryption
- `fileUtils.tsx` - File utilities
- `fileName.ts` - Filename helpers
- `classUtils.ts` - Class utilities

---

### 3. `/interface` - TypeScript Interfaces
- `auth.ts` - Auth types
- `chat.ts` - Chat types
- `classes.ts` - Class types
- `common.ts` - Common types
- `exercises.ts` - Exercise types
- `students.ts` - Student types

---

### 4. Configuration Files

#### 4.1 `next.config.ts`
- **Rewrites**: Proxy `/api-proxy/*` → Backend API
- **Headers**: Cache control cho static assets
- **Images**: Remote patterns cho image optimization
- **Compiler**: Remove console in production
- **Experimental**:
  - `optimizePackageImports`: Optimize Ant Design imports
  - `serverActions`: 500MB body size limit
- **Output**: Standalone mode cho Docker

#### 4.2 `tailwind.config.ts`
- Dark mode: `class` strategy
- Content paths: `./app/**/*`, `./components/**/*`, `./lib/**/*`

#### 4.3 `tsconfig.json`
- Target: ES2017
- Module: ESNext
- Path aliases: `@/*` → root
- Strict mode enabled

---

## 🔄 LUỒNG HOẠT ĐỘNG CHÍNH

### Authentication Flow
1. User đăng nhập → `signIn()` gọi API
2. Backend set cookies: `_at` (access token), `_u` (encrypted user data)
3. Frontend redirect về `/profile`
4. Middleware check cookie `_u` để protect routes
5. Components đọc user data từ:
   - Server-side: `getServerAuthState()` (từ cookies)
   - Client-side: `getUserIdFromCookieAsync()` → decrypt → sessionStorage cache

### Theme Management Flow
1. Inline script trong `layout.tsx` set initial theme
2. `ThemeContext` sync với DOM class
3. Toggle theme → View Transition API animation
4. Persist to localStorage

### API Request Flow
1. Component gọi function từ `/lib/api/*`
2. Axios interceptor thêm `Authorization: Bearer {token}` từ cookie
3. Request → `/api-proxy/*` → Next.js rewrites → Backend
4. Response caching (30s TTL)
5. Auto refresh token nếu 401

### Socket Connection Flow
1. Component sử dụng hook (e.g., `useExamSocket`)
2. Hook tạo socket connection với auth
3. Join specific rooms (exam, chat, etc.)
4. Listen to events
5. Cleanup on unmount

---

## 🎨 STYLING STRATEGY

### Tailwind CSS
- Utility-first approach
- Dark mode: `.dark` class trên `<html>`
- Custom colors: `slate-*`, `blue-*`
- Responsive: `md:`, `lg:` breakpoints

### Ant Design
- Theme config trong `providers.tsx`
- Dark algorithm khi dark mode
- Custom token colors
- Component-level overrides

### CSS Classes Pattern
```tsx
// Light mode default, dark mode override
className="bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200"
```

---

## 🔐 SECURITY FEATURES

1. **Cookie-based Auth**: Tokens trong httpOnly cookies
2. **Encrypted Cookies**: User data được mã hóa
3. **Middleware Protection**: Route-level auth check
4. **Token Refresh**: Auto refresh khi hết hạn
5. **SessionStorage Cache**: Tránh decrypt nhiều lần

---

## 📦 KEY DEPENDENCIES

- `next`: 16.0.5
- `react`: 19.2.0
- `antd`: 6.0.0
- `tailwindcss`: 4
- `socket.io-client`: 4.8.3
- `axios`: 1.13.2
- `@tiptap/react`: Rich text editor
- `mathlive`: Math input
- `katex`: Math rendering

---

## 🚀 OPTIMIZATION FEATURES

1. **Code Splitting**: Next.js automatic
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: Next.js font loading
4. **Route Prefetching**: `router.prefetch()`
5. **Response Caching**: 30s TTL cho GET requests
6. **Cookie Caching**: 100ms cache cho cookie reads
7. **SessionStorage**: Cache user data
8. **Standalone Output**: Docker-ready build

---

## 📝 NOTES QUAN TRỌNG

1. **Cookie Strategy**: 
   - `_at`: Access token (15 phút)
   - `_u`: Encrypted user data (7 ngày)
   - Middleware chỉ check `_u` (không check `_at`)

2. **Server vs Client Components**:
   - Server components mặc định
   - `"use client"` khi cần hooks, events, browser APIs

3. **API Proxy**:
   - `/api-proxy/*` → Backend NestJS
   - Một số routes có handler riêng (file upload, Flask API)

4. **Socket Connections**:
   - Base socket: NestJS server
   - Exam socket: Python Flask server
   - Multiple namespaces: `/chat`, `/class`, `/notification`

5. **Theme Transition**:
   - View Transition API cho smooth animation
   - Fallback cho browsers không support

---

## 🔍 FILE QUAN TRỌNG CẦN HIỂU

1. **`/app/config/api.ts`** - API client configuration
2. **`/app/middleware.ts`** - Route protection
3. **`/app/context/ThemeContext.tsx`** - Theme management
4. **`/lib/utils/cookies.ts`** - Cookie utilities
5. **`/app/components/layout/HeaderClient.tsx`** - Header logic
6. **`/app/(root)/features/vocabulary/flashcard/[folderId]/page.tsx`** - Flashcard page (file bạn đang xem)

---

*Tài liệu này cung cấp overview chi tiết về kiến trúc frontend. Để hiểu sâu hơn, hãy đọc code trong từng file được đề cập.*
