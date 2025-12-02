"use client";

import { Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface StudentsHeaderProps {
  onSearchClick: () => void;
}

export default function StudentsHeader({ onSearchClick }: StudentsHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quản lý Học sinh
        </h1>
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => router.push("/admin/students/create")}
        >
          Thêm học sinh
        </Button>
      </div>

      {/* Search Trigger Button */}
      <div>
        <Button
          icon={<SearchOutlined />}
          size="middle"
          className="w-full text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
          onClick={onSearchClick}
        >
          <span className="text-gray-400">Tìm kiếm học sinh... (Ctrl+K)</span>
        </Button>
      </div>
    </div>
  );
}
