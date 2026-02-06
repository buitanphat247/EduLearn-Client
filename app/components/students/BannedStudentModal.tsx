"use client";

import { Modal, Descriptions, Tag, Avatar } from "antd";
import { UserOutlined, StopOutlined, IdcardOutlined, MailOutlined, BookOutlined } from "@ant-design/icons";
import type { StudentItem } from "@/interface/students";

interface BannedStudentModalProps {
  open: boolean;
  onCancel: () => void;
  student: StudentItem | null;
  classInfo?: {
    name: string;
    code: string;
  };
}

export default function BannedStudentModal({ open, onCancel, student, classInfo }: BannedStudentModalProps) {
  if (!student) return null;

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <StopOutlined className="text-red-500" />
          <span>Học sinh bị cấm</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden={true}
      maskClosable={true}
    >
      <div className="space-y-6">
        {/* Avatar và thông tin cơ bản */}
        <div className="text-center">
          <Avatar size={100} icon={<UserOutlined />} className="mb-3" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">{student.name}</h3>
          <Tag color="red" className="mb-4">
            <StopOutlined /> Bị cấm
          </Tag>
        </div>

        {/* Thông báo */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium text-center">
            Học sinh này hiện đang bị cấm và không thể tham gia các hoạt động của lớp học.
          </p>
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
            <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{student.studentId}</span>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <UserOutlined />
                Họ và tên
              </span>
            }
          >
            <span className="font-semibold text-gray-800">{student.name}</span>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <MailOutlined />
                Email
              </span>
            }
          >
            {student.email}
          </Descriptions.Item>
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
                <StopOutlined />
                Trạng thái
              </span>
            }
          >
            <Tag color="red">Bị cấm</Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}

