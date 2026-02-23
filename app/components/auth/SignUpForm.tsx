import { Form, Input, Button, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { getPasswordValidationRules } from "@/lib/utils/validation";
import { FEATURES } from "@/app/config/features";

interface SignUpFormProps {
    form: FormInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFinish: (values: any) => void;
    isLoading: boolean;
    isAnyLoading: boolean;
    onSwitchMode: () => void;
}

export default function SignUpForm({
    form,
    onFinish,
    isLoading,
    isAnyLoading,
    onSwitchMode,
}: SignUpFormProps) {
    return (
        <Form
            form={form}
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            className="flex flex-col gap-4"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    className="mb-0"
                >
                    <Input
                        placeholder="Họ và tên"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
                </Form.Item>

                <Form.Item
                    name="username"
                    rules={[
                        { required: true, message: "Nhập username!" },
                        { pattern: /^[a-z0-9_]{3,20}$/, message: "3-20 ký tự thường/số/_" },
                    ]}
                    className="mb-0"
                >
                    <Input
                        placeholder="Tên đăng nhập"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                    className="mb-0"
                >
                    <Input
                        placeholder="Email"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
                </Form.Item>

                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: /^[0-9]{10,11}$/, message: "SĐT không hợp lệ!" },
                    ]}
                    className="mb-0"
                >
                    <Input
                        placeholder="Số điện thoại"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
                </Form.Item>

                <Form.Item name="role_id" initialValue={3} className="mb-0 col-span-1 md:col-span-2">
                    <Select
                        size="large"
                        disabled={!FEATURES.admin || isAnyLoading}
                        classNames={{
                            popup: {
                                root: "dark:bg-slate-800 dark:border-slate-700",
                            },
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
                    <Input.Password
                        placeholder="Mật khẩu"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
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
                    <Input.Password
                        placeholder="Xác nhận"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium"
                    />
                </Form.Item>
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
                Đăng Ký Ngay
            </Button>

            <div className="text-center mt-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Đã có tài khoản? </span>
                <button
                    type="button"
                    disabled={isAnyLoading}
                    onClick={onSwitchMode}
                    className={`text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 border-none bg-transparent outline-none ${isAnyLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                >
                    Đăng nhập
                </button>
            </div>
        </Form>
    );
}
