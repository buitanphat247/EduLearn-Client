"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getNotificationsByUserId } from "@/lib/api/notifications";

interface NotificationBellProps {
    userId: number | string;
    className?: string;
    isMenuItem?: boolean;
}

export default function NotificationBell({ userId, className = "", isMenuItem = false }: NotificationBellProps) {
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        setMounted(true);
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId || !isMountedRef.current) return;
        try {
            const unreadResult = await getNotificationsByUserId(userId, {
                page: 1,
                limit: 1,
                is_read: false,
            });
            if (isMountedRef.current) {
                setUnreadCount(Math.max(0, unreadResult.total || 0));
            }
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        fetchUnreadCount();

        const handleRefreshEvent = () => fetchUnreadCount();
        window.addEventListener("refresh-notifications", handleRefreshEvent);
        const safetyInterval = setInterval(fetchUnreadCount, 300000);

        return () => {
            window.removeEventListener("refresh-notifications", handleRefreshEvent);
            clearInterval(safetyInterval);
        };
    }, [userId, fetchUnreadCount]);

    const BellIcon = () => (
        <svg
            viewBox="64 64 896 896"
            focusable="false"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            aria-hidden="true"
            className={isMenuItem ? "text-slate-600 dark:text-slate-300" : ""}
        >
            <path d="M816 768h-24V428c0-141.1-104.3-257.7-240-277.1V112c0-22.1-17.9-40-40-40s-40 17.9-40 40v38.9c-135.7 19.4-240 136-240 277.1v340h-24c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h216c0 61.8 50.2 112 112 112s112-50.2 112-112h216c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM512 888c-26.5 0-48-21.5-48-48h96c0 26.5-21.5 48-48 48zM304 768V428c0-55.6 21.6-107.8 60.9-147.1S456 220 512 220s107.8 21.6 147.1 60.9S720 372.4 720 428v340H304z" />
        </svg>
    );

    if (!mounted || !userId) {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <BellIcon />
            </div>
        );
    }

    const content = (
        <>
            <BellIcon />
            {unreadCount > 0 && (
                <span
                    className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] h-[16px] text-center flex items-center justify-center leading-none border border-white dark:border-[#0f172a]"
                    style={{ transform: 'scale(0.85)' }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </>
    );

    if (isMenuItem) {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                {content}
            </div>
        );
    }

    return (
        <button
            onClick={() => router.push('/notifications')}
            className={`relative flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors border-none bg-transparent focus:outline-none ${className}`}
            aria-label="Thông báo"
        >
            {content}
        </button>
    );
}
