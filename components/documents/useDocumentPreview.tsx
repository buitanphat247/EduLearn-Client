"use client";

import { useState, useCallback } from "react";

export interface DocumentPreviewData {
  title: string;
  fileUrl: string;
}

/**
 * Hook để quản lý state và logic preview tài liệu
 * @returns Object chứa previewDoc, openPreview, closePreview, handleAfterClose
 */
export const useDocumentPreview = () => {
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback((doc: DocumentPreviewData) => {
    setPreviewDoc(doc);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    // Đóng modal ngay lập tức để bắt đầu animation
    setIsOpen(false);
  }, []);

  const handleAfterClose = useCallback(() => {
    // Reset state sau khi animation đóng hoàn tất
    setPreviewDoc(null);
  }, []);

  return {
    previewDoc,
    openPreview,
    closePreview,
    handleAfterClose,
    isOpen,
  };
};

