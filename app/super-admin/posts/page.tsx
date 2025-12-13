"use client";

import { Table, Tag, Button, Space, Select, App } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface NewsType {
  key: string;
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  views: number;
  createdAt: string;
}

const mockNews: NewsType[] = [
  {
    key: "1",
    id: "1",
    title: "Hướng dẫn học tập hiệu quả",
    author: "Nguyễn Văn A",
    category: "Học tập",
    status: "published",
    views: 234,
    createdAt: "15/01/2024",
  },
  {
    key: "2",
    id: "2",
    title: "Tips làm bài thi tốt",
    author: "Trần Thị B",
    category: "Thi cử",
    status: "pending",
    views: 0,
    createdAt: "16/01/2024",
  },
  {
    key: "3",
    id: "3",
    title: "Kinh nghiệm học ngoại ngữ",
    author: "Lê Văn C",
    category: "Học tập",
    status: "rejected",
    views: 0,
    createdAt: "17/01/2024",
  },
];

export default function SuperAdminNews() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  const filteredData = mockNews.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const columns: ColumnsType<NewsType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{text}</span>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "50%",
      render: (text: string) => <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{text}</span>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      render: (author: string) => <span className="text-gray-600">{author}</span>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <span className="text-gray-600">{category}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          published: { color: "green", text: "Đã xuất bản" },
          pending: { color: "orange", text: "Chờ duyệt" },
          rejected: { color: "red", text: "Từ chối" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
   
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: NewsType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
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
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                message.info("Tính năng xem đang được phát triển");
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
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Button
            icon={<SearchOutlined />}
            size="middle"
            className="flex-1 min-w-[200px] text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <span className="text-gray-400">Tìm kiếm tin tức... (Ctrl+K)</span>
          </Button>

          <Select
            placeholder="Lọc theo danh mục"
            allowClear
            style={{ width: 150 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="border-gray-200"
          >
            <Option value="Học tập">Học tập</Option>
            <Option value="Thi cử">Thi cử</Option>
            <Option value="Kinh nghiệm">Kinh nghiệm</Option>
          </Select>

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="border-gray-200"
          >
            <Option value="published">Đã xuất bản</Option>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
        </div>
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => message.info("Tính năng đang được phát triển")}
        >
          Thêm tin tức
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
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
    </div>
  );
}
