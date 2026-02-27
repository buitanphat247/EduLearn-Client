"use client";

import { Suspense, useState } from "react";
import { Form, Input, Button, Card, Typography, Spin, App, Result } from "antd";
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/config/api";

const { Title, Text } = Typography;

// Helper error handler
function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosErr = error as any;
    return axiosErr?.response?.data?.message || axiosErr?.message || fallback;
}

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [form] = Form.useForm();
    const [isSuccess, setIsSuccess] = useState(false);
    const { message } = App.useApp();

    // Verify token query
    const { data: verifyData, isLoading: verifying, isError: verifyError } = useQuery({
        queryKey: ["verifyResetToken", token],
        queryFn: async () => {
            if (!token) throw new Error("No token provided");
            const response = await apiClient.get(`/auth/verify-reset-token/${token}`);
            if (!response.data?.data?.valid) {
                throw new Error("Token invalid");
            }
            return response.data.data as { valid: boolean; email: string };
        },
        enabled: !!token,
        retry: false,
    });

    const isTokenValid = !verifyError && verifyData?.valid;
    const email = verifyData?.email || "";

    // Reset password mutation
    const resetMutation = useMutation({
        mutationFn: async (values: { newPassword: string }) => {
            const response = await apiClient.post("/auth/reset-password", {
                token,
                newPassword: values.newPassword,
            });
            return response.data;
        },
        onSuccess: () => {
            setIsSuccess(true);
            message.success("Đặt lại mật khẩu thành công!");
        },
        onError: (error: unknown) => {
            const errorMessage = getApiErrorMessage(error, "Có lỗi xảy ra. Vui lòng thử lại.");
            message.error(errorMessage);
        },
    });

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
                                <Button type="primary" size="large" className="rounded-lg cursor-pointer">
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
                                <Button type="primary" size="large" className="rounded-lg cursor-pointer">
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
                    onFinish={(values) => resetMutation.mutate(values)}
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
                            loading={resetMutation.isPending}
                            block
                            size="large"
                            className="rounded-lg h-12 font-medium cursor-pointer"
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        <Link href="/auth" className="text-gray-500 hover:text-blue-500 text-sm cursor-pointer border-none bg-transparent outline-none">
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

