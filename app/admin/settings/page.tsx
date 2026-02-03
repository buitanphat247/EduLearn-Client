"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Switch, Divider, Avatar, App } from "antd";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  SecurityScanOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { getUserInfo, changePassword, type UserInfoResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";
import SettingsSkeleton from "@/app/components/settings/SettingsSkeleton";

interface SettingsFormData {
  fullname: string;
  email: string;
  phone: string;
  username: string;
}

export default function AdminSettings() {
  const { message: messageApi } = App.useApp();
  const { userId, loading: userIdLoading } = useUserId();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Fetch user info
  useEffect(() => {
    if (userIdLoading || !userId) {
      if (!userIdLoading && !userId) {
        messageApi.error("Không tìm thấy thông tin người dùng");
        setLoading(false);
      }
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const user = await getUserInfo(userId);
        setUserInfo(user);
        profileForm.setFieldsValue({
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          username: user.username,
        });
      } catch (error: any) {
        messageApi.error(error?.message || "Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, userIdLoading, profileForm, messageApi]);

  const handleSaveProfile = async (values: SettingsFormData) => {
    try {
      setSaving(true);
      // TODO: Call API to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      messageApi.success("Đã cập nhật thông tin thành công");
    } catch (error: any) {
      messageApi.error(error?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // TODO: Call API to save notification settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      messageApi.success("Đã lưu cài đặt thông báo");
    } catch (error: any) {
      messageApi.error("Không thể lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setSaving(true);
      // TODO: Call API to save security settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      messageApi.success("Đã lưu cài đặt bảo mật");
    } catch (error: any) {
      messageApi.error("Không thể lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  // Custom Card Component
  const CustomCard = ({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm mb-6 transition-colors duration-200 border border-slate-200 dark:border-slate-700">
      {title && <div className="mb-6 text-gray-800 dark:text-gray-100">{title}</div>}
      {children}
    </div>
  );

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <CustomCard
        title={
          <div className="flex items-center gap-3">
            <UserOutlined className="text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Thông tin tài khoản</span>
          </div>
        }
      >
        <div className="flex items-start gap-6 mb-6">
          <Avatar
            size={100}
            src={userInfo?.avatar}
            icon={<UserOutlined />}
            className="bg-blue-600 flex items-center justify-center text-white text-2xl font-bold"
          >
            {userInfo?.fullname ? getInitials(userInfo.fullname) : "A"}
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{userInfo?.fullname || "Admin"}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">@{userInfo?.username || "admin"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">{userInfo?.role?.role_name || "Giáo viên"}</p>
          </div>
        </div>

        <Divider className="dark:border-slate-600!" />

        <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-gray-700 dark:text-gray-300">Họ và tên</span>}
              name="fullname"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 dark:text-gray-500" />}
                placeholder="Nhập họ và tên"
                size="large"
                className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 dark:text-gray-300">Tên đăng nhập</span>}
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400 dark:text-gray-600" />}
                placeholder="Nhập tên đăng nhập"
                size="large"
                disabled
                className="dark:bg-gray-900/50 dark:border-slate-700! dark:text-gray-400"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 dark:text-gray-300">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400 dark:text-gray-500" />}
                placeholder="Nhập email"
                size="large"
                className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
              />
            </Form.Item>

            <Form.Item label={<span className="text-gray-700 dark:text-gray-300">Số điện thoại</span>} name="phone">
              <Input
                prefix={<PhoneOutlined className="text-gray-400 dark:text-gray-500" />}
                placeholder="Nhập số điện thoại"
                size="large"
                className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
              />
            </Form.Item>
          </div>

          <div className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              className="bg-blue-600 hover:bg-blue-700 border-none"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </CustomCard>

      {/* Notification Settings */}
      <CustomCard
        title={
          <div className="flex items-center gap-3">
            <BellOutlined className="text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cài đặt thông báo</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
            onClick={() => messageApi.info("Tính năng đang phát triển")}
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Thông báo qua email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo quan trọng qua email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onChange={() => { }}
              disabled
            />
          </div>

          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
            onClick={() => messageApi.info("Tính năng đang phát triển")}
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Thông báo đẩy</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo ngay trên trình duyệt</p>
            </div>
            <Switch
              checked={pushNotifications}
              onChange={() => { }}
              disabled
            />
          </div>

          <div
            className="flex items-center justify-between py-3 cursor-pointer"
            onClick={() => messageApi.info("Tính năng đang phát triển")}
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Cập nhật hệ thống</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo về các cập nhật hệ thống</p>
            </div>
            <Switch
              checked={systemUpdates}
              onChange={() => { }}
              disabled
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
            onClick={() => messageApi.info("Tính năng đang phát triển")}
            disabled
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            Lưu cài đặt
          </Button>
        </div>
      </CustomCard>

      {/* Security Settings */}
      <CustomCard
        title={
          <div className="flex items-center gap-3">
            <SecurityScanOutlined className="text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bảo mật</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
            onClick={() => messageApi.info("Tính năng đang phát triển")}
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Xác thực hai yếu tố (2FA)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố</p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onChange={() => { }}
              disabled
            />
          </div>

          <div className="mt-6">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              onClick={() => messageApi.info("Tính năng đang phát triển")}
              disabled
              className="bg-blue-600 hover:bg-blue-700 border-none"
            >
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </CustomCard>

      {/* Change Password */}
      <CustomCard
        title={
          <div className="flex items-center gap-3">
            <LockOutlined className="text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Đổi mật khẩu</span>
          </div>
        }
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setSaving(true);

              await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });

              messageApi.success("Đã đổi mật khẩu thành công");
              passwordForm.resetFields();
            } catch (error: any) {
              messageApi.error(error?.message || "Không thể đổi mật khẩu");
            } finally {
              setSaving(false);
            }
          }}
        >
          <Form.Item
            label={<span className="text-gray-700 dark:text-gray-300">Mật khẩu hiện tại</span>}
            name="currentPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 dark:text-gray-500" />}
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
              className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 dark:text-gray-300">Mật khẩu mới</span>}
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 dark:text-gray-500" />}
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
              className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 dark:text-gray-300">Xác nhận mật khẩu mới</span>}
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 dark:text-gray-500" />}
              placeholder="Xác nhận mật khẩu mới"
              size="large"
              className="dark:bg-gray-700/50 dark:border-slate-600! dark:text-white dark:placeholder-gray-500 hover:dark:border-slate-500! focus:dark:border-blue-500!"
            />
          </Form.Item>

          <div className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              className="bg-blue-600 hover:bg-blue-700 border-none"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </CustomCard>
    </div>
  );
}
