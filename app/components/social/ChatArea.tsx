import React, { useEffect, useRef, useMemo } from "react";
import { Button } from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  SearchOutlined,
  StopOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { useSocial } from "@/app/social/SocialContext";

import { Conversation, Message } from "./types";

interface ChatAreaProps {
  activeConversation?: Conversation;
  messages: Message[];
  message: string;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  onInteraction: () => void;
  partnerLastReadMessageId?: string | number;
  partnerAvatar?: string | null;
}

export default function ChatArea({
  activeConversation,
  messages,
  message,
  handleTextareaChange,
  handleKeyPress,
  handleSendMessage,
  onInteraction,
  partnerLastReadMessageId,
  partnerAvatar,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    contacts,
    setIsAddFriendOpen,
    currentUser,
    blockedUserIds,
    blockedByUserIds,
    blockUser,
    unblockUser,
  } = useSocial();

  // Derived state
  // Partner ID
  const partnerId = useMemo(() => {
    if (!activeConversation || activeConversation.isGroup || !currentUser)
      return null;
    return activeConversation.memberIds?.find(
      (id) => String(id) !== String(currentUser.id)
    );
  }, [activeConversation, currentUser]);

  // Block Status
  const isBlockedByMe = useMemo(() => {
    if (!partnerId) return false;
    return blockedUserIds.has(String(partnerId));
  }, [partnerId, blockedUserIds]);

  const isBlockedByPartner = useMemo(() => {
    if (!partnerId) return false;
    return blockedByUserIds.has(String(partnerId));
  }, [partnerId, blockedByUserIds]);

  const isBlocked = isBlockedByMe || isBlockedByPartner;

  const handleBlockToggle = () => {
    if (!partnerId) return;
    if (isBlockedByMe) {
      Swal.fire({
        title: "Bỏ chặn người dùng?",
        text: "Bạn sẽ có thể nhận tin nhắn từ người này.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        background: "#1e293b",
        color: "#f1f5f9",
      }).then((result) => {
        if (result.isConfirmed) {
          unblockUser(String(partnerId));
        }
      });
    } else {
      Swal.fire({
        title: "Chặn người dùng này?",
        text: "Bạn sẽ không thể gửi hoặc nhận tin nhắn từ người này.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Chặn ngay",
        cancelButtonText: "Hủy",
        background: "#1e293b",
        color: "#f1f5f9",
      }).then((result) => {
        if (result.isConfirmed) {
          blockUser(String(partnerId));
        }
      });
    }
  };

  const isFriend = useMemo(() => {
    if (!activeConversation || activeConversation.isGroup || !currentUser)
      return false;

    if (!partnerId) return false;

    // Check if this partner is in my contacts list
    return contacts.some((c) => String(c.id) === String(partnerId));
  }, [activeConversation, contacts, currentUser, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ... (seenMessageId logic same as before) ...
  const seenMessageId = useMemo(() => {
    if (!partnerLastReadMessageId || messages.length === 0) return null;

    const readIdNum = Number(partnerLastReadMessageId);

    // Iterate backwards from the end
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgIdNum = Number(msg.id);

      // If we found a message that is older or equal to what partner read
      if (msgIdNum <= readIdNum) {
        // If it's my message, this is the one!
        if (msg.isOwn) {
          return msg.id;
        }
        // If it's partner's message (e.g. they replied), continue searching backwards for MY last message
      }
    }
    return null;
  }, [messages, partnerLastReadMessageId]);

  if (!activeConversation) {
    // ... same ...
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="text-center">
          <p className="text-lg font-medium mb-2 text-gray-700 dark:text-slate-200">Chào mừng đến với EduLearn Chat</p>
          <p className="text-sm opacity-70">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          {activeConversation.isGroup ? (
            <div className="grid grid-cols-2 gap-0.5 w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-700">
              <div className="bg-blue-500"></div>
              <div className="bg-green-500"></div>
              <div className="bg-yellow-500"></div>
              <div className="bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white">+2</div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              {activeConversation.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-200 leading-tight">{activeConversation.name}</h2>
            {activeConversation.isGroup && activeConversation.members && (
              <p className="text-xs text-slate-400">
                {activeConversation.members} thành viên
                {activeConversation.lastAccess && ` • ${activeConversation.lastAccess}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          {!isBlocked && (
            <Button
              type="text"
              size="small"
              icon={
                <StopOutlined
                  className={`text-[16px] ${isBlockedByMe ? "text-red-500" : "text-gray-500 dark:text-white"}`}
                />
              }
              className={`p-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-500 [&_.anticon]:text-gray-500 dark:[&_.anticon]:text-white! ${isBlockedByMe ? "bg-red-500/10" : ""
                }`}
              title={isBlockedByMe ? "Bỏ chặn" : "Chặn"}
              onClick={handleBlockToggle}
            />
          )}


          {/* Conditional Buttons based on Friendship */}
          {!activeConversation.isGroup && !isFriend && (
            <Button
              type="text"
              size="small"
              onClick={() => setIsAddFriendOpen(true)}
              icon={<UserAddOutlined className="text-[16px]" />}
              className="p-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-gray-500 dark:[&_.anticon]:text-white!"
              title="Thêm bạn bè"
            />
          )}

          {/* Show Call/Video ONLY if Friend or Group AND NOT Blocked */}
          {(isFriend || activeConversation.isGroup) && !isBlocked && (
            <>
              <Button
                type="text"
                size="small"
                icon={<PhoneOutlined className="text-[16px]" />}
                className="p-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-gray-500 dark:[&_.anticon]:text-white!"
              />
              <Button
                type="text"
                size="small"
                icon={<VideoCameraOutlined className="text-[16px]" />}
                className="p-0 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-gray-500 dark:[&_.anticon]:text-white!"
              />
            </>
          )}


        </div>
      </header>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 flex flex-col gap-4 bg-gray-50 dark:bg-[#0f172a] min-h-0 transition-colors duration-300"
        onScroll={onInteraction}
        onClick={onInteraction}
      >
        {/* Today separator */}
        <div className="flex justify-center">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 px-3 py-1 rounded-full">Hôm nay</span>
        </div>

        {/* Messages */}
        {messages.map((msg, index) => {
          const isSameSender = index > 0 && messages[index - 1].sender === msg.sender;
          const showAvatar = !msg.isOwn && !isSameSender;
          const showHeader = !msg.isOwn && !isSameSender;

          return (
            <div key={msg.id} className={`flex gap-3 max-w-[75%] ${msg.isOwn ? "flex-row-reverse self-end" : ""} ${isSameSender ? "mt-1" : "mt-4"}`}>
              {!msg.isOwn && (
                <div className="shrink-0 flex flex-col justify-end w-8">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {msg.sender.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}
              {/* Own message spacer removed */}

              <div className={`flex flex-col gap-1 ${msg.isOwn ? "items-end" : ""}`}>
                {showHeader && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                )}
                {/* For subsequent messages from same sender, show time on hover or simplified? Zalo specific: only show time for first? Or just show content. */}
                {/* If grouped, we hide header. But we might want to show time for group? */}

                {msg.fileAttachment ? (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                        <FileTextOutlined className="text-lg text-red-600 dark:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-200 truncate">{msg.fileAttachment.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{msg.fileAttachment.size}</p>
                      </div>
                      <Button
                        type="text"
                        icon={<DownloadOutlined className="text-gray-500 dark:text-white" />}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-lg shadow-sm text-sm leading-relaxed ${msg.isOwn ? "bg-blue-500 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 rounded-bl-sm border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 shadow-sm"
                      }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                )}

                {/* Read Receipt (Seen Indicator) */}
                {msg.isOwn && String(msg.id) === String(seenMessageId) && (
                  <div className="flex justify-end mt-0.5 items-center gap-1">
                    <span className="text-[10px] text-slate-400">Đã xem</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                      <UserOutlined />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shrink-0 relative z-20 transition-colors duration-300">
        {isBlocked ? (
          <div className="flex items-center justify-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            {isBlockedByMe ? (
              <p className="text-red-400 font-medium">
                Bạn đã chặn người dùng này.{" "}
                <button
                  onClick={handleBlockToggle}
                  className="underline hover:text-red-300 font-bold ml-1"
                >
                  Bỏ chặn
                </button>{" "}
                để nhắn tin.
              </p>
            ) : (
              <p className="text-slate-400 font-medium">
                Bạn không thể nhắn tin cho người dùng này.
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-3 bg-gray-100 dark:bg-slate-800 p-2 pr-2 rounded-2xl border border-transparent dark:border-slate-700/50 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all duration-200">
            <textarea
              className="flex-1 bg-transparent border-none px-4 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-500 focus:ring-0 focus:outline-none resize-none text-base leading-relaxed custom-scrollbar max-h-[120px]"
              placeholder="Nhập tin nhắn..."
              rows={1}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              onFocus={onInteraction}
              onClick={onInteraction}
              style={{ minHeight: "24px" }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="mb-1 w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center active:scale-95"
            >
              <SendOutlined className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
