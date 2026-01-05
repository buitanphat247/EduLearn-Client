"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Spin, Button, Tabs, Table, Tag } from "antd";
import { ArrowLeftOutlined, BellOutlined, FileTextOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassExercisesTab from "@/app/components/classes/ClassExercisesTab";
import ClassNotificationsTab from "@/app/components/classes/ClassNotificationsTab";
import ClassExamsTab from "@/app/components/classes/ClassExamsTab";
import CustomCard from "@/app/components/common/CustomCard";
import { getClassById, getClassStudentsByClass, type ClassStudentRecord } from "@/lib/api/classes";
import { CLASS_STATUS_MAP, formatStudentId } from "@/lib/utils/classUtils";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import type { StudentItem } from "@/interface/students";
import type { ColumnsType } from "antd/es/table";

export default function UserClassDetail() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;

  const classIdRef = useRef(classId);
  const classNameRef = useRef<string>("");
  const messageRef = useRef(message);

  useEffect(() => {
    classIdRef.current = classId;
    messageRef.current = message;
  }, [classId, message]);

  const [classData, setClassData] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exercisePage, setExercisePage] = useState(1);
  const exercisePageSize = 4;
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationPageSize = 4;
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examPage, setExamPage] = useState(1);
  const examPageSize = 4;

  // Memoize callbacks to prevent unnecessary rerenders
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

  // Fetch class information (separate from students)
  const fetchClassInfo = useCallback(async (showLoading: boolean = true): Promise<string> => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return "";

    try {
      const userId = getUserIdFromCookie();
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
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
        creator: data.creator || null,
        created_at: data.created_at,
      };

      setClassData(mappedClassData);
      classNameRef.current = data.name; // Store className in ref
      return data.name; // Return className for use in fetchClassStudents
    } catch (error: any) {
      if (showLoading) {
        messageRef.current.error(error?.message || "Không thể tải thông tin lớp học");
      }
      // Chỉ set null nếu showLoading = true để tránh mất dữ liệu khi refresh ngầm
      if (showLoading) {
        setClassData(null);
      }
      throw error;
    }
  }, []);

  // Map ClassStudentRecord to StudentItem
  const mapStudentRecordToItem = useCallback((record: ClassStudentRecord, className: string): StudentItem => {
    if (!record.student) {
      throw new Error("Student data is missing in record");
    }

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

  // Fetch class students (separate from class info)
  const fetchClassStudents = useCallback(
    async (className?: string, showLoading: boolean = false) => {
      const currentClassId = classIdRef.current;
      if (!currentClassId) return;

      try {
        if (showLoading) setStudentsLoading(true);
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

        setStudents(mappedStudents);
      } catch (error: any) {
        if (showLoading) {
          messageRef.current.error(error?.message || "Không thể tải danh sách học sinh");
        }
        // Không set students = [] nếu đang refresh ngầm để tránh mất dữ liệu
        if (showLoading) {
          setStudents([]);
        }
      } finally {
        if (showLoading) setStudentsLoading(false);
      }
    },
    [mapStudentRecordToItem]
  );

  // Fetch both class info and students
  const fetchClassDetail = useCallback(async () => {
    const currentClassId = classIdRef.current;
    if (!currentClassId) return;

    setLoading(true);
    try {
      // Fetch class info first and get className
      const className = await fetchClassInfo(true);
      // Then fetch students with className
      await fetchClassStudents(className, true);
    } catch (error) {
      // Error already handled in fetchClassInfo
    } finally {
      setLoading(false);
    }
  }, [fetchClassInfo, fetchClassStudents]);

  // Only fetch when classId changes
  useEffect(() => {
    if (classId) {
      fetchClassDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // Memoize classInfo object
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

  // Memoize status tag render function
  const renderStatusTag = useCallback((status: string) => {
    let color = "default";
    if (status === "Đang học") color = "green";
    else if (status === "Tạm nghỉ") color = "orange";
    else if (status === "Bị cấm") color = "red";
    return <Tag color={color}>{status}</Tag>;
  }, []);

  // Memoize student columns to prevent re-render
  const studentColumns: ColumnsType<StudentItem> = useMemo(
    () => [
      {
        title: "Mã học sinh",
        dataIndex: "studentId",
        key: "studentId",
        render: (text: string) => <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{text}</span>,
      },
      {
        title: "Họ và tên",
        dataIndex: "name",
        key: "name",
        render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: renderStatusTag,
      },
    ],
    [renderStatusTag]
  );

  const handleCopyCode = useCallback(() => {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code);
      messageRef.current.success("Đã sao chép mã lớp học");
    }
  }, [classData?.code]);

  const handleBack = useCallback(() => {
    router.push("/user/classes");
  }, [router]);

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

  // Memoize loading component
  const loadingComponent = useMemo(
    () => (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large">
          <div style={{ minHeight: "200px" }} />
        </Spin>
        <div className="absolute text-gray-600 mt-20">Đang tải thông tin lớp học...</div>
      </div>
    ),
    []
  );

  // Memoize not found component
  const notFoundComponent = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </Button>
        </div>
        <ClassInfoCard
          classInfo={{
            name: "Không tìm thấy",
            code: "N/A",
            students: 0,
            status: "Không tồn tại",
          }}
        />
      </div>
    ),
    [handleBack]
  );

  // Memoize students table content
  const studentsTableContent = useMemo(
    () => (
      <CustomCard title="Danh sách học sinh" bodyClassName="py-6">
        <Table
          columns={studentColumns}
          dataSource={students}
          pagination={false}
          rowClassName="hover:bg-gray-50 transition-colors"
          loading={studentsLoading}
        />
      </CustomCard>
    ),
    [students, studentsLoading, studentColumns]
  );

  // Memoize tab items to prevent re-render
  const tabItems = useMemo(
    () => [
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
    ],
    [
      studentsTableContent,
      classId,
      notificationSearchQuery,
      notificationPage,
      notificationPageSize,
      handleNotificationSearchChange,
      handleNotificationPageChange,
      exerciseSearchQuery,
      exercisePage,
      exercisePageSize,
      handleExerciseSearchChange,
      handleExercisePageChange,
      examSearchQuery,
      examPage,
      examPageSize,
      handleExamSearchChange,
      handleExamPageChange,
      isTabLoading,
    ]
  );

  // Early returns after all hooks
  if (loading) {
    return loadingComponent;
  }

  if (!classData) {
    return notFoundComponent;
  }

  return (
    <div className="space-y-6">
      {/* Header - Back button */}
      <div className="flex items-center justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Quay lại
        </Button>
      </div>

      {/* Class Information Card - Full width */}
      {classInfo && <ClassInfoCard classInfo={classInfo} onCopyCode={handleCopyCode} />}

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={handleTabChange} destroyInactiveTabPane items={tabItems} />
    </div>
  );
}
