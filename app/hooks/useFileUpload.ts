import { useState, useCallback } from "react";
import { message, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { getApiBaseUrl } from "@/app/config/api-base-url";
import { formatFileName } from "@/lib/utils/fileName";
import { validateFileExtension } from "@/lib/utils/fileUtils";

/**
 * Options for useFileUpload hook
 * @interface UseFileUploadOptions
 */
interface UseFileUploadOptions {
  /** Assignment ID to attach the file to */
  assignmentId: number;
  /** User ID uploading the file */
  userId: number;
  /** Existing attachment to update (if any) */
  existingAttachment?: {
    attachment_id: string | number;
    file_name: string;
  } | null;
  /** Progress callback function */
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Upload result
 * @interface UploadResult
 */
interface UploadResult {
  /** Whether upload was successful */
  success: boolean;
  /** Whether this was an update (true) or new upload (false) */
  isUpdate: boolean;
  /** Error message if upload failed */
  error?: string;
}

/**
 * Hook for handling file uploads to assignments
 * @param {UseFileUploadOptions} options - Upload configuration options
 * @returns {Object} Object containing uploadFile function
 * @returns {Function} returns.uploadFile - Function to upload a file
 * 
 * @description
 * Handles file uploads with support for:
 * - Creating new attachments
 * - Updating existing attachments
 * - Progress tracking
 * - Error handling with timeout (5 minutes)
 * 
 * @example
 * ```typescript
 * const { uploadFile } = useFileUpload({
 *   assignmentId: 123,
 *   userId: 456,
 *   existingAttachment: { attachment_id: 789, file_name: 'old.pdf' },
 *   onProgress: (progress, status) => console.log(`${progress}%: ${status}`)
 * });
 * 
 * const result = await uploadFile(file, 0, 1);
 * if (result.success) {
 *   console.log('Upload successful!');
 * }
 * ```
 */
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

        // ✅ Fix: Race condition - Add isMounted check và proper cleanup
        let timeoutId: NodeJS.Timeout | null = null;
        let isMounted = true;
        
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 300000);

        try {
          const response = await fetch(`${getApiBaseUrl()}/assignment-attachments/${attachmentIdStr}?userId=${userId}`, {
            method: "PATCH",
            body: formData,
            signal: controller.signal,
            credentials: "include",
          });
          
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (!isMounted) {
            throw new Error("Component unmounted");
          }

          if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new Error(errorData);
          }

          return { success: true, isUpdate: true };
        } catch (error: any) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (error.name === "AbortError") {
            throw new Error(`Request timeout: Không thể cập nhật file ${file.name} sau 5 phút.`);
          }
          throw error;
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
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

  // ✅ Fix: Race condition - Add proper cleanup
  let timeoutId: NodeJS.Timeout | null = null;
  
  const controller = new AbortController();
  timeoutId = setTimeout(() => {
    controller.abort();
  }, 300000);

  try {
    const response = await fetch(`${getApiBaseUrl()}/assignment-attachments?userId=${userId}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      credentials: "include",
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw new Error(errorData);
    }

    return { success: true, isUpdate: false };
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (error.name === "AbortError") {
      throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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

/**
 * Hook for managing file list state and handlers for Ant Design Upload component
 * @returns {Object} Object containing file list state and handlers
 * @returns {UploadFile[]} returns.fileList - Current list of files
 * @returns {Function} returns.setFileList - Function to update file list
 * @returns {Function} returns.handleUpload - Upload change handler
 * @returns {Function} returns.handleRemoveFile - File removal handler
 * @returns {Function} returns.beforeUpload - File validation before upload
 * 
 * @example
 * ```typescript
 * const { fileList, handleUpload, beforeUpload } = useFileHandlers();
 * 
 * <Upload
 *   fileList={fileList}
 *   onChange={handleUpload}
 *   beforeUpload={beforeUpload}
 * />
 * ```
 */
/**
 * Hook for managing file list state and handlers
 * @returns {{
 *   fileList: UploadFile[],
 *   setFileList: (files: UploadFile[]) => void,
 *   handleUpload: UploadProps["onChange"],
 *   handleRemoveFile: (file: UploadFile) => void,
 *   beforeUpload: (file: File) => boolean | typeof Upload.LIST_IGNORE
 * }} File handlers and state
 * @description Provides file list management with validation and upload handlers
 * 
 * @example
 * ```typescript
 * const { fileList, handleUpload, beforeUpload } = useFileHandlers();
 * 
 * <Upload
 *   fileList={fileList}
 *   onChange={handleUpload}
 *   beforeUpload={beforeUpload}
 * />
 * ```
 */
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

