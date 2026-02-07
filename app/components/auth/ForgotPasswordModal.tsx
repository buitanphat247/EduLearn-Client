"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, Steps, message, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ForgotPasswordModalProps {
    open: boolean;
    onCancel: () => void;
}

export default function ForgotPasswordModal({ open, onCancel }: ForgotPasswordModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [form] = Form.useForm();

    // Reset state when modal closes
    const handleCancel = () => {
        form.resetFields();
        setCurrentStep(0);
        setEmail("");
        setLoading(false);
        onCancel();
    };

    const handleEmailSubmit = async (values: { email: string }) => {
        setLoading(true);
        // Fake API call
        setTimeout(() => {
            setLoading(false);
            setEmail(values.email);
            setCurrentStep(1);
            message.success("Mã xác nhận đã được gửi đến email của bạn!");
        }, 1500);
    };

    const handleVerifyCode = async (values: { code: string }) => {
        setLoading(true);
        // Fake API call
        setTimeout(() => {
            setLoading(false);
            if (values.code === "123456") { // Mock check (optional, or just pass purely)
                // Actually for mock purposes let's just accept any code or specific mock code
            }
            setCurrentStep(2);
            message.success("Xác thực thành công!");
        }, 1500);
    };

    const handleResetPassword = async (values: { password: string }) => {
        setLoading(true);
        // Fake API call
        setTimeout(() => {
            setLoading(false);
            message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            handleCancel();
        }, 1500);
    };

    const steps = [
        {
            title: "Email",
            icon: <UserOutlined />,
        },
        {
            title: "Xác thực",
            icon: <SafetyOutlined />,
        },
        {
            title: "Mật khẩu mới",
            icon: <LockOutlined />,
        },
    ];

    return (
        <Modal
            title={
                <div className="text-center font-bold text-lg mb-6">
                    Khôi phục mật khẩu
                </div>
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            centered
            maskClosable={false}
            closable={!loading}
        >
            <div className="mb-8">
                <Steps current={currentStep} items={steps} size="small" />
            </div>

            <div className="mt-4">
                {/* Step 1: Email Input */}
                {currentStep === 0 && (
                    <Form
                        name="forgot-password-email"
                        onFinish={handleEmailSubmit}
                        layout="vertical"
                        autoComplete="off"
                        initialValues={{ email: "" }}
                    >
                        <div className="text-center mb-6 text-gray-500 dark:text-gray-400">
                            Nhập email của bạn để nhận mã xác thực khôi phục mật khẩu.
                        </div>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email!" },
                                { type: "email", message: "Email không hợp lệ!" }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="Email của bạn"
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" className="rounded-lg h-10 font-medium">
                                Gửi mã xác nhận
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {/* Step 2: Code Verification */}
                {currentStep === 1 && (
                    <Form
                        name="forgot-password-code"
                        onFinish={handleVerifyCode}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <div className="text-center mb-6">
                            <div className="text-gray-500 dark:text-gray-400 mb-2">
                                Mã xác nhận đã được gửi đến:
                            </div>
                            <div className="font-bold text-blue-600 text-lg">{email}</div>
                        </div>

                        <Form.Item
                            name="code"
                            rules={[
                                { required: true, message: "Vui lòng nhập mã xác nhận!" },
                                { len: 6, message: "Mã xác nhận phải có 6 ký tự!" }
                            ]}
                        >
                            <Input.OTP size="large" length={6} className="justify-center" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" className="rounded-lg h-10 font-medium mt-4">
                                Xác nhận
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Button type="link" onClick={() => setCurrentStep(0)} disabled={loading} className="text-gray-500">
                                Gửi lại mã?
                            </Button>
                        </div>
                    </Form>
                )}

                {/* Step 3: New Password */}
                {currentStep === 2 && (
                    <Form
                        name="forgot-password-reset"
                        onFinish={handleResetPassword}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <Form.Item
                            name="password"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Mật khẩu mới"
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Xác nhận mật khẩu"
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" className="rounded-lg h-10 font-medium mt-2">
                                Đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </Modal>
    );
}
