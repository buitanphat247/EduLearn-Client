"use client";

import { BookOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VocabularyCardProps {
  folderId: number;
  folderName: string;
  learned_count?: number;
  total_count?: number;
  href?: string;
}

export default function VocabularyCard({
  folderId,
  folderName,
  learned_count = 0,
  total_count = 0,
  href = "#",
}: VocabularyCardProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => router.prefetch(href)}
      className="block h-full group"
    >
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
          <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            Học và ôn tập bộ từ vựng chủ đề <span className="text-slate-700 dark:text-slate-400 font-medium">{folderName}</span> cùng các bài tập trắc nghiệm.
          </p>

          {/* Progress Section - Always visible */}
          <div className="mb-6 p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 shadow-sm">
            <div className="flex justify-between items-end mb-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
                  Tiến độ hoàn thành
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {learned_count} <span className="text-slate-500 dark:text-slate-500 font-medium text-xs">/ {total_count} từ</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">
                  {total_count > 0 ? Math.round((learned_count / total_count) * 100) : 0}<span className="text-[10px] ml-0.5">%</span>
                </div>
              </div>
            </div>

            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-[2px] border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-blue-500 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-shine relative shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ width: `${total_count > 0 ? Math.min(100, Math.round((learned_count / total_count) * 100)) : 0}%` }}
              />
            </div>
          </div>

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
