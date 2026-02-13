"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { App, Table, Tag, Button, Card, Typography, Space, Badge, Statistic, Row, Col, Tooltip, Modal, List, Empty, Descriptions } from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { getRagTestDetail, type RagTestDetail } from "@/lib/api/rag-exams";
import { getTestAttempts, type StudentAttempt } from "@/lib/api/exam-attempts";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// --- Sub-components (Memoized) ---

const ExamInfoDescription = memo(
  ({
    test,
    averageScore,
    attemptsCount,
    completionRate,
  }: {
    test: RagTestDetail | null;
    averageScore: string | number;
    attemptsCount: number;
    completionRate: number;
  }) => (
    <Card
      title={
        <div className="flex items-center gap-2 py-1">
          <InfoCircleOutlined className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Thông tin bài kiểm tra</span>
        </div>
      }
      bordered={false}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
      bodyStyle={{ padding: 0 }}
    >
      <Descriptions
        bordered
        column={2}
        className="[&_.ant-descriptions-item-label]:bg-gray-50 [&_.ant-descriptions-item-label]:dark:bg-gray-900 [&_.ant-descriptions-item-label]:dark:text-gray-300 [&_.ant-descriptions-item-label]:font-semibold [&_.ant-descriptions-item-label]:w-[200px] [&_.ant-descriptions-item-content]:dark:bg-gray-800 [&_.ant-descriptions-item-content]:dark:text-gray-200"
      >
        <Descriptions.Item label="Tiêu đề đề thi">
          <Space direction="vertical" size={2}>
            <Text strong className="text-gray-800 dark:text-gray-100 text-base">
              {test?.title || "Đang tải..."}
            </Text>
            <Tag color="cyan" className="m-0 border-0 font-bold text-[10px] px-2 py-0">
              AI GENERATED TEST
            </Tag>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian làm bài">
          <Space>
            <ClockCircleOutlined className="text-blue-500" /> <Text strong className="dark:text-gray-200">{test?.duration_minutes} phút</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng câu hỏi">
          <Space>
            <InfoCircleOutlined className="text-blue-500" /> <Text strong className="dark:text-gray-200">{test?.num_questions} câu hỏi</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          <Space>
            <CalendarOutlined className="text-blue-500" /> <Text strong className="dark:text-gray-200">{dayjs(test?.created_at).format("DD/MM/YYYY - HH:mm")}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          <Paragraph ellipsis={{ rows: 2, expandable: true }} className="text-gray-500 dark:text-gray-400 m-0 leading-relaxed italic">
            {test?.description || "Không có mô tả cho đề thi này."}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="Thống kê tổng quát" span={2}>
          <Row gutter={24} className="py-2">
            <Col span={8}>
              <Statistic
                title={
                  <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Học sinh tham gia
                  </Text>
                }
                value={attemptsCount}
                valueStyle={{ fontWeight: 800 }}
                className="[&_.ant-statistic-content-value]:dark:text-gray-200"
                prefix={<UserOutlined className="text-blue-400" />}
                suffix={<span className="text-xs text-gray-400 font-normal ml-1">học sinh</span>}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={
                  <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Điểm trung bình
                  </Text>
                }
                value={averageScore}
                suffix={<span className="text-sm text-gray-400 font-normal">/{test?.total_score}</span>}
                valueStyle={{ fontWeight: 800 }}
                className="[&_.ant-statistic-content-value]:dark:text-gray-200"
                prefix={<LineChartOutlined className="text-emerald-400" />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={
                  <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Tỷ lệ hoàn thành
                  </Text>
                }
                value={completionRate}
                suffix="%"
                valueStyle={{ fontWeight: 800, color: "#6366f1" }}
              />
            </Col>
          </Row>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
);
ExamInfoDescription.displayName = "ExamInfoDescription";

const SecurityLogModal = memo(({ isOpen, onClose, selectedLogs }: { isOpen: boolean; onClose: () => void; selectedLogs: StudentAttempt | null }) => (
  <Modal
    title={
      <Space>
        <WarningOutlined className="text-orange-500" />
        <span>Nhật ký vi phạm: {selectedLogs?.student_name}</span>
      </Space>
    }
    open={isOpen}
    onCancel={onClose}
    footer={[
      <Button key="close" type="primary" className="rounded-lg px-6 font-medium bg-blue-600" onClick={onClose}>
        Đóng
      </Button>,
    ]}
    width={700}
    centered
    className="security-log-modal"
  >
    <List
      itemLayout="horizontal"
      dataSource={selectedLogs?.security.logs || []}
      renderItem={(log) => (
        <List.Item className="border-b last:border-0 py-5 px-0 border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-4 w-full">
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${log.type === "disconnect" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                }`}
            >
              <SafetyCertificateOutlined style={{ fontSize: "22px" }} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <Text strong className="text-gray-800 dark:text-gray-200 text-[16px] uppercase tracking-tight">
                  {log.type.replace("_", " ")}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-[13px] font-medium pt-1">{dayjs(log.timestamp).format("HH:mm:ss DD/MM/YYYY")}</Text>
              </div>
              <div>
                <Text className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">{log.details || "Hệ thống tự động ghi nhận vi phạm."}</Text>
              </div>
            </div>
          </div>
        </List.Item>
      )}
      locale={{ emptyText: <Empty description="Học sinh này thực hiện bài thi nghiêm túc" /> }}
      style={{ maxHeight: "500px", overflowY: "auto" }}
      className="px-2"
    />
  </Modal>
));
SecurityLogModal.displayName = "SecurityLogModal";

// --- Main Component ---

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const classId = params.id as string;
  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<StudentAttempt | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [testData, attemptsData] = await Promise.all([getRagTestDetail(examId), getTestAttempts(examId)]);
      setTest(testData);
      setAttempts(attemptsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShowLogs = useCallback((attempt: StudentAttempt) => {
    setSelectedLogs(attempt);
    setIsLogModalOpen(true);
  }, []);

  const handleCloseLogs = useCallback(() => {
    setIsLogModalOpen(false);
  }, []);

  const averageScore = useMemo(
    () => (attempts.length > 0 ? (attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1) : 0),
    [attempts]
  );

  const completionRate = useMemo(
    () => (attempts.length > 0 ? Math.round((attempts.filter((a) => a.status === "submitted").length / attempts.length) * 100) : 0),
    [attempts]
  );

  const handleFastRefresh = useCallback(async () => {
    await fetchData();
    message.success({ content: "Đã cập nhật dữ liệu", key: "exam_detail_refresh", duration: 2 });
  }, [fetchData, message]);

  const columns = useMemo(
    () => [
      {
        title: "Học sinh",
        dataIndex: "student_name",
        key: "student_name",
        render: (text: string) => (
          <Space>
            <UserOutlined className="text-blue-500" />
            <Text strong className="text-gray-700 dark:text-gray-300">
              {text}
            </Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
          let color = "gold";
          let label = "Đang làm";
          if (status === "submitted") {
            color = "green";
            label = "Đã nộp";
          } else if (status === "expired") {
            color = "red";
            label = "Hết giờ";
          }
          return (
            <Tag color={color} className="font-bold border-0 px-3 py-0.5 rounded-full">
              {label.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: "Lượt làm",
        dataIndex: "attempt_count",
        key: "attempt_count",
        render: (count: number) => {
          const maxAttempts = test?.max_attempts || 0;
          const displayMax = maxAttempts > 0 ? maxAttempts : "∞";
          const isAtLimit = maxAttempts > 0 && count >= maxAttempts;

          return (
            <Space direction="vertical" size={0}>
              <Text strong className={isAtLimit ? "text-red-500" : "text-gray-700 dark:text-gray-300"}>
                {count} / {displayMax}
              </Text>
              <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "10px" }}>
                lượt đã dùng
              </Text>
            </Space>
          );
        },
      },
      {
        title: "Số câu",
        key: "progress",
        render: (_: any, record: StudentAttempt) => (
          <Space direction="vertical" size={0}>
            <Text strong className="dark:text-gray-300">
              {record.answered_count} / {test?.num_questions}
            </Text>
            <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "10px" }}>
              đã làm
            </Text>
          </Space>
        ),
      },
      {
        title: "Điểm số",
        key: "score",
        render: (_: any, record: StudentAttempt) => (
          <div className="flex flex-col">
            <Text strong className={record.score >= (test?.total_score || 0) * 0.5 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
              {record.score.toFixed(1)} / {test?.total_score}
            </Text>
            <Text type="secondary" className="dark:text-gray-400" style={{ fontSize: "11px" }}>
              ({Math.round((record.score / (test?.total_score || 1)) * 100)}%)
            </Text>
          </div>
        ),
      },
      {
        title: "Thời gian",
        key: "time",
        render: (_: any, record: StudentAttempt) => (
          <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
            <Space size={4}>
              <ClockCircleOutlined /> Bắt đầu: {dayjs(record.started_at).format("HH:mm:ss DD/MM")}
            </Space>
            {record.submitted_at && (
              <Space size={4}>
                <CheckCircleOutlined /> Nộp bài: {dayjs(record.submitted_at).format("HH:mm:ss DD/MM")}
              </Space>
            )}
          </div>
        ),
      },
      {
        title: "Bảo mật",
        key: "security",
        render: (_: any, record: StudentAttempt) => {
          const totalViolations = record.security.logs.length;
          return (
            <Space>
              <Tooltip title={`Tổng lỗi: ${totalViolations}`}>
                <Badge count={totalViolations} overflowCount={99} color={totalViolations > 5 ? "red" : totalViolations > 0 ? "orange" : "green"}>
                  <Button
                    size="small"
                    type="text"
                    icon={<SafetyCertificateOutlined className="text-orange-500" />}
                    onClick={() => handleShowLogs(record)}
                  >
                    Nhật ký
                  </Button>
                </Badge>
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_: any, record: StudentAttempt) => (
          <Button
            type="link"
            size="small"
            className="font-medium text-indigo-600 hover:text-indigo-800"
            onClick={() => router.push(`/admin/classes/${classId}/exams/${examId}/attempts/${record.id}`)}
          >
            Chi tiết bài làm
          </Button>
        ),
      },
    ],
    [classId, examId, router, test?.total_score, handleShowLogs]
  );

  return (
    <div className="p-0 min-h-screen">
      <RouteErrorBoundary routeName="admin">
        <div className="flex flex-col gap-6">
          {/* Header: Quay lại (trái) — Làm mới (phải) */}
          <div className="flex items-center justify-between">
            <Button
              icon={<ArrowLeftOutlined />}
              className="rounded-lg font-medium border-gray-200"
              onClick={() => router.push(`/admin/classes/${classId}`)}
            >
              Quay lại
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleFastRefresh}
              loading={loading}
              className="rounded-lg font-medium border-gray-200"
              title="Làm mới dữ liệu"
            >
              Làm mới
            </Button>
          </div>

          {/* Exam Information Memoized */}
          <ExamInfoDescription test={test} averageScore={averageScore} attemptsCount={attempts.length} completionRate={completionRate} />

          {/* Attempts Table Container - Matching Image 2 Table style */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 flex items-center justify-between">
              <Title level={5} style={{ margin: 0 }} className="text-gray-700 dark:text-gray-300 uppercase text-[11px] tracking-widest font-bold">
                Danh sách học sinh tham gia kiểm tra
              </Title>
              <div className="flex gap-2">
                <Badge dot color="green">
                  <Text className="text-[10px] text-gray-400 uppercase font-bold">Live Tracking Enabled</Text>
                </Badge>
              </div>
            </div>
            <div className="p-0">
              <Table
                loading={loading}
                dataSource={attempts}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  className: "p-4",
                }}
                className="custom-admin-table"
              />
            </div>
          </div>
        </div>

        {/* Security Logs Modal Memoized */}
        <SecurityLogModal isOpen={isLogModalOpen} onClose={handleCloseLogs} selectedLogs={selectedLogs} />
      </RouteErrorBoundary>
    </div>
  );
}
