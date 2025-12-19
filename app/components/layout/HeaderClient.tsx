"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
import { getCurrentUser } from "@/lib/api/users";
import { signOut } from "@/lib/api/auth";
import type { AuthState } from "@/lib/utils/auth-server";

interface HeaderClientProps {
  initialAuth: AuthState;
}

export default function HeaderClient({ initialAuth }: HeaderClientProps) {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);

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
    { to: "/about", label: "Về chúng tôi" },
  ];

  const featureItems: MenuProps["items"] = [
    { key: "translator", label: "Dịch thuật" },
    { key: "vocabulary", label: "Học từ vựng" },
    { key: "writing", label: "Luyện viết" },
    { key: "listening", label: "Luyện nghe" },
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

  const isFeatureActive = pathname?.startsWith("/features") || false;

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems: MenuProps["items"] = user
    ? [
        {
          key: "profile",
          label: <Link href="/profile">Hồ sơ</Link>,
        },
        {
          key: "logout",
          label: "Đăng xuất",
          onClick: handleLogout,
        },
      ]
    : [];

  return (
    <>
      <SignIn
        open={isSignInOpen}
        onCancel={() => setIsSignInOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInOpen(false);
          setIsSignUpOpen(true);
        }}
      />
      <SignUp
        open={isSignUpOpen}
        onCancel={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpOpen(false);
          setIsSignInOpen(true);
        }}
      />
      <header className="bg-[#001529] shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 relative transform group-hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/images/logo/1.png" alt="Thư viện số" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-white capitalize">Thư viện số</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.slice(0, 3).map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`transition-all relative py-2 ${
                    isActive
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full"
                      : "hover:opacity-80"
                  }`}
                >
                  <span className="font-bold text-white text-lg">{link.label}</span>
                </Link>
              );
            })}

            <Dropdown
              menu={{
                items: featureItems,
                onClick: handleFeatureClick,
              }}
              placement="bottom"
              open={isFeatureDropdownOpen}
              onOpenChange={setIsFeatureDropdownOpen}
              classNames={{ root: "feature-dropdown" }}
            >
              <button
                className={`transition-all relative py-2 flex items-center gap-1 ${
                  isFeatureActive || isFeatureDropdownOpen
                    ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full"
                    : "hover:opacity-80"
                  }`}
              >
                <span className="font-bold text-white text-lg">Tính năng</span>
              </button>
            </Dropdown>

            {navLinks.slice(3, 4).map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`transition-all relative py-2 ${
                    isActive
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full"
                      : "hover:opacity-80"
                  }`}
                >
                  <span className="font-bold text-white text-lg">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-5">
            {user ? (
              <Dropdown 
                menu={{ 
                  items: [
                    {
                      key: 'user-info',
                      label: (
                        <div className="flex flex-col px-1 py-1 cursor-default">
                          <span className="font-bold text-gray-800 text-base">{fixUtf8(user.fullname || user.username)}</span>
                          <span className="text-xs text-gray-500">Thành viên</span>
                        </div>
                      ),
                      style: { cursor: 'default', backgroundColor: 'transparent' },
                      disabled: true,
                    },
                    { type: 'divider' },
                    {
                      key: "profile",
                      icon: <UserOutlined />,
                      label: <Link href="/profile">Hồ sơ cá nhân</Link>,
                    },
                    {
                      key: "logout",
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      ),
                      label: "Đăng xuất",
                      onClick: handleLogout,
                      danger: true,
                    },
                  ] 
                }} 
                placement="bottomRight" 
                arrow={{ pointAtCenter: true }}
                trigger={['click']}
              >
                <div className="flex items-center gap-3 cursor-pointer group py-1">
                  <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-all duration-300 shadow-sm relative overflow-hidden">
                     {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                        <span className="font-bold text-lg select-none">
                          {fixUtf8(user.fullname || user.username || "U").charAt(0).toUpperCase()}
                        </span>
                     )}
                  </div>
                  <div className="hidden md:block text-right">
                     <div className="text-sm font-bold text-white leading-tight group-hover:opacity-90 transition-opacity">
                        {fixUtf8(user.fullname || user.username)}
                     </div>
                     <div className="text-[10px] text-blue-100 font-medium opacity-80 uppercase tracking-widest">
                        Tài khoản
                     </div>
                  </div>
                  <svg className="w-4 h-4 text-blue-100 group-hover:rotate-180 transition-transform duration-300 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
