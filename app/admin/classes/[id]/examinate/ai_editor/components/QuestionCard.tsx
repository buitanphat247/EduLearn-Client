"use client";

import React, { memo } from "react";
import { Typography } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { RagQuestion } from "@/lib/api/rag-exams";
import CustomCard from "@/app/components/common/CustomCard";

const { Text } = Typography;

interface QuestionCardProps {
  question: RagQuestion;
  index: number;
  onSelectAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

const QuestionCard = memo(({ question, index, onSelectAnswer, disabled = false }: QuestionCardProps) => {
  return (
    <CustomCard padding="none" className="overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 relative transition-colors duration-200">
        <div className="shrink-0">
          <div className="w-9 h-9 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600 rounded-lg text-sm flex items-center justify-center font-black">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <Text className="text-base text-gray-800 dark:text-gray-100 leading-relaxed block max-w-[95%] font-medium">{question.content}</Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.options.map((opt, i) => {
              const char = String.fromCharCode(65 + i);
              const isCorrect = question.correct_answer === char;

              return (
                <div
                  key={i}
                  onClick={disabled ? undefined : () => onSelectAnswer(question.id, char)}
                  className={`px-3 py-2.5 rounded-lg border flex items-center gap-2 w-full transition-all ${
                    disabled
                      ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                      : isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 cursor-pointer"
                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 cursor-pointer"
                  }`}
                >
                  <span className={`text-sm font-black ${isCorrect ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"}`}>{char}.</span>
                  <span
                    className={`text-base flex-1 ${isCorrect ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-gray-600 dark:text-gray-300"}`}
                  >
                    {opt}
                  </span>
                  {isCorrect && <CheckCircleFilled className="text-emerald-500 text-sm" />}
                </div>
              );
            })}
          </div>

          {question.explanation && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Mô tả</span>
              <Text className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{question.explanation}</Text>
            </div>
          )}
        </div>
      </div>
    </CustomCard>
  );
});

QuestionCard.displayName = "QuestionCard";

export default QuestionCard;
