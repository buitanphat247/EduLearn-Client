"use client";

import { Table, Tag, Button, Space, Select, App, Spin, Input, Modal, Form } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { getUsers, type GetUsersResponse } from "@/lib/api/users";

const { Option } = Select;

interface AccountType {
  key: string;
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  role_id: number;
  role_name: string;
  created_at: string;
}

export default function SuperAdminAccounts() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAddSingleModalOpen, setIsAddSingleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  const fetchUsers = async (page: number = 1, limit: number = 10, search?: string) => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) {
      return;
    }

    isFetching.current = true;
    setLoading(true);
    try {
      const result = await getUsers({ page, limit, search });
      
      const users = result.users || [];
      const total = result.total || 0;

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
    } catch (error: any) {
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
    }, 1000);

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const filteredData = accounts.filter((item) => {
    const matchesRole = !selectedRole || item.role_id === selectedRole;
    return matchesRole;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const columns: ColumnsType<AccountType> = [
    {
      title: "ID",
      dataIndex: "user_id",
      key: "user_id",
      width: 80,
      render: (id: number) => <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{id}</span>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (text: string) => <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{text}</span>,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      width: 150,
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: string | null) => <span className="text-gray-600">{phone || "-"}</span>,
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
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={roleInfo.color}>
            {roleInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => <span className="text-gray-600">{formatDate(date)}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: AccountType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa tài khoản "${record.username}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
              message.warning("Tính năng đang được phát triển");
            },
          });
        };

        return (
          <Space size={4}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                message.info("Tính năng đang được phát triển");
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
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              className="hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quản lý tài khoản
          </h1>
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setIsAddSingleModalOpen(true)}
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

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            prefix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
            placeholder="Tìm kiếm theo email, số điện thoại, hoặc username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            disabled={loading}
            className="flex-1 min-w-[200px]"
            size="middle"
          />

      
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          position: ["bottomRight"],
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} tài khoản`,
          className: "px-4 py-3",
          size: "small",
          onChange: handleTableChange,
        }}
        className="news-table"
        rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
        size="small"
        style={{
          padding: "0",
        }}
      />

      {/* Add Single Account Modal */}
      <Modal
        title="Thêm tài khoản"
        open={isAddSingleModalOpen}
        onCancel={() => {
          setIsAddSingleModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <SingleAccountForm
          form={form}
          onSuccess={() => {
            setIsAddSingleModalOpen(false);
            form.resetFields();
            fetchUsers(pagination.current, pagination.pageSize, debouncedSearchQuery);
          }}
        />
      </Modal>
    </div>
  );
}

function SingleAccountForm({ form, onSuccess }: { form: any; onSuccess: () => void }) {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // TODO: Call API to create account
      console.log("Creating account:", values);
      message.success("Tạo tài khoản thành công!");
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} >
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

      <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
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
