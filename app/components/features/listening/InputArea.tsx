"use client";

import { FaCheck } from "react-icons/fa";
import { IoMdSkipForward } from "react-icons/io";
import MaskedText from "./MaskedText";

interface InputAreaProps {
  userInput: string;
  feedback: "none" | "correct" | "incorrect";
  currentChallengeContent: string;
  currentChallengeTranslation?: string;
  currentHistorySubmittedInput: string;
  onInputChange: (value: string) => void;
  onCheck: () => void;
  onSkip: () => void;
}

/**
 * Input Area Component for Listening Practice
 */
export default function InputArea({
  userInput,
  feedback,
  currentChallengeContent,
  currentChallengeTranslation,
  currentHistorySubmittedInput,
  onInputChange,
  onCheck,
  onSkip,
}: InputAreaProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full block"></span>
          Nghe và gõ lại câu:
        </h3>
      </div>

      <div className="relative group">
        <textarea
          className={`w-full p-5 text-lg bg-white dark:bg-[#1e293b] border-2 rounded-xl focus:outline-none transition-all resize-none shadow-inner
            ${
              feedback === "correct"
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-200"
                : feedback === "incorrect"
                  ? "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500/50 focus:bg-slate-50 dark:focus:bg-[#253248] text-slate-800 dark:text-slate-200"
            }
          `}
          rows={3}
          placeholder="Nhập câu bạn nghe được..."
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onCheck();
            }
          }}
        />
        <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${userInput ? "opacity-100" : "opacity-0"}`}>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Press Enter ↵</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCheck}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 flex items-center gap-2 border border-emerald-500/50"
        >
          <FaCheck /> Kiểm tra
        </button>
        <button
          onClick={onSkip}
          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all transform active:scale-95 flex items-center gap-2 border border-slate-300 dark:border-slate-600"
        >
          Bỏ qua <IoMdSkipForward />
        </button>
      </div>

      {/* Hint / Result Area */}
      <div className={`transition-all duration-500 ease-in-out`}>
        <div
          className={`
            relative overflow-hidden rounded-2xl p-6 min-h-[100px] flex flex-col items-center justify-center border-2
            ${
              feedback === "correct"
                ? "bg-white dark:bg-[#1e293b] border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
                : "bg-white dark:bg-[#1e293b] border-slate-300 dark:border-slate-700 border-dashed"
            }
          `}
        >
          <div className="text-xl md:text-2xl font-medium text-center tracking-wide relative z-10 transition-all">
            <MaskedText
              text={currentChallengeContent}
              revealed={feedback === "correct"}
              userInput={currentHistorySubmittedInput}
            />
          </div>

          {/* Translation appearing effect */}
          {feedback === "correct" && (
            <div className="mt-4 text-center text-slate-500 dark:text-slate-400 italic font-light animate-in fade-in slide-in-from-bottom-2 duration-700">
              {currentChallengeTranslation || "Không có dịch nghĩa"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
