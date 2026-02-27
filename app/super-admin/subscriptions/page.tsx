"use client";

import { Table, Tag, Button, Space, Input, App, Modal, Form, Select, Card, Typography, Divider, InputNumber, Popconfirm } from "antd";
import { SearchOutlined, UserAddOutlined, CrownOutlined, SafetyCertificateOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, ArrowUpOutlined, SettingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    getSubscriptionPlans,
    adminSubscribeByEmail,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    SubscriptionPlan,
    getAllUserSubscriptions,
    cancelUserSubscription
} from "@/lib/services/subscription";
import { useDebounce } from "@/hooks/useDebounce";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SubscriptionAdminPage() {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    const [form] = Form.useForm();
    const [planForm] = Form.useForm();

    const [userPage, setUserPage] = useState<number>(1);
    const [searchText, setSearchText] = useState<string>("");
    const debouncedSearchText = useDebounce(searchText, 500);

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    // Fetch subscription plans
    const { data: plansData = [], isLoading: isLoadingPlans, isFetching: isFetchingPlans } = useQuery({
        queryKey: ['admin_subscription_plans'],
        queryFn: getSubscriptionPlans,
        staleTime: 30 * 1000, // 30s - admin needs fresh data
    });

    // Fetch user subscriptions
    const { data: usersData, isLoading: isLoadingUsers, isFetching: isFetchingUsers } = useQuery({
        queryKey: ['admin_subscription_users', userPage, debouncedSearchText],
        queryFn: async () => {
            const result = await getAllUserSubscriptions(userPage, 10, debouncedSearchText);
            return result;
        },
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30s - admin needs fresh data
    });

    const safeUsers = usersData?.data || [];
    const userTotal = usersData?.total || 0;

    // Mutations
    const subscribeMutation = useMutation({
        mutationFn: async (values: { email: string; planId: number }) => {
            return adminSubscribeByEmail(values.email, values.planId);
        },
        onSuccess: () => {
            message.success("Đã nâng cấp tài khoản thành công!");
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['admin_subscription_users'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || "Không tìm thấy user hoặc có lỗi xảy ra");
        }
    });

    const planMutation = useMutation({
        mutationFn: async (values: any) => {
            if (editingPlan) {
                return updateSubscriptionPlan(editingPlan.id, values);
            } else {
                return createSubscriptionPlan(values);
            }
        },
        onSuccess: () => {
            message.success(editingPlan ? "Cập nhật gói thành công" : "Tạo gói mới thành công");
            setIsPlanModalOpen(false);
            planForm.resetFields();
            setEditingPlan(null);
            queryClient.invalidateQueries({ queryKey: ['admin_subscription_plans'] });
        },
        onError: (error: any) => {
            message.error(error?.message || "Lỗi khi lưu gói");
        }
    });

    const cancelMutation = useMutation({
        mutationFn: async (id: number) => {
            return cancelUserSubscription(id);
        },
        onMutate: async (cancelledId) => {
            await queryClient.cancelQueries({ queryKey: ['admin_subscription_users'] });
            const previousData = queryClient.getQueriesData({ queryKey: ['admin_subscription_users'] });
            queryClient.setQueriesData({ queryKey: ['admin_subscription_users'] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data?.map((u: any) => u.id === cancelledId ? { ...u, status: 'cancelled' } : u),
                };
            });
            return { previousData };
        },
        onSuccess: () => {
            message.success("Đã hủy/thu hồi gói cước của người dùng!");
        },
        onError: (error: any, _id, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            message.error(error?.response?.data?.message || "Hủy gói cước thất bại");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_subscription_users'] });
        },
    });

    const deletePlanMutation = useMutation({
        mutationFn: async (id: number) => {
            return deleteSubscriptionPlan(id);
        },
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ['admin_subscription_plans'] });
            const previousPlans = queryClient.getQueryData(['admin_subscription_plans']);
            queryClient.setQueryData(['admin_subscription_plans'], (old: any) => {
                if (!Array.isArray(old)) return old;
                return old.filter((p: any) => p.id !== deletedId);
            });
            return { previousPlans };
        },
        onSuccess: () => {
            message.success("Đã xóa gói");
        },
        onError: (error: any, _id, context) => {
            if (context?.previousPlans) {
                queryClient.setQueryData(['admin_subscription_plans'], context.previousPlans);
            }
            message.error(error?.response?.data?.message ?? error?.message ?? "Lỗi khi xóa gói");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_subscription_plans'] });
        },
    });

    const handleSubscribe = (values: { email: string; planId: number }) => {
        subscribeMutation.mutate(values);
    };

    const handlePlanSubmit = (values: any) => {
        planMutation.mutate(values);
    };

    const handleCancelSubscription = (id: number) => {
        cancelMutation.mutate(id);
    };

    const handleDeletePlan = (id: number) => {
        deletePlanMutation.mutate(id);
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

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
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
                            <Select size="large" placeholder="Chọn gói để nâng cấp" loading={isLoadingPlans || isFetchingPlans}>
                                {plansData.map(plan => (
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
                                loading={subscribeMutation.isPending}
                                style={{ height: '48px', fontWeight: 'bold', fontSize: '16px' }}
                            >
                                KÍCH HOẠT NGAY
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

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
                        {Array.isArray(plansData) && plansData.map((plan, index) => (
                            <div
                                key={plan.id}
                                style={{
                                    padding: '16px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: index < (plansData?.length || 0) - 1 ? '1px solid #f0f0f0' : 'none'
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
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />} loading={deletePlanMutation.isPending && deletePlanMutation.variables === plan.id} />
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
                            <Button type="primary" htmlType="submit" loading={planMutation.isPending}>
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
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setUserPage(1);
                        }}
                        style={{ maxWidth: '400px' }}
                    />
                </div>

                <Table
                    dataSource={safeUsers}
                    rowKey="id"
                    loading={isLoadingUsers || isFetchingUsers}
                    scroll={{ x: 800 }}
                    pagination={{
                        current: userPage,
                        pageSize: 10,
                        total: userTotal,
                        onChange: (page) => setUserPage(page),
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
                                            loading={cancelMutation.isPending && cancelMutation.variables === record.id}
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
