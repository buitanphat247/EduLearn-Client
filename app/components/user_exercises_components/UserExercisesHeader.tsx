"use client";

import { Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

interface UserExercisesHeaderProps {
  onSearchClick: () => void;
  selectedStatus?: string;
  onStatusChange: (status: string | undefined) => void;
}

export default function UserExercisesHeader({ onSearchClick, selectedStatus, onStatusChange }: UserExercisesHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Bài tập của tôi
        </h1>
      </div>

      {/* Search and Filter */}
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
          placeholder="Lọc theo trạng thái"
          allowClear
          size="middle"
          style={{ width: 180 }}
          value={selectedStatus}
          onChange={onStatusChange}
        >
          <Option value="Chưa nộp">Chưa nộp</Option>
          <Option value="Đã nộp">Đã nộp</Option>
          <Option value="Quá hạn">Quá hạn</Option>
        </Select>
      </div>
    </div>
  );
}
