"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Avatar, Descriptions, Tag, Button, Divider, Spin, message, Space } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  EditOutlined,
  IdcardOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import CustomCard from "@/app/components/common/CustomCard";
import { getUserInfo, getCurrentUser } from "@/lib/api/users";
import type { UserInfoResponse } from "@/lib/api/users";

export default function Profile() {
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchUserInfo = async () => {
      hasFetched.current = true;
      try {
        const currentUser = getCurrentUser();
        if (currentUser?.user_id) {
          const userInfo = await getUserInfo(currentUser.user_id);
          setUser(userInfo);
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        message.error(error.message || "Không thể tải thông tin user");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Không tìm thấy thông tin user</p>
      </div>
    );
  }

  const isAdmin = user.role?.role_name?.toLowerCase() === "admin";

  return (
    <div className=" container mx-auto  px-4 py-8">
      <div className="mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-blue-500 via-blue-600 to-cyan-500 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar size={140} src={user.avatar} icon={<UserOutlined />} className="border-4 border-white shadow-xl" />
                {isAdmin && (
                  <div className="absolute top-0 right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                    <CrownOutlined className="text-yellow-800 text-xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-4xl font-bold mb-2">{user.fullname}</h1>
                <p className="text-blue-100 text-lg mb-4">@{user.username}</p>
                <Space size="middle" wrap>
                  <Tag
                    color={isAdmin ? "red" : "blue"}
                    className="px-4 py-1 text-sm font-semibold border-0"
                    style={{
                      backgroundColor: isAdmin ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {user.role?.role_name?.toUpperCase() || "N/A"}
                  </Tag>
                  <Tag
                    color="success"
                    className="px-4 py-1 text-sm font-semibold border-0"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <CheckCircleOutlined className="mr-1" />
                    Đang hoạt động
                  </Tag>
                </Space>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <CustomCard padding="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MailOutlined className="text-blue-500" />
                Thông tin liên hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MailOutlined className="text-blue-600 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-gray-800 font-medium break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <PhoneOutlined className="text-green-600 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                    <p className="text-gray-800 font-medium">{user.phone || "Chưa cập nhật"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <IdcardOutlined className="text-purple-600 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="text-gray-800 font-medium">{user.user_id}</p>
                  </div>
                </div>
              </div>
            </CustomCard>

            <CustomCard padding="sm" className="shadow-md">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="large"
                block
                className="h-12 text-base font-semibold"
                onClick={() => {
                  message.info("Chức năng này đang phát triển");
                }}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </CustomCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CustomCard padding="lg" className="shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <IdcardOutlined className="text-blue-600 text-xl" />
                  </div>
                  Thông tin cá nhân
                </h3>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  className="text-blue-600"
                  onClick={() => {
                    message.info("Chức năng này đang phát triển");
                  }}
                >
                  Chỉnh sửa
                </Button>
              </div>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle" className="profile-descriptions">
                <Descriptions.Item label={<span className="font-semibold text-gray-700">ID</span>}>
                  <span className="text-gray-800">{user.user_id}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Username</span>}>
                  <span className="text-gray-800">@{user.username}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Họ và tên</span>}>
                  <span className="text-gray-800">{user.fullname}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Email</span>}>
                  <span className="text-gray-800">{user.email}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Số điện thoại</span>}>
                  <span className="text-gray-800">{user.phone || "Chưa cập nhật"}</span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Vai trò</span>}>
                  <Tag color={isAdmin ? "red" : "blue"} className="px-3 py-1 text-sm font-semibold">
                    {user.role?.role_name?.toUpperCase() || "N/A"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                      <CalendarOutlined />
                      Ngày tạo
                    </span>
                  }
                >
                  <span className="text-gray-800">
                    {new Date(user.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-gray-700">Cập nhật lần cuối</span>}>
                  <span className="text-gray-800">
                    {new Date(user.updated_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </CustomCard>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .profile-descriptions .ant-descriptions-item-label {
          background-color: #f8f9fa !important;
          font-weight: 600;
        }
        .profile-descriptions .ant-descriptions-item-content {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
}
