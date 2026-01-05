"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { App, Spin, Input, Button, Tag, Dropdown, Pagination, Empty, Modal } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined, FileOutlined, CalendarOutlined } from "@ant-design/icons";
import { IoBookOutline } from "react-icons/io5";
import { getAssignmentsByClass, getAssignmentById, deleteAssignment, type AssignmentResponse, type AssignmentDetailResponse } from "@/lib/api/assignments";
import type { ClassExercisesTabProps, Exercise } from "./types";

const ClassExercisesTab = memo(function ClassExercisesTab({
  classId,
  searchQuery,
  onSearchChange,
  currentPage,
  pageSize,
  onPageChange,
  readOnly = false,
}: ClassExercisesTabProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDetailResponse | null>(null);
  const [assignmentsMap, setAssignmentsMap] = useState<Map<string, AssignmentResponse>>(new Map());
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      onPageChange(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onPageChange]);

  // Map API response to Exercise format
  const mapAssignmentToExercise = useCallback((assignment: AssignmentResponse): Exercise => {
    // Format due date
    let dueDate = "Không có hạn nộp";
    let dueTime = "";

    if (assignment.due_at) {
      const dueDateObj = new Date(assignment.due_at);
      const now = new Date();
      const isToday = dueDateObj.toDateString() === now.toDateString();

      if (isToday) {
        dueDate = "Hôm nay";
      } else {
        dueDate = dueDateObj.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      dueTime = dueDateObj.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Determine status based on due date
    let status: "open" | "closed" | "completed" = "open";
    if (assignment.due_at) {
      const dueDateObj = new Date(assignment.due_at);
      const now = new Date();
      if (dueDateObj < now) {
        status = "closed";
      }
    }

    // Default values for fields not in API (not displayed anymore)
    const submitted = 0;
    const total = 0;
    const graded = 0;

    // Default subject styling (can be enhanced later)
    const subject = "Bài tập";
    const subjectColor = "bg-blue-100 text-blue-700";
    const iconColor = "bg-blue-500";

    return {
      id: String(assignment.assignment_id),
      title: assignment.title,
      subject,
      subjectColor,
      iconColor,
      dueDate,
      dueTime,
      submitted,
      total,
      graded,
      status,
      classCode: assignment.class?.code || "",
      className: assignment.class?.name || "",
      creatorName: assignment.creator?.fullname || "",
    };
  }, []);

  // Fetch assignments from API
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const numericClassId = typeof classId === "string" ? Number(classId) : classId;

      if (isNaN(numericClassId)) {
        message.error("ID lớp học không hợp lệ");
        setExercises([]);
        setTotal(0);
        return;
      }

      const result = await getAssignmentsByClass(numericClassId, {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
      });

      const mappedExercises = result.data.map(mapAssignmentToExercise);
      setExercises(mappedExercises);
      setTotal(result.total);

      // Store assignments map for detail modal
      const newMap = new Map<string, AssignmentResponse>();
      result.data.forEach((assignment) => {
        newMap.set(String(assignment.assignment_id), assignment);
      });
      setAssignmentsMap(newMap);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách bài tập");
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [classId, currentPage, pageSize, debouncedSearchQuery, mapAssignmentToExercise, message]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const currentExercises = exercises;

  const getStatusTag = useCallback((exercise: Exercise) => {
    if (exercise.status === "closed") {
      return { text: "Đã đóng", color: "red" };
    }
    return { text: "Đang mở", color: "green" };
  }, []);

  const handleCreateExercise = () => {
    router.push(`/admin/classes/${classId}/exercise-create`);
  };

  const getMenuItems = useCallback(
    (exercise: Exercise): MenuProps["items"] => {
      const items: MenuProps["items"] = [
        {
          key: "view",
          label: "Xem chi tiết",
        },
      ];

      // Only show edit/delete actions if not readOnly
      if (!readOnly) {
        items.push(
          {
            key: "edit",
            label: "Chỉnh sửa",
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa",
            danger: true,
          }
        );
      }

      return items;
    },
    [readOnly]
  );

  const handleViewDetail = useCallback(
    async (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setIsDetailModalOpen(true);
      setLoadingDetail(true);

      try {
        const numericAssignmentId = typeof exercise.id === "string" ? Number(exercise.id) : exercise.id;
        if (isNaN(numericAssignmentId)) {
          message.error("ID bài tập không hợp lệ");
          setLoadingDetail(false);
          return;
        }

        const assignmentDetail = await getAssignmentById(numericAssignmentId);
        setSelectedAssignment(assignmentDetail);
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thông tin chi tiết bài tập");
        setIsDetailModalOpen(false);
        setSelectedExercise(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [message]
  );

  const handleDelete = useCallback(
    (exercise: Exercise) => {
      Modal.confirm({
        title: "Xác nhận xóa bài tập",
        content: `Bạn có chắc chắn muốn xóa bài tập "${exercise.title}"? Hành động này không thể hoàn tác.`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            setDeletingId(exercise.id);
            const numericAssignmentId = typeof exercise.id === "string" ? Number(exercise.id) : exercise.id;

            if (isNaN(numericAssignmentId)) {
              throw new Error("ID bài tập không hợp lệ");
            }

            await deleteAssignment(numericAssignmentId);
            message.success("Xóa bài tập thành công");

            // Refresh list
            await fetchAssignments();

            // If deleted exercise was selected, close modal
            if (selectedExercise?.id === exercise.id) {
              setIsDetailModalOpen(false);
              setSelectedExercise(null);
              setSelectedAssignment(null);
            }
          } catch (error: any) {
            message.error(error?.message || "Không thể xóa bài tập");
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [message, fetchAssignments, selectedExercise]
  );

  const handleMenuClick = useCallback(
    (key: string, exercise: Exercise) => {
      switch (key) {
        case "view":
          handleViewDetail(exercise);
          break;
        case "edit":
          router.push(`/admin/classes/${classId}/exercise-edit/${exercise.id}`);
          break;
        case "delete":
          handleDelete(exercise);
          break;
      }
    },
    [message, handleDelete, handleViewDetail]
  );

  const handleDownloadFiles = useCallback(async () => {
    if (!selectedAssignment || !selectedAssignment.attachments || selectedAssignment.attachments.length === 0) {
      message.warning("Bài tập này không có file đính kèm");
      return;
    }

    // Base URL for file storage
    const baseUrl = "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev";

    // Download each attachment
    for (const attachment of selectedAssignment.attachments) {
      try {
        // Remove leading slash if present and combine with base URL
        const filePath = attachment.file_url.startsWith("/") ? attachment.file_url.slice(1) : attachment.file_url;
        const fileUrl = `${baseUrl}/${filePath}`;

        // Fetch file as blob
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Không thể tải file: ${attachment.file_name}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
      } catch (error: any) {
        message.error(`Không thể tải file ${attachment.file_name}: ${error?.message || "Lỗi không xác định"}`);
      }
    }

    message.success(`Đã tải ${selectedAssignment.attachments.length} file`);
  }, [selectedAssignment, message]);

  return (
    <div className="space-y-4">
      {/* Header with Search and Create Button */}
      <div className="flex items-center gap-4">
        <Input
          size="middle"
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm bài tập..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPageChange(1);
          }}
          className="flex-1"
          allowClear
        />
        {!readOnly && (
          <Button size="middle" icon={<PlusOutlined />} onClick={handleCreateExercise} className="bg-blue-600 hover:bg-blue-700">
            Tạo bài tập mới
          </Button>
        )}
      </div>

      {/* Exercises List */}
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentExercises.length > 0 ? (
            currentExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative ${
                  deletingId === exercise.id ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => handleViewDetail(exercise)}
              >
                <div className="flex flex-col h-full">
                  {/* Header with Icon, Tag and Menu */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${exercise.iconColor} w-14 h-14 rounded-lg flex items-center justify-center shrink-0 shadow-md`}>
                        <IoBookOutline className="text-white text-3xl" />
                      </div>
                      <div className={`${exercise.subjectColor} border-0 font-semibold capitalize text-md px-2.5 py-1 rounded-lg shadow-sm`}>
                        {exercise.subject}
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {readOnly ? (
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          className="shrink-0 text-gray-500 hover:text-gray-700"
                          onClick={() => handleViewDetail(exercise)}
                        />
                      ) : (
                        <Dropdown
                          menu={{
                            items: getMenuItems(exercise),
                            onClick: ({ key }) => {
                              handleMenuClick(key, exercise);
                            },
                          }}
                          trigger={["click"]}
                        >
                          <Button type="text" icon={<MoreOutlined />} className="shrink-0 text-gray-500 hover:text-gray-700" />
                        </Dropdown>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="font-semibold text-gray-800 text-lg line-clamp-2 leading-tight">{exercise.title}</h3>
                    
                    {/* Class Info */}
                    {(exercise.className || exercise.classCode) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {exercise.className && <span className="font-medium text-gray-600">{exercise.className}</span>}
                        {exercise.classCode && (
                          <>
                            {exercise.className && <span>•</span>}
                            <span className="text-gray-500">Mã: {exercise.classCode}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Creator */}
                    {exercise.creatorName && (
                      <div className="text-xs text-gray-500">
                        Người tạo: <span className="text-gray-700 font-medium">{exercise.creatorName}</span>
                      </div>
                    )}

                    {/* Due Date */}
                    <div className="text-sm text-gray-600">
                      Hạn nộp: <span className="text-gray-800 font-semibold">{exercise.dueDate}</span>
                      {exercise.dueTime && <span className="text-gray-800 font-semibold"> - {exercise.dueTime}</span>}
                    </div>

                 
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <Empty description={searchQuery ? "Không tìm thấy bài tập nào" : "Chưa có bài tập nào"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </div>
      </Spin>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, total)} của {total} kết quả
          </div>
          <Pagination current={currentPage} total={total} pageSize={pageSize} onChange={onPageChange} showSizeChanger={false} />
        </div>
      )}

      {/* Exercise Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
              <IoBookOutline className="text-white text-xl" />
            </div>
            <span className="text-lg font-semibold text-gray-800">Chi tiết bài tập</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedExercise(null);
          setSelectedAssignment(null);
          setLoadingDetail(false);
        }}
        footer={null}
        width={600}

        destroyOnClose={true}
      >
        <Spin spinning={loadingDetail}>
          {selectedExercise && (
            <div className="space-y-5">
              {/* Title with Status Tag */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-800 leading-tight flex-1">
                  {selectedAssignment?.title || selectedExercise.title}
                </h2>
                <Tag color={getStatusTag(selectedExercise).color} className="text-sm font-semibold shrink-0">
                  {getStatusTag(selectedExercise).text}
                </Tag>
              </div>

              {/* Due Date */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <CalendarOutlined className="text-blue-500 text-lg mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Hạn nộp</div>
                  <div className="text-sm font-medium text-gray-800">
                    {selectedExercise.dueDate}
                    {selectedExercise.dueTime && ` - ${selectedExercise.dueTime}`}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedAssignment?.description && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-2">Mô tả</div>
                  <div
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 prose prose-sm max-w-none text-gray-700 max-h-56 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedAssignment.description }}
                  />
                </div>
              )}

              {/* Attachments List */}
              {selectedAssignment?.attachments && selectedAssignment.attachments.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-2">File đính kèm ({selectedAssignment.attachments.length})</div>
                  <div className="space-y-2">
                    {selectedAssignment.attachments.map((attachment) => (
                      <div
                        key={String(attachment.attachment_id)}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <FileOutlined className="text-blue-500 text-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{attachment.file_name}</div>
                          <div className="text-xs text-gray-500">{(Number(attachment.file_size) / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="primary"
                  icon={<FileOutlined />}
                  onClick={handleDownloadFiles}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="large"
                  disabled={!selectedAssignment?.attachments || selectedAssignment.attachments.length === 0}
                >
                  Tải file{" "}
                  {selectedAssignment?.attachments && selectedAssignment.attachments.length > 0 && `(${selectedAssignment.attachments.length})`}
                </Button>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
});

export default ClassExercisesTab;
