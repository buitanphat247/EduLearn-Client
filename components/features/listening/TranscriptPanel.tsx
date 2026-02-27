"use client";

import { FaListAlt, FaEye, FaEyeSlash, FaLanguage } from "react-icons/fa";
import MaskedText from "./MaskedText";

interface Challenge {
  id_challenges: number;
  content_challenges: string;
  translateText_challenges?: string;
}

interface ChallengeHistory {
  input: string;
  feedback: "none" | "correct" | "incorrect";
  submittedInput: string;
}

interface TranscriptPanelProps {
  challenges: Challenge[];
  currentIdx: number;
  history: Record<number, ChallengeHistory>;
  showAppTranscript: boolean;
  showAppTranslation: boolean;
  onToggleTranscript: () => void;
  onToggleTranslation: () => void;
}

/**
 * Transcript Panel Component - Shows all challenges with reveal logic
 */
export default function TranscriptPanel({
  challenges,
  currentIdx,
  history,
  showAppTranscript,
  showAppTranslation,
  onToggleTranscript,
  onToggleTranslation,
}: TranscriptPanelProps) {
  return (
    <div className="lg:col-span-5 h-[calc(100vh-8rem)] sticky top-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-[#1e293b] gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
            <FaListAlt className="text-blue-500" /> Transcript
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleTranscript}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${
                showAppTranscript
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {showAppTranscript ? <FaEyeSlash /> : <FaEye />} Transcript
            </button>
            <button
              onClick={onToggleTranslation}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${
                showAppTranslation
                  ? "bg-orange-600 border-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <FaLanguage /> Dịch
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {challenges.map((s, idx) => {
            const isCurrent = idx === currentIdx;
            const itemHistory = history[idx] || { feedback: "none", submittedInput: "" };
            const isRevealed = idx < currentIdx || showAppTranscript || itemHistory.feedback === "correct";

            return (
              <div
                key={s.id_challenges}
                className={`p-4 rounded-xl border transition-all relative overflow-hidden
                  ${
                    isCurrent
                      ? "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                      : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#243146] opacity-90 dark:opacity-70"
                  }
                `}
              >
                {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

                <div
                  className={`text-lg font-medium leading-relaxed font-sans
                    ${isCurrent ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-500"}
                  `}
                >
                  <MaskedText text={s.content_challenges} revealed={isRevealed} userInput={itemHistory.submittedInput} />
                </div>
                {showAppTranslation && (
                  <div className="mt-3 text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700/50 pt-2 italic">
                    {s.translateText_challenges}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
