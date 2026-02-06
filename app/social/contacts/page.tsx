"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, message as antMessage } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import SocialSidebar from "@/app/components/social/SocialSidebar";
import ContactsContent from "@/app/components/social/ContactsContent";
import { Contact } from "@/app/components/social/types";
import { useSocial } from "../SocialContext";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { sendFriendRequest } from "@/lib/socket";
import { acceptFriendRequest as acceptFriendRequestSocket, rejectFriendRequest as rejectFriendRequestSocket, removeFriend } from "@/lib/socket";

export default function ContactsPage() {
  const router = useRouter();
  const {
    contacts,
    receivedFriendRequests,
    friendRequests,
    setFriendRequests,
    setContacts,
    startChat,
    setIsAddFriendOpen,
    blockedUsers,
    blockedUserIds,
    blockedByUserIds,
    unblockUser,
    blockUser,
  } = useSocial();
  const [contactSubTab, setContactSubTab] = useState<"friends" | "groups" | "requests" | "sent_requests" | "blocked">("friends");

  // Derived state
  const currentUserId = getUserIdFromCookie();
  const currentUserIdNumber =
    typeof currentUserId === "string" ? parseInt(currentUserId, 10) : typeof currentUserId === "number" ? currentUserId : null;

  const sentFriendRequests = friendRequests.filter((request) => String(request.requester_id) === String(currentUserIdNumber));

  // Handlers
  const handleStartChat = async (friendId: string) => {
    const roomId = await startChat(friendId);
    if (roomId) {
      router.push("/social");
    }
  };

  const handleAcceptFriendRequest = async (friendRequestId: number) => {
    const userId = getUserIdFromCookie();
    if (!userId) {
      antMessage.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) throw new Error("User ID không hợp lệ");

      const friendRequest = friendRequests.find((req) => req.id === friendRequestId);
      if (!friendRequest) throw new Error("Không tìm thấy lời mời kết bạn");

      if (String(friendRequest.addressee_id) !== String(userIdNumber)) {
        throw new Error("Bạn không có quyền chấp nhận lời mời này");
      }

      const requesterId = friendRequest.requester_id || friendRequest.requester?.user_id;
      if (!requesterId) throw new Error("Không tìm thấy thông tin người gửi lời mời");

      await acceptFriendRequestSocket({
        user_id: userIdNumber,
        friend_id: friendRequestId,
        requester_id: requesterId,
      });
      antMessage.success("Đã chấp nhận lời mời kết bạn");

      setFriendRequests((prev) => prev.filter((req) => req.id !== friendRequestId));
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      antMessage.error(error.message || "Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleRejectFriendRequest = async (friendRequestId: number) => {
    const userId = getUserIdFromCookie();
    if (!userId) {
      antMessage.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) throw new Error("User ID không hợp lệ");

      const friendRequest = friendRequests.find((req) => req.id === friendRequestId);
      if (!friendRequest) throw new Error("Không tìm thấy lời mời kết bạn");

      await rejectFriendRequestSocket({
        user_id: userIdNumber,
        friend_id: friendRequestId,
      });

      const isRevoke = String(friendRequest.requester_id) === String(userIdNumber);
      antMessage.success(isRevoke ? "Đã thu hồi lời mời kết bạn" : "Đã từ chối lời mời kết bạn");

      setFriendRequests((prev) => prev.filter((req) => req.id !== friendRequestId));
    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      antMessage.error(error.message || "Không thể thực hiện hành động này");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    const userId = getUserIdFromCookie();
    if (!userId) {
      antMessage.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) throw new Error("User ID không hợp lệ");

      const contact = contacts.find((c) => c.id === friendId);
      if (!contact || !contact.friendshipId) {
        throw new Error("Không tìm thấy thông tin bạn bè");
      }

      await removeFriend({
        user_id: userIdNumber,
        friend_id: contact.friendshipId,
      });

      antMessage.success("Đã hủy kết bạn");
      setContacts((prev) => prev.filter((c) => c.id !== friendId));
    } catch (error: any) {
      console.error("Error removing friend:", error);
      antMessage.error(error.message || "Không thể hủy kết bạn");
    }
  };

  return (
    <>
      <SocialSidebar
        bottomTab="contacts"
        contactSubTab={contactSubTab}
        setContactSubTab={setContactSubTab}
        conversations={[]} // Empty for contacts tab
        selectedConversation={null}
        setSelectedConversation={() => { }}
        receivedFriendRequestsCount={receivedFriendRequests.length}
        handleAddFriendClick={() => setIsAddFriendOpen(true)}
        onDeleteConversation={async (id) => { }}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 relative h-full overflow-hidden">
        <ContactsContent
          contactSubTab={contactSubTab}
          receivedFriendRequests={receivedFriendRequests}
          sentFriendRequests={sentFriendRequests}
          contacts={contacts}
          blockedUsers={blockedUsers}
          blockedUserIds={blockedUserIds}
          blockedByUserIds={blockedByUserIds}
          loadingFriendRequests={false} // Managed by context now or assumed loaded
          handleAcceptFriendRequest={handleAcceptFriendRequest}
          handleRejectFriendRequest={handleRejectFriendRequest}
          handleRemoveFriend={handleRemoveFriend}
          handleStartChat={handleStartChat}
          handleUnblockUser={unblockUser}
          handleBlockUser={blockUser}
        />
      </main>


    </>
  );
}
