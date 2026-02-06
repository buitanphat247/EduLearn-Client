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
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getUserInfo, changePassword, updateUser, type UserInfoResponse } from "@/lib/api/users";
import { uploadFile } from "@/lib/api/file-upload";
import { getMediaUrl } from "@/lib/utils/media";
import { getCachedImageUrl } from "@/lib/utils/image-cache";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import SettingsSkeleton from "@/app/components/settings/SettingsSkeleton";
import { getNewPasswordValidationRules } from "@/lib/utils/validation";
import { updateUserSettings } from "@/lib/api/settings";

interface SettingsFormData {
  fullname: string;
  email: string;
  phone: string;
  username: string;
}

export default function UserSettings() {
  const { message: messageApi } = App.useApp();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);

  const FALLBACK_CAT = getMediaUrl("/avatars/anh3_1770318347807_gt8xnc.jpeg");

  // UI States for switches
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleUpdateSettings = async () => {
    try {
      setSaving(true);
      await updateUserSettings({
        emailNotifications,
        pushNotifications,
        systemUpdates,
        twoFactorAuth
      });
      messageApi.success("Đã cập nhật cài đặt thành công");
    } catch (error: any) {
      messageApi.error(error?.message || "Không thể cập nhật cài đặt");
    } finally {
      setSaving(false);
    }
  };

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = getUserIdFromCookie();
      if (!userId) {
        messageApi.error("Không tìm thấy thông tin người dùng");
        setLoading(false);
        return;
      }

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
  }, [profileForm, messageApi]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const userId = getUserIdFromCookie();
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      messageApi.error("Vui lòng chọn tệp hình ảnh (jpg, png, webp...)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      messageApi.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploading(true);
      const hideProgress = messageApi.loading("Đang tải ảnh lên...", 0);

      const imageUrl = await uploadFile(file, "avatars");
      const updatedUser = await updateUser(userId, { avatar: imageUrl });

      setUserInfo(updatedUser);
      setImgError(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));

      hideProgress();
      messageApi.success("Cập nhật ảnh đại diện thành công");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      messageApi.error(error.message || "Lỗi khi cập nhật ảnh đại diện");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (values: SettingsFormData) => {
    try {
      setSaving(true);
      // Use the values to update the user profile
      const userId = userInfo?.user_id;
      if (userId) {
        const updated = await updateUser(userId, values);
        setUserInfo(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("user-updated"));
      }
      messageApi.success("Đã cập nhật thông tin thành công");
    } catch (error: any) {
      messageApi.error(error?.message || "Không thể cập nhật thông tin");
      setSaving(false);
    }
  };

  // Custom Card Component
  const CustomCard = ({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-none dark:shadow-sm transition-colors duration-200 border border-slate-200 dark:border-slate-700">
      {title && <div className="mb-6">{title}</div>}
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
            <UserOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Thông tin tài khoản</span>
          </div>
        }
      >
        <div className="flex items-start gap-6 mb-6">
          <div className="relative group/avatar">
            <div className="relative overflow-hidden rounded-full border-4 border-white dark:border-slate-700 shadow-lg">
              <Avatar
                size={120}
                src={getCachedImageUrl((!userInfo?.avatar || imgError) ? FALLBACK_CAT : getMediaUrl(userInfo.avatar))}
                onError={() => {
                  setImgError(true);
                  return true;
                }}
                className="flex items-center justify-center bg-slate-100 dark:bg-slate-800"
                icon={<UserOutlined style={{ fontSize: 50, color: '#94a3b8' }} />}
              />

              {uploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <LoadingOutlined className="text-white text-3xl" />
                </div>
              )}
            </div>

            <label className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 transform group-hover/avatar:scale-110 border-2 border-white dark:border-slate-800 z-20">
              <CameraOutlined className="text-lg" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex-1 pt-2">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{userInfo?.fullname || "Học sinh"}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600 dark:text-gray-400">@{userInfo?.username || "student"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Trực tuyến</span>
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800">
              {userInfo?.role?.role_name || "Học sinh"}
            </div>
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
            <BellOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cài đặt thông báo</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Thông báo qua email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo quan trọng qua email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
          </div>

          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Thông báo đẩy</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo ngay trên trình duyệt</p>
            </div>
            <Switch
              checked={pushNotifications}
              onChange={setPushNotifications}
            />
          </div>

          <div
            className="flex items-center justify-between py-3 cursor-pointer"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Cập nhật hệ thống</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông báo về các cập nhật hệ thống</p>
            </div>
            <Switch
              checked={systemUpdates}
              onChange={setSystemUpdates}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
            onClick={handleUpdateSettings}
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
            <SecurityScanOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bảo mật</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-600! cursor-pointer"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Xác thực hai yếu tố (2FA)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố</p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onChange={setTwoFactorAuth}
            />
          </div>

          <div className="mt-6">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              onClick={handleUpdateSettings}
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
            <LockOutlined className="text-blue-600 dark:text-blue-400" />
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
            rules={getNewPasswordValidationRules()}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 dark:text-gray-500" />}
              placeholder="Nhập mật khẩu mới"
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
