"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Empty, App } from "antd";
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useNotificationsQuery } from "@/app/hooks/queries/useNotificationQuery";
import { getClassesByUser, getClassById } from "@/lib/api/classes";
import { useQueryClient } from "@tanstack/react-query";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import CustomSelect from "@/app/components/common/CustomSelect";
import NotificationsSkeleton from "@/app/components/notifications/NotificationsSkeleton";
import NotificationCard, { NotificationItem } from "@/app/components/notifications/NotificationCard";
import NotificationDetailModal from "@/app/components/notifications/NotificationDetailModal";


export default function NotificationsPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const { userId, loading: userIdLoading } = useUserId();

    const initialPage = Number(searchParams.get("page")) || 1;
    const initialTab = searchParams.get("tab") || "all";
    const initialSearch = searchParams.get("search") || "";

    const [page, setPage] = useState(initialPage);
    const [searchText, setSearchText] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState(initialTab);
    const debouncedSearchQuery = useDebounce(searchText, 500);
    const pageSize = 12;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [classMap, setClassMap] = useState<Record<string, string>>({});
    const classMapRef = useRef<Record<string, string>>({});

    // Sync state changes to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        if (page > 1) {
            if (params.get("page") !== String(page)) { params.set("page", String(page)); changed = true; }
        } else if (params.has("page")) { params.delete("page"); changed = true; }

        if (activeTab !== "all") {
            if (params.get("tab") !== activeTab) { params.set("tab", activeTab); changed = true; }
        } else if (params.has("tab")) { params.delete("tab"); changed = true; }

        if (debouncedSearchQuery) {
            if (params.get("search") !== debouncedSearchQuery) { params.set("search", debouncedSearchQuery); changed = true; }
        } else if (params.has("search")) { params.delete("search"); changed = true; }

        if (changed) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [page, activeTab, debouncedSearchQuery, pathname, router, searchParams]);

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
                classMapRef.current = mapping;
                setClassMap(mapping);
            } catch (e) {
                // Silently handle — classMap will show fallback IDs
            }
        };
        fetchClasses();
    }, [userId, userIdLoading]);

    // React Query
    const queryParams: any = {
        page,
        limit: pageSize,
        search: debouncedSearchQuery || undefined,
    };
    if (activeTab === "unread") {
        queryParams.is_read = false;
    }

    const {
        data: notificationsData,
        isLoading: notificationsLoading,
        isRefetching,
        refetch,
    } = useNotificationsQuery(userId, queryParams);

    const notifications = notificationsData?.data || [];
    const total = notificationsData?.total || 0;
    const loading = notificationsLoading || (!notifications.length && isRefetching);

    // Fetch missing class names for notifications directly inside useEffect watching the data
    useEffect(() => {
        if (!notifications.length) return;

        const fetchMissingClasses = async () => {
            const currentMap = classMapRef.current;
            const missingClassIds = [...new Set(
                notifications
                    .filter((n: any) => n.scope === 'class' && n.scope_id && !currentMap[String(n.scope_id)])
                    .map((n: any) => String(n.scope_id))
            )];

            if (missingClassIds.length > 0) {
                const newMapping: Record<string, string> = { ...currentMap };
                await Promise.all(missingClassIds.map(async (id) => {
                    const strId = String(id);
                    try {
                        const classData = await getClassById(strId);
                        newMapping[strId] = classData.name;
                    } catch {
                        newMapping[strId] = `#${strId}`;
                    }
                }));
                classMapRef.current = newMapping;
                setClassMap(newMapping);
            }
        };

        fetchMissingClasses();
    }, [notifications]);

    const handleFastRefresh = () => {
        const hide = message.loading("Đang làm mới thông báo...", 0);
        refetch().finally(() => {
            hide();
            message.success("Đã cập nhật thông báo mới nhất");
        });
    };

    const handleMarkAsRead = async (notificationId: number | string) => {
        if (!userId) return;
        try {
            await markNotificationAsRead(notificationId, userId);
            refetch(); // Simply refetch to let React Query sync state seamlessly
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

    const formatCardTime = useCallback((dateString: string) => {
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
    }, []);

    const getScopeTag = useCallback((item: NotificationItem) => {
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
    }, [classMap]);

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
                    <div className="mb-12 mx-auto">
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
