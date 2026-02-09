"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { User } from "@/app/components/social/types";
import { useSocialProfileStore } from "@/lib/stores/socialProfileStore";

interface SocialProfileContextType {
    currentUser: User | null;
    isSettingsOpen: boolean;
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProfileOpen: boolean;
    setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isAddFriendOpen: boolean;
    setIsAddFriendOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialProfileContext = createContext<SocialProfileContextType | undefined>(undefined);

export function SocialProfileProvider({ children }: { children: React.ReactNode }) {
    const {
        currentUser,
        isSettingsOpen,
        setIsSettingsOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAddFriendOpen,
        setIsAddFriendOpen,
        hydrate,
    } = useSocialProfileStore();

    // Hydrate from localStorage on mount
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // Create compatible setters for dispatch pattern
    const setSettingsOpen = useMemo(
        () =>
            ((value: boolean | ((prev: boolean) => boolean)) => {
                if (typeof value === "function") {
                    const newValue = value(useSocialProfileStore.getState().isSettingsOpen);
                    setIsSettingsOpen(newValue);
                } else {
                    setIsSettingsOpen(value);
                }
            }) as React.Dispatch<React.SetStateAction<boolean>>,
        [setIsSettingsOpen]
    );

    const setProfileOpen = useMemo(
        () =>
            ((value: boolean | ((prev: boolean) => boolean)) => {
                if (typeof value === "function") {
                    const newValue = value(useSocialProfileStore.getState().isProfileOpen);
                    setIsProfileOpen(newValue);
                } else {
                    setIsProfileOpen(value);
                }
            }) as React.Dispatch<React.SetStateAction<boolean>>,
        [setIsProfileOpen]
    );

    const setAddFriendOpen = useMemo(
        () =>
            ((value: boolean | ((prev: boolean) => boolean)) => {
                if (typeof value === "function") {
                    const newValue = value(useSocialProfileStore.getState().isAddFriendOpen);
                    setIsAddFriendOpen(newValue);
                } else {
                    setIsAddFriendOpen(value);
                }
            }) as React.Dispatch<React.SetStateAction<boolean>>,
        [setIsAddFriendOpen]
    );

    const value = useMemo(
        () => ({
            currentUser,
            isSettingsOpen,
            setIsSettingsOpen: setSettingsOpen,
            isProfileOpen,
            setIsProfileOpen: setProfileOpen,
            isAddFriendOpen,
            setIsAddFriendOpen: setAddFriendOpen,
        }),
        [currentUser, isSettingsOpen, setSettingsOpen, isProfileOpen, setProfileOpen, isAddFriendOpen, setAddFriendOpen]
    );

    return <SocialProfileContext.Provider value={value}>{children}</SocialProfileContext.Provider>;
}

export function useSocialProfile() {
    const context = useContext(SocialProfileContext);
    if (context === undefined) {
        throw new Error("useSocialProfile must be used within a SocialProfileProvider");
    }
    return context;
}
