import { FileTextOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

export interface FileItem {
  name?: string;
  file_name?: string;
  type?: string;
  file_type?: string;
  size?: number;
  file_size?: string | number;
}

/**
 * Get appropriate icon for file based on type or extension
 */
export const getFileIcon = (file: FileItem): ReactNode => {
  const fileName = file.name || file.file_name || "";
  const fileType = file.type || file.file_type || "";

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
  if (fileType.includes("image") || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)) {
    return <FileImageOutlined className="text-green-500 text-xl" />;
  }
  return <FileTextOutlined className="text-gray-500 text-xl" />;
};

/**
 * Format file size from bytes to human readable format
 */
export const formatFileSize = (bytes: number | string): string => {
  const numBytes = typeof bytes === "string" ? Number(bytes) : bytes;
  if (numBytes === 0 || isNaN(numBytes)) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Validate file extension
 */
export const validateFileExtension = (fileName: string): boolean => {
  const validExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".rar", ".jpg", ".jpeg", ".png", ".gif"];
  const lowerFileName = fileName.toLowerCase();
  return validExtensions.some((ext) => lowerFileName.endsWith(ext));
};

/**
 * Get file name from file item (handles both UploadFile and attachment objects)
 */
export const getFileName = (file: FileItem): string => {
  return file.name || file.file_name || "Unknown file";
};

/**
 * Get file size from file item (handles both UploadFile and attachment objects)
 */
export const getFileSize = (file: FileItem): number => {
  if (file.size) return file.size;
  if (file.file_size) {
    const size = typeof file.file_size === "string" ? Number(file.file_size) : file.file_size;
    return isNaN(size) ? 0 : size;
  }
  return 0;
};

