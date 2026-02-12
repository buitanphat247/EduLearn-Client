"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { App, Tabs, Skeleton } from "antd";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { FileTextOutlined, BellOutlined, UserOutlined, ExperimentOutlined } from "@ant-design/icons";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import ClassHeader from "@/app/components/classes/ClassHeader";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassStudentsTable from "@/app/components/classes/ClassStudentsTable";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import ClassExercisesTab from "@/app/components/classes/ClassExercisesTab";
import ClassNotificationsTab from "@/app/components/classes/ClassNotificationsTab";
import ClassExamsTab from "@/app/components/classes/ClassExamsTab";
import { useUserId } from "@/app/hooks/useUserId";
import {
  getClassById,
  removeStudentFromClass,
  deleteClass,
  updateClassStudentStatus,
  getClassStudentsByClass,
  type ClassDetailResponse,
  type ClassStudentRecord,
} from "@/lib/api/classes";
import { deleteRagTestsByClass } from "@/lib/api/rag-exams";
import type { StudentItem } from "@/interface/students";
import { CLASS_STATUS_MAP, formatStudentId } from "@/lib/utils/classUtils";


type ClassDataState = {
  id: string;
  name: string;
  code: string;
  students: number;
  status: "Đang hoạt động" | "Tạm dừng";
} | null;

export default function ClassDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { modal, message } = App.useApp();
  const { userId } = useUserId();
  const classId = params?.id as string;

  // Stable refs
  const classIdRef = useRef(classId);
  const classNameRef = useRef<string>("");
  const messageRef = useRef(message);

  // Update refs
  useEffect(() => {
    classIdRef.current = classId;
  }, [classId]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // State
  const [classData, setClassData] = useState<ClassDataState>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [originalClassData, setOriginalClassData] = useState<ClassDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState("students");

  // Tab-specific state
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exercisePage, setExercisePage] = useState(1);
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  const [notificationPage, setNotificationPage] = useState(1);
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examPage, setExamPage] = useState(1);

  // Refresh functions refs
  const exerciseRefreshRef = useRef<(() => void) | null>(null);
  const notificationRefreshRef = useRef<(() => void) | null>(null);
  const examRefreshRef = useRef<(() => void) | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Constants
  const exercisePageSize = 4;
  const notificationPageSize = 4;
  const examPageSize = 12;

  // Map ClassStudentRecord to StudentItem - stable
  const mapStudentRecordToItem = useCallback((record: ClassStudentRecord, className: string): StudentItem => {
    if (!record.student) {
      throw new Error("Student data is missing in record");
    }

    const userId = record.student.user_id || record.user_id;

    if (!record.id) {
      throw new Error("Không tìm thấy ID bản ghi học sinh trong lớp");
    }

    return {
      key: String(userId),
      userId: userId,
      studentId: formatStudentId(userId, record.student.username),
      name: record.student.fullname,
      email: record.student.email,
      phone: "",
      class: className,
      status: record.status === "banned" ? "Bị cấm" : "Đang học",
      apiStatus: record.status || "online",
      classStudentId: record.id,
    };
  }, []);

  // Fetch class info
  const fetchClassInfo = useCallback(async (showLoading: boolean = true): Promise<string> => {
    const currentClassId = classIdRef.current;
    if (!currentClassId || !userId) return "";

    try {
      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      if (isNaN(numericUserId)) throw new Error("User ID không hợp lệ");

      const data = await getClassById(currentClassId, numericUserId);

      const mappedClassData = {
        id: String(data.class_id),
        name: data.name,
        code: data.code,
        students: data.student_count,
        status: (data.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive) as "Đang hoạt động" | "Tạm dừng",
      };

      setClassData(mappedClassData);
      setOriginalClassData(data);
      classNameRef.current = data.name;
      return data.name;
    } catch (error: any) {
      // Only clear data on initial/explicit loading, not silent refresh
      if (showLoading) setClassData(null);
      throw error;
    }
  }, [userId]);

  // Fetch students
  const fetchClassStudents = useCallback(async (className?: string) => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    try {
      const records = await getClassStudentsByClass({
        classId: currentClassId,
        page: 1,
        limit: 1000,
      });

      const studentClassName = className || classNameRef.current || "";
      const mappedStudents: StudentItem[] = records.map((record: ClassStudentRecord) =>
        mapStudentRecordToItem(record, studentClassName)
      );

      setStudents(mappedStudents);
    } catch (error: any) {
      setStudents([]);
    }
  }, [mapStudentRecordToItem]);

  // Fetch both class info and students
  const fetchClassDetail = useCallback(async (isInitial: boolean = false) => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    if (isInitial) {
      setLoading(true);
    }

    try {
      const className = await fetchClassInfo(isInitial);
      await fetchClassStudents(className);
    } catch (error) {
      // Error handled in fetchClassInfo
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [fetchClassInfo, fetchClassStudents]);

  // Initial fetch
  useEffect(() => {
    if (classId && userId) fetchClassDetail(true);
  }, [classId, userId, fetchClassDetail]);



  // Handlers - all stable with useCallback
  const handleEdit = useCallback(() => setIsEditModalOpen(true), []);

  const handleDelete = useCallback(() => {
    modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học "${classNameRef.current}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteRagTestsByClass(classIdRef.current);
          await deleteClass(classIdRef.current);
          messageRef.current.success(`Đã xóa lớp học "${classNameRef.current}" thành công`);
          router.push("/admin/classes");
        } catch (error: any) {
          messageRef.current.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  }, [modal, router]);

  const handleViewStudent = useCallback((student: StudentItem) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const handleBanStudent = useCallback((student: StudentItem) => {
    modal.confirm({
      title: "Xác nhận cấm học sinh",
      content: `Bạn có chắc chắn muốn cấm học sinh "${student.name}" khỏi lớp "${classNameRef.current}"? Học sinh này sẽ không thể truy cập lớp học, xem bài tập, bài kiểm tra và thông báo.`,
      okText: "Cấm",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          if (!student.classStudentId) {
            throw new Error("Không tìm thấy ID học sinh trong lớp. Vui lòng refresh trang và thử lại.");
          }

          const classStudentId = typeof student.classStudentId === "string"
            ? Number(student.classStudentId)
            : student.classStudentId;

          if (isNaN(classStudentId) || classStudentId <= 0) {
            throw new Error("ID học sinh không hợp lệ. Vui lòng refresh trang và thử lại.");
          }

          await updateClassStudentStatus({ id: classStudentId, status: "banned" });
          messageRef.current.success(`Đã cấm học sinh "${student.name}" khỏi lớp học`);

          // Optimistic update
          setStudents((prev) => prev.map((s) =>
            String(s.userId) === String(student.userId)
              ? { ...s, apiStatus: "banned", status: "Bị cấm" }
              : s
          ));

          setClassData((prevData) => {
            if (!prevData) return prevData;
            return { ...prevData, students: Math.max(0, (prevData.students || 0) - 1) };
          });
        } catch (error: any) {
          messageRef.current.error(error?.message || "Không thể cấm học sinh");
        }
      },
    });
  }, [modal]);

  const handleUnbanStudent = useCallback(async (student: StudentItem): Promise<void> => {
    try {
      if (!student.classStudentId) {
        throw new Error("Không tìm thấy ID học sinh trong lớp. Vui lòng refresh trang và thử lại.");
      }

      const classStudentId = typeof student.classStudentId === "string"
        ? Number(student.classStudentId)
        : student.classStudentId;

      if (isNaN(classStudentId) || classStudentId <= 0) {
        throw new Error("ID học sinh không hợp lệ. Vui lòng refresh trang và thử lại.");
      }

      await updateClassStudentStatus({ id: classStudentId, status: "online" });
      messageRef.current.success(`Đã gỡ cấm học sinh "${student.name}"`);

      // Optimistic update
      setStudents((prev) => prev.map((s) =>
        String(s.userId) === String(student.userId)
          ? { ...s, apiStatus: "online", status: "Đang học" }
          : s
      ));

      setClassData((prevData) => {
        if (!prevData) return prevData;
        return { ...prevData, students: (prevData.students || 0) + 1 };
      });
    } catch (error: any) {
      messageRef.current.error(error?.message || "Không thể gỡ cấm học sinh");
      throw error;
    }
  }, []);

  const handleRemoveStudent = useCallback((student: StudentItem) => {
    modal.confirm({
      title: "Xác nhận xóa học sinh",
      content: `Bạn có chắc chắn muốn xóa học sinh "${student.name}" ra khỏi lớp "${classNameRef.current}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await removeStudentFromClass({
            classId: classIdRef.current,
            userId: student.userId,
          });
          messageRef.current.success(`Đã xóa học sinh "${student.name}" ra khỏi lớp`);

          // Optimistic update
          setStudents((prev) => prev.filter((s) => String(s.userId) !== String(student.userId)));
          setClassData((prevData) => {
            if (!prevData) return prevData;
            const currentCount = prevData.students || 0;
            return { ...prevData, students: Math.max(0, currentCount - 1) };
          });
        } catch (error: any) {
          messageRef.current.error(error?.message || "Không thể xóa học sinh khỏi lớp");
        }
      },
    });
  }, [modal]);

  // Memoized values
  const classInfo = useMemo(() => {
    if (!classData) return null;
    return {
      name: classData.name,
      code: classData.code,
      students: classData.students,
      status: classData.status,
    };
  }, [classData]);

  const modalClassInfo = useMemo(() => ({
    name: classData?.name || "",
    code: classData?.code || "",
  }), [classData?.name, classData?.code]);

  // Modal handlers
  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleUpdateClassSuccess = useCallback((updatedName: string) => {
    setIsEditModalOpen(false);
    setClassData((prev) => (prev ? { ...prev, name: updatedName } : prev));
    setOriginalClassData((prev) => (prev ? { ...prev, name: updatedName } : prev));
    classNameRef.current = updatedName;
  }, []);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  // Fast refresh handler - refreshes all data silently
  const handleFastRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh class info and students silently
      await fetchClassDetail(false);

      // Trigger refresh for child components if they have refresh functions
      if (exerciseRefreshRef.current) {
        exerciseRefreshRef.current();
      }
      if (notificationRefreshRef.current) {
        notificationRefreshRef.current();
      }
      if (examRefreshRef.current) {
        examRefreshRef.current();
      }

      message.success({ content: "Đã cập nhật dữ liệu mới nhất", key: "refresh_success", duration: 2 });
    } catch (error) {
      console.error("Error refreshing class data:", error);
      message.error("Lỗi khi cập nhật dữ liệu");
    } finally {
      setRefreshing(false);
    }
  }, [fetchClassDetail, message]);

  // Auto-refresh on mount if URL has refresh param
  useEffect(() => {
    const refreshType = searchParams.get("refresh");

    if (refreshType) {
      // Remove the param from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Trigger appropriate refresh
      setTimeout(() => {
        if (refreshType === "exercises" && exerciseRefreshRef.current) {
          exerciseRefreshRef.current();
        } else if (refreshType === "notifications" && notificationRefreshRef.current) {
          notificationRefreshRef.current();
        } else if (refreshType === "exams" && examRefreshRef.current) {
          examRefreshRef.current();
        } else if (refreshType === "all") {
          handleFastRefresh();
        }
      }, 100);
    }
  }, [searchParams, handleFastRefresh]);

  // Memoize tab items
  const tabItems = useMemo(() => [
    {
      key: "students",
      label: (
        <span>
          <UserOutlined className="mr-2" />
          Danh sách học sinh
        </span>
      ),
      children: (
        <ClassStudentsTable
          students={students}
          onViewStudent={handleViewStudent}
          onRemoveStudent={handleRemoveStudent}
          onBanStudent={handleBanStudent}
          onUnbanStudent={handleUnbanStudent}
        />
      ),
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined className="mr-2" />
          Thông báo
        </span>
      ),
      children: (
        <ClassNotificationsTab
          classId={classId}
          searchQuery={notificationSearchQuery}
          onSearchChange={setNotificationSearchQuery}
          currentPage={notificationPage}
          pageSize={notificationPageSize}
          onPageChange={setNotificationPage}
          onRefresh={(refreshFn) => {
            notificationRefreshRef.current = refreshFn;
          }}
        />
      ),
    },
    {
      key: "exercises",
      label: (
        <span>
          <FileTextOutlined className="mr-2" />
          Bài tập
        </span>
      ),
      children: (
        <ClassExercisesTab
          classId={classId}
          searchQuery={exerciseSearchQuery}
          onSearchChange={setExerciseSearchQuery}
          currentPage={exercisePage}
          pageSize={exercisePageSize}
          onPageChange={setExercisePage}
          onRefresh={(refreshFn) => {
            exerciseRefreshRef.current = refreshFn;
          }}
        />
      ),
    },
    {
      key: "exams",
      label: (
        <span>
          <ExperimentOutlined className="mr-2" />
          Kiểm tra
        </span>
      ),
      children: (
        <ClassExamsTab
          classId={classId}
          searchQuery={examSearchQuery}
          onSearchChange={setExamSearchQuery}
          currentPage={examPage}
          pageSize={examPageSize}
          onPageChange={setExamPage}
          onRefresh={(refreshFn) => {
            examRefreshRef.current = refreshFn;
          }}
        />
      ),
    },
  ], [
    students, handleViewStudent, handleRemoveStudent, handleBanStudent, handleUnbanStudent,
    classId, notificationSearchQuery, notificationPage, exerciseSearchQuery, exercisePage,
    examSearchQuery, examPage
  ]);

  // Early returns
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton.Button active size="default" style={{ width: 120 }} />
          <div className="flex gap-3">
            <Skeleton.Button active size="default" style={{ width: 110 }} />
            <Skeleton.Button active size="default" style={{ width: 130 }} />
          </div>
        </div>

        {/* Info Card Skeleton (Matches ClassInfoCard) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-pulse" />
            <Skeleton.Input active size="small" style={{ width: 150 }} />
          </div>
          <div className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Row 1 */}
              <div className="p-4 border-b border-r border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                <Skeleton.Input active size="small" style={{ width: 80 }} />
                <Skeleton.Input active size="default" block />
              </div>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                <Skeleton.Input active size="small" style={{ width: 80 }} />
                <Skeleton.Input active size="default" block />
              </div>
              {/* Row 2 */}
              <div className="p-4 border-r border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <Skeleton.Input active size="default" block />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <Skeleton.Input active size="small" style={{ width: 140 }} />
                <div className="flex items-center gap-3">
                  <Skeleton.Avatar active size="small" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton.Input active size="small" style={{ width: "60%" }} />
                    <Skeleton.Input active size="small" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700">
            {["Danh sách học sinh", "Thông báo", "Bài tập", "Kiểm tra"].map((label, idx) => (
              <div key={label} className={`pb-3 px-2 ${idx === 0 ? "border-b-2 border-blue-500" : ""}`}>
                <Skeleton.Input active size="small" style={{ width: label.length * 8 }} />
              </div>
            ))}
          </div>

          {/* Tab Content Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <Skeleton.Input active size="default" style={{ width: 200 }} />
            </div>
            <div className="p-0">
              <div className="border-b border-gray-100 dark:border-gray-700 p-4">
                <div className="flex gap-4">
                  <Skeleton.Input active size="default" style={{ width: "20%" }} />
                  <Skeleton.Input active size="default" style={{ width: "40%" }} />
                  <Skeleton.Input active size="default" style={{ width: "40%" }} />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border-b border-gray-50 dark:border-gray-700/50 flex gap-4">
                  <Skeleton.Input active size="default" style={{ width: "20%" }} />
                  <Skeleton.Input active size="default" style={{ width: "40%" }} />
                  <Skeleton.Input active size="default" style={{ width: "30%" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="space-y-6">
        <ClassHeader className="Lớp học" onEdit={() => { }} onDelete={() => { }} />
        <ClassInfoCard
          classInfo={{
            name: "Không tìm thấy",
            code: "N/A",
            students: 0,
            status: "Không tồn tại",
          }}
        />
      </div>
    );
  }

  return (
    <RouteErrorBoundary routeName="admin">
      <div className="space-y-6">
        <ClassHeader
          className={classData.name}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleFastRefresh}
          refreshing={refreshing}
        />
        {classInfo && <ClassInfoCard classInfo={classInfo} />}

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          destroyOnHidden
          items={tabItems}
        />

        {originalClassData && classData && (
          <UpdateClassModal
            open={isEditModalOpen}
            classId={classId}
            currentName={classData.name}
            currentCode={classData.code}
            currentStudentCount={classData.students}
            currentStatus={originalClassData.status}
            onCancel={handleCloseEditModal}
            onSuccess={handleUpdateClassSuccess}
          />
        )}

        <StudentDetailModal
          open={isViewModalOpen}
          onCancel={handleCloseViewModal}
          student={selectedStudent}
          classInfo={modalClassInfo}
        />
      </div>
    </RouteErrorBoundary>
  );
}
