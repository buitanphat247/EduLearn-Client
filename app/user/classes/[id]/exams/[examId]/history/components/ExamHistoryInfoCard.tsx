"use client";

import { Card, Descriptions, Row, Col, Statistic, Typography } from "antd";
import {
  InfoCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { RagTestDetail } from "@/lib/api/rag-exams";
import type { StudentAttempt } from "@/lib/api/exam-attempts";
import dayjs from "dayjs";

const { Text } = Typography;

interface ExamHistoryInfoCardProps {
  test: RagTestDetail | null;
  attempts: StudentAttempt[];
}

export default function ExamHistoryInfoCard({ test, attempts }: ExamHistoryInfoCardProps) {
  const totalScore = test?.total_score || 100;
  const submittedAttempts = attempts.filter((a) => a.status === "submitted" || a.status === "expired");
  const submittedCount = submittedAttempts.length;
  const averageScore =
    submittedCount > 0 ? (submittedAttempts.reduce((sum, a) => sum + a.score, 0) / submittedCount).toFixed(1) : "0";
  const bestScore = submittedCount > 0 ? Math.max(...submittedAttempts.map((a) => a.score)) : 0;
  const passCount = submittedAttempts.filter((a) => a.score >= totalScore * 0.5).length;

  return (
    <Card
      title={
        <div className="flex items-center gap-2 py-1">
          <InfoCircleOutlined className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Thông tin đề thi & Thống kê
          </span>
        </div>
      }
      variant="borderless"
      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      styles={{ body: { padding: 0 } }}
    >
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2 }}
        className="[&_.ant-descriptions-item-label]:bg-gray-50 [&_.ant-descriptions-item-label]:dark:bg-gray-900 [&_.ant-descriptions-item-label]:font-semibold [&_.ant-descriptions-item-content]:dark:bg-gray-800 [&_.ant-descriptions-item-content]:dark:text-gray-200"
      >
        <Descriptions.Item
          label={
            <span className="flex items-center gap-2">
              <FileTextOutlined className="text-blue-500" />
              Tên bài làm
            </span>
          }
          span={2}
        >
          <Text strong className="text-base text-gray-800 dark:text-gray-100">
            {test?.title || "—"}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="flex items-center gap-2">
              <CalendarOutlined className="text-blue-500" />
              Ngày tạo đề
            </span>
          }
        >
          <Text>
            {test?.created_at
              ? dayjs(test.created_at).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="flex items-center gap-2">
              <ClockCircleOutlined className="text-blue-500" />
              Thời gian làm bài
            </span>
          }
        >
          <Text>{test?.duration_minutes ? `${test.duration_minutes} phút` : "—"}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="flex items-center gap-2">
              <UserOutlined className="text-blue-500" />
              Người tạo
            </span>
          }
          span={2}
        >
          <Text>{test?.creator_name || "Hệ thống AI"}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Thống kê làm bài" span={2}>
          <Row gutter={[16, 12]} className="py-1">
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={<Text type="secondary" className="text-[10px] uppercase tracking-wider">Tổng lượt làm</Text>}
                value={attempts.length}
                suffix=" lượt"
                valueStyle={{ fontWeight: 600, fontSize: 16 }}
                prefix={<InfoCircleOutlined className="text-blue-400 text-sm mr-1" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={<Text type="secondary" className="text-[10px] uppercase tracking-wider">Điểm trung bình</Text>}
                value={averageScore}
                suffix={`/${totalScore}`}
                valueStyle={{ fontWeight: 600, fontSize: 16 }}
                prefix={<LineChartOutlined className="text-emerald-400 text-sm mr-1" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={<Text type="secondary" className="text-[10px] uppercase tracking-wider">Điểm cao nhất</Text>}
                value={bestScore.toFixed(1)}
                suffix={`/${totalScore}`}
                valueStyle={{ fontWeight: 600, fontSize: 16, color: "#16a34a" }}
                prefix={<TrophyOutlined className="text-amber-400 text-sm mr-1" />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={<Text type="secondary" className="text-[10px] uppercase tracking-wider">Số lần đạt</Text>}
                value={passCount}
                suffix={`/ ${submittedCount} lượt nộp`}
                valueStyle={{ fontWeight: 600, fontSize: 16, color: "#6366f1" }}
                prefix={<CheckCircleOutlined className="text-indigo-400 text-sm mr-1" />}
              />
            </Col>
          </Row>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
