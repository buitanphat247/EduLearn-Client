"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { chatSocketClient, joinChatRoom, leaveChatRoom, onMessageReceived, onMessageRead } from "@/lib/socket";
import { useChatStore } from "@/lib/stores";
import { conversationKeys } from "@/lib/queries/useConversationsQuery";
import { messageKeys } from "@/lib/queries/useMessagesQuery";
import { Message, Conversation } from "@/app/components/social/types";

/**
 * Hook to integrate socket events with React Query cache
 * Handles real-time message reception and read receipts
 */
export function useChatSocketIntegration() {
  const queryClient = useQueryClient();
  const { activeConversationId, addProcessedMessageId, processedMessageIds, setConnected } = useChatStore();

  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Initialize socket connection
  useEffect(() => {
    chatSocketClient.connect();

    const unsubscribeConnection = chatSocketClient.onConnectionChange((isConnected) => {
      setConnected(isConnected);

      if (isConnected) {
        // Rejoin room on reconnect
        if (activeConversationIdRef.current && !activeConversationIdRef.current.startsWith("temp_")) {
          const roomIdNum = parseInt(activeConversationIdRef.current, 10);
          if (!isNaN(roomIdNum)) joinChatRoom(roomIdNum);
        }

        // Invalidate queries to sync missed updates
        const userId = getUserIdFromCookie();
        const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
        if (userIdNumber) {
          queryClient.invalidateQueries({ queryKey: conversationKeys.list(userIdNumber) });
        }
      }
    });

    // Handle incoming messages
    const unsubscribeMessage = onMessageReceived((payload) => {
      const msg = payload.data || payload;
      const msgId = String(msg.message_id || "");

      // Deduplicate
      if (msgId && processedMessageIds.has(msgId)) return;
      if (msgId) addProcessedMessageId(msgId);

      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      // Update conversations list
      queryClient.setQueryData(conversationKeys.list(userIdNumber || 0), (old: any) => {
        if (!old) return old;

        const conversations = [...old.conversations];
        const existingIndex = conversations.findIndex((c: Conversation) => c.id === String(msg.room_id));

        if (existingIndex === -1) {
          // New conversation, invalidate to fetch it
          queryClient.invalidateQueries({ queryKey: conversationKeys.list(userIdNumber || 0) });
          return old;
        }

        const isOwn = String(msg.sender_id) === String(userIdNumber);
        const updated = { ...conversations[existingIndex] };
        updated.lastMessage = isOwn ? `Bạn: ${msg.content}` : msg.content;
        updated.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (!isOwn) updated.unread = (updated.unread || 0) + 1;

        const others = conversations.filter((_, i) => i !== existingIndex);
        return { ...old, conversations: [updated, ...others] };
      });

      // Update messages list if in the same conversation
      const currentActiveId = activeConversationIdRef.current;
      if (String(msg.room_id) === String(currentActiveId)) {
        const newMessage: Message = {
          id: String(msg.message_id || Date.now()),
          sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
          senderAvatar: msg.sender?.avatar,
          content: (msg.content || "").trim(),
          time: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: String(msg.sender_id) === String(userIdNumber),
          fileAttachment: msg.fileAttachment,
        };

        queryClient.setQueryData(messageKeys.list(currentActiveId || ""), (old: Message[] | undefined) => {
          if (!old) return [newMessage];

          // Check for existing message
          if (old.some((m) => m.id === newMessage.id)) return old;

          // Handle optimistic message replacement
          if (newMessage.isOwn) {
            const tempMatchIndex = old.findIndex((m) => m.id.startsWith("temp_msg_") && m.content.trim() === newMessage.content.trim() && m.isOwn);
            if (tempMatchIndex !== -1) {
              const newArr = [...old];
              newArr[tempMatchIndex] = newMessage;
              return newArr;
            }
          }

          return [...old, newMessage];
        });
      }
    });

    // Handle read receipts
    const unsubscribeRead = onMessageRead((payload) => {
      const data = (payload as any).data || payload;
      const { room_id, user_id, message_id } = data;
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (String(user_id) !== String(userIdNumber)) {
        // Update last read message IDs
        queryClient.setQueryData(conversationKeys.list(userIdNumber || 0), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            lastReadMessageIds: {
              ...old.lastReadMessageIds,
              [String(room_id)]: message_id,
            },
          };
        });
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeRead();
    };
  }, [queryClient, addProcessedMessageId, processedMessageIds, setConnected]);

  // Handle room joining/leaving
  useEffect(() => {
    const roomId = activeConversationId;

    if (roomId && !roomId.startsWith("temp_")) {
      const roomIdNum = parseInt(roomId, 10);
      if (!isNaN(roomIdNum)) {
        joinChatRoom(roomIdNum);
      }
    }

    return () => {
      if (roomId && !roomId.startsWith("temp_")) {
        const roomIdNum = parseInt(roomId, 10);
        if (!isNaN(roomIdNum)) leaveChatRoom(roomIdNum);
      }
    };
  }, [activeConversationId]);
}
