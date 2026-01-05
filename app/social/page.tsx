"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "antd";
import DarkConfigProvider from "@/app/components/common/DarkConfigProvider";
import {
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  MoreOutlined,
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  PictureOutlined,
  LinkOutlined,
  FileTextOutlined,
  BoldOutlined,
  CloudOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
  HomeOutlined,
  ContactsOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
  isGroup?: boolean;
  isCloud?: boolean;
  isNotification?: boolean;
  members?: number;
  lastAccess?: string;
  isOwn?: boolean;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  content: string;
  time: string;
  isOwn: boolean;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  mutualFriends?: number;
  isFriend?: boolean;
}

export default function SocialPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "categorized">("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>("2");
  const [message, setMessage] = useState("");
  const [bottomTab, setBottomTab] = useState<"messages" | "contacts" | "cloud" | "settings">("messages");

  // Mock conversations data theo mô tả
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Cloud của tôi",
      lastMessage: "Lưu trữ file quan trọng...",
      time: "",
      isCloud: true,
    },
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
  ];

  // Mock messages data theo mô tả
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
      content: "Tuyệt vời! Để mình check ngay bây giờ.",
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

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: "c1",
      name: "Trần Văn A",
      status: "online",
      mutualFriends: 5,
      isFriend: true,
    },
    {
      id: "c2",
      name: "Phạm Thị B",
      status: "offline",
      mutualFriends: 3,
      isFriend: false,
    },
    {
      id: "c3",
      name: "Lê Văn C",
      status: "online",
      mutualFriends: 8,
      isFriend: true,
    },
    {
      id: "c4",
      name: "Nguyễn Thị D",
      status: "away",
      mutualFriends: 2,
      isFriend: false,
    },
    {
      id: "c5",
      name: "Hoàng Văn E",
      status: "online",
      mutualFriends: 12,
      isFriend: true,
    },
  ];

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic here
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
    <DarkConfigProvider>
      <div className="flex h-full bg-[#0f172a] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[360px] flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 h-full overflow-hidden">
          {/* Header với Search và Icons */}
          <div className="px-2 py-4 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <Input
                prefix={<SearchOutlined style={{ color: "white" }} />}
                placeholder="Tìm kiếm"
                className="flex-1 rounded-lg [&_.anticon]:text-white!"
                size="small"
              />
              <Button
                type="text"
                size="small"
                icon={<UserAddOutlined className="text-sm" style={{ color: "white" }} />}
                className="rounded-lg hover:bg-slate-800 [&_.anticon]:text-white!"
              />
              <Button
                size="small"
                type="text"
                icon={<TeamOutlined className="text-lg" style={{ color: "white" }} />}
                className="rounded-lg hover:bg-slate-800 [&_.anticon]:text-white!"
              />
            </div>
          </div>

          {/* Conversations List or Contacts List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {bottomTab === "contacts" ? (
              // Contacts List
              <div className="px-4 py-2">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Bạn bè</h3>
                  {contacts
                    .filter((c) => c.isFriend)
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => {
                          // Tìm conversation với contact này hoặc tạo mới
                          const existingConv = conversations.find((c) => c.name === contact.name);
                          if (existingConv) {
                            setSelectedConversation(existingConv.id);
                            setBottomTab("messages"); // Switch back to messages tab
                          }
                        }}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {contact.name.charAt(0)}
                          </div>
                          {contact.status === "online" && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {contact.status === "away" && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{contact.name}</p>
                          {contact.mutualFriends && <p className="text-xs text-slate-400">{contact.mutualFriends} bạn chung</p>}
                        </div>
                        <Button
                          type="text"
                          size="small"
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle message
                          }}
                        >
                          Nhắn tin
                        </Button>
                      </div>
                    ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Gợi ý kết bạn</h3>
                  {contacts
                    .filter((c) => !c.isFriend)
                    .map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold">
                            {contact.name.charAt(0)}
                          </div>
                          {contact.status === "online" && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{contact.name}</p>
                          {contact.mutualFriends && <p className="text-xs text-slate-400">{contact.mutualFriends} bạn chung</p>}
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={() => {
                            // Handle add friend
                          }}
                        >
                          Kết bạn
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ) : bottomTab === "cloud" ? (
              // Cloud Content
              <div className="px-4 py-4">
                <div className="text-center py-8">
                  <CloudOutlined className="text-5xl mb-4" style={{ color: "white" }} />
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">Cloud của tôi</h3>
                  <p className="text-sm text-slate-400 mb-4">Lưu trữ file quan trọng của bạn</p>
                  <Button type="primary" className="bg-blue-500 hover:bg-blue-600">
                    Tải file lên
                  </Button>
                </div>
              </div>
            ) : bottomTab === "settings" ? (
              // Settings Content
              <div className="px-4 py-4">
                <div className="text-center py-8">
                  <SettingOutlined className="text-5xl mb-4" style={{ color: "white" }} />
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">Cài đặt</h3>
                  <p className="text-sm text-slate-400">Tùy chỉnh cài đặt của bạn</p>
                </div>
              </div>
            ) : bottomTab === "messages" || bottomTab === null ? (
              // Conversations List (default for messages)
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-3 p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 ${
                    conversation.id === selectedConversation ? "bg-slate-800 shadow-md shadow-slate-900/50" : "hover:bg-slate-800/50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  {/* Avatar/Icon */}
                  <div className="relative shrink-0">
                    {conversation.isCloud ? (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <CloudOutlined className="text-xl text-white" />
                      </div>
                    ) : conversation.isNotification ? (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <BellOutlined className="text-xl text-white" />
                      </div>
                    ) : conversation.isGroup ? (
                      <div className="relative w-12 h-12">
                        {/* Group Avatar Composition */}
                        <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 z-20 flex items-center justify-center text-white text-xs font-bold">
                          {conversation.name.charAt(0)}
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 z-10 flex items-center justify-center text-white text-xs font-bold">
                          M
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 z-0 flex items-center justify-center text-white text-[10px] font-bold">
                          +3
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-purple-500/20">
                          {conversation.name.charAt(0)}
                        </div>
                        {conversation.id === "3" && ( // Mock online status logic
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 min-w-0 relative">
                    <div className="flex justify-between items-center mb-1">
                      <p
                        className={`text-[15px] font-semibold truncate ${conversation.id === selectedConversation ? "text-white" : "text-slate-200"}`}
                      >
                        {conversation.name}
                      </p>
                      {conversation.time && (
                        <p className={`text-[11px] ${conversation.id === selectedConversation ? "text-blue-400" : "text-slate-500"}`}>
                          {conversation.time}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center h-5">
                      <p className={`text-sm truncate pr-8 ${conversation.unread ? "font-medium text-slate-300" : "text-slate-500"}`}>
                        {conversation.isOwn ? "Bạn: " : ""}
                        {conversation.lastMessage}
                      </p>

                      {/* Action Area - Absolute positioned */}
                      <div className="absolute right-0 bottom-0 flex items-center justify-end h-5 z-10">
                        {conversation.unread ? (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-blue-500/30">
                            {conversation.unread}
                          </span>
                        ) : (
                          // Always render button but control visibility to prevent any possible layout thrashing
                          <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            className={`text-slate-400 hover:text-white hover:bg-slate-700/50 min-w-[24px] w-6 h-6 flex items-center justify-center transition-all duration-200 ${
                              conversation.id === selectedConversation
                                ? "opacity-100 visible"
                                : "opacity-0 invisible group-hover:visible group-hover:opacity-100"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle more options
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Bottom Sidebar */}
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-center gap-2">
            <button
              onClick={() => router.push("/")}
              title="Trang chủ"
              className="p-2 rounded-lg hover:bg-slate-800 transition-all duration-200 border-none bg-transparent cursor-pointer flex items-center justify-center"
            >
              <HomeOutlined className="text-lg" style={{ color: "white" }} />
            </button>
            <button
              onClick={() => setBottomTab("messages")}
              title="Tin nhắn"
              className={`p-2 rounded-lg transition-all duration-200 border-none cursor-pointer flex items-center justify-center ${
                bottomTab === "messages" ? "bg-blue-500! shadow-md scale-105" : "hover:bg-slate-800 bg-transparent"
              }`}
            >
              <MessageOutlined
                className={`text-lg transition-all duration-200 ${bottomTab === "messages" ? "scale-110" : ""}`}
                style={{ color: "white" }}
              />
            </button>
            <button
              onClick={() => setBottomTab("contacts")}
              title="Danh bạ"
              className={`p-2 rounded-lg transition-all duration-200 border-none cursor-pointer flex items-center justify-center ${
                bottomTab === "contacts" ? "bg-blue-500! shadow-md scale-105" : "hover:bg-slate-800 bg-transparent"
              }`}
            >
              <ContactsOutlined
                className={`text-lg transition-all duration-200 ${bottomTab === "contacts" ? "scale-110" : ""}`}
                style={{ color: "white" }}
              />
            </button>
            <button
              onClick={() => setBottomTab("cloud")}
              title="Cloud của tôi"
              className={`p-2 rounded-lg transition-all duration-200 border-none cursor-pointer flex items-center justify-center ${
                bottomTab === "cloud" ? "bg-blue-500! shadow-md scale-105" : "hover:bg-slate-800 bg-transparent"
              }`}
            >
              <CloudOutlined
                className={`text-lg transition-all duration-200 ${bottomTab === "cloud" ? "scale-110" : ""}`}
                style={{ color: "white" }}
              />
            </button>
            <button
              onClick={() => setBottomTab("settings")}
              title="Cài đặt"
              className={`p-2 rounded-lg transition-all duration-200 border-none cursor-pointer flex items-center justify-center ${
                bottomTab === "settings" ? "bg-blue-500! shadow-md scale-105" : "hover:bg-slate-800 bg-transparent"
              }`}
            >
              <SettingOutlined
                className={`text-lg transition-all duration-200 ${bottomTab === "settings" ? "scale-110" : ""}`}
                style={{ color: "white" }}
              />
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-900 relative h-full overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  {activeConversation.isGroup ? (
                    <div className="grid grid-cols-2 gap-0.5 w-12 h-12 rounded-lg overflow-hidden ring-1 ring-slate-700">
                      <div className="bg-blue-500"></div>
                      <div className="bg-green-500"></div>
                      <div className="bg-yellow-500"></div>
                      <div className="bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white">+2</div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                      {activeConversation.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-slate-200 leading-tight">{activeConversation.name}</h2>
                    {activeConversation.isGroup && activeConversation.members && (
                      <p className="text-xs text-slate-400">
                        {activeConversation.members} thành viên
                        {activeConversation.lastAccess && ` • ${activeConversation.lastAccess}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Button
                    type="text"
                    icon={<UserAddOutlined className="text-lg" style={{ color: "white" }} />}
                    className="p-2 rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
                  />
                  <Button
                    type="text"
                    icon={<SearchOutlined className="text-lg" style={{ color: "white" }} />}
                    className="p-2 rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
                  />
                  <Button
                    type="text"
                    icon={<VideoCameraOutlined className="text-lg" style={{ color: "white" }} />}
                    className="p-2 rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
                  />
                  <Button
                    type="text"
                    icon={<MoreOutlined className="text-lg" style={{ color: "white" }} />}
                    className="p-2 rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
                  />
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col gap-4 bg-[#0f172a]">
                {/* Today separator */}
                <div className="flex justify-center">
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Hôm nay</span>
                </div>

                {/* Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 max-w-[75%] ${msg.isOwn ? "flex-row-reverse self-end" : ""}`}>
                    {!msg.isOwn && (
                      <div className="shrink-0 flex flex-col justify-end">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                          {msg.sender.charAt(0)}
                        </div>
                      </div>
                    )}
                    {msg.isOwn && <div className="shrink-0 w-8"></div>}
                    <div className={`flex flex-col gap-1 ${msg.isOwn ? "items-end" : ""}`}>
                      {!msg.isOwn && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{msg.sender}</span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                      )}
                      {msg.isOwn && (
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                      )}
                      {msg.fileAttachment ? (
                        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-900 rounded flex items-center justify-center">
                              <FileTextOutlined className="text-lg" style={{ color: "white" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{msg.fileAttachment.name}</p>
                              <p className="text-xs text-slate-400">{msg.fileAttachment.size}</p>
                            </div>
                            <Button
                              type="text"
                              icon={<DownloadOutlined style={{ color: "white" }} />}
                              className="p-1 hover:bg-slate-700 [&_.anticon]:text-white!"
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-3 rounded-lg shadow-sm text-sm leading-relaxed ${
                            msg.isOwn ? "bg-blue-500 text-white rounded-br-sm" : "bg-slate-800 rounded-bl-sm border border-slate-700 text-slate-200"
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="px-6 py-5 bg-slate-900 border-t border-slate-800 shrink-0 relative z-20">
                <div className="bg-slate-800 rounded-2xl border border-slate-700/50 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all duration-200 flex flex-col">
                  {/* Text Input Section */}
                  <div className="px-4 py-3">
                    <textarea
                      className="w-full bg-transparent border-none p-0 text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none resize-none text-base leading-relaxed custom-scrollbar"
                      placeholder="Nhập tin nhắn..."
                      rows={1}
                      value={message}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyPress}
                      style={{ minHeight: "24px", maxHeight: "150px" }}
                    />
                  </div>

                  {/* Toolbar Section (Bottom) */}
                  <div className="flex items-center justify-between px-2 pb-2 pt-1 border-t border-slate-700/30">
                    <div className="flex items-center gap-1">
                      {/* Attachments Group */}
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Đính kèm file"
                      >
                        <PaperClipOutlined className="text-xl" />
                      </button>
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Hình ảnh"
                      >
                        <PictureOutlined className="text-xl" />
                      </button>

                      <div className="w-px h-5 bg-slate-700/50 mx-1"></div>

                      {/* Rich Text / Other Tools */}
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Link"
                      >
                        <LinkOutlined className="text-xl" />
                      </button>
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Tài liệu"
                      >
                        <FileTextOutlined className="text-xl" />
                      </button>

                      <div className="w-px h-5 bg-slate-700/50 mx-1"></div>

                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-yellow-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95"
                        title="Emoji"
                      >
                        <SmileOutlined className="text-xl" />
                      </button>
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all active:scale-95 font-bold"
                        title="Mention"
                      >
                        @
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="px-5 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center gap-2 font-medium text-sm active:scale-95"
                      >
                        <SendOutlined />
                        <span>Gửi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </main>
      </div>
    </DarkConfigProvider>
  );
}
