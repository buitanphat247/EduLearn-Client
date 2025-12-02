"use client";

import { Card, Avatar, Descriptions, Tag, Button, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  EditOutlined,
  IdcardOutlined,
  BookOutlined,
} from "@ant-design/icons";
import CustomCard from "@/app/components/ui_components/CustomCard";

// Mock data - có thể thay thế bằng dữ liệu thực từ API
const studentProfile = {
  id: "HS001",
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0123456789",
  dateOfBirth: "15/05/2010",
  address: "123 Đường ABC, Quận XYZ, TP.HCM",
  class: "9A3",
  grade: "Khối 9",
  studentCode: "HS2024001",
  joinDate: "01/09/2023",
  status: "Đang học",
  avatar: null,
  subjects: [
    { name: "Toán học", teacher: "Nguyễn Thị B", score: 8.5 },
    { name: "Ngữ văn", teacher: "Trần Văn C", score: 7.8 },
    { name: "Vật lý", teacher: "Lê Thị D", score: 9.0 },
    { name: "Hóa học", teacher: "Phạm Văn E", score: 8.2 },
  ],
  parentInfo: {
    father: {
      name: "Nguyễn Văn B",
      phone: "0987654321",
      email: "nguyenvanb@example.com",
    },
    mother: {
      name: "Nguyễn Thị C",
      phone: "0987654322",
      email: "nguyenthic@example.com",
    },
  },
};

export default function AdminProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <CustomCard padding="lg" className="text-center">
            <Avatar size={120} icon={<UserOutlined />} className="mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{studentProfile.fullName}</h2>
            <Tag color="blue" className="mb-4">
              {studentProfile.studentCode}
            </Tag>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <BookOutlined />
                <span>{studentProfile.class}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Tag color={studentProfile.status === "Đang học" ? "success" : "default"}>
                  {studentProfile.status}
                </Tag>
              </div>
            </div>
            <Divider />
            <Button type="primary" icon={<EditOutlined />} className="w-full">
              Chỉnh sửa hồ sơ
            </Button>
          </CustomCard>

          {/* Contact Info */}
          <CustomCard padding="lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MailOutlined className="text-blue-500 text-lg" />
                <span className="text-gray-700">{studentProfile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneOutlined className="text-green-500 text-lg" />
                <span className="text-gray-700">{studentProfile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <HomeOutlined className="text-orange-500 text-lg" />
                <span className="text-gray-700 text-sm">{studentProfile.address}</span>
              </div>
            </div>
          </CustomCard>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <CustomCard padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <IdcardOutlined className="text-blue-500" />
                Thông tin cá nhân
              </h3>
              <Button type="text" icon={<EditOutlined />}>
                Chỉnh sửa
              </Button>
            </div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã học sinh">{studentProfile.studentCode}</Descriptions.Item>
              <Descriptions.Item label="Họ và tên">{studentProfile.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <CalendarOutlined className="mr-2" />
                {studentProfile.dateOfBirth}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">{studentProfile.class}</Descriptions.Item>
              <Descriptions.Item label="Khối">{studentProfile.grade}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập học">{studentProfile.joinDate}</Descriptions.Item>
            </Descriptions>
          </CustomCard>

          {/* Academic Performance */}
          <CustomCard padding="lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOutlined className="text-purple-500" />
              Kết quả học tập
            </h3>
            <div className="space-y-3">
              {studentProfile.subjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{subject.name}</div>
                    <div className="text-sm text-gray-600">Giáo viên: {subject.teacher}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{subject.score}</div>
                    <Tag color={subject.score >= 8 ? "success" : subject.score >= 6.5 ? "warning" : "error"}>
                      {subject.score >= 8 ? "Giỏi" : subject.score >= 6.5 ? "Khá" : "Trung bình"}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </CustomCard>

          {/* Parent Information */}
          <CustomCard padding="lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin phụ huynh</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Cha</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-500" />
                    <span>{studentProfile.parentInfo.father.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-green-500" />
                    <span>{studentProfile.parentInfo.father.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-blue-500" />
                    <span className="text-xs">{studentProfile.parentInfo.father.email}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-gray-800 mb-3">Mẹ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-pink-500" />
                    <span>{studentProfile.parentInfo.mother.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-green-500" />
                    <span>{studentProfile.parentInfo.mother.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailOutlined className="text-pink-500" />
                    <span className="text-xs">{studentProfile.parentInfo.mother.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CustomCard>
        </div>
      </div>
    </div>
  );
}
