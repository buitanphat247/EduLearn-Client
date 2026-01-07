import React from "react";
import { Button } from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Conversation, Message } from "./types";

interface ChatAreaProps {
  activeConversation?: Conversation;
  messages: Message[];
  message: string;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
}

export default function ChatArea({ activeConversation, messages, message, handleTextareaChange, handleKeyPress, handleSendMessage }: ChatAreaProps) {
  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-900">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Chào mừng đến với EduLearn Chat</p>
          <p className="text-sm opacity-70">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
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
            <h2 className="text-base font-bold text-slate-200 leading-tight">{activeConversation.name}</h2>
            {activeConversation.isGroup && activeConversation.members && (
              <p className="text-xs text-slate-400">
                {activeConversation.members} thành viên
                {activeConversation.lastAccess && ` • ${activeConversation.lastAccess}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Button
            type="text"
            size="small"
            icon={<UserAddOutlined className="text-[16px]" style={{ color: "white" }} />}
            className="p-0 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
          />
          <Button
            type="text"
            size="small"
            icon={<SearchOutlined className="text-[16px]" style={{ color: "white" }} />}
            className="p-0 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
          />
          <Button
            type="text"
            size="small"
            icon={<VideoCameraOutlined className="text-[16px]" style={{ color: "white" }} />}
            className="p-0 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
          />
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined className="text-[16px]" style={{ color: "white" }} />}
            className="p-0 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:text-blue-400 [&_.anticon]:text-white!"
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
      <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 shrink-0 relative z-20">
        <div className="flex items-end gap-3 bg-slate-800 p-2 pr-2 rounded-2xl border border-slate-700/50 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all duration-200">
          <textarea
            className="flex-1 bg-transparent border-none px-4 py-3 text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none resize-none text-base leading-relaxed custom-scrollbar max-h-[120px]"
            placeholder="Nhập tin nhắn..."
            rows={1}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
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
      </div>
    </>
  );
}
