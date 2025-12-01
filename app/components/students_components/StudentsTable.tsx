"use client";

import { Table, Button, Space, App, Tag } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { StudentItem } from "./types";

interface StudentsTableProps {
  data: StudentItem[];
}

export default function StudentsTable({ data }: StudentsTableProps) {
  const router = useRouter();
  const { modal, message } = App.useApp();

  const columns: ColumnsType<StudentItem> = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
          {text}
        </span>
      ),
    },
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      render: (id: string) => (
        <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{id}</span>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      render: (classCode: string) => (
        <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{classCode}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => <span className="text-gray-600">{phone}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          className="px-2 py-0.5 rounded-md font-semibold text-xs"
          color={status === "Đang học" ? "green" : status === "Tạm nghỉ" ? "orange" : "blue"}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (_: any, record: StudentItem) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa học sinh "${record.name}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
              message.warning("Tính năng xóa đang được phát triển");
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
                router.push(`/admin/students/${record.key}`);
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
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        position: ["bottomRight"],
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} học sinh`,
        pageSizeOptions: ["10", "20", "50"],
        className: "px-4 py-3",
        size: "small",
      }}
      className="news-table"
      rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
      size="small"
      style={{
        padding: "0",
      }}
      onRow={(record) => ({
        onClick: () => router.push(`/admin/students/${record.key}`),
      })}
    />
  );
}
