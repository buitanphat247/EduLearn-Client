"use client";

import { Button, Result } from "antd";
import { TrophyOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface QuizResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBack: () => void;
}

/**
 * Quiz Result Card Component
 */
export default function QuizResultCard({ score, totalQuestions, onRestart, onBack }: QuizResultCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-12">
      <Result
        icon={<TrophyOutlined style={{ color: score >= totalQuestions * 0.7 ? "#f59e0b" : "#3b82f6" }} />}
        title={
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {score >= totalQuestions * 0.7
              ? "Xuất sắc! 🎉"
              : score >= totalQuestions * 0.5
                ? "Tốt lắm! 👍"
                : "Cố gắng thêm nhé! 💪"}
          </span>
        }
        subTitle={
          <div className="space-y-2">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Bạn đã trả lời đúng <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> /{" "}
              <span className="font-bold">{totalQuestions}</span> câu hỏi
            </p>
            <p className="text-slate-500 dark:text-slate-500">
              Tỷ lệ đúng: <span className="font-semibold">{Math.round((score / totalQuestions) * 100)}%</span>
            </p>
          </div>
        }
        extra={[
          <Button
            key="restart"
            type="primary"
            icon={<ReloadOutlined />}
            size="large"
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 border-0 shadow-lg shadow-blue-500/30"
          >
            Làm lại
          </Button>,
          <Button key="back" size="large" onClick={onBack} className="border-slate-300 dark:border-slate-600">
            Quay lại danh sách
          </Button>,
        ]}
      />
    </div>
  );
}
