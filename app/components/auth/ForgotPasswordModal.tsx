"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, Typography, App } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import apiClient from "@/app/config/api";

const { Text } = Typography;

interface ForgotPasswordModalProps {
    open: boolean;
    onCancel: () => void;
}

export default function ForgotPasswordModal({ open, onCancel }: ForgotPasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [form] = Form.useForm();
    const { message } = App.useApp();

    // Reset state when modal closes
    const handleCancel = () => {
        form.resetFields();
        setIsSuccess(false);
        setEmail("");
        setLoading(false);
        onCancel();
    };

    const handleEmailSubmit = async (values: { email: string }) => {
        setLoading(true);
        try {
            await apiClient.post("/auth/forgot-password", { email: values.email });
            setEmail(values.email);
            setIsSuccess(true);
        } catch (error: any) {
            // Still show success to prevent email enumeration
            setEmail(values.email);
            setIsSuccess(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="text-center font-bold text-lg mb-2">
                    {isSuccess ? "Kiểm tra email của bạn" : "Quên mật khẩu?"}
                </div>
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            centered
            maskClosable={!loading}
            closable={!loading}
            width={420}
        >
            <div className="py-4">
                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircleOutlined className="text-4xl text-green-500" />
                        </div>

                        <div className="text-gray-600 dark:text-gray-300 mb-4">
                            Nếu email <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span> tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.
                        </div>

                        <div
                            className="p-4 rounded-lg mb-6"
                            style={{
                                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                border: '1px solid rgba(251, 191, 36, 0.4)'
                            }}
                        >
                            <p className="text-sm m-0" style={{ color: '#fbbf24' }}>
                                ⏰ Link sẽ hết hạn sau <strong>15 phút</strong>. Hãy kiểm tra cả thư mục Spam nếu không thấy email.
                            </p>
                        </div>

                        <Button
                            type="primary"
                            onClick={handleCancel}
                            block
                            size="large"
                            className="rounded-lg h-11 font-medium"
                        >
                            Đã hiểu
                        </Button>
                    </div>
                ) : (
                    /* Email Input Form */
                    <Form
                        form={form}
                        name="forgot-password-email"
                        onFinish={handleEmailSubmit}
                        layout="vertical"
                        autoComplete="off"
                        initialValues={{ email: "" }}
                    >
                        <div className="text-center mb-6 text-gray-500 dark:text-gray-400">
                            Nhập email của bạn. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
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
                                placeholder="Nhập email của bạn"
                                size="large"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                className="rounded-lg h-11 font-medium"
                            >
                                Gửi link đặt lại mật khẩu
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Button
                                type="link"
                                onClick={handleCancel}
                                disabled={loading}
                                className="text-gray-500"
                            >
                                Quay lại đăng nhập
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        </Modal>
    );
}
