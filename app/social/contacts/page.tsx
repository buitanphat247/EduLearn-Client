"use client";

import { useState } from "react";
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
  const { contacts, receivedFriendRequests, friendRequests, setFriendRequests, setContacts } = useSocial();
  const [contactSubTab, setContactSubTab] = useState<"friends" | "groups" | "requests" | "sent_requests">("friends");
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [inputType, setInputType] = useState<"phone" | "email">("phone");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [countryCode, setCountryCode] = useState("+84");

  // Derived state for sent requests
  const currentUserId = getUserIdFromCookie();
  const currentUserIdNumber =
    typeof currentUserId === "string" ? parseInt(currentUserId, 10) : typeof currentUserId === "number" ? currentUserId : null;

  const sentFriendRequests = friendRequests.filter((request) => String(request.requester_id) === String(currentUserIdNumber));

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

      // Update state via context setters
      setFriendRequests((prev) => prev.filter((req) => req.id !== friendRequestId));
      // Contacts will be updated by socket listener in Context
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

  const handleSendFriendRequest = async () => {
    const userId = getUserIdFromCookie();
    if (!userId) {
      antMessage.error("Vui lòng đăng nhập để gửi lời mời kết bạn");
      return;
    }

    if (inputType === "phone" && !phoneNumber.trim()) {
      antMessage.warning("Vui lòng nhập số điện thoại");
      return;
    }
    if (inputType === "email" && !email.trim()) {
      antMessage.warning("Vui lòng nhập email");
      return;
    }

    setSendingRequest(true);
    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) throw new Error("User ID không hợp lệ");

      const requestData = {
        requester_id: userIdNumber,
        ...(inputType === "phone" ? { phone: phoneNumber.trim() } : { email: email.trim() }),
      };

      await sendFriendRequest(requestData);
      antMessage.success("Đã gửi lời mời kết bạn thành công!");

      setPhoneNumber("");
      setEmail("");
      setIsAddFriendModalOpen(false);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      antMessage.error(error.message || "Không thể gửi lời mời kết bạn. Vui lòng thử lại.");
    } finally {
      setSendingRequest(false);
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
        setSelectedConversation={() => {}}
        receivedFriendRequestsCount={receivedFriendRequests.length}
        handleAddFriendClick={() => setIsAddFriendModalOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 relative h-full overflow-hidden">
        <ContactsContent
          contactSubTab={contactSubTab}
          receivedFriendRequests={receivedFriendRequests}
          sentFriendRequests={sentFriendRequests}
          contacts={contacts}
          loadingFriendRequests={false} // Managed by context now or assumed loaded
          handleAcceptFriendRequest={handleAcceptFriendRequest}
          handleRejectFriendRequest={handleRejectFriendRequest}
          handleRemoveFriend={handleRemoveFriend}
        />
      </main>

      {/* Add Friend Modal */}
      <Modal
        open={isAddFriendModalOpen}
        onCancel={() => setIsAddFriendModalOpen(false)}
        footer={null}
        closeIcon={null}
        width={360}
        centered
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(2px)",
          },
        }}
        className="add-friend-modal"
      >
        <div className="flex flex-col text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white leading-none mb-0 tracking-tight text-base">Thêm Bạn</h2>
            <button
              onClick={() => setIsAddFriendModalOpen(false)}
              className="flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all border-none bg-transparent cursor-pointer w-7 h-7"
            >
              <CloseOutlined className="text-xs" />
            </button>
          </div>

          {/* Input Type Toggle */}
          <div className="flex gap-1.5 mb-3 bg-slate-800 rounded-lg">
            <button
              onClick={() => setInputType("phone")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${
                inputType === "phone" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700 bg-transparent"
              }`}
            >
              Số điện thoại
            </button>
            <button
              onClick={() => setInputType("email")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${
                inputType === "email" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700 bg-transparent"
              }`}
            >
              Email
            </button>
          </div>

          {/* Input Field */}
          <div className="mb-4">
            {inputType === "phone" ? (
              <div className="flex bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors">
                <div className="flex items-center px-3 border-r border-slate-700">
                  <span className="text-slate-400 text-sm">VN</span>
                  <span className="text-slate-300 ml-1 text-sm">{countryCode}</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="flex-1 bg-transparent border-none py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            ) : (
              <div className="flex bg-slate-800 rounded-xl border border-slate-700 focus-within:border-blue-500 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  className="flex-1 bg-transparent border-none py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleSendFriendRequest}
            disabled={sendingRequest || (inputType === "phone" ? !phoneNumber : !email)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 border-none cursor-pointer text-sm"
          >
            {sendingRequest ? "Đang gửi..." : "Gửi lời mời"}
          </button>
        </div>
      </Modal>
    </>
  );
}
