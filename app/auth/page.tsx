"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Divider, Checkbox, App, Radio } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/users";

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
        const user = response.data.user;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));

          const userData = { ...user };
          delete (userData as any).access_token;
          delete (userData as any).refresh_token;
          document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }

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
        const user = response.data.user;

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));

          const userData = { ...user };
          delete (userData as any).access_token;
          delete (userData as any).refresh_token;
          document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }

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

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-blue-500 via-cyan-500 to-teal-400 flex-col items-center justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-teal-500/20"></div>
        <div className="relative z-10 max-w-lg space-y-8 text-white">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">Giữ sức khỏe học tập trong tay bạn!</h1>
            <p className="text-xl text-white/90 leading-relaxed">Khám phá nền tảng EduLearn - Nơi học tập trở nên dễ dàng và hiệu quả</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3" suppressHydrationWarning>
                📚
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">Học tập</h3>
              <p className="text-sm text-white/80">Tài liệu phong phú</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3" suppressHydrationWarning>
                💬
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">Tương tác</h3>
              <p className="text-sm text-white/80">Cộng đồng sôi động</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3" suppressHydrationWarning>
                📊
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">Theo dõi</h3>
              <p className="text-sm text-white/80">Tiến độ học tập</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-3" suppressHydrationWarning>
                🎯
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">Mục tiêu</h3>
              <p className="text-sm text-white/80">Đạt thành tích cao</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className=" w-full">
          {!isSignUp ? (
            <div className="bg-white rounded-2xl">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">EduLearn</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Đăng nhập vào tài khoản</h2>
                <p className="text-gray-600 text-sm mt-2">
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                  >
                    Đăng ký miễn phí
                  </button>
                </p>
              </div>

              <Form
                form={signInForm}
                name="signin"
                onFinish={handleSignIn}
                layout="vertical"
                autoComplete="off"
                size="large"
                className="[&_.ant-form-item]:mb-3"
              >
                <div className="space-y-2 mb-3 flex gap-2">
                  <Button
                    icon={<i className="fab fa-google" />}
                    block
                    size="large"
                    className="h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium cursor-pointer"
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Tiếp tục với Google
                  </Button>
                  <Button
                    icon={<i className="fa-brands fa-facebook-f"></i>}
                    block
                    size="large"
                    className="h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium cursor-pointer"
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Tiếp tục với Facebook
                  </Button>
                </div>

                <Divider className="my-3">
                  <span className="text-gray-500 text-sm">Hoặc</span>
                </Divider>

                <Form.Item
                  name="email"
                  label={<span className="text-gray-700 font-medium">Địa chỉ email</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    placeholder="example@mail.com"
                    className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors cursor-text"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                >
                  <Input.Password
                    placeholder="Nhập mật khẩu của bạn"
                    className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors cursor-text"
                  />
                </Form.Item>

                <Form.Item>
                  <div className="flex items-center justify-between">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox className="text-gray-600 cursor-pointer text-sm">Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer">
                      Tôi quên mật khẩu
                    </a>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={signInLoading}
                    className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg h-10 font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Link href="/">
                    <Button
                      type="default"
                      icon={<i className="fas fa-home" />}
                      block
                      size="large"
                      className="h-10 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      Về trang chủ
                    </Button>
                  </Link>
                </Form.Item>
              </Form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">EduLearn</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h2>
              </div>

              <Form form={signUpForm} name="signup" onFinish={handleSignUp} layout="vertical" autoComplete="off" className="[&_.ant-form-item]:mb-3">
                <div className="space-y-2 mb-3 flex gap-2">
                  <Button
                    icon={<i className="fab fa-google" />}
                    block
                    size="large"
                    className="h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium cursor-pointer"
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Tiếp tục với Google
                  </Button>
                  <Button
                    icon={<i className="fa-brands fa-facebook-f"></i>}
                    block
                    size="large"
                    className="h-10 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium cursor-pointer"
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Tiếp tục với Facebook
                  </Button>
                </div>

                <Divider className="my-3">
                  <span className="text-gray-500 text-sm">Hoặc</span>
                </Divider>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    name="name"
                    label={<span className="text-gray-700 font-medium">Họ và tên</span>}
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                  >
                    <Input
                      placeholder="Nhập họ và tên của bạn"
                      className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors cursor-text"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={<span className="text-gray-700 font-medium">Địa chỉ email</span>}
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input
                      placeholder="example@mail.com"
                      className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="phone"
                  label={<span className="text-gray-700 font-medium">Số điện thoại</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    placeholder="0912345678"
                    className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </Form.Item>

                <Form.Item
                  name="role_id"
                  label={<span className="text-gray-700 font-medium">Loại tài khoản</span>}
                  rules={[{ required: true, message: "Vui lòng chọn loại tài khoản!" }]}
                  initialValue={3}
                >
                  <Radio.Group className="w-full" optionType="button" buttonStyle="solid">
                    <Radio value={2}>Giảng viên</Radio>
                    <Radio value={3}>Học sinh</Radio>
                  </Radio.Group>
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    name="password"
                    label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      {
                        min: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu của bạn"
                      className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={["password"]}
                    label={<span className="text-gray-700 font-medium">Xác nhận mật khẩu</span>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập lại mật khẩu"
                      className="h-10 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors cursor-text"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error("Vui lòng đồng ý với điều khoản!"))),
                    },
                  ]}
                  className="mb-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <Checkbox className="text-gray-600 text-sm cursor-pointer">
                      Bằng cách tạo tài khoản, bạn đồng ý với{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                        Điều khoản sử dụng
                      </a>
                    </Checkbox>
                    <span className="text-gray-600 text-sm">
                      Đã có tài khoản?{" "}
                      <button
                        onClick={() => setIsSignUp(false)}
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                      >
                        Đăng nhập
                      </button>
                    </span>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={signUpLoading}
                    className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg h-10 font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Đăng ký miễn phí
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Link href="/">
                    <Button
                      type="default"
                      icon={<i className="fas fa-home" />}
                      block
                      size="large"
                      className="h-10 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all cursor-pointer"
                    >
                      Về trang chủ
                    </Button>
                  </Link>
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
