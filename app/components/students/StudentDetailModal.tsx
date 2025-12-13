"use client";

import { Modal, Avatar, Tag, Descriptions, Spin, App } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, BookOutlined, IdcardOutlined, CalendarOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import type { StudentItem } from "@/interface/students";

interface StudentDetailModalProps {
  open: boolean;
  onCancel: () => void;
  student: StudentItem | null;
  classInfo?: {
    name: string;
    code: string;
  };
}

export default function StudentDetailModal({ open, onCancel, student, classInfo }: StudentDetailModalProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<UserInfoResponse | null>(null);

  const getStatusColor = (status: string) => {
    if (status === "Đang học" || status === "online") return "green";
    if (status === "Tạm nghỉ" || status === "offline") return "orange";
    if (status === "Đã tốt nghiệp") return "blue";
    return "default";
  };

  // Fetch student profile when modal opens
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!open || !student) {
        setStudentProfile(null);
        return;
      }

      // Get userId from student.key (which is user_id)
      const userId = student.key;

      if (!userId) {
        message.error("Không tìm thấy ID học sinh");
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserInfo(userId);
        setStudentProfile(profile);
      } catch (error: any) {
        message.error(error?.message || "Không thể tải thông tin học sinh");
        setStudentProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [open, student, message]);

  // Use API data if available, otherwise fallback to student prop
  const displayData = studentProfile
    ? {
        name: studentProfile.fullname,
        studentId: studentProfile.username,
        email: studentProfile.email,
        phone: studentProfile.phone || "",
        status: "Đang học", // API doesn't return status, default to "Đang học"
        avatar: studentProfile.avatar,
      }
    : student
    ? {
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        phone: student.phone || "",
        status: student.status,
        avatar: null,
      }
    : null;

  return (
    <Modal
      title="Chi tiết học sinh"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose={true}
      maskClosable={true}
    >
      <Spin spinning={loading}>
        {displayData && (
          <div className="space-y-6">
            {/* Avatar và thông tin cơ bản */}
            <div className="text-center">
              <Avatar 
                size={120} 
                src={displayData.avatar} 
                icon={<UserOutlined />} 
                className="mb-3" 
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{displayData.name}</h3>
              <Tag color="blue" className="mb-4">
                {displayData.studentId}
              </Tag>
              <Tag color={getStatusColor(displayData.status)}>
                {displayData.status === "online" ? "Đang học" : 
                 displayData.status === "offline" ? "Tạm nghỉ" : 
                 displayData.status}
              </Tag>
            </div>

            {/* Thông tin chi tiết */}
            <Descriptions column={1} bordered>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <IdcardOutlined />
                    Mã học sinh
                  </span>
                }
              >
                <span className="font-mono text-sm bg-gray-50 rounded">{displayData.studentId}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    Họ và tên
                  </span>
                }
              >
                <span className="font-semibold text-gray-800">{displayData.name}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <MailOutlined />
                    Email
                  </span>
                }
              >
                {displayData.email}
              </Descriptions.Item>
              {displayData.phone && (
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <PhoneOutlined />
                      Số điện thoại
                    </span>
                  }
                >
                  {displayData.phone}
                </Descriptions.Item>
              )}
              {classInfo && (
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <BookOutlined />
                      Lớp học
                    </span>
                  }
                >
                  {`${classInfo.name} (${classInfo.code})`}
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    Trạng thái
                  </span>
                }
              >
                <Tag color={getStatusColor(displayData.status)}>
                  {displayData.status === "online" ? "Đang học" : 
                   displayData.status === "offline" ? "Tạm nghỉ" : 
                   displayData.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        {!loading && !displayData && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy thông tin học sinh
          </div>
        )}
      </Spin>
    </Modal>
  );
}
