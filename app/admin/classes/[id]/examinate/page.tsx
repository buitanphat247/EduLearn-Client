"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Modal, Spin } from "antd";
import CustomCard from "@/app/components/common/CustomCard";
import InfoBox from "@/app/components/exams/InfoBox";
import TemplatesSection from "@/app/components/exams/TemplatesSection";
import ExamFormatGuide from "@/app/components/exams/ExamFormatGuide";
import AIGenerationSection from "@/app/components/exams/AIGenerationSection";
import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

export default function ExaminatePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;

  const [fileList] = useState<UploadFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCancel = () => {
    router.push(`/admin/classes/${classId}`);
  };

  const templates = [
    { name: "Đề mẫu Azota Pdf", type: "pdf" },
    { name: "Đề mẫu Azota Docx", type: "docx" },
    { name: "File Excel bảng đáp án đề Offline", type: "xlsx" },
    { name: "File Latex mẫu (.tex)", type: "tex" },
    { name: "File Latex mẫu (.zip)", type: "zip" },
  ];

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 space-y-6">
      <div className="flex items-center justify-start">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          disabled={isCreating}
          className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-colors bg-transparent"
        >
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-1 space-y-6">
          <CustomCard padding="lg">
            <div className="space-y-6">
              <div className="pt-4">
                <AIGenerationSection uploadedFile={fileList.length > 0 ? fileList[0] : null} onLoadingChange={setIsCreating} />
              </div>

              <div className="space-y-3 pt-2">
                {/* Image Note */}
                <InfoBox type="warning">
                  <p>
                    <span className="font-medium">Lưu ý:</span> File ảnh chỉ hỗ trợ số hóa
                  </p>
                </InfoBox>

                {/* Templates Section */}
                <TemplatesSection templates={templates} disabled={isCreating} />

                {/* OCR Feature */}
                <InfoBox type="success" title="Tính năng mới">
                  <p>Azota đã hỗ trợ nhận dạng đề từ file ảnh (ảnh chụp đề hoặc viết tay)</p>
                </InfoBox>
              </div>
            </div>
          </CustomCard>
        </div>

        {/* Right Column - Lưu ý */}
        <div className="lg:col-span-1">
          <CustomCard padding="none" className="overflow-hidden">
            <ExamFormatGuide />
          </CustomCard>
        </div>
      </div>

      {/* Modal hiển thị khi đang tạo bài */}
      <Modal open={isCreating} closable={false} footer={null} centered maskClosable={false} className="text-center">
        <div className="py-6">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} className="mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Đang tạo bài thi...</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-1">AI Agent đang xử lý và tạo câu hỏi cho bạn</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quá trình này có thể mất 30-60 giây tùy độ dài tài liệu</p>
        </div>
      </Modal>
    </div>
  );
}
