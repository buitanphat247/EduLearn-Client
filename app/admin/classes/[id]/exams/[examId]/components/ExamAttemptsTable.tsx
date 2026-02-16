"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Button, Typography, Space, Badge, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import type { StudentAttempt } from "@/lib/api/exam-attempts";
import type { RagTestDetail } from "@/lib/api/rag-exams";
import dayjs from "dayjs";

const { Text } = Typography;

interface ExamAttemptsTableProps {
  attempts: StudentAttempt[];
  test: RagTestDetail | null;
  loading: boolean;
  classId: string;
  examId: string;
  onShowLogs: (attempt: StudentAttempt) => void;
}

export default memo(function ExamAttemptsTable({
  attempts,
  test,
  loading,
  classId,
  examId,
  onShowLogs,
}: ExamAttemptsTableProps) {
  const router = useRouter();

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
        render: (_: unknown, record: StudentAttempt) => (
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
        render: (_: unknown, record: StudentAttempt) => (
          <div className="flex flex-col">
            <Text
              strong
              className={
                record.score >= (test?.total_score || 0) * 0.5 ? "text-green-600 dark:text-green-400" : "text-red-500"
              }
            >
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
        render: (_: unknown, record: StudentAttempt) => (
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
        render: (_: unknown, record: StudentAttempt) => {
          const totalViolations = record.security.logs.length;
          return (
            <Space>
              <Tooltip title={`Tổng lỗi: ${totalViolations}`}>
                <Badge
                  count={totalViolations}
                  overflowCount={99}
                  color={totalViolations > 5 ? "red" : totalViolations > 0 ? "orange" : "green"}
                >
                  <Button
                    size="small"
                    type="text"
                    icon={<SafetyCertificateOutlined className="text-orange-500" />}
                    onClick={() => onShowLogs(record)}
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
        render: (_: unknown, record: StudentAttempt) => (
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
    [test?.total_score, test?.max_attempts, test?.num_questions, classId, examId, router, onShowLogs]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 m-0">
          Danh sách học sinh tham gia kiểm tra
        </h3>
        <Badge dot color="green">
          <Text className="text-[10px] text-gray-400 uppercase font-bold">Live Tracking Enabled</Text>
        </Badge>
      </div>
      <div className="p-0">
        <Table
          loading={loading}
          dataSource={attempts}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} học sinh`,
            pageSizeOptions: [10, 20, 50, 100],
            position: ["bottomCenter"],
            locale: {
              items_per_page: " / trang",
              jump_to: "Đến trang",
              page: "Trang",
              prev_page: "Trang trước",
              next_page: "Trang sau",
              prev_5: "Trang trước 5",
              next_5: "Trang sau 5",
            },
            className: "p-4 [&_.ant-pagination-item]:transition-colors",
          }}
          className="custom-admin-table"
        />
      </div>
    </div>
  );
});
