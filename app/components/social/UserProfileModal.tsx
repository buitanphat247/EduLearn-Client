import React, { useState } from "react";
import { Modal, Button, Avatar, message } from "antd";
import { MessageOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { GetUsersResponse } from "@/lib/api/users";
import { sendFriendRequest } from "@/lib/api/friends";
import { useSocial } from "@/app/social/SocialContext";
import { useRouter } from "next/navigation";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  onCloseParent?: () => void;
  user: GetUsersResponse | null;
}

export default function UserProfileModal({ open, onClose, onCloseParent, user }: UserProfileModalProps) {
  const router = useRouter();
  const {
    contacts,
    currentUser,
    startChat,
    deleteConversation,
    setContacts,
    blockedUserIds,
    blockedByUserIds,
    unblockUser,
    blockUser
  } = useSocial();
  const [loading, setLoading] = useState(false);

  if (!user) return null;



  const isSelf = String(user.user_id) === String(currentUser?.id);

  // Check relationship
  const friendContact = contacts.find(c => String(c.id) === String(user.user_id) && c.isFriend);
  const isFriend = !!friendContact;

  const handleSendRequest = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      await sendFriendRequest({
        requester_id: Number(currentUser.id),
        addressee_id: user.user_id,
      });
      message.success("Đã gửi lời mời kết bạn");
      onClose();
      if (onCloseParent) onCloseParent(); // Close search modal too
    } catch (error: any) {
      message.error(error.message || "Không thể gửi lời mời");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user.user_id) return;
    try {
      onClose(); // Close search/profile modal
      if (onCloseParent) onCloseParent(); // Close search modal if exists

      const roomId = await startChat(String(user.user_id));
      if (roomId) {
        router.push("/social");
      }
    } catch (error) {
      console.error("Chat start failed", error);
    }
  };

  // For unfriend, we need friendID. If we found contact, we have friendshipId ideally.
  // But contacts array might not have friendshipId if it was transformed from simple list?
  // Our SocialContext contacts list has friendshipId.
  const handleUnfriend = async () => {
    // Logic for unfriend is complex (needs friendship_id or API support to unfriend by userID)
    // Assuming parent component or context handles this, or just redirect to contacts list to manage.
    // For now, let's just close modal and show implemented message unless we import removeFriend api
    message.info("Vui lòng vào danh bạ để hủy kết bạn");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      modalRender={(modal) => (
        <div
          className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl"
        >
          {React.cloneElement(modal as any, { style: { ...(modal as any)?.props?.style, backgroundColor: "transparent", padding: 0 } })}
        </div>
      )}
      styles={{
        header: {
          backgroundColor: "transparent",
          marginBottom: 0,
          padding: "16px",
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          zIndex: 10,
        },
        body: {
          padding: 0,
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
        },
      }}
      closeIcon={
        <span className="text-gray-500 dark:text-white bg-gray-100 dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-black/40 w-8 h-8 flex items-center justify-center rounded-full transition-colors">×</span>
      }
    >
      <div className="flex flex-col relative">
        {/* Cover Image Placeholder */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600 w-full relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        </div>

        <div className="px-6 pb-8 -mt-12 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="rounded-full p-1 bg-white dark:bg-[#0f172a]">
              <Avatar
                src={user.avatar}
                size={100}
                className="border-4 border-white dark:border-[#0f172a] bg-gray-200 dark:bg-slate-700 font-bold text-4xl"
              >
                {user.fullname?.charAt(0) || user.username?.charAt(0) || "? "}
              </Avatar>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.fullname || user.username}</h2>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-gray-500 dark:text-slate-400 mb-0">@{user.username}</p>
            {blockedUserIds.has(String(user.user_id)) && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                Đã chặn
              </span>
            )}
            {blockedByUserIds.has(String(user.user_id)) && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                Bị Block
              </span>
            )}
          </div>

          {/* Role Tag */}
          {user.role?.role_name && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide mb-6 ${user.role.role_name.toLowerCase().includes('admin') || user.role.role_name.toLowerCase().includes('quản trị')
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : user.role.role_name.toLowerCase().includes('teacher') || user.role.role_name.toLowerCase().includes('giáo viên') || user.role.role_name.toLowerCase().includes('gia sư')
                ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                : user.role.role_name.toLowerCase().includes('student') || user.role.role_name.toLowerCase().includes('học sinh') || user.role.role_name.toLowerCase().includes('học viên')
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
              {user.role.role_name}
            </div>
          )}

          {/* Stats / Quick Info */}


          {/* Info List */}
          <div className="w-full flex flex-col gap-4 text-gray-600 dark:text-slate-300 mb-8">
            {user.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800">
                {/* You might want icons here matching ProfileModal if available, or just text */}
                <span className="flex-1 truncate text-gray-700 dark:text-slate-200">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800">
                <span className="flex-1 truncate text-gray-700 dark:text-slate-200">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full">
            {isSelf ? (
              <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-xl text-center text-gray-500 dark:text-slate-400 text-sm border border-gray-200 dark:border-slate-800">
                Đây là tài khoản của bạn
              </div>
            ) : isFriend ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 border-none font-medium shadow-lg shadow-blue-600/20"
                  onClick={handleStartChat}
                >
                  Nhắn tin
                </Button>
                <Button
                  danger
                  icon={<UserDeleteOutlined />}
                  className="w-full h-10 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-medium"
                  onClick={handleUnfriend}
                >
                  Hủy kết bạn
                </Button>
              </div>
            ) : blockedUserIds.has(String(user.user_id)) ? (
              <Button
                type="primary"
                loading={loading}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 border-none font-medium shadow-lg shadow-blue-600/20"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await unblockUser(String(user.user_id));
                    message.success("Đã bỏ chặn");
                  } catch (e) {
                    message.error("Không thể bỏ chặn");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Bỏ chặn
              </Button>
            ) : (
              <Button
                type="primary"
                loading={loading}
                icon={<UserAddOutlined />}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 border-none font-medium shadow-lg shadow-blue-600/20"
                onClick={handleSendRequest}
                disabled={blockedByUserIds.has(String(user.user_id))}
              >
                {blockedByUserIds.has(String(user.user_id)) ? "Không thể kết bạn" : "Kết bạn"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
