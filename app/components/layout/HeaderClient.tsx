"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Dropdown, Avatar, Switch } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, AppstoreOutlined, MessageOutlined, MoonOutlined, SunOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";
import { getCurrentUser } from "@/lib/api/users";
import { signOut } from "@/lib/api/auth";
import type { AuthState } from "@/lib/utils/auth-server";
import { useTheme } from "@/app/context/ThemeContext";
import ScrollProgress from "./ScrollProgress";

interface HeaderClientProps {
  initialAuth: AuthState;
}

export default function HeaderClient({ initialAuth }: HeaderClientProps) {
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Helper to fix common UTF-8 encoding errors (Mojibake)
  const fixUtf8 = (str: string | undefined | null) => {
    if (!str) return "";
    try {
      // If the string contains no high-bit characters, it doesn't need fixing
      // But we can just try to decode.
      // Revert if decoding produces replacement characters (indicating original was likely not Mojibake)
      const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (decoded.includes('\uFFFD')) return str;
      return decoded;
    } catch {
      return str;
    }
  };

  const [user, setUser] = useState<any>(() => {
    if (initialAuth.authenticated && initialAuth.userData) {
      return initialAuth.userData;
    }

    if (typeof window === "undefined") return null;

    try {
      const currentUser = getCurrentUser();
      const token = localStorage.getItem("accessToken");
      return currentUser && token ? currentUser : null;
    } catch {
      return null;
    }
  });

  const [authenticated, setAuthenticated] = useState(initialAuth.authenticated || !!user);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      const currentUser = getCurrentUser();
      const token = localStorage.getItem("accessToken");

      if (currentUser && token) {
        setUser((prevUser: any) => {
          if (!prevUser || prevUser.user_id !== currentUser.user_id) {
            setAuthenticated(true);
            return currentUser;
          }
          return prevUser;
        });
      } else {
        setUser((prevUser: any) => {
          if (prevUser !== null) {
            setAuthenticated(false);
            return null;
          }
          return prevUser;
        });
      }
    };

    const interval = setInterval(checkAuth, 1000);
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/news", label: "Tin tức" },
    { to: "/events", label: "Sự kiện" },
  ];

  const featureItems: MenuProps["items"] = [
    { key: "vocabulary", label: "Học từ vựng" },
    { key: "writing", label: "Luyện viết" },
    { key: "listening", label: "Luyện nghe" },
  ];

  const aboutItems: MenuProps["items"] = [
    { key: "about", label: "Giới thiệu" },
    { key: "system", label: "Hệ thống" },
    { key: "guide", label: "Hướng dẫn" },
    { key: "innovation", label: "Công nghệ & Đổi mới" },
    { key: "faq", label: "FAQ" },
  ];

  interface AuthItem {
    key: string;
    label: string;
    onClick: () => void;
  }

  const handleFeatureClick: MenuProps["onClick"] = ({ key }) => {
    router.push(`/features/${key}`);
    setIsFeatureDropdownOpen(false);
  };

  const handleAboutClick: MenuProps["onClick"] = ({ key }) => {
    const routes: Record<string, string> = {
      about: "/about",
      system: "/system",
      guide: "/guide",
      innovation: "/innovation",
      faq: "/faq",
    };
    if (routes[key]) {
      router.push(routes[key]);
    }
    setIsAboutDropdownOpen(false);
  };

  const isFeatureActive = pathname?.startsWith("/features") || false;
  const isAboutActive = pathname === "/about" || pathname === "/system" || pathname === "/guide" || pathname === "/faq" || false;

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setAuthenticated(false);
      router.push("/");
    } catch (error) {
      // Logout error is handled silently - user is redirected anyway
    }
  };

  // Get user role label
  const getUserRoleLabel = () => {
    if (!user) return "Thành viên";
    
    const roleId = user.role_id || user.role?.role_id;
    const roleName = user.role?.role_name?.toLowerCase() || "";
    
    // Check by role_id
    if (roleId === 3 || roleName === "student" || roleName === "học sinh") {
      return "Học sinh";
    }
    if (roleId === 2 || roleName === "teacher" || roleName === "giáo viên" || roleName === "giảng viên") {
      return "Giáo viên";
    }
    if (roleId === 1 || roleName === "admin" || roleName === "super admin") {
      return "Quản trị viên";
    }
    
    return "Thành viên";
  };

  // Get role dashboard path
  const getRoleDashboardPath = () => {
    if (!user) return null;
    
    const roleId = user.role_id || user.role?.role_id;
    const roleName = user.role?.role_name?.toLowerCase() || "";
    
    // Check by role_id
    if (roleId === 3 || roleName === "student" || roleName === "học sinh") {
      return "/user";
    }
    if (roleId === 2 || roleName === "teacher" || roleName === "giáo viên" || roleName === "giảng viên") {
      return "/admin";
    }
    if (roleId === 1 || roleName === "admin" || roleName === "super admin") {
      return "/super-admin";
    }
    
    return null;
  };

  const userRoleLabel = getUserRoleLabel();
  const roleDashboardPath = getRoleDashboardPath();

  return (
    <>
      <ScrollProgress />
      <header className="bg-white dark:bg-[#001529] shadow-md dark:shadow-xl shadow-slate-200 dark:shadow-slate-800 sticky top-0 z-50 transition-all duration-500 ease-in-out">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img src="/images/logo/1.png" alt="Thư viện số" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white capitalize transition-colors duration-300">Thư viện số</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.slice(0, 3).map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`relative py-2 transition-colors duration-200 ${!isActive ? "nav-link" : ""}`}
                  style={{
                    color: isActive
                      ? undefined
                      : theme === "dark"
                      ? "#ffffff"
                      : "#475569",
                  }}
                >
                  <span
                    className={`font-bold text-lg relative z-10 ${
                      isActive ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                    style={
                      !isActive
                        ? {
                            color: theme === "dark" ? "#ffffff" : "#475569",
                          }
                        : undefined
                    }
                  >
                    {link.label}
                  </span>
                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
                </Link>
              );
            })}

            <Dropdown
              menu={{
                items: featureItems,
                onClick: handleFeatureClick,
                className: "user-dropdown-menu"
              }}
              placement="bottom"
              open={isFeatureDropdownOpen}
              onOpenChange={setIsFeatureDropdownOpen}
              overlayClassName="user-dropdown-overlay"
            >
              <button
                className={`relative py-2 flex items-center gap-1 transition-colors duration-200 ${
                  isFeatureActive || isFeatureDropdownOpen
                    ? "text-blue-600 dark:text-blue-400"
                    : "nav-link"
                }`}
                style={
                  !(isFeatureActive || isFeatureDropdownOpen)
                    ? {
                        color: theme === "dark" ? "#ffffff" : "#475569",
                      }
                    : undefined
                }
              >
                 <span className="font-bold text-lg relative z-10">Tính năng</span>
                 {/* Active underline */}
                 {(isFeatureActive || isFeatureDropdownOpen) && (
                   <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                 )}
              </button>
            </Dropdown>

            <Dropdown
              menu={{
                items: aboutItems,
                onClick: handleAboutClick,
                className: "user-dropdown-menu"
              }}
              placement="bottom"
              open={isAboutDropdownOpen}
              onOpenChange={setIsAboutDropdownOpen}
              overlayClassName="user-dropdown-overlay"
            >
              <button
                className={`relative py-2 flex items-center gap-1 transition-colors duration-200 ${
                  isAboutActive || isAboutDropdownOpen
                    ? "text-blue-600 dark:text-blue-400"
                    : "nav-link"
                }`}
                style={
                  !(isAboutActive || isAboutDropdownOpen)
                    ? {
                        color: theme === "dark" ? "#ffffff" : "#475569",
                      }
                    : undefined
                }
              >
                 <span className="font-bold text-lg relative z-10">Về chúng tôi</span>
                 {/* Active underline */}
                 {(isAboutActive || isAboutDropdownOpen) && (
                   <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                 )}
              </button>
            </Dropdown>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={(e) => toggleTheme(e)}
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <BulbFilled /> : <BulbOutlined />}
            </button>
            {user ? (
              <Dropdown 
                menu={{ 
                  items: [
                    {
                      key: 'user-info',
                      label: (
                        <div className="flex flex-col cursor-default">
                          <span className="font-semibold text-slate-800 dark:text-white text-base leading-tight">{fixUtf8(user.fullname || user.username)}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{userRoleLabel}</span>
                        </div>
                      ),
                      style: { cursor: 'default', backgroundColor: 'transparent', padding: '8px 12px' },
                      disabled: true,
                    },
                    { type: 'divider' },
                    {
                      key: "profile",
                      icon: <UserOutlined className="text-slate-600 dark:text-slate-300" />,
                      label: <Link href="/profile" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white">Hồ sơ cá nhân</Link>,
                      style: { padding: '10px 16px' },
                    },
                    {
                      key: "chat",
                      icon: <MessageOutlined className="text-slate-600 dark:text-slate-300" />,
                      label: <Link href="/social" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white">Chat room</Link>,
                      style: { padding: '10px 16px' },
                    },
                    ...(roleDashboardPath ? [{
                      key: "dashboard",
                      icon: <AppstoreOutlined className="text-slate-600 dark:text-slate-300" />,
                      label: (
                        <Link href={roleDashboardPath} className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white">
                          {userRoleLabel}
                        </Link>
                      ),
                      style: { padding: '10px 16px' },
                    }] : []),
                    {
                      key: "logout",
                      icon: (
                        <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      ),
                      label: <span className="text-red-500 dark:text-red-400 font-medium">Đăng xuất</span>,
                      onClick: handleLogout,
                      danger: true,
                      style: { padding: '10px 16px' },
                    },
                  ],
                  className: "user-dropdown-menu"
                }} 
                placement="bottomRight" 
                arrow={{ pointAtCenter: true }}
                trigger={['click']}
                overlayClassName="user-dropdown-overlay"
              >
                <div className="flex items-center gap-3 cursor-pointer group py-1">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-white/30 bg-slate-100 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-white group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-500 transition-colors duration-300 shadow-sm relative overflow-hidden">
                     {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                        <span className="font-bold text-lg select-none">
                          {fixUtf8(user.fullname || user.username || "U").charAt(0).toUpperCase()}
                        </span>
                     )}
                  </div>
                  <div className="hidden md:block text-right">
                     <div className="text-sm font-bold text-slate-700 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {fixUtf8(user.fullname || user.username)}
                     </div>
                     <div className="text-[10px] text-slate-500 dark:text-blue-100 font-medium opacity-80 uppercase tracking-widest group-hover:opacity-100 transition-opacity duration-300">
                        {userRoleLabel.toUpperCase()}
                     </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 dark:text-blue-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </Dropdown>
            ) : (
              <>
                <Button type="default" onClick={() => router.push("/auth")}>
                  Đăng Nhập
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
