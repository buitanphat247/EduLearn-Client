"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getMessages, sendMessage as apiSendMessage, markAsRead } from "@/lib/api/chat-message";
import { Message } from "@/app/components/social/types";
import { conversationKeys } from "./useConversationsQuery";

// Query keys factory
export const messageKeys = {
  all: ["messages"] as const,
  list: (roomId: string) => [...messageKeys.all, "list", roomId] as const,
};

const MESSAGES_LIMIT = 50;

/**
 * Map API message to Message type
 */
function mapApiMessage(msg: any, userIdNumber: number): Message {
  return {
    id: String(msg.message_id),
    sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
    senderAvatar: msg.sender?.avatar,
    content: (msg.content || "").trim(),
    time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isOwn: String(msg.sender_id) === String(userIdNumber),
    fileAttachment: msg.fileAttachment,
  };
}

/**
 * Hook to fetch messages for a room
 */
export function useMessagesQuery(roomId: string | null) {
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  return useQuery({
    queryKey: messageKeys.list(roomId || ""),
    queryFn: async () => {
      if (!roomId || !userIdNumber || isNaN(userIdNumber)) {
        return [] as Message[];
      }

      const roomIdNumber = parseInt(roomId, 10);
      if (isNaN(roomIdNumber)) return [] as Message[];

      // Mark as read when fetching messages
      await markAsRead(userIdNumber, roomIdNumber);

      const result = await getMessages({
        userId: userIdNumber,
        roomId: roomIdNumber,
        limit: MESSAGES_LIMIT,
      });

      return result.data.map((msg: any) => mapApiMessage(msg, userIdNumber));
    },
    enabled: !!roomId && !roomId.startsWith("temp_") && !!userIdNumber,
    staleTime: 0, // Always refetch for real-time feel
  });
}

interface SendMessageParams {
  roomId: string;
  content: string;
  file?: File;
}

/**
 * Hook to send a message with optimistic updates
 */
export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: SendMessageParams) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) throw new Error("User not authenticated");

      const roomIdNum = parseInt(roomId, 10);
      if (isNaN(roomIdNum)) throw new Error("Invalid Room ID");

      const response = await apiSendMessage({
        sender_id: userIdNumber,
        room_id: roomIdNum,
        content: content.trim(),
      });

      return {
        messageId: response.message_id,
        createdAt: response.created_at,
        roomId,
      };
    },
    onMutate: async ({ roomId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messageKeys.list(roomId) });

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData(messageKeys.list(roomId));

      // Create optimistic message
      const tempId = `temp_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMessage: Message = {
        id: tempId,
        sender: "You",
        senderAvatar: undefined,
        content: content.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
        fileAttachment: undefined,
      };

      // Add optimistic message
      queryClient.setQueryData(messageKeys.list(roomId), (old: Message[] | undefined) => {
        return [...(old || []), optimisticMessage];
      });

      return { previousMessages, tempId };
    },
    onSuccess: (data, variables, context) => {
      // Replace temp message with real one
      queryClient.setQueryData(messageKeys.list(variables.roomId), (old: Message[] | undefined) => {
        if (!old) return old;
        return old.map((msg) =>
          msg.id === context?.tempId
            ? {
                ...msg,
                id: String(data.messageId),
                time: new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }
            : msg,
        );
      });

      // Update conversation list (last message preview)
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (userIdNumber) {
        queryClient.setQueryData(conversationKeys.list(userIdNumber), (old: any) => {
          if (!old) return old;
          const conversations = [...old.conversations];
          const idx = conversations.findIndex((c: any) => String(c.id) === String(variables.roomId));
          if (idx !== -1) {
            const updated = { ...conversations[idx] };
            updated.lastMessage = `Bạn: ${variables.content.trim()}`;
            updated.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            updated.unread = 0;
            updated.isEmpty = false;
            conversations.splice(idx, 1);
            conversations.unshift(updated);
          }
          return { ...old, conversations };
        });
      }
    },
    onError: (_err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(messageKeys.list(variables.roomId), context.previousMessages);
      }
    },
  });
}

/**
 * Hook to mark conversation as read
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) throw new Error("User not authenticated");

      const roomIdNumber = parseInt(roomId, 10);
      if (isNaN(roomIdNumber)) throw new Error("Invalid Room ID");

      await markAsRead(userIdNumber, roomIdNumber);
      return { roomId };
    },
    onMutate: async ({ roomId }) => {
      // Optimistic update: set unread to 0
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (userIdNumber) {
        queryClient.setQueryData(conversationKeys.list(userIdNumber), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.map((c: any) => (String(c.id) === String(roomId) ? { ...c, unread: 0 } : c)),
          };
        });
      }
    },
  });
}
