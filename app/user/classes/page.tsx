"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Table, Tag, Button, App, Modal, Form, Input, Tooltip, Select } from "antd";
import { EyeOutlined, UserOutlined, KeyOutlined, StopOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getClassStudentsByUser, joinClassByCode, type ClassStudentRecord } from "@/lib/api/classes";
import { getCurrentUser } from "@/lib/api/users";
import type { ColumnsType } from "antd/es/table";
import { useUserId } from "@/app/hooks/useUserId";

type ClassStatusFilter = "all" | "online" | "banned";

interface ClassTableItem {
  key: string;
  name: string;
  code: string;
  students: number;
  status: string;
  classId: string;
  studentStatus: "online" | "banned";
}

export default function UserClasses() {
  const router = useRouter();
  const { message } = App.useApp();
  const { userId, loading: userLoading } = useUserId(); // Use hook
  const [classes, setClasses] = useState<ClassTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal join class
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [form] = Form.useForm();

  // Status filter
  const [statusFilter, setStatusFilter] = useState<ClassStatusFilter>("all");

  // Filter classes based on status - memoized
  const filteredClasses = useMemo(() => {
    if (statusFilter === "all") return classes;
    return classes.filter((c) => c.studentStatus === statusFilter);
  }, [classes, statusFilter]);

  // Count for filter badges - memoized
  const classCounts = useMemo(() => ({
    all: classes.length,
    online: classes.filter((c) => c.studentStatus === "online").length,
    banned: classes.filter((c) => c.studentStatus === "banned").length,
  }), [classes]);

  // Filter options - memoized
  const filterOptions = useMemo(() => [
    { label: `Tất cả (${classCounts.all})`, value: "all" },
    { label: `Đang học (${classCounts.online})`, value: "online" },
    { label: `Bị chặn (${classCounts.banned})`, value: "banned" },
  ], [classCounts]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map API response to table format - stable callback
  const mapClassData = useCallback((record: ClassStudentRecord): ClassTableItem => {
    // ... (unchanged)
    const classData = record.class;
    if (!classData) {
      throw new Error("Class data is missing");
    }

    return {
      key: String(record.id || classData.class_id),
      name: classData.name,
      code: classData.code,
      students: classData.student_count,
      status: classData.status === "active" ? "Đang hoạt động" : "Không hoạt động",
      classId: String(classData.class_id),
      studentStatus: (record.status as "online" | "banned") || "online",
    };
  }, []);

  // Fetch classes - stable callback
  const fetchClasses = useCallback(async () => {
    if (!userId) return; // Wait for userId

    try {
      setLoading(true);

      const result = await getClassStudentsByUser({
        userId: userId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery.trim() || undefined,
      });

      const mappedClasses: ClassTableItem[] = result.classes.map(mapClassData);

      setClasses(mappedClasses);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách lớp học");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchQuery, message, mapClassData, userId]);

  // Fetch classes on mount and when dependencies change
  useEffect(() => {
    if (userId && !userLoading) {
      fetchClasses();
    } else if (!userId && !userLoading) {
      // Handle no user if needed, e.g. redirect or show error
      setLoading(false);
    }
  }, [userId, userLoading, fetchClasses]);

  // Stable handlers
  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  const handleOpenJoinModal = useCallback(() => {
    setIsJoinModalOpen(true);
  }, []);

  const handleCloseJoinModal = useCallback(() => {
    setIsJoinModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleJoinByCode = useCallback(async (values: { code: string }) => {
    try {
      setJoining(true);
      const user = getCurrentUser();
      if (!user || !user.user_id) {
        message.error("Vui lòng đăng nhập để thực hiện hành động này");
        return;
      }

      await joinClassByCode({
        user_id: Number(user.user_id),
        code: values.code,
      });

      message.success("Tham gia lớp học thành công!");
      setIsJoinModalOpen(false);
      form.resetFields();
      fetchClasses();
    } catch (error: any) {
      message.error(error?.message || "Mã code không hợp lệ hoặc bạn đã tham gia lớp này");
    } finally {
      setJoining(false);
    }
  }, [message, form, fetchClasses]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setStatusFilter(value as ClassStatusFilter);
  }, []);

  // Stable router ref - must be defined before columns
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Memoize columns to prevent re-render
  const columns: ColumnsType<ClassTableItem> = useMemo(() => [
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ClassTableItem) => (
        <span className={`font-semibold ${record.studentStatus === "banned" ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
          {text}
        </span>
      ),
    },
    {
      title: "Mã lớp",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <span className="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{code}</span>,
    },
    {
      title: "Số học sinh",
      dataIndex: "students",
      key: "students",
      render: (count: number) => (
        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
          <UserOutlined className="text-blue-500" />
          <span className="font-medium">{count}</span>
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "studentStatus",
      key: "studentStatus",
      width: 130,
      render: (status: string) => (
        status === "banned" ? (
          <Tag icon={<StopOutlined />} color="error">Bị chặn</Tag>
        ) : (
          <Tag color="success">Đang học</Tag>
        )
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_: any, record: ClassTableItem) => (
        record.studentStatus === "banned" ? (
          <Tooltip title="Bạn đã bị chặn khỏi lớp học này">
            <Button icon={<StopOutlined />} size="small" disabled danger>
              Bị chặn
            </Button>
          </Tooltip>
        ) : (
          <Button
            icon={<EyeOutlined />}
            size="small"
            type="primary"
            ghost
            onClick={() => routerRef.current.push(`/user/classes/${record.classId}`)}
          >
            Xem
          </Button>
        )
      ),
    },
  ], []);

  // Memoize pagination config
  const paginationConfig = useMemo(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: filteredClasses.length,
    onChange: handleTableChange,
    showSizeChanger: false,
    showTotal: (total: number) => <span className="text-gray-500 dark:text-gray-400">Tổng {total} lớp học</span>,
  }), [pagination.current, pagination.pageSize, filteredClasses.length, handleTableChange]);

  // Memoize empty text
  const emptyText = useMemo(() => {
    if (statusFilter === "banned") return "Không có lớp bị chặn";
    if (statusFilter === "online") return "Không có lớp đang học";
    return "Không có lớp học";
  }, [statusFilter]);

  return (
    <div className="space-y-3">
      {/* Search, Filter, Join Button */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm lớp học hoặc mã code... (Ctrl+K)"
          size="middle"
          className="flex-1 min-w-[200px] dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
          value={searchQuery}
          onChange={handleSearchChange}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={handleFilterChange}
          style={{ width: 160 }}
          options={filterOptions}
          size="middle"
        />
        <Button type="primary" icon={<KeyOutlined />} size="middle" onClick={handleOpenJoinModal} className="shadow-sm">
          Tham gia bằng code
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredClasses}
          loading={loading}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
          className="[&_.ant-pagination]:px-6 [&_.ant-pagination]:pb-4"
          rowClassName="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-800"
          size="middle"
          locale={{ emptyText }}
        />
      </div>

      {/* Modal Tham gia lớp học */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <KeyOutlined />
            <span>Tham gia lớp học bằng mã code</span>
          </div>
        }
        open={isJoinModalOpen}
        onCancel={handleCloseJoinModal}
        onOk={() => form.submit()}
        confirmLoading={joining}
        okText="Tham gia ngay"
        cancelText="Hủy"
        centered
        width={400}
      >
        <div className="py-2">
          <p className="text-gray-500 mb-4 text-sm">Vui lòng nhập mã code chính xác do giáo viên cung cấp để tham gia vào lớp học.</p>
          <Form form={form} layout="vertical" onFinish={handleJoinByCode}>
            <Form.Item
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã code!" },
                { min: 5, message: "Mã code quá ngắn!" },
              ]}
            >
              <Input
                prefix={<KeyOutlined className="text-gray-400" />}
                placeholder="Nhập mã code tại đây..."
                size="large"
                className="rounded-lg dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
                autoFocus
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
