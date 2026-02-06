"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, message, Empty, App, Modal, Tag } from "antd";
import {
    CalendarOutlined, SyncOutlined
} from "@ant-design/icons";
import {
    getNotificationsByUserId,
    markNotificationAsRead,
    getNotificationRecipientsByUserId,
    type NotificationResponse,
    type NotificationRecipientResponse
} from "@/lib/api/notifications";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { useRouter } from "next/navigation";
import { getClassesByUser, getClassById } from "@/lib/api/classes";
import { useTheme } from "@/app/context/ThemeContext";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import CustomSelect from "@/app/components/common/CustomSelect";
import NotificationsSkeleton from "@/app/components/notifications/NotificationsSkeleton";

// const { Title, Text, Paragraph } = Typography;
const { Text, Paragraph } = Typography;

interface NotificationItem extends NotificationResponse {
    is_read?: boolean;
    read_at?: string | null;
}

export default function NotificationsPage() {
    const router = useRouter();
    useTheme();

    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [userId, setUserId] = useState<number | string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
    const [classMap, setClassMap] = useState<Record<string, string>>({});

    // Filters
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const pageSize = 12;

    // Get currentUser ID
    useEffect(() => {
        const uid = getUserIdFromCookie();
        if (uid) {
            setUserId(uid);
            const fetchClasses = async () => {
                try {
                    const result = await getClassesByUser({ userId: uid, limit: 100 });
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
        } else {
            router.push("/auth");
        }
    }, [router]);

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

    const formatModalDate = (dateString: string) => {
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

    const getScopeInfo = (scope: string) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
            all: { color: "orange", text: "Hệ thống" },
            user: { color: "cyan", text: "Cá nhân" },
            class: { color: "geekblue", text: "Lớp học" },
        };
        return scopeMap[scope] || { color: "blue", text: scope };
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notifications.map((item) => (
                                    <div
                                        key={item.notification_id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`group relative bg-white dark:bg-[#1e293b] rounded-[32px] p-8 transition-all duration-300 flex flex-col h-full border border-slate-200 dark:border-slate-700 cursor-pointer hover:-translate-y-1`}
                                    >
                                        <div className="flex-1 flex flex-col">
                                            {/* Top Pin Tag */}
                                            <div className="flex items-center gap-2 mb-6">
                                                {getScopeTag(item)}
                                                {!item.is_read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                                )}
                                            </div>

                                            <div className="min-h-[100px]">
                                                <h3 className={`text-xl font-bold mb-3 leading-snug transition-colors line-clamp-2 ${!item.is_read ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {item.title}
                                                </h3>

                                                <Paragraph className="!mb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                                                    {item.message}
                                                </Paragraph>
                                            </div>

                                            {/* Footer with Divider: Matches Image */}
                                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/50">
                                                        <span className="text-sm font-bold uppercase">
                                                            {(item.creator?.fullname || "H")[0]}
                                                        </span>
                                                    </div>
                                                    <Text className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {item.creator?.fullname || "Hệ thống"}
                                                    </Text>
                                                </div>
                                                <Text className="text-xs text-slate-400 italic">
                                                    {formatCardTime(item.created_at)}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
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
                <Modal
                    title={<span className="font-bold text-slate-800 dark:text-white">Chi tiết thông báo</span>}
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    footer={null}
                    width={700}
                    centered
                    destroyOnHidden={true}
                    styles={{
                        mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }
                    }}
                >
                    {selectedNotification && (
                        <div className="space-y-5 pt-2">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Tiêu đề</label>
                                <div className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{selectedNotification.title}</div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Nội dung</label>
                                <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {selectedNotification.message}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Phạm vi</label>
                                    <Tag className="px-3 py-0.5 rounded-md font-bold text-[10px] border-none m-0" color={getScopeInfo(selectedNotification.scope).color}>
                                        {getScopeInfo(selectedNotification.scope).text.toUpperCase()}
                                    </Tag>
                                </div>

                                {selectedNotification.scope_id && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                                                {selectedNotification.scope === "user" ? "Mã cá nhân" : "Tên lớp học"}
                                            </label>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {selectedNotification.scope === "class"
                                                    ? (classMap[String(selectedNotification.scope_id)] || "Đang tải...")
                                                    : `#${selectedNotification.scope_id}`
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                                                {selectedNotification.scope === "user" ? "ID" : "Mã lớp"}
                                            </label>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                #{selectedNotification.scope_id}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {selectedNotification.creator && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Người tạo</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50">
                                            {(selectedNotification.creator.fullname || "H")[0]}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-800 dark:text-white">
                                            {selectedNotification.creator.fullname || selectedNotification.creator.username}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                                        <CalendarOutlined className="text-blue-500" /> Ngày tạo
                                    </label>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                                        {formatModalDate(selectedNotification.created_at)}
                                    </div>
                                </div>

                                {selectedNotification.updated_at && (
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                                            <CalendarOutlined className="text-orange-500" /> Cập nhật
                                        </label>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                                            {formatModalDate(selectedNotification.updated_at)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </main>
        </App>
    );
}
