"use client";

import { Table, Button, Space, App, Tag, Badge } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { ClassChatItem } from "./types";

interface ClassChatTableProps {
  data: ClassChatItem[];
}

export default function ClassChatTable({ data }: ClassChatTableProps) {
  const router = useRouter();
  const { modal, message } = App.useApp();

  const columns: ColumnsType<ClassChatItem> = [
    {
      title: "Tên lớp",
      dataIndex: "className",
      key: "className",
      render: (text: string, record: ClassChatItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br  from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {record.classCode}
          </div>
          <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Mã lớp",
      dataIndex: "classCode",
      key: "classCode",
      render: (code: string) => (
        <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{code}</span>
      ),
    },
    {
      title: "Tin nhắn",
      dataIndex: "totalMessages",
      key: "totalMessages",
      render: (count: number, record: ClassChatItem) => (
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-blue-500" />
          <span className="text-gray-700 font-medium">{count}</span>
          {record.unreadMessages > 0 && (
            <Badge count={record.unreadMessages} size="small" className="ml-1" />
          )}
        </div>
      ),
    },
    {
      title: "Thành viên",
      dataIndex: "participants",
      key: "participants",
      render: (count: number) => (
        <div className="flex items-center gap-1.5 text-gray-700">
          <UserOutlined className="text-green-500" />
          <span className="font-medium">{count}</span>
        </div>
      ),
    },
    {
      title: "Hoạt động cuối",
      dataIndex: "lastActivity",
      key: "lastActivity",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={status === "Hoạt động" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (_: any, record: ClassChatItem) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa nhóm chat "${record.className}"?`,
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
                router.push(`/admin/class-chat/${record.key}`);
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
        showTotal: (total) => `Tổng ${total} nhóm chat`,
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
        onClick: () => router.push(`/admin/class-chat/${record.key}`),
      })}
    />
  );
}
