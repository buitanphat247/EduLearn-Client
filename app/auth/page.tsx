"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Divider, Checkbox, App, Radio, ConfigProvider, theme, Select } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/users";
import { useTheme } from "@/app/context/ThemeContext";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInForm] = Form.useForm();
  const [signUpForm] = Form.useForm();
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    const user = getCurrentUser();
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (user && token) {
      router.push("/profile");
    }
  }, [router]);

  const handleSignIn = async (values: any) => {
    setSignInLoading(true);
    try {
      const deviceName = navigator.userAgent || "Web Browser";

      const response = await signIn({
        emailOrUsername: values.email,
        password: values.password,
        device_name: deviceName,
      });

      if (response.status && response.data?.user) {
        // Backend đã mã hóa và set cookie rồi
        // KHÔNG lưu vào localStorage nữa - chỉ dùng cookie đã mã hóa
        // Tất cả thông tin sẽ được đọc từ cookie ở server-side

        message.success("Đăng nhập thành công!");
        setTimeout(() => {
          router.push("/profile");
        }, 500);
      } else {
        message.error(response.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        setSignInLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (values: any) => {
    setSignUpLoading(true);
    try {
      const deviceName = navigator.userAgent || "Web Browser";
      const username = values.email.split("@")[0] || values.name.toLowerCase().replace(/\s+/g, "_");

      const response = await signUp({
        username: username,
        fullname: values.name,
        email: values.email,
        phone: values.phone || "",
        password: values.password,
        role_id: values.role_id || 3,
        device_name: deviceName,
      });

      if (response.status && response.data?.user) {
        // Backend đã mã hóa và set cookie rồi
        // KHÔNG lưu vào localStorage nữa - chỉ dùng cookie đã mã hóa
        // Tất cả thông tin sẽ được đọc từ cookie ở server-side

        message.success("Đăng ký thành công!");
        setTimeout(() => {
          router.push("/profile");
        }, 500);
      } else {
        message.error(response.message || "Đăng ký thất bại. Vui lòng thử lại!");
        setSignUpLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      message.error(errorMessage);
      setSignUpLoading(false);
    }
  };

  const { theme: currentTheme } = useTheme();

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
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-[#0f172a] bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs text-slate-600 dark:text-white transition-colors">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                </div>
              ))}
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
              <div key={isSignUp ? "signup" : "signin"} className="animate-fade-in-up w-full">
                {isSignUp ? (
                  <Form
                    form={signUpForm}
                    name="signup"
                    onFinish={handleSignUp}
                    layout="vertical"
                    autoComplete="off"
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <Button
                        block
                        icon={<GoogleOutlined className="text-sm" />}
                        className="flex items-center justify-center h-10 rounded-xl text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm shadow-sm"
                        onClick={() => message.info("Tính năng đang phát triển")}
                      >
                        Google
                      </Button>
                      <Button
                        block
                        icon={<FacebookFilled className="text-sm" />}
                        className="flex items-center justify-center h-10 rounded-xl text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm shadow-sm"
                        onClick={() => message.info("Tính năng đang phát triển")}
                      >
                        Facebook
                      </Button>
                    </div>

                    <div className="relative my-1">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700/60"></div></div>
                      <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider"><span className="bg-slate-100 dark:bg-[#131b2e] px-3 text-slate-500 rounded-full transition-colors">Hoặc với email</span></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Form.Item name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]} className="mb-0">
                        <Input placeholder="Họ và tên" size="large" prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]} className="mb-0">
                        <Input placeholder="Email" size="large" prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, { pattern: /^[0-9]{10,11}$/, message: "SĐT không hợp lệ!" }]} className="mb-0">
                        <Input placeholder="Số điện thoại" size="large" prefix={<i className="fas fa-phone text-slate-400 dark:text-slate-500 text-sm mr-2" />} className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium" />
                      </Form.Item>

                      <Form.Item name="role_id" initialValue={3} className="mb-0">
                        <Select
                          size="large"
                          popupClassName="dark:bg-slate-800 dark:border-slate-700"
                          options={[
                            { value: 3, label: 'Học sinh' },
                            { value: 2, label: 'Giảng viên' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu!" }, { min: 6, message: "Tối thiểu 6 ký tự!" }]} className="mb-0">
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

                    <Form.Item name="agreement" valuePropName="checked" rules={[{ validator: (_, val) => val ? Promise.resolve() : Promise.reject(new Error("Bạn chưa đồng ý điều khoản!")) }]} className="mb-2 mt-2">
                      <Checkbox className="text-slate-500 dark:text-slate-400 text-sm">Tôi đồng ý với <a href="#" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">Điều khoản</a> & <a href="#" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">Chính sách</a></Checkbox>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={signUpLoading} block size="middle" className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 font-bold h-11 rounded-xl text-base mt-2 transition-all">
                      Đăng Ký Ngay
                    </Button>

                    <div className="text-center mt-4">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Đã có tài khoản? </span>
                      <button onClick={() => setIsSignUp(false)} className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 cursor-pointer">
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
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <Button
                        block
                        icon={<GoogleOutlined className="text-sm" />}
                        className="flex items-center justify-center h-10 rounded-xl text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm shadow-sm"
                        onClick={() => message.info("Tính năng đang phát triển")}
                      >
                        Google
                      </Button>
                      <Button
                        block
                        icon={<FacebookFilled className="text-sm" />}
                        className="flex items-center justify-center h-10 rounded-xl text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm shadow-sm"
                        onClick={() => message.info("Tính năng đang phát triển")}
                      >
                        Facebook
                      </Button>
                    </div>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700/60"></div></div>
                      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider"><span className="bg-slate-100 dark:bg-[#131b2e] px-4 text-slate-500 rounded-full py-1">Hoặc tiếp tục với email</span></div>
                    </div>

                    <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]} className="mb-2">
                      <Input size="large" placeholder="Email của bạn" prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]} className="mb-0">
                      <Input.Password size="large" placeholder="Mật khẩu" prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />} className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all" />
                    </Form.Item>

                    <div className="flex justify-between items-center -mt-2">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-slate-500 dark:text-slate-400 text-sm">Ghi nhớ</Checkbox>
                      </Form.Item>
                      <a href="#" className="text-sm font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Quên mật khẩu?</a>
                    </div>

                    <Button type="primary" htmlType="submit" loading={signInLoading} block size="middle" className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 font-bold h-11 rounded-xl text-base mt-2 transition-all">
                      Đăng Nhập
                    </Button>

                    <div className="text-center mt-4">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Chưa có tài khoản? </span>
                      <button onClick={() => setIsSignUp(true)} className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 cursor-pointer">
                        Đăng ký ngay
                      </button>
                    </div>
                  </Form>
                )}
              </div>
            </ConfigProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
