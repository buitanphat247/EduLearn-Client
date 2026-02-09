"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button, Dropdown, Avatar } from "antd";
import Swal from "sweetalert2";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from "@/app/components/common/iconRegistry";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { signOut } from "@/lib/api/auth";
import type { AuthState } from "@/lib/utils/auth-server";
import { useTheme } from "@/app/context/ThemeContext";
import { saveUserDataToSession, getUserIdFromCookieAsync } from "@/lib/utils/cookies";
import ScrollProgress from "./ScrollProgress";
import NotificationBell from "@/app/components/notifications/NotificationBell";
import { getMediaUrl } from "@/lib/utils/media";
import { getCachedImageUrl } from "@/lib/utils/image-cache";
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
  { to: "/news", label: "Tin tức" },
  { to: "/events", label: "Sự kiện" },
] as const;

const FEATURE_ITEMS: MenuProps["items"] = [
  { key: "vocabulary", label: "Học từ vựng" },
  { key: "writing", label: "Luyện viết" },
  { key: "listening", label: "Luyện nghe" },
];

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

  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(() => {
    return initialAuth.authenticated && initialAuth.userData ? initialAuth.userData : null;
  });
  const [imgError, setImgError] = useState(false);

  const FALLBACK_CAT = getMediaUrl("/avatars/anh3_1770318347807_gt8xnc.jpeg");

  useEffect(() => {
    const syncUser = () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setImgError(false);
          } catch (e) {
            console.error("Error parsing user from localStorage", e);
          }
        }
      }
    };

    syncUser();

    window.addEventListener("storage", (e) => {
      if (e.key === "user") syncUser();
    });

    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      saveUserDataToSession(user);
      getUserIdFromCookieAsync().catch(() => { });
    }

    const handleStorageChange = () => {
      window.location.reload();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  const handleFeatureClick: MenuProps["onClick"] = useCallback(({ key }: { key: string }) => {
    router.push(`/${key}`);
    setIsFeatureDropdownOpen(false);
  }, [router]);

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
      const savedTheme = localStorage.getItem("theme");
      await signOut();
      localStorage.clear();
      if (savedTheme) localStorage.setItem("theme", savedTheme);
      // ✅ Use push instead of replace for smoother navigation
      router.push("/auth");
    }
  }, [router, theme]);

  const isFeatureActive = useMemo(() => {
    return pathname === "/vocabulary" || pathname === "/writing" || pathname === "/listening" || pathname?.startsWith("/vocabulary/") || pathname?.startsWith("/writing/") || pathname?.startsWith("/listening/");
  }, [pathname]);
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
    if (roleId === 3 || roleName === "student" || roleName === "học sinh") return "/user";
    if (roleId === 2 || roleName === "teacher" || roleName === "giáo viên" || roleName === "giảng viên") return "/admin";
    if (roleId === 1 || roleName === "admin" || roleName === "super admin") return "/super-admin";
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
      {
        key: "chat",
        icon: <MessageOutlined className="text-slate-600 dark:text-slate-300" />,
        label: (
          <Link
            href="/social"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/social")}
            className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white"
          >
            Chat room
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
                src="/images/logo/1.png"
                alt="Logo Thư viện số"
                width={48}
                height={48}
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white capitalize no-text-transition">Thư viện số</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}

            <DropdownNavButton
              label="Tính năng"
              isActive={isFeatureActive}
              isOpen={isFeatureDropdownOpen}
              onOpenChange={setIsFeatureDropdownOpen}
              items={FEATURE_ITEMS}
              onClick={handleFeatureClick}
            />

            <DropdownNavButton
              label="Về chúng tôi"
              isActive={isAboutActive}
              isOpen={isAboutDropdownOpen}
              onOpenChange={setIsAboutDropdownOpen}
              items={ABOUT_ITEMS}
              onClick={handleAboutClick}
            />
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-5">
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
            {user ? (
              <>
                <NotificationBell userId={user.user_id || user.userId} />
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
                        // Trigger dropdown click
                        const button = e.currentTarget;
                        button.click();
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-white/30 bg-slate-100 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-white group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-500 transition-colors duration-300 shadow-sm relative overflow-hidden">
                      <Avatar
                        size={40}
                        src={getCachedImageUrl((!user.avatar || imgError) ? FALLBACK_CAT : getMediaUrl(user.avatar))}
                        onError={() => {
                          setImgError(true);
                          return true;
                        }}
                        className="flex items-center justify-center bg-transparent border-none"
                        icon={<UserOutlined style={{ fontSize: 20 }} />}
                      />
                    </div>
                    <div className="hidden md:block text-right">
                      <div className="text-sm font-bold text-slate-700 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {fixUtf8(user.fullname || user.username)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-blue-100 font-medium opacity-80 uppercase tracking-widest group-hover:opacity-100 transition-opacity duration-300">
                        {userRoleLabel.toUpperCase()}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-500 dark:text-blue-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden md:block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Dropdown>
              </>
            ) : (
              <Button
                type="default"
                onClick={() => router.push("/auth")}
                aria-label="Đăng nhập vào hệ thống"
              >
                Đăng Nhập
              </Button>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
