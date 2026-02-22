"use client";

import { FileTextOutlined, DownloadOutlined, UserOutlined, CalendarOutlined, BarChartOutlined } from "@ant-design/icons";
import { message } from "antd";
import type { DocumentResponse } from "@/lib/api/documents";

interface DocumentCardProps {
    document: DocumentResponse;
}

export default function DocumentCard({ document }: DocumentCardProps) {
    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!document.file_url) {
            message.error("Tài liệu không có liên kết tải về");
            return;
        }
        window.open(document.file_url, "_blank");
    };

    const formattedDate = new Date(document.created_at).toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700/50 h-full flex flex-col transition-all duration-300 hover:shadow-blue-500/20 hover:-translate-y-1 relative group hover:border-blue-500/30">
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-0 left-0 right-0 z-10"></div>

            <div className="p-6 flex-1 flex flex-col">
                {/* Header: Icon & ID */}
                <div className="flex justify-between items-start mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FileTextOutlined className="text-2xl" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest backdrop-blur-sm">
                        Admin
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={document.title}>
                    {document.title}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <CalendarOutlined className="text-xs" />
                        <span className="text-xs">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 justify-end">
                        <BarChartOutlined className="text-xs" />
                        <span className="text-xs">{document.download_count || 0} lượt tải</span>
                    </div>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    className="mt-auto w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e293b]"
                >
                    <DownloadOutlined className="text-base group-hover:scale-110 transition-transform" />
                    <span>Tải tài liệu</span>
                </button>
            </div>
        </div>
    );
}
