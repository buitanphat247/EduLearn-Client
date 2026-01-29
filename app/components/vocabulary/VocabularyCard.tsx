"use client";

import { BookOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";

interface VocabularyCardProps {
  folderId: number;
  folderName: string;
  href?: string;
}

export default function VocabularyCard({
  folderId,
  folderName,
  href = "#",
}: VocabularyCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700/50 h-full flex flex-col transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:-translate-y-1 relative group-hover:border-blue-500/30">

        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-0 left-0 right-0 z-10"></div>

        {/* Content */}
        <div className="p-6 flex-1 relative flex flex-col">

          {/* Header: Icon & Badge */}
          <div className="flex justify-between items-start mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <BookOutlined className="text-2xl" />
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
              #{folderId}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {folderName}
          </h3>

          {/* Subtext */}
          <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 mb-6 leading-relaxed">
            Học và ôn tập bộ từ vựng chủ đề <span className="text-slate-700 dark:text-slate-400 font-medium">{folderName}</span> cùng các bài tập trắc nghiệm.
          </p>

          {/* Button */}
          <div className="mt-auto">
            <div className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
              <span>Bắt đầu học</span>
              <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
