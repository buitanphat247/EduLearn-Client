"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Tag, Empty, Button, Badge } from "antd";
import { SearchOutlined, EyeOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ClassChatItem } from "../class_chat_components/types";

interface ClassChatSearchModalProps {
  open: boolean;
  onClose: () => void;
  data: ClassChatItem[];
}

export default function ClassChatSearchModal({ open, onClose, data }: ClassChatSearchModalProps) {
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
      item.className.toLowerCase().includes(query) ||
      item.classCode.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

  const handleItemClick = (item: ClassChatItem) => {
    router.push(`/admin/class-chat/${item.key}`);
    onClose();
    setSearchQuery("");
  };

  const handleViewClick = (e: React.MouseEvent, item: ClassChatItem) => {
    e.stopPropagation();
    router.push(`/admin/class-chat/${item.key}`);
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
            placeholder="Tìm kiếm lớp chat..."
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
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {item.classCode}
                          </div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.className}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MessageOutlined className="text-blue-500" />
                            <span>{item.totalMessages} tin nhắn</span>
                            {item.unreadMessages > 0 && (
                              <Badge count={item.unreadMessages} size="small" className="ml-1" />
                            )}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <UserOutlined className="text-green-500" />
                            <span>{item.participants} thành viên</span>
                          </span>
                          <Tag
                            className="px-2 py-0.5 rounded-md text-xs"
                            color={item.status === "Hoạt động" ? "green" : "orange"}
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
