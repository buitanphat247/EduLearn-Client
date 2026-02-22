"use client";

import {
    Table,
    Button,
    Space,
    InputNumber,
    App,
    Card,
    Typography,
    Divider,
    Tag,
    Alert,
    Tooltip,
    Row,
    Col,
} from "antd";
import {
    SaveOutlined,
    ReloadOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
    getSubscriptionPlans,
    updatePlanLimit,
    SubscriptionPlan,
} from "@/lib/api/subscription";

const { Title, Text, Paragraph } = Typography;

const FEATURES = [
    { value: 'ai_writing', label: 'AI Writing', desc: 'Luyện viết & Chấm điểm AI' },
    { value: 'ai_writing_hint', label: 'AI Hint', desc: 'Gợi ý lời giải & Giải thích' },
    { value: 'ai_exam', label: 'AI Exam', desc: 'Tạo đề thi từ tài liệu' },
    { value: 'vocabulary_access', label: 'Vocabulary', desc: 'Truy cập kho từ vựng VIP' },
    { value: 'digital_document', label: 'Digital Document', desc: 'Số hóa tài liệu (AI PDF)' },
];

// Helper component to manage state for each feature limit row
const FeatureLimitRow = ({
    feature,
    existingLimitValue,
    onSave
}: {
    feature: typeof FEATURES[0];
    existingLimitValue: number;
    onSave: (val: number) => Promise<void>;
}) => {
    const [val, setVal] = useState<number>(existingLimitValue);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setVal(existingLimitValue);
    }, [existingLimitValue]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(val);
        } finally {
            setSaving(false);
        }
    };

    const isUnlimited = val === -1;
    const isDisabled = val === 0;

    return (
        <div key={feature.value} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '4px'
        }}>
            <div style={{ flex: 1 }}>
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#1e293b' }}>{feature.label}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{feature.desc}</Text>
                </Space>
            </div>

            <Space size="middle">
                {isUnlimited ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Không giới hạn</Tag>
                ) : isDisabled ? (
                    <Tag color="default" icon={<CloseCircleOutlined />}>Đã tắt</Tag>
                ) : (
                    <Tag color="blue">{val} lượt/ngày</Tag>
                )}

                <InputNumber
                    min={-1}
                    value={val}
                    onChange={(v) => setVal(v ?? 0)}
                    style={{ width: '80px', borderRadius: '6px' }}
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                    disabled={val === existingLimitValue}
                    style={{
                        background: val === existingLimitValue ? '#e2e8f0' : '#1890ff',
                        border: 'none',
                        boxShadow: 'none'
                    }}
                />
            </Space>
        </div>
    );
};

export default function PlanLimitsPage() {
    const { message } = App.useApp();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getSubscriptionPlans();
            setPlans(data || []);
        } catch {
            message.error("Không thể tải danh sách gói cước");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLimit = async (planId: number, featureCode: string, limitValue: number) => {
        try {
            await updatePlanLimit(planId, featureCode, limitValue);
            message.success("Cập nhật thành công");
        } catch {
            message.error("Lỗi khi cập nhật");
            throw new Error("Update failed");
        }
    };

    const columns = [
        {
            title: 'Gói Dịch Vụ',
            key: 'plan_info',
            width: 280,
            render: (_: any, record: SubscriptionPlan) => (
                <Space direction="vertical" size={4}>
                    <Text strong style={{ fontSize: '16px', color: record.name === 'FREE_BASE' ? '#64748b' : '#0f172a' }}>
                        {record.name?.replace('_', ' ')}
                    </Text>
                    <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">{new Intl.NumberFormat('vi-VN').format(record.price || 0)}đ</Text>
                        <Text type="secondary">{record.duration_days} ngày</Text>
                    </Space>
                    {record.name === 'FREE_BASE' && <Tag color="default">Gói mặc định</Tag>}
                </Space>
            )
        },
        {
            title: 'Cấu Hình Tính Năng (Giới hạn lượt dùng linh hoạt)',
            key: 'limits',
            render: (_: any, record: SubscriptionPlan) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {FEATURES.map(f => {
                        const existingLimit = record.limits?.find(l => l.feature_code === f.value);
                        return (
                            <FeatureLimitRow
                                key={f.value}
                                feature={f}
                                existingLimitValue={existingLimit?.limit_value ?? 0}
                                onSave={(val) => handleUpdateLimit(record.id, f.value, val)}
                            />
                        );
                    })}
                </div>
            )
        }
    ];

    return (
        <div className="px-6 py-4">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
                        <SettingOutlined /> Cấu hình giới hạn gói cước
                    </Title>
                    <Text type="secondary">Thiết lập hạn mức sử dụng tính năng AI cho từng gói dịch vụ</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
            </div>

            <Table
                dataSource={plans || []}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                bordered
                style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#fff'
                }}
            />

            {/* Configuration Guide */}
            <Card
                style={{
                    marginTop: '32px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc'
                }}
                title={<Space><InfoCircleOutlined style={{ color: '#1890ff' }} /> <Text strong>Hướng dẫn cấu hình hạn mức</Text></Space>}
            >
                <Row gutter={48}>
                    <Col span={12}>
                        <Space direction="vertical" size="middle">
                            <div>
                                <Text strong style={{ color: '#10b981' }}>● Giá trị -1 (Không giới hạn)</Text>
                                <Paragraph type="secondary" style={{ fontSize: '13px', marginLeft: '12px' }}>
                                    Người dùng thuộc gói này sẽ được sử dụng tính năng AI mà không bị giới hạn số lần thực hiện trong ngày. Thường áp dụng cho các gói PRO/VIP cao cấp.
                                </Paragraph>
                            </div>
                            <div>
                                <Text strong style={{ color: '#64748b' }}>● Giá trị 0 (Khóa tính năng)</Text>
                                <Paragraph type="secondary" style={{ fontSize: '13px', marginLeft: '12px' }}>
                                    Tính năng này sẽ bị vô hiệu hóa hoàn toàn đối với người dùng thuộc gói này. Hệ thống sẽ báo "Vượt quá giới hạn" ngay lập tức.
                                </Paragraph>
                            </div>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Space direction="vertical" size="middle">
                            <div>
                                <Text strong style={{ color: '#3b82f6' }}>● Giá trị N {'>'} 0 (Giới hạn theo lượt)</Text>
                                <Paragraph type="secondary" style={{ fontSize: '13px', marginLeft: '12px' }}>
                                    Số lượt tối đa người dùng được phép thực hiện trong một ngày (tính từ 00h00). Ví dụ: 5 lượt/ngày cho AI Writing.
                                </Paragraph>
                            </div>
                            <Alert
                                type="info"
                                showIcon
                                message="Ghi chú quan trọng"
                                description="Các thay đổi sẽ có hiệu lực ngay lập tức. Hệ thống sẽ reset bộ đếm sử dụng của người dùng vào lúc 0h00 mỗi ngày."
                                style={{ borderRadius: '8px', border: 'none' }}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
