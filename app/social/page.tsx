"use client";

import { useState } from "react";
import SocialSidebar from "@/app/components/social/SocialSidebar";
import ChatArea from "@/app/components/social/ChatArea";
import { Conversation, Message } from "@/app/components/social/types";
import { useSocial } from "./SocialContext";

export default function SocialPage() {
  const { receivedFriendRequests } = useSocial();
  const [selectedConversation, setSelectedConversation] = useState<string | null>("2");
  const [message, setMessage] = useState("");

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: "2",
      name: "Team Marketing",
      lastMessage: "Bạn: File thiết kế mới nhất...",
      time: "10:30 AM",
      isGroup: true,
      members: 5,
      lastAccess: "Vừa truy cập",
    },
    {
      id: "3",
      name: "Nguyễn Văn B",
      lastMessage: "Ok, để mình check nhé.",
      time: "5 phút",
      unread: 1,
    },
    {
      id: "4",
      name: "Lê Thị C",
      lastMessage: "Đã gửi một ảnh.",
      time: "Hôm qua",
    },
    {
      id: "5",
      name: "Dev Team",
      lastMessage: "Project Manager: Deadline vào th...",
      time: "Hôm qua",
      isGroup: true,
    },
    {
      id: "6",
      name: "Thông báo HR",
      lastMessage: "Lịch nghỉ lễ sắp tới",
      time: "20/10",
      isNotification: true,
    },
    {
      id: "1",
      name: "Cloud của tôi",
      lastMessage: "File lưu trữ",
      time: "",
      isCloud: true,
      isGroup: false,
    },
  ];

  // Mock messages data
  const messages: Message[] = [
    {
      id: "1",
      sender: "Nguyễn Văn B",
      content: "Chào mọi người, mình vừa cập nhật file thiết kế Landing Page mới. Mọi người xem qua và feedback giúp mình nhé.",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      sender: "Nguyễn Văn B",
      content: "",
      time: "10:30 AM",
      isOwn: false,
      fileAttachment: {
        name: "Landing_Page_V2.pdf",
        size: "2.4 MB",
        type: "pdf",
      },
    },
    {
      id: "3",
      sender: "You",
      content: "Tuyệt vời! Để mình check nhé.",
      time: "10:35 AM",
      isOwn: true,
    },
    {
      id: "4",
      sender: "You",
      content: "Phần header nhìn thoáng hơn bản cũ nhiều đó 👍",
      time: "10:36 AM",
      isOwn: true,
    },
    {
      id: "5",
      sender: "Lê Thị C",
      content: "@Nguyễn Văn B phần footer màu có vẻ hơi tối không nhỉ?",
      time: "10:40 AM",
      isOwn: false,
    },
  ];

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "20px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  return (
    <>
      <SocialSidebar
        bottomTab="messages"
        contactSubTab="friends" // Not used in messages mode but TS might require it if optional not handled? Checked prop types in next step if needed.
        setContactSubTab={() => {}}
        conversations={conversations}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        receivedFriendRequestsCount={receivedFriendRequests.length}
        handleAddFriendClick={() => {}} // Not used in messages
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 relative h-full overflow-hidden">
        <ChatArea
          activeConversation={activeConversation}
          messages={messages}
          message={message}
          handleTextareaChange={handleTextareaChange}
          handleKeyPress={handleKeyPress}
          handleSendMessage={handleSendMessage}
        />
      </main>
    </>
  );
}
