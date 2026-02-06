"use client";

import { memo, useCallback } from "react";
import { Button, Input } from "antd";
import { SearchOutlined, PlusOutlined, KeyOutlined } from "@ant-design/icons";

interface ClassesHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  onJoinClick?: () => void;
}

function ClassesHeader({ searchValue, onSearchChange, onAddClick, onJoinClick }: ClassesHeaderProps) {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);
  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm lớp học hoặc mã code... (Ctrl+K)"
          size="middle"
          className="flex-1 min-w-[200px] dark:bg-gray-700/50 dark:!border-slate-600 dark:text-white dark:placeholder-gray-500 hover:dark:!border-slate-500 focus:dark:!border-blue-500"
          value={searchValue}
          onChange={handleSearchChange}
          allowClear
        />
        {onJoinClick && (
          <Button type="primary" icon={<KeyOutlined />} size="middle" onClick={onJoinClick} className="shadow-sm">
            Tham gia bằng code
          </Button>
        )}
        {onAddClick && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            className="shadow-sm"
            onClick={onAddClick}
          >
            Thêm lớp học
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(ClassesHeader);
