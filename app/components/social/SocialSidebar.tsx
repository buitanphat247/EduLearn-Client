import React from "react";
import { Input, Button } from "antd";
import { SearchOutlined, UserAddOutlined, ContactsOutlined, TeamOutlined, BellOutlined, MoreOutlined, SendOutlined } from "@ant-design/icons";
import { Conversation } from "./types";

interface SocialSidebarProps {
  bottomTab: "messages" | "contacts";
  contactSubTab: "friends" | "groups" | "requests" | "sent_requests";
  setContactSubTab: (tab: "friends" | "groups" | "requests" | "sent_requests") => void;
  conversations: Conversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  receivedFriendRequestsCount: number;
  handleAddFriendClick: () => void;
}

export default function SocialSidebar({
  bottomTab,
  contactSubTab,
  setContactSubTab,
  conversations,
  selectedConversation,
  setSelectedConversation,
  receivedFriendRequestsCount,
  handleAddFriendClick,
}: SocialSidebarProps) {
  return (
    <aside className="w-[320px] flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 h-full overflow-hidden">
      {/* Header với Search và Icons - Only show for Messages */}
      {bottomTab === "messages" && (
        <div className="px-3 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm kiếm"
              size="small"
              className="flex-1 rounded-lg bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 hover:border-slate-600 focus:border-blue-500 hover:bg-slate-800 focus:bg-slate-800 focus:shadow-none text-sm"
              variant="filled"
            />
            <Button
              type="text"
              size="small"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 "
              onClick={handleAddFriendClick}
              icon={<UserAddOutlined />}
            />
          </div>
        </div>
      )}

      {bottomTab === "contacts" && (
        <div className="px-3 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              size="small"
              placeholder="Tìm kiếm bạn bè"
              className="flex-1 rounded-lg bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 hover:border-slate-600 focus:border-blue-500 hover:bg-slate-800 focus:bg-slate-800 focus:shadow-none text-sm"
              variant="filled"
            />
            <Button
              type="text"
              size="small"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white p-0 border border-slate-700/50"
              onClick={handleAddFriendClick}
              icon={<UserAddOutlined />}
            />
          </div>
        </div>
      )}

      {/* Conversations List or Contacts Menu */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {bottomTab === "contacts" ? (
          // Contacts Sub-Menu Structure (Zalo Style)
          <div className="py-2 px-2 flex flex-col gap-1">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                contactSubTab === "friends" ? "bg-blue-600/10 text-blue-400" : "text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setContactSubTab("friends")}
            >
              <ContactsOutlined className="text-xl" />
              <span className="font-medium">Danh sách bạn bè</span>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                contactSubTab === "groups" ? "bg-blue-600/10 text-blue-400" : "text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setContactSubTab("groups")}
            >
              <TeamOutlined className="text-xl" />
              <span className="font-medium">Danh sách nhóm</span>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                contactSubTab === "requests" ? "bg-blue-600/10 text-blue-400" : "text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setContactSubTab("requests")}
            >
              <UserAddOutlined className="text-xl" />
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium">Lời mời kết bạn</span>
                {receivedFriendRequestsCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {receivedFriendRequestsCount}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                contactSubTab === "sent_requests" ? "bg-blue-600/10 text-blue-400" : "text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => setContactSubTab("sent_requests")}
            >
              <SendOutlined className="text-xl" />
              <span className="font-medium">Lời mời đã gửi</span>
            </div>
          </div>
        ) : (
          // Conversations List (default for messages)
          <div className="py-2 px-2 flex flex-col gap-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  conversation.id === selectedConversation
                    ? "bg-slate-800 shadow-md shadow-slate-900/50 ring-1 ring-slate-700/50"
                    : "hover:bg-slate-800/50"
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                {/* Avatar/Icon */}
                <div className="relative shrink-0">
                  {conversation.isNotification ? (
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
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-[15px] font-semibold truncate ${conversation.id === selectedConversation ? "text-white" : "text-slate-200"}`}>
                      {conversation.name}
                    </p>
                    {conversation.time && (
                      <p className={`text-[11px] font-medium ${conversation.id === selectedConversation ? "text-blue-400" : "text-slate-500"}`}>
                        {conversation.time}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center h-5">
                    <p className={`text-sm truncate pr-6 ${conversation.unread ? "font-semibold text-slate-300" : "text-slate-500"}`}>
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
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
