"use client";

import { Upload, Button, message } from "antd";
import { PaperClipOutlined, CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { getFileIcon, formatFileSize, validateFileExtension, getFileName, getFileSize } from "@/lib/utils/fileUtils";
import CustomCard from "@/app/components/common/CustomCard";

interface FileUploadSectionProps {
  fileList: UploadFile[];
  existingAttachments?: Array<{
    attachment_id: string | number;
    file_name: string;
    file_size: string | number;
    file_type?: string;
  }>;
  onFileChange: UploadProps["onChange"];
  onRemoveFile: (file: UploadFile) => void;
  beforeUpload?: (file: File) => boolean | typeof Upload.LIST_IGNORE;
  accept?: string;
}

export default function FileUploadSection({
  fileList,
  existingAttachments = [],
  onFileChange,
  onRemoveFile,
  beforeUpload,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif",
}: FileUploadSectionProps) {
  const defaultBeforeUpload = (file: File) => {
    if (!validateFileExtension(file.name)) {
      message.error("Chỉ chấp nhận file: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar, jpg, jpeg, png, gif!");
      return Upload.LIST_IGNORE;
    }
    // Return false to prevent automatic upload - we handle upload manually in form submit
    return false;
  };

  return (
    <CustomCard
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white">
          <PaperClipOutlined /> Tệp đính kèm
          {fileList.length + existingAttachments.length > 0 && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({fileList.length + existingAttachments.length} tệp)
            </span>
          )}
        </div>
      }
      padding="md"
    >
      {/* Existing Attachments */}
      {existingAttachments.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">File hiện có</div>
          {existingAttachments.map((attachment) => (
            <div
              key={String(attachment.attachment_id)}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all group"
            >
              <div className="shrink-0">{getFileIcon(attachment)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{getFileName(attachment)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatFileSize(getFileSize(attachment))}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Đã tải lên</span>
            </div>
          ))}
        </div>
      )}

      {/* New File List */}
      {fileList.length > 0 && (
        <div className="space-y-3 mb-4">
          {existingAttachments.length > 0 && (
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">File mới</div>
          )}
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all group"
            >
              <div className="shrink-0">{getFileIcon(file)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{getFileName(file)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {file.size ? formatFileSize(file.size) : "Đang tải..."}
                </p>
              </div>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemoveFile(file)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <Upload.Dragger
        fileList={[]}
        onChange={onFileChange}
        beforeUpload={beforeUpload || defaultBeforeUpload}
        customRequest={({ onSuccess }) => {
          // Prevent automatic upload - we handle upload manually in the form submit
          setTimeout(() => {
            onSuccess?.("ok");
          }, 0);
        }}
        multiple
        accept={accept}
        className="transition-all group"
        showUploadList={false}
      >
        <div className="p-4">
          <p className="ant-upload-drag-icon mb-4 transform group-hover:scale-110 transition-transform duration-300">
            <CloudUploadOutlined className="text-5xl! text-blue-500/80!" />
          </p>
          <p className="ant-upload-text text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span className="text-blue-600 dark:text-blue-400">Nhấn để tải lên</span> hoặc kéo thả tệp vào đây
          </p>
          <p className="ant-upload-hint text-gray-400 dark:text-gray-500">
            PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, JPEG, PNG, GIF
          </p>
        </div>
      </Upload.Dragger>
    </CustomCard>
  );
}

