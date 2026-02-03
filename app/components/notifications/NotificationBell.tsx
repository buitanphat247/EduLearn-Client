"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Badge, Dropdown, Empty, Button, message, Modal, Tag } from "antd";
import { BellOutlined, CalendarOutlined, CloseOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { getNotificationsByUserId, markNotificationAsRead, getNotificationRecipientsByUserId, type NotificationResponse } from "@/lib/api/notifications";
import "./NotificationBell.css";

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
    console.log("NotificationBell component loaded");
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

    // Fetch notifications in background
    const fetchNotifications = useCallback(async (silent = false) => {
        if (!userId) return;

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
            recipients.forEach((recipient: any) => {
                const notifId = recipient.notification_id || recipient.notification?.notification_id;
                if (notifId) {
                    readStatusMap.set(notifId, recipient.is_read === true);
                }
            });

            // Map notifications with actual is_read status from recipients
            const mappedNotifications = result.data.map((notif: any) => {
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
            // Only show error if dropdown is open or if it's not initial load
            if (!silent && (dropdownOpen || !isInitialLoadRef.current)) {
                message.error("Không thể tải thông báo");
            }
        }
    }, [userId, dropdownOpen]);

    // Initial load on mount (silent background load)
    useEffect(() => {
        if (userId) {
            fetchNotifications(true); // Silent initial load
        }
    }, [userId]); // Only depend on userId

    // Auto-refresh every 30 seconds in background
    useEffect(() => {
        if (!userId) return;

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up auto-refresh
        intervalRef.current = setInterval(() => {
            fetchNotifications(true); // Silent refresh
        }, 30000); // 30 seconds

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userId, fetchNotifications]);

    // Mark notification as read (one-way only - cannot unread)
    const handleMarkAsRead = useCallback(
        async (notificationId: number | string, silent = false) => {
            try {
                // Only mark as read if not already read (one-way operation)
                const notification = notifications.find(n => n.notification_id === notificationId);
                if (notification?.is_read) {
                    return; // Already read, do nothing
                }

                await markNotificationAsRead(notificationId, userId);

                // Update state immediately
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.notification_id === notificationId
                            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                            : notif
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));

                // Update selected notification if it's the one being marked
                if (selectedNotification?.notification_id === notificationId) {
                    setSelectedNotification((prev) =>
                        prev ? { ...prev, is_read: true, read_at: new Date().toISOString() } : null
                    );
                }

                // Refresh notifications to get latest state from server
                setTimeout(() => {
                    fetchNotifications(true); // Silent refresh
                }, 500);
            } catch (error: any) {
                console.error("Error marking notification as read:", error);
                if (!silent) {
                    message.error("Không thể đánh dấu đã đọc");
                }
            }
        },
        [userId, selectedNotification, notifications, fetchNotifications]
    );

    // Handle notification click - open modal
    const handleNotificationClick = useCallback(
        (notification: NotificationItem) => {
            console.log("Opening modal for notification:", notification);
            setSelectedNotification(notification);
            setModalOpen(true);
            setDropdownOpen(false); // Close dropdown when opening modal

            // Mark as read when opening modal (if not already read) - one-way only
            if (!notification.is_read) {
                handleMarkAsRead(notification.notification_id, true); // Silent mark
            }
        },
        [handleMarkAsRead]
    );

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setSelectedNotification(null);
    }, []);

    // Format time ago
    const formatTimeAgo = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) {
                return "Vừa xong";
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} phút trước`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} giờ trước`;
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} ngày trước`;
            } else {
                const weeks = Math.floor(diffInSeconds / 604800);
                return `${weeks} tuần trước`;
            }
        } catch {
            return "Vừa xong";
        }
    }, []);

    // Handle view all notifications
    const handleViewAll = useCallback(() => {
        setDropdownOpen(false);
        // Navigate to notifications page based on user role
        // You can customize this route based on your app structure
        router.push("/notifications");
    }, [router]);

    // Notification menu items
    const notificationItems: MenuProps["items"] = useMemo(() => {
        const items: MenuProps["items"] = [];

        if (notifications.length === 0) {
            items.push({
                key: "empty",
                label: (
                    <div className="py-8">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Không có thông báo"
                            className="text-slate-500"
                        />
                    </div>
                ),
                disabled: true,
            });
        } else {
            // Add notification items (max 10)
            notifications.slice(0, 10).forEach((notif) => {
                items.push({
                    key: `notification-${notif.notification_id}`,
                    label: (
                        <div
                            className={`notification-item ${notif.is_read === false ? "unread" : ""}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNotificationClick(notif);
                            }}
                        >
                            <div className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                                            {notif.title}
                                        </h4>
                                        {notif.is_read === false && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    {notif.message && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-500">
                                            {formatTimeAgo(notif.created_at)}
                                        </span>
                                        {notif.scope === "class" && notif.scope_id && (
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                Lớp học
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                });
            });

            // Add "View All" button at the end
            items.push({
                key: "view-all",
                label: (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <Button
                            type="link"
                            block
                            onClick={handleViewAll}
                            className="text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                            Xem tất cả thông báo
                        </Button>
                    </div>
                ),
                style: { padding: 0 },
            });
        }

        return items;
    }, [notifications, formatTimeAgo, handleViewAll, handleNotificationClick]);

    // Format date for modal (HH:mm DD/MM/YYYY)
    const formatModalDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${hours}:${minutes} ${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    }, []);

    const getScopeInfo = (scope: string) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
            all: { color: "orange", text: "Hệ thống" },
            user: { color: "cyan", text: "Cá nhân" },
            class: { color: "geekblue", text: "Lớp học" },
        };
        return scopeMap[scope] || { color: "blue", text: scope };
    };

    return (
        <>
            <Dropdown
                menu={{
                    items: notificationItems,
                    className: "notification-dropdown",
                    onClick: (e) => {
                        // Handle click on notification items
                        if (e.key.startsWith("notification-")) {
                            e.domEvent.preventDefault();
                            e.domEvent.stopPropagation();
                            const notifId = e.key.replace("notification-", "");
                            const notification = notifications.find(n => {
                                const id = String(n.notification_id);
                                return id === notifId;
                            });
                            console.log("Menu onClick - notifId:", notifId, "notification:", notification);
                            if (notification) {
                                handleNotificationClick(notification);
                            }
                        }
                    },
                }}
                placement="bottomRight"
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                trigger={["click"]}
                overlayClassName="notification-dropdown-overlay"
                destroyPopupOnHide={false}
            >
                <div
                    className={`notification-bell-wrapper ${className}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Thông báo"
                    aria-expanded={dropdownOpen}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setDropdownOpen(!dropdownOpen);
                        }
                    }}
                >
                    <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                        <div className="notification-bell-icon">
                            <BellOutlined className="text-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                        </div>
                    </Badge>
                </div>
            </Dropdown>

            {/* Notification Detail Modal */}
            <Modal
                title="Chi tiết thông báo"
                open={modalOpen}
                onCancel={handleModalClose}
                footer={null}
                width={700}
                destroyOnClose={true}
            >
                {selectedNotification && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tiêu đề</label>
                            <div className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-100">{selectedNotification.title}</div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Nội dung</label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:!border-slate-600 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                {selectedNotification.message}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Phạm vi</label>
                                <div className="mt-1">
                                    <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs border-none" color={getScopeInfo(selectedNotification.scope).color}>
                                        {getScopeInfo(selectedNotification.scope).text}
                                    </Tag>
                                </div>
                            </div>

                            {selectedNotification.scope_id && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{selectedNotification.scope === "user" ? "Mã người dùng" : "Mã lớp"}</label>
                                    <div className="mt-1 text-gray-700 dark:text-gray-200">{selectedNotification.scope_id}</div>
                                </div>
                            )}
                        </div>

                        {selectedNotification.creator && (
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Người tạo</label>
                                <div className="mt-1 text-gray-700 dark:text-gray-200">{selectedNotification.creator.fullname || selectedNotification.creator.username}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:!border-slate-600">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <CalendarOutlined />
                                    Ngày tạo
                                </label>
                                <div className="mt-1 text-gray-700 dark:text-gray-200">{formatModalDate(selectedNotification.created_at)}</div>
                            </div>

                            {selectedNotification.updated_at && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                        <CalendarOutlined />
                                        Ngày cập nhật
                                    </label>
                                    <div className="mt-1 text-gray-700 dark:text-gray-200">{formatModalDate(selectedNotification.updated_at)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
