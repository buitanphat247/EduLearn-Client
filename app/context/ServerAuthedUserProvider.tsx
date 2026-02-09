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
    const value = useMemo(() => user, [user]);

    return (
        <ServerAuthedUserContext.Provider value={value}>
            {children}
        </ServerAuthedUserContext.Provider>
    );
}

export function useServerAuthedUser() {
    return useContext(ServerAuthedUserContext);
}
