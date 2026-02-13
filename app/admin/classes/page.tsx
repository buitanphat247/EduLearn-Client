"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { App, Button, Input } from "antd";
import { ReloadOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import ClassesHeader from "@/app/components/classes/ClassesHeader";
import ClassesTable from "@/app/components/classes/ClassesTable";
import CreateClassModal from "@/app/components/classes/CreateClassModal";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import { getClassesByUser, deleteClass, getClassById, type ClassResponse, type ClassDetailResponse } from "@/lib/api/classes";
import { deleteRagTestsByClass } from "@/lib/api/rag-exams";
import type { ClassItem } from "@/interface/classes";
import { CLASS_STATUS_MAP } from "@/lib/utils/classUtils";

import { useUserId } from "@/app/hooks/useUserId";

export default function AdminClasses() {
  const { message, modal } = App.useApp();
  const { userId, loading: userIdLoading } = useUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [originalClassData, setOriginalClassData] = useState<ClassDetailResponse | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Stable message ref to avoid dependency issues
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Request tracking để tránh race condition
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map API response to component format - stable
  const mapClassData = useCallback((apiClass: ClassResponse): ClassItem => ({
    key: String(apiClass.class_id),
    name: apiClass.name,
    code: apiClass.code,
    students: apiClass.student_count,
    teacher: apiClass.creator?.fullname || apiClass.creator?.username || "Chưa có",
    status: apiClass.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive,
  }), []);

  // Fetch classes - stable callback với race condition protection
  const fetchClasses = useCallback(async () => {
    if (userIdLoading || !userId || !isMountedRef.current) return;

    // Cancel previous request nếu đang chạy
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo AbortController mới cho request này
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Tăng request ID để track latest request
    const currentRequestId = ++requestIdRef.current;

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const result = await getClassesByUser({
        userId: userId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery || undefined,
      });

      // Check if request was aborted hoặc component unmounted
      if (abortController.signal.aborted || !isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return;
      }

      const mappedClasses: ClassItem[] = result.classes.map(mapClassData);

      // Chỉ update state nếu đây là latest request và component vẫn mounted
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        setClasses(mappedClasses);
        setPagination((prev) => ({ ...prev, total: result.total }));
      }
    } catch (error: any) {
      // Ignore AbortError (expected khi cancel)
      if (error?.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        messageRef.current.error(error?.message || "Không thể tải danh sách lớp học");
      }
    } finally {
      // Chỉ update loading nếu đây là latest request
      if (isMountedRef.current && currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
      
      // Cleanup AbortController nếu đây là latest request
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [userId, userIdLoading, pagination.current, pagination.pageSize, debouncedSearchQuery, mapClassData]);

  // Fetch classes on mount and when dependencies change
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Error display for missing userId
  useEffect(() => {
    if (!userIdLoading && !userId) {
      messageRef.current.error("Không tìm thấy thông tin người dùng");
    }
  }, [userId, userIdLoading]);

  // Stable handlers
  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    fetchClasses();
  }, [fetchClasses]);

  const handleEdit = useCallback(async (classItem: ClassItem) => {
    if (!userId) {
      messageRef.current.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      const classDetail = await getClassById(classItem.key, numericUserId);
      setOriginalClassData(classDetail);
      setSelectedClass(classItem);
      setIsEditModalOpen(true);
    } catch (error: any) {
      messageRef.current.error(error?.message || "Không thể tải thông tin lớp học");
    }
  }, [userId]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
    setOriginalClassData(null);
  }, []);

  const handleEditSuccess = useCallback((updatedName: string) => {
    setIsEditModalOpen(false);
    setClasses((prev) => prev.map((c) =>
      c.key === selectedClass?.key ? { ...c, name: updatedName } : c
    ));
    setSelectedClass(null);
    setOriginalClassData(null);
  }, [selectedClass?.key]);

  const handleDelete = useCallback((classItem: ClassItem) => {
    modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học "${classItem.name}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteRagTestsByClass(classItem.key);
          await deleteClass(classItem.key);
          messageRef.current.success(`Đã xóa lớp học "${classItem.name}" thành công`);

          // Optimistic update
          setClasses((prev) => prev.filter((c) => c.key !== classItem.key));
          setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        } catch (error: any) {
          messageRef.current.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  }, [modal]);

  const handleFastRefresh = useCallback(() => {
    const hide = messageRef.current.loading("Đang làm mới danh sách lớp học...", 0);
    fetchClasses().finally(() => {
      hide();
      messageRef.current.success("Đã cập nhật danh sách lớp học mới nhất");
    });
  }, [fetchClasses]);

  // Memoize pagination config
  const paginationConfig = useMemo(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    onChange: handleTableChange,
  }), [pagination.current, pagination.pageSize, pagination.total, handleTableChange]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm lớp học hoặc mã code... (Ctrl+K)"
          size="middle"
          className="flex-1 min-w-[200px] dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
        <Button
          type="default"
          icon={<ReloadOutlined spin={loading} />}
          size="middle"
          onClick={handleFastRefresh}
          disabled={loading}
          className="shadow-sm"
          title="Làm mới danh sách"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="middle"
          className="shadow-sm"
          onClick={handleOpenCreateModal}
        >
          Thêm lớp học
        </Button>
      </div>

      <CreateClassModal
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {originalClassData && selectedClass && (
        <UpdateClassModal
          open={isEditModalOpen}
          classId={selectedClass.key}
          currentName={selectedClass.name}
          currentCode={selectedClass.code}
          currentStudentCount={selectedClass.students}
          currentStatus={originalClassData.status}
          onCancel={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm">
        <ClassesTable
          data={classes}
          loading={loading}
          pagination={paginationConfig}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
