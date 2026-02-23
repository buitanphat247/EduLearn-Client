"use client";

import { useState, useCallback } from "react";
import { Typography, Button, Space, Breadcrumb, Modal, Form, Input, Switch, Divider, App, Spin } from "antd";
import { PlusOutlined, KeyOutlined, RobotOutlined, UserOutlined, TeamOutlined, SafetyOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// Sub-components
import PermissionMatrix from "./components/PermissionMatrix";
import { Role } from "./types";
import { getRoles } from "@/lib/api/permissions";

const { Title, Text } = Typography;

const MODULES = ["Dashboard", "Tài khoản", "Lớp học", "Đề thi (RAG)", "Tài liệu Crawl", "Tin tức & Bài viết", "Sự kiện", "Phân quyền"];

const ACTIONS = [
  { key: "view", label: "Xem", color: "blue" },
  { key: "create", label: "Tạo mới", color: "green" },
  { key: "edit", label: "Chỉnh sửa", color: "orange" },
  { key: "delete", label: "Xóa", color: "red" },
  { key: "approve", label: "Duyệt", color: "purple" },
];

const ROLE_ICONS: Record<string, any> = {
  admin: <RobotOutlined />,
  teacher: <TeamOutlined />,
  student: <UserOutlined />,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#ef4444",
  teacher: "#22c55e",
  student: "#6366f1",
  guest: "#64748b",
};

export default function PermissionPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { data: roles = [], isLoading: loading } = useQuery({
    queryKey: ['admin_roles'],
    queryFn: async () => {
      const response = await getRoles();
      const data = response.data || response;

      const mappedRoles: Role[] = data.map((r: any) => ({
        id: r.role_id.toString(),
        name: r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1),
        color: ROLE_COLORS[r.role_name.toLowerCase()] || "#64748b",
        icon: ROLE_ICONS[r.role_name.toLowerCase()] || <UserOutlined />,
        status: "active",
        permissions: [],
        apiPermissionIds: r.rolePermissions?.map((rp: any) => rp.permission_id) || [],
      }));

      if (mappedRoles.length > 0 && !selectedRole) {
        setSelectedRole(mappedRoles[0]);
      }

      return mappedRoles;
    },
    staleTime: 30 * 1000, // 30s - admin needs fresh data
  });

  const handleSaveMatrix = useCallback(() => {
    message.success("Đã cập nhật bảng phân quyền thành công!");
  }, [message]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-6">
        {/* Permissions Matrix Area - Full Width */}
        <div className="col-span-12">
          <PermissionMatrix selectedRole={selectedRole} roles={roles} modules={MODULES} actions={ACTIONS} onSave={handleSaveMatrix} />
        </div>
      </div>

      {/* New Role Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined className="text-blue-500" />
            <span>Thêm / Chỉnh sửa Vai trò</span>
          </Space>
        }
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={() => {
          message.success("Đã cập nhật vai trò!");
          setIsRoleModalOpen(false);
        }}
        okText="Lưu lại"
        cancelText="Hủy"
        width={500}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <Form layout="vertical" className="pt-4">
          <Form.Item label="Tên vai trò" required>
            <Input placeholder="Ví dụ: Moderator, Content Creator..." className="h-10 rounded-lg" />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Input.TextArea placeholder="Mô tả chức năng của vai trò này" rows={3} className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Mã màu nhận diện">
            <div className="flex gap-3">
              {["blue", "red", "green", "gold", "purple", "magenta"].map((c) => (
                <div
                  key={c}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${c === "blue" ? "border-gray-800 scale-110" : "border-transparent"
                    }`}
                  style={{ backgroundColor: c === "gold" ? "#faad14" : c === "magenta" ? "#eb2f96" : c }}
                />
              ))}
            </div>
          </Form.Item>
          <Divider />
          <Form.Item label="Trạng thái kích hoạt">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <Text>Cho phép các tài khoản thuộc vai trò này đăng nhập và hoạt động</Text>
              <Switch defaultChecked />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
