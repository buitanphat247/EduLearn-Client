"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";

interface ServerAuthedUser {
    userId: number | string | null;
    username: string | null;
    roleName: string | null;
    avatar: string | null;
}

const ServerAuthedUserContext = createContext<ServerAuthedUser | null>(null);

export function ServerAuthedUserProvider({
    children,
    user,
}: {
    children: ReactNode;
    user: ServerAuthedUser | null;
}) {
    // ✅ Memoize based on scalar primitive properties instead of the object reference itself
    // Prevents unnecessary re-renders when the Server Component passes a new object reference with the same data
    const value = useMemo(() => user, [user?.userId, user?.username, user?.roleName, user?.avatar]);

    return (
        <ServerAuthedUserContext.Provider value={value}>
            {children}
        </ServerAuthedUserContext.Provider>
    );
}

export function useServerAuthedUser() {
    return useContext(ServerAuthedUserContext);
}
