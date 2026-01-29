"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Spin, Tabs } from "antd";
import { FileTextOutlined, BellOutlined, UserOutlined, ExperimentOutlined } from "@ant-design/icons";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import BannedStudentModal from "@/app/components/students/BannedStudentModal";
import ClassHeader from "@/app/components/classes/ClassHeader";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassStudentsTable from "@/app/components/classes/ClassStudentsTable";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import BannedListModal from "@/app/components/classes/BannedListModal";
import ClassExercisesTab from "@/app/components/classes/ClassExercisesTab";
import ClassNotificationsTab from "@/app/components/classes/ClassNotificationsTab";
import ClassExamsTab from "@/app/components/classes/ClassExamsTab";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";
import {
  getClassById,
  removeStudentFromClass,
  deleteClass,
  updateClassStudentStatus,
  getClassStudentId,
  getClassStudentsByClass,
  type ClassDetailResponse,
  type ClassStudentRecord,
} from "@/lib/api/classes";
import { deleteRagTestsByClass } from "@/lib/api/rag-exams";
import type { StudentItem } from "@/interface/students";
import { ensureMinLoadingTime, CLASS_STATUS_MAP, formatStudentId } from "@/lib/utils/classUtils";
import { useUserId } from "@/app/hooks/useUserId";
import { classSocketClient } from "@/lib/socket/class-client";

export default function ClassDetail() {
  const router = useRouter();
  const params = useParams();
  const { modal, message } = App.useApp();
  const { userId } = useUserId();
  const classId = params?.id as string;

  // Use ref to store stable values
  const classIdRef = useRef(classId);
  const classNameRef = useRef<string>("");

  // Update refs when classId changes
  useEffect(() => {
    classIdRef.current = classId;
  }, [classId]);

  const [classData, setClassData] = useState<{
    id: string;
    name: string;
    code: string;
    students: number;
    status: "Đang hoạt động" | "Tạm dừng";
  } | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBannedModalOpen, setIsBannedModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [originalClassData, setOriginalClassData] = useState<ClassDetailResponse | null>(null);
  const [isBannedListModalOpen, setIsBannedListModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exercisePage, setExercisePage] = useState(1);
  const exercisePageSize = 4;
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationPageSize = 4;
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examPage, setExamPage] = useState(1);
  const examPageSize = 12;

  // Map ClassStudentRecord to StudentItem
  const mapStudentRecordToItem = useCallback((record: ClassStudentRecord, className: string): StudentItem => {
    if (!record.student) {
      throw new Error("Student data is missing in record");
    }

    // Lấy userId từ student.user_id (vì API trả về user_id trong object student)
    const userId = record.student.user_id || record.user_id;

    const displayStatus = record.status === "banned" ? "Bị cấm" : "Đang học";

    return {
      key: String(userId),
      userId: userId,
      studentId: formatStudentId(userId, record.student.username),
      name: record.student.fullname,
      email: record.student.email,
      phone: "",
      class: className,
      status: displayStatus,
      apiStatus: record.status || "online",
      classStudentId: record.id,
    };
  }, []);

  // Fetch class information (separate from students)
  const fetchClassInfo = useCallback(
    async (showLoading: boolean = true): Promise<string> => {
      const currentClassId = classIdRef.current;
      if (!currentClassId) return "";

      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

      try {
        const numericUserId = typeof userId === "string" ? Number(userId) : userId;
        if (isNaN(numericUserId)) {
          throw new Error("User ID không hợp lệ");
        }
        const data = await getClassById(currentClassId, numericUserId);

        // Map class data
        const mappedClassData = {
          id: String(data.class_id),
          name: data.name,
          code: data.code,
          students: data.student_count,
          status: (data.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive) as "Đang hoạt động" | "Tạm dừng",
        };

        setClassData(mappedClassData);
        setOriginalClassData(data); // Lưu original data để dùng cho update
        classNameRef.current = data.name; // Store className in ref
        return data.name; // Return className for use in fetchClassStudents
      } catch (error: any) {
        // message.error(error?.message || "Không thể tải thông tin lớp học");
        // Chỉ set null nếu showLoading = true để tránh mất dữ liệu khi refresh ngầm
        if (showLoading) {
          setClassData(null);
        }
        throw error;
      }
    },
    [userId, message]
  );

  // Fetch class students (separate from class info)
  const fetchClassStudents = useCallback(
    async (className?: string, showLoading: boolean = false) => {
      const currentClassId = classIdRef.current;
      if (!currentClassId) return;

      const startTime = Date.now();
      try {
        const records = await getClassStudentsByClass({
          classId: currentClassId,
          page: 1,
          limit: 1000, // Lấy tất cả học sinh
        });

        // Use provided className or fallback to ref
        const studentClassName = className || classNameRef.current || "";

        // Map students - chỉ lấy học sinh có status "online" (loại bỏ "banned")
        const mappedStudents: StudentItem[] = records
          .filter((record: ClassStudentRecord) => record.status === "online")
          .map((record: ClassStudentRecord) => mapStudentRecordToItem(record, studentClassName));

        // Chỉ đảm bảo minimum loading time nếu showLoading = true
        if (showLoading) {
          await ensureMinLoadingTime(startTime);
        }

        setStudents(mappedStudents);
      } catch (error: any) {
        if (showLoading) {
          // Ensure minimum loading time even on error
          await ensureMinLoadingTime(startTime);
          // message.error(error?.message || "Không thể tải danh sách học sinh");
        }
        // Không set students = [] nếu đang refresh ngầm để tránh mất dữ liệu
        if (showLoading) {
          setStudents([]);
        }
      }
    },
    [message, mapStudentRecordToItem]
  );

  // Fetch both class info and students
  const fetchClassDetail = useCallback(async () => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    setLoading(true);
    setShowSplash(true);
    const startTime = Date.now();

    try {
      // Fetch class info first and get className
      const className = await fetchClassInfo(true);
      // Then fetch students with className
      await fetchClassStudents(className, true);
    } catch (error) {
      // Error already handled in fetchClassInfo
    } finally {
      setLoading(false);

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 250 - elapsed);

      setTimeout(() => {
        setShowSplash(false);
      }, remaining);
    }
  }, [fetchClassInfo, fetchClassStudents]);

  // Only fetch when classId and userId are ready
  useEffect(() => {
    if (classId && userId) {
      fetchClassDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, userId]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!classId) return;

    // Connect and join class room
    classSocketClient.connect();
    classSocketClient.joinClass(classId);

    // Listen for class updates
    const unsubscribe = classSocketClient.on("class_updated", (data: any) => {
      console.log("Class updated via socket:", data);
      if (Number(data.class_id) === Number(classId)) {
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

        // Chỉ hiển thị toast nếu không phải là người vừa thực hiện chỉnh sửa (để tránh 2 toast)
        if (userId && Number(data.updated_by) !== Number(userId)) {
          const toastMessage = data.old_name && data.name !== data.old_name
            ? `Lớp học "${data.old_name}" vừa đổi tên thành "${data.name}"`
            : `Lớp học "${data.name}" vừa được cập nhật`;
          
          message.info({
            content: toastMessage,
            key: `class_update_${data.class_id}_${new Date().getTime() / 1000}`,
            duration: 3,
          });
        }
      }
    });

    // Listen for class deleted
    const unsubscribeDeleted = classSocketClient.on("class_deleted", (data: any) => {
      console.log("Class deleted via socket:", data);
      if (Number(data.class_id) === Number(classId)) {
        if (userId && data.deleted_by && Number(data.deleted_by) !== Number(userId)) {
          message.warning(`Lớp học "${data.name}" đã bị giải tán bởi quản trị viên khác.`);
          router.push("/admin/classes");
        }
      }
    });

    // Listen for student joined
    const unsubscribeJoined = classSocketClient.on("student_joined", (data: any) => {
      console.log("Student joined via socket:", data);
      if (Number(data.class_id) === Number(classId)) {
        const newStudent = mapStudentRecordToItem(data, classNameRef.current);
        setStudents((prev) => {
          // Check if student already exists
          if (prev.some((s) => String(s.userId) === String(newStudent.userId))) return prev;
          
          const newList = [newStudent, ...prev];
          // Use count from server if available, otherwise fallback to local list length
          const newCount = data.student_count !== undefined ? data.student_count : newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
        
        message.info({
          content: `Học sinh ${data.student?.fullname || "mới"} vừa tham gia lớp học`,
          key: `student_joined_${data.student?.user_id}`,
          duration: 3,
        });
      }
    });

    // Listen for student removed
    const unsubscribeRemoved = classSocketClient.on("student_removed", (data: any) => {
      console.log("Student removed via socket:", data);
      if (Number(data.class_id) === Number(classId)) {
        setStudents((prev) => {
          const newList = prev.filter((s) => String(s.userId) !== String(data.user_id));
          // Use count from server if available, otherwise fallback to local list length
          const newCount = data.student_count !== undefined ? data.student_count : newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
      }
    });

    // Listen for student status updated (e.g. banned)
    const unsubscribeStatus = classSocketClient.on("student_status_updated", (data: any) => {
      console.log("Student status updated via socket:", data);
      if (Number(data.class_id) === Number(classId)) {
        if (data.status === "banned") {
          setStudents((prev) => {
            const newList = prev.filter((s) => String(s.userId) !== String(data.user_id));
            // Use count from server if available, otherwise fallback to local list length
            const newCount = data.student_count !== undefined ? data.student_count : newList.length;
            setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
            return newList;
          });
        } else {
          setStudents((prev) => {
            const index = prev.findIndex((s) => String(s.userId) === String(data.user_id));
            if (index !== -1) {
              const newList = [...prev];
              newList[index] = {
                ...newList[index],
                status: data.status === "banned" ? "Bị cấm" : "Đang học",
                apiStatus: data.status,
              };
              return newList;
            }
            return prev;
          });
        }
      }
    });

    return () => {
      classSocketClient.leaveClass(classId);
      unsubscribe();
      unsubscribeDeleted();
      unsubscribeJoined();
      unsubscribeRemoved();
      unsubscribeStatus();
    };
  }, [classId, userId, message, router]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    const currentClassId = classIdRef.current;
    const currentClassName = classNameRef.current;

    modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học "${currentClassName}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // 1. Xóa toàn bộ đề thi AI liên quan
          await deleteRagTestsByClass(currentClassId);

          // 2. Xóa lớp học
          await deleteClass(currentClassId);
          message.success(`Đã xóa lớp học "${currentClassName}" thành công`);
          // Redirect về trang danh sách lớp học
          router.push("/admin/classes");
        } catch (error: any) {
          message.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  }, [modal, message, router]);

  const handleViewStudent = useCallback((student: StudentItem) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const handleViewBanned = useCallback((student: StudentItem) => {
    setSelectedStudent(student);
    setIsBannedModalOpen(true);
  }, []);

  const handleBanStudent = useCallback(
    (student: StudentItem) => {
      message.info("Tính năng này đang được phát triển");
    },
    [message]
  );

  const handleRemoveStudent = useCallback(
    (student: StudentItem) => {
      const currentClassId = classIdRef.current;
      const currentClassName = classNameRef.current;

      modal.confirm({
        title: "Xác nhận xóa học sinh",
        content: `Bạn có chắc chắn muốn xóa học sinh "${student.name}" ra khỏi lớp "${currentClassName}"?`,
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await removeStudentFromClass({
              classId: currentClassId,
              userId: student.userId,
            });

            message.success(`Đã xóa học sinh "${student.name}" ra khỏi lớp`);
          } catch (error: any) {
            message.error(error?.message || "Không thể xóa học sinh khỏi lớp");
          }
        },
      });
    },
    [modal, message]
  );

  const handleViewBannedList = useCallback(() => {
    message.info("Tính năng này đang được phát triển");
  }, [message]);

  // Memoize classInfo object to prevent unnecessary rerenders
  const classInfo = useMemo(() => {
    if (!classData) return null;
    return {
      name: classData.name,
      code: classData.code,
      students: classData.students,
      status: classData.status,
    };
  }, [classData]);

  // Memoize modal classInfo
  const modalClassInfo = useMemo(() => {
    if (!classData) return { name: "", code: "" };
    return {
      name: classData.name,
      code: classData.code,
    };
  }, [classData]);

  // Memoize callbacks for modals
  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleCloseBannedModal = useCallback(() => {
    setIsBannedModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleCloseBannedListModal = useCallback(() => {
    setIsBannedListModalOpen(false);
  }, []);

  const handleUpdateClassSuccess = useCallback((updatedName: string) => {
    setIsEditModalOpen(false);
    // Cập nhật state trực tiếp thay vì gọi lại API
    setClassData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: updatedName,
      };
    });
    // Cập nhật originalClassData để đồng bộ
    setOriginalClassData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: updatedName,
      };
    });
    classNameRef.current = updatedName; // Update ref
  }, []);

  const handleUnbanSuccess = useCallback(() => {
    // Refresh students list và class info để cập nhật số lượng học sinh
    fetchClassInfo(false).then((className) => {
      fetchClassStudents(className, false);
    });
  }, [fetchClassStudents, fetchClassInfo]);

  const handleTabChange = useCallback((key: string) => {
    setIsTabLoading(true);
    setActiveTab(key);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 500);
  }, []);

  const renderTabContent = (content: React.ReactNode) => {
    if (isTabLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }
    return content;
  };

  // Early returns after all hooks
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
      {/* Header */}
      <ClassHeader className={classData.name} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Thông tin lớp học */}
      {classInfo && <ClassInfoCard classInfo={classInfo} />}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        destroyInactiveTabPane
        items={[
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
                onViewBanned={handleViewBanned}
                onViewBannedList={handleViewBannedList}
                onBanStudent={handleBanStudent}
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
        ]}
      />

      {/* Modal chỉnh sửa lớp học */}
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

      {/* Modal xem chi tiết học sinh */}
      <StudentDetailModal open={isViewModalOpen} onCancel={handleCloseViewModal} student={selectedStudent} classInfo={modalClassInfo} />

      {/* Modal học sinh bị cấm */}
      <BannedStudentModal open={isBannedModalOpen} onCancel={handleCloseBannedModal} student={selectedStudent} classInfo={modalClassInfo} />

      {/* Modal danh sách học sinh bị cấm */}
      {classData && (
        <BannedListModal
          open={isBannedListModalOpen}
          onCancel={handleCloseBannedListModal}
          classId={classId}
          className={classData.name}
          onUnbanSuccess={handleUnbanSuccess}
        />
      )}
    </div>
  );
}
