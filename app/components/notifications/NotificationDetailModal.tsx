
import { Modal, Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { NotificationResponse } from "@/lib/api/notifications";

// Extend NotificationResponse to include necessary UI fields if needed, 
// strictly matching what's used in the modal.
export interface NotificationItem extends NotificationResponse {
    is_read?: boolean;
    read_at?: string | null;
}

interface NotificationDetailModalProps {
    open: boolean;
    onCancel: () => void;
    notification: NotificationItem | null;
    classMap?: Record<string, string>;
}

export default function NotificationDetailModal({
    open,
    onCancel,
    notification: selectedNotification,
    classMap = {}
}: NotificationDetailModalProps) {

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

    const getScopeInfo = (scope: string) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
            all: { color: "orange", text: "Hệ thống" },
            user: { color: "cyan", text: "Cá nhân" },
            class: { color: "geekblue", text: "Lớp học" },
        };
        return scopeMap[scope] || { color: "blue", text: scope };
    };

    return (
        <Modal
            title={<span className="font-bold text-slate-800 dark:text-white">Chi tiết thông báo</span>}
            open={open}
            onCancel={onCancel}
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
    );
}
