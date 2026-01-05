"use client";

import { Table, Input, Button, App, Spin } from "antd";
import { SearchOutlined, UserAddOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getStudents, type StudentResponse } from "@/lib/api/users";
import { addStudentToClass, getClassById } from "@/lib/api/classes";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import type { ColumnsType } from "antd/es/table";
import { ensureMinLoadingTime, calculatePaginationAdjustment } from "@/lib/utils/classUtils";

export default function AddSingleStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;

  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingStudentId, setAddingStudentId] = useState<string | number | null>(null);
  const [classInfo, setClassInfo] = useState<{ name: string; code: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    if (!classId) return;

    const fetchClassInfo = async () => {
      try {
        const userId = getUserIdFromCookie();
        const numericUserId = userId ? (typeof userId === "string" ? Number(userId) : userId) : undefined;
        const data = await getClassById(classId, numericUserId);
        setClassInfo({ name: data.name, code: data.code });
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thông tin lớp học");
      }
    };

    fetchClassInfo();
  }, [classId, message]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudents = useCallback(async () => {
    if (!classId) return;

    const startTime = Date.now();
    try {
      setLoading(true);
      const result = await getStudents({
        classId: classId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery || undefined,
      });

      const adjustedPage = calculatePaginationAdjustment(
        pagination.current,
        result.total,
        pagination.pageSize,
        result.students.length
      );

      if (adjustedPage !== null) {
        setPagination((prev) => ({ ...prev, current: adjustedPage, total: result.total }));
        await ensureMinLoadingTime(startTime);
        setLoading(false);
        return;
      }

      setStudents(result.students);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        page: result.page,
        limit: result.limit,
      }));

      await ensureMinLoadingTime(startTime);
    } catch (error: any) {
      await ensureMinLoadingTime(startTime);
      message.error(error?.message || "Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  }, [classId, pagination.current, pagination.pageSize, debouncedSearchQuery, message]);

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId, pagination.current, pagination.pageSize, debouncedSearchQuery, fetchStudents]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleAddStudent = async (student: StudentResponse) => {
    setAddingStudentId(student.user_id);
    
    try {
      await addStudentToClass({
        class_id: classId,
        user_id: student.user_id,
      });

      message.success(`Đã thêm học sinh "${student.fullname}" vào lớp`);
      await fetchStudents();
      setAddingStudentId(null);
    } catch (error: any) {
      message.error(error?.message || "Không thể thêm học sinh vào lớp");
      setAddingStudentId(null);
    }
  };

  const columns: ColumnsType<StudentResponse> = [
    {
      title: "Mã học sinh",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{text}</span>,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      width: "50%",
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string | null) => phone || <span className="text-gray-400">-</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: StudentResponse) => {
        const isAdding = addingStudentId === record.user_id;
        return (
          <Spin spinning={isAdding}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size="small"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => handleAddStudent(record)}
              disabled={isAdding}
            >
              Thêm
            </Button>
          </Spin>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title, Class Info, Back Button and Search */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm học sinh vào lớp</h1>
          {classInfo && (
            <p className="text-gray-600">
              Lớp: {classInfo.name} ({classInfo.code})
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm theo tên, email, username..."
            size="middle"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="w-80"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/admin/classes/${classId}`)}
          >
            Quay lại
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey={(record) => String(record.user_id)}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `Tổng ${total} học sinh`,
            onChange: handleTableChange,
          }}
          size="middle"
        />
      </Spin>
    </div>
  );
}

