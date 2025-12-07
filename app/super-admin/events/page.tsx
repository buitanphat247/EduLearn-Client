"use client";

import { Table, Tag, Button, Space, Select, App } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface EventType {
  key: string;
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  participants: number;
  createdAt: string;
}

const mockEvents: EventType[] = [
  {
    key: "1",
    id: "1",
    title: "Hội thảo giáo dục 2024",
    description: "Hội thảo về phương pháp giảng dạy hiện đại",
    location: "Hội trường A - Tầng 3",
    startDate: "25/01/2024 09:00",
    endDate: "25/01/2024 17:00",
    status: "upcoming",
    participants: 150,
    createdAt: "15/01/2024",
  },
  {
    key: "2",
    id: "2",
    title: "Cuộc thi học sinh giỏi",
    description: "Cuộc thi học sinh giỏi cấp trường",
    location: "Phòng thi số 1-10",
    startDate: "28/01/2024 08:00",
    endDate: "28/01/2024 12:00",
    status: "upcoming",
    participants: 200,
    createdAt: "16/01/2024",
  },
  {
    key: "3",
    id: "3",
    title: "Lễ tổng kết học kỳ 1",
    description: "Lễ tổng kết và trao giải thưởng",
    location: "Sân trường",
    startDate: "30/01/2024 14:00",
    endDate: "30/01/2024 16:00",
    status: "upcoming",
    participants: 500,
    createdAt: "17/01/2024",
  },
  {
    key: "4",
    id: "4",
    title: "Workshop công nghệ",
    description: "Workshop về ứng dụng công nghệ trong giáo dục",
    location: "Phòng Lab - Tầng 2",
    startDate: "10/01/2024 09:00",
    endDate: "10/01/2024 12:00",
    status: "completed",
    participants: 80,
    createdAt: "05/01/2024",
  },
];

export default function SuperAdminEvents() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
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

  const filteredData = mockEvents.filter((item) => {
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesStatus;
  });

  const columns: ColumnsType<EventType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (location: string) => <span className="text-gray-600">{location}</span>,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_: any, record: EventType) => (
        <div className="text-sm">
          <div className="text-gray-800 font-medium">Bắt đầu: {record.startDate}</div>
          <div className="text-gray-600">Kết thúc: {record.endDate}</div>
        </div>
      ),
    },
    {
      title: "Người tham gia",
      dataIndex: "participants",
      key: "participants",
      width: 120,
      render: (count: number) => (
        <span className="text-gray-600 font-medium">{count} người</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          upcoming: { color: "blue", text: "Sắp diễn ra" },
          ongoing: { color: "orange", text: "Đang diễn ra" },
          completed: { color: "green", text: "Đã hoàn thành" },
          cancelled: { color: "red", text: "Đã hủy" },
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
      width: 120,
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: EventType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa sự kiện "${record.title}"?`,
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
            Quản lý toàn bộ sự kiện
          </h1>
          <Button
            type="default"
            icon={<PlusOutlined />}
            size="middle"
            className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => message.info("Tính năng đang được phát triển")}
          >
            Thêm sự kiện
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Button
            icon={<SearchOutlined />}
            size="middle"
            className="flex-1 min-w-[200px] text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <span className="text-gray-400">Tìm kiếm sự kiện... (Ctrl+K)</span>
          </Button>

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="border-gray-200"
          >
            <Option value="upcoming">Sắp diễn ra</Option>
            <Option value="ongoing">Đang diễn ra</Option>
            <Option value="completed">Đã hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          position: ["bottomRight"],
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sự kiện`,
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

