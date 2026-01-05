import { useState, useCallback } from "react";
import { message, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { formatFileName } from "@/lib/utils/fileName";
import { validateFileExtension } from "@/lib/utils/fileUtils";

interface UseFileUploadOptions {
  assignmentId: number;
  userId: number;
  existingAttachment?: {
    attachment_id: string | number;
    file_name: string;
  } | null;
  onProgress?: (progress: number, status: string) => void;
}

interface UploadResult {
  success: boolean;
  isUpdate: boolean;
  error?: string;
}

export function useFileUpload({ assignmentId, userId, existingAttachment, onProgress }: UseFileUploadOptions) {
  const uploadFile = useCallback(
    async (file: UploadFile, index: number, total: number): Promise<UploadResult> => {
      if (!file.originFileObj) {
        return { success: false, isUpdate: false, error: `File ${file.name} không hợp lệ` };
      }

      const formData = new FormData();
      const formattedFileName = formatFileName(file.name || "file");
      formData.append("file", file.originFileObj, formattedFileName);

      const hasExistingAttachment = existingAttachment && existingAttachment.attachment_id;
      const isUpdate = hasExistingAttachment && index === 0;

      if (isUpdate && existingAttachment) {
        // Update existing attachment
        const attachmentIdValue = existingAttachment.attachment_id;
        const attachmentIdStr = String(attachmentIdValue).trim();

        if (!attachmentIdStr || attachmentIdStr === "" || attachmentIdStr === "undefined" || attachmentIdStr === "null") {
          // Fallback to create new
          formData.append("assignment_id", String(assignmentId));
          return await createNewAttachment(formData, file, userId, index, total, onProgress);
        }

        const attachmentId = Number(attachmentIdStr);
        if (isNaN(attachmentId) || attachmentId <= 0) {
          // Fallback to create new
          formData.append("assignment_id", String(assignmentId));
          return await createNewAttachment(formData, file, userId, index, total, onProgress);
        }

        onProgress?.(30 + Math.floor((index / total) * 70), `Đang cập nhật file ${index + 1}/${total}: ${file.name}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000);

        try {
          const response = await fetch(`/api-proxy/assignment-attachments/${attachmentIdStr}?userId=${userId}`, {
            method: "PATCH",
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new Error(errorData);
          }

          return { success: true, isUpdate: true };
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === "AbortError") {
            throw new Error(`Request timeout: Không thể cập nhật file ${file.name} sau 5 phút.`);
          }
          throw error;
        }
      } else {
        // Create new attachment
        formData.append("assignment_id", String(assignmentId));
        return await createNewAttachment(formData, file, userId, index, total, onProgress);
      }
    },
    [assignmentId, userId, existingAttachment, onProgress]
  );

  return { uploadFile };
}

async function createNewAttachment(
  formData: FormData,
  file: UploadFile,
  userId: number,
  index: number,
  total: number,
  onProgress?: (progress: number, status: string) => void
): Promise<UploadResult> {
  onProgress?.(30 + Math.floor((index / total) * 70), `Đang upload file ${index + 1}/${total}: ${file.name}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch(`/api-proxy/assignment-attachments?userId=${userId}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw new Error(errorData);
    }

    return { success: true, isUpdate: false };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
    }
    throw error;
  }
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      return (
        errorData?.message ||
        errorData?.error ||
        errorData?.detail ||
        errorData?.error_message ||
        `HTTP ${response.status}: ${response.statusText}`
      );
    } else {
      const errorText = await response.text();
      return errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

export function useFileHandlers() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = useCallback((info: Parameters<NonNullable<UploadProps["onChange"]>>[0]) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(newFileList);
  }, []) as UploadProps["onChange"];

  const handleRemoveFile = useCallback((file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  }, []);

  const beforeUpload = useCallback((file: File) => {
    if (!validateFileExtension(file.name)) {
      message.error("Chỉ chấp nhận file: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar, jpg, jpeg, png, gif!");
      return Upload.LIST_IGNORE;
    }
    return true;
  }, []);

  return {
    fileList,
    setFileList,
    handleUpload,
    handleRemoveFile,
    beforeUpload,
  };
}

