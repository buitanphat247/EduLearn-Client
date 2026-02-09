"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getChatRooms, ChatRoomType, createChatRoom, deleteConversation as deleteConversationApi } from "@/lib/api/chat-room";
import { Conversation } from "@/app/components/social/types";

// Query keys factory
export const conversationKeys = {
  all: ["conversations"] as const,
  list: (userId: number) => [...conversationKeys.all, "list", userId] as const,
  detail: (roomId: string) => [...conversationKeys.all, "detail", roomId] as const,
};

const CONVERSATIONS_LIMIT = 100;

/**
 * Map API response to Conversation type
 */
function mapRoomToConversation(room: any, userIdNumber: number): Conversation {
  const isOwnLastMessage = String(room.last_message?.sender_id) === String(userIdNumber);
  const lastContent = room.last_message?.content;

  return {
    id: String(room.room_id),
    name: room.name || (room?.members || []).find((m: any) => String(m.user_id) !== String(userIdNumber))?.user?.fullname || "Cuộc trò chuyện",
    avatar:
      room.room_type === ChatRoomType.DIRECT
        ? (room?.members || []).find((m: any) => String(m.user_id) !== String(userIdNumber))?.user?.avatar
        : undefined,
    lastMessage: lastContent ? (isOwnLastMessage ? `Bạn: ${lastContent}` : lastContent) : "Bắt đầu cuộc trò chuyện",
    time: room.last_message?.created_at ? new Date(room.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    unread: room.unread_count || 0,
    isGroup: room.room_type === ChatRoomType.GROUP,
    memberIds: (room.members || []).map((m: any) => m.user_id),
    isEmpty: !room.last_message,
  };
}

/**
 * Hook to fetch conversations list
 */
export function useConversationsQuery() {
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  return useQuery({
    queryKey: conversationKeys.list(userIdNumber || 0),
    queryFn: async () => {
      if (!userIdNumber || isNaN(userIdNumber)) {
        return { conversations: [] as Conversation[], groupCount: 0, lastReadMessageIds: {} as Record<string, string | number> };
      }

      const result = await getChatRooms({ userId: userIdNumber, limit: CONVERSATIONS_LIMIT });

      const lastReadMessageIds: Record<string, string | number> = {};

      const conversations: Conversation[] = result.data.map((room: any) => {
        // Extract last read info for direct messages
        if (room.room_type === ChatRoomType.DIRECT) {
          const partnerMember = (room.members || []).find((m: any) => String(m.user_id) !== String(userIdNumber));
          if (partnerMember?.last_read_message_id) {
            lastReadMessageIds[String(room.room_id)] = partnerMember.last_read_message_id;
          }
        }

        return mapRoomToConversation(room, userIdNumber);
      });

      const groupCount = result.data.filter((room: any) => room.room_type === ChatRoomType.GROUP).length;

      return { conversations, groupCount, lastReadMessageIds };
    },
    enabled: !!userIdNumber && !isNaN(userIdNumber),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to create a new chat room
 */
export function useCreateChatRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId }: { friendId: number }) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) throw new Error("User not authenticated");

      const room = await createChatRoom({
        userId: userIdNumber,
        room_type: ChatRoomType.DIRECT,
        members: [friendId],
      });

      const roomId = room?.room_id || (room as any)?.id || (room as any)?.data?.room_id || (room as any)?.data?.id;

      if (!roomId) throw new Error("Chat creation failed");

      return { roomId, room };
    },
    onSuccess: () => {
      // Invalidate conversations list to refetch
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (userIdNumber) {
        queryClient.invalidateQueries({ queryKey: conversationKeys.list(userIdNumber) });
      }
    },
  });
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) throw new Error("User not authenticated");

      await deleteConversationApi(userIdNumber, roomId);
      return { roomId };
    },
    onMutate: async ({ roomId }) => {
      // Optimistic update: remove conversation immediately
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (userIdNumber) {
        await queryClient.cancelQueries({ queryKey: conversationKeys.list(userIdNumber) });

        const previousData = queryClient.getQueryData(conversationKeys.list(userIdNumber));

        queryClient.setQueryData(conversationKeys.list(userIdNumber), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.filter((c: Conversation) => c.id !== roomId),
          };
        });

        return { previousData };
      }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (context?.previousData && userIdNumber) {
        queryClient.setQueryData(conversationKeys.list(userIdNumber), context.previousData);
      }
    },
  });
}
