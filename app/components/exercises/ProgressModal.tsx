"use client";

import { Modal, Spin } from "antd";

interface ProgressModalProps {
  open: boolean;
  status: string;
  title?: string;
}

export default function ProgressModal({ open, status, title = "Đang cập nhật bài tập..." }: ProgressModalProps) {
  return (
    <Modal open={open} closable={false} maskClosable={false} footer={null} title={title} centered>
      <div className="flex flex-col items-center justify-center space-y-5 py-8">
        <div>
          <Spin size="large" />
        </div>
        <div>
          <p className="text-center text-gray-600 text-base font-medium">{status || "Đang xử lý..."}</p>
        </div>
      </div>
    </Modal>
  );
}

