"use client";

import { Button, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  CloudUploadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

interface FileUploadSectionProps {
  fileList: UploadFile[];
  onUpload: UploadProps["onChange"];
  onRemove: (file: UploadFile) => void;
  beforeUpload: (file: File) => boolean | typeof Upload.LIST_IGNORE;
}

const getFileIcon = (file: UploadFile) => {
  const fileName = file.name || "";
  const fileType = file.type || "";

  if (fileType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf")) {
    return <FilePdfOutlined className="text-red-500 text-xl" />;
  }
  if (
    fileType.includes("word") ||
    fileType.includes("document") ||
    fileName.toLowerCase().endsWith(".docx") ||
    fileName.toLowerCase().endsWith(".doc")
  ) {
    return <FileWordOutlined className="text-blue-500 text-xl" />;
  }
  if (fileType.includes("excel") || fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
    return <FileExcelOutlined className="text-green-500 text-xl" />;
  }
  if (fileType.includes("image") || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)) {
    return <FileImageOutlined className="text-purple-500 text-xl" />;
  }
  if (fileName.toLowerCase().endsWith(".zip")) {
    return <FileZipOutlined className="text-orange-500 text-xl" />;
  }
  return <FileTextOutlined className="text-gray-500 text-xl" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export default function FileUploadSection({ fileList, onUpload, onRemove, beforeUpload }: FileUploadSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Chọn File hoặc kéo thả File vào đây</h2>

      {fileList.length > 0 && (
        <div className="space-y-3 mb-4">
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
            >
              <div className="shrink-0">{getFileIcon(file)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{file.size ? formatFileSize(file.size) : "Đang tải..."}</p>
              </div>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(file)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
          ))}
        </div>
      )}

      {fileList.length === 0 && (
        <Upload.Dragger
          fileList={[]}
          onChange={onUpload}
          beforeUpload={beforeUpload}
          multiple
          accept=".pdf,.docx,.xlsx,.azt,.tex,.zip,image/*"
          className="transition-all group"
          showUploadList={false}
        >
          <div className="p-8">
            <p className="ant-upload-drag-icon mb-4 transform group-hover:scale-110 transition-transform duration-300">
              <CloudUploadOutlined className="text-6xl text-blue-500" />
            </p>
            <p className="ant-upload-text text-base font-medium text-gray-700 mb-2">
              Kéo thả file vào đây hoặc <span className="text-blue-600">nhấn để chọn file</span>
            </p>
            <p className="ant-upload-hint text-sm text-gray-500">.pdf, .docx, .xlsx, .azt, .tex, .zip, Ảnh</p>
          </div>
        </Upload.Dragger>
      )}
    </div>
  );
}

