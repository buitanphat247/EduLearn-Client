"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getFriends, getFriendRequests, FriendRequestResponse } from "@/lib/api/friends";
import { getBlockedUsers, blockUser as apiBlockUser, unblockUser as apiUnblockUser, UserBlock } from "@/lib/api/chat-block";
import { Contact } from "@/app/components/social/types";
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

interface FriendContextType {
    contacts: Contact[];
    friendRequests: FriendRequestResponse[];
    receivedFriendRequests: FriendRequestResponse[];
    blockedUserIds: Set<string>;
    blockedByUserIds: Set<string>;
    blockedUsers: UserBlock[];
    fetchContacts: () => Promise<void>;
    fetchFriendRequests: () => Promise<void>;
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequestResponse[]>>;
    blockUser: (friendId: string) => Promise<void>;
    unblockUser: (friendId: string) => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
    const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
    const [blockedByUserIds, setBlockedByUserIds] = useState<Set<string>>(new Set());
    const [blockedUsers, setBlockedUsers] = useState<UserBlock[]>([]);

    // Refs for stale closures in socket
    const fetchContactsRef = useRef<() => Promise<void>>(() => Promise.resolve());

    const FRIEND_REQUESTS_LIMIT = 50;

    const currentUserId = getUserIdFromCookie();
    const currentUserIdNumber =
        typeof currentUserId === "string"
            ? parseInt(currentUserId, 10)
            : typeof currentUserId === "number"
                ? currentUserId
                : null;

    const receivedFriendRequests = useMemo(() => {
        if (currentUserIdNumber === null) return [];
        return friendRequests.filter(
            (request) => String(request.addressee_id) === String(currentUserIdNumber)
        );
    }, [friendRequests, currentUserIdNumber]);

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
                    status: (friendUser?.status as "online" | "offline" | "away") || "offline",
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
            const userIdNumber =
                typeof userId === "string" ? parseInt(userId, 10) : userId;
            if (isNaN(userIdNumber)) return;

            const result = await getFriendRequests({
                userId: userIdNumber,
                limit: FRIEND_REQUESTS_LIMIT,
            });
            setFriendRequests(result.requests || []);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    }, []);

    const blockUserHandler = useCallback(async (friendId: string) => {
        const userId = getUserIdFromCookie();
        if (!userId) return;
        try {
            await apiBlockUser(Number(userId), Number(friendId));

            // Optimistic update
            setBlockedUserIds((prev) => {
                const next = new Set(prev);
                next.add(String(friendId));
                return next;
            });
            // Also update blockedUsers list if possible (mocking structure or fetching)
            // Ideally we re-fetch or construct a partial object. Re-fetching is safer for the list.
            getBlockedUsers(Number(userId)).then((blocks) => {
                setBlockedUsers(blocks.filter((b) => String(b.blocker_id) === String(userId)));
            });

            antMessage.success("Đã chặn người dùng");
        } catch (error) {
            console.error("Error blocking user:", error);
            antMessage.error("Không thể chặn người dùng");
        }
    }, []);

    const unblockUserHandler = useCallback(async (friendId: string) => {
        const userId = getUserIdFromCookie();
        if (!userId) return;
        try {
            await apiUnblockUser(Number(userId), Number(friendId));

            // Optimistic update
            setBlockedUserIds((prev) => {
                const next = new Set(prev);
                next.delete(String(friendId));
                return next;
            });
            setBlockedUsers((prev) => prev.filter(b => String(b.blocked_id) !== String(friendId)));

            antMessage.success("Đã bỏ chặn người dùng");
        } catch (error) {
            console.error("Error unblocking user:", error);
            antMessage.error("Không thể bỏ chặn người dùng");
        }
    }, []);

    // Sync ref
    useEffect(() => {
        fetchContactsRef.current = fetchContacts;
    }, [fetchContacts]);

    // Initial Fetch
    useEffect(() => {
        fetchContacts();
        fetchFriendRequests();

        // Fetch Blocked
        const userId = getUserIdFromCookie();
        if (userId) {
            getBlockedUsers(Number(userId)).then((blocks) => {
                const iBlocked = new Set<string>();
                const blockedMe = new Set<string>();

                blocks.forEach((b) => {
                    if (String(b.blocker_id) === String(userId)) {
                        iBlocked.add(String(b.blocked_id));
                    } else if (String(b.blocked_id) === String(userId)) {
                        blockedMe.add(String(b.blocker_id));
                    }
                });

                setBlockedUserIds(iBlocked);
                setBlockedByUserIds(blockedMe);
                setBlockedUsers(blocks.filter(b => String(b.blocker_id) === String(userId)));
            });
        }
    }, [fetchContacts, fetchFriendRequests]);

    // Socket Listeners
    useEffect(() => {
        friendSocketClient.connect();

        const unsubscribeReceived = onFriendRequestReceived((payload) => {
            const newRequest: FriendRequestResponse = {
                id: payload.friend.id,
                requester_id: payload.friend.requester_id,
                addressee_id: payload.friend.addressee_id,
                status: payload.friend.status as 'pending' | 'accepted' | 'rejected',
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
            antMessage.info(
                `Bạn có lời mời kết bạn mới từ ${payload.friend.requester?.fullname || "ai đó"}`
            );
        });

        const unsubscribeAccepted = onFriendRequestAccepted((payload) => {
            setFriendRequests((prev) =>
                prev.filter((req) => req.id !== payload.friend.id)
            );
            const userId = getUserIdFromCookie();
            const userIdNum =
                typeof userId === "string" ? parseInt(userId, 10) : userId;
            if (userIdNum === payload.friend.requester_id) {
                antMessage.success(
                    `${payload.friend.addressee?.fullname || "Ai đó"} đã chấp nhận lời mời kết bạn của bạn`
                );
            }
            fetchContactsRef.current();
        });

        const unsubscribeRejected = onFriendRequestRejected((payload) => {
            setFriendRequests((prev) =>
                prev.filter((req) => req.id !== payload.friend_id)
            );
        });

        const unsubscribeRemoved = onFriendRemoved((payload) => {
            fetchContactsRef.current();
            const currentUserId = getUserIdFromCookie();
            const currentUserIdNum =
                typeof currentUserId === "string"
                    ? parseInt(currentUserId, 10)
                    : currentUserId;
            if (currentUserIdNum === payload.removed_user_id) {
                antMessage.info("Bạn đã bị hủy kết bạn");
            }
        });

        const unsubscribeError = onFriendError((payload) => {
            console.error("Socket error", payload);
        });

        const unsubscribeUnblocked = onUserUnblocked((data) => {

            const unblockedId = String(data.userId);
            if (data.initiatedByMe) {
                setBlockedUserIds((prev) => {
                    const next = new Set(prev);
                    next.delete(unblockedId);
                    return next;
                });
                setBlockedUsers((prev) =>
                    prev.filter((b) => String(b.blocked_id) !== unblockedId)
                );
            } else {
                setBlockedByUserIds((prev) => {
                    const next = new Set(prev);
                    next.delete(unblockedId);
                    return next;
                });
            }
            fetchContactsRef.current();
        });

        const unsubscribeBlocked = onUserBlocked((data) => {

            const blockedId = String(data.userId);
            const userId = getUserIdFromCookie();

            if (data.initiatedByMe) {
                setBlockedUserIds((prev) => {
                    const next = new Set(prev);
                    next.add(blockedId);
                    return next;
                });
                if (userId) {
                    getBlockedUsers(Number(userId)).then((blocks) => {
                        setBlockedUsers(
                            blocks.filter((b) => String(b.blocker_id) === String(userId))
                        );
                    });
                }
            } else {
                setBlockedByUserIds((prev) => {
                    const next = new Set(prev);
                    next.add(blockedId);
                    return next;
                });
            }
            fetchContactsRef.current();
        });

        return () => {
            // Don't disconnect socket strictly here if shared, but usually safe to component unmount
            // friendSocketClient.disconnect(); 
            // Actually friendSocket might be shared, but in NextJS navigation it's often kept. 
            // But we should unsubscribe listeners.
            unsubscribeReceived();
            unsubscribeAccepted();
            unsubscribeRejected();
            unsubscribeRemoved();
            unsubscribeError();
            unsubscribeBlocked();
            unsubscribeUnblocked();
        };
    }, []);

    const value = useMemo(() => ({
        contacts,
        friendRequests,
        receivedFriendRequests,
        blockedUserIds,
        blockedByUserIds,
        blockedUsers,
        fetchContacts,
        fetchFriendRequests,
        setContacts,
        setFriendRequests,
        blockUser: blockUserHandler,
        unblockUser: unblockUserHandler,
    }), [
        contacts,
        friendRequests,
        receivedFriendRequests,
        blockedUserIds,
        blockedByUserIds,
        blockedUsers,
        fetchContacts,
        fetchFriendRequests,
        blockUserHandler,
        unblockUserHandler
    ]);

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
}

export function useFriend() {
    const context = useContext(FriendContext);
    if (context === undefined) {
        throw new Error("useFriend must be used within a FriendProvider");
    }
    return context;
}
