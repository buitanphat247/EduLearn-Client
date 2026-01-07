"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getFriends, getFriendRequests, FriendRequestResponse } from "@/lib/api/friends";
import { getChatRooms, ChatRoomType } from "@/lib/api/chat-room";
import { Contact } from "@/app/components/social/types";
import {
  friendSocketClient,
  onFriendRequestReceived,
  onFriendRequestAccepted,
  onFriendRequestRejected,
  onFriendError,
  onFriendRemoved,
} from "@/lib/socket";

interface User {
  id: string | number;
  username: string;
  fullname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface SocialContextType {
  currentUser: User | null;
  contacts: Contact[];
  friendRequests: FriendRequestResponse[];
  receivedFriendRequests: FriendRequestResponse[];
  groupCount: number;
  fetchContacts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequestResponse[]>>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
  const [groupCount, setGroupCount] = useState(0);

  // Derived state
  const currentUserId = getUserIdFromCookie();
  const currentUserIdNumber =
    typeof currentUserId === "string" ? parseInt(currentUserId, 10) : typeof currentUserId === "number" ? currentUserId : null;

  const receivedFriendRequests = useMemo(() => {
    if (currentUserIdNumber === null) return [];
    return friendRequests.filter((request) => String(request.addressee_id) === String(currentUserIdNumber));
  }, [friendRequests, currentUserIdNumber]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser({
          id: user.user_id || user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        });
      }
    } catch (e) {
      console.error("Error parsing user from local storage", e);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    try {
      const response = await getFriends({ userId });
      const mappedContacts: Contact[] = response.data.map((friend) => {
        const userIdStr = String(userId);
        const isRequester = String(friend.requester_id) === userIdStr;
        const friendUser = isRequester ? friend.addressee : friend.requester;

        return {
          id: String(friendUser?.user_id),
          name: friendUser?.fullname || friendUser?.username || "Unknown",
          avatar: friendUser?.avatar || undefined,
          status: (friendUser?.status as any) || "offline",
          isFriend: true,
          friendshipId: friend.id,
        };
      });
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) return;

      const result = await getFriendRequests({ userId: userIdNumber, limit: 50 });
      setFriendRequests(result.requests || []);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const userId = getUserIdFromCookie();
    const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : typeof userId === "number" ? userId : null;
    if (!userIdNumber) return;

    try {
      const chatRoomsResult = await getChatRooms({ userId: userIdNumber });
      const groups = chatRoomsResult.data.filter((room) => room.room_type === ChatRoomType.GROUP);
      setGroupCount(groups.length);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
    fetchStats();
    fetchFriendRequests();
  }, [fetchContacts, fetchStats, fetchFriendRequests]);

  // Socket Listeners
  useEffect(() => {
    friendSocketClient.connect();

    const unsubscribeReceived = onFriendRequestReceived((payload) => {
      // Add to list
      const newRequest: FriendRequestResponse = {
        id: payload.friend.id,
        requester_id: payload.friend.requester_id,
        addressee_id: payload.friend.addressee_id,
        status: payload.friend.status as any,
        created_at: payload.friend.created_at,
        accepted_at: payload.friend.accepted_at || null,
        requester: payload.friend.requester as any,
        addressee: payload.friend.addressee as any,
      };

      setFriendRequests((prev) => {
        const exists = prev.some((req) => req.id === newRequest.id);
        if (!exists) return [newRequest, ...prev];
        return prev;
      });
      antMessage.info(`Bạn có lời mời kết bạn mới từ ${payload.friend.requester?.fullname || "ai đó"}`);
    });

    const unsubscribeAccepted = onFriendRequestAccepted((payload) => {
      setFriendRequests((prev) => prev.filter((req) => req.id !== payload.friend.id));

      const userId = getUserIdFromCookie();
      const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (userIdNum === payload.friend.requester_id) {
        antMessage.success(`${payload.friend.addressee?.fullname || "Ai đó"} đã chấp nhận lời mời kết bạn của bạn`);
      }
      fetchContacts();
    });

    const unsubscribeRejected = onFriendRequestRejected((payload) => {
      setFriendRequests((prev) => prev.filter((req) => req.id !== payload.friend_id));
    });

    const unsubscribeRemoved = onFriendRemoved((payload) => {
      fetchContacts();
      const currentUserId = getUserIdFromCookie();
      const currentUserIdNum = typeof currentUserId === "string" ? parseInt(currentUserId, 10) : currentUserId;

      if (currentUserIdNum === payload.removed_user_id) {
        antMessage.info("Bạn đã bị hủy kết bạn");
      }
    });

    const unsubscribeError = onFriendError((payload) => {
      console.error("Socket error", payload);
    });

    return () => {
      unsubscribeReceived();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeRemoved();
      unsubscribeError();
    };
  }, [fetchContacts]);

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        contacts,
        friendRequests,
        receivedFriendRequests,
        groupCount,
        fetchContacts,
        fetchStats,
        fetchFriendRequests,
        setContacts,
        setFriendRequests,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
}
