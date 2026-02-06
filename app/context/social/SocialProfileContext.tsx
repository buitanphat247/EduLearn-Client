"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/app/components/social/types";

interface SocialProfileContextType {
    currentUser: User | null;
    isSettingsOpen: boolean;
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProfileOpen: boolean;
    setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isAddFriendOpen: boolean; // Keep it here as it triggers from global UI usually
    setIsAddFriendOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialProfileContext = createContext<SocialProfileContextType | undefined>(undefined);

// Helper for type guard
interface UserData {
    user_id?: number | string;
    id?: number | string;
    username?: string;
    fullname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: { role_name?: string };
}

function isValidUserData(data: any): data is UserData {
    return (
        data &&
        typeof data === 'object' &&
        (typeof data.user_id === 'number' || typeof data.user_id === 'string' ||
            typeof data.id === 'number' || typeof data.id === 'string')
    );
}

export function SocialProfileProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;

            const user = JSON.parse(userStr);

            if (!isValidUserData(user)) {
                console.error("Invalid user data structure");
                localStorage.removeItem("user");
                return;
            }

            setCurrentUser({
                id: user.user_id || user.id || '',
                username: user.username || '',
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role_name: user.role?.role_name,
            });
        } catch (e) {
            console.error("Error parsing user from local storage", e);
            localStorage.removeItem("user");
        }
    }, []);

    const value = React.useMemo(() => ({
        currentUser,
        isSettingsOpen,
        setIsSettingsOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAddFriendOpen,
        setIsAddFriendOpen,
    }), [currentUser, isSettingsOpen, isProfileOpen, isAddFriendOpen]);

    return (
        <SocialProfileContext.Provider value={value}>
            {children}
        </SocialProfileContext.Provider>
    );
}

export function useSocialProfile() {
    const context = useContext(SocialProfileContext);
    if (context === undefined) {
        throw new Error("useSocialProfile must be used within a SocialProfileProvider");
    }
    return context;
}
