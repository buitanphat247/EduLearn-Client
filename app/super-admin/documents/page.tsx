"use client";

import { Table, Tag, Button, Space, Select, App } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface DocumentType {
  key: string;
  id: string;
  title: string;
  category: string;
  author: string;
  status: string;
  createdAt: string;
}

const mockDocuments: DocumentType[] = [
  {
    key: "1",
    id: "DOC001",
    title: "Tài liệu Toán học lớp 10",
    category: "Toán học",
    author: "Nguyễn Văn A",
    status: "active",
    createdAt: "15/01/2024",
  },
  {
    key: "2",
    id: "DOC002",
    title: "Tài liệu Vật lý lớp 11",
    category: "Vật lý",
    author: "Trần Thị B",
    status: "active",
    createdAt: "16/01/2024",
  },
  {
    key: "3",
    id: "DOC003",
    title: "Tài liệu Hóa học lớp 12",
    category: "Hóa học",
    author: "Lê Văn C",
    status: "inactive",
    createdAt: "17/01/2024",
  },
];

export default function SuperAdminDocuments() {
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

  const filteredData = mockDocuments.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const columns: ColumnsType<DocumentType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text: string) => (
        <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{text}</span>
      ),
    },
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
      width: 120,
      render: (category: string) => <span className="text-gray-600">{category}</span>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
      render: (author: string) => <span className="text-gray-600">{author}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={status === "active" ? "green" : "default"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: DocumentType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa tài liệu "${record.title}"?`,
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
    <div className="space-y-3">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quản lý nguồn tài liệu
          </h1>
          <Button
            type="default"
            icon={<PlusOutlined />}
            size="middle"
            className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => message.info("Tính năng đang được phát triển")}
          >
            Thêm tài liệu
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Button
            icon={<SearchOutlined />}
            size="middle"
            className="flex-1 min-w-[200px] text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <span className="text-gray-400">Tìm kiếm tài liệu... (Ctrl+K)</span>
          </Button>

          <Select
            placeholder="Lọc theo danh mục"
            allowClear
            style={{ width: 150 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="border-gray-200"
          >
            <Option value="Toán học">Toán học</Option>
            <Option value="Vật lý">Vật lý</Option>
            <Option value="Hóa học">Hóa học</Option>
            <Option value="Ngữ văn">Ngữ văn</Option>
          </Select>

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="border-gray-200"
          >
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Không hoạt động</Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          position: ["bottomRight"],
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} tài liệu`,
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

