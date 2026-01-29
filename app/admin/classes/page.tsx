"use client";

import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import ClassesHeader from "@/app/components/classes/ClassesHeader";
import ClassesTable from "@/app/components/classes/ClassesTable";
import CreateClassModal from "@/app/components/classes/CreateClassModal";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import { getClassesByUser, deleteClass, getClassById, type ClassResponse, type ClassDetailResponse } from "@/lib/api/classes";
import { deleteRagTestsByClass } from "@/lib/api/rag-exams";
import type { ClassItem } from "@/interface/classes";
import { ensureMinLoadingTime, CLASS_STATUS_MAP } from "@/lib/utils/classUtils";
import { classSocketClient } from "@/lib/socket/class-client";
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map API response to component format
  const mapClassData = useCallback((apiClass: ClassResponse): ClassItem => {
    return {
      key: String(apiClass.class_id),
      name: apiClass.name,
      code: apiClass.code,
      students: apiClass.student_count,
      teacher: apiClass.creator?.fullname || apiClass.creator?.username || "Chưa có",
      status: apiClass.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive,
    };
  }, []);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    // Đợi user_id decrypt xong
    if (userIdLoading || !userId) {
      return;
    }

    const startTime = Date.now();
    try {
      setLoading(true);

      const result = await getClassesByUser({
        userId: userId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery || undefined,
      });

      const mappedClasses: ClassItem[] = result.classes.map(mapClassData);

      // Ensure minimum loading time
      await ensureMinLoadingTime(startTime);

      setClasses(mappedClasses);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [userId, userIdLoading, pagination.current, pagination.pageSize, debouncedSearchQuery, message, mapClassData]);

  // Fetch classes on mount and when dependencies change
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Hiển thị lỗi nếu không có user_id sau khi đợi decrypt
  useEffect(() => {
    if (!userIdLoading && !userId) {
      message.error("Không tìm thấy thông tin người dùng");
    }
  }, [userId, userIdLoading, message]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (classes.length === 0) return;

    // Connect to socket
    classSocketClient.connect();

    // Lấy danh sách ID hiện tại
    const currentClassIds = classes.map((c) => c.key);

    // Join all class rooms for this admin
    currentClassIds.forEach((id) => {
      classSocketClient.joinClass(id);
    });

    // Listen for updates
    const unsubscribeUpdated = classSocketClient.on("class_updated", (data: any) => {
      setClasses((prev) => {
        const index = prev.findIndex((c) => Number(c.key) === Number(data.class_id));
        if (index === -1) return prev;

        const updatedList = [...prev];
        updatedList[index] = {
          ...updatedList[index],
          name: data.name,
          code: data.code,
          status: data.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive,
        };

        return updatedList;
      });
    });

    // Listen for student joined
    const unsubscribeJoined = classSocketClient.on("student_joined", (data: any) => {
      setClasses((prev) => {
        const index = prev.findIndex((c) => Number(c.key) === Number(data.class_id));
        if (index === -1) return prev;

        const updatedList = [...prev];
        updatedList[index] = {
          ...updatedList[index],
          students: updatedList[index].students + 1,
        };
        return updatedList;
      });
    });

    // Listen for student removed
    const unsubscribeRemoved = classSocketClient.on("student_removed", (data: any) => {
      setClasses((prev) => {
        const index = prev.findIndex((c) => Number(c.key) === Number(data.class_id));
        if (index === -1) return prev;

        const updatedList = [...prev];
        updatedList[index] = {
          ...updatedList[index],
          students: Math.max(0, updatedList[index].students - 1),
        };
        return updatedList;
      });
    });

    // Listen for student status updated (banned)
    const unsubscribeStatus = classSocketClient.on("student_status_updated", (data: any) => {
      if (data.status === "banned") {
        setClasses((prev) => {
          const index = prev.findIndex((c) => Number(c.key) === Number(data.class_id));
          if (index === -1) return prev;

          const updatedList = [...prev];
          updatedList[index] = {
            ...updatedList[index],
            students: Math.max(0, updatedList[index].students - 1),
          };
          return updatedList;
        });
      }
    });

    // Listen for class deleted
    const unsubscribeDeleted = classSocketClient.on("class_deleted", (data: any) => {
      setClasses((prev) => prev.filter((c) => Number(c.key) !== Number(data.class_id)));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

      if (data.deleted_by && userId && Number(data.deleted_by) !== Number(userId)) {
        message.info(`Lớp học "${data.name}" đã bị xóa`);
      }
    });

    return () => {
      currentClassIds.forEach((id) => {
        classSocketClient.leaveClass(id);
      });
      unsubscribeUpdated();
      unsubscribeJoined();
      unsubscribeRemoved();
      unsubscribeStatus();
      unsubscribeDeleted();
    };
  }, [JSON.stringify(classes.map((c) => c.key)), userId, message]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleEdit = async (classItem: ClassItem) => {
    if (!userId) {
      message.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      // Fetch class detail để lấy đầy đủ thông tin
      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      const classDetail = await getClassById(classItem.key, numericUserId);
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
          // 1. Xóa toàn bộ đề thi AI liên quan (Sequential cleanup)
          await deleteRagTestsByClass(classItem.key);

          // 2. Xóa lớp học
          await deleteClass(classItem.key);
          message.success(`Đã xóa lớp học "${classItem.name}" thành công`);
        } catch (error: any) {
          message.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  };

  return (
    <div className="space-y-3">
      <ClassesHeader searchValue={searchQuery} onSearchChange={setSearchQuery} onAddClick={() => setIsCreateModalOpen(true)} />

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
            setClasses((prev) => prev.map((c) => (c.key === selectedClass.key ? { ...c, name: updatedName } : c)));
            setSelectedClass(null);
            setOriginalClassData(null);
          }}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm">
        <ClassesTable
          data={classes}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handleTableChange,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
