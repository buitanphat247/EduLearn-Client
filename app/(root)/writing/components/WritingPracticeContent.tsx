"use client";

import { useRef, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";

interface WritingPracticeContentProps {
  vietnameseSentences: string[];
  currentSentenceIndex: number;
  contentType: "DIALOGUE" | "PARAGRAPH";
}

export default function WritingPracticeContent({
  vietnameseSentences,
  currentSentenceIndex,
  contentType,
}: WritingPracticeContentProps) {
  const activeSentenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSentenceIndex]);

  const isParagraph = contentType === "PARAGRAPH";

  return (
    <div className="lg:col-span-7 space-y-6">
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden relative transition-colors duration-300">
        <div className="p-4 h-[500px] overflow-y-auto custom-scrollbar scroll-smooth">
          <div className={isParagraph ? "px-2 py-4 leading-loose" : "space-y-4 px-2 py-4"}>
            {vietnameseSentences.map((sentence, index) => {
              const isActive = index === currentSentenceIndex;
              const isCompleted = index < currentSentenceIndex;

              /* ─── PARAGRAPH: inline text, no blur, highlight active ─── */
              if (isParagraph) {
                return (
                  <span
                    key={index}
                    ref={isActive ? activeSentenceRef as React.RefObject<HTMLSpanElement> : null}
                    className={`
                      inline text-base font-medium transition-all duration-300 cursor-default
                      ${isActive
                        ? "bg-amber-100 dark:bg-amber-900/30 text-slate-800 dark:text-slate-100 rounded px-1 ring-2 ring-amber-400/50"
                        : isCompleted
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-slate-600 dark:text-slate-300"
                      }
                    `}
                  >
                    {sentence}
                    {isCompleted && <CheckOutlined className="text-xs text-emerald-500 ml-1" />}
                    {" "}
                  </span>
                );
              }

              /* ─── DIALOGUE: chat bubbles with speaker ─── */
              const colonIndex = sentence.indexOf(":");
              const speaker = colonIndex > -1 ? sentence.substring(0, colonIndex).trim() : "";
              const content = colonIndex > -1 ? sentence.substring(colonIndex + 1).trim() : sentence;

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
                      {speaker && (
                        <span
                          className={`text-sm font-bold mr-2 ${isActive ? "text-blue-600 dark:text-blue-400" : isCompleted ? "text-emerald-600 dark:text-emerald-500" : "text-slate-500 dark:text-slate-600"
                            }`}
                        >
                          {speaker}:
                          {isCompleted && <CheckOutlined className="text-xs ml-1" />}
                        </span>
                      )}
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
