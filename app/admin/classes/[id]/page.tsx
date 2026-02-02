"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Spin, Tabs } from "antd";
import { FileTextOutlined, BellOutlined, UserOutlined, ExperimentOutlined } from "@ant-design/icons";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import ClassHeader from "@/app/components/classes/ClassHeader";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassStudentsTable from "@/app/components/classes/ClassStudentsTable";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import ClassExercisesTab from "@/app/components/classes/ClassExercisesTab";
import ClassNotificationsTab from "@/app/components/classes/ClassNotificationsTab";
import ClassExamsTab from "@/app/components/classes/ClassExamsTab";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";
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
import { ensureMinLoadingTime, CLASS_STATUS_MAP, formatStudentId } from "@/lib/utils/classUtils";
import { useUserId } from "@/app/hooks/useUserId";
import { classSocketClient } from "@/lib/socket/class-client";

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
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Tab-specific state
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exercisePage, setExercisePage] = useState(1);
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  const [notificationPage, setNotificationPage] = useState(1);
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examPage, setExamPage] = useState(1);

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
      if (showLoading) setClassData(null);
        throw error;
      }
  }, [userId]);

  // Fetch students
  const fetchClassStudents = useCallback(async (className?: string, showLoading: boolean = false) => {
      const currentClassId = classIdRef.current;
      if (!currentClassId) return;

      const startTime = Date.now();
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

      if (showLoading) await ensureMinLoadingTime(startTime);
        setStudents(mappedStudents);
      } catch (error: any) {
        if (showLoading) {
          await ensureMinLoadingTime(startTime);
          setStudents([]);
        }
      }
  }, [mapStudentRecordToItem]);

  // Fetch both class info and students
  const fetchClassDetail = useCallback(async () => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    setLoading(true);
    setShowSplash(true);
    const startTime = Date.now();

    try {
      const className = await fetchClassInfo(true);
      await fetchClassStudents(className, true);
    } catch (error) {
      // Error handled in fetchClassInfo
    } finally {
      setLoading(false);
      const elapsed = Date.now() - startTime;
      setTimeout(() => setShowSplash(false), Math.max(0, 250 - elapsed));
    }
  }, [fetchClassInfo, fetchClassStudents]);

  // Initial fetch
  useEffect(() => {
    if (classId && userId) fetchClassDetail();
  }, [classId, userId, fetchClassDetail]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!classId) return;

    const socket = classSocketClient.connect();
    if (!socket) return;

    const joinRoom = () => {
      if (classSocketClient.isConnected()) {
        classSocketClient.joinClass(classId);
      } else {
        setTimeout(joinRoom, 100);
      }
    };

    if (socket.connected) {
    classSocketClient.joinClass(classId);
    } else {
      socket.on("connect", () => classSocketClient.joinClass(classId));
      joinRoom();
    }

    // Socket listeners
    const unsubscribeUpdated = classSocketClient.on("class_updated", (data: any) => {
      if (Number(data.class_id) !== Number(classId)) return;

        setClassData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: data.name,
            code: data.code,
            status: data.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive,
          };
        });
        classNameRef.current = data.name;

        if (userId && Number(data.updated_by) !== Number(userId)) {
          const toastMessage = data.old_name && data.name !== data.old_name
            ? `Lớp học "${data.old_name}" vừa đổi tên thành "${data.name}"`
            : `Lớp học "${data.name}" vừa được cập nhật`;
          
        messageRef.current.info({
            content: toastMessage,
          key: `class_update_${data.class_id}`,
            duration: 3,
          });
      }
    });

    const unsubscribeDeleted = classSocketClient.on("class_deleted", (data: any) => {
      if (Number(data.class_id) !== Number(classId)) return;

        if (userId && data.deleted_by && Number(data.deleted_by) !== Number(userId)) {
        messageRef.current.warning(`Lớp học "${data.name}" đã bị giải tán bởi quản trị viên khác.`);
          router.push("/admin/classes");
      }
    });

    const unsubscribeJoined = classSocketClient.on("student_joined", (data: any) => {
      if (Number(data.class_id) !== Number(classId)) return;

      try {
        const studentRecord: ClassStudentRecord = {
          id: data.student?.class_student_id || 0,
          class_id: data.class_id,
          user_id: data.student?.user_id || data.user_id,
          status: "online",
          added_at: data.added_at || new Date().toISOString(),
          student: data.student || {
            user_id: data.student?.user_id || data.user_id,
            username: data.student?.username || "",
            fullname: data.student?.fullname || data.student?.name || "",
            email: data.student?.email || "",
            avatar: data.student?.avatar || null,
          },
        };

        const newStudent = mapStudentRecordToItem(studentRecord, classNameRef.current || "");
        setStudents((prev) => {
          if (!Array.isArray(prev)) return [newStudent];
          if (prev.some((s) => String(s.userId) === String(newStudent.userId))) return prev;
          
          const newList = [newStudent, ...prev];
          const newCount = data.student_count ?? newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
        
        messageRef.current.info({
          content: `Học sinh ${data.student?.fullname || data.student?.name || "mới"} vừa tham gia lớp học`,
          key: `student_joined_${data.student?.user_id || data.user_id}`,
          duration: 3,
        });
      } catch (error: any) {
        if (data.student_count !== undefined) {
          setClassData((prevData) => (prevData ? { ...prevData, students: data.student_count } : prevData));
        }
      }
    });

    const unsubscribeRemoved = classSocketClient.on("student_removed", (data: any) => {
      if (Number(data.class_id) !== Number(classId)) return;

        setStudents((prev) => {
        if (!Array.isArray(prev)) return [];
          const newList = prev.filter((s) => String(s.userId) !== String(data.user_id));
        const newCount = data.student_count ?? newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
    });

    const unsubscribeStatus = classSocketClient.on("student_status_updated", (data: any) => {
      if (Number(data.class_id) !== Number(classId)) return;

          setStudents((prev) => {
        if (!Array.isArray(prev)) return [];
            const index = prev.findIndex((s) => String(s.userId) === String(data.user_id));
        if (index === -1) return prev;

              const newList = [...prev];
              newList[index] = {
                ...newList[index],
                status: data.status === "banned" ? "Bị cấm" : "Đang học",
                apiStatus: data.status,
              };
              return newList;
      });
      
      if (data.student_count !== undefined) {
        setClassData((prevData) => (prevData ? { ...prevData, students: data.student_count } : prevData));
      }
    });

    const unsubscribeError = classSocketClient.on("class:error", (data: any) => {
      if (data.error) {
        messageRef.current.error({
          content: `Socket error: ${data.error}`,
          key: `socket_error_${Date.now()}`,
          duration: 5,
        });
      }
    });

    const unsubscribeAccessDenied = classSocketClient.on("class:access_denied", (data: any) => {
      if (data.reason === "banned") {
        messageRef.current.warning({
          content: data.message || "Bạn đã bị chặn khỏi lớp học này",
          key: `access_denied_${Date.now()}`,
          duration: 5,
        });
      }
    });

    return () => {
      classSocketClient.leaveClass(classId);
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeJoined();
      unsubscribeRemoved();
      unsubscribeStatus();
      unsubscribeError();
      unsubscribeAccessDenied();
    };
  }, [classId, userId, router, mapStudentRecordToItem]);

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
    setIsTabLoading(true);
    setActiveTab(key);
    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      setTimeout(() => setIsTabLoading(false), 300);
    });
  }, []);

  // Tab content renderer
  const renderTabContent = useCallback((content: React.ReactNode) => {
    if (isTabLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }
    return content;
  }, [isTabLoading]);

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
            children: renderTabContent(
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
            children: renderTabContent(
              <ClassNotificationsTab
                classId={classId}
                searchQuery={notificationSearchQuery}
                onSearchChange={setNotificationSearchQuery}
                currentPage={notificationPage}
                pageSize={notificationPageSize}
                onPageChange={setNotificationPage}
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
            children: renderTabContent(
              <ClassExercisesTab
                classId={classId}
                searchQuery={exerciseSearchQuery}
                onSearchChange={setExerciseSearchQuery}
                currentPage={exercisePage}
                pageSize={exercisePageSize}
                onPageChange={setExercisePage}
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
            children: renderTabContent(
              <ClassExamsTab
                classId={classId}
                searchQuery={examSearchQuery}
                onSearchChange={setExamSearchQuery}
                currentPage={examPage}
                pageSize={examPageSize}
                onPageChange={setExamPage}
              />
            ),
          },
  ], [
    students, handleViewStudent, handleRemoveStudent, handleBanStudent, handleUnbanStudent,
    classId, notificationSearchQuery, notificationPage, exerciseSearchQuery, exercisePage,
    examSearchQuery, examPage, renderTabContent
  ]);

  // Early returns
  if (showSplash || loading) {
    return <DataLoadingSplash tip="Đang kiểm tra quyền truy cập lớp học..." />;
  }

  if (!classData) {
    return (
      <div className="space-y-6">
        <ClassHeader className="Lớp học" onEdit={() => {}} onDelete={() => {}} />
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
    <div className="space-y-6">
      <ClassHeader className={classData.name} onEdit={handleEdit} onDelete={handleDelete} />
      {classInfo && <ClassInfoCard classInfo={classInfo} />}

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        destroyInactiveTabPane
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
  );
}
