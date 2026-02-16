"use client";

import { memo } from "react";
import { Card, Descriptions, Row, Col, Statistic, Typography, Space, Tag } from "antd";
import { InfoCircleOutlined, ClockCircleOutlined, UserOutlined, LineChartOutlined } from "@ant-design/icons";
import type { RagTestDetail } from "@/lib/api/rag-exams";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

interface ExamInfoCardProps {
  test: RagTestDetail | null;
  averageScore: string | number;
  attemptsCount: number;
  completionRate: number;
}

export default memo(function ExamInfoCard({ test, averageScore, attemptsCount, completionRate }: ExamInfoCardProps) {
  return (
    <Card
      title={
        <div className="flex items-center gap-2 py-1">
          <InfoCircleOutlined className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
            Thông tin bài kiểm tra
          </span>
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
            <ClockCircleOutlined className="text-blue-500" />{" "}
            <Text strong className="dark:text-gray-200">{test?.duration_minutes} phút</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng câu hỏi">
          <Space>
            <InfoCircleOutlined className="text-blue-500" />{" "}
            <Text strong className="dark:text-gray-200">{test?.num_questions} câu hỏi</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          <Space>
            <ClockCircleOutlined className="text-blue-500" />{" "}
            <Text strong className="dark:text-gray-200">{dayjs(test?.created_at).format("DD/MM/YYYY - HH:mm")}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          <Paragraph ellipsis={{ rows: 2, expandable: true }} className="text-gray-500 dark:text-gray-400 m-0 leading-relaxed italic">
            {test?.description || "Không có mô tả cho đề thi này."}
          </Paragraph>
        </Descriptions.Item>
        <Descriptions.Item label="Thống kê tổng quát" span={2}>
          <Row gutter={[16, 12]} className="py-1">
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Học sinh tham gia</Text>}
                value={attemptsCount}
                suffix=" học sinh"
                valueStyle={{ fontWeight: 600, fontSize: 16 }}
                className="[&_.ant-statistic-content-value]:dark:text-gray-200"
                prefix={<UserOutlined className="text-blue-400 text-sm mr-1" />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Điểm trung bình</Text>}
                value={averageScore}
                suffix={`/${test?.total_score}`}
                valueStyle={{ fontWeight: 600, fontSize: 16 }}
                className="[&_.ant-statistic-content-value]:dark:text-gray-200"
                prefix={<LineChartOutlined className="text-emerald-400 text-sm mr-1" />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={<Text type="secondary" className="dark:text-gray-400 text-[10px] uppercase tracking-wider">Tỷ lệ hoàn thành</Text>}
                value={completionRate}
                suffix="%"
                valueStyle={{ fontWeight: 600, fontSize: 16, color: "#6366f1" }}
              />
            </Col>
          </Row>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
});
