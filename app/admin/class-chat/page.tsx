"use client";

import { useState, useEffect } from "react";
import { Modal, Input, message } from "antd";
import ClassChatHeader from "@/app/components/class_chat_components/ClassChatHeader";
import ClassChatTable from "@/app/components/class_chat_components/ClassChatTable";
import ClassChatSearchModal from "@/app/components/modal_components/ClassChatSearchModal";
import type { ClassChatItem } from "@/app/components/class_chat_components/types";

const data: ClassChatItem[] = [
  { key: "1", className: "Lớp 10A1", classCode: "10A1", totalMessages: 45, unreadMessages: 3, lastActivity: "2 phút trước", participants: 35, status: "Hoạt động" },
  { key: "2", className: "Lớp 10A2", classCode: "10A2", totalMessages: 32, unreadMessages: 0, lastActivity: "1 giờ trước", participants: 32, status: "Hoạt động" },
  { key: "3", className: "Lớp 11B1", classCode: "11B1", totalMessages: 28, unreadMessages: 5, lastActivity: "30 phút trước", participants: 30, status: "Hoạt động" },
  { key: "4", className: "Lớp 12C1", classCode: "12C1", totalMessages: 15, unreadMessages: 0, lastActivity: "1 ngày trước", participants: 28, status: "Tạm dừng" },
];

export default function AdminClassChat() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Keyboard shortcut: Ctrl/Cmd + K to open search
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

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      message.warning("Vui lòng nhập tên nhóm chat");
      return;
    }

    // Mock tạo nhóm
    message.success(`Đã tạo nhóm chat "${newGroupName.trim()}" (mock)`);
    setNewGroupName("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <ClassChatHeader
        onSearchClick={() => setIsSearchModalOpen(true)}
        onCreateGroupClick={() => setIsCreateModalOpen(true)}
      />

      <ClassChatTable data={data} />

      <ClassChatSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        data={data}
      />

      <Modal
        title="Tạo nhóm chat mới"
        open={isCreateModalOpen}
        onOk={handleCreateGroup}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setNewGroupName("");
        }}
        okText="Tạo nhóm"
        cancelText="Hủy"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tên nhóm chat</label>
          <Input
            placeholder="Nhập tên nhóm chat (ví dụ: Nhóm chat lớp 10A1)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="cursor-text"
          />
        </div>
      </Modal>
    </div>
  );
}
