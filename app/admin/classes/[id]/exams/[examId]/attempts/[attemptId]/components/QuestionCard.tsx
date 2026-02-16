"use client";

import { Card, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { AttemptDetailQuestion } from "@/lib/api/exam-attempts";

const { Text } = Typography;

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_KEYS = ["answer_a", "answer_b", "answer_c", "answer_d"] as const;

function getOptionText(q: AttemptDetailQuestion, key: string): string {
  const idx = OPTION_LABELS.indexOf(key as (typeof OPTION_LABELS)[number]);
  if (idx < 0) return "";
  const k = OPTION_KEYS[idx];
  return (q as any)[k] || "";
}

interface QuestionCardProps {
  q: AttemptDetailQuestion;
  index: number;
}

export default function QuestionCard({ q, index }: QuestionCardProps) {
  const isCorrect = q.is_correct;
  const studentAnswer = q.student_answer;
  const correctAnswer = q.correct_answer;

  const options = OPTION_KEYS.map((key, i) => ({
    key: OPTION_LABELS[i],
    text: getOptionText(q, OPTION_LABELS[i]),
  })).filter((o) => o.text);

  return (
    <div>
      <Card
        size="small"
        className={`mb-4 border-l-4 shadow-sm ${isCorrect
            ? "border-l-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20"
            : "border-l-rose-600 bg-rose-50/30 dark:bg-rose-950/20"
          } bg-white dark:bg-gray-800`}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap gap-1">
            <Tag
              className={`font-bold border-2 ${isCorrect ? "bg-emerald-500 text-white border-emerald-600" : "bg-rose-500 text-white border-rose-600"
                }`}
            >
              {isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />} Câu {index + 1}{" "}
              {isCorrect ? "ĐÚNG" : "SAI"}
            </Tag>
            <Tag className="font-semibold">
              Điểm: {q.earned_score}/{q.score}
            </Tag>
          </div>
          {!isCorrect && correctAnswer && studentAnswer && (
            <div className="shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
                <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  HS chọn: {studentAnswer}
                </span>
                <span className="text-gray-400 dark:text-gray-500">→</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  Đáp án đúng: {correctAnswer}
                </span>
              </div>
            </div>
          )}
        </div>
        <div
          className="prose prose-sm dark:prose-invert max-w-none mb-4 text-gray-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: q.content || "" }}
        />
        {/* Hiển thị tất cả ô đáp án - chỉ highlight đáp án học sinh chọn */}
        <div className="space-y-2 mb-3">
          {options.map((opt) => {
            const isStudentChoice = opt.key === studentAnswer;
            const bgClass = isStudentChoice
              ? isCorrect
                ? "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 dark:border-emerald-600"
                : "bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-500 dark:border-rose-600"
              : "bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600";
            return (
              <div
                key={opt.key}
                className={`px-3 py-2.5 rounded-lg ${bgClass} flex items-center gap-2 font-medium`}
              >
                <span
                  className={`font-bold w-6 shrink-0 ${isStudentChoice
                      ? isCorrect
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                      : "text-gray-600 dark:text-gray-400"
                    }`}
                >
                  {opt.key}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: opt.text }} className="flex-1" />
                {isStudentChoice &&
                  (isCorrect ? (
                    <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 shrink-0 text-lg" />
                  ) : (
                    <CloseCircleOutlined className="text-rose-600 dark:text-rose-400 shrink-0 text-lg" />
                  ))}
              </div>
            );
          })}
        </div>
        {q.explanation && (
          <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <Text strong className="text-blue-700 dark:text-blue-300 text-xs uppercase">
              Giải thích:
            </Text>
            <div
              className="mt-1 text-sm text-blue-900 dark:text-blue-200"
              dangerouslySetInnerHTML={{ __html: q.explanation }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
