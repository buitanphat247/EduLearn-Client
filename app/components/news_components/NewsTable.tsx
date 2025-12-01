"use client";

import { Table, Button, Space, App, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { NewsItem } from "./types";

interface NewsTableProps {
  data: NewsItem[];
}

export default function NewsTable({ data }: NewsTableProps) {
  const router = useRouter();
  const { modal } = App.useApp();

  const columns: ColumnsType<NewsItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
          {text}
        </span>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-medium text-xs" color={category === "Tin tức" ? "blue" : "purple"}>
          {category}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={status === "Đã xuất bản" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: NewsItem) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          router.push(`/admin/news/handle/${record.key}`);
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa tin tức "${record.title}"?`,
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
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/news/${record.key}`);
              }}
            >
              Xem
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200 hover:scale-105"
              onClick={handleEdit}
            >
              Sửa
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              className="hover:bg-red-50 hover:border-red-400 transition-all duration-200 hover:scale-105"
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
        showTotal: (total) => `Tổng ${total} tin tức`,
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
    />
  );
}
