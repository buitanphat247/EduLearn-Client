import { Input, Button } from "antd";
import Swal from "sweetalert2";
import { UserAddOutlined, ContactsOutlined, SearchOutlined, TeamOutlined, MessageOutlined, DeleteOutlined, SendOutlined } from "@ant-design/icons";
import { FriendRequestResponse, Contact } from "./types";

interface ContactsContentProps {
  contactSubTab: "friends" | "groups" | "requests" | "sent_requests";
  receivedFriendRequests: FriendRequestResponse[];
  sentFriendRequests: FriendRequestResponse[];
  contacts: Contact[];
  loadingFriendRequests: boolean;
  handleAcceptFriendRequest: (id: number) => void;
  handleRejectFriendRequest: (id: number) => void;
  handleRemoveFriend: (id: string) => void;
}

export default function ContactsContent({
  contactSubTab,
  receivedFriendRequests,
  sentFriendRequests,
  contacts,
  loadingFriendRequests,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleRemoveFriend,
}: ContactsContentProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-8">
      {contactSubTab === "sent_requests" && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <SendOutlined /> Lời mời đã gửi ({sentFriendRequests.length})
          </h2>

          {loadingFriendRequests ? (
            <div className="flex justify-center py-12">
              <span className="text-slate-400">Đang tải...</span>
            </div>
          ) : sentFriendRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-800">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <SendOutlined className="text-4xl text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">Bạn chưa gửi lời mời kết bạn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {sentFriendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-4 hover:border-blue-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                      {request.addressee?.fullname?.charAt(0) || request.addressee?.username?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate text-[15px]">{request.addressee?.fullname || request.addressee?.username}</h3>
                      <p className="text-xs text-slate-400">{request.addressee?.email || "Người dùng ứng dụng"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 min-h-[60px]">
                    <p className="text-sm text-slate-300 line-clamp-2 italic">Đang chờ chấp nhận...</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-auto">
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-red-500/10 text-red-400 border border-slate-600 font-medium rounded-lg hover:border-red-500 hover:text-red-500 transition-all h-8"
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
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserAddOutlined /> Lời mời kết bạn ({receivedFriendRequests.length})
          </h2>

          {loadingFriendRequests ? (
            <div className="flex justify-center py-12">
              <span className="text-slate-400">Đang tải...</span>
            </div>
          ) : receivedFriendRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-2xl border border-slate-800">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <UserAddOutlined className="text-4xl text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">Không có lời mời kết bạn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {receivedFriendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col gap-4 hover:border-blue-500/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                      {request.requester?.fullname?.charAt(0) || request.requester?.username?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate text-[15px]">{request.requester?.fullname || request.requester?.username}</h3>
                      <p className="text-xs text-slate-400">{request.requester?.email || "Người dùng ứng dụng"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 min-h-[60px]">
                    <p className="text-sm text-slate-300 line-clamp-2">"Xin chào, mình kết bạn với bạn nhé!"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      size="small"
                      className="bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-600 font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all h-8"
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
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ContactsOutlined /> Danh sách bạn bè ({contacts.filter((c) => c.isFriend).length})
          </h2>
          {/* Search bar inside Friends view */}
          <div className="mb-6">
            <Input
              size="small"
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm bạn bè..."
              className="bg-slate-800 border-slate-700 text-white rounded-xl"
              variant="filled"
            />
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            {contacts.filter((c) => c.isFriend).length > 0 ? (
              contacts
                .filter((c) => c.isFriend)
                .map((contact, index) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-4 p-2 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      index !== 0 ? "border-t border-slate-700" : ""
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
                      <h3 className="text-white font-medium text-base">{contact.name}</h3>
                      {contact.mutualFriends && <p className="text-slate-400 text-sm">{contact.mutualFriends} bạn chung</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button icon={<MessageOutlined />} size="small" type="text" className="text-slate-400 hover:text-white hover:bg-slate-600" />
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        type="text"
                        className="text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => {
                          Swal.fire({
                            title: "Hủy kết bạn?",
                            html: `<div style="color: #94a3b8">Bạn có chắc chắn muốn hủy kết bạn với <span style="color: #fff; font-weight: 600">${contact.name}</span>?</div>`,
                            icon: "warning",
                            background: "#1e293b",
                            color: "#fff",
                            showCancelButton: true,
                            confirmButtonColor: "#dc2626",
                            cancelButtonColor: "#334155",
                            confirmButtonText: "Xóa bạn bè",
                            cancelButtonText: "Hủy",
                            focusCancel: true,
                            customClass: {
                              popup: "rounded-2xl border border-slate-700 shadow-xl",
                              title: "text-xl font-bold text-white",
                              confirmButton: "rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-red-600/20 text-sm",
                              cancelButton: "rounded-xl px-6 py-2.5 font-medium hover:bg-slate-600 text-white text-sm",
                            },
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleRemoveFriend(contact.id);
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <TeamOutlined className="text-4xl mb-4 opacity-50" />
                <p>Chưa có bạn bè nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {contactSubTab === "groups" && (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <TeamOutlined className="text-5xl text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Danh sách nhóm</h2>
          <p className="text-slate-400 text-center max-w-md">Tính năng này đang được phát triển. Bạn sẽ sớm có thể tạo và tham gia các nhóm chat.</p>
        </div>
      )}
    </div>
  );
}
