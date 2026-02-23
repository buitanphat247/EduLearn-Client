import { Form, Input, Button } from "antd";
import type { FormInstance } from "antd/es/form";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

interface SignInFormProps {
    form: FormInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFinish: (values: any) => void;
    isLoading: boolean;
    isAnyLoading: boolean;
    onSwitchMode: () => void;
    onForgotPassword: () => void;
}

export default function SignInForm({
    form,
    onFinish,
    isLoading,
    isAnyLoading,
    onSwitchMode,
    onForgotPassword,
}: SignInFormProps) {
    return (
        <Form
            form={form}
            name="signin"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            className="flex flex-col gap-5"
        >
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                ]}
                className="mb-2"
            >
                <Input
                    size="large"
                    placeholder="Email của bạn"
                    disabled={isAnyLoading}
                    prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                className="mb-0"
            >
                <Input.Password
                    size="large"
                    placeholder="Mật khẩu"
                    disabled={isAnyLoading}
                    prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all"
                />
            </Form.Item>

            <div className="flex justify-end items-center -mt-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        if (!isAnyLoading) onForgotPassword();
                    }}
                    className={`text-sm font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors bg-transparent border-none outline-none ${isAnyLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                        }`}
                >
                    Quên mật khẩu?
                </button>
            </div>

            <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={isAnyLoading}
                block
                size="middle"
                className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-none shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 font-bold h-11 rounded-xl text-base mt-2 transition-all cursor-pointer"
            >
                Đăng Nhập
            </Button>

            <div className="text-center mt-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Chưa có tài khoản? </span>
                <button
                    type="button"
                    disabled={isAnyLoading}
                    onClick={onSwitchMode}
                    className={`text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 border-none bg-transparent outline-none ${isAnyLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                >
                    Đăng ký ngay
                </button>
            </div>
        </Form>
    );
}
