"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import {
  friendSocketClient,
  onFriendRequestReceived,
  onFriendRequestAccepted,
  onFriendRequestRejected,
  onFriendError,
  onFriendRemoved,
  onUserBlocked,
  onUserUnblocked,
} from "@/lib/socket";
import { useFriendStore } from "@/lib/stores";
import { friendKeys } from "@/lib/queries/useFriendsQuery";
import { FriendRequestResponse } from "@/lib/api/friends";

/**
 * Hook to integrate friend socket events with React Query cache
 * Handles friend requests, accepts, blocks in real-time
 */
export function useFriendSocketIntegration() {
  const queryClient = useQueryClient();
  const { setConnected } = useFriendStore();

  useEffect(() => {
    friendSocketClient.connect();

    const unsubscribeReceived = onFriendRequestReceived((payload) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      const newRequest: FriendRequestResponse = {
        id: payload.friend.id,
        requester_id: payload.friend.requester_id,
        addressee_id: payload.friend.addressee_id,
        status: payload.friend.status as "pending" | "accepted" | "rejected",
        created_at: payload.friend.created_at,
        accepted_at: payload.friend.accepted_at || null,
        requester: payload.friend.requester as any,
        addressee: payload.friend.addressee as any,
      };

      queryClient.setQueryData<FriendRequestResponse[]>(friendKeys.requests(userIdNumber), (old) => {
        if (!old) return [newRequest];
        if (old.some((req) => req.id === newRequest.id)) return old;
        return [newRequest, ...old];
      });

      antMessage.info(`Bạn có lời mời kết bạn mới từ ${payload.friend.requester?.fullname || "ai đó"}`);
    });

    const unsubscribeAccepted = onFriendRequestAccepted((payload) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      // Remove from requests
      queryClient.setQueryData<FriendRequestResponse[]>(friendKeys.requests(userIdNumber), (old) => {
        if (!old) return old;
        return old.filter((req) => req.id !== payload.friend.id);
      });

      // Invalidate friends list to fetch new friend
      queryClient.invalidateQueries({ queryKey: friendKeys.list(userIdNumber) });

      if (userIdNumber === payload.friend.requester_id) {
        antMessage.success(`${payload.friend.addressee?.fullname || "Ai đó"} đã chấp nhận lời mời kết bạn của bạn`);
      }
    });

    const unsubscribeRejected = onFriendRequestRejected((payload) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      queryClient.setQueryData<FriendRequestResponse[]>(friendKeys.requests(userIdNumber), (old) => {
        if (!old) return old;
        return old.filter((req) => req.id !== payload.friend_id);
      });
    });

    const unsubscribeRemoved = onFriendRemoved((payload) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      queryClient.invalidateQueries({ queryKey: friendKeys.list(userIdNumber) });

      if (userIdNumber === payload.removed_user_id) {
        antMessage.info("Bạn đã bị hủy kết bạn");
      }
    });

    const unsubscribeError = onFriendError((payload) => {
      console.error("Socket error", payload);
    });

    const unsubscribeBlocked = onUserBlocked((data) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      // Invalidate blocked users and friends list
      queryClient.invalidateQueries({ queryKey: friendKeys.blocked(userIdNumber) });
      queryClient.invalidateQueries({ queryKey: friendKeys.list(userIdNumber) });
    });

    const unsubscribeUnblocked = onUserUnblocked((data) => {
      const userId = getUserIdFromCookie();
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

      if (!userIdNumber) return;

      queryClient.invalidateQueries({ queryKey: friendKeys.blocked(userIdNumber) });
      queryClient.invalidateQueries({ queryKey: friendKeys.list(userIdNumber) });
    });

    return () => {
      unsubscribeReceived();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeRemoved();
      unsubscribeError();
      unsubscribeBlocked();
      unsubscribeUnblocked();
    };
  }, [queryClient, setConnected]);
}
