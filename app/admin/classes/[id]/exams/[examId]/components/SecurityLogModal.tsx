"use client";

import { memo } from "react";
import { Modal, Button, Space, List, Empty, Typography } from "antd";
import { WarningOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import type { StudentAttempt } from "@/lib/api/exam-attempts";
import dayjs from "dayjs";

const { Text } = Typography;

interface SecurityLogModalProps {
  open: boolean;
  onClose: () => void;
  selectedLogs: StudentAttempt | null;
}

export default memo(function SecurityLogModal({ open, onClose, selectedLogs }: SecurityLogModalProps) {
  return (
    <Modal
      title={
        <Space>
          <WarningOutlined className="text-orange-500" />
          <span>Nhật ký vi phạm: {selectedLogs?.student_name}</span>
        </Space>
      }
      open={open}
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
                className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${
                  log.type === "disconnect" ? "bg-red-50 dark:bg-red-900/20 text-red-500" : "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                }`}
              >
                <SafetyCertificateOutlined style={{ fontSize: "22px" }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <Text strong className="text-gray-800 dark:text-gray-200 text-[16px] uppercase tracking-tight">
                    {log.type.replace("_", " ")}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-[13px] font-medium pt-1">
                    {dayjs(log.timestamp).format("HH:mm:ss DD/MM/YYYY")}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">
                    {log.details || "Hệ thống tự động ghi nhận vi phạm."}
                  </Text>
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
  );
});
