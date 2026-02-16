"use client";

import { Table, Tag, Typography } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, LineChartOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import type { StudentAttempt } from "@/lib/api/exam-attempts";
import dayjs from "dayjs";

const { Text } = Typography;

interface ExamHistoryTableProps {
  attempts: StudentAttempt[];
  totalScore: number;
  loading?: boolean;
}

export default function ExamHistoryTable({ attempts, totalScore, loading = false }: ExamHistoryTableProps) {
  const columns = [
    {
      title: "Lượt làm",
      key: "attempt",
      width: 90,
      render: (_: unknown, __: StudentAttempt, idx: number) => (
        <Text strong className="text-gray-800 dark:text-gray-200">Lượt {idx + 1}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          submitted: { color: "green", text: "Đã nộp" },
          expired: { color: "red", text: "Hết giờ" },
          in_progress: { color: "gold", text: "Đang làm" },
        };
        const { color, text } = config[status] || { color: "default", text: status };
        return <Tag color={color} className="font-medium">{text}</Tag>;
      },
    },
    {
      title: "Điểm số",
      key: "score",
      width: 130,
      render: (_: unknown, record: StudentAttempt) => {
        const isPass = record.score >= totalScore * 0.5;
        const percentage = Math.round((record.score / totalScore) * 100);
        return (
          <span className="flex items-center gap-2">
            <LineChartOutlined className={isPass ? "text-emerald-500" : "text-red-500"} />
            <Text
              strong
              className={isPass ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}
            >
              {record.score.toFixed(1)} / {totalScore}
            </Text>
            <span className="text-xs text-gray-400">({percentage}%)</span>
          </span>
        );
      },
    },
    {
      title: "Bắt đầu",
      dataIndex: "started_at",
      key: "started_at",
      width: 165,
      render: (v: string) => (
        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <ClockCircleOutlined className="text-blue-500" />
          {dayjs(v).format("DD/MM/YYYY HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Nộp bài",
      dataIndex: "submitted_at",
      key: "submitted_at",
      width: 165,
      render: (v: string | null) =>
        v ? (
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
            <CheckCircleOutlined className="text-green-500" />
            {dayjs(v).format("DD/MM/YYYY HH:mm:ss")}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Lỗi vi phạm",
      key: "violations",
      width: 120,
      render: (_: unknown, record: StudentAttempt) => {
        const sec = record.security || {};
        const total =
          (sec.reload || 0) + (sec.tab_hidden || 0) + (sec.disconnect || 0) ||
          (sec.logs?.length ?? 0);
        const color = total > 0 ? (total >= 3 ? "red" : "orange") : "green";
        return (
          <span className="flex items-center gap-1.5">
            <SafetyCertificateOutlined className={total > 0 ? "text-orange-500" : "text-green-500"} />
            <Tag color={color} className="m-0 font-medium">
              {total} lỗi
            </Tag>
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 m-0">
          Chi tiết từng lượt làm
        </h3>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} lượt làm`,
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
          }}
          size="middle"
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:dark:bg-gray-800 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr>td]:dark:text-gray-200 [&_.ant-pagination]:py-4 [&_.ant-pagination-item]:transition-colors"
        />
      </div>
    </div>
  );
}
