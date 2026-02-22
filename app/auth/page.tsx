"use client";

import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Checkbox, App, ConfigProvider, theme, Select, Spin } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { signIn, signUp, googleLogin as googleLoginApi } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/users";
import { useTheme } from "@/app/context/ThemeContext";
import { getPasswordValidationRules } from "@/lib/utils/validation";
import { getCookie } from "@/lib/utils/cookies";
import ForgotPasswordModal from "@/app/components/auth/ForgotPasswordModal";
import { FEATURES } from "@/app/config/features";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInForm] = Form.useForm();
  const [signUpForm] = Form.useForm();
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [shouldAnimate, setShouldAnimate] = useState(false); // Control animation state
  const sessionRevokedShownRef = useRef(false);
  const isMountedRef = useRef(true);
  const googleCodeProcessedRef = useRef(false);

  // Chỉ một toast khi bị chuyển về đăng nhập do phiên đã bị đăng xuất (tránh trùng với toast từ layout)
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_revoked" && !sessionRevokedShownRef.current) {
      sessionRevokedShownRef.current = true;
      message.warning("Phiên đăng nhập đã bị đăng xuất khỏi hệ thống. Vui lòng đăng nhập lại.");
      if (typeof window !== "undefined") window.history.replaceState({}, "", "/auth");
    }
  }, [searchParams, message]);

  useEffect(() => {
    isMountedRef.current = true;

    const checkAuth = async () => {
      if (!isMountedRef.current) return;

      const user = getCurrentUser();
      const hasToken = typeof window !== "undefined" ? !!getCookie("_at") : false;

      if (user && hasToken) {
        router.push("/profile");
        return;
      }

      // Handle Google OAuth redirect callback — chỉ xử lý 1 lần (tránh race khi Strict Mode / double effect)
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
        handleGoogleCallback(code);
      }
    };

    checkAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, [router, searchParams]);

  const handleGoogleCallback = async (code: string) => {
    setGoogleLoading(true);
    try {
      const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth` : "";
      const res = await googleLoginApi({
        code,
        redirect_uri: redirectUri,
        device_name: navigator.userAgent,
      });

      if (!isMountedRef.current) return;

      const isSuccess = (res as any)?.status === true || (res as any)?.statusCode === 200 || !!(res as any)?.data?.user || !!(res as any)?.user;

      if (isSuccess) {
        message.success("Đăng nhập Google thành công!");
        window.location.href = "/profile";
        return;
      }
      message.error((res as any)?.message || "Đăng nhập Google thất bại");
    } catch (error: any) {
      if (!isMountedRef.current) return;
      message.error(error?.message || "Kết nối đến server thất bại");
    } finally {
      if (isMountedRef.current) setGoogleLoading(false);
    }
  };

  // Reset animation state when form changes (after animation completes)
  useEffect(() => {
    if (shouldAnimate) {
      // Reset animation state after animation completes (0.5s)
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSignUp, shouldAnimate]);

  const REDIRECT_DELAY_MS = 500;
  const RATE_LIMIT_DELAY_MS = 1000;
  const MAX_ATTEMPTS = 5;

  const [attemptCount, setAttemptCount] = useState(0);
  const lastAttemptRef = useRef<number>(0);
  const isSubmittingRef = useRef(false);

  interface SignInValues {
    email: string;
    password: string;
    remember?: boolean;
  }

  const handleSignIn = async (values: SignInValues) => {
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

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSignInLoading(true);
    lastAttemptRef.current = now;

    try {
      const deviceName = navigator.userAgent || "Web Browser";

      const response = await signIn({
        emailOrUsername: values.email,
        password: values.password,
        device_name: deviceName,
      });

      if (response.status && response.data?.user) {
        message.success("Đăng nhập thành công!");
        setAttemptCount(0);
        window.location.href = "/profile";
      } else {
        message.error(response.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        setAttemptCount(prev => prev + 1);
        setSignInLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      let errorMessage = errorData?.message || error?.message || "Đăng nhập thất bại. Vui lòng thử lại!";

      // Handle Account Lockout specifically
      if (errorData?.code === 'ACCOUNT_LOCKED') {
        errorMessage = errorData.message;
        // Optional: Disable form or show timer
      }

      message.error(errorMessage);
      setAttemptCount(prev => prev + 1);
      setSignInLoading(false);
      isSubmittingRef.current = false;
    }
  };

  interface SignUpValues {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role_id?: number;
    agreement: boolean;
  }

  const handleSignUp = async (values: SignUpValues) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;

    if (timeSinceLastAttempt < RATE_LIMIT_DELAY_MS) {
      message.warning("Vui lòng đợi một chút trước khi thử lại");
      return;
    }

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSignUpLoading(true);
    lastAttemptRef.current = now;

    try {
      const deviceName = navigator.userAgent || "Web Browser";

      const response = await signUp({
        username: values.username,
        fullname: values.name,
        email: values.email,
        phone: values.phone || "",
        password: values.password,
        role_id: FEATURES.admin ? (values.role_id ?? 3) : 3,
        device_name: deviceName,
      });

      if (response.status && response.data?.user) {
        message.success("Đăng ký thành công!");
        setAttemptCount(0);
        window.location.href = "/profile";
      } else {
        message.error(response.message || "Đăng ký thất bại. Vui lòng thử lại!");
        setAttemptCount(prev => prev + 1);
        setSignUpLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
      setAttemptCount(prev => prev + 1);
      setSignUpLoading(false);
      isSubmittingRef.current = false;
    }
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
        signInLoading={signInLoading}
        signUpLoading={signUpLoading}
        googleLoading={googleLoading}
        setGoogleLoading={setGoogleLoading}
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
  setGoogleLoading,
  handleSignIn,
  handleSignUp,
  setIsForgotPasswordOpen,
  shouldAnimate,
  setShouldAnimate,
  currentTheme,
  onGoogleLogin,
}: any) {
  const { message } = App.useApp();

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-500">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-stretch lg:items-center relative z-10 gap-8 lg:gap-16">

        {/* Left Side: Hero Content */}
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8 py-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-extrabold leading-tight text-slate-800 dark:text-white tracking-tight transition-colors">
              Học tập <span className="text-gradient animate-shine">Hiệu quả</span> <br />
              Tương lai <span className="text-blue-600 dark:text-blue-400">Rạng ngời</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed transition-colors">
              EduLearn mang đến trải nghiệm học tập đỉnh cao với công nghệ hiện đại, giúp bạn chinh phục mọi thử thách tri thức.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            {[
              { icon: "📚", title: "Kho Tài Liệu", desc: "Đa dạng & chất lượng" },
              { icon: "🚀", title: "Lộ Trình & Goal", desc: "Rõ ràng & tối ưu" },
              { icon: "👥", title: "Cộng Đồng", desc: "Hỗ trợ 24/7" },
              { icon: "🎓", title: "Chứng Chỉ", desc: "Được công nhận" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-300 dark:border-slate-700/50 p-5 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 cursor-default group shadow-sm hover:shadow-md"
                style={{ animationDelay: `${index * 1.5}s` }}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300" suppressHydrationWarning>{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                const initials = ['A', 'T', 'M', 'H'];
                return (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-50 dark:border-[#0f172a] ${colors[i - 1]} flex items-center justify-center text-white text-sm font-bold transition-colors`}>
                    {initials[i - 1]}
                  </div>
                );
              })}
              <div className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-[#0f172a] bg-blue-600 flex items-center justify-center text-white text-xs font-bold z-10 transition-colors">
                10k+
              </div>
            </div>
            <p>Người học đã tham gia</p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl mx-auto py-8 relative z-20">
          <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 lg:p-10 relative overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700 transition-colors duration-300">
            {/* Smooth Switch Animation Wrapper can go here but keeping it simple with state */}

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
                  <Form
                    form={signUpForm}
                    name="signup"
                    onFinish={handleSignUp}
                    layout="vertical"
                    autoComplete="off"
                    className="flex flex-col gap-4"
                  >


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Form.Item name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]} className="mb-0">
                        <Input placeholder="Họ và tên" size="large" prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item
                        name="username"
                        rules={[
                          { required: true, message: "Nhập username!" },
                          { pattern: /^[a-z0-9_]{3,20}$/, message: "3-20 ký tự thường/số/_" }
                        ]}
                        className="mb-0"
                      >
                        <Input placeholder="Tên đăng nhập" size="large" prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]} className="mb-0">
                        <Input placeholder="Email" size="large" prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, { pattern: /^[0-9]{10,11}$/, message: "SĐT không hợp lệ!" }]} className="mb-0">
                        <Input placeholder="Số điện thoại" size="large" prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="role_id" initialValue={3} className="mb-0 col-span-1 md:col-span-2">
                        <Select
                          size="large"
                          disabled={!FEATURES.admin}
                          classNames={{
                            popup: {
                              root: "dark:bg-slate-800 dark:border-slate-700"
                            }
                          }}
                          options={
                            FEATURES.admin
                              ? [
                                  { value: 3, label: "Học sinh" },
                                  { value: 2, label: "Giảng viên" },
                                ]
                              : [{ value: 3, label: "Học sinh" }]
                          }
                        />
                      </Form.Item>

                      <Form.Item name="password" rules={getPasswordValidationRules()} className="mb-0">
                        <Input.Password placeholder="Mật khẩu" size="large" prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                          { required: true, message: "Xác nhận!" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("password") === value) return Promise.resolve();
                              return Promise.reject(new Error("Không khớp!"));
                            },
                          }),
                        ]}
                        className="mb-0"
                      >
                        <Input.Password placeholder="Xác nhận" size="large" prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>
                    </div>



                    <Button type="primary" htmlType="submit" loading={signUpLoading} block size="middle" className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 font-bold h-11 rounded-xl text-base mt-2 transition-all">
                      Đăng Ký Ngay
                    </Button>

                    <div className="text-center mt-4">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Đã có tài khoản? </span>
                      <button onClick={() => {
                        setShouldAnimate(true);
                        setIsSignUp(false);
                      }} className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 cursor-pointer">
                        Đăng nhập
                      </button>
                    </div>
                  </Form>
                ) : (
                  <Form
                    form={signInForm}
                    name="signin"
                    onFinish={handleSignIn}
                    layout="vertical"
                    autoComplete="off"
                    className="flex flex-col gap-5"
                  >


                    <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]} className="mb-2">
                      <Input size="large" placeholder="Email của bạn" prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]} className="mb-0">
                      <Input.Password size="large" placeholder="Mật khẩu" prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all" />
                    </Form.Item>

                    <div className="flex justify-end items-center -mt-2">
                      <a onClick={(e) => { e.preventDefault(); setIsForgotPasswordOpen(true); }} className="text-sm font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer">Quên mật khẩu?</a>
                    </div>

                    <Button type="primary" htmlType="submit" loading={signInLoading} block size="middle" className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 font-bold h-11 rounded-xl text-base mt-2 transition-all">
                      Đăng Nhập
                    </Button>

                    <div className="text-center mt-4">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Chưa có tài khoản? </span>
                      <button onClick={() => {
                        setShouldAnimate(true);
                        setIsSignUp(true);
                      }} className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 cursor-pointer">
                        Đăng ký ngay
                      </button>
                    </div>
                  </Form>
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

              {googleLoading ? (
                <div className="flex items-center justify-center gap-3 py-3">
                  <Spin size="small" />
                  <span className="text-slate-500 dark:text-slate-400">Đang xử lý...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer text-slate-700 dark:text-slate-200 font-medium text-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957A8.996 8.996 0 000 9.002a8.996 8.996 0 00.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.48 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                  </svg>
                  Đăng nhập bằng Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
