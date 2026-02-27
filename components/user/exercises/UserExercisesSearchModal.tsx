"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Tag, Empty, Button } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { UserExerciseItem } from "@/interface/exercises";

interface UserExercisesSearchModalProps {
  open: boolean;
  onClose: () => void;
  data: UserExerciseItem[];
}

export default function UserExercisesSearchModal({ open, onClose, data }: UserExercisesSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

  const handleItemClick = (item: UserExerciseItem) => {
    router.push(`/user/exercises/${item.key}`);
    onClose();
    setSearchQuery("");
  };

  const handleViewClick = (e: React.MouseEvent, item: UserExerciseItem) => {
    e.stopPropagation();
    router.push(`/user/exercises/${item.key}`);
    onClose();
    setSearchQuery("");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={700}
      styles={{
        body: { padding: 0 },
      }}
      className="search-modal"
      destroyOnHidden
    >
      <div>
        {/* Search Input */}
        <div className="mb-3">
          <Input
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-lg"
            autoFocus
            suffix={
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K</span>
            }
          />
        </div>

        {/* Search Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {searchQuery.trim() ? (
            filteredData.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-2">Tìm thấy {filteredData.length} kết quả</div>
                {filteredData.map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1.5">{item.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium">{item.subject}</span>
                          <span className="text-gray-400">•</span>
                          <span>Ngày giao: {item.date}</span>
                          <span className="text-gray-400">•</span>
                          <span>Hạn nộp: {item.deadline}</span>
                          <Tag
                            className="px-2 py-0.5 rounded-md text-xs"
                            color={item.status === "Đã nộp" ? "green" : item.status === "Quá hạn" ? "red" : "orange"}
                          >
                            {item.status}
                          </Tag>
                        </div>
                      </div>
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleViewClick(e, item)}
                      >
                        Xem
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description={<span className="text-gray-500">Không tìm thấy kết quả nào</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )
          ) : (
            <div className="text-center py-8">
              <SearchOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">Nhập từ khóa để tìm kiếm</p>
              <p className="text-xs text-gray-400">Sử dụng {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K để mở nhanh</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
