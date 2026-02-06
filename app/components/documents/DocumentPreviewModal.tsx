"use client";

import { Modal } from "antd";
import { getViewerUrl } from "@/app/components/content/getViewerUrl";

export interface DocumentPreviewModalProps {
  open: boolean;
  title?: string;
  fileUrl?: string;
  viewerUrl?: string;
  onClose: () => void;
  afterClose?: () => void;
}

/**
 * Component Modal để preview tài liệu
 * Có thể nhận fileUrl (sẽ tự động tạo viewerUrl) hoặc viewerUrl trực tiếp
 */
export default function DocumentPreviewModal({
  open,
  title = "Xem trước tài liệu",
  fileUrl,
  viewerUrl,
  onClose,
  afterClose,
}: DocumentPreviewModalProps) {
  // Nếu có fileUrl thì tự động tạo viewerUrl, nếu không thì dùng viewerUrl được truyền vào
  const finalViewerUrl = fileUrl ? getViewerUrl(fileUrl) : viewerUrl || "";

  if (!finalViewerUrl) {
    return null;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={afterClose}
      footer={null}
      width="90%"
      styles={{ body: { padding: 0 } }}
      centered
      destroyOnHidden={false}
      maskClosable={true}
      title={title}
    >
      <iframe
        title={title}
        src={finalViewerUrl}
        style={{ width: "100%", height: "85vh" }}
        className="border-0"
      />
    </Modal>
  );
}
