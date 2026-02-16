"use client";

import { useState } from "react";
import { Empty, Button, Modal, List, Badge, Space, Typography } from "antd";
import { SafetyCertificateOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { AttemptDetailQuestion } from "@/lib/api/exam-attempts";
import QuestionCard from "./QuestionCard";

interface SecurityLog {
  type: string;
  timestamp: string;
  details: string | null;
}

interface SecurityData {
  reload_count: number;
  tab_hidden_count: number;
  disconnect_count: number;
  logs: SecurityLog[];
}

interface QuestionsListCardProps {
  questions: AttemptDetailQuestion[];
  security?: SecurityData | null;
  studentName?: string;
}

export default function QuestionsListCard({
  questions,
  security,
  studentName,
}: QuestionsListCardProps) {
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const totalViolations = security?.logs?.length || 0;
  const hasViolations =
    totalViolations > 0 ||
    (security?.reload_count || 0) > 0 ||
    (security?.tab_hidden_count || 0) > 0 ||
    (security?.disconnect_count || 0) > 0;

  return (
    <div>
      <div className="w-full py-4 px-0 border-b-2 border-gray-200 dark:border-gray-600 mb-6 flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 m-0">
          Chi tiết từng câu ({questions.length} câu)
        </h3>
        <Space>
          {security && (
            <Badge count={totalViolations} size="small" offset={[-2, 2]}>
              <Button
                type={hasViolations ? "primary" : "default"}
                danger={hasViolations}
                icon={<SafetyCertificateOutlined />}
                onClick={() => setSecurityModalOpen(true)}
                className="shrink-0"
              >
                Kiểm tra bảo mật
              </Button>
            </Badge>
          )}
        </Space>
      </div>
      <Modal
        title={
          <Space>
            <WarningOutlined className="text-orange-500" />
            <span>Nhật ký vi phạm{studentName ? `: ${studentName}` : ""}</span>
          </Space>
        }
        open={securityModalOpen}
        onCancel={() => setSecurityModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            className="rounded-lg px-6 font-medium bg-blue-600"
            onClick={() => setSecurityModalOpen(false)}
          >
            Đóng
          </Button>,
        ]}
        width={700}
        centered
        className="security-log-modal"
      >
        {security && (
          <List
            itemLayout="horizontal"
            dataSource={security.logs || []}
            renderItem={(log) => (
              <List.Item className="border-b last:border-0 py-5 px-0 border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4 w-full">
                  <div
                    className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${log.type === "disconnect"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                        : "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                      }`}
                  >
                    <SafetyCertificateOutlined style={{ fontSize: "22px" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Typography.Text
                        strong
                        className="text-gray-800 dark:text-gray-200 text-[16px] uppercase tracking-tight"
                      >
                        {log.type.replace(/_/g, " ")}
                      </Typography.Text>
                      <Typography.Text className="text-gray-400 dark:text-gray-500 text-[13px] font-medium pt-1">
                        {dayjs(log.timestamp).format("HH:mm:ss DD/MM/YYYY")}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">
                        {log.details || "Hệ thống tự động ghi nhận vi phạm."}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
            locale={{
              emptyText: <Empty description="Học sinh này thực hiện bài thi nghiêm túc" />,
            }}
            style={{ maxHeight: "500px", overflowY: "auto" }}
            className="px-2"
          />
        )}
      </Modal>
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q, idx) => <QuestionCard key={q.id} q={q} index={idx} />)
        ) : (
          <Empty description="Không có dữ liệu câu hỏi" />
        )}
      </div>
    </div>
  );
}
