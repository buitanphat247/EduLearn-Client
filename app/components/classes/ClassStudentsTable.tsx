"use client";

import { Button, Space, Tag, Table } from "antd";
import { DeleteOutlined, EyeOutlined, UserAddOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomCard from "@/app/components/common/CustomCard";
import type { StudentItem } from "@/interface/students";

interface ClassStudentsTableProps {
  students: StudentItem[];
  onViewStudent: (student: StudentItem) => void;
  onRemoveStudent: (student: StudentItem) => void;
  onAddSingle?: () => void;
  onAddMultiple?: () => void;
}

export default function ClassStudentsTable({ students, onViewStudent, onRemoveStudent, onAddSingle, onAddMultiple }: ClassStudentsTableProps) {

  const studentColumns: ColumnsType<StudentItem> = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      render: (text: string) => <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">{text}</span>,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Đang học" ? "green" : status === "Tạm nghỉ" ? "orange" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: StudentItem) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => onViewStudent(record)} className="cursor-pointer">
            Xem
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onRemoveStudent(record)} className="cursor-pointer">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <CustomCard 
      title="Danh sách học sinh" 
      bodyClassName="py-6"
      extra={
        <Space>
          <Button
            type="default"
            icon={<UserAddOutlined />}
            size="middle"
            className="bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
            onClick={onAddSingle}
          >
            Thêm single
          </Button>
          <Button
            type="default"
            icon={<UsergroupAddOutlined />}
            size="middle"
            className="bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
            onClick={onAddMultiple}
          >
            Thêm multiple
          </Button>
        </Space>
      }
    >
      <Table columns={studentColumns} dataSource={students} pagination={false} rowClassName="hover:bg-gray-50 transition-colors" />
    </CustomCard>
  );
}
