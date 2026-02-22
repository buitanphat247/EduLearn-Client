"use client";

import { Table, Tag, Button, Space, Input, App, Modal, Form, Select, Card, Typography, Divider, InputNumber, Popconfirm } from "antd";
import { SearchOutlined, UserAddOutlined, CrownOutlined, SafetyCertificateOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, ArrowUpOutlined, SettingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    getSubscriptionPlans,
    adminSubscribeByEmail,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    SubscriptionPlan,
    getAllUserSubscriptions,
    cancelUserSubscription
} from "@/lib/api/subscription";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SubscriptionAdminPage() {
    const { message } = App.useApp();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [userTotal, setUserTotal] = useState<number>(0);
    const [userPage, setUserPage] = useState<number>(1);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [planForm] = Form.useForm();

    // Plan Modal state
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        fetchPlans();
        fetchUsers(1);
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await getSubscriptionPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (page: number, search: string = searchText) => {
        setLoadingUsers(true);
        try {
            const result = await getAllUserSubscriptions(page, 10, search);
            setUsers(result.data);
            setUserTotal(result.total);
            setUserPage(page);
        } catch (error) {
            console.error("Failed to fetch user subscriptions", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubscribe = async (values: { email: string; planId: number }) => {
        setSubmitting(true);
        try {
            await adminSubscribeByEmail(values.email, values.planId);
            message.success("Đã nâng cấp tài khoản thành công!");
            form.resetFields();
            fetchUsers(1); // Refresh table
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Không tìm thấy user hoặc có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlanSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            if (editingPlan) {
                await updateSubscriptionPlan(editingPlan.id, values);
                message.success("Cập nhật gói thành công");
            } else {
                await createSubscriptionPlan(values);
                message.success("Tạo gói mới thành công");
            }
            setIsPlanModalOpen(false);
            planForm.resetFields();
            setEditingPlan(null);
            fetchPlans();
        } catch (error: any) {
            message.error(error?.message || "Lỗi khi lưu gói");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelSubscription = async (id: number) => {
        try {
            await cancelUserSubscription(id);
            message.success("Đã hủy/thu hồi gói cước của người dùng!");
            await fetchUsers(userPage);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Hủy gói cước thất bại");
        }
    };

    const handleDeletePlan = async (id: number) => {
        try {
            await deleteSubscriptionPlan(id);
            message.success("Đã xóa gói");
            fetchPlans();
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? error?.message ?? "Lỗi khi xóa gói";
            message.error(msg);
        }
    };

    const openEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        planForm.setFieldsValue({
            name: plan.name,
            price: plan.price,
            duration_days: plan.duration_days
        });
        setIsPlanModalOpen(true);
    };

    const quickSubscribe = (email: string, planId: number) => {
        if (!email) {
            message.warning("Vui lòng nhập email trước");
            return;
        }
        handleSubscribe({ email, planId });
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Cấu hình nâng cấp nhanh */}
                <Card
                    title={<Space><UserAddOutlined /> Nâng cấp tài khoản</Space>}
                    style={{ gridColumn: 'span 2', borderRadius: '8px' }}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubscribe}>
                        <Form.Item
                            name="email"
                            label={<Text strong>Email người dùng</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
                            extra="Nhập chính xác Gmail của người dùng cần nâng cấp"
                        >
                            <Input size="large" placeholder="example@gmail.com" prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} />
                        </Form.Item>

                        <Form.Item
                            name="planId"
                            label={<Text strong>Chọn gói cước</Text>}
                            rules={[{ required: true, message: 'Vui lòng chọn gói' }]}
                        >
                            <Select size="large" placeholder="Chọn gói để nâng cấp">
                                {plans.map(plan => (
                                    <Option key={plan.id} value={plan.id}>
                                        <Space>
                                            <Tag color={plan.name.includes('free') ? 'default' : 'gold'}>{plan.name.toUpperCase()}</Tag>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)} ({plan.duration_days} ngày)
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CrownOutlined />}
                                block
                                htmlType="submit"
                                loading={submitting}
                                style={{ height: '48px', fontWeight: 'bold', fontSize: '16px' }}
                            >
                                KÍCH HOẠT NGAY
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                {/* Thông tin các gói hiện có */}
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space><SafetyCertificateOutlined /> Danh sách gói</Space>
                            <Link href="/super-admin/subscriptions/limits">
                                <Button
                                    size="small"
                                    icon={<SettingOutlined />}
                                    style={{ marginRight: '8px' }}
                                >
                                    Cấu hình giới hạn
                                </Button>
                            </Link>
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingPlan(null);
                                    planForm.resetFields();
                                    setIsPlanModalOpen(true);
                                }}
                            >
                                Tạo mới
                            </Button>
                        </div>
                    }
                    style={{ borderRadius: '8px' }}
                    bodyStyle={{ padding: 0 }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {Array.isArray(plans) && plans.map((plan, index) => (
                            <div
                                key={plan.id}
                                style={{
                                    padding: '16px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: index < (plans?.length || 0) - 1 ? '1px solid #f0f0f0' : 'none'
                                }}
                            >
                                <div>
                                    <Tag color={plan.name?.includes('free') ? 'default' : 'gold'} style={{ marginBottom: '4px' }}>
                                        {plan.name?.toUpperCase() || 'N/A'}
                                    </Tag>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Thời hạn: {plan.duration_days} ngày</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text strong style={{ color: Number(plan.price) === 0 ? '#52c41a' : '#1677ff', fontSize: '16px' }}>
                                        {Number(plan.price) === 0 ? "FREE" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price || 0)}
                                    </Text>
                                    <div style={{ marginTop: '4px' }}>
                                        <Space size="small">
                                            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEditModal(plan)} />
                                            <Popconfirm title="Xóa gói này?" description="Thao tác này không thể hoàn tác." onConfirm={() => handleDeletePlan(plan.id)}>
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Modal
                title={editingPlan ? "Cập nhật gói cước" : "Tạo gói cước mới"}
                open={isPlanModalOpen}
                onCancel={() => setIsPlanModalOpen(false)}
                footer={null}
                width={500}
            >
                <Form form={planForm} layout="vertical" onFinish={handlePlanSubmit}>
                    <Form.Item
                        name="name"
                        label="Tên khóa (Key) hệ thống"
                        rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
                        tooltip="Định danh gói cước trong cơ sở dữ liệu (VD: free, basic, pro_monthly, pro_yearly). Yêu cầu viết thường, không dấu, ngăn cách bằng dấu gạch dưới."
                    >
                        <Input placeholder="VD: pro_monthly" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Đơn giá"
                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                    >
                        <InputNumber
                            min={0 as number}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Nhập giá tiền (0 cho miễn phí)..."
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => Number(value?.replace(/\$\s?|(,*)/g, '') || 0)}
                            addonAfter="VND"
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration_days"
                        label="Thời hạn sử dụng"
                        rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Nhập số ngày (VD: 30, 365)..."
                            addonAfter="Ngày"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                        <Space>
                            <Button onClick={() => setIsPlanModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingPlan ? "Lưu thay đổi" : "Tạo gói"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <div style={{ marginTop: '24px' }}>
                <Card
                    size="small"
                    title={<Text strong style={{ color: '#faad14' }}>Lưu ý hệ thống</Text>}
                    style={{ borderRadius: '8px', background: '#fffbe6', borderColor: '#ffe58f' }}
                >
                    <ul style={{ paddingLeft: '20px', color: '#876800', margin: 0 }}>
                        <li><Text style={{ color: '#876800' }}>Gói <b>FREE</b> là gói mặc định của hệ thống.</Text></li>
                        <li><Text style={{ color: '#876800' }}>Việc xóa gói cước <b>đang có người dùng</b> có thể ảnh hưởng đến trải nghiệm của họ.</Text></li>
                        <li><Text style={{ color: '#876800' }}>Cần nhập chính xác email đang tồn tại trong hệ thống để nâng cấp tài khoản.</Text></li>
                    </ul>
                </Card>
            </div>

            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0 }}>Danh sách Khách hàng Gói cước</Title>
                    <Input.Search
                        placeholder="Tìm kiếm theo email hoặc tên..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={(value) => {
                            setSearchText(value);
                            fetchUsers(1, value);
                        }}
                        style={{ maxWidth: '400px' }}
                    />
                </div>

                <Table
                    dataSource={users}
                    rowKey="id"
                    loading={loadingUsers}
                    scroll={{ x: 800 }}
                    pagination={{
                        current: userPage,
                        pageSize: 10,
                        total: userTotal,
                        onChange: (page) => fetchUsers(page),
                        showSizeChanger: false
                    }}
                    columns={[
                        {
                            title: 'Email',
                            dataIndex: 'email',
                            key: 'email',
                        },
                        {
                            title: 'Họ và tên',
                            dataIndex: 'fullname',
                            key: 'fullname',
                        },
                        {
                            title: 'Gói cước',
                            dataIndex: 'plan_name',
                            key: 'plan_name',
                            render: (text) => (
                                <Tag color={text?.includes('free') ? 'default' : 'gold'}>
                                    {text ? text.toUpperCase() : 'N/A'}
                                </Tag>
                            )
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => (
                                <Tag color={status === 'active' ? 'green' : 'red'}>
                                    {status ? status.toUpperCase() : 'UNKNOWN'}
                                </Tag>
                            )
                        },
                        {
                            title: 'Ngày bắt đầu',
                            dataIndex: 'start_at',
                            key: 'start_at',
                            render: (date) => new Date(date).toLocaleDateString('vi-VN')
                        },
                        {
                            title: 'Ngày hết hạn',
                            dataIndex: 'end_at',
                            key: 'end_at',
                            render: (date) => new Date(date).toLocaleDateString('vi-VN')
                        },
                        {
                            title: 'Hành động',
                            key: 'action',
                            align: 'center',
                            render: (_, record) => (
                                <Space size="small">
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            form.setFieldsValue({ email: record.email });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            message.info("Vui lòng chọn gói cước ở Form phía trên!");
                                        }}
                                        icon={<ArrowUpOutlined />}
                                        type="primary"
                                        ghost
                                    >
                                        Đổi gói
                                    </Button>
                                    <Popconfirm
                                        title="Hủy/Thu hồi gói cước này?"
                                        description="Người dùng này sẽ mất trạng thái PRO ngay lập tức."
                                        onConfirm={() => handleCancelSubscription(record.id)}
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            size="small"
                                            danger
                                            icon={<StopOutlined />}
                                            disabled={record.status === 'cancelled' || record.status === 'expired'}
                                        >
                                            Hủy
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            )
                        },
                    ]}
                />
            </div>
        </div>
    );
}
