"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, message, Empty, App } from "antd";
import {
    SyncOutlined
} from "@ant-design/icons";
import {
    getNotificationsByUserId,
    markNotificationAsRead,
    getNotificationRecipientsByUserId,
    type NotificationResponse,
    type NotificationRecipientResponse
} from "@/lib/api/notifications";
import { useUserId } from "@/app/hooks/useUserId";
import { useRouter } from "next/navigation";
import { getClassesByUser, getClassById } from "@/lib/api/classes";
import { useTheme } from "@/app/context/ThemeContext";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import CustomSelect from "@/app/components/common/CustomSelect";
import NotificationsSkeleton from "@/app/components/notifications/NotificationsSkeleton";
import NotificationCard, { NotificationItem } from "@/app/components/notifications/NotificationCard";
import NotificationDetailModal from "@/app/components/notifications/NotificationDetailModal";

// const { Title, Text, Paragraph } = Typography;
const { Text, Paragraph } = Typography;



export default function NotificationsPage() {
    const router = useRouter();
    useTheme();
    const { userId, loading: userIdLoading } = useUserId();

    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [classMap, setClassMap] = useState<Record<string, string>>({});

    // Filters
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const pageSize = 12;

    // Fetch classes when userId becomes available
    useEffect(() => {
        if (!userId || userIdLoading) return;

        const fetchClasses = async () => {
            try {
                const result = await getClassesByUser({ userId, limit: 100 });
                const mapping: Record<string, string> = {};
                result.classes.forEach((c: any) => {
                    mapping[String(c.class_id)] = c.name;
                });
                setClassMap(mapping);
            } catch (e) {
                console.error("Error fetching classes for mapping:", e);
            }
        };
        fetchClasses();
    }, [userId, userIdLoading]);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const params: any = {
                page,
                limit: pageSize,
                search: searchText || undefined,
            };

            if (activeTab === "unread") {
                params.is_read = false;
            }

            const result = await getNotificationsByUserId(userId, params);
            const recipients = await getNotificationRecipientsByUserId(userId);
            const readStatusMap = new Map<number | string, boolean>();
            recipients.forEach((recipient: NotificationRecipientResponse) => {
                const notifId = recipient.notification_id || recipient.notification?.notification_id;
                if (notifId) {
                    readStatusMap.set(notifId, recipient.is_read === true);
                }
            });

            const mappedNotifications = result.data.map((notif: NotificationResponse) => {
                const notifId = notif.notification_id;
                const isRead = readStatusMap.get(notifId) || false;
                return {
                    ...notif,
                    is_read: isRead,
                };
            });

            setNotifications(mappedNotifications);
            setTotal(result.total || result.data.length);

            // Dynamically fetch names for classes not in classMap
            const missingClassIds = [...new Set(
                mappedNotifications
                    .filter(n => n.scope === 'class' && n.scope_id && !classMap[String(n.scope_id)])
                    .map(n => String(n.scope_id))
            )];

            if (missingClassIds.length > 0) {

                const newMapping = { ...classMap };
                await Promise.all(missingClassIds.map(async (id) => {
                    try {
                        const classData = await getClassById(id);
                        newMapping[id] = classData.name;
                    } catch (err) {
                        console.error(`Failed to fetch class name for ${id}:`, err);
                        newMapping[id] = `#${id}`;
                    }
                }));
                setClassMap(newMapping);
            }
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            message.error("Không thể tải danh sách thông báo");
        } finally {
            setLoading(false);
        }
    }, [userId, page, searchText, activeTab, classMap]);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId, fetchNotifications]);

    const handleFastRefresh = () => {
        const hide = message.loading("Đang làm mới thông báo...", 0);
        fetchNotifications().finally(() => {
            hide();
            message.success("Đã cập nhật thông báo mới nhất");
        });
    };

    const handleMarkAsRead = async (notificationId: number | string) => {
        if (!userId) return;
        try {
            await markNotificationAsRead(notificationId, userId);
            setNotifications((prev) => prev.map((n) =>
                n.notification_id === notificationId ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const handleNotificationClick = (item: NotificationItem) => {
        setSelectedNotification(item);
        setModalOpen(true);
        if (!item.is_read) {
            handleMarkAsRead(item.notification_id);
        }
    };

    const formatCardTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${hours}:${minutes} • ${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    const getScopeTag = (item: NotificationItem) => {
        const { scope, scope_id } = item;
        switch (scope) {
            case 'all':
                return (
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                        Hệ thống
                    </span>
                );
            case 'class':
                const className = scope_id ? classMap[String(scope_id)] : null;
                return (
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                        {className ? `Lớp: ${className}` : (scope_id ? `Lớp: #${scope_id}` : "Lớp học")}
                    </span>
                );
            case 'user':
                return (
                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                        Cá nhân
                    </span>
                );
            default:
                return (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                        {scope}
                    </span>
                );
        }
    };

    return (
        <App>
            <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
                <div className="container mx-auto px-4 py-12">
                    {/* Header: Centered like Events Page */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4 transition-colors duration-300 flex items-center justify-center gap-3">
                            Thông báo
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
                            Xem và quản lý tất cả thông báo của bạn một cách nhanh chóng
                        </p>
                        <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
                    </div>

                    {/* Filters: Like Events Page */}
                    <div className="mb-12 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <CustomInput
                                placeholder="Tìm kiếm thông báo..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                wrapperClassName="flex-1 w-full"
                            />
                            <CustomSelect
                                placeholder="Tất cả thông báo"
                                value={activeTab}
                                onChange={(val) => { setActiveTab(val || "all"); setPage(1); }}
                                options={[
                                    { label: "Tất cả", value: "all" },
                                    { label: "Chưa đọc", value: "unread" },
                                ]}
                                wrapperClassName="w-full md:w-64"
                                allowClear
                            />
                            <button
                                onClick={handleFastRefresh}
                                disabled={loading}
                                className="h-10 px-6 bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 whitespace-nowrap min-w-[150px]"
                            >
                                <SyncOutlined spin={loading} />
                                Làm mới nhanh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <NotificationsSkeleton />
                    ) : notifications.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-3">
                                {notifications.map((item) => (
                                    <NotificationCard
                                        key={item.notification_id}
                                        item={item}
                                        onClick={handleNotificationClick}
                                        getScopeTag={getScopeTag}
                                    />
                                ))}
                            </div>

                            {total > pageSize && (
                                <DarkPagination
                                    current={page}
                                    total={total}
                                    pageSize={pageSize}
                                    onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="mt-12"
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <Empty description={<span className="text-slate-500 dark:text-slate-400 text-lg">Không tìm thấy thông báo nào</span>} />
                        </div>
                    )}
                </div>

                {/* Modal matched to NotificationBell modal structure */}
                <NotificationDetailModal
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    notification={selectedNotification}
                    classMap={classMap}
                />
            </main>
        </App>
    );
}
