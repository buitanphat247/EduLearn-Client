"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Upload, message, Skeleton, Empty } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { getAssignmentById, type AssignmentDetailResponse } from "@/lib/api/assignments";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";

const { Dragger } = Upload;

export default function ExerciseSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const exerciseId = params.exerciseId as string;

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentDetailResponse | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch assignment detail
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!exerciseId) return;
      setLoading(true);
      try {
        const numericExerciseId = typeof exerciseId === "string" ? Number(exerciseId) : exerciseId;
        if (isNaN(numericExerciseId)) {
          message.error("ID bài tập không hợp lệ");
          return;
        }
        const data = await getAssignmentById(numericExerciseId);
        setAssignment(data);
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thông tin bài tập");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [exerciseId]);

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Không có hạn nộp";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return <FileTextOutlined className="text-2xl text-gray-700" />;
  };

  // Handle file remove
  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  // Upload props
  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    onRemove: handleRemove,
    beforeUpload: () => false, // Prevent auto upload
    maxCount: 10,
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn ít nhất một file để nộp");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Implement actual submission API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      message.success("Nộp bài tập thành công!");
      router.push(`/user/classes/${classId}`);
    } catch (error: any) {
      message.error(error?.message || "Không thể nộp bài tập");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/user/classes/${classId}`);
  };

  if (loading) {
    return <DataLoadingSplash tip="ĐANG TẢI DỮ LIỆU..." />;
  }

  if (!assignment) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Empty description="Không tìm thấy bài tập" />
        <Button onClick={handleBack} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(assignment.due_at);
  const dueDateFormatted = formatDate(assignment.due_at);
  
  // Calculate exact overdue status by comparing timestamps
  const isOverdueWarning = assignment.due_at ? new Date(assignment.due_at).getTime() < new Date().getTime() : false;

  return (
    <div className="mx-auto">
      {/* Back Button */}
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mb-4">
        Quay lại
      </Button>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Deadline Card */}
        <Card className="border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <CalendarOutlined className="text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Hạn chót</p>
              <p className="text-gray-900 text-lg font-bold leading-none">{dueDateFormatted}</p>
              {daysRemaining !== null && (
                <p className={`text-xs font-bold mt-1 ${daysRemaining > 0 ? "text-amber-600" : "text-red-600"}`}>
                  {daysRemaining > 0 ? `Còn lại ${daysRemaining} ngày` : "Đã quá hạn"}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Weight Card */}
        <Card className="border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChartOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Trọng số</p>
              <p className="text-gray-900 text-lg font-bold leading-none">40% điểm tổng</p>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircleOutlined className="text-gray-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Trạng thái</p>
              <p className="text-gray-400 text-lg font-bold leading-none italic">Chưa nộp bài</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Instructions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">Hướng dẫn chi tiết</h2>
          <div className="h-px flex-1 bg-gray-200 ml-2"></div>
        </div>
        <Card className="border border-gray-200 rounded-xl">
          <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
            {assignment.description ? <div dangerouslySetInnerHTML={{ __html: assignment.description }} /> : <p>Không có hướng dẫn chi tiết.</p>}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="font-semibold mb-2">File đính kèm:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {assignment.attachments.map((attachment) => (
                    <li key={String(attachment.attachment_id)}>{attachment.file_name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Submission Zone */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">Khu vực nộp bài</h2>
          <div className="h-px flex-1 bg-gray-200 ml-2"></div>
        </div>

        {/* Overdue Warning */}
        {isOverdueWarning && (
           <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
               <ExclamationCircleOutlined className="text-2xl" />
             </div>
             <h3 className="text-lg font-bold text-red-800 mb-2">Đã hết hạn nộp bài</h3>
             <p className="text-red-600 max-w-lg mx-auto">
               Bài tập này đã quá hạn nộp vào lúc <span className="font-semibold">{dueDateFormatted}</span>. 
               Bạn không thể nộp bài được nữa. Vui lòng liên hệ giáo viên nếu cần hỗ trợ.
             </p>
           </div>
        )}

        {/* Dragger - Only show when no files and NOT Overdue */}
        {fileList.length === 0 && !isOverdueWarning && (
          <Dragger {...uploadProps} className=" hover:border-blue-500 rounded-xl bg-gray-50/50">
            <p className="ant-upload-drag-icon flex justify-center mb-4">
              <CloudUploadOutlined className="text-blue-600 text-5xl" />
            </p>
            <p className="ant-upload-text text-lg font-semibold text-gray-900 mb-2">
              <span className="text-blue-600">Nhấn để tải lên</span> <span className="text-gray-900">hoặc kéo thả tệp vào đây</span>
            </p>
            <p className="ant-upload-hint text-sm text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, JPEG, PNG, GIF</p>
          </Dragger>
        )}

        {/* File List - Show when files are uploaded */}
        {fileList.length > 0 && (
          <div className="space-y-3 mb-4">
            {fileList.map((file) => (
              <div
                key={file.uid}
                className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="shrink-0">{getFileIcon(file.name || "")}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size ? formatFileSize(file.size) : "0 Bytes"}</p>
                </div>
                {!isOverdueWarning && (
                  <button onClick={() => handleRemove(file)} className="shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <DeleteOutlined className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isOverdueWarning && (
          <>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">.pdf</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">.docx</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">.zip</span>
                <span className="ml-2 text-xs text-gray-400 italic">Tối đa 50MB</span>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button
                  size="middle"
                  className="flex-1 md:flex-none font-black uppercase tracking-widest"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={fileList.length === 0}
                >
                  Nộp bài
                </Button>
              </div>
            </div>

            {/* Empty State Message */}
            {fileList.length === 0 && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <InfoCircleOutlined className="text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Bạn chưa chọn tệp nào. Nút "Nộp bài" sẽ được kích hoạt sau khi bạn tải tệp lên.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
