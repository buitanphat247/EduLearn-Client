"use client";

import React, { createContext, useContext } from "react";
import { SocialProfileProvider, useSocialProfile } from "./SocialProfileContext";
import { FriendProvider, useFriend } from "./FriendContext";
import { ChatProvider, useChat } from "./ChatContext";
import { Contact, Conversation, Message, User } from "@/app/components/social/types";
import { FriendRequestResponse } from "@/lib/api/friends";
import { UserBlock } from "@/lib/api/chat-block";

// Re-export types if needed
export type { SocialContextType } from "./types"; // We don't have this file, but we will define the interface here inline to match original

interface SocialContextType {
  currentUser: User | null;
  contacts: Contact[];
  friendRequests: FriendRequestResponse[];
  receivedFriendRequests: FriendRequestResponse[];
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  loadingMessages: boolean;
  loadingConversations: boolean;
  groupCount: number;
  fetchContacts: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  sendMessage: (content: string, file?: File) => Promise<void>;
  startChat: (friendId: string) => Promise<string | null>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequestResponse[]>>;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  markConversationAsRead: (roomId: string) => Promise<void>;
  deleteConversation: (roomId: string) => Promise<void>;
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  blockedUsers: UserBlock[];
  blockUser: (friendId: string) => Promise<void>;
  unblockUser: (friendId: string) => Promise<void>;
  lastReadMessageIds: Record<string, string | number>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddFriendOpen: boolean;
  setIsAddFriendOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Legacy Provider Wrapper
export function SocialProvider({ children }: { children: React.ReactNode }) {
  return (
    <SocialProfileProvider>
      <FriendProvider>
        <ChatProvider>
          {/* We strictly don't need to wrap with SocialContext.Provider if we refactor consumers,
              but for backward compatibility with 'useSocial', we can't easily merge 3 contexts into one Context.Provider without re-rendering everything.
              However, we can create a specific generic consumer or just make useSocial hook do the aggregation.
           */}
          {children}
        </ChatProvider>
      </FriendProvider>
    </SocialProfileProvider>
  );
}

// Legacy Hook that Aggregates
export function useSocial(): SocialContextType {
  // We can't use useContext(SocialContext) because we didn't provide it above (intentionally to split updates).
  // Instead, this hook pulls from the 3 split contexts.

  const profile = useSocialProfile();
  const friend = useFriend();
  const chat = useChat();

  return {
    // Profile
    currentUser: profile.currentUser,
    isSettingsOpen: profile.isSettingsOpen,
    setIsSettingsOpen: profile.setIsSettingsOpen,
    isProfileOpen: profile.isProfileOpen,
    setIsProfileOpen: profile.setIsProfileOpen,
    isAddFriendOpen: profile.isAddFriendOpen,
    setIsAddFriendOpen: profile.setIsAddFriendOpen,

    // Friend
    contacts: friend.contacts,
    friendRequests: friend.friendRequests,
    receivedFriendRequests: friend.receivedFriendRequests,
    blockedUserIds: friend.blockedUserIds,
    blockedByUserIds: friend.blockedByUserIds,
    blockedUsers: friend.blockedUsers,
    fetchContacts: friend.fetchContacts,
    fetchFriendRequests: friend.fetchFriendRequests,
    setContacts: friend.setContacts,
    setFriendRequests: friend.setFriendRequests,
    blockUser: friend.blockUser,
    unblockUser: friend.unblockUser,

    // Chat
    conversations: chat.conversations,
    activeConversationId: chat.activeConversationId,
    messages: chat.messages,
    loadingMessages: chat.loadingMessages,
    loadingConversations: chat.loadingConversations,
    groupCount: chat.groupCount,
    fetchConversations: chat.fetchConversations,
    loadMessages: chat.loadMessages,
    sendMessage: chat.sendMessage,
    startChat: chat.startChat,
    setActiveConversationId: chat.setActiveConversationId,
    markConversationAsRead: chat.markConversationAsRead,
    deleteConversation: chat.deleteConversation,
    lastReadMessageIds: chat.lastReadMessageIds,
  };
}
