"use client";

import { Input, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SoundOutlined, EnterOutlined } from "@ant-design/icons";
import { VocabularyResponse } from "@/lib/api/vocabulary";

interface TypingQuestionCardProps {
  word: VocabularyResponse;
  sentence: string;
  placeholder: string;
  userInput: string;
  hasSubmitted: boolean;
  isCorrect: boolean;
  isChecking: boolean;
  onInputChange: (value: string) => void;
  onCheck: () => void;
  onPlayAudio: (audioUrl?: string) => void;
  inputRef: React.RefObject<any>;
}

/**
 * Typing Question Card Component
 */
export default function TypingQuestionCard({
  word,
  sentence,
  placeholder,
  userInput,
  hasSubmitted,
  isCorrect,
  isChecking,
  onInputChange,
  onCheck,
  onPlayAudio,
  inputRef,
}: TypingQuestionCardProps) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-10">
      {/* Word Info */}
      <div className="text-center mb-8">
        <div className="space-y-4 mb-6">
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{word.translation}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {word.pos && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-wide border border-purple-200 dark:border-purple-500/30">
                {word.pos}
              </span>
            )}
            {word.pronunciation && (
              <span className="text-lg text-slate-500 dark:text-slate-400 font-mono">/{word.pronunciation}/</span>
            )}
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
        </div>
      </div>

      {/* Placeholder Pattern */}
      <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-center text-lg text-slate-400 dark:text-slate-500 font-mono tracking-widest mb-2">
          {placeholder}
        </p>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic">Gõ câu hoàn chỉnh</p>
      </div>

      {/* Input Field */}
      <div className="space-y-4">
        <Input
          ref={inputRef}
          size="large"
          placeholder="Nhập câu của bạn..."
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !isChecking) {
              onCheck();
            }
          }}
          disabled={hasSubmitted || isChecking}
          className={`text-lg h-14 ${
            hasSubmitted
              ? isCorrect
                ? "!border-emerald-500 !bg-emerald-50 dark:!bg-emerald-500/20"
                : "!border-rose-500 !bg-rose-50 dark:!bg-rose-500/20"
              : ""
          }`}
          suffix={
            hasSubmitted ? (
              isCorrect ? (
                <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 text-xl" />
              ) : (
                <CloseCircleOutlined className="text-rose-600 dark:text-rose-400 text-xl" />
              )
            ) : (
              <EnterOutlined className="text-slate-400 text-lg" />
            )
          }
        />

        {hasSubmitted && !isCorrect && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/30">
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">Đáp án đúng:</p>
            <p className="text-base text-rose-700 dark:text-rose-300 font-semibold">{sentence}</p>
          </div>
        )}

        {hasSubmitted && isCorrect && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircleOutlined /> Chính xác!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
