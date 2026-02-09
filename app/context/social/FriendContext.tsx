"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { Contact } from "@/app/components/social/types";
import { FriendRequestResponse } from "@/lib/api/friends";
import { UserBlock } from "@/lib/api/chat-block";

// React Query hooks
import {
    useFriendsQuery,
    useFriendRequestsQuery,
    useReceivedFriendRequests,
    useBlockedUsersQuery,
    useBlockUserMutation,
    useUnblockUserMutation,
} from "@/lib/queries";

// Socket integration
import { useFriendSocketIntegration } from "@/lib/hooks/useFriendSocketIntegration";

interface FriendContextType {
    // Data from React Query
    contacts: Contact[];
    friendRequests: FriendRequestResponse[];
    receivedFriendRequests: FriendRequestResponse[];
    blockedUserIds: Set<string>;
    blockedByUserIds: Set<string>;
    blockedUsers: UserBlock[];

    // Actions
    fetchContacts: () => Promise<void>;
    fetchFriendRequests: () => Promise<void>;
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequestResponse[]>>;
    blockUser: (friendId: string) => Promise<void>;
    unblockUser: (friendId: string) => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
    // React Query for server state
    const friendsQuery = useFriendsQuery();
    const friendRequestsQuery = useFriendRequestsQuery();
    const blockedUsersQuery = useBlockedUsersQuery();

    // Get derived data
    const receivedFriendRequests = useReceivedFriendRequests();

    // Mutations
    const blockUserMutation = useBlockUserMutation();
    const unblockUserMutation = useUnblockUserMutation();

    // Socket integration for real-time updates
    useFriendSocketIntegration();

    // Extract data from queries
    const contacts = friendsQuery.data ?? [];
    const friendRequests = friendRequestsQuery.data ?? [];
    const blockedUserIds = blockedUsersQuery.data?.blockedUserIds ?? new Set<string>();
    const blockedByUserIds = blockedUsersQuery.data?.blockedByUserIds ?? new Set<string>();
    const blockedUsers = blockedUsersQuery.data?.blockedUsers ?? [];

    // Actions
    const fetchContacts = useCallback(async () => {
        await friendsQuery.refetch();
    }, [friendsQuery]);

    const fetchFriendRequests = useCallback(async () => {
        await friendRequestsQuery.refetch();
    }, [friendRequestsQuery]);

    const blockUser = useCallback(async (friendId: string) => {
        await blockUserMutation.mutateAsync({ friendId });
    }, [blockUserMutation]);

    const unblockUser = useCallback(async (friendId: string) => {
        await unblockUserMutation.mutateAsync({ friendId });
    }, [unblockUserMutation]);

    // Compatibility setters (for components still using dispatch pattern)
    // These are no-ops now since data comes from React Query
    const setContacts = useCallback((_: React.SetStateAction<Contact[]>) => {
        // Data is managed by React Query, trigger refetch instead
        friendsQuery.refetch();
    }, [friendsQuery]) as React.Dispatch<React.SetStateAction<Contact[]>>;

    const setFriendRequests = useCallback((_: React.SetStateAction<FriendRequestResponse[]>) => {
        // Data is managed by React Query, trigger refetch instead
        friendRequestsQuery.refetch();
    }, [friendRequestsQuery]) as React.Dispatch<React.SetStateAction<FriendRequestResponse[]>>;

    const value = useMemo(() => ({
        // Data
        contacts,
        friendRequests,
        receivedFriendRequests,
        blockedUserIds,
        blockedByUserIds,
        blockedUsers,

        // Actions
        fetchContacts,
        fetchFriendRequests,
        setContacts,
        setFriendRequests,
        blockUser,
        unblockUser,
    }), [
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
        blockUser,
        unblockUser,
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
