"use client";

import { Button, Select, Input } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Option } = Select;

interface ExercisesHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  selectedClass?: string;
  selectedStatus?: string;
  onClassChange?: (value: string | undefined) => void;
  onStatusChange?: (value: string | undefined) => void;
}

export default function ExercisesHeader({ searchValue, onSearchChange, selectedClass, selectedStatus, onClassChange, onStatusChange }: ExercisesHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm bài tập... (Ctrl+K)"
          size="middle"
          className="flex-1 min-w-[200px]"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          allowClear
        />

        <Select placeholder="Lọc theo lớp" allowClear style={{ width: 150 }} value={selectedClass} onChange={onClassChange}>
          <Option value="10A1">10A1</Option>
          <Option value="11B2">11B2</Option>
          <Option value="12C1">12C1</Option>
          <Option value="9a3">9a3</Option>
        </Select>

        <Select placeholder="Lọc theo trạng..." allowClear style={{ width: 150 }} value={selectedStatus} onChange={onStatusChange}>
          <Option value="Đang mở">Đang mở</Option>
          <Option value="Đã đóng">Đã đóng</Option>
        </Select>
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
          onClick={() => router.push("/admin/exercises/create")}
        >
          Thêm bài tập
        </Button>
      </div>
    </div>
  );
}
