"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Upload, Spin, Tag, Modal, Descriptions } from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import CustomCard from "@/app/components/common/CustomCard";
import { getAssignmentById, getAssignmentStudents, type AssignmentDetailResponse } from "@/lib/api/assignments";
import { getClassById } from "@/lib/api/classes";
import {
  createSubmission,
  getSubmissions,
  createSubmissionAttachment,
  deleteSubmissionAttachment,
  type StudentSubmission,
} from "@/lib/api/submissions";
import { getUserIdFromCookie, getUserIdFromCookieAsync } from "@/lib/utils/cookies";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function SubmitExercisePage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;
  const exerciseId = params?.exerciseId as string;

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentDetailResponse | null>(null);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [gradingInfo, setGradingInfo] = useState<{ status: string; score: number | null } | null>(null);
  const [classInfo, setClassInfo] = useState<any | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // Helper: Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper: Get file icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FilePdfOutlined className="text-red-500 text-xl" />;
    if (["doc", "docx"].includes(ext || "")) return <FileWordOutlined className="text-blue-500 text-xl" />;
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return <FileImageOutlined className="text-green-500 text-xl" />;
    return <FileOutlined className="text-gray-500 text-xl" />;
  };

  // Effect to clear state when switching exercises
  useEffect(() => {
    setAssignment(null);
    setSubmission(null);
    setFileList([]);
    setTempFiles([]);
    setIsOverdue(false);
  }, [exerciseId]);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let userId: string | number | null = getUserIdFromCookie();

      if (!userId) {
        try {
          userId = await getUserIdFromCookieAsync();
        } catch (e) {
          console.error("Async user fetch failed:", e);
        }
      }

      if (!userId) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      // Parallel fetching for performance
      const [assignmentData, submissionsData, assignmentStudentData, classData] = await Promise.all([
        getAssignmentById(exerciseId),
        getSubmissions({
          assignmentId: Number(exerciseId),
          studentId: Number(userId),
          classId: Number(classId),
        }),
        getAssignmentStudents({
          assignmentId: Number(exerciseId),
          classId: Number(classId),
          limit: 100, // Get all to find current user
        }),
        getClassById(classId, Number(userId))
      ]);

      if (classData) setClassInfo(classData);

      // Find grading info for current student
      const myGradingRecord = assignmentStudentData.data.find(
        (record) => Number(record.student_id) === Number(userId)
      );
      if (myGradingRecord) {
        setGradingInfo({
          status: myGradingRecord.status,
          score: myGradingRecord.score,
        });
      }

      setAssignment(assignmentData);

      // Check due date
      if (assignmentData.due_at) {
        setIsOverdue(dayjs().isAfter(dayjs(assignmentData.due_at)));
      }

      if (submissionsData.data && submissionsData.data.length > 0) {
        const existSubmission = submissionsData.data[0];
        setSubmission(existSubmission);

        // Map existing attachments to fileList
        if (existSubmission.attachments) {
          setFileList(
            existSubmission.attachments.map((att) => ({
              uid: String(att.id),
              name: att.file_name,
              status: "done",
              url: att.file_url,
              size: att.file_size,
            }))
          );
        }
      }

      if (isRefresh) {
        message.success("Đã cập nhật kết quả mới nhất");
      }
    } catch (error: any) {
      console.error(error);
      message.error("Không thể tải thông tin bài tập");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [exerciseId, classId, message]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket logic removed as per request


  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    if (!submission) {
      message.warning("Vui lòng nhấn 'Nộp bài' trước khi tải thêm file.");
      onError(new Error("No submission"));
      return;
    }

    try {
      setUploadLoading(true);
      let userId: string | number | null = getUserIdFromCookie();
      if (!userId) {
        userId = await getUserIdFromCookieAsync();
      }

      // Upload file
      await createSubmissionAttachment(submission.submission_id, file);

      // Refresh submission data to get latest attachments and status
      const [updatedSubmissionData, updatedGradingData] = await Promise.all([
        getSubmissions({
          assignmentId: Number(exerciseId),
          studentId: Number(userId),
          classId: Number(classId),
        }),
        getAssignmentStudents({
          assignmentId: Number(exerciseId),
          classId: Number(classId),
          limit: 100,
        }),
      ]);

      // Update submission state
      if (updatedSubmissionData.data && updatedSubmissionData.data.length > 0) {
        const latestSubmission = updatedSubmissionData.data[0];
        setSubmission(latestSubmission);

        // Update file list
        if (latestSubmission.attachments) {
          setFileList(
            latestSubmission.attachments.map((att) => ({
              uid: String(att.id),
              name: att.file_name,
              status: "done",
              url: att.file_url,
              size: att.file_size,
            }))
          );
        }
      }

      // Update grading info
      const myGradingRecord = updatedGradingData.data.find(
        (record) => Number(record.student_id) === Number(userId)
      );
      if (myGradingRecord) {
        setGradingInfo({
          status: myGradingRecord.status,
          score: myGradingRecord.score,
        });
      }

      onSuccess("Ok");
      message.success(`Đã tải lên ${file.name}`);
    } catch (error: any) {
      message.error(error.message);
      onError(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemove = async (file: UploadFile) => {
    if (!submission) return;
    try {
      if (isOverdue) {
        message.warning("Đã quá hạn nộp bài, không thể xóa file.");
        return false;
      }

      let userId: string | number | null = getUserIdFromCookie();
      if (!userId) {
        userId = await getUserIdFromCookieAsync();
      }

      await deleteSubmissionAttachment(Number(file.uid));

      // Refresh submission data and grading info after deletion
      const [updatedSubmissionData, updatedGradingData] = await Promise.all([
        getSubmissions({
          assignmentId: Number(exerciseId),
          studentId: Number(userId),
          classId: Number(classId),
        }),
        getAssignmentStudents({
          assignmentId: Number(exerciseId),
          classId: Number(classId),
          limit: 100,
        }),
      ]);

      // Update submission state
      if (updatedSubmissionData.data && updatedSubmissionData.data.length > 0) {
        const latestSubmission = updatedSubmissionData.data[0];
        setSubmission(latestSubmission);

        // Update file list
        if (latestSubmission.attachments) {
          setFileList(
            latestSubmission.attachments.map((att) => ({
              uid: String(att.id),
              name: att.file_name,
              status: "done",
              url: att.file_url,
              size: att.file_size,
            }))
          );
        } else {
          setFileList([]);
        }
      }

      // Update grading info
      const myGradingRecord = updatedGradingData.data.find(
        (record) => Number(record.student_id) === Number(userId)
      );
      if (myGradingRecord) {
        setGradingInfo({
          status: myGradingRecord.status,
          score: myGradingRecord.score,
        });
      }

      message.success("Đã xóa file");
      return true;
    } catch (error: any) {
      message.error("Không thể xóa file");
      return false;
    }
  };

  // Logic for initial submit with files
  const [tempFiles, setTempFiles] = useState<File[]>([]);

  const onSubmitInitial = async () => {
    if (tempFiles.length === 0) {
      message.warning("Vui lòng đính kèm bài làm.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadLoading(true);
      let userId: string | number | null = getUserIdFromCookie();

      if (!userId) {
        try {
          userId = await getUserIdFromCookieAsync();
        } catch (e) { }
      }

      // 1. Create Submission
      const newSubmission = await createSubmission({
        assignment_id: Number(exerciseId),
        class_id: Number(classId),
        student_id: Number(userId),
        note: "",
      });

      setSubmission(newSubmission);

      // 2. Upload Files (Single File Mode)
      if (tempFiles.length > 0) {
        const file = tempFiles[0];
        try {
          await createSubmissionAttachment(newSubmission.submission_id, file);
        } catch (e) {
          console.error("Upload error", e);
          message.error(`Lỗi tải file ${file.name}`);
        }

        // Refresh to get attachments with IDs and grading info
        const [updatedSubmission, updatedGradingData] = await Promise.all([
          getSubmissions({
            assignmentId: Number(exerciseId),
            studentId: Number(userId),
            classId: Number(classId)
          }),
          getAssignmentStudents({
            assignmentId: Number(exerciseId),
            classId: Number(classId),
            limit: 100,
          }),
        ]);

        if (updatedSubmission.data[0]) {
          setSubmission(updatedSubmission.data[0]);
          if (updatedSubmission.data[0].attachments) {
            setFileList(
              updatedSubmission.data[0].attachments.map((att) => ({
                uid: String(att.id),
                name: att.file_name,
                status: "done",
                url: att.file_url,
                size: att.file_size,
              }))
            );
          }
        }

        // Update grading info
        const myGradingRecord = updatedGradingData.data.find(
          (record) => Number(record.student_id) === Number(userId)
        );
        if (myGradingRecord) {
          setGradingInfo({
            status: myGradingRecord.status,
            score: myGradingRecord.score,
          });
        }
      } else {
        // Even without files, refresh grading info
        const updatedGradingData = await getAssignmentStudents({
          assignmentId: Number(exerciseId),
          classId: Number(classId),
          limit: 100,
        });

        const myGradingRecord = updatedGradingData.data.find(
          (record) => Number(record.student_id) === Number(userId)
        );
        if (myGradingRecord) {
          setGradingInfo({
            status: myGradingRecord.status,
            score: myGradingRecord.score,
          });
        }
      }

      setTempFiles([]);
      message.success("Nộp bài thành công!");
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
      setUploadLoading(false);
    }
  };



  const [uploadLoading, setUploadLoading] = useState(false);

  // Add confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadFile | null>(null);

  const handleDeleteClick = (file: UploadFile) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (fileToDelete) {
      await handleRemove(fileToDelete);
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  // Skeleton Loading UI
  if (loading) return (
    <div className="h-full bg-gray-50/50">
      <div className="mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="min-h-[400px] bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-100 h-64 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!assignment) return <div className="p-8 text-center text-gray-500">Bài tập không tồn tại</div>;

  // Allow edit if not overdue AND not already graded
  const isGraded = gradingInfo?.status === 'graded';
  const canEdit = !isOverdue && !isGraded;

  return (
    <div className="h-full bg-gray-50/50 ">
      <div className="mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="border-none bg-white shadow-sm hover:bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            Quay lại
          </Button>
          <Button
            type="dashed"
            icon={<SyncOutlined spin={refreshing} />}
            onClick={() => fetchData(true)}
            className="text-gray-500 border-gray-300 hover:text-blue-600 hover:border-blue-500"
          >
            Làm mới
          </Button>
        </div>

        {/* Info Card */}
        <CustomCard
          title={
            <div className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              <span>Thông tin bài tập</span>
            </div>
          }
          bodyClassName="py-6"
        >
          <Descriptions column={2} bordered layout="horizontal">
            <Descriptions.Item label="Tên bài tập" span={1}>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{assignment.title}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Lớp học" span={1}>
              <span className="font-medium text-gray-700 dark:text-gray-300">{classInfo?.name || "..."}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Hạn nộp" span={1}>
              <span className="flex items-center gap-2">
                <ClockCircleOutlined className="text-orange-500" />
                <span className="font-medium dark:text-gray-200">
                  {assignment.due_at ? dayjs(assignment.due_at).format("HH:mm - DD/MM/YYYY") : "Không có thời hạn"}
                </span>
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <div className="flex items-center gap-2">
                <Tag color={(!assignment.due_at || dayjs().isBefore(dayjs(assignment.due_at))) ? "processing" : "error"}>
                  {(!assignment.due_at || dayjs().isBefore(dayjs(assignment.due_at))) ? "Đang mở" : "Đã hết hạn"}
                </Tag>
                {gradingInfo && (
                  <Tag color={gradingInfo.status === 'graded' ? "success" : gradingInfo.status === 'submitted' ? "processing" : "warning"}>
                    {gradingInfo.status === 'graded' ? 'Đã chấm điểm' : gradingInfo.status === 'submitted' ? 'Đã nộp bài' : 'Chưa nộp'}
                  </Tag>
                )}
              </div>
            </Descriptions.Item>
            {submission && (
              <Descriptions.Item label="Thời gian nộp" span={2}>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {dayjs(submission.submitted_at).format("HH:mm - DD/MM/YYYY")}
                  {assignment.due_at && dayjs(submission.submitted_at).isAfter(dayjs(assignment.due_at)) && (
                    <Tag color="error" className="ml-2">Nộp muộn</Tag>
                  )}
                </span>
              </Descriptions.Item>
            )}
          </Descriptions>
        </CustomCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-6">
          {/* Left Col: Exercise Content */}
          <div className="lg:col-span-2 space-y-6">
            <CustomCard padding="lg">
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-800">Nội dung bài tập</h2>

                {/* Description */}
                <div
                  className="prose prose-sm max-w-none prose-blue text-gray-700 bg-gray-50/50 p-6 rounded-xl border border-gray-100"
                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                />

                {/* Teacher Attachments */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-600">File đính kèm từ giáo viên:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {assignment.attachments.map(att => (
                        <a
                          key={att.attachment_id}
                          href={`https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev/${att.file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          {getFileIcon(att.file_name)}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate text-sm group-hover:text-blue-600 transition-colors">{att.file_name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatFileSize(typeof att.file_size === 'string' ? parseInt(att.file_size) : att.file_size)}
                            </div>
                          </div>
                          <CloudUploadOutlined className="text-blue-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CustomCard>
          </div>

          {/* Right Col: Submission Box */}
          <div className="lg:col-span-1 space-y-6">
            <CustomCard
              title={<div className="font-bold text-gray-800 flex items-center gap-2"><CheckCircleOutlined className="text-blue-600" /> Bài làm của bạn</div>}
              padding="md"
              className="sticky top-6 border-t-4 border-t-blue-500"
            >
              <div className="space-y-6">
                {/* Status */}
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 font-medium">Trạng thái:</span>
                  {gradingInfo?.status === 'submitted' || gradingInfo?.status === 'graded' ? (
                    <Tag color="success" className="font-bold border-0 bg-green-100 text-green-700 m-0">
                      {gradingInfo.status === 'graded' ? 'Đã chấm điểm' : 'Đã nộp bài'}
                    </Tag>
                  ) : (
                    <Tag color="warning" className="font-bold border-0 bg-orange-100 text-orange-700 m-0">Chưa nộp</Tag>
                  )}
                </div>

                {/* Grading Status Display */}
                {gradingInfo?.status === 'submitted' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <ClockCircleOutlined className="text-2xl text-blue-500" />
                    <div>
                      <div className="font-semibold text-blue-700">Đang chờ chấm điểm</div>
                      <div className="text-xs text-blue-500">Giáo viên sẽ chấm điểm bài của bạn sớm</div>
                    </div>
                  </div>
                )}

                {gradingInfo && gradingInfo.status === 'graded' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircleOutlined className="text-2xl text-green-500" />
                        <div>
                          <div className="font-semibold text-green-700">Đã chấm điểm</div>
                          <div className="text-xs text-green-500">Giáo viên đã đánh giá bài của bạn</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          {gradingInfo.score !== undefined && gradingInfo.score !== null ? gradingInfo.score : "--"}
                        </div>
                        <div className="text-xs text-green-500">/10 điểm</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission Area */}
                {!submission ? (
                  // Initial Submit UI
                  <div className="space-y-4">


                    <label className="block text-sm font-semibold text-gray-700 mb-2">Đính kèm bài làm:</label>
                    <div className="space-y-3">
                      {tempFiles.length === 0 ? (
                        <Upload.Dragger
                          beforeUpload={(file) => {
                            setTempFiles([file]); // Replace current file, effectively single file mode
                            return false;
                          }}
                          fileList={[]}
                          showUploadList={false}
                          multiple={false} // Single file only
                          className="bg-white hover:border-blue-500 transition-colors"
                          disabled={isOverdue}
                          style={{ padding: '20px 0', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}
                        >
                          <p className="ant-upload-drag-icon mb-2">
                            <UploadOutlined className="text-blue-600 text-3xl" />
                          </p>
                          <p className="ant-upload-text text-sm font-medium text-gray-600">Nhấn hoặc kéo thả file</p>
                        </Upload.Dragger>
                      ) : (
                        /* Single Custom File Card */
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group relative">
                          {getFileIcon(tempFiles[0].name)}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate text-sm">{tempFiles[0].name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatFileSize(tempFiles[0].size)}
                            </div>
                          </div>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => setTempFiles([])}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      className="bg-blue-600 hover:bg-blue-700 shadow-lg h-12 font-bold text-lg"
                      onClick={onSubmitInitial}
                      loading={submitting}
                      disabled={isOverdue}
                    >
                      {isOverdue ? "Đã quá hạn nộp" : "Nộp bài"}
                    </Button>
                    {isOverdue && <p className="text-center text-red-500 text-sm">Hạn nộp: {dayjs(assignment.due_at).format("HH:mm DD/MM/YYYY")}</p>}
                  </div>
                ) : (
                  // Submitted UI - Edit Mode
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">File đã nộp:</label>
                      {fileList.length > 0 ? (
                        <div className="space-y-2">
                          {fileList.map(file => (
                            <div key={file.uid} className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                              {getFileIcon(file.name)}
                              <a href={file.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-sm font-medium text-blue-700 hover:underline">
                                {file.name}
                              </a>
                              {canEdit && (
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteClick(file)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Chưa có file đính kèm</p>
                      )}
                    </div>



                    {/* Add more files */}
                    {canEdit && (
                      <div className="pt-4 border-t border-gray-100">
                        <Upload
                          customRequest={handleUpload}
                          showUploadList={false}
                          multiple
                        >
                          <Button icon={<UploadOutlined />} block className="border-dashed border-blue-400 text-blue-600 hover:bg-blue-50">
                            Thêm file khác
                          </Button>
                        </Upload>
                      </div>
                    )}

                    {!canEdit && (
                      <div className={`p-3 rounded-lg text-sm text-center ${isGraded ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {isGraded
                          ? 'Bài tập đã được chấm điểm. Không thể chỉnh sửa.'
                          : 'Đã hết hạn nộp bài. Không thể chỉnh sửa.'}
                      </div>
                    )}

                    <div className="text-xs text-center text-gray-400">
                      Nộp lúc: {dayjs(submission.submitted_at).format("HH:mm - DD/MM/YYYY")}
                    </div>
                  </div>
                )}


              </div>
            </CustomCard>
          </div>
        </div>
      </div>
      {/* Upload Loading Modal */}
      <Modal
        open={uploadLoading}
        footer={null}
        closable={false}
        centered
        width={300}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <Spin size="large" />
          <div className="text-gray-600 font-medium h-[16px] text-[16px]">Đang tải file lên...</div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa file"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn có chắc chắn muốn xóa file <strong>{fileToDelete?.name}</strong> không?</p>
      </Modal>
    </div>
  );
}
