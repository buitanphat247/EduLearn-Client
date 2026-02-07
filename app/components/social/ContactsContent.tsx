import React, { useState } from "react";
import { Input, Button } from "antd";
import { showConfirmModal } from "./SocialHelpers";
import {
  UserAddOutlined,
  ContactsOutlined,
  SearchOutlined,
  TeamOutlined,
  MessageOutlined,
  DeleteOutlined,
  SendOutlined,
  StopOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { FriendRequestResponse, Contact } from "./types";

interface ContactsContentProps {
  contactSubTab: "friends" | "groups" | "requests" | "sent_requests" | "blocked";
  receivedFriendRequests: FriendRequestResponse[];
  sentFriendRequests: FriendRequestResponse[];
  contacts: Contact[];
  blockedUsers: any[]; // UserBlock[]
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  loadingFriendRequests: boolean;
  handleAcceptFriendRequest: (id: number) => void;
  handleRejectFriendRequest: (id: number) => void;
  handleRemoveFriend: (id: string) => void;
  handleStartChat: (id: string) => void;
  handleUnblockUser: (id: string) => void;
  handleBlockUser: (id: string) => void;
}

export default function ContactsContent({
  contactSubTab,
  receivedFriendRequests,
  sentFriendRequests,
  contacts,
  blockedUsers,
  blockedUserIds,
  blockedByUserIds,
  loadingFriendRequests,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleRemoveFriend,
  handleStartChat,
  handleUnblockUser,
  handleBlockUser,
}: ContactsContentProps) {
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  const filteredContacts = contacts.filter((c) => {
    if (!c.isFriend) return false;
    if (!friendSearchQuery.trim()) return true;
    return c.name.toLowerCase().includes(friendSearchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 p-8 transition-colors duration-300">
      {/* Existing tabs... */}
      {contactSubTab === "sent_requests" && (
        // ... (sent_requests UI)
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <SendOutlined /> Lời mời đã gửi ({sentFriendRequests.length})
          </h2>

          {loadingFriendRequests ? (
            <div className="flex justify-center py-12">
              <span className="text-slate-400">Đang tải...</span>
            </div>
          ) : sentFriendRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <SendOutlined className="text-4xl text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg">Bạn chưa gửi lời mời kết bạn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {sentFriendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col gap-4 hover:border-blue-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                      {request.addressee?.fullname?.charAt(0) || request.addressee?.username?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-semibold truncate text-[15px]">{request.addressee?.fullname || request.addressee?.username}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{request.addressee?.email || "Người dùng ứng dụng"}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700/50 min-h-[60px]">
                    <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2 italic">Đang chờ chấp nhận...</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-auto">
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-red-500/10 text-red-500 dark:text-red-400 border border-gray-300 dark:border-slate-600 font-medium rounded-lg hover:border-red-500 hover:text-red-600 dark:hover:text-red-500 transition-all h-8"
                      onClick={() => handleRejectFriendRequest(request.id)}
                    >
                      Thu hồi lời mời
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contactSubTab === "requests" && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <UserAddOutlined /> Lời mời kết bạn ({receivedFriendRequests.length})
          </h2>

          {loadingFriendRequests ? (
            <div className="flex justify-center py-12">
              <span className="text-slate-400">Đang tải...</span>
            </div>
          ) : receivedFriendRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <UserAddOutlined className="text-4xl text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg">Không có lời mời kết bạn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {receivedFriendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col gap-4 hover:border-blue-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                      {request.requester?.fullname?.charAt(0) || request.requester?.username?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 dark:text-white font-semibold truncate text-[15px]">{request.requester?.fullname || request.requester?.username}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{request.requester?.email || "Người dùng ứng dụng"}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700/50 min-h-[60px]">
                    <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">"Xin chào, mình kết bạn với bạn nhé!"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600 font-medium rounded-lg hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-900 dark:hover:text-white transition-all h-8"
                      onClick={() => handleRejectFriendRequest(request.id)}
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="small"
                      className="bg-blue-600 hover:bg-blue-500 border-none text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 h-8"
                      onClick={() => handleAcceptFriendRequest(request.id)}
                    >
                      Đồng ý
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contactSubTab === "friends" && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ContactsOutlined /> Danh sách bạn bè ({filteredContacts.length})
          </h2>
          {/* Search bar inside Friends view */}
          <div className="mb-6">
            <Input
              size="small"
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm bạn bè..."
              className="bg-gray-100 dark:bg-slate-800 border-transparent dark:border-slate-700 text-gray-900 dark:text-white rounded-xl placeholder-gray-500 dark:placeholder-slate-500"
              variant="filled"
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {filteredContacts.length > 0 ? (
              filteredContacts
                .map((contact, index) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${index !== 0 ? "border-t border-gray-100 dark:border-slate-700" : ""
                      }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                        {contact.name.charAt(0)}
                      </div>
                      {contact.status === "online" && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 dark:text-white font-medium text-base mb-0">{contact.name}</h3>
                        {blockedUserIds.has(contact.id) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                            Đã chặn
                          </span>
                        )}
                        {blockedByUserIds.has(contact.id) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                            Bị Block
                          </span>
                        )}
                      </div>
                      {contact.mutualFriends && <p className="text-gray-500 dark:text-slate-400 text-sm mb-0">{contact.mutualFriends} bạn chung</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        icon={<MessageOutlined />}
                        size="small"
                        type="text"
                        className="text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600"
                        onClick={() => handleStartChat(contact.id)}
                      />
                      {blockedUserIds.has(contact.id) ? (
                        <Button
                          icon={<UnlockOutlined />}
                          size="small"
                          type="text"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          title="Gỡ chặn"
                          onClick={() => {
                            const isDarkMode = document.documentElement.classList.contains("dark");
                            Swal.fire({
                              title: "Bỏ chặn người dùng?",
                              text: `Bạn sẽ có thể nhận tin nhắn từ ${contact.name}.`,
                              icon: "question",
                              showCancelButton: true,
                              confirmButtonColor: "#3b82f6",
                              cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
                              confirmButtonText: "Đồng ý",
                              cancelButtonText: "Hủy",
                              background: isDarkMode ? "#1e293b" : "#fff",
                              color: isDarkMode ? "#f1f5f9" : "#111827",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleUnblockUser(contact.id);
                              }
                            });
                          }}
                        />
                      ) : (
                        <Button
                          icon={<StopOutlined />}
                          size="small"
                          type="text"
                          className="text-gray-400 dark:text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10"
                          title="Chặn"
                          onClick={() => {
                            const isDarkMode = document.documentElement.classList.contains("dark");
                            Swal.fire({
                              title: "Chặn người dùng này?",
                              text: `Bạn sẽ không thể nhận tin nhắn từ ${contact.name}.`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#ef4444",
                              cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
                              confirmButtonText: "Chặn ngay",
                              cancelButtonText: "Hủy",
                              background: isDarkMode ? "#1e293b" : "#fff",
                              color: isDarkMode ? "#f1f5f9" : "#111827",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleBlockUser(contact.id);
                              }
                            });
                          }}
                        />
                      )}
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        type="text"
                        className="text-gray-400 dark:text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10"
                        onClick={() => {
                          showConfirmModal({
                            title: "Hủy kết bạn?",
                            html: `<div style="color: #94a3b8">Bạn có chắc chắn muốn hủy kết bạn với <span style="color: #fff; font-weight: 600">${contact.name}</span>?</div>`,
                            confirmButtonText: "Xóa bạn bè",
                            onConfirm: () => handleRemoveFriend(contact.id),
                          });
                        }}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-400">
                <TeamOutlined className="text-4xl mb-4 opacity-50" />
                <p>Chưa có bạn bè nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {contactSubTab === "groups" && (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <TeamOutlined className="text-5xl text-gray-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Danh sách nhóm</h2>
          <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">Tính năng này đang được phát triển. Bạn sẽ sớm có thể tạo và tham gia các nhóm chat.</p>
        </div>
      )}

      {contactSubTab === "blocked" && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <StopOutlined /> Danh sách chặn ({blockedUsers.length})
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {blockedUsers.length > 0 ? (
              blockedUsers.map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${index !== 0 ? "border-t border-gray-100 dark:border-slate-700" : ""
                    }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 font-bold text-lg">
                    {block.blocked?.fullname?.charAt(0) || block.blocked?.username?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-medium text-base">{block.blocked?.fullname || block.blocked?.username}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Đã chặn vào {new Date(block.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button
                    size="small"
                    className="bg-transparent hover:bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-gray-300 dark:border-slate-600 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-500 transition-all"
                    onClick={() => {
                      const isDarkMode = document.documentElement.classList.contains("dark");
                      Swal.fire({
                        title: "Bỏ chặn người dùng?",
                        text: `Bạn sẽ có thể nhận tin nhắn từ ${block.blocked?.fullname || block.blocked?.username}.`,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3b82f6",
                        cancelButtonColor: isDarkMode ? "#64748b" : "#94a3b8",
                        confirmButtonText: "Đồng ý",
                        cancelButtonText: "Hủy",
                        background: isDarkMode ? "#1e293b" : "#fff",
                        color: isDarkMode ? "#f1f5f9" : "#111827",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleUnblockUser(String(block.blocked_id));
                        }
                      });
                    }}
                  >
                    Bỏ chặn
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-slate-400">
                <StopOutlined className="text-4xl mb-4 opacity-50" />
                <p>Bạn chưa chặn ai</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
