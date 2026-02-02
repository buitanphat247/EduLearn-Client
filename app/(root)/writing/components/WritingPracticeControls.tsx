"use client";

import { memo } from "react";

interface MaskedTextProps {
  text: string;
  revealedWordIndices?: Set<number>;
}

const MaskedText = memo(({ text, revealedWordIndices = new Set<number>() }: MaskedTextProps) => {
  const words = text.split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        if (revealedWordIndices.has(idx)) {
          return <span key={idx}>{word} </span>;
        }
        return (
          <span key={idx} className="font-mono tracking-widest text-blue-400">
            {word.replace(/[a-zA-Z0-9]/g, "*")}{" "}
          </span>
        );
      })}
    </span>
  );
}, (prevProps, nextProps) => {
  if (prevProps.text !== nextProps.text) return false;

  const prevIndices = prevProps.revealedWordIndices || new Set<number>();
  const nextIndices = nextProps.revealedWordIndices || new Set<number>();

  if (prevIndices.size !== nextIndices.size) return false;

  for (const idx of prevIndices) {
    if (!nextIndices.has(idx)) return false;
  }
  for (const idx of nextIndices) {
    if (!prevIndices.has(idx)) return false;
  }

  return true;
});

MaskedText.displayName = "MaskedText";

interface WritingPracticeControlsProps {
  englishSentences: string[];
  vietnameseSentences: string[];
  currentSentenceIndex: number;
  showTranscript: boolean;
  showTranslation: boolean;
  completedSentences: Set<number>;
  revealedWordIndices: Set<number>;
  onToggleTranscript: () => void;
  onToggleTranslation: () => void;
}

export default function WritingPracticeControls({
  englishSentences,
  vietnameseSentences,
  currentSentenceIndex,
  showTranscript,
  showTranslation,
  completedSentences,
  revealedWordIndices,
  onToggleTranscript,
  onToggleTranslation,
}: WritingPracticeControlsProps) {
  return (
    <div className="lg:col-span-5 max-h-[500px] sticky top-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col transition-colors duration-300">
        {/* Header with Toggle Buttons */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#1e293b] gap-3 transition-colors">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <span className="text-blue-500">📝</span> Transcript
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleTranscript}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${showTranscript
                ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white"
                }`}
            >
              {showTranscript ? "👁️‍🗨️" : "👁️"} Transcript
            </button>
            <button
              onClick={onToggleTranslation}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${showTranslation
                ? "bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white"
                }`}
            >
              🌐 Dịch
            </button>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {englishSentences.map((sentence, index) => {
            const isCurrent = index === currentSentenceIndex;
            const isRevealed = index < currentSentenceIndex || showTranscript || completedSentences.has(index);

            const parts = sentence.split(":");
            const speaker = parts[0]?.trim() || "";
            const content = parts.slice(1).join(":").trim();

            const vietnameseSentence = vietnameseSentences[index] || "";
            const vietnameseParts = vietnameseSentence.split(":");
            const vietnameseContent = vietnameseParts.slice(1).join(":").trim();

            const wordIndicesForCurrent = isCurrent ? revealedWordIndices : new Set<number>();

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all relative overflow-hidden ${isCurrent
                  ? "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#243146] opacity-70"
                  }`}
              >
                {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

                <div className={`text-lg font-medium leading-relaxed font-sans wrap-break-word ${isCurrent ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-500"}`}>
                  <span className={`text-sm font-bold mr-2 ${isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>
                    {speaker}:
                  </span>
                  {isRevealed ? <span>{content}</span> : <MaskedText text={content} revealedWordIndices={wordIndicesForCurrent} />}
                </div>

                {showTranslation && vietnameseContent && (
                  <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/50 pt-2 italic">{vietnameseContent}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
