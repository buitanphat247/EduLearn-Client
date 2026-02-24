import { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Select, App } from "antd";
import type { FormInstance } from "antd/es/form";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { getPasswordValidationRules } from "@/lib/utils/validation";
import { FEATURES } from "@/app/config/features";
import { sendVerificationCode, verifyEmailCode } from "@/lib/api/auth";

interface SignUpFormProps {
    form: FormInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFinish: (values: any) => void;
    isLoading: boolean;
    isAnyLoading: boolean;
    onSwitchMode: () => void;
}

function generateUsername(fullname: string): string {
    return fullname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

const inputClass = "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-900/80 transition-all font-medium";

export default function SignUpForm({
    form,
    onFinish,
    isLoading,
    isAnyLoading,
    onSwitchMode,
}: SignUpFormProps) {
    const { message } = App.useApp();
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [otpCode, setOtpCode] = useState("");

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendOtp = useCallback(async () => {
        const email = form.getFieldValue("email");
        if (!email) { message.warning("Vui lòng nhập email trước!"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { message.warning("Email không hợp lệ!"); return; }
        setOtpLoading(true);
        try {
            const result = await sendVerificationCode(email);
            message.success(result.message || "Mã xác thực đã được gửi!");
            setOtpSent(true);
            setCountdown(60);
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : "Gửi mã thất bại");
        } finally { setOtpLoading(false); }
    }, [form, message]);

    const handleVerifyOtp = useCallback(async () => {
        const email = form.getFieldValue("email");
        if (!otpCode || otpCode.length !== 6) { message.warning("Vui lòng nhập đủ 6 số!"); return; }
        setVerifyLoading(true);
        try {
            const result = await verifyEmailCode(email, otpCode);
            if (result.verified) { message.success("Email đã được xác thực!"); setEmailVerified(true); }
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : "Xác thực thất bại");
        } finally { setVerifyLoading(false); }
    }, [form, otpCode, message]);

    const handleEmailChange = () => {
        if (emailVerified) { setEmailVerified(false); setOtpSent(false); setOtpCode(""); }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFinish = (values: any) => {
        const base = generateUsername(values.name || "");
        const suffix = Math.random().toString(36).substring(2, 5);
        onFinish({ ...values, username: `${base}_${suffix}` });
    };

    return (
        <Form
            form={form}
            name="signup"
            onFinish={handleFinish}
            layout="vertical"
            autoComplete="off"
            className="flex flex-col gap-3"
        >
            {/* Họ và tên */}
            <Form.Item
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                className="!mb-0"
            >
                <Input
                    placeholder="Họ và tên"
                    size="large"
                    disabled={isAnyLoading}
                    prefix={<UserOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                    className={inputClass}
                />
            </Form.Item>

            {/* Email + nút gửi mã */}
            <div className="flex gap-2 items-start">
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                    className="!mb-0 flex-1"
                >
                    <Input
                        placeholder="Email"
                        size="large"
                        disabled={isAnyLoading || emailVerified}
                        onChange={handleEmailChange}
                        prefix={<MailOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        suffix={
                            emailVerified ? (
                                <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                                    <SafetyOutlined /> Đã xác thực
                                </span>
                            ) : null
                        }
                        className={`${inputClass} ${emailVerified ? "!border-emerald-500/50 !bg-emerald-50/50 dark:!bg-emerald-950/20" : ""}`}
                    />
                </Form.Item>
                {!emailVerified && (
                    <Button
                        type="primary"
                        onClick={handleSendOtp}
                        loading={otpLoading}
                        disabled={countdown > 0 || isAnyLoading}
                        size="large"
                        className="h-[40px] shrink-0 whitespace-nowrap"
                    >
                        {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi mã xác thực"}
                    </Button>
                )}
            </div>

            {/* Mã xác thực + nút xác nhận */}
            {!emailVerified && (
                <div className="flex gap-2 items-start">
                    <Input
                        placeholder={otpSent ? "Nhập mã xác thực 6 số" : "Nhập mã xác thực"}
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        disabled={!otpSent || isAnyLoading || verifyLoading}
                        prefix={<SafetyOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        size="large"
                        className={`flex-1 ${inputClass}`}
                    />
                    <Button
                        type="primary"
                        onClick={handleVerifyOtp}
                        loading={verifyLoading}
                        disabled={!otpSent || otpCode.length !== 6 || isAnyLoading}
                        size="large"
                        className="h-[40px] shrink-0 whitespace-nowrap"
                    >
                        Xác nhận
                    </Button>
                </div>
            )}

            {/* SĐT + Vai trò */}
            <div className="grid grid-cols-2 gap-2">
                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: "Nhập SĐT!" },
                        { pattern: /^[0-9]{10,11}$/, message: "SĐT không hợp lệ!" },
                    ]}
                    className="!mb-0"
                >
                    <Input
                        placeholder="Số điện thoại"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className={inputClass}
                    />
                </Form.Item>

                <Form.Item name="role_id" initialValue={3} className="!mb-0">
                    <Select
                        size="large"
                        disabled={!FEATURES.admin || isAnyLoading}
                        classNames={{ popup: { root: "dark:bg-slate-800 dark:border-slate-700" } }}
                        options={
                            FEATURES.admin
                                ? [{ value: 3, label: "Học sinh" }, { value: 2, label: "Giảng viên" }]
                                : [{ value: 3, label: "Học sinh" }]
                        }
                    />
                </Form.Item>
            </div>

            {/* Mật khẩu + Xác nhận */}
            <div className="grid grid-cols-2 gap-2">
                <Form.Item name="password" rules={getPasswordValidationRules()} className="!mb-0">
                    <Input.Password
                        placeholder="Mật khẩu"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className={inputClass}
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
                    className="!mb-0"
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu"
                        size="large"
                        disabled={isAnyLoading}
                        prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        className={inputClass}
                    />
                </Form.Item>
            </div>

            {/* Submit */}
            <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={isAnyLoading || !emailVerified}
                block
                size="large"
                className="font-bold h-11 rounded-xl text-base mt-1"
            >
                {emailVerified ? "Đăng Ký" : "Xác thực email để đăng ký"}
            </Button>

            <div className="text-center mt-2">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Đã có tài khoản? </span>
                <button
                    type="button"
                    disabled={isAnyLoading}
                    onClick={onSwitchMode}
                    className={`text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 dark:hover:text-blue-300 transition-colors ml-1 border-none bg-transparent outline-none ${isAnyLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    Đăng nhập
                </button>
            </div>
        </Form>
    );
}
