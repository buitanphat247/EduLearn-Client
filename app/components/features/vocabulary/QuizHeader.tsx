"use client";

import Link from "next/link";
import { Button } from "antd";
import { IoArrowBackOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface QuizHeaderProps {
  folderId: number;
  folderName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  showResult: boolean;
}

/**
 * Quiz Header Component with breadcrumb and title
 */
export default function QuizHeader({
  folderId,
  folderName,
  currentQuestionIndex,
  totalQuestions,
  score,
  showResult,
}: QuizHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <Link href="/vocabulary" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
          Học từ vựng
        </Link>
        {folderName && (
          <>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <Link href={`/vocabulary/${folderId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              {folderName}
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Kiểm tra</span>
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
            Kiểm tra từ vựng <span className="text-slate-400 dark:text-slate-600 font-light">|</span> {folderName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {totalQuestions > 0 && !showResult
              ? `Câu hỏi ${currentQuestionIndex + 1} / ${totalQuestions}`
              : showResult
                ? `Hoàn thành: ${score}/${totalQuestions} câu đúng`
                : "Đang tải câu hỏi..."}
          </p>
        </div>

        <Button
          icon={<IoArrowBackOutline />}
          onClick={() => router.push(`/vocabulary/${folderId}`)}
          size="middle"
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}
