"use client";

import { Button, Select } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Option } = Select;

interface ExercisesHeaderProps {
  onSearchClick: () => void;
  selectedClass?: string;
  selectedStatus?: string;
  onClassChange?: (value: string | undefined) => void;
  onStatusChange?: (value: string | undefined) => void;
}

export default function ExercisesHeader({
  onSearchClick,
  selectedClass,
  selectedStatus,
  onClassChange,
  onStatusChange,
}: ExercisesHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quản lý Bài tập
        </h1>
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => router.push("/admin/exercises/handle/new")}
        >
          Thêm bài tập
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          icon={<SearchOutlined />}
          size="middle"
          className="flex-1 min-w-[200px] text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
          onClick={onSearchClick}
        >
          <span className="text-gray-400">Tìm kiếm bài tập... (Ctrl+K)</span>
        </Button>

        <Select
          placeholder="Lọc theo lớp"
          allowClear
          style={{ width: 150 }}
          value={selectedClass}
          onChange={onClassChange}
          className="border-gray-200"
        >
          <Option value="10A1">10A1</Option>
          <Option value="11B2">11B2</Option>
          <Option value="12C1">12C1</Option>
          <Option value="9a3">9a3</Option>
        </Select>

        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 150 }}
          value={selectedStatus}
          onChange={onStatusChange}
          className="border-gray-200"
        >
          <Option value="Đang mở">Đang mở</Option>
          <Option value="Đã đóng">Đã đóng</Option>
        </Select>
      </div>
    </div>
  );
}
