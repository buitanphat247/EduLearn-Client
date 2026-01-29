"use client";

import { Table, Button, App, Input, Spin, Tag } from "antd";
import { SearchOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { ColumnsType } from "antd/es/table";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import { getStudentsByUserId, type StudentResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";
import type { StudentItem } from "@/interface/students";

export default function AdminStudents() {
  const { message } = App.useApp();
  const { userId, loading: userIdLoading } = useUserId();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);
  const pageSizeRef = useRef(pagination.pageSize);

  // Map API status to display status
  const mapStatus = useCallback((apiStatus: string): StudentItem["status"] => {
    if (apiStatus === "online") return "Đang học";
    if (apiStatus === "banned") return "Bị cấm";
    return "Đang học"; // Default
  }, []);

  // Map API response to StudentItem
  const mapStudentResponse = useCallback(
    (student: StudentResponse): StudentItem => {
      return {
        key: String(student.user_id),
        userId: student.user_id,
        name: student.fullname,
        studentId: student.username,
        class: "N/A", // API doesn't provide class info directly
        email: student.email,
        phone: student.phone || "",
        status: mapStatus(student.status || "online"),
        apiStatus: student.status || "online",
      };
    },
    [mapStatus]
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update pageSize ref when pagination changes
  useEffect(() => {
    pageSizeRef.current = pagination.pageSize;
  }, [pagination.pageSize]);

  // Fetch students from API
  const fetchStudents = useCallback(
    async (page: number = 1, limit: number = 10, search?: string) => {
      if (userIdLoading || !userId) {
        return;
      }

      const startTime = Date.now();
      try {
        setLoading(true);
        const result = await getStudentsByUserId(userId, {
          page,
          limit,
          search: search?.trim() || undefined,
        });

        const mapped: StudentItem[] = (result.data || []).map(mapStudentResponse);

        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 250;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        setStudents(mapped);
        setPagination((prev) => ({
          ...prev,
          current: result.page || page,
          pageSize: result.limit || limit,
          total: result.total || mapped.length,
        }));
      } catch (error: any) {
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 250;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        message.error(error?.message || "Không thể tải danh sách học sinh");
      } finally {
        setLoading(false);
      }
    },
    [userId, userIdLoading, message, mapStudentResponse]
  );

  // Hiển thị lỗi nếu không có user_id sau khi đợi decrypt
  useEffect(() => {
    if (!userIdLoading && !userId) {
      message.error("Không tìm thấy thông tin người dùng");
    }
  }, [userId, userIdLoading, message]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchStudents(pagination.current, pagination.pageSize, debouncedSearchQuery);
    } else {
      fetchStudents(pagination.current, pagination.pageSize, debouncedSearchQuery);
    }
  }, [fetchStudents, pagination.current, pagination.pageSize, debouncedSearchQuery]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  const handleViewStudent = useCallback((student: StudentItem) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  }, []);

  const columns: ColumnsType<StudentItem> = useMemo(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 80,
        render: (_: any, __: StudentItem, index: number) => {
          const currentPage = pagination.current;
          const pageSize = pagination.pageSize;
          const stt = (currentPage - 1) * pageSize + index + 1;
          return (
            <span className="text-gray-600 dark:text-gray-300 font-mono text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
              {stt}
            </span>
          );
        },
      },
      {
        title: "Họ và tên",
        dataIndex: "name",
        key: "name",
        render: (text: string) => (
          <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {text}
          </span>
        ),
      },
      {
        title: "Mã học sinh",
        dataIndex: "studentId",
        key: "studentId",
        render: (id: string) => (
          <span className="text-gray-600 dark:text-gray-300 font-mono text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
            {id}
          </span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (email: string) => <span className="text-gray-600 dark:text-gray-400">{email}</span>,
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        render: (phone: string) => <span className="text-gray-600 dark:text-gray-400">{phone || "N/A"}</span>,
      },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        render: (_: any, record: StudentItem) => {
          return (
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleViewStudent(record);
              }}
            >
              Xem
            </Button>
          );
        },
      },
    ],
    [pagination.current, pagination.pageSize, handleViewStudent]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
          placeholder="Tìm kiếm học sinh..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="flex-1 min-w-[200px] dark:bg-gray-800 dark:border-slate-600 dark:text-white dark:placeholder-gray-500"
          size="middle"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={students}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: false,
              showTotal: (total) => <span className="text-gray-500 dark:text-gray-400">Tổng {total} học sinh</span>,
              // pageSizeOptions: ["10", "20", "50"],
              size: "small",
              onChange: handleTableChange,
            }}
            className="[&_.ant-pagination]:px-6 [&_.ant-pagination]:pb-4"
            rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-800"
            size="small"
            onRow={(record) => ({
              onClick: () => {
                handleViewStudent(record);
              },
            })}
          />
        </Spin>
      </div>

      <StudentDetailModal
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
}
