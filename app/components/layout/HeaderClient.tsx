"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Button, Dropdown, Avatar } from "antd";
import Swal from "sweetalert2";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from "@/app/components/common/iconRegistry";
import { BulbOutlined, BulbFilled, CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/lib/api/auth";
import type { AuthState } from "@/lib/utils/auth-server";
import { useTheme } from "@/app/context/ThemeContext";
import { saveUserDataToSession, getUserDataFromSession, getUserIdFromCookieAsync, clearUserCache } from "@/lib/utils/cookies";
import { getDecryptedUser } from "@/lib/utils/cookie-encryption";
import ScrollProgress from "./ScrollProgress";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import { getMediaUrl } from "@/lib/utils/media";
import { getCachedImageUrl } from "@/lib/utils/image-cache";
import { FEATURES } from "@/app/config/features";
import "./Header.css";

interface HeaderClientProps {
  initialAuth: AuthState;
  initialTheme?: "light" | "dark";
}

const fixUtf8 = (str: string | undefined | null): string => {
  if (!str) return "";
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (decoded.includes('\uFFFD')) return str;
    return decoded;
  } catch {
    return str;
  }
};

const NAV_LINKS = [
  { to: "/", label: "Trang chủ" },
] as const;

const ABOUT_ITEMS: MenuProps["items"] = [
  { key: "about", label: "Giới thiệu" },
  { key: "system", label: "Hệ thống" },
  { key: "guide", label: "Hướng dẫn" },
  { key: "innovation", label: "Công nghệ & Đổi mới" },
  { key: "roadmap", label: "Lộ trình phát triển" },
  { key: "faq", label: "FAQ" },
];

const ABOUT_ROUTES: Record<string, string> = {
  about: "/about",
  system: "/system",
  guide: "/guide",
  innovation: "/innovation",
  roadmap: "/roadmap",
  faq: "/faq",
};

export default function HeaderClient({ initialAuth }: HeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(() => {
    return initialAuth.authenticated && initialAuth.userData ? initialAuth.userData : null;
  });
  const [imgError, setImgError] = useState(false);
  // Anti-flicker: don't render login/user area until client has confirmed auth state
  const [isHydrated, setIsHydrated] = useState(() => {
    // If server already confirmed auth, we can render immediately
    return initialAuth.authenticated;
  });

  // Check if user has valid avatar
  const hasValidAvatar = useMemo(() => {
    if (!user?.avatar) return false;
    const avatarStr = String(user.avatar).trim();
    return avatarStr !== '' && avatarStr !== 'null' && avatarStr !== 'undefined';
  }, [user?.avatar]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    const syncUser = async () => {
      if (typeof window === "undefined") return;

      // ✅ Server is source of truth: if SSR says not authenticated,
      // clear stale client cache and don't trust sessionStorage
      if (!initialAuth.authenticated) {
        clearUserCache();
        if (isMountedRef.current) {
          setUser(null);
          setImgError(false);
          setIsHydrated(true);
        }
        return;
      }

      // Server says authenticated — try to get richer data from cache
      const sessionUser = getUserDataFromSession();
      if (sessionUser) {
        if (isMountedRef.current) {
          setUser(sessionUser);
          setImgError(false);
          setIsHydrated(true);
        }
        return;
      }

      try {
        const cookieUser = await getDecryptedUser();
        if (!isMountedRef.current) return;
        if (cookieUser) {
          setUser(cookieUser);
          setImgError(false);
          saveUserDataToSession(cookieUser);
        }
      } catch { /* ignore */ }

      // Mark hydration complete regardless of result
      if (isMountedRef.current) setIsHydrated(true);
    };

    syncUser();
    window.addEventListener("user-updated", syncUser);

    // ✅ Multi-tab logout sync: listen for storage changes (logout clears localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      // When another tab clears localStorage (logout), sync this tab
      if (e.key === null || e.key === "edulearn_logout") {
        if (isMountedRef.current) {
          setUser(null);
          setImgError(false);
          clearUserCache();
          queryClient.clear();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("user-updated", syncUser);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialAuth.authenticated, queryClient]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      saveUserDataToSession(user);
      getUserIdFromCookieAsync().catch(() => { });
    }
  }, [user]);

  const handleAboutClick: MenuProps["onClick"] = useCallback(({ key }: { key: string }) => {
    const route = ABOUT_ROUTES[key];
    if (route) {
      router.push(route);
      setIsAboutDropdownOpen(false);
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    const result = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn thoát khỏi hệ thống không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: "Đăng xuất ngay",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      background: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#f8fafc' : '#1e293b',
    });

    if (result.isConfirmed) {
      // 1. Clear UI state immediately (prevent stale render)
      setUser(null);
      setImgError(false);

      // 2. Clear ALL TanStack Query cache (prevents stale data for next user)
      queryClient.clear();

      // 3. Clear sessionStorage user cache (prevents header showing old user on navigate back)
      clearUserCache();

      // 4. Call API logout + clear all client state (cookies, localStorage)
      const savedTheme = localStorage.getItem("theme");
      await signOut();
      localStorage.clear();
      if (savedTheme) localStorage.setItem("theme", savedTheme);

      // 5. Signal other tabs to logout (StorageEvent fires cross-tab)
      try {
        localStorage.setItem("edulearn_logout", Date.now().toString());
        localStorage.removeItem("edulearn_logout");
      } catch { /* ignore */ }

      // 6. Hard navigate to auth page (force server re-render for fresh initialAuth)
      window.location.href = "/auth";
    }
  }, [router, theme, queryClient]);

  const isAboutActive = useMemo(
    () => pathname === "/about" || pathname === "/system" || pathname === "/guide" || pathname === "/faq",
    [pathname]
  );

  const userRoleLabel = useMemo(() => {
    if (!user) return "Thành viên";
    const roleId = user.role_id || user.role?.role_id;
    const roleName = user.role?.role_name?.toLowerCase() || "";
    if (roleId === 3 || roleName === "student" || roleName === "học sinh") return "Học sinh";
    if (roleId === 2 || roleName === "teacher" || roleName === "giáo viên" || roleName === "giảng viên") return "Giáo viên";
    if (roleId === 1 || roleName === "admin" || roleName === "super admin") return "Quản trị viên";
    return "Thành viên";
  }, [user]);

  const roleDashboardPath = useMemo(() => {
    if (!user) return null;
    const roleId = user.role_id || user.role?.role_id;
    const roleName = user.role?.role_name?.toLowerCase() || "";

    // Teacher portal — chỉ khi module admin bật
    if (FEATURES.admin && (roleId === 2 || roleName === "teacher" || roleName === "giáo viên" || roleName === "giảng viên")) {
      return "/admin";
    }

    // Admin/Super Admin portal — chỉ khi module super-admin bật
    if (FEATURES.superAdmin && (roleId === 1 || roleName === "admin" || roleName === "super_admin" || roleName === "super admin" || roleName === "superadmin")) {
      return "/super-admin";
    }

    // Default User/Student portal — chỉ khi module user bật
    if (FEATURES.user) return "/user";
    return null;
  }, [user]);

  const NavLink = memo(({ to, label }: { to: string; label: string }) => {
    const isActive = pathname === to;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        router.push(to);
      }
    };

    return (
      <Link
        href={to}
        prefetch={true}
        onMouseEnter={() => router.prefetch(to)}
        onKeyDown={handleKeyDown}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Điều hướng đến ${label}`}
        className={`relative py-2 font-bold text-lg no-underline transition-colors duration-200 inline-block
          ${isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
          }`}
      >
        <span className="relative z-10 inline-block">
          {label}
        </span>
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
          />
        )}
      </Link>
    );
  });
  NavLink.displayName = 'NavLink';

  const DropdownNavButton = memo(({
    label,
    isActive,
    isOpen,
    onOpenChange,
    items,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    items: MenuProps["items"];
    onClick: MenuProps["onClick"];
  }) => {
    const showUnderline = isActive || isOpen;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenChange(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    return (
      <Dropdown
        menu={{
          items: items as MenuProps["items"],
          onClick,
        }}
        placement="bottom"
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <button
          onKeyDown={handleKeyDown}
          aria-label={`${label} menu`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`relative py-2 flex items-center gap-1 font-bold text-lg border-none bg-transparent cursor-pointer transition-colors duration-200
            ${showUnderline || isOpen
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
            }`}
        >
          <span className="relative z-10 inline-block">
            {label}
          </span>
          {(showUnderline) && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
            />
          )}
        </button>
      </Dropdown>
    );
  });
  DropdownNavButton.displayName = 'DropdownNavButton';

  const userMenuItems = useMemo<MenuProps["items"]>(() => {
    if (!user) return [];
    return [
      {
        key: "user-info",
        label: (
          <div className="flex flex-col cursor-default">
            <span className="font-semibold text-slate-800 dark:text-white text-base leading-tight">
              {fixUtf8(user.fullname || user.username)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{userRoleLabel}</span>
          </div>
        ),
        style: { cursor: "default", backgroundColor: "transparent", padding: "8px 12px" },
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profile",
        icon: <UserOutlined className="text-slate-600 dark:text-slate-300" />,
        label: (
          <Link
            href="/profile"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/profile")}
            className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white"
          >
            Hồ sơ cá nhân
          </Link>
        ),
        style: { padding: "10px 16px" },
      },
      ...(roleDashboardPath
        ? [
          {
            key: "dashboard",
            icon: <AppstoreOutlined className="text-slate-600 dark:text-slate-300" />,
            label: (
              <Link
                href={roleDashboardPath}
                prefetch={true}
                onMouseEnter={() => router.prefetch(roleDashboardPath)}
                className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white"
              >
                {userRoleLabel}
              </Link>
            ),
            style: { padding: "10px 16px" },
          },
        ]
        : []),
      {
        key: "notifications",
        icon: <span className="flex items-center"><NotificationBell userId={user.user_id || user.userId} isMenuItem={true} /></span>,
        label: (
          <Link
            href="/notifications"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/notifications")}
            className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white grow"
          >
            Thông báo
          </Link>
        ),
        style: { padding: "10px 16px", display: "flex", alignItems: "center" },
      },
      {
        key: "logout",
        icon: (
          <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        ),
        label: <span className="text-red-500 dark:text-red-400 font-medium">Đăng xuất</span>,
        onClick: handleLogout,
        danger: true,
        style: { padding: "10px 16px" },
      },
    ];
  }, [user, userRoleLabel, roleDashboardPath, router, handleLogout]);

  // Mobile nav link helper
  const MobileNavLink = useCallback(({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) => {
    const isActive = pathname === to;
    return (
      <Link
        href={to}
        prefetch={true}
        onClick={() => setMobileMenuOpen(false)}
        className={`mobile-nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors duration-200
          ${isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
      >
        {icon && <span className="text-lg w-5 flex justify-center">{icon}</span>}
        {label}
        {isActive && <span className="ml-auto mobile-nav-active-dot" />}
      </Link>
    );
  }, [pathname]);

  return (
    <>
      <ScrollProgress />
      <header className="bg-white dark:bg-[#001529] shadow-md dark:shadow-xl shadow-slate-200 dark:shadow-slate-800 sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/")}
            className="flex items-center space-x-3 group"
            aria-label="Trang chủ - Thư viện số"
          >
            <div className="w-12 h-12 relative flex items-center justify-center">
              <Image
                src="/images/logo/main.png"
                alt="Logo Thư viện số"
                width={48}
                height={48}
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white capitalize no-text-transition">Thư viện số</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" label="Trang chủ" />

            {user && (
              <>
                <NavLink to="/vocabulary" label="Học từ vựng" />
                <NavLink to="/writing" label="Luyện viết" />
                <NavLink to="/listening" label="Luyện nghe" />
                <NavLink to="/documents" label="Tài liệu" />
              </>
            )}

            <DropdownNavButton
              label="Về chúng tôi"
              isActive={isAboutActive}
              isOpen={isAboutDropdownOpen}
              onOpenChange={setIsAboutDropdownOpen}
              items={ABOUT_ITEMS}
              onClick={handleAboutClick}
            />
          </div>

          {/* Right Side: Theme + User + Mobile Hamburger */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none"
              aria-label={theme === 'dark' ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {theme === 'dark' ? (
                <BulbFilled className="text-yellow-400 text-xl" />
              ) : (
                <BulbOutlined className="text-slate-600 text-xl" />
              )}
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              {!isHydrated ? (
                <div className="w-[40px] h-[40px]" aria-hidden="true" />
              ) : user ? (
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    className: "user-dropdown-menu",
                  }}
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                  trigger={["click"]}
                  classNames={{ root: "user-dropdown-overlay" }}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer group py-1"
                    role="button"
                    tabIndex={0}
                    aria-label="Menu người dùng"
                    aria-haspopup="true"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.currentTarget.click();
                      }
                    }}
                  >
                    <Avatar
                      size={40}
                      src={hasValidAvatar && !imgError ? getCachedImageUrl(getMediaUrl(user.avatar)) : undefined}
                      onError={() => { setImgError(true); return true; }}
                      style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      icon={<UserOutlined style={{ fontSize: 20, color: '#ffffff' }} />}
                    />
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-tight">
                        {fixUtf8(user.fullname || user.username)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium opacity-80 uppercase tracking-widest">
                        {userRoleLabel.toUpperCase()}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Dropdown>
              ) : (
                <Button type="default" onClick={() => router.push("/auth")} aria-label="Đăng nhập vào hệ thống">
                  Đăng Nhập
                </Button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <MenuOutlined className="text-xl text-slate-700 dark:text-white" />
            </button>
          </div>
        </nav>
      </header>

      {/* ========== MOBILE DRAWER ========== */}
      {/* Backdrop */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`mobile-drawer-panel bg-white dark:bg-[#0f172a] shadow-2xl ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <span className="text-lg font-bold text-slate-800 dark:text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-drawer-close p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Đóng menu"
          >
            <CloseOutlined className="text-lg text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* User Info (if logged in) */}
        {isHydrated && user && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar
                size={48}
                src={hasValidAvatar && !imgError ? getCachedImageUrl(getMediaUrl(user.avatar)) : undefined}
                onError={() => { setImgError(true); return true; }}
                style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                icon={<UserOutlined style={{ fontSize: 22, color: '#ffffff' }} />}
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {fixUtf8(user.fullname || user.username)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  {userRoleLabel}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-4 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Điều hướng</div>
          <MobileNavLink to="/" label="Trang chủ" />

          {user && (
            <>
              <MobileNavLink to="/vocabulary" label="Học từ vựng" />
              <MobileNavLink to="/writing" label="Luyện viết" />
              <MobileNavLink to="/listening" label="Luyện nghe" />
              <MobileNavLink to="/documents" label="Tài liệu" />
            </>
          )}

          <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thông tin</div>
          <MobileNavLink to="/about" label="Giới thiệu" />
          <MobileNavLink to="/system" label="Hệ thống" />
          <MobileNavLink to="/guide" label="Hướng dẫn" />
          <MobileNavLink to="/faq" label="FAQ" />
        </div>

        {/* User Actions */}
        {isHydrated && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 mt-2 space-y-1">
            {user ? (
              <>
                <MobileNavLink to="/profile" label="Hồ sơ cá nhân" />
                {roleDashboardPath && (
                  <MobileNavLink to={roleDashboardPath} label={userRoleLabel} />
                )}
                <MobileNavLink to="/notifications" label="Thông báo" />
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="mobile-nav-item flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); router.push('/auth'); }}
                className="mobile-nav-item flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
