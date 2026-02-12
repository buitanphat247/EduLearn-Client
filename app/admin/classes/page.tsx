"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { App } from "antd";
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

  // Fetch classes - stable callback
  const fetchClasses = useCallback(async () => {
    if (userIdLoading || !userId) return;



    try {
      setLoading(true);

      const result = await getClassesByUser({
        userId: userId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery || undefined,
      });

      const mappedClasses: ClassItem[] = result.classes.map(mapClassData);



      setClasses(mappedClasses);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (error: any) {
      messageRef.current.error(error?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
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

  // Memoize pagination config
  const paginationConfig = useMemo(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    onChange: handleTableChange,
  }), [pagination.current, pagination.pageSize, pagination.total, handleTableChange]);

  return (
    <div className="space-y-3">
      <ClassesHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleOpenCreateModal}
      />

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
