"use client";

import { useState, useEffect, Suspense } from "react";
import { Form, Input, Button, Card, Typography, Spin, App, Result } from "antd";
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/app/config/api";

const { Title, Text } = Typography;

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const { message } = App.useApp();

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerifying(false);
                return;
            }

            try {
                const response = await apiClient.get(`/auth/verify-reset-token/${token}`);
                if (response.data?.data?.valid) {
                    setIsTokenValid(true);
                    setEmail(response.data?.data?.email || "");
                }
            } catch (error) {
                setIsTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleResetPassword = async (values: { newPassword: string }) => {
        setLoading(true);
        try {
            await apiClient.post("/auth/reset-password", {
                token,
                newPassword: values.newPassword,
            });
            setIsSuccess(true);
            message.success("Đặt lại mật khẩu thành công!");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
                    <div className="text-center py-12">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-500">Đang xác thực link...</div>
                    </div>
                </Card>
            </div>
        );
    }

    // Invalid/expired token
    if (!token || !isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
                    <Result
                        status="error"
                        icon={<CloseCircleOutlined className="text-red-500" />}
                        title="Link không hợp lệ"
                        subTitle="Link đặt lại mật khẩu đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu link mới."
                        extra={[
                            <Link href="/auth" key="back">
                                <Button type="primary" size="large" className="rounded-lg">
                                    Quay lại đăng nhập
                                </Button>
                            </Link>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
                    <Result
                        status="success"
                        icon={<CheckCircleOutlined className="text-green-500" />}
                        title="Đặt lại mật khẩu thành công!"
                        subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
                        extra={[
                            <Link href="/auth" key="login">
                                <Button type="primary" size="large" className="rounded-lg">
                                    Đăng nhập ngay
                                </Button>
                            </Link>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <LockOutlined className="text-2xl text-blue-500" />
                    </div>
                    <Title level={3} className="!mb-2">Đặt lại mật khẩu</Title>
                    {email && (
                        <Text type="secondary" className="text-sm">
                            Tài khoản: <span className="font-medium text-blue-600">{email}</span>
                        </Text>
                    )}
                </div>

                <Form
                    form={form}
                    name="reset-password"
                    onFinish={handleResetPassword}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                message: "Mật khẩu phải có chữ hoa, chữ thường và số!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Xác nhận mật khẩu mới"
                            size="large"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item className="mb-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="rounded-lg h-12 font-medium"
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <Link href="/auth" className="text-gray-500 hover:text-blue-500 text-sm">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <Spin size="large" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
