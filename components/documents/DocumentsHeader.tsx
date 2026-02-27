"use client";

import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface DocumentsHeaderProps {
  onSearchClick: () => void;
}

export default function DocumentsHeader({ onSearchClick }: DocumentsHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Tài liệu
        </h1>
      </div>

      {/* Search Trigger Button */}
      <div>
        <Button
          icon={<SearchOutlined />}
          size="middle"
          className="w-full text-left justify-start bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700 transition-all"
          onClick={onSearchClick}
        >
          <span className="text-gray-400">Tìm kiếm tài liệu... (Ctrl+K)</span>
        </Button>
      </div>
    </div>
  );
}
