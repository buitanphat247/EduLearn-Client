"use client";

import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SoundOutlined } from "@ant-design/icons";
import { VocabularyResponse } from "@/lib/api/vocabulary";

interface QuizQuestionCardProps {
  word: VocabularyResponse;
  options: VocabularyResponse[];
  correctAnswer: number;
  selectedAnswer: number | null;
  hasSubmitted: boolean;
  onAnswerSelect: (index: number) => void;
  onPlayAudio: (audioUrl?: string) => void;
}

/**
 * Quiz Question Card Component
 */
export default function QuizQuestionCard({
  word,
  options,
  correctAnswer,
  selectedAnswer,
  hasSubmitted,
  onAnswerSelect,
  onPlayAudio,
}: QuizQuestionCardProps) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 transition-colors">
          Nghĩa của từ này là gì?
        </h2>

        <div className="flex items-center justify-center gap-4 mb-6">
          <h3 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {word.content}
          </h3>
          {word.audioUrl?.[0]?.url && (
            <Button
              type="text"
              shape="circle"
              icon={<SoundOutlined className="text-xl" />}
              size="large"
              onClick={() => onPlayAudio(word.audioUrl![0].url)}
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
            />
          )}
        </div>

        {word.pronunciation && (
          <p className="text-xl text-slate-500 dark:text-slate-400 font-mono">
            /{word.pronunciation}/
          </p>
        )}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === correctAnswer;
          const isWrong = isSelected && !isCorrect && hasSubmitted;

          let buttonClass = "h-16 w-full text-left px-6 rounded-xl border-2 transition-all duration-200 font-medium text-base ";

          if (hasSubmitted) {
            if (isCorrect) {
              buttonClass += "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/20";
            } else if (isWrong) {
              buttonClass += "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
            } else {
              buttonClass += "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
            }
          } else {
            buttonClass += isSelected
              ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 cursor-pointer";
          }

          return (
            <button
              key={option.sourceWordId}
              onClick={() => onAnswerSelect(index)}
              disabled={hasSubmitted}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1 text-left">{option.translation}</span>
                {hasSubmitted && (
                  <span className="ml-3">
                    {isCorrect ? (
                      <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 text-xl" />
                    ) : isWrong ? (
                      <CloseCircleOutlined className="text-rose-600 dark:text-rose-400 text-xl" />
                    ) : null}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
