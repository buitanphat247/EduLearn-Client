"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { ClockCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";

interface WritingPracticeHeaderProps {
  formattedTime: string;
  currentSentenceIndex: number;
  totalSentences: number;
  contentType: "DIALOGUE" | "PARAGRAPH";
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  DIALOGUE: "Hội thoại song ngữ",
  PARAGRAPH: "Đoạn văn song ngữ",
};

export default function WritingPracticeHeader({
  formattedTime,
  currentSentenceIndex,
  totalSentences,
  contentType,
}: WritingPracticeHeaderProps) {
  const router = useRouter();
  const label = CONTENT_TYPE_LABELS[contentType] || CONTENT_TYPE_LABELS.DIALOGUE;

  return (
    <div className="mb-8">
      <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <Link href="/writing" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
          Luyện viết
        </Link>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">{label}</h1>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined />
              <span className="font-mono">{formattedTime}</span>
            </div>
            <span>•</span>
            <div>
              Câu {currentSentenceIndex + 1}/{totalSentences}
            </div>
          </div>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/writing")}
          size="middle"
          className="flex! items-center! gap-2! bg-white! dark:bg-slate-800! text-slate-700! dark:text-slate-300! border! border-slate-200! dark:border-slate-700! hover:border-blue-500! hover:text-blue-600! dark:hover:text-blue-400! shadow-sm! hover:shadow-md! rounded-lg! px-5! h-10! transition-all duration-300"
        >
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
