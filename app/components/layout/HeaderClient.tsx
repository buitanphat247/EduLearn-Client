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
      <header className="bg-[#1c91e3] shadow-md sticky top-0 z-50">
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
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                    <SettingOutlined className="text-xl" />
                  </div>
                  {/* <span className="font-medium text-white">{user.fullname || user.username}</span> */}
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
