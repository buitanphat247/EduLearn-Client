"use client";

import { useRef, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";

interface WritingPracticeContentProps {
  vietnameseSentences: string[];
  currentSentenceIndex: number;
}

export default function WritingPracticeContent({
  vietnameseSentences,
  currentSentenceIndex,
}: WritingPracticeContentProps) {
  const activeSentenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSentenceIndex]);

  return (
    <div className="lg:col-span-7 space-y-6">
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden relative transition-colors duration-300">
        <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="space-y-4 px-2 py-4">
            {vietnameseSentences.map((sentence, index) => {
              const parts = sentence.split(":");
              const speaker = parts[0]?.trim() || "";
              const content = parts.slice(1).join(":").trim();

              const isActive = index === currentSentenceIndex;
              const isCompleted = index < currentSentenceIndex;

              return (
                <div key={index} className="flex w-full justify-start">
                  <div
                    ref={isActive ? activeSentenceRef : null}
                    className={`
                      relative w-full max-w-3xl rounded-2xl p-4 transition-all duration-500 border-2
                      ${isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-100 scale-100 z-10 ring-1 ring-blue-500/30"
                        : isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/20 opacity-70 grayscale-[0.3] hover:opacity-100 transition-opacity"
                          : "bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/30 opacity-40 blur-[1px] scale-[0.98] grayscale select-none pointer-events-none"
                      }
                    `}
                  >
                    <div
                      className={`text-base leading-relaxed wrap-break-word font-medium ${isActive ? "text-slate-800 dark:text-slate-100" : isCompleted ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      <span
                        className={`text-sm font-bold mr-2 ${isActive ? "text-blue-600 dark:text-blue-400" : isCompleted ? "text-emerald-600 dark:text-emerald-500" : "text-slate-500 dark:text-slate-600"
                          }`}
                      >
                        {speaker}:
                        {isCompleted && <CheckOutlined className="text-xs ml-1" />}
                      </span>
                      <span>{content}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
