import { Typography } from "antd";
import { CalendarOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { NotificationResponse } from "@/lib/api/notifications";

const { Text, Paragraph } = Typography;

export interface NotificationItem extends NotificationResponse {
    is_read?: boolean;
    read_at?: string | null;
}

interface NotificationCardProps {
    item: NotificationItem;
    onClick: (item: NotificationItem) => void;
    getScopeTag: (item: NotificationItem) => React.ReactNode;
}

export default function NotificationCard({ item, onClick, getScopeTag }: NotificationCardProps) {

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

    // Accent color based on scope
    const accentColorClass = item.scope === 'all'
        ? 'bg-amber-500'
        : item.scope === 'class'
            ? 'bg-blue-600'
            : item.scope === 'user'
                ? 'bg-emerald-500'
                : 'bg-slate-500';

    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white dark:bg-[#1e293b] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden p-4 flex items-center gap-4"
        >
            {/* Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColorClass}`} />

            {/* Icon Status */}
            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${!item.is_read
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                <CalendarOutlined className="text-lg" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-bold truncate ${!item.is_read ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {item.title}
                    </h3>
                    <div className="scale-90 origin-left flex-shrink-0">
                        {getScopeTag(item)}
                    </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs truncate pr-4 m-0">
                    {item.message}
                </p>
            </div>

            {/* Meta Info - Desktop */}
            <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 text-right min-w-[140px]">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {item.creator?.fullname || "Hệ thống"}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase">
                        {(item.creator?.fullname || "H")[0]}
                    </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                    {formatCardTime(item.created_at)}
                </span>
            </div>

            {/* Arrow */}
            <div className="pl-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                <ArrowRightOutlined />
            </div>
        </div>
    );
}
