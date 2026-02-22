"use client";

import { Table, Tag, Card, Typography, Row, Col, Statistic, Space, Divider, Button } from "antd";
import { FireOutlined, ThunderboltOutlined, UserOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsageStats, UsageStat } from "@/lib/api/subscription";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function AIWritingAdminPage() {
    const [stats, setStats] = useState<UsageStat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsageStats("ai_writing");
            setStats(Array.isArray(data) ? data : []);
        } catch {
            setStats([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const columns = useMemo(() => [
        {
            title: "Ngày",
            dataIndex: "usage_date",
            key: "usage_date",
            width: "15%",
            render: (date: string) => <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>,
        },
        {
            title: "Người dùng",
            dataIndex: "user",
            key: "user",
            render: (user: any, record: UsageStat) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong>{user?.username || "N/A"}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email || "N/A"}</Text>
                </div>
            ),
        },
        {
            title: "Lượt dùng",
            dataIndex: "usage_count",
            key: "usage_count",
            width: "20%",
            render: (count: number) => (
                <Tag color={count > 2 ? "error" : "processing"} style={{ fontWeight: 'bold' }}>
                    {count} lượt
                </Tag>
            ),
        },
    ], []);

    const totalToday = (stats || []).filter(s => dayjs(s.usage_date).isSame(dayjs(), 'day')).reduce((acc, curr) => acc + (curr.usage_count || 0), 0);
    const activeUsersToday = (stats || []).filter(s => dayjs(s.usage_date).isSame(dayjs(), 'day')).length;

    return (
        <div>
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: "8px" }}>Giám sát & Sử dụng AI Writing</Title>
                    <Text type="secondary">Theo dõi giới hạn và lượt sử dụng trợ lý AI của người dùng trong ngày</Text>
                </div>
                <Button type="default" icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
                    Làm mới
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card style={{ height: '100%', borderRadius: '8px' }} hoverable>
                        <Statistic
                            title="Tổng lượt dùng hôm nay"
                            value={totalToday}
                            prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: '100%', borderRadius: '8px' }} hoverable>
                        <Statistic
                            title="Người dùng hoạt động"
                            value={activeUsersToday}
                            prefix={<UserOutlined style={{ color: '#1677ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: '100%', borderRadius: '8px' }} hoverable>
                        <Statistic
                            title="Giới hạn hiện tại (Free)"
                            value={3}
                            suffix="/ ngày"
                            prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                    <Table
                        dataSource={stats}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        size="middle"
                        pagination={{
                            pageSize: 15,
                            showTotal: (total) => `Tổng ${total} bản ghi`
                        }}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <Card
                        title="Cấu hình hệ thống"
                        style={{ borderRadius: '8px', background: '#fafafa', borderStyle: 'dashed' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tag color="blue" style={{ margin: 0 }}>GÓI FREE</Tag>
                                <Text strong>3 bài / ngày</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tag color="gold" style={{ margin: 0 }}>GÓI PRO</Tag>
                                <Text strong>Không giới hạn</Text>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                * Các tham số này hiện được cấu hình cứng trong code (SubscriptionService).
                                Cần nâng cấp hệ thống cờ tính năng (Feature Flags) để có thể cấu hình động.
                            </Text>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
