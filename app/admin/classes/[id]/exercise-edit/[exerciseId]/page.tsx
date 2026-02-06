"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Input, Form, DatePicker, Skeleton } from "antd";
import CustomCard from "@/app/components/common/CustomCard";
import dynamic from "next/dynamic";
import type { Editor } from "@/app/components/common/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/app/components/common/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg border border-gray-200" />
});
import FileUploadSection from "@/app/components/exercises/FileUploadSection";
import ProgressModal from "@/app/components/exercises/ProgressModal";
import { useUserId } from "@/app/hooks/useUserId";
import { getAssignmentById, updateAssignment } from "@/lib/api/assignments";
import { formatFileName } from "@/lib/utils/fileName";
import { useFileHandlers } from "@/app/hooks/useFileUpload";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export default function ExerciseEditPage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const { userId } = useUserId();
  const [form] = Form.useForm();
  const classId = params?.id as string;
  const exerciseId = params?.exerciseId as string;

  // Early validation - redirect if IDs are missing
  useEffect(() => {
    if (!classId || classId === "undefined" || !exerciseId || exerciseId === "undefined") {
      message.error("Thông tin không hợp lệ");
      router.push("/admin/classes");
    }
  }, [classId, exerciseId, message, router]);

  const { fileList, handleUpload, handleRemoveFile, beforeUpload } = useFileHandlers();
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorLoading, setEditorLoading] = useState(true);
  const [editorContent, setEditorContent] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  // Memoize numeric IDs
  const numericExerciseId = useMemo(() => {
    const id = typeof exerciseId === "string" ? Number(exerciseId) : exerciseId;
    return isNaN(id) ? null : id;
  }, [exerciseId]);


  // Get existing attachment for update
  const existingAttachment = useMemo(() => {
    return existingAttachments.length > 0 ? existingAttachments[0] : null;
  }, [existingAttachments]);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setTimeout(() => {
      setEditorLoading(false);
    }, 100);
  }, []);

  // Update editor content when editorContent changes and editor is ready
  useEffect(() => {
    if (editorRef.current && editorContent && !loading && !editorLoading) {
      const currentContent = editorRef.current.getHTML();
      if (currentContent !== editorContent) {
        editorRef.current.commands.setContent(editorContent);
      }
    }
  }, [editorContent, loading, editorLoading]);

  // Load assignment data
  useEffect(() => {
    const loadAssignment = async () => {
      if (!numericExerciseId) {
        message.error("ID bài tập không hợp lệ");
        if (classId && classId !== "undefined") {
          router.push(`/admin/classes/${classId}`);
        } else {
          router.push("/admin/classes");
        }
        return;
      }

      try {
        setLoading(true);
        const assignment = await getAssignmentById(numericExerciseId);

        // Set form values
        form.setFieldsValue({
          title: assignment.title,
          dueDate: assignment.due_at ? dayjs(assignment.due_at) : null,
        });

        // Set editor content
        if (assignment.description) {
          setEditorContent(assignment.description);
        }

        // Set existing attachments
        if (assignment.attachments && assignment.attachments.length > 0) {
          const validAttachments = assignment.attachments.filter(
            (att: any) => att.attachment_id !== undefined && att.attachment_id !== null && att.attachment_id !== ""
          );
          setExistingAttachments(validAttachments);
        }
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thông tin bài tập");
        router.push(`/admin/classes/${classId}`);
      } finally {
        setLoading(false);
        setEditorLoading(false);
      }
    };

    if (numericExerciseId && classId && classId !== "undefined" && exerciseId && exerciseId !== "undefined") {
      loadAssignment();
    } else if (!classId || classId === "undefined" || !exerciseId || exerciseId === "undefined") {
      // Redirect if IDs are invalid
      router.push("/admin/classes");
    }
  }, [numericExerciseId, classId, exerciseId, form, message, router]);

  const handleSubmit = useCallback(
    async (values: any) => {
      if (!numericExerciseId) {
        message.error("ID bài tập không hợp lệ");
        return;
      }

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
      if (isNaN(numericUserId)) {
        message.error("User ID không hợp lệ");
        return;
      }

      setSubmitting(true);
      setShowProgressModal(true);
      setUploadProgress(0);
      setUploadStatus("Đang cập nhật bài tập...");

      try {
        // Format dueDate
        let dueAt: string | null = null;
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

        // Step 1: Update assignment
        const updateData = {
          title: values.title.trim(),
          description: description,
          due_at: dueAt,
        };

        await updateAssignment(numericExerciseId, updateData);
        setUploadProgress(30);
        setUploadStatus("Đã cập nhật bài tập. Đang cập nhật file đính kèm...");

        // Step 2: Update or create attachments sequentially
        if (fileList.length > 0) {
          const totalFiles = fileList.length;
          let processedCount = 0;
          let updatedCount = 0;
          let createdCount = 0;

          // Use file upload logic directly
          for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (!file.originFileObj) {
              continue;
            }

            try {
              const formData = new FormData();
              const formattedFileName = formatFileName(file.name || "file");
              formData.append("file", file.originFileObj, formattedFileName);

              const hasExistingAttachment = existingAttachment && existingAttachment.attachment_id;
              const isUpdate = hasExistingAttachment && i === 0;

              let uploadResponse: Response;

              if (isUpdate && existingAttachment) {
                // Update existing attachment
                const attachmentIdValue = existingAttachment.attachment_id;
                const attachmentIdStr = String(attachmentIdValue).trim();

                if (!attachmentIdStr || attachmentIdStr === "" || attachmentIdStr === "undefined" || attachmentIdStr === "null") {
                  // Fallback to create new
                  formData.append("assignment_id", String(numericExerciseId));
                  setUploadStatus(`Đang upload file ${i + 1}/${totalFiles}: ${file.name}`);

                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 300000);

                  try {
                    uploadResponse = await fetch(`/api-proxy/assignment-attachments?userId=${numericUserId}`, {
                      method: "POST",
                      body: formData,
                      signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                  } catch (fetchError: any) {
                    clearTimeout(timeoutId);
                    if (fetchError.name === "AbortError") {
                      throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
                    }
                    throw fetchError;
                  }
                  createdCount++;
                } else {
                  const attachmentId = Number(attachmentIdStr);
                  if (isNaN(attachmentId) || attachmentId <= 0) {
                    // Fallback to create new
                    formData.append("assignment_id", String(numericExerciseId));
                    setUploadStatus(`Đang upload file ${i + 1}/${totalFiles}: ${file.name}`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 300000);

                    try {
                      uploadResponse = await fetch(`/api-proxy/assignment-attachments?userId=${numericUserId}`, {
                        method: "POST",
                        body: formData,
                        signal: controller.signal,
                      });
                      clearTimeout(timeoutId);
                    } catch (fetchError: any) {
                      clearTimeout(timeoutId);
                      if (fetchError.name === "AbortError") {
                        throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
                      }
                      throw fetchError;
                    }
                    createdCount++;
                  } else {
                    setUploadStatus(`Đang cập nhật file ${i + 1}/${totalFiles}: ${file.name} (thay thế ${existingAttachment.file_name})`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 300000);

                    try {
                      uploadResponse = await fetch(`/api-proxy/assignment-attachments/${attachmentIdStr}?userId=${numericUserId}`, {
                        method: "PATCH",
                        body: formData,
                        signal: controller.signal,
                      });
                      clearTimeout(timeoutId);
                    } catch (fetchError: any) {
                      clearTimeout(timeoutId);
                      if (fetchError.name === "AbortError") {
                        throw new Error(`Request timeout: Không thể cập nhật file ${file.name} sau 5 phút.`);
                      }
                      throw fetchError;
                    }
                    updatedCount++;
                  }
                }
              } else {
                // Create new attachment
                formData.append("assignment_id", String(numericExerciseId));
                setUploadStatus(`Đang upload file ${i + 1}/${totalFiles}: ${file.name}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 300000);

                try {
                  uploadResponse = await fetch(`/api-proxy/assignment-attachments?userId=${numericUserId}`, {
                    method: "POST",
                    body: formData,
                    signal: controller.signal,
                  });
                  clearTimeout(timeoutId);
                } catch (fetchError: any) {
                  clearTimeout(timeoutId);
                  if (fetchError.name === "AbortError") {
                    throw new Error(`Request timeout: Không thể upload file ${file.name} sau 5 phút.`);
                  }
                  throw fetchError;
                }
                createdCount++;
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
                } else if (status === 404) {
                  errorMessage = `Không tìm thấy file đính kèm (404): ${errorMessage}`;
                }

                throw new Error(`Không thể ${updatedCount > 0 || (existingAttachment && i === 0) ? "cập nhật" : "upload"} file ${file.name}: ${errorMessage}`);
              }

              processedCount++;
              const progress = 30 + Math.floor((processedCount / totalFiles) * 70);
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
              throw new Error(`Không thể ${existingAttachment && i === 0 ? "cập nhật" : "upload"} file ${file.name}: ${errorMessage}`);
            }
          }

          // Build status message
          let statusMessage = "";
          if (updatedCount > 0 && createdCount > 0) {
            statusMessage = `Đã cập nhật ${updatedCount} file và upload ${createdCount} file mới`;
          } else if (updatedCount > 0) {
            statusMessage = `Đã cập nhật thành công ${updatedCount} file`;
          } else {
            statusMessage = `Đã upload thành công ${createdCount} file mới`;
          }
          setUploadStatus(statusMessage);
        } else {
          setUploadProgress(100);
        }

        setUploadStatus("Hoàn tất!");
        await new Promise((resolve) => setTimeout(resolve, 500));

        message.success("Cập nhật bài tập thành công!");
        setShowProgressModal(false);
        if (classId && classId !== "undefined") {
          router.push(`/admin/classes/${classId}?refresh=exercises`);
        } else {
          router.push("/admin/classes");
        }
      } catch (error: any) {
        setShowProgressModal(false);
        const errorMessage = error?.message || error?.toString() || "Không thể cập nhật bài tập";
        message.error(errorMessage);

        if (process.env.NODE_ENV === "development") {
          console.error("Error updating exercise:", error);
        }
      } finally {
        setSubmitting(false);
        setUploadProgress(0);
        setUploadStatus("");
      }
    },
    [numericExerciseId, classId, fileList, existingAttachment, message, router, userId]
  );

  const handleCancel = useCallback(() => {
    if (classId && classId !== "undefined") {
      router.push(`/admin/classes/${classId}`);
    } else {
      router.push("/admin/classes");
    }
  }, [classId, router]);

  // Disable dates before today (allow only today and future)
  // Disable dates before today (allow only today and future)
  const disabledDate = useCallback((current: dayjs.Dayjs) => {
    // Can not select days before today
    return current && current.isBefore(dayjs(), 'day');
  }, []);

  // Disable past time if date is today
  const disabledTime = useCallback((current: dayjs.Dayjs | null) => {
    if (current && current.isSame(dayjs(), 'day')) {
      const now = dayjs();
      const currentHour = now.hour();
      const currentMinute = now.minute();

      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter((h) => h < currentHour),
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === currentHour) {
            return Array.from({ length: 60 }, (_, i) => i).filter((m) => m < currentMinute);
          }
          return [];
        },
        disabledSeconds: () => [],
      };
    }
    return {};
  }, []);



  if (loading || editorLoading) {
    return (
      <div className="bg-gray-50/50 min-h-screen">
        <div className="mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="w-24">
            <Skeleton.Button active size="default" block />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton.Input active size="small" style={{ width: 150 }} />
                    <Skeleton.Input active size="large" block />
                  </div>
                  <div className="space-y-2">
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                    <Skeleton active paragraph={{ rows: 8 }} title={false} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-6">
                <div className="space-y-5">
                  <Skeleton.Input active size="small" style={{ width: '40%' }} />
                  <Skeleton.Input active size="large" block />
                  <Skeleton.Button active size="large" block style={{ height: 80 }} />
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Skeleton.Button active size="large" style={{ width: 100 }} />
                    <Skeleton.Button active size="large" style={{ width: 120 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark="optional"
          // Prevent form from submitting to page route - use client-side handler only
          onFinishFailed={() => {
            // Form validation failed - handled by Ant Design
          }}
        >
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
                        <div className="mb-4">
                          <Skeleton active paragraph={{ rows: 6 }} />
                        </div>
                      )}
                      <RichTextEditor
                        placeholder="Nhập nội dung mô tả bài tập tại đây..."
                        minHeight="300px"
                        content={editorContent}
                        onEditorReady={handleEditorReady}
                        onChange={(html) => {
                          setEditorContent(html);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CustomCard>

              {/* Attachments Card */}
              <FileUploadSection
                fileList={fileList}
                existingAttachments={existingAttachments}
                onFileChange={handleUpload}
                onRemoveFile={handleRemoveFile}
                beforeUpload={beforeUpload}
              />
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-1 space-y-6">
              <CustomCard title={<span className="text-base font-bold text-gray-800">Cài đặt bài tập</span>} padding="md" className="sticky top-6">
                <div className="space-y-5">
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
                      disabledDate={disabledDate}
                      disabledTime={disabledTime}
                    />
                  </Form.Item>

                  {/* Teacher Note */}
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50">
                    <div className="flex gap-3">
                      <InfoCircleOutlined className="text-blue-500 text-lg shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-semibold text-blue-800 mb-1">Lưu ý giáo viên</p>
                        Học sinh sẽ nhận được thông báo khi bài tập được cập nhật.
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
                      Cập nhật
                    </Button>
                  </div>
                </div>
              </CustomCard>
            </div>
          </div>
        </Form>

        {/* Progress Modal */}
        <ProgressModal
          open={showProgressModal}
          status={uploadStatus}
          title={uploadProgress < 100 ? "Đang cập nhật bài tập..." : "Hoàn tất!"}
        />
      </div>
    </div>
  );
}
