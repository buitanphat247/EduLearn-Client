'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table,
    Card,
    Typography,
    DatePicker,
    Select,
    Space,
    Statistic,
    Row,
    Col,
    Tag,
    Button,
    message
} from 'antd';
import {
    RobotOutlined,
    HistoryOutlined,
    ReloadOutlined,
    BarChartOutlined,
    CloudServerOutlined
} from '@ant-design/icons';
import { getGlobalAiUsageStats, AiUsageLog, AiUsageStats } from '@/lib/api/subscription';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FEATURES = [
    { value: 'ai_writing', label: 'AI Writing', color: 'blue' },
    { value: 'ai_writing_hint', label: 'AI Hint', color: 'cyan' },
    { value: 'ai_exam', label: 'AI Exam', color: 'purple' },
    { value: 'digital_document', label: 'Digital Document', color: 'orange' },
];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export default function AiUsageStatsPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AiUsageStats>({ logs: [], total: 0, page: 1, limit: DEFAULT_PAGE_SIZE, stats: [] });
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(7, 'day'),
        dayjs(),
    ]);
    const [featureFilter, setFeatureFilter] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const fetchData = useCallback(async (p: number = page, size: number = pageSize) => {
        setLoading(true);
        try {
            const start = dateRange[0]?.format('YYYY-MM-DD');
            const end = dateRange[1]?.format('YYYY-MM-DD');
            const res = await getGlobalAiUsageStats(start, end, featureFilter, p, size);
            setData(res);
        } catch {
            message.error('Không thể tải dữ liệu thống kê');
            setData((prev) => ({ ...prev, logs: [], total: 0 }));
        } finally {
            setLoading(false);
        }
    }, [dateRange[0]?.valueOf(), dateRange[1]?.valueOf(), featureFilter, page, pageSize]);

    useEffect(() => {
        fetchData(page, pageSize);
    }, [fetchData]);

    const columns = useMemo(
        () => [
            {
                title: 'Thời gian',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
                width: 180,
            },
            {
                title: 'Người dùng',
                key: 'user',
                render: (_: unknown, record: AiUsageLog) => (
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.user?.username || 'N/A'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
                    </Space>
                ),
            },
            {
                title: 'Tính năng',
                dataIndex: 'feature_code',
                key: 'feature_code',
                render: (code: string) => {
                    const feat = FEATURES.find((f) => f.value === code);
                    return <Tag color={feat?.color || 'default'}>{feat?.label || code}</Tag>;
                },
            },
            {
                title: 'Model',
                dataIndex: 'model_name',
                key: 'model_name',
                render: (name: string, record: AiUsageLog) => (
                    <Space>
                        <CloudServerOutlined style={{ color: '#1890ff' }} />
                        <Text code>{name || 'default'}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>({record.provider})</Text>
                    </Space>
                ),
            },
            {
                title: 'Tokens',
                dataIndex: 'total_tokens',
                key: 'total_tokens',
                render: (tokens: number) => (tokens > 0 ? tokens.toLocaleString() : '-'),
                align: 'right' as const,
            },
            {
                title: 'Tốc độ',
                dataIndex: 'latency_ms',
                key: 'latency_ms',
                render: (ms?: number) => (ms ? <Tag color={ms > 5000 ? 'red' : ms > 2000 ? 'orange' : 'green'}>{ms.toLocaleString()}ms</Tag> : '-'),
                align: 'right' as const,
            },
        ],
        [],
    );

    const totalRequests = data.stats.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div style={{ padding: '0' }}>
            {/* Header Filters */}
            {/* Premium Filter Bar */}
            <Card
                bordered={false}
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    background: '#fff',
                    border: '1px solid #cbd5e1'
                }}
                bodyStyle={{ padding: '16px 24px' }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#f0f7ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BarChartOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                        </div>
                        <div>
                            <Title level={5} style={{ margin: 0 }}>Bộ lọc dữ liệu</Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Tùy chỉnh phạm vi theo dõi</Text>
                        </div>
                    </div>

                    <Space size="middle" wrap>
                        <div className="filter-item">
                            <Text type="secondary" style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Khoảng thời gian</Text>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates?.[0] && dates?.[1]) {
                                        setDateRange([dates[0], dates[1]]);
                                        setPage(1);
                                    }
                                }}
                                style={{ borderRadius: '8px', width: 280 }}
                            />
                        </div>

                        <div className="filter-item">
                            <Text type="secondary" style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Tính năng AI</Text>
                            <Select
                                placeholder="Tất cả tính năng"
                                allowClear
                                style={{ width: 200 }}
                                value={featureFilter ?? undefined}
                                onChange={(v) => { setFeatureFilter(v ?? undefined); setPage(1); }}
                                options={FEATURES}
                                className="custom-select"
                            />
                        </div>

                        <div style={{ alignSelf: 'flex-end', paddingBottom: '2px' }}>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined className={loading ? 'ant-spin' : ''} />}
                                onClick={() => fetchData(page, pageSize)}
                                loading={loading}
                                style={{
                                    borderRadius: '8px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontWeight: 500,
                                    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                    border: 'none',
                                }}
                            >
                                Làm mới
                            </Button>
                        </div>
                    </Space>
                </div>
            </Card>

            {/* Summary Cards */}
            <div>
                <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            bordered={false}
                            style={{ border: '1px solid #cbd5e1', borderRadius: '12px' }}
                        >
                            <Statistic
                                title="Tổng số Request"
                                value={totalRequests}
                                prefix={<RobotOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Card>
                    </Col>
                    {data.stats.map(s => {
                        const feat = FEATURES.find(f => f.value === s.feature_code);
                        return (
                            <Col xs={24} sm={12} lg={6} key={`${s.feature_code}-${s.model_name}`}>
                                <Card
                                    bordered={false}
                                    size="small"
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '12px' }}
                                >
                                    <Statistic
                                        title={`${feat?.label || s.feature_code} (${s.model_name || 'N/A'})`}
                                        value={s.count}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Table */}
                <Table
                    dataSource={data.logs}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize,
                        total: data.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        onChange: (p, size) => {
                            setPage(p);
                            setPageSize(size ?? DEFAULT_PAGE_SIZE);
                        },
                    }}
                    size="middle"
                    bordered
                    style={{
                        marginTop: '12px',
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #cbd5e1'
                    }}
                />
            </div>


        </div>
    );
}
