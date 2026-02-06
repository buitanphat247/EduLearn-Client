"use client";

import { Table, Tag, Button, Space, Select, App, Spin, Input, Modal, Form } from "antd";
import { SearchOutlined, EditOutlined, EyeOutlined, PlusOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { getUsers, createUser, getUserInfo, type GetUsersResponse, type UserInfoResponse } from "@/lib/api/users";
import UserDetailModal from "@/app/components/super-admin/UserDetailModal";
import UpdateUserStatusModal from "@/app/components/super-admin/UpdateUserStatusModal";
import { getPasswordValidationRules } from "@/lib/utils/validation";

const { Option } = Select;

interface AccountType {
  key: string;
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  status?: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

export default function SuperAdminAccounts() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  
  // Gộp modal states thành một object
  const [modalState, setModalState] = useState({
    search: false,
    addSingle: false,
    viewDetail: false,
    updateStatus: false,
  });

  // State cho update status modal
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string; status?: string } | null>(null);

  // Gộp user detail states thành một object
  const [userDetailState, setUserDetailState] = useState<{
    userId: number | null;
    data: UserInfoResponse | null;
    loading: boolean;
  }>({
    userId: null,
    data: null,
    loading: false,
  });

  const [selectedRole, setSelectedRole] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setModalState((prev) => ({ ...prev, search: true }));
      }
      if (e.key === "Escape" && modalState.search) {
        setModalState((prev) => ({ ...prev, search: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState.search]);

  const fetchUsers = async (page: number = 1, limit: number = 10, search?: string) => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) {
      return;
    }

    isFetching.current = true;
    setLoading(true);
    const startTime = Date.now();

    try {
      const result = await getUsers({ page, limit, search });

      const users = result.users || [];
      const total = result.total || 0;

      // Ensure minimum loading time of 1.5 seconds
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      if (!users || users.length === 0) {
        setAccounts([]);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: 0,
        }));
        return;
      }

      const formattedData: AccountType[] = users.map((user: GetUsersResponse) => ({
        key: user.user_id.toString(),
        user_id: user.user_id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        status: user.status,
        role_id: user.role_id,
        role_name: user.role?.role_name || "",
        created_at: user.created_at,
      }));

      setAccounts(formattedData);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: total,
      }));
    } catch (error: unknown) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      message.error(error?.message || "Không thể tải danh sách tài khoản");
      setAccounts([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUsers(pagination.current, pagination.pageSize, debouncedSearchQuery);
    }
  }, []);

  useEffect(() => {
    // Reset to page 1 when debounced search changes
    if (hasFetched.current) {
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchUsers(1, pagination.pageSize, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handleTableChange = (page: number, pageSize: number) => {
    if (!isFetching.current) {
      fetchUsers(page, pageSize, debouncedSearchQuery);
    }
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  // Sử dụng useMemo để tránh tính toán lại filteredData không cần thiết
  const filteredData = useMemo(() => {
    return accounts.filter((item) => {
      const matchesRole = !selectedRole || item.role_id === selectedRole;
      return matchesRole;
    });
  }, [accounts, selectedRole]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleViewUser = useCallback(async (userId: number) => {
    // Set all states in one batch to reduce rerenders
    setModalState((prev) => ({ ...prev, viewDetail: true }));
    setUserDetailState({
      userId,
      data: null,
      loading: true,
    });

    try {
      const userData = await getUserInfo(userId);
      // Only update userDetail and loading state on success
      setUserDetailState({
        userId,
        data: userData,
        loading: false,
      });
    } catch (error: unknown) {
      message.error(error?.message || "Không thể tải thông tin người dùng");
      // Close modal and reset on error
      setModalState((prev) => ({ ...prev, viewDetail: false }));
      setUserDetailState({
        userId: null,
        data: null,
        loading: false,
      });
    }
  }, [message]);

  const columns: ColumnsType<AccountType> = [
    {
      title: "STT",
      dataIndex: "user_id",
      key: "user_id",
      width: 80,
      render: (_: any, __: AccountType, index: number) => {
        const currentPage = pagination.current;
        const pageSize = pagination.pageSize;
        const stt = (currentPage - 1) * pageSize + index + 1;
        return <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded line-clamp-1">{stt}</span>;
      },
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (text: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">{text}</span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      width: 150,
      render: (text: string) => <span className="text-gray-600 line-clamp-1">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (text: string) => <span className="text-gray-600 line-clamp-1">{text}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: string | null) => <span className="text-gray-600 line-clamp-1">{phone || "-"}</span>,
    },
    {
      title: "Vai trò",
      dataIndex: "role_name",
      key: "role_name",
      width: 120,
      render: (roleName: string, record: AccountType) => {
        const roleMap: Record<number, { color: string; text: string }> = {
          1: { color: "red", text: "Admin" },
          2: { color: "blue", text: "Giảng viên" },
          3: { color: "green", text: "Học sinh" },
        };
        const roleInfo = roleMap[record.role_id] || { color: "default", text: roleName || "N/A" };
        return (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs line-clamp-1" color={roleInfo.color}>
            {roleInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          online: { color: "green", text: "Hoạt động" },
          banned: { color: "red", text: "Bị cấm" },
        };
        const statusInfo = statusMap[status || "online"] || { color: "default", text: status || "N/A" };
        return (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => <span className="text-gray-600 line-clamp-1">{formatDate(date)}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: unknown, record: AccountType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedUser({
            id: record.user_id,
            username: record.username,
            status: record.status,
          });
          setModalState((prev) => ({ ...prev, updateStatus: true }));
        };

        return (
          <Space size={4}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleViewUser(record.user_id);
              }}
            >
              Xem
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
              onClick={handleEdit}
            >
              Sửa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Input
          prefix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
          placeholder="Tìm kiếm theo email, số điện thoại, hoặc username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          className="flex-1 min-w-[200px]"
          size="middle"
        />
        <Space>
          <Button
            type="default"
            icon={<PlusOutlined />}
            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => setModalState((prev) => ({ ...prev, addSingle: true }))}
            size="middle"
          >
            Thêm single
          </Button>
          <Button
            type="default"
            icon={<UploadOutlined />}
            className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => router.push("/super-admin/accounts/create")}
            size="middle"
          >
            Thêm file
          </Button>
        </Space>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} tài khoản`,
            size: "small",
            onChange: handleTableChange,
          }}
          className="news-table"
          rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
          size="small"
        />
      </div>

      {/* Add Single Account Modal */}
      <Modal
        title="Thêm tài khoản"
        open={modalState.addSingle}
        onCancel={() => {
          setModalState((prev) => ({ ...prev, addSingle: false }));
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <SingleAccountForm
          form={form}
          onSuccess={() => {
            setModalState((prev) => ({ ...prev, addSingle: false }));
            form.resetFields();
            fetchUsers(pagination.current, pagination.pageSize, debouncedSearchQuery);
          }}
        />
      </Modal>

      {/* User Detail Modal */}
      <UserDetailModal
        open={modalState.viewDetail}
        onCancel={() => {
          setModalState((prev) => ({ ...prev, viewDetail: false }));
          setUserDetailState({
            userId: null,
            data: null,
            loading: false,
          });
        }}
        userDetail={userDetailState.data}
        loading={userDetailState.loading}
      />

      {/* Update User Status Modal */}
      <UpdateUserStatusModal
        open={modalState.updateStatus}
        onCancel={() => {
          setModalState((prev) => ({ ...prev, updateStatus: false }));
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setModalState((prev) => ({ ...prev, updateStatus: false }));
          setSelectedUser(null);
          // Refresh danh sách users
          fetchUsers(pagination.current, pagination.pageSize, debouncedSearchQuery);
        }}
        userId={selectedUser?.id || 0}
        currentStatus={selectedUser?.status}
        userName={selectedUser?.username}
      />
    </div>
  );
}

function SingleAccountForm({ form, onSuccess }: { form: ReturnType<typeof Form.useForm>[0]; onSuccess: () => void }) {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createUser({
        username: values.username,
        fullname: values.fullname,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role_id: values.role_id,
      });
      message.success("Tạo tài khoản thành công!");
      onSuccess();
    } catch (error: unknown) {
      message.error(error?.message || "Không thể tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
        <Input placeholder="Nhập họ và tên" />
      </Form.Item>

      <Form.Item name="username" label="Username" rules={[{ required: true, message: "Vui lòng nhập username!" }]}>
        <Input placeholder="Nhập username" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" },
        ]}
      >
        <Input placeholder="Nhập email" />
      </Form.Item>

      <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
        <Input placeholder="Nhập số điện thoại" />
      </Form.Item>

      <Form.Item name="role_id" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
        <Select placeholder="Chọn vai trò">
          <Option value={1}>Admin</Option>
          <Option value={2}>Giảng viên</Option>
          <Option value={3}>Học sinh</Option>
        </Select>
      </Form.Item>

      <Form.Item name="password" label="Mật khẩu" rules={getPasswordValidationRules()}>
        <Input.Password placeholder="Nhập mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Tạo tài khoản
          </Button>
          <Button onClick={() => form.resetFields()}>Làm mới</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
