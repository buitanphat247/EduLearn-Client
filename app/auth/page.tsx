"use client";

import { useState, useEffect, useRef } from "react";
import { Form, App, ConfigProvider, theme, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { signIn, signUp, googleLogin as googleLoginApi } from "@/lib/services/auth";
import { getCurrentUser } from "@/lib/services/users";
import { useTheme } from "@/context/ThemeContext";
import { getCookie } from "@/lib/utils/cookies";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import GoogleCompleteProfileModal from "@/components/auth/GoogleCompleteProfileModal";

// Import UI components
import AuthHero from "@/components/auth/AuthHero";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

// Helper error handler
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axiosErr = error as any;
  return axiosErr?.response?.data?.message || axiosErr?.message || fallback;
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInForm] = Form.useForm();
  const [signUpForm] = Form.useForm();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [googleInfo, setGoogleInfo] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const sessionRevokedShownRef = useRef(false);
  const isMountedRef = useRef(true);
  const googleCodeProcessedRef = useRef(false);

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_revoked" && !sessionRevokedShownRef.current) {
      sessionRevokedShownRef.current = true;
      message.warning("Phiên đăng nhập đã bị đăng xuất khỏi hệ thống. Vui lòng đăng nhập lại.");
      if (typeof window !== "undefined") window.history.replaceState({}, "", "/auth");
    }
  }, [searchParams, message]);

  // Google Login Mutation
  const googleMutation = useMutation({
    mutationFn: async (code: string) => {
      const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth` : "";
      return googleLoginApi({
        code,
        redirect_uri: redirectUri,
        device_name: navigator.userAgent,
      });
    },
    onSuccess: (res) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = res as any;

      // Xử lý wrapper định dạng từ backend interceptor
      const payload = response?.data || response;

      if (payload?.need_registration) {
        setGoogleInfo(payload.google_info);
        setIsGoogleModalOpen(true);
        message.info("Vui lòng hoàn tất thông tin đăng ký!");
        return;
      }

      const isSuccess = !!payload?.user || !!response?.user;
      if (isSuccess) {
        message.success("Đăng nhập Google thành công!");
        window.location.href = "/profile";
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.error((res as any)?.message || "Đăng nhập Google thất bại (không tìm thấy người dùng)");
      }
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Kết nối đến server thất bại"));
    },
  });

  useEffect(() => {
    isMountedRef.current = true;

    const checkAuth = () => {
      if (!isMountedRef.current) return;

      const user = getCurrentUser();
      const hasToken = typeof window !== "undefined" ? !!getCookie("_at") : false;

      if (user && hasToken) {
        router.push("/profile");
        return;
      }

      const code = searchParams.get("code");
      if (code && !googleCodeProcessedRef.current) {
        googleCodeProcessedRef.current = true;
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          url.searchParams.delete("scope");
          url.searchParams.delete("authuser");
          url.searchParams.delete("prompt");
          window.history.replaceState({}, "", url.toString());
        }
        googleMutation.mutate(code);
      }
    };

    checkAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, [router, searchParams, googleMutation]);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isSignUp, shouldAnimate]);

  const [attemptCount, setAttemptCount] = useState(0);
  const lastAttemptRef = useRef<number>(0);
  const RATE_LIMIT_DELAY_MS = 1000;
  const MAX_ATTEMPTS = 5;

  // Sign In Mutation
  const signInMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (values: any) => {
      const deviceName = navigator.userAgent || "Web Browser";
      return signIn({
        emailOrUsername: values.email,
        password: values.password,
        device_name: deviceName,
      });
    },
    onSuccess: (response) => {
      if (response.status && response.data?.user) {
        message.success("Đăng nhập thành công!");
        setAttemptCount(0);
        window.location.href = "/profile";
      } else {
        message.error(response.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        setAttemptCount(prev => prev + 1);
      }
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (error as any)?.response?.data;
      let errorMessage = getApiErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại!");

      if (errorData?.code === 'ACCOUNT_LOCKED') {
        errorMessage = errorData.message;
      }

      message.error(errorMessage);
      setAttemptCount((prev) => prev + 1);
    }
  });

  // Sign Up Mutation
  const signUpMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (values: any) => {
      const deviceName = navigator.userAgent || "Web Browser";
      return signUp({
        username: values.username,
        fullname: values.name,
        email: values.email,
        phone: values.phone || "",
        password: values.password,
        role_id: values.role_id,
        device_name: deviceName,
        google_id: values.google_id,
        provider: values.provider,
        avatar: values.avatar,
      });
    },
    onSuccess: (response) => {
      if (response.status && response.data?.user) {
        message.success("Đăng ký thành công!");
        setAttemptCount(0);
        setIsGoogleModalOpen(false);
        window.location.href = "/profile";
      } else {
        message.error(response.message || "Đăng ký thất bại. Vui lòng thử lại!");
        setAttemptCount(prev => prev + 1);
      }
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, "Đăng ký thất bại. Vui lòng thử lại!"));
      setAttemptCount(prev => prev + 1);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSignIn = (values: any) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;

    if (timeSinceLastAttempt < RATE_LIMIT_DELAY_MS) {
      message.warning("Vui lòng đợi một chút trước khi thử lại");
      return;
    }
    if (attemptCount >= MAX_ATTEMPTS) {
      message.error("Quá nhiều lần thử. Vui lòng thử lại sau 5 phút.");
      return;
    }
    lastAttemptRef.current = now;
    signInMutation.mutate(values);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSignUp = (values: any) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;

    if (timeSinceLastAttempt < RATE_LIMIT_DELAY_MS) {
      message.warning("Vui lòng đợi một chút trước khi thử lại");
      return;
    }
    lastAttemptRef.current = now;
    signUpMutation.mutate(values);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleCompleteSignup = (values: any) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;

    if (timeSinceLastAttempt < RATE_LIMIT_DELAY_MS) {
      message.warning("Vui lòng đợi một chút trước khi thử lại");
      return;
    }
    lastAttemptRef.current = now;

    // Tạo username ngẫu nhiên từ email
    const baseUsername = googleInfo.email.split('@')[0].substring(0, 40);
    const username = `${baseUsername}_${Math.random().toString(36).substring(2, 7)}`;

    signUpMutation.mutate({
      username: username,
      name: googleInfo.fullname,
      email: googleInfo.email,
      phone: values.phone,
      password: values.password,
      role_id: 3, // Bắt buộc Học sinh theo yêu cầu
      google_id: googleInfo.google_id,
      provider: 'google',
      avatar: googleInfo.avatar
    });
  };

  const { theme: currentTheme } = useTheme();

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "746067825418-lmac07j3m3ke382njren8u0775tbhqk2.apps.googleusercontent.com";

  const handleGoogleRedirect = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUri = encodeURIComponent(`${origin}/auth`);
    const scope = encodeURIComponent("email profile openid");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    if (typeof window !== "undefined") window.location.href = url;
  };

  return (
    <>
      <AuthContent
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        signInForm={signInForm}
        signUpForm={signUpForm}
        signInLoading={signInMutation.isPending}
        signUpLoading={signUpMutation.isPending}
        googleLoading={googleMutation.isPending}
        handleSignIn={handleSignIn}
        handleSignUp={handleSignUp}
        setIsForgotPasswordOpen={setIsForgotPasswordOpen}
        shouldAnimate={shouldAnimate}
        setShouldAnimate={setShouldAnimate}
        currentTheme={currentTheme}
        onGoogleLogin={handleGoogleRedirect}
      />
      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onCancel={() => setIsForgotPasswordOpen(false)}
      />
      <GoogleCompleteProfileModal
        open={isGoogleModalOpen}
        onCancel={() => {
          setIsGoogleModalOpen(false);
          setGoogleInfo(null);
        }}
        onFinish={handleGoogleCompleteSignup}
        isLoading={signUpMutation.isPending}
        googleInfo={googleInfo}
      />
    </>
  );
}

function AuthContent({
  isSignUp,
  setIsSignUp,
  signInForm,
  signUpForm,
  signInLoading,
  signUpLoading,
  googleLoading,
  handleSignIn,
  handleSignUp,
  setIsForgotPasswordOpen,
  shouldAnimate,
  setShouldAnimate,
  currentTheme,
  onGoogleLogin,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const isAnyLoading = signInLoading || signUpLoading || googleLoading;

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-500">
      {/* Full-page overlay when Google login is processing */}
      {googleLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-[#0f172a]/80 backdrop-blur-sm">
          <Spin size="large" />
          <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200 animate-pulse">Đang đăng nhập bằng Google...</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      )}

      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-stretch lg:items-center relative z-10 gap-8 lg:gap-16">

        {/* Left Side: Hero Component */}
        <AuthHero />

        {/* Right Side: Auth Form */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl mx-auto py-8 relative z-20">
          <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 lg:p-10 relative overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 transition-colors duration-300">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3 mb-4 group justify-center">
                <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-wide group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">EduLearn</span>
              </Link>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 transition-colors">{isSignUp ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs mx-auto transition-colors">
                {isSignUp ? "Bắt đầu hành trình học tập của bạn ngay hôm nay" : "Đăng nhập để tiếp tục việc học của bạn"}
              </p>
            </div>

            <ConfigProvider
              theme={{
                algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                  colorBgContainer: currentTheme === "dark" ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                  colorBorder: currentTheme === "dark" ? 'rgba(71, 85, 105, 0.4)' : '#e2e8f0',
                  colorPrimary: '#3b82f6',
                  borderRadius: 10,
                  controlHeight: 40,
                  fontSize: 14,
                  colorTextPlaceholder: currentTheme === "dark" ? '#94a3b8' : '#cbd5e1',
                  colorText: currentTheme === "dark" ? '#f8fafc' : '#1e293b',
                },
                components: {
                  Input: {
                    activeBorderColor: '#60a5fa',
                    hoverBorderColor: '#60a5fa',
                    paddingBlock: 6,
                    colorBgContainer: currentTheme === "dark" ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  },
                  Button: {
                    defaultBg: currentTheme === "dark" ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                    defaultBorderColor: currentTheme === "dark" ? 'rgba(71, 85, 105, 0.5)' : '#e2e8f0',
                    paddingBlock: 6,
                  },
                  Radio: {
                    buttonSolidCheckedBg: '#3b82f6',
                  },
                  Select: {
                    colorBgContainer: currentTheme === "dark" ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                    colorBorder: currentTheme === "dark" ? 'rgba(71, 85, 105, 0.4)' : '#e2e8f0',
                  }
                }
              }}
            >
              <div
                key={isSignUp ? "signup" : "signin"}
                className={`w-full ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
              >
                {isSignUp ? (
                  <SignUpForm
                    form={signUpForm}
                    onFinish={handleSignUp}
                    isLoading={signUpLoading}
                    isAnyLoading={isAnyLoading}
                    onSwitchMode={() => {
                      setShouldAnimate(true);
                      setIsSignUp(false);
                    }}
                  />
                ) : (
                  <SignInForm
                    form={signInForm}
                    onFinish={handleSignIn}
                    isLoading={signInLoading}
                    isAnyLoading={isAnyLoading}
                    onForgotPassword={() => setIsForgotPasswordOpen(true)}
                    onSwitchMode={() => {
                      setShouldAnimate(true);
                      setIsSignUp(true);
                    }}
                  />
                )}
              </div>
            </ConfigProvider>

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 py-1 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium rounded-full border border-slate-100 dark:border-slate-800">Hoặc tiếp tục với</span>
                </div>
              </div>

              <GoogleLoginButton
                isLoading={googleLoading}
                onClick={onGoogleLogin}
                isAnyLoading={isAnyLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
