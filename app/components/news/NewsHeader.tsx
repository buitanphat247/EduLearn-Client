"use client";

import { Button, Input } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface NewsHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function NewsHeader({ searchValue, onSearchChange }: NewsHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm tin tức... (Ctrl+K)"
          size="middle"
          className="flex-1 min-w-[200px]"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          allowClear
        />
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
          onClick={() => router.push("/admin/news/handle")}
        >
          Thêm tin tức
        </Button>
      </div>
    </div>
  );
}
