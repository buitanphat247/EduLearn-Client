"use client";

import {
  Card,
  Descriptions,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

interface AttemptStatsCardProps {
  attempt: {
    student_name: string;
    status: string;
    score: number;
    started_at: string | null;
    submitted_at: string | null;
  };
  test: {
    title: string;
    num_questions: number;
    total_score: number;
  };
  correctCount: number;
  questionsLength: number;
}

export default function AttemptStatsCard({
  attempt,
  test,
  correctCount,
  questionsLength,
}: AttemptStatsCardProps) {
  const percentage =
    test.total_score > 0 ? Math.round((attempt.score / test.total_score) * 100) : 0;

  return (
    <Card
      title={
        <div className="flex items-center gap-2 py-1">
          <InfoCircleOutlined className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Chi tiết bài làm: {attempt.student_name}
          </span>
        </div>
      }
      variant="borderless"
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
      styles={{ body: { padding: 0 } }}
    >
      <Descriptions
        bordered
        column={2}
        className="[&_.ant-descriptions-item-label]:bg-gray-50 [&_.ant-descriptions-item-label]:dark:bg-gray-900 [&_.ant-descriptions-item-label]:dark:text-gray-300 [&_.ant-descriptions-item-label]:font-semibold [&_.ant-descriptions-item-label]:w-[200px] [&_.ant-descriptions-item-content]:dark:bg-gray-800 [&_.ant-descriptions-item-content]:dark:text-gray-200"
      >
        <Descriptions.Item label="Học sinh">
          <Space>
            <UserOutlined className="text-blue-500" />
            <Text strong className="dark:text-gray-200">
              {attempt.student_name}
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Điểm số">
          <Space>
            <LineChartOutlined
              className={percentage >= 50 ? "text-emerald-400" : "text-red-500"}
            />
            <Text
              strong
              className="dark:text-inherit"
              style={{
                color: percentage >= 50 ? "#16a34a" : "#dc2626",
                fontSize: 16,
              }}
            >
              {attempt.score}/{test.total_score} ({percentage}%)
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Số câu đúng">
          <Text
            strong
            style={{
              color:
                correctCount === questionsLength
                  ? "#16a34a"
                  : correctCount > 0
                    ? "#2563eb"
                    : "#dc2626",
              fontSize: 16,
            }}
          >
            {correctCount}/{questionsLength} câu
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag
            color={
              attempt.status === "submitted"
                ? "green"
                : attempt.status === "expired"
                  ? "red"
                  : "gold"
            }
          >
            {attempt.status === "submitted"
              ? "Đã nộp"
              : attempt.status === "expired"
                ? "Hết giờ"
                : "Đang làm"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Bắt đầu">
          <Space>
            <ClockCircleOutlined className="text-blue-500" />
            <Text strong className="dark:text-gray-200">
              {attempt.started_at
                ? dayjs(attempt.started_at).format("HH:mm DD/MM/YYYY")
                : "-"}
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Nộp bài">
          <Space>
            <CheckCircleOutlined className="text-blue-500" />
            <Text strong className="dark:text-gray-200">
              {attempt.submitted_at
                ? dayjs(attempt.submitted_at).format("HH:mm DD/MM/YYYY")
                : "-"}
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Đề thi" span={2}>
          <Space>
            <FileTextOutlined className="text-blue-500" />
            <Text strong className="text-gray-800 dark:text-gray-100 text-base">
              {test.title}
            </Text>
            <Text type="secondary" className="text-sm">
              ({test.num_questions} câu · Tổng điểm {test.total_score})
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Thống kê tổng quát" span={2}>
          <Row gutter={[16, 12]} className="py-1">
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Điểm số</Text>}
                prefix={<LineChartOutlined className="text-emerald-400 text-sm mr-1" />}
                value={attempt.score}
                suffix={`/${test.total_score}`}
                valueStyle={{ fontWeight: 600, fontSize: 16, color: percentage >= 50 ? "#16a34a" : "#dc2626" }}
                className="[&_.ant-statistic-content-value]:dark:text-inherit"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Số câu đúng</Text>}
                prefix={<CheckCircleOutlined className="text-blue-400 text-sm mr-1" />}
                value={correctCount}
                suffix={`/${questionsLength} câu`}
                valueStyle={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: correctCount === questionsLength ? "#16a34a" : correctCount > 0 ? "#2563eb" : "#dc2626",
                }}
                className="[&_.ant-statistic-content-value]:dark:text-inherit"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Tỷ lệ đạt</Text>}
                value={percentage}
                suffix="%"
                valueStyle={{ fontWeight: 600, fontSize: 16, color: "#6366f1" }}
              />
            </Col>
          </Row>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
