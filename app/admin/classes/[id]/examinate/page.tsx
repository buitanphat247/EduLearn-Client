"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Upload } from "antd";
import CustomCard from "@/app/components/common/CustomCard";
import FileUploadSection from "@/app/components/exams/FileUploadSection";
import InfoBox from "@/app/components/exams/InfoBox";
import TemplatesSection from "@/app/components/exams/TemplatesSection";
import ExamFormatGuide from "@/app/components/exams/ExamFormatGuide";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

export default function ExaminatePage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };

  const handleRemoveFile = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const validExtensions = [".pdf", ".docx", ".xlsx", ".azt", ".tex", ".zip"];
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const fileName = file.name.toLowerCase();

    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
    const isValidImage = validImageTypes.includes(file.type);

    if (!isValidExtension && !isValidImage) {
      message.error("Chỉ chấp nhận file .pdf, .docx, .xlsx, .azt, .tex, .zip hoặc ảnh!");
      return Upload.LIST_IGNORE;
    }

    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error("File phải nhỏ hơn 50MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

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
    <div className="bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-start">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          className="border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors"
        >
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-1 space-y-6">
          <CustomCard padding="lg">
            <div className="space-y-6">
              {/* Upload Section */}
              <FileUploadSection fileList={fileList} onUpload={handleUpload} onRemove={handleRemoveFile} beforeUpload={beforeUpload} />

              {/* Info Section */}
              <InfoBox type="info">
                <p className="mb-2">
                  Có thể Upload File <strong>Bài tập</strong>, <strong>Đề thi</strong> Hoặc <strong>Bảng đáp án</strong> để chấm offline.
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Tìm hiểu thêm →
                </a>
              </InfoBox>

              {/* Image Note */}
              <InfoBox type="warning">
                <p>
                  <span className="font-medium">Lưu ý:</span> File ảnh chỉ hỗ trợ số hóa
                </p>
              </InfoBox>

              {/* Templates Section */}
              <TemplatesSection templates={templates} />

              {/* OCR Feature */}
              <InfoBox type="success" title="Tính năng mới">
                <p>Azota đã hỗ trợ nhận dạng đề từ file ảnh (ảnh chụp đề hoặc viết tay)</p>
              </InfoBox>
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
    </div>
  );
}
