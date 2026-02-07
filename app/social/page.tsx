"use client";

import { useState } from "react";
import SocialSidebar from "@/app/components/social/SocialSidebar";
import ChatArea from "@/app/components/social/ChatArea";
import { Conversation, Message } from "@/app/components/social/types";
import { useSocial } from "./SocialContext";

export default function SocialPage() {
  const {
    receivedFriendRequests,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    fetchFriendRequests,
    sendMessage,
    markConversationAsRead,
    loadingMessages,
    loadingConversations,
    lastReadMessageIds,

    deleteConversation,
    isSettingsOpen,
    isProfileOpen,
    isAddFriendOpen,
    setIsAddFriendOpen,
    contacts,
    currentUser,
  } = useSocial();

  const [message, setMessage] = useState("");

  let activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Fallback: Create virtual conversation for UI if using Temp ID (Lazy Creation)
  if (!activeConversation && activeConversationId?.startsWith("temp_")) {
    const friendId = activeConversationId.split("_")[1];
    const friend = contacts.find((c) => String(c.id) === friendId);
    if (friend) {
      activeConversation = {
        id: activeConversationId,
        name: friend.name,
        avatar: friend.avatar,
        lastMessage: "Bắt đầu cuộc trò chuyện",
        time: "",
        unread: 0,
        isGroup: false,
        memberIds: [Number(currentUser?.id), Number(friend.id)],
        isEmpty: true,
      };
    }
  }

  // Filter hidden conversations (empty ones), unless active (Sender sees it, Receiver doesn't until msg sent)
  const displayedConversations = conversations.filter((c) => !c.isEmpty || String(c.id) === String(activeConversationId));
  // const displayedConversations = conversations;

  const partnerLastReadId = activeConversationId ? lastReadMessageIds[activeConversationId] : undefined;

  // Handle interaction (scroll/focus) to mark as read
  const handleInteraction = () => {
    // If settings or profile modal is open, DO NOT mark as read
    if (isSettingsOpen || isProfileOpen || isAddFriendOpen) return;

    if (activeConversationId && activeConversation && (activeConversation.unread || 0) > 0) {
      markConversationAsRead(activeConversationId);
    }
  };

  // ✅ Fix: Add isSending state để prevent double send
  const [isSending, setIsSending] = useState(false);

  // Local handler to wrap sendMessage
  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || isSending) return; // ✅ Prevent double send

    setIsSending(true);
    const messageToSend = content; // ✅ Save before clearing

    // Optimistic Clear to prevent duplicate sends/Enter spam
    setMessage("");

    // Reset height manually since we cleared value
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "auto"; // let it maintain default size (padding + 1 row)

    try {
      await sendMessage(messageToSend);
    } catch (e) {
      // ✅ Restore message on error
      setMessage(messageToSend);
      console.error("Failed to send", e);
    } finally {
      setIsSending(false);
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
        contactSubTab="friends"
        setContactSubTab={() => { }}
        conversations={displayedConversations}
        selectedConversation={activeConversationId}
        setSelectedConversation={setActiveConversationId}
        receivedFriendRequestsCount={receivedFriendRequests.length}
        handleAddFriendClick={() => setIsAddFriendOpen(true)}
        isLoading={loadingConversations}
        onDeleteConversation={deleteConversation}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#0f172a] relative h-full overflow-hidden transition-colors duration-300">
        <ChatArea
          activeConversation={activeConversation}
          messages={messages}
          message={message}
          handleTextareaChange={handleTextareaChange}
          handleKeyPress={handleKeyPress}
          handleSendMessage={handleSendMessage}
          onInteraction={handleInteraction}
          partnerLastReadMessageId={partnerLastReadId}
          partnerAvatar={activeConversation?.avatar}
        />
      </main>
    </>
  );
}
