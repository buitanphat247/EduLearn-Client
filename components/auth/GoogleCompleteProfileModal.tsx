import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { MailOutlined, PhoneOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { getPasswordValidationRules } from '@/lib/utils/validation';

interface GoogleCompleteProfileModalProps {
    open: boolean;
    onCancel: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFinish: (values: any) => void;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    googleInfo: any;
}

export default function GoogleCompleteProfileModal({
    open,
    onCancel,
    onFinish,
    isLoading,
    googleInfo
}: GoogleCompleteProfileModalProps) {
    const [form] = Form.useForm();

    // Reset form when modal opens/closes or googleInfo changes
    React.useEffect(() => {
        if (open && googleInfo) {
            form.setFieldsValue({
                email: googleInfo.email,
                name: googleInfo.fullname,
                role_id: 3 // Default Role là Học sinh
            });
        }
    }, [open, googleInfo, form]);

    return (
        <Modal
            title={<span className="text-xl font-bold dark:text-white">Hoàn tất đăng ký - Tài khoản Google</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            centered
            className="dark-modal"
            maskClosable={!isLoading}
            closable={!isLoading}
        >
            <div className="mb-6 text-slate-500 dark:text-slate-400">
                Tài khoản Google của bạn chưa được liên kết. Vui lòng bổ sung các thông tin còn thiếu để tạo tài khoản mới.
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="flex flex-col gap-2"
            >
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
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                    ]}
                    className="mb-0 mt-2"
                >
                    <Input
                        placeholder="Số điện thoại"
                        size="large"
                        disabled={isLoading}
                        prefix={<PhoneOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                    />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Form.Item name="password" rules={getPasswordValidationRules()} className="mb-0">
                        <Input.Password
                            placeholder="Mật khẩu"
                            size="large"
                            disabled={isLoading}
                            prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                                },
                            }),
                        ]}
                        className="mb-0"
                    >
                        <Input.Password
                            placeholder="Xác nhận mật khẩu"
                            size="large"
                            disabled={isLoading}
                            prefix={<LockOutlined className="text-slate-400 dark:text-slate-500 mr-2" />}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="role_id"
                    label={<span className="text-slate-700 dark:text-slate-300 font-medium">Vai trò</span>}
                    className="mb-4 mt-2"
                >
                    <Select
                        size="large"
                        disabled={true} // Disable cho giáo viên theo yêu cầu
                        options={[
                            { value: 3, label: "Học sinh" },
                            { value: 2, label: "Giảng viên", disabled: true }
                        ]}
                    />
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    size="large"
                    className="bg-blue-600 hover:bg-blue-500 border-none font-bold h-12 rounded-xl mt-2"
                >
                    Hoàn Tất Đăng Ký
                </Button>
            </Form>
        </Modal>
    );
}
