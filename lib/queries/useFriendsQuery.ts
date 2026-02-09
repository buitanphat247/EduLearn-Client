"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getFriends, getFriendRequests, FriendRequestResponse } from "@/lib/api/friends";
import { getBlockedUsers, blockUser as apiBlockUser, unblockUser as apiUnblockUser, UserBlock } from "@/lib/api/chat-block";
import { Contact } from "@/app/components/social/types";

// Query keys factory
export const friendKeys = {
  all: ["friends"] as const,
  list: (userId: number) => [...friendKeys.all, "list", userId] as const,
  requests: (userId: number) => [...friendKeys.all, "requests", userId] as const,
  blocked: (userId: number) => [...friendKeys.all, "blocked", userId] as const,
};

const FRIEND_REQUESTS_LIMIT = 50;

/**
 * Hook to fetch friends list
 */
export function useFriendsQuery() {
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  return useQuery({
    queryKey: friendKeys.list(userIdNumber || 0),
    queryFn: async () => {
      if (!userIdNumber || isNaN(userIdNumber)) {
        return [] as Contact[];
      }

      const response = await getFriends({ userId: userIdNumber });

      const contacts: Contact[] = response.data.map((friend: any) => {
        const userIdStr = String(userIdNumber);
        const isRequester = String(friend.requester_id) === userIdStr;
        const friendUser = isRequester ? friend.addressee : friend.requester;

        return {
          id: String(friendUser?.user_id),
          name: friendUser?.fullname || friendUser?.username || "Unknown",
          avatar: friendUser?.avatar || undefined,
          status: (friendUser?.status as "online" | "offline" | "away") || "offline",
          isFriend: true,
          friendshipId: friend.id,
        };
      });

      return contacts;
    },
    enabled: !!userIdNumber && !isNaN(userIdNumber),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch friend requests
 */
export function useFriendRequestsQuery() {
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  return useQuery({
    queryKey: friendKeys.requests(userIdNumber || 0),
    queryFn: async () => {
      if (!userIdNumber || isNaN(userIdNumber)) {
        return [] as FriendRequestResponse[];
      }

      const result = await getFriendRequests({
        userId: userIdNumber,
        limit: FRIEND_REQUESTS_LIMIT,
      });

      return result.requests || [];
    },
    enabled: !!userIdNumber && !isNaN(userIdNumber),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get received friend requests (filtered from all requests)
 */
export function useReceivedFriendRequests() {
  const { data: requests = [] } = useFriendRequestsQuery();
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  if (!userIdNumber) return [];

  return requests.filter((request) => String(request.addressee_id) === String(userIdNumber));
}

interface BlockedUsersData {
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  blockedUsers: UserBlock[];
}

/**
 * Hook to fetch blocked users
 */
export function useBlockedUsersQuery() {
  const userId = getUserIdFromCookie();
  const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

  return useQuery({
    queryKey: friendKeys.blocked(userIdNumber || 0),
    queryFn: async (): Promise<BlockedUsersData> => {
      if (!userIdNumber || isNaN(userIdNumber)) {
        return { blockedUserIds: new Set(), blockedByUserIds: new Set(), blockedUsers: [] };
      }

      const blocks = await getBlockedUsers(userIdNumber);

      const blockedUserIds = new Set<string>();
      const blockedByUserIds = new Set<string>();

      blocks.forEach((b) => {
        if (String(b.blocker_id) === String(userIdNumber)) {
          blockedUserIds.add(String(b.blocked_id));
        } else if (String(b.blocked_id) === String(userIdNumber)) {
          blockedByUserIds.add(String(b.blocker_id));
        }
      });

      const blockedUsers = blocks.filter((b) => String(b.blocker_id) === String(userIdNumber));

      return { blockedUserIds, blockedByUserIds, blockedUsers };
    },
    enabled: !!userIdNumber && !isNaN(userIdNumber),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to block a user
 */
export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId }: { friendId: string }) => {
      const userId = getUserIdFromCookie();
      if (!userId) throw new Error("User not authenticated");

      await apiBlockUser(Number(userId), Number(friendId));
      return { friendId };
    },
    onMutate: async ({ friendId }) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (userIdNumber) {
        await queryClient.cancelQueries({ queryKey: friendKeys.blocked(userIdNumber) });

        const previousData = queryClient.getQueryData<BlockedUsersData>(friendKeys.blocked(userIdNumber));

        // Optimistic update
        queryClient.setQueryData<BlockedUsersData>(friendKeys.blocked(userIdNumber), (old) => {
          if (!old) return old;
          const newBlockedIds = new Set(old.blockedUserIds);
          newBlockedIds.add(String(friendId));
          return { ...old, blockedUserIds: newBlockedIds };
        });

        return { previousData };
      }
    },
    onSuccess: () => {
      antMessage.success("Đã chặn người dùng");
      // Refetch to get full blocked user details
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (userIdNumber) {
        queryClient.invalidateQueries({ queryKey: friendKeys.blocked(userIdNumber) });
      }
    },
    onError: (_err, _variables, context) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (context?.previousData && userIdNumber) {
        queryClient.setQueryData(friendKeys.blocked(userIdNumber), context.previousData);
      }
      antMessage.error("Không thể chặn người dùng");
    },
  });
}

/**
 * Hook to unblock a user
 */
export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId }: { friendId: string }) => {
      const userId = getUserIdFromCookie();
      if (!userId) throw new Error("User not authenticated");

      await apiUnblockUser(Number(userId), Number(friendId));
      return { friendId };
    },
    onMutate: async ({ friendId }) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (userIdNumber) {
        await queryClient.cancelQueries({ queryKey: friendKeys.blocked(userIdNumber) });

        const previousData = queryClient.getQueryData<BlockedUsersData>(friendKeys.blocked(userIdNumber));

        // Optimistic update
        queryClient.setQueryData<BlockedUsersData>(friendKeys.blocked(userIdNumber), (old) => {
          if (!old) return old;
          const newBlockedIds = new Set(old.blockedUserIds);
          newBlockedIds.delete(String(friendId));
          const newBlockedUsers = old.blockedUsers.filter((b) => String(b.blocked_id) !== String(friendId));
          return { ...old, blockedUserIds: newBlockedIds, blockedUsers: newBlockedUsers };
        });

        return { previousData };
      }
    },
    onSuccess: () => {
      antMessage.success("Đã bỏ chặn người dùng");
    },
    onError: (_err, _variables, context) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (context?.previousData && userIdNumber) {
        queryClient.setQueryData(friendKeys.blocked(userIdNumber), context.previousData);
      }
      antMessage.error("Không thể bỏ chặn người dùng");
    },
  });
}
