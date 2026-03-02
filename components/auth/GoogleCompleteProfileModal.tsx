import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Form, Input, Select, Button, App } from 'antd';
import { MailOutlined, PhoneOutlined, LockOutlined, UserOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPasswordValidationRules } from '@/lib/utils/validation';
import { sendVerificationCode, verifyEmailCode } from '@/lib/services/auth';

interface GoogleCompleteProfileModalProps {
    open: boolean;
    onCancel: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFinish: (values: any) => void;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    googleInfo: any;
}

/* ─────────── 6-digit OTP Input ─────────── */
function OtpInput({
    value,
    onChange,
    disabled,
    onComplete,
}: {
    value: string;
    onChange: (val: string) => void;
    disabled: boolean;
    onComplete: () => void;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, '').split('').slice(0, 6);

    const focusAt = (i: number) => {
        setTimeout(() => inputRefs.current[i]?.focus(), 0);
    };

    const handleChange = (idx: number, char: string) => {
        // Chỉ cho phép số
        const cleaned = char.replace(/\D/g, '');
        if (!cleaned) return;

        const arr = digits.slice();
        arr[idx] = cleaned[0];
        const next = arr.join('');
        onChange(next);

        if (idx < 5) focusAt(idx + 1);
        if (next.length === 6 && idx === 5) onComplete();
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const arr = digits.slice();
            if (arr[idx] && arr[idx] !== ' ') {
                arr[idx] = ' ';
                onChange(arr.join('').trimEnd());
            } else if (idx > 0) {
                arr[idx - 1] = ' ';
                onChange(arr.join('').trimEnd());
                focusAt(idx - 1);
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            focusAt(idx - 1);
        } else if (e.key === 'ArrowRight' && idx < 5) {
            focusAt(idx + 1);
        } else if (e.key === 'Enter' && value.replace(/\s/g, '').length === 6) {
            onComplete();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted) {
            onChange(pasted);
            focusAt(Math.min(pasted.length, 5));
            if (pasted.length === 6) onComplete();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[idx]?.trim() || ''}
                    disabled={disabled}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={`
                        w-11 h-12 text-center text-xl font-semibold
                        rounded-lg border transition-all duration-200 outline-none
                        ${disabled
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }
                    `}
                    aria-label={`Mã xác thực số ${idx + 1}`}
                />
            ))}
        </div>
    );
}

/* ─────────── Main Modal ─────────── */
export default function GoogleCompleteProfileModal({
    open,
    onCancel,
    onFinish,
    isLoading,
    googleInfo
}: GoogleCompleteProfileModalProps) {
    const [form] = Form.useForm();
    const { message } = App.useApp();

    // OTP state
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [otpCode, setOtpCode] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (open && googleInfo) {
            form.setFieldsValue({
                email: googleInfo.email,
                name: googleInfo.fullname,
                role_id: 3
            });
            setEmailVerified(false);
            setOtpSent(false);
            setOtpCode('');
            setCountdown(0);
        }
    }, [open, googleInfo, form]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // Gửi mã xác thực
    const handleSendOtp = useCallback(async () => {
        if (!googleInfo?.email) return;
        setOtpLoading(true);
        try {
            const result = await sendVerificationCode(googleInfo.email);
            message.success(result.message || 'Mã xác thực đã được gửi tới email!');
            setOtpSent(true);
            setCountdown(60);
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : 'Gửi mã thất bại');
        } finally {
            setOtpLoading(false);
        }
    }, [googleInfo, message]);

    // Xác nhận OTP
    const handleVerifyOtp = useCallback(async () => {
        if (!googleInfo?.email) return;
        const cleanCode = otpCode.replace(/\s/g, '');
        if (!cleanCode || cleanCode.length !== 6) {
            message.warning('Vui lòng nhập đủ 6 số!');
            return;
        }
        setVerifyLoading(true);
        try {
            const result = await verifyEmailCode(googleInfo.email, cleanCode);
            if (result.verified) {
                message.success('Email đã được xác thực thành công!');
                setEmailVerified(true);
            }
        } catch (error: unknown) {
            message.error(error instanceof Error ? error.message : 'Xác thực thất bại');
        } finally {
            setVerifyLoading(false);
        }
    }, [googleInfo, otpCode, message]);

    const anyLoading = isLoading || otpLoading || verifyLoading;

    return (
        <Modal
            title={<span className="text-xl font-bold dark:text-white">Hoàn tất đăng ký - Tài khoản Google</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            centered
            className="dark-modal"
            maskClosable={!anyLoading}
            closable={!anyLoading}
            width={520}
        >
            <div className="mb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Tài khoản Google của bạn chưa được liên kết. Vui lòng xác thực email và bổ sung thông tin để tạo tài khoản mới.
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="flex flex-col gap-2"
            >
                {/* Họ tên + Email (disabled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Form.Item name="name" className="mb-0">
                        <Input
                            disabled
                            placeholder="Họ và tên"
                            size="large"
                            className="bg-slate-100 cursor-not-allowed text-slate-500"
                            prefix={<UserOutlined className="text-slate-400 mr-2" />}
                        />
                    </Form.Item>

                    <Form.Item name="email" className="mb-0">
                        <Input
                            disabled
                            placeholder="Email"
                            size="large"
                            className="bg-slate-100 cursor-not-allowed text-slate-500"
                            prefix={<MailOutlined className="text-slate-400 mr-2" />}
                            suffix={
                                emailVerified ? (
                                    <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                                        <CheckCircleOutlined /> Đã xác thực
                                    </span>
                                ) : null
                            }
                        />
                    </Form.Item>
                </div>

                {/* Xác thực email OTP */}
                {!emailVerified && (
                    <div className="mt-3 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <SafetyOutlined />
                            Xác thực email để tiếp tục đăng ký
                        </p>

                        {!otpSent ? (
                            <Button
                                type="primary"
                                onClick={handleSendOtp}
                                loading={otpLoading}
                                disabled={anyLoading}
                                block
                                size="large"
                                className="font-semibold h-11 rounded-lg"
                            >
                                Gửi mã xác thực tới {googleInfo?.email}
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                    Mã xác thực 6 số đã được gửi tới{' '}
                                    <strong className="text-slate-700 dark:text-slate-200">{googleInfo?.email}</strong>
                                </p>

                                {/* 6-digit OTP boxes */}
                                <OtpInput
                                    value={otpCode}
                                    onChange={setOtpCode}
                                    disabled={anyLoading}
                                    onComplete={handleVerifyOtp}
                                />

                                {/* Xác nhận button */}
                                <Button
                                    type="primary"
                                    onClick={handleVerifyOtp}
                                    loading={verifyLoading}
                                    disabled={otpCode.replace(/\s/g, '').length !== 6 || anyLoading}
                                    block
                                    size="middle"
                                    className="font-semibold rounded-lg"
                                >
                                    Xác nhận mã
                                </Button>

                                {/* Gửi lại */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        Không nhận được mã?
                                    </span>
                                    <Button
                                        type="link"
                                        onClick={handleSendOtp}
                                        loading={otpLoading}
                                        disabled={countdown > 0 || anyLoading}
                                        size="small"
                                        className="text-xs p-0 h-auto"
                                    >
                                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Đã xác thực */}
                {emailVerified && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-2">
                        <CheckCircleOutlined className="text-emerald-500 text-lg" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Email đã được xác thực thành công!
                        </span>
                    </div>
                )}

                {/* Số điện thoại */}
                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' },
                    ]}
                    className="mb-0 mt-3"
                >
                    <Input
                        placeholder="Số điện thoại"
                        size="large"
                        disabled={anyLoading || !emailVerified}
                        prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                    />
                </Form.Item>

                {/* Mật khẩu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Form.Item name="password" rules={getPasswordValidationRules()} className="mb-0">
                        <Input.Password
                            placeholder="Mật khẩu"
                            size="large"
                            disabled={anyLoading || !emailVerified}
                            prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                        className="mb-0"
                    >
                        <Input.Password
                            placeholder="Xác nhận mật khẩu"
                            size="large"
                            disabled={anyLoading || !emailVerified}
                            prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        />
                    </Form.Item>
                </div>

                {/* Vai trò */}
                <Form.Item
                    name="role_id"
                    label={<span className="text-slate-700 dark:text-slate-300 font-medium">Vai trò</span>}
                    className="mb-3 mt-2"
                >
                    <Select
                        size="large"
                        disabled={true}
                        options={[
                            { value: 3, label: 'Học sinh' },
                            { value: 2, label: 'Giảng viên', disabled: true }
                        ]}
                    />
                </Form.Item>

                {/* Submit */}
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    disabled={anyLoading || !emailVerified}
                    block
                    size="large"
                    className="bg-blue-600 hover:bg-blue-500 border-none font-bold h-12 rounded-xl"
                >
                    {emailVerified ? 'Hoàn Tất Đăng Ký' : 'Xác thực email để đăng ký'}
                </Button>
            </Form>
        </Modal>
    );
}
