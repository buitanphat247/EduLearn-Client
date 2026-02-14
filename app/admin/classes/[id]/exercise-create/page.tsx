"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import apiClient from "@/app/config/api";
import { getApiBaseUrl } from "@/app/config/api-base-url";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Input, Upload, Form, DatePicker, Modal, Spin, Select } from "antd";
import CustomCard from "@/app/components/common/CustomCard";
import dynamic from "next/dynamic";
import type { Editor } from "@/app/components/common/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/app/components/common/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg border border-gray-200" />
});
import { useUserId } from "@/app/hooks/useUserId";
import { formatFileName } from "@/lib/utils/fileName";
import {
  ArrowLeftOutlined,
  PaperClipOutlined,
  CloudUploadOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";

export default function ExerciseCreatePage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const { userId } = useUserId();
  const [form] = Form.useForm();
  const classId = params?.id as string;

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);
  const editorRef = useRef<Editor | null>(null);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
    // Delay một chút để đảm bảo editor đã render xong
    setTimeout(() => {
      setEditorLoading(false);
    }, 100);
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      // Validate form
      const description = editorRef.current?.getHTML() || "";
      const plainText = editorRef.current?.getText() || "";

      if (!values.title || values.title.trim() === "") {
        message.error("Vui lòng nhập tiêu đề bài tập");
        return;
      }

      if (!description || plainText.trim() === "") {
        message.error("Vui lòng nhập mô tả chi tiết");
        return;
      }

      // Validate userId
      if (!userId) {
        message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      const numericClassId = typeof classId === "string" ? Number(classId) : classId;

      if (isNaN(numericClassId)) {
        message.error("ID lớp học không hợp lệ");
        return;
      }

      setSubmitting(true);
      setShowProgressModal(true);
      setUploadProgress(0);
      setUploadStatus("Đang tạo bài tập...");

      // Format dueDate
      let dueAt: string | undefined = undefined;
      if (values.dueDate) {
        try {
          const dateValue = dayjs.isDayjs(values.dueDate) ? values.dueDate : dayjs(values.dueDate);
          if (dateValue && dateValue.isValid()) {
            dueAt = dateValue.toISOString();
          }
        } catch (error) {
          // Continue without dueDate if formatting fails
        }
      }

      // Step 1: Create assignment
      const assignmentData = {
        class_id: numericClassId,
        title: values.title.trim(),
        description: description,
        due_at: dueAt,
        status: values.status || 'published',
      };

      // Use apiClient instead of fetch
      const createResponse = await apiClient.post(`/assignments?userId=${numericUserId}`, assignmentData);
      setUploadProgress(30);
      setUploadStatus("Đã tạo bài tập. Đang upload file đính kèm...");

      const assignmentResult = createResponse.data;

      // Try different possible field names
      const assignmentId = assignmentResult?.assignment_id || assignmentResult?.id || assignmentResult?.data?.assignment_id;

      if (!assignmentId) {
        throw new Error("Không nhận được ID bài tập từ server. Vui lòng kiểm tra lại response.");
      }


      // Step 2: Upload files directly to backend
      if (fileList.length > 0) {
        const totalFiles = fileList.length;
        let uploadedCount = 0;

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          if (!file.originFileObj) {
            continue;
          }

          try {
            const formData = new FormData();
            const formattedFileName = formatFileName(file.name || "file");
            formData.append("file", file.originFileObj, formattedFileName);
            formData.append("assignment_id", String(assignmentId));

            setUploadStatus(`Đang upload file ${i + 1}/${totalFiles}: ${file.name}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000);

            let uploadResponse: Response;
            try {
              uploadResponse = await fetch(`${getApiBaseUrl()}/assignment-attachments?userId=${numericUserId}`, {
                method: "POST",
                body: formData,
                signal: controller.signal,
                credentials: "include",
              });
              clearTimeout(timeoutId);
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === "AbortError") {
                throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
              }
              throw fetchError;
            }

            if (!uploadResponse.ok) {
              let errorMessage = "Lỗi không xác định";
              const status = uploadResponse.status;

              try {
                const contentType = uploadResponse.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  const errorData = await uploadResponse.json();
                  errorMessage =
                    errorData?.message ||
                    errorData?.error ||
                    errorData?.detail ||
                    errorData?.error_message ||
                    `HTTP ${status}: ${uploadResponse.statusText}`;
                } else {
                  const errorText = await uploadResponse.text();
                  errorMessage = errorText || `HTTP ${status}: ${uploadResponse.statusText}`;
                }
              } catch (parseError) {
                errorMessage = `HTTP ${status}: ${uploadResponse.statusText}`;
              }

              if (status === 500) {
                errorMessage = `Lỗi server (500): ${errorMessage}. Vui lòng thử lại sau hoặc liên hệ quản trị viên.`;
              } else if (status === 400) {
                errorMessage = `Dữ liệu không hợp lệ (400): ${errorMessage}`;
              } else if (status === 413) {
                errorMessage = `File quá lớn (413): ${errorMessage}`;
              }

              throw new Error(`Không thể upload file ${file.name}: ${errorMessage}`);
            }

            uploadedCount++;
            const progress = 30 + Math.floor((uploadedCount / totalFiles) * 70);
            setUploadProgress(progress);
          } catch (error: any) {
            // Handle network errors
            let errorMessage = error?.message || "Lỗi không xác định";
            if (
              error.message?.includes("Failed to fetch") ||
              error.message?.includes("NetworkError") ||
              error.name === "TypeError"
            ) {
              errorMessage = `Lỗi kết nối: Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại. File: ${file.name}`;
            }
            message.error(`Không thể upload file ${file.name}: ${errorMessage}`);
            // Continue with next file instead of throwing
          }
        }

        if (uploadedCount > 0) {
          setUploadStatus(`Đã upload thành công ${uploadedCount}/${totalFiles} file`);
        }
      } else {
        setUploadProgress(100);
      }

      setUploadStatus("Hoàn tất!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      message.success("Tạo bài tập thành công!");
      setShowProgressModal(false);
      router.push(`/admin/classes/${classId}?refresh=exercises`);
    } catch (error: any) {
      setShowProgressModal(false);
      message.error(error?.message || "Không thể tạo bài tập");
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  const handleCancel = () => {
    router.push(`/admin/classes/${classId}`);
  };

  const handleUpload: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];

    // Limit to 10MB
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
    // Supported file types based on API documentation
    const validExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".rar", ".jpg", ".jpeg", ".png", ".gif"];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      message.error("Chỉ chấp nhận file: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar, jpg, jpeg, png, gif!");
      return Upload.LIST_IGNORE;
    }

    // File size validation removed - backend will handle size limits
    // Allow files of any size to be uploaded
    return true;
  };

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
    if (fileType.includes("image") || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <FileImageOutlined className="text-green-500 text-xl" />;
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

  // Fallback: Check if editor is ready after a delay
  useEffect(() => {
    if (editorLoading) {
      const timer = setTimeout(() => {
        if (editorRef.current) {
          setEditorLoading(false);
        } else {
          // If still not ready after 3 seconds, show anyway to prevent infinite loading
          setEditorLoading(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [editorLoading]);

  if (editorLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 gap-4">
        <Spin size="large" />
        <p className="text-gray-500 font-medium">Đang tải trình soạn thảo...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-start">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            className="border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors"
          >
            Quay lại
          </Button>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark="optional">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <CustomCard padding="lg">
                <div className="space-y-6">
                  {/* Title */}
                  <Form.Item
                    name="title"
                    label={
                      <span className="text-sm font-semibold text-gray-700">
                        Tiêu đề bài tập <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài tập" }]}
                    className="mb-6"
                  >
                    <Input
                      placeholder="VD: Bài tập về nhà Chương 1: Đại số"
                      className="py-2.5 px-3 text-base border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                  </Form.Item>

                  {/* Description - Rich Text Editor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Mô tả chi tiết <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {editorLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                          <Spin size="large" tip="Đang tải trình soạn thảo..." />
                        </div>
                      )}
                      <RichTextEditor placeholder="Nhập nội dung mô tả bài tập tại đây..." minHeight="300px" onEditorReady={handleEditorReady} />
                    </div>
                  </div>
                </div>
              </CustomCard>

              {/* Attachments Card */}
              <CustomCard
                title={
                  <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
                    <PaperClipOutlined /> Tệp đính kèm
                    {fileList.length > 0 && <span className="text-sm font-normal text-gray-500 ml-2">({fileList.length} tệp)</span>}
                  </div>
                }
                padding="md"
              >
                {/* File List */}
                {fileList.length > 0 && (
                  <div className="space-y-3">
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
                          onClick={() => handleRemoveFile(file)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area - chỉ hiển thị khi chưa có file */}
                {fileList.length === 0 && (
                  <Upload.Dragger
                    fileList={[]}
                    onChange={handleUpload}
                    beforeUpload={beforeUpload}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                    className="transition-all group"
                    showUploadList={false}
                  >
                    <div className="p-4">
                      <p className="ant-upload-drag-icon mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        <CloudUploadOutlined className="text-5xl! text-blue-500/80!" />
                      </p>
                      <p className="ant-upload-text text-base font-medium text-gray-700 mb-1">
                        <span className="text-blue-600">Nhấn để tải lên</span> hoặc kéo thả tệp vào đây
                      </p>
                      <p className="ant-upload-hint text-gray-400">
                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, JPEG, PNG, GIF
                      </p>
                    </div>
                  </Upload.Dragger>
                )}
              </CustomCard>
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-1 space-y-6">
              <CustomCard title={<span className="text-base font-bold text-gray-800">Cài đặt bài tập</span>} padding="md" className="sticky top-6">
                <div className="space-y-5">
                  {/* Status */}
                  <Form.Item
                    name="status"
                    label={<span className="font-medium text-gray-700">Trạng thái</span>}
                    initialValue="published"
                    className="mb-0"
                  >
                    <Select
                      size="large"
                      options={[
                        { value: 'published', label: 'Công khai' },
                        { value: 'draft', label: 'Nháp' },
                        { value: 'closed', label: 'Đóng' },
                      ]}
                    />
                  </Form.Item>

                  {/* Due Date */}
                  <Form.Item
                    name="dueDate"
                    label={<span className="font-medium text-gray-700">Hạn nộp</span>}
                    className="mb-0"
                    help={<span className="text-xs text-gray-400">Để trống nếu không có hạn nộp</span>}
                  >
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY, HH:mm"
                      placeholder="mm/dd/yyyy, --:--"
                      className="w-full py-2"
                      size="large"
                      disabledDate={(current) => {
                        if (!current) return false;
                        try {
                          const today = dayjs().startOf("day");
                          return current.isBefore(today);
                        } catch (error) {
                          return false;
                        }
                      }}
                    />
                  </Form.Item>

                  {/* Teacher Note */}
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                    <div className="flex gap-3">
                      <InfoCircleOutlined className="text-blue-500 text-lg shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-semibold text-blue-800 mb-1">Lưu ý giáo viên</p>
                        Học sinh sẽ nhận được thông báo ngay khi bài tập được tạo.
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                      onClick={handleCancel}
                      size="large"
                      className="min-w-[100px] border-gray-300 hover:border-gray-400 hover:text-gray-700 rounded-lg font-medium"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={submitting}
                      size="large"
                      className="min-w-[120px] bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg border-none rounded-lg font-medium"
                    >
                      Lưu bài tập
                    </Button>
                  </div>
                </div>
              </CustomCard>
            </div>
          </div>
        </Form>

        {/* Loading Modal */}
        <Modal open={showProgressModal} closable={false} maskClosable={false} footer={null} title="Đang tạo bài tập..." centered>
          <div className="flex flex-col items-center justify-center space-y-5 py-8">
            <div>
              <Spin size="large" />
            </div>
            <div>
              <p className="text-center text-gray-600 text-base font-medium">{uploadStatus || "Đang xử lý..."}</p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
