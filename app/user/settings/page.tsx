"use client";

import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Divider, Avatar, App } from "antd";
import Swal from "sweetalert2";
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  LoadingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { getUserInfo, changePassword, updateUser, type UserInfoResponse } from "@/lib/api/users";
import { signOutAllDevices } from "@/lib/api/auth";
import { uploadFile } from "@/lib/api/file-upload";
import { getMediaUrl } from "@/lib/utils/media";
import { getCachedImageUrl } from "@/lib/utils/image-cache";
import { useUserId } from "@/app/hooks/useUserId";
import SettingsSkeleton from "@/app/components/settings/SettingsSkeleton";
import { getNewPasswordValidationRules } from "@/lib/utils/validation";
import { saveUserDataToSession } from "@/lib/utils/cookies";
import { useTheme } from "@/app/context/ThemeContext";

interface SettingsFormData {
  fullname: string;
  email: string;
  phone: string;
  username: string;
}

export default function UserSettings() {
  const { message: messageApi } = App.useApp();
  const { userId, loading: userIdLoading } = useUserId(); // Use hook
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    if (userIdLoading || !userId) {
      if (!userIdLoading && !userId) {
        messageApi.error("Không tìm thấy thông tin người dùng");
        if (isMountedRef.current) setLoading(false);
      }
      return () => { isMountedRef.current = false; };
    }

    const fetchUserInfo = async () => {
      try {
        if (isMountedRef.current) setLoading(true);
        const user = await getUserInfo(userId);
        if (!isMountedRef.current) return;
        setUserInfo(user);
        profileForm.setFieldsValue({
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          username: user.username,
        });
      } catch (error: any) {
        if (isMountedRef.current) {
          messageApi.error(error?.message || "Không thể tải thông tin người dùng");
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    fetchUserInfo();
    return () => { isMountedRef.current = false; };
  }, [userId, userIdLoading, profileForm, messageApi]);

  const handleAvatarClick = () => {
    if (uploading) return;

    Swal.fire({
      title: "Đổi ảnh đại diện?",
      text: "Bạn có muốn thay đổi ảnh đại diện mới không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Đổi ngay",
      cancelButtonText: "Hủy",
      background: theme === 'dark' ? '#1e293b' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        fileInputRef.current?.click();
      }
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      saveUserDataToSession(updatedUser);
      window.dispatchEvent(new Event("user-updated"));

      hideProgress();

      Swal.fire({
        title: "Thành công!",
        text: "Ảnh đại diện đã được cập nhật.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000',
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      messageApi.error(error.message || "Lỗi khi cập nhật ảnh đại diện");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
        saveUserDataToSession(updated);
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

  return (
    <div className="space-y-6">
      {loading && <SettingsSkeleton />}
      {/* Always render Form elements to prevent useForm warning, but hide when loading */}
      <div style={{ display: loading ? 'none' : 'block' }}>
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
              <div className="relative p-1 rounded-full bg-blue-500 dark:bg-blue-600 shadow-lg">
                <Avatar
                  size={120}
                  src={userInfo?.avatar && !imgError ? getCachedImageUrl(getMediaUrl(userInfo.avatar)) : undefined}
                  onError={() => {
                    setImgError(true);
                    return true;
                  }}
                  className="flex items-center justify-center bg-blue-600"
                  icon={<UserOutlined style={{ fontSize: 50, color: '#ffffff' }} />}
                />
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-full">
                  <LoadingOutlined className="text-white text-3xl" />
                </div>
              )}

              <button
                onClick={handleAvatarClick}
                className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 transform group-hover/avatar:scale-110 border-2 border-white dark:border-slate-800 z-20"
                disabled={uploading}
              >
                <CameraOutlined className="text-lg" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </button>
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

        {/* Đăng xuất khỏi mọi thiết bị */}
        <CustomCard
          title={
            <div className="flex items-center gap-3">
              <LogoutOutlined className="text-orange-500" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Đăng xuất khỏi mọi thiết bị</span>
            </div>
          }
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thao tác này sẽ đăng xuất tài khoản của bạn trên tất cả thiết bị (điện thoại, máy tính, trình duyệt khác). Bạn sẽ cần đăng nhập lại khi sử dụng lại.
          </p>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            loading={logoutAllLoading}
            size="large"
            onClick={() => {
              Swal.fire({
                title: "Đăng xuất mọi thiết bị?",
                text: "Bạn sẽ bị đăng xuất ở tất cả thiết bị và cần đăng nhập lại.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Đăng xuất tất cả",
                cancelButtonText: "Hủy",
                background: theme === "dark" ? "#1e293b" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
              }).then((result) => {
                if (result.isConfirmed) {
                  setLogoutAllLoading(true);
                  signOutAllDevices();
                }
              });
            }}
            className="rounded-lg"
          >
            Đăng xuất ra tất cả thiết bị
          </Button>
        </CustomCard>
      </div>
    </div>
  );
}
