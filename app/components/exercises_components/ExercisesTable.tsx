"use client";

import { Table, Button, Space, App, Tag } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { ExerciseItem } from "./types";

interface ExercisesTableProps {
  data: ExerciseItem[];
}

export default function ExercisesTable({ data }: ExercisesTableProps) {
  const router = useRouter();
  const { modal, message } = App.useApp();

  const columns: ColumnsType<ExerciseItem> = [
    {
      title: "Tên bài tập",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
          {text}
        </span>
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
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      render: (subject: string) => <span className="text-gray-600">{subject}</span>,
    },
    {
      title: "Ngày giao",
      dataIndex: "date",
      key: "date",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline: string) => (
        <span className={deadline === "Không thời hạn" ? "text-gray-400 italic" : "text-gray-600"}>
          {deadline}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={status === "Đang mở" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: ExerciseItem) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa bài tập "${record.name}"?`,
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
                router.push(`/admin/exercises/${record.key}`);
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
        showTotal: (total) => `Tổng ${total} bài tập`,
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
        onClick: () => router.push(`/admin/exercises/${record.key}`),
      })}
    />
  );
}
