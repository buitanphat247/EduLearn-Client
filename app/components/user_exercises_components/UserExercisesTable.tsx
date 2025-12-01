"use client";

import { Table, Button, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { UserExerciseItem } from "./types";

interface UserExercisesTableProps {
  data: UserExerciseItem[];
}

export default function UserExercisesTable({ data }: UserExercisesTableProps) {
  const router = useRouter();

  const columns: ColumnsType<UserExerciseItem> = [
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
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      render: (subject: string) => (
        <span className="text-gray-700 font-medium">{subject}</span>
      ),
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
      render: (deadline: string) => <span className="text-gray-600 font-medium">{deadline}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          className="px-2 py-0.5 rounded-md font-semibold text-xs"
          color={status === "Đã nộp" ? "green" : status === "Quá hạn" ? "red" : "orange"}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: UserExerciseItem) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/user/exercises/${record.key}`);
          }}
        >
          Xem chi tiết
        </Button>
      ),
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
          onClick: () => router.push(`/user/exercises/${record.key}`),
        })}
    />
  );
}
