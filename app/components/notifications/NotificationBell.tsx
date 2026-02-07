"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge, Drawer, Empty, Button, message, Avatar, List, Typography, Spin, Tag } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getNotificationsByUserId, markNotificationAsRead, getNotificationRecipientsByUserId, type NotificationResponse, type NotificationRecipientResponse } from "@/lib/api/notifications";
import { notificationSocketClient } from "@/lib/socket/notification-client";
import NotificationDetailModal from "@/app/components/notifications/NotificationDetailModal";
import "./NotificationBell.css";

const { Text } = Typography;

interface NotificationBellProps {
    userId: number | string;
    className?: string;
}

interface NotificationItem extends NotificationResponse {
    is_read?: boolean;
    read_at?: string | null;
    delivered_at?: string | null;
}

export default function NotificationBell({ userId, className = "" }: NotificationBellProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const isInitialLoadRef = useRef(true);

    // Ensure component only renders after client-side hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch notifications in background
    const fetchNotifications = useCallback(async (silent = false) => {
        if (!userId) return;

        if (!silent) setLoading(true);

        try {
            // Get all notifications (max 10)
            const result = await getNotificationsByUserId(userId, {
                page: 1,
                limit: 10,
            });

            // Get unread count separately
            const unreadResult = await getNotificationsByUserId(userId, {
                page: 1,
                limit: 1,
                is_read: false,
            });

            // Fetch recipients to get is_read status
            const recipients = await getNotificationRecipientsByUserId(userId);

            // Create a map of notification_id -> is_read status
            const readStatusMap = new Map<number | string, boolean>();
            recipients.forEach((recipient: NotificationRecipientResponse) => {
                const notifId = recipient.notification_id || recipient.notification?.notification_id;
                if (notifId) {
                    readStatusMap.set(notifId, recipient.is_read === true);
                }
            });

            // Map notifications with actual is_read status from recipients
            const mappedNotifications = result.data.map((notif: NotificationResponse) => {
                const notifId = notif.notification_id;
                const isRead = readStatusMap.get(notifId) || false;

                return {
                    ...notif,
                    is_read: isRead,
                };
            });

            setNotifications(mappedNotifications);
            setUnreadCount(unreadResult.total);
            isInitialLoadRef.current = false;
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            if (!silent && (drawerOpen || !isInitialLoadRef.current)) {
                console.warn("Failed to fetch notifications");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [userId, drawerOpen]);

    // Initial load and Socket setup
    useEffect(() => {
        if (!userId) return;

        // 1. Initial fetch
        fetchNotifications(true);

        // 2. Socket setup
        notificationSocketClient.connect();

        const handleRefresh = () => {
            fetchNotifications(true);
        };

        // Listen for all relevant notification events
        notificationSocketClient.on("notification_created", handleRefresh);
        notificationSocketClient.on("notification_updated", handleRefresh);
        notificationSocketClient.on("notification_deleted", handleRefresh);
        notificationSocketClient.on("notifications_read_updated", handleRefresh);

        // Auto-refresh every 5 minutes
        const safetyInterval = setInterval(() => {
            fetchNotifications(true);
        }, 300000);

        return () => {
            notificationSocketClient.off("notification_created", handleRefresh);
            notificationSocketClient.off("notification_updated", handleRefresh);
            notificationSocketClient.off("notification_deleted", handleRefresh);
            notificationSocketClient.off("notifications_read_updated", handleRefresh);
            clearInterval(safetyInterval);
        };
    }, [userId, fetchNotifications]);

    // Mark notification as read
    const handleMarkAsRead = useCallback(
        async (notificationId: number | string, _silent = false) => {
            try {
                const notification = notifications.find(n => n.notification_id === notificationId);
                if (notification?.is_read) return;

                await markNotificationAsRead(notificationId, userId);

                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.notification_id === notificationId
                            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));

                if (selectedNotification?.notification_id === notificationId) {
                    setSelectedNotification((prev) =>
                        prev ? { ...prev, is_read: true, read_at: new Date().toISOString() } : null
                    );
                }

                setTimeout(() => {
                    fetchNotifications(true);
                }, 1000);
            } catch (error: any) {
                console.error("Error marking notification as read:", error);
            }
        },
        [userId, selectedNotification, notifications, fetchNotifications]
    );

    const handleMarkAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        message.success("Đã đánh dấu tất cả là đã đọc");
    }, []);

    // Handle notification click
    const handleNotificationClick = useCallback(
        (notification: NotificationItem) => {
            setSelectedNotification(notification);
            setModalOpen(true);

            if (!notification.is_read) {
                handleMarkAsRead(notification.notification_id, true);
            }
        },
        [handleMarkAsRead]
    );

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setSelectedNotification(null);
    }, []);

    const handleViewAll = useCallback(() => {
        setDrawerOpen(false);
        router.push("/notifications");
    }, [router]);

    // Format helpers
    // Format helpers
    const formatTimeAgo = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return "Vừa xong";
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
            if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
            return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
        } catch {
            return "Vừa xong";
        }
    }, []);

    // Custom Bell SVG - uses CSS currentColor to avoid hydration mismatch
    // Color is determined by parent's text color class, set by CSS (not JS)
    const BellIcon = () => (
        <svg
            viewBox="64 64 896 896"
            focusable="false"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M816 768h-24V428c0-141.1-104.3-257.7-240-277.1V112c0-22.1-17.9-40-40-40s-40 17.9-40 40v38.9c-135.7 19.4-240 136-240 277.1v340h-24c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h216c0 61.8 50.2 112 112 112s112-50.2 112-112h216c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM512 888c-26.5 0-48-21.5-48-48h96c0 26.5-21.5 48-48 48zM304 768V428c0-55.6 21.6-107.8 60.9-147.1S456 220 512 220s107.8 21.6 147.1 60.9S720 372.4 720 428v340H304z" />
        </svg>
    );

    if (!mounted || !userId) {
        return (
            <div className={`notification-bell-wrapper ${className} w-10 h-10 flex items-center justify-center text-slate-600 dark:text-white`}>
                <BellIcon />
            </div>
        );
    }

    const drawerHeader = (
        <div className="flex items-center justify-between w-full pr-6">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">Thông báo</span>
            {unreadCount > 0 && (
                <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
                >
                    Đánh dấu đã đọc
                </Button>
            )}
        </div>
    );

    return (
        <>
            <button
                className={`notification-bell-wrapper ${className} w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative active:scale-95 border-none bg-transparent focus:outline-none text-slate-600 dark:text-white`}
                aria-label="Thông báo"
                onClick={() => setDrawerOpen(true)}
            >
                <Badge count={unreadCount} overflowCount={99} size="small" offset={[-3, 4]}>
                    <BellIcon />
                </Badge>
            </button>

            <Drawer
                title={drawerHeader}
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                className="notification-drawer w-full md:w-[400px]"
                styles={{
                    header: { padding: '16px 20px', borderBottom: '1px solid var(--border-color)' },
                    body: { padding: 0 },
                    footer: { borderTop: '1px solid var(--border-color)', padding: '12px 16px' }
                }}
                closeIcon={null} // Cleaner look, rely on click-outside or custom close if needed, but standard drawer has close icon by default if not null. Let's keep default close icon but maybe style it. Actually standard close icon is fine. Let's remove this line to keep standard cross close button.
                footer={
                    <div className="text-center">
                        <Button type="primary" onClick={handleViewAll} block className=" text-blue-600 font-medium hover:bg-blue-50">
                            Xem tất cả thông báo
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col h-full">
                    {loading && notifications.length === 0 ? (
                        <div className="py-20 flex justify-center">
                            <Spin size="large" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<span className="text-gray-500 dark:text-gray-400">Bạn chưa có thông báo nào</span>}
                            />
                        </div>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={notifications}
                            renderItem={(item, index) => (
                                <div
                                    className={`
                                        px-5 py-4 cursor-pointer transition-all border-b border-gray-100 dark:border-slate-800/50 last:border-0 relative group
                                        ${!item.is_read
                                            ? 'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/30'
                                            : index % 2 === 0
                                                ? 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                : 'bg-gray-50/80 dark:bg-slate-800/40 hover:bg-gray-100 dark:hover:bg-slate-800/80'
                                        }
                                    `}
                                    onClick={() => handleNotificationClick(item)}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <Avatar
                                                size={40}
                                                icon={<BellOutlined />}
                                                className={`${item.is_read ? 'bg-gray-100 dark:bg-slate-800 text-gray-500' : 'bg-blue-100 text-blue-600'}`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <Text strong className={`block text-sm mr-2 leading-snug ${item.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                                    {item.title}
                                                </Text>
                                                {!item.is_read && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 shadow-sm shadow-blue-200" />}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                                                {item.message}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                    {formatTimeAgo(item.created_at)}
                                                </Text>
                                                {item.scope === 'class' && (
                                                    <Tag className="m-0 border-none bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] px-2 leading-4 h-5 rounded-full">
                                                        Lớp học
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </div>
            </Drawer>

            <NotificationDetailModal
                open={modalOpen}
                onCancel={handleModalClose}
                notification={selectedNotification}
            />
        </>
    );
}
