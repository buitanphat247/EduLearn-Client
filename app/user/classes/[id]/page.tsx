"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Spin, Button, Tabs, Table } from "antd";
import { ArrowLeftOutlined, BellOutlined, FileTextOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassExercisesTab from "@/app/components/classes/ClassExercisesTab";
import ClassNotificationsTab from "@/app/components/classes/ClassNotificationsTab";
import ClassExamsTab from "@/app/components/classes/ClassExamsTab";
import CustomCard from "@/app/components/common/CustomCard";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";
import { getClassById, getClassStudentsByClass, type ClassStudentRecord } from "@/lib/api/classes";
import { CLASS_STATUS_MAP, formatStudentId } from "@/lib/utils/classUtils";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import type { StudentItem } from "@/interface/students";
import type { ColumnsType } from "antd/es/table";
import { classSocketClient } from "@/lib/socket/class-client";

type ClassDataState = {
  id: string;
  name: string;
  code: string;
  students: number;
  status: "Đang hoạt động" | "Tạm dừng";
  creator?: {
    user_id: number | string;
    username: string;
    fullname: string;
    email: string;
    avatar?: string | null;
  } | null;
  created_at?: string;
} | null;

export default function UserClassDetail() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
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
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
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
  const examPageSize = 4;

  // Stable search/page handlers
  const handleNotificationSearchChange = useCallback((value: string) => {
    setNotificationSearchQuery(value);
  }, []);

  const handleNotificationPageChange = useCallback((page: number) => {
    setNotificationPage(page);
  }, []);

  const handleExerciseSearchChange = useCallback((value: string) => {
    setExerciseSearchQuery(value);
  }, []);

  const handleExercisePageChange = useCallback((page: number) => {
    setExercisePage(page);
  }, []);

  const handleExamSearchChange = useCallback((value: string) => {
    setExamSearchQuery(value);
  }, []);

  const handleExamPageChange = useCallback((page: number) => {
    setExamPage(page);
  }, []);

  // Map student record - stable
  const mapStudentRecordToItem = useCallback((record: ClassStudentRecord, className: string): StudentItem => {
    if (!record.student) throw new Error("Student data is missing in record");

    const userId = record.student.user_id || record.user_id;

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
    if (!currentClassId) return "";

    try {
      const userId = getUserIdFromCookie();
      if (!userId) throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      
      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      if (isNaN(numericUserId)) throw new Error("User ID không hợp lệ");
      
      const data = await getClassById(currentClassId, numericUserId);

      const mappedClassData = {
        id: String(data.class_id),
        name: data.name,
        code: data.code,
        students: data.student_count,
        status: (data.status === "active" ? CLASS_STATUS_MAP.active : CLASS_STATUS_MAP.inactive) as "Đang hoạt động" | "Tạm dừng",
        creator: data.creator || null,
        created_at: data.created_at,
      };

      setClassData(mappedClassData);
      classNameRef.current = data.name;
      return data.name;
    } catch (error: any) {
      if (showLoading) setClassData(null);
      throw error;
    }
  }, []);

  // Fetch students
  const fetchClassStudents = useCallback(async (className?: string, showLoading: boolean = false) => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    try {
      if (showLoading) setStudentsLoading(true);
      
      const records = await getClassStudentsByClass({
        classId: currentClassId,
        page: 1,
        limit: 1000,
      });

      const studentClassName = className || classNameRef.current || "";
      const mappedStudents: StudentItem[] = records
        .filter((record: ClassStudentRecord) => record.status === "online")
        .map((record: ClassStudentRecord) => mapStudentRecordToItem(record, studentClassName));

      setStudents(mappedStudents);
    } catch (error: any) {
      if (showLoading) setStudents([]);
    } finally {
      if (showLoading) setStudentsLoading(false);
    }
  }, [mapStudentRecordToItem]);

  // Fetch class detail
  const fetchClassDetail = useCallback(async () => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    setLoading(true);
    setShowSplash(true);
    const startTime = Date.now();

    try {
      const className = await fetchClassInfo(true);
      await fetchClassStudents(className, true);
    } catch (error: any) {
      const errorMessage = error?.message || "";
      if (errorMessage.includes("bị chặn") || errorMessage.includes("banned")) {
        messageRef.current.error({
          content: "Bạn đã bị chặn khỏi lớp học này và không thể truy cập",
          key: "banned_access",
          duration: 5,
        });
        router.push("/user/classes");
        return;
      }
      messageRef.current.error(errorMessage || "Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
      const elapsed = Date.now() - startTime;
      setTimeout(() => setShowSplash(false), Math.max(0, 250 - elapsed));
    }
  }, [fetchClassInfo, fetchClassStudents, router]);

  // Initial fetch
  useEffect(() => {
    if (classId) fetchClassDetail();
  }, [classId, fetchClassDetail]);

  // Socket refs
  const socketInitializedRef = useRef(false);
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const classIdSocketRef = useRef<string | null>(null);

  // Socket.io real-time updates
  useEffect(() => {
    if (!classId) return;

    if (!socketInitializedRef.current || classIdSocketRef.current !== classId) {
      // Cleanup previous socket
      if (socketInitializedRef.current && classIdSocketRef.current && classIdSocketRef.current !== classId) {
        classSocketClient.leaveClass(classIdSocketRef.current);
        unsubscribersRef.current?.forEach((unsub) => {
          if (typeof unsub === 'function') try { unsub(); } catch (e) { /* ignore */ }
        });
        unsubscribersRef.current = [];
      }

      // Connect and join
      classSocketClient.connect();
      classSocketClient.joinClass(classId);
      classIdSocketRef.current = classId;

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
      });

      const unsubscribeJoined = classSocketClient.on("student_joined", (data: any) => {
        if (Number(data.class_id) !== Number(classId)) return;

        const newStudent = mapStudentRecordToItem(data, classNameRef.current);
        setStudents((prev) => {
          if (prev.some((s) => String(s.userId) === String(newStudent.userId))) return prev;
          
          const newList = [newStudent, ...prev];
          const newCount = data.student_count ?? newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
      });

      const unsubscribeRemoved = classSocketClient.on("student_removed", (data: any) => {
        if (Number(data.class_id) !== Number(classId)) return;

        const currentUserId = getUserIdFromCookie();
        if (String(data.user_id) === String(currentUserId)) {
          messageRef.current.warning({
            content: "Bạn đã được quản trị viên mời ra khỏi lớp học này.",
            key: "removed_from_class",
            duration: 5,
          });
          router.push("/user/classes");
          return;
        }

        setStudents((prev) => {
          const newList = prev.filter((s) => String(s.userId) !== String(data.user_id));
          const newCount = data.student_count ?? newList.length;
          setClassData((prevData) => (prevData ? { ...prevData, students: newCount } : prevData));
          return newList;
        });
      });

      const unsubscribeStatus = classSocketClient.on("student_status_updated", (data: any) => {
        if (Number(data.class_id) !== Number(classId)) return;

        const currentUserId = getUserIdFromCookie();
        const isCurrentUser = String(data.user_id) === String(currentUserId);
        
        if (isCurrentUser && data.status === "banned") return;

        if (data.status === "banned") {
          setStudents((prev) => {
            const newList = prev.filter((s) => String(s.userId) !== String(data.user_id));
            const newCount = data.student_count ?? newList.length;
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
          if (data.student_count !== undefined) {
            setClassData((prevData) => (prevData ? { ...prevData, students: data.student_count } : prevData));
          }
        }
      });

      const unsubscribeDeleted = classSocketClient.on("class_deleted", (data: any) => {
        if (Number(data.class_id) !== Number(classId)) return;

        messageRef.current.warning({
          content: `Lớp học "${data.name}" đã bị giải tán bởi giáo viên.`,
          key: "class_deleted",
          duration: 5,
        });
        router.push("/user/classes");
      });

      const unsubscribeBanned = classSocketClient.on("student_banned", (data: any) => {
        if (Number(data.class_id) !== Number(classId)) return;

        messageRef.current.error({
          content: data.message || "Bạn đã bị chặn khỏi lớp học này.",
          key: "student_banned",
          duration: 5,
        });
        router.push("/user/classes");
      });

      unsubscribersRef.current = [
        unsubscribeUpdated,
        unsubscribeJoined,
        unsubscribeRemoved,
        unsubscribeStatus,
        unsubscribeDeleted,
        unsubscribeBanned,
      ];

      socketInitializedRef.current = true;
    }

    return () => {
      if (socketInitializedRef.current && classIdSocketRef.current === classId) {
        if (classId) classSocketClient.leaveClass(classId);
        unsubscribersRef.current?.forEach((unsub) => {
          if (typeof unsub === 'function') try { unsub(); } catch (e) { /* ignore */ }
        });
        unsubscribersRef.current = [];
        socketInitializedRef.current = false;
        classIdSocketRef.current = null;
      }
    };
  }, [classId, router, mapStudentRecordToItem]);

  // Memoized values
  const classInfo = useMemo(() => {
    if (!classData) return null;
    return {
      name: classData.name,
      code: classData.code,
      students: classData.students,
      status: classData.status,
      creator: classData.creator,
      created_at: classData.created_at,
    };
  }, [classData]);

  // Memoized student columns
  const studentColumns: ColumnsType<StudentItem> = useMemo(() => [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      render: (text: string) => (
        <span className="font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 dark:text-gray-100">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ], []);

  // Handlers
  const handleCopyCode = useCallback(() => {
    if (classData?.code) navigator.clipboard.writeText(classData.code);
  }, [classData?.code]);

  const handleBack = useCallback(() => {
    router.push("/user/classes");
  }, [router]);

  const handleTabChange = useCallback((key: string) => {
    setIsTabLoading(true);
    setActiveTab(key);
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

  // Memoized students table
  const studentsTableContent = useMemo(() => (
    <CustomCard title="Danh sách học sinh" bodyClassName="py-6" className="border border-gray-200 dark:!border-slate-600">
      <Table
        columns={studentColumns}
        dataSource={students}
        pagination={false}
        rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        loading={studentsLoading}
      />
    </CustomCard>
  ), [students, studentsLoading, studentColumns]);

  // Memoized tab items
  const tabItems = useMemo(() => [
    {
      key: "students",
      label: (
        <span>
          <UserOutlined className="mr-2" />
          Danh sách học sinh
        </span>
      ),
      children: renderTabContent(studentsTableContent),
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
          onSearchChange={handleNotificationSearchChange}
          currentPage={notificationPage}
          pageSize={notificationPageSize}
          onPageChange={handleNotificationPageChange}
          readOnly={true}
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
          onSearchChange={handleExerciseSearchChange}
          currentPage={exercisePage}
          pageSize={exercisePageSize}
          onPageChange={handleExercisePageChange}
          readOnly={true}
        />
      ),
    },
    {
      key: "exams",
      label: (
        <span>
          <CalendarOutlined className="mr-2" />
          Kiểm tra
        </span>
      ),
      children: renderTabContent(
        <ClassExamsTab
          classId={classId}
          searchQuery={examSearchQuery}
          onSearchChange={handleExamSearchChange}
          currentPage={examPage}
          pageSize={examPageSize}
          onPageChange={handleExamPageChange}
          readOnly={true}
        />
      ),
    },
  ], [
    studentsTableContent, renderTabContent, classId,
    notificationSearchQuery, notificationPage, handleNotificationSearchChange, handleNotificationPageChange,
    exerciseSearchQuery, exercisePage, handleExerciseSearchChange, handleExercisePageChange,
    examSearchQuery, examPage, handleExamSearchChange, handleExamPageChange,
  ]);

  // Memoized not found component
  const notFoundComponent = useMemo(() => (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center space-y-2">
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 8h6" className="text-gray-200" />
            </svg>
            <div className="absolute -top-3 -right-3">
              <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                <circle cx="8" cy="8" r="1" fill="white" />
                <circle cx="12" cy="8" r="1" fill="white" />
                <circle cx="16" cy="8" r="1" fill="white" />
              </svg>
            </div>
          </div>
        </div>
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-gray-800 mt-1 mb-1 tracking-tight uppercase">THÔNG BÁO HỆ THỐNG</h2>
          <p className="text-gray-500 text-xs leading-relaxed mb-4 px-6 font-medium italic">"Không tìm thấy lớp học"</p>
        </div>
        <Button
          type="primary"
          size="middle"
          className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md hover:shadow-lg transition-all duration-200 px-8"
          onClick={handleBack}
        >
          Quay lại
        </Button>
      </div>
    </div>
  ), [handleBack]);

  // Early returns
  if (showSplash || loading) {
    return <DataLoadingSplash tip="ĐANG TẢI DỮ LIỆU..." />;
  }

  if (!classData) {
    return notFoundComponent;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
      </div>

      {classInfo && <ClassInfoCard classInfo={classInfo} onCopyCode={handleCopyCode} />}

      <Tabs activeKey={activeTab} onChange={handleTabChange} destroyInactiveTabPane items={tabItems} />
    </div>
  );
}
