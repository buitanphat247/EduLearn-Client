"use client";

import { useState, useEffect, useCallback } from "react";
import { App, Spin } from "antd";
import ClassesHeader from "@/app/components/classes/ClassesHeader";
import ClassesTable from "@/app/components/classes/ClassesTable";
import CreateClassModal from "@/app/components/classes/CreateClassModal";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import { getClasses, deleteClass, getClassById, type ClassResponse, type ClassDetailResponse } from "@/lib/api/classes";
import type { ClassItem } from "@/interface/classes";

export default function AdminClasses() {
  const { message, modal } = App.useApp();
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map API response to component format
  const mapClassData = (apiClass: ClassResponse): ClassItem => {
    return {
      key: String(apiClass.class_id),
      name: apiClass.name,
      code: apiClass.code,
      students: apiClass.student_count,
      teacher: apiClass.creator?.fullname || apiClass.creator?.username || "Chưa có",
      status: apiClass.status === "active" ? "Đang hoạt động" : "Tạm dừng",
    };
  };

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const result = await getClasses({
        page: pagination.current,
        limit: pagination.pageSize,
        name: debouncedSearchQuery || undefined,
      });

      const mappedClasses: ClassItem[] = result.classes.map(mapClassData);

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setClasses(mappedClasses);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (error: any) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      message.error(error?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchQuery, message]);

  // Fetch classes on mount and when dependencies change
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleEdit = async (classItem: ClassItem) => {
    try {
      // Fetch class detail để lấy đầy đủ thông tin
      const classDetail = await getClassById(classItem.key);
      setOriginalClassData(classDetail);
      setSelectedClass(classItem);
      setIsEditModalOpen(true);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải thông tin lớp học");
    }
  };

  const handleDelete = (classItem: ClassItem) => {
    modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học "${classItem.name}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteClass(classItem.key);
          message.success(`Đã xóa lớp học "${classItem.name}" thành công`);
          // Cập nhật UI trực tiếp
          setClasses((prev) => prev.filter((c) => c.key !== classItem.key));
          setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        } catch (error: any) {
          message.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  };

  return (
    <div className="space-y-3">
      <ClassesHeader 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setIsCreateModalOpen(true)}
      />

      <CreateClassModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchClasses();
        }}
      />

      {originalClassData && selectedClass && (
        <UpdateClassModal
          open={isEditModalOpen}
          classId={selectedClass.key}
          currentName={selectedClass.name}
          currentCode={selectedClass.code}
          currentStudentCount={selectedClass.students}
          currentStatus={originalClassData.status}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedClass(null);
            setOriginalClassData(null);
          }}
          onSuccess={(updatedName) => {
            setIsEditModalOpen(false);
            // Cập nhật state trực tiếp
            setClasses((prev) =>
              prev.map((c) =>
                c.key === selectedClass.key
                  ? { ...c, name: updatedName }
                  : c
              )
            );
            setSelectedClass(null);
            setOriginalClassData(null);
          }}
        />
      )}

      <Spin spinning={loading}>
        <ClassesTable 
          data={classes} 
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Spin>
    </div>
  );
}

