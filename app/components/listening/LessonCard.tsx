"use client";

import { PlayCircleOutlined, SoundOutlined, TrophyOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LessonCardProps {
  id: number;
  name: string;
  level: string;
  language: string;
  challengeCount: number;
  practiceCount: number | null;
  audioSrc: string;
}

export default function LessonCard({
  id,
  name,
  level,
  language,
  challengeCount,
  practiceCount,
  audioSrc,
}: LessonCardProps) {
  const router = useRouter();
  const getLevelColor = (level: string) => {
    const levelUpper = level.toUpperCase();
    if (levelUpper.startsWith("A1") || levelUpper.startsWith("A2")) {
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    } else if (levelUpper.startsWith("B1") || levelUpper.startsWith("B2")) {
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    } else if (levelUpper.startsWith("C1") || levelUpper.startsWith("C2")) {
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  };

  const getLanguageLabel = (lang: string) => {
    const langMap: Record<string, string> = {
      en: "Tiếng Anh",
      vi: "Tiếng Việt",
      fr: "Tiếng Pháp",
      de: "Tiếng Đức",
      es: "Tiếng Tây Ban Nha",
    };
    return langMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <Link
      href={`/listening/${id}`}
      prefetch={false}
      onMouseEnter={() => router.prefetch(`/listening/${id}`)}
    >
      <div className="group h-full bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-blue-500/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer relative">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getLevelColor(level)}`}>
              {level}
            </span>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500/30 transition-all duration-300">
              <SoundOutlined className="text-lg" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
            {name}
          </h3>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="w-8 flex justify-center">
                <TrophyOutlined className="text-blue-600 dark:text-blue-400" />
              </span>
              <span className="text-slate-700 dark:text-slate-300">
                <span className="font-semibold">{challengeCount}</span> thử thách
              </span>
            </div>
            {practiceCount !== null && practiceCount > 0 && (
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="w-8 flex justify-center">
                  <PlayCircleOutlined className="text-green-600 dark:text-green-400" />
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  Đã luyện tập <span className="font-semibold">{practiceCount}</span> lần
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="w-8 flex justify-center">
                <span className="text-purple-600 dark:text-purple-400">🌐</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300">{getLanguageLabel(language)}</span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white mt-auto">
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Bắt đầu luyện nghe</span>
            <svg
              className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
