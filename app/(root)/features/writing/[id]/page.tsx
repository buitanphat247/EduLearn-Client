"use client";

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Button, Input, Spin, ConfigProvider, theme } from "antd";
import { ClockCircleOutlined, CheckOutlined, BulbOutlined, AudioOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
  generateWritingContent,
  getWritingHistoryById,
  updateWritingHistoryIndex,
  type WritingGenerateResponse,
} from "@/lib/api/writing";
import DarkConfigProvider from "@/app/components/common/DarkConfigProvider";
import WritingPracticeSkeleton from "@/app/components/features/writing/WritingPracticeSkeleton";

// Utility function: normalize text for comparison - move outside component to prevent recreation
const normalizeForComparison = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[.,!?;:]/g, "") // Remove common punctuation
    .replace(/\s+/g, " ")
    .trim();
};

// Memoized MaskedText Component
const MaskedText = memo(({ text, revealedWordIndices = new Set<number>() }: { text: string; revealedWordIndices?: Set<number> }) => {
  // Split target text into words
  const words = text.split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        // Only reveal if this word index is in the revealed set
        if (revealedWordIndices.has(idx)) {
          return <span key={idx}>{word} </span>;
        }

        // Otherwise, mask the word
        return (
          <span key={idx} className="font-mono tracking-widest text-blue-400">
            {word.replace(/[a-zA-Z0-9]/g, "*")}{" "}
          </span>
        );
      })}
    </span>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if text or revealedWordIndices changed
  if (prevProps.text !== nextProps.text) return false;

  const prevIndices = prevProps.revealedWordIndices || new Set<number>();
  const nextIndices = nextProps.revealedWordIndices || new Set<number>();

  if (prevIndices.size !== nextIndices.size) return false;

  // Check if any indices are different
  for (const idx of prevIndices) {
    if (!nextIndices.has(idx)) return false;
  }
  for (const idx of nextIndices) {
    if (!prevIndices.has(idx)) return false;
  }

  return true; // Props are equal, skip re-render
});

MaskedText.displayName = "MaskedText";

// ... imports
import { useTheme } from "@/app/context/ThemeContext";

// ... (keep utility functions and MaskedText component same)

export default function WritingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const { theme: currentTheme } = useTheme();
  const id = params?.id as string;

  // ... (keep existing state and logic)

  const [data, setData] = useState<WritingGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ... (keep useEffects and callbacks same)
  useEffect(() => {
    if (!loading) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formattedTime = useMemo(() => formatTime(timeElapsed), [formatTime, timeElapsed]);

  // ... (keep data loading logic same)
  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy ID bài luyện tập");
      router.push("/features/writing");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const isHistoryId = /^\d+$/.test(id);

      if (isHistoryId) {
        try {
          const historyId = parseInt(id, 10);
          const response = await getWritingHistoryById(historyId);

          if (response.status === 200 && response.data) {
            const historyData = response.data;
            const contentData = historyData.data;
            const mappedData: WritingGenerateResponse = {
              id: contentData.id || id.toString(),
              language: contentData.language || "English",
              contentType: contentData.contentType || "DIALOGUE",
              difficulty: contentData.difficulty || 2,
              englishSentences: contentData.englishSentences || [],
              vietnameseSentences: contentData.vietnameseSentences || [],
              totalSentences: contentData.totalSentences || 0,
              userPoints: contentData.userPoints || 0,
              practiceType: contentData.practiceType || null,
              topic: contentData.topic || "",
            };

            setData(mappedData);

            if (historyData.current_index !== undefined && typeof historyData.current_index === "number") {
              setCurrentSentenceIndex(historyData.current_index);
            }
          } else {
            message.error(response.message || "Không tìm thấy dữ liệu bài luyện");
            router.push("/features/writing");
          }
        } catch (error: any) {
          console.error("Error fetching history:", error);
          message.error(error?.message || "Không thể tải dữ liệu bài luyện");
          router.push("/features/writing");
        }
      } else {
        const storedData = sessionStorage.getItem(`writing_${id}`);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            const mappedData: WritingGenerateResponse = {
              id: parsed.id || id,
              language: parsed.language || "English",
              contentType: parsed.contentType || "DIALOGUE",
              difficulty: parsed.difficulty || 2,
              englishSentences: parsed.englishSentences || [],
              vietnameseSentences: parsed.vietnameseSentences || [],
              totalSentences: parsed.totalSentences || 0,
              userPoints: parsed.userPoints || 0,
              practiceType: parsed.practiceType || null,
              topic: parsed.topic || "",
            };

            setData(mappedData);

            if (parsed.current_index !== undefined && typeof parsed.current_index === "number") {
              setCurrentSentenceIndex(parsed.current_index);
            }
          } catch (e) {
            console.error("Error parsing stored data:", e);
            message.error("Không thể tải dữ liệu bài luyện");
            router.push("/features/writing");
          }
        } else {
          message.error("Không tìm thấy dữ liệu bài luyện. Vui lòng chọn lại từ danh sách.");
          router.push("/features/writing");
        }
      }
      setLoading(false);
    };

    loadData();
  }, [id, router, message]);

  const activeSentenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSentenceIndex]);

  useEffect(() => {
    setRevealedWordIndices(new Set());
  }, [currentSentenceIndex]);

  const toggleHint = useCallback(() => setShowHint((prev) => !prev), []);
  const toggleTranscript = useCallback(() => setShowTranscript((prev) => !prev), []);
  const toggleTranslation = useCallback(() => setShowTranslation((prev) => !prev), []);

  const memoizedVietnameseSentences = useMemo(() => data?.vietnameseSentences || [], [data?.vietnameseSentences]);
  const memoizedEnglishSentences = useMemo(() => data?.englishSentences || [], [data?.englishSentences]);

  const currentSentence = useMemo(() => data?.vietnameseSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);
  const currentEnglishSentence = useMemo(() => data?.englishSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);

  const handleCheck = useCallback(() => {
    if (!userTranslation.trim()) {
      message.warning("Vui lòng nhập bản dịch của bạn");
      return;
    }

    if (!data) return;

    const targetSentence = data.englishSentences[currentSentenceIndex] || "";
    const targetContent = targetSentence.includes(":") ? targetSentence.split(":").slice(1).join(":").trim() : targetSentence;

    const normalizedInput = userTranslation
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const normalizedTarget = targetContent
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (normalizedInput === normalizedTarget) {
      setCompletedSentences((prev) => new Set(prev).add(currentSentenceIndex));

      const targetWords = targetContent.split(/\s+/);
      const allIndices = new Set<number>();
      for (let i = 0; i < targetWords.length; i++) {
        allIndices.add(i);
      }
      setRevealedWordIndices(allIndices);

      message.success("Chính xác!");

      setTimeout(async () => {
        if (currentSentenceIndex < (data.totalSentences || 0) - 1) {
          const nextIndex = currentSentenceIndex + 1;
          const isHistoryId = /^\d+$/.test(id);

          if (isHistoryId) {
            try {
              const historyId = parseInt(id, 10);
              await updateWritingHistoryIndex(historyId, nextIndex);
            } catch (error: any) {
              console.error("Error updating current_index:", error);
            }
          } else {
            const storedData = sessionStorage.getItem(`writing_${id}`);
            if (storedData) {
              try {
                const parsed = JSON.parse(storedData);
                parsed.current_index = nextIndex;
                sessionStorage.setItem(`writing_${id}`, JSON.stringify(parsed));
              } catch (e) {
                console.error("Error updating sessionStorage:", e);
              }
            }
          }

          setCurrentSentenceIndex(nextIndex);
          setUserTranslation("");
          setShowHint(false);
          setRevealedWordIndices(new Set());
        } else {
          const isHistoryId = /^\d+$/.test(id);
          if (isHistoryId) {
            try {
              const historyId = parseInt(id, 10);
              const finalIndex = data.totalSentences || 0;
              await updateWritingHistoryIndex(historyId, finalIndex);
            } catch (error: any) {
              console.error("Error updating final current_index:", error);
            }
          }

          message.success("Bạn đã hoàn thành bài luyện tập!");
        }
      }, 1000);
    } else {
      const targetWords = targetContent.split(/\s+/);
      const userWords = userTranslation.trim().split(/\s+/);
      const newRevealedIndices = new Set<number>();

      targetWords.forEach((targetWord, idx) => {
        const cleanTarget = normalizeForComparison(targetWord);
        const cleanInput = userWords[idx] ? normalizeForComparison(userWords[idx]) : "";

        if (cleanTarget === cleanInput && cleanTarget.length > 0) {
          newRevealedIndices.add(idx);
        }
      });

      setRevealedWordIndices((prev) => {
        const merged = new Set(prev);
        newRevealedIndices.forEach((idx) => merged.add(idx));
        return merged;
      });

      message.error("Chưa chính xác, hãy thử lại!");
    }
  }, [userTranslation, data, currentSentenceIndex, id, message]);

  if (loading) {
    return (
      <WritingPracticeSkeleton />
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center transition-colors duration-500">
        <div className="text-center text-slate-800 dark:text-white">
          <p className="text-lg mb-4">Không tìm thấy dữ liệu bài luyện</p>
          <Button type="primary" onClick={() => router.push("/features/writing")}>
            Quay lại
          </Button>
        </div>
      </main>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorBgContainer: currentTheme === "dark" ? "#1e293b" : "#ffffff",
          colorBorder: currentTheme === "dark" ? "#334155" : "#e2e8f0",
        },
      }}
    >
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
        <div className="container mx-auto px-4">
          {/* Header & Breadcrumb matched to Flashcard page */}
          <div className="mb-8">
            <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Trang chủ
              </Link>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <Link href="/features/writing" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                Luyện viết
              </Link>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Hội thoại song ngữ</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">Hội thoại song ngữ</h1>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span className="font-mono">{formattedTime}</span>
                  </div>
                  <span>•</span>
                  <div>
                    Câu {currentSentenceIndex + 1}/{data.totalSentences}
                  </div>
                </div>
              </div>

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/features/writing")}
                size="middle"
                className="!flex !items-center !gap-2 !bg-white dark:!bg-slate-800 !text-slate-700 dark:!text-slate-300 !border !border-slate-200 dark:!border-slate-700 hover:!border-blue-500 hover:!text-blue-600 dark:hover:!text-blue-400 !shadow-sm hover:!shadow-md !rounded-lg !px-5 !h-10 transition-all duration-300"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>

          {/* Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - Vietnamese Sentences (Main Content) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dialogue Display */}
              <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl overflow-hidden relative transition-colors duration-300">
                <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar scroll-smooth">
                  <div className="space-y-4 px-2 py-4">
                    {memoizedVietnameseSentences.map((sentence, index) => {
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

            {/* RIGHT COLUMN - Transcript Panel */}
            <div className="lg:col-span-5  max-h-[500px] sticky top-4">
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col transition-colors duration-300">
                {/* Header with Toggle Buttons */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#1e293b] gap-3 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-blue-500">📝</span> Transcript
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleTranscript}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${showTranscript
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white"
                        }`}
                    >
                      {showTranscript ? "👁️‍🗨️" : "👁️"} Transcript
                    </button>
                    <button
                      onClick={toggleTranslation}
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
                  {memoizedEnglishSentences.map((sentence, index) => {
                    const isCurrent = index === currentSentenceIndex;
                    const isRevealed = index < currentSentenceIndex || showTranscript || completedSentences.has(index);

                    const parts = sentence.split(":");
                    const speaker = parts[0]?.trim() || "";
                    const content = parts.slice(1).join(":").trim();

                    const vietnameseSentence = memoizedVietnameseSentences[index] || "";
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
          </div>

          {/* Input Area - Full Width Below Columns */}
          <div className="mt-6 flex items-center gap-3">
            {/* Hint Button (Outside Left) */}
            <div className="relative pb-1">
              <Button
                shape="circle"
                icon={<BulbOutlined />}
                onClick={toggleHint}
                className={`flex items-center justify-center border-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${showHint
                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                title="Gợi ý"
              />

              {/* Hint Tooltip */}
              {showHint && currentEnglishSentence && (
                <div className="absolute bottom-full left-0 mb-4 w-[300px] max-w-[80vw] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold mb-3 text-xs uppercase tracking-widest">
                    <BulbOutlined /> Gợi ý dịch
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 text-base leading-relaxed font-medium font-serif italic border-l-2 border-amber-500/50 pl-4 py-1">
                    "{currentEnglishSentence}"
                  </div>
                  {/* Arrow */}
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-amber-200 dark:border-amber-500/30 rotate-45"></div>
                </div>
              )}
            </div>

            {/* Center Input */}
            <div className="relative flex-1 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-blue-500/10">
              <Input.TextArea
                placeholder="Nhập bản dịch..."
                value={userTranslation}
                onChange={(e) => setUserTranslation(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 5 }}
                className="w-full bg-transparent! border-none! shadow-none! px-5! py-3.5! text-base! md:text-lg! text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none! font-medium "
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  handleCheck();
                }}
              />
              <div className="absolute bottom-1 right-5 text-[10px] text-slate-400 dark:text-slate-600 font-bold tracking-wider opacity-60 pointer-events-none select-none hidden sm:block">
                SHIFT + ENTER
              </div>
            </div>

            {/* Submit Button (Outside Right) */}
            <div className="pb-1">
              <Button
                type="primary"
                shape="circle"
                onClick={handleCheck}
                icon={<CheckOutlined className="text-xl" />}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-110 active:scale-95 transition-all w-12 h-12 flex items-center justify-center p-0"
              />
            </div>
          </div>
        </div>
      </main>
    </ConfigProvider>
  );
}
