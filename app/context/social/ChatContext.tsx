"use client";

import React, { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { createChatRoom, ChatRoomType } from "@/lib/api/chat-room";
import { Conversation, Message } from "@/app/components/social/types";
import { joinChatRoom } from "@/lib/socket";

// Stores
import { useChatStore } from "@/lib/stores";

// React Query hooks
import {
    useConversationsQuery,
    useMessagesQuery,
    useSendMessageMutation,
    useMarkAsReadMutation,
    useDeleteConversationMutation,
    conversationKeys,
    messageKeys,
} from "@/lib/queries";

// Socket integration
import { useChatSocketIntegration } from "@/lib/hooks/useChatSocketIntegration";

interface ChatContextType {
    // Data from React Query
    conversations: Conversation[];
    messages: Message[];
    groupCount: number;
    lastReadMessageIds: Record<string, string | number>;

    // UI State from Zustand
    activeConversationId: string | null;
    loadingMessages: boolean;
    loadingConversations: boolean;

    // Actions
    fetchConversations: () => Promise<void>;
    loadMessages: (roomId: string) => Promise<void>;
    sendMessage: (content: string, file?: File) => Promise<void>;
    startChat: (friendId: string) => Promise<string | null>;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    markConversationAsRead: (roomId: string) => Promise<void>;
    deleteConversation: (roomId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    // Zustand store for UI state
    const {
        activeConversationId,
        setActiveConversationId: storeSetActiveConversationId,
        isLoadingMessages,
        isLoadingConversations,
        setLoadingMessages,
        setLoadingConversations,
    } = useChatStore();

    // React Query for server state
    const conversationsQuery = useConversationsQuery();
    const messagesQuery = useMessagesQuery(activeConversationId);

    // Mutations
    const sendMessageMutation = useSendMessageMutation();
    const markAsReadMutation = useMarkAsReadMutation();
    const deleteConversationMutation = useDeleteConversationMutation();

    // Socket integration
    useChatSocketIntegration();

    // Extract data from queries
    const conversations = conversationsQuery.data?.conversations ?? [];
    const groupCount = conversationsQuery.data?.groupCount ?? 0;
    const lastReadMessageIds = conversationsQuery.data?.lastReadMessageIds ?? {};
    const messages = messagesQuery.data ?? [];

    // Sync loading states
    useEffect(() => {
        setLoadingConversations(conversationsQuery.isLoading);
    }, [conversationsQuery.isLoading, setLoadingConversations]);

    useEffect(() => {
        setLoadingMessages(messagesQuery.isLoading);
    }, [messagesQuery.isLoading, setLoadingMessages]);

    // Actions
    const fetchConversations = useCallback(async () => {
        await conversationsQuery.refetch();
    }, [conversationsQuery]);

    const loadMessages = useCallback(async (roomId: string) => {
        // Set active conversation, which triggers useMessagesQuery
        storeSetActiveConversationId(roomId);
    }, [storeSetActiveConversationId]);

    const sendMessage = useCallback(async (content: string, file?: File) => {
        if (!activeConversationId) return;

        let roomId = activeConversationId;

        // Handle temp conversation (new chat)
        if (roomId.startsWith("temp_")) {
            const friendIdStr = roomId.split("_")[1];
            const friendId = parseInt(friendIdStr, 10);

            const userId = getUserIdFromCookie();
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

            if (!userIdNumber) return;

            try {
                const room = await createChatRoom({
                    userId: userIdNumber,
                    room_type: ChatRoomType.DIRECT,
                    members: [friendId],
                });

                const createdRoomId = room?.room_id || (room as any)?.id || (room as any)?.data?.room_id || (room as any)?.data?.id;

                if (!createdRoomId) throw new Error("Chat creation failed");

                roomId = String(createdRoomId);
                joinChatRoom(Number(roomId));
                storeSetActiveConversationId(roomId);
            } catch (error) {
                antMessage.error("Không thể tạo cuộc trò chuyện");
                return;
            }
        }

        try {
            await sendMessageMutation.mutateAsync({ roomId, content });
        } catch (error: any) {
            antMessage.error(error.message || "Gửi tin nhắn thất bại");
        }
    }, [activeConversationId, sendMessageMutation, storeSetActiveConversationId]);

    const startChat = useCallback(async (friendId: string): Promise<string | null> => {
        const friendIdStr = String(friendId);

        // Check existing conversation
        const existingRoom = conversations.find(
            (c) => !c.isGroup && c.memberIds?.length === 2 && c.memberIds.some((id) => String(id) === friendIdStr)
        );

        if (existingRoom) {
            storeSetActiveConversationId(String(existingRoom.id));
            return existingRoom.id;
        }

        // Create temp conversation
        const tempId = `temp_${friendId}`;
        storeSetActiveConversationId(tempId);
        return tempId;
    }, [conversations, storeSetActiveConversationId]);

    const setActiveConversationId = useCallback((idOrUpdater: React.SetStateAction<string | null>) => {
        if (typeof idOrUpdater === "function") {
            const currentId = useChatStore.getState().activeConversationId;
            const newId = idOrUpdater(currentId);
            storeSetActiveConversationId(newId);
        } else {
            storeSetActiveConversationId(idOrUpdater);
        }
    }, [storeSetActiveConversationId]);

    const markConversationAsRead = useCallback(async (roomId: string) => {
        await markAsReadMutation.mutateAsync({ roomId });
    }, [markAsReadMutation]);

    const deleteConversation = useCallback(async (roomId: string) => {
        try {
            await deleteConversationMutation.mutateAsync({ roomId });

            if (activeConversationId === roomId) {
                storeSetActiveConversationId(null);
            }
        } catch (error) {
            // Query will be invalidated on error, refetching fresh data
            console.error("Delete conversation failed", error);
        }
    }, [deleteConversationMutation, activeConversationId, storeSetActiveConversationId]);

    const value = useMemo(() => ({
        // Data
        conversations,
        messages,
        groupCount,
        lastReadMessageIds,

        // UI State
        activeConversationId,
        loadingMessages: isLoadingMessages || messagesQuery.isLoading,
        loadingConversations: isLoadingConversations || conversationsQuery.isLoading,

        // Actions
        fetchConversations,
        loadMessages,
        sendMessage,
        startChat,
        setActiveConversationId,
        markConversationAsRead,
        deleteConversation,
    }), [
        conversations,
        messages,
        groupCount,
        lastReadMessageIds,
        activeConversationId,
        isLoadingMessages,
        isLoadingConversations,
        messagesQuery.isLoading,
        conversationsQuery.isLoading,
        fetchConversations,
        loadMessages,
        sendMessage,
        startChat,
        setActiveConversationId,
        markConversationAsRead,
        deleteConversation,
    ]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
