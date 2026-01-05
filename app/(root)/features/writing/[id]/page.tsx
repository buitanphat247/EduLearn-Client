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

export default function WritingPracticePage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const id = params?.id as string;

  const [data, setData] = useState<WritingGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false); // Toggle to show/hide transcript in right panel
  const [showTranslation, setShowTranslation] = useState(false); // Toggle to show Vietnamese translation in transcript
  const [revealedWordIndices, setRevealedWordIndices] = useState<Set<number>>(new Set()); // Track which word indices are revealed for current sentence

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
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

  // Format time - memoized
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Memoized formatted time display
  const formattedTime = useMemo(() => formatTime(timeElapsed), [formatTime, timeElapsed]);

  // Load data - fetch from API if history_id (number), or from sessionStorage if UUID (newly created)
  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy ID bài luyện tập");
      router.push("/features/writing");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      // Check if ID is a number (history_id from database) or UUID string (newly created)
      const isHistoryId = /^\d+$/.test(id);

      if (isHistoryId) {
        // Fetch from API for history items
        try {
          const historyId = parseInt(id, 10);
          const response = await getWritingHistoryById(historyId);

          if (response.status === 200 && response.data) {
            // Map response data to WritingGenerateResponse format
            // response.data.data contains the WritingGenerateResponse fields
            const historyData = response.data;
            const contentData = historyData.data; // nested data field
            const mappedData: WritingGenerateResponse = {
              id: contentData.id || id.toString(), // Use UUID from content data or history_id as fallback
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

            // Restore current_index to continue from where user left off
            if (historyData.current_index !== undefined && typeof historyData.current_index === "number") {
              setCurrentSentenceIndex(historyData.current_index);
            }

            if (process.env.NODE_ENV === "development") {
              console.log("Loaded writing history with ID:", id);
              console.log("Restored current_index:", historyData.current_index);
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
        // Load from sessionStorage for newly created items (UUID)
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

            if (process.env.NODE_ENV === "development") {
              console.log("Loaded writing data from sessionStorage with ID:", id);
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

  // Auto-scroll to active sentence
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSentenceIndex]);

  // Reset revealed words when sentence index changes
  useEffect(() => {
    setRevealedWordIndices(new Set());
  }, [currentSentenceIndex]);

  // Memoized toggle handlers
  const toggleHint = useCallback(() => setShowHint((prev) => !prev), []);
  const toggleTranscript = useCallback(() => setShowTranscript((prev) => !prev), []);
  const toggleTranslation = useCallback(() => setShowTranslation((prev) => !prev), []);

  // Memoized sentence lists to prevent re-renders
  const memoizedVietnameseSentences = useMemo(() => data?.vietnameseSentences || [], [data?.vietnameseSentences]);
  const memoizedEnglishSentences = useMemo(() => data?.englishSentences || [], [data?.englishSentences]);

  // Memoized current sentence values
  const currentSentence = useMemo(() => data?.vietnameseSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);
  const currentEnglishSentence = useMemo(() => data?.englishSentences[currentSentenceIndex] || "", [data, currentSentenceIndex]);

  // Memoized handleCheck with proper dependencies
  const handleCheck = useCallback(() => {
    if (!userTranslation.trim()) {
      message.warning("Vui lòng nhập bản dịch của bạn");
      return;
    }

    if (!data) return;

    // Get target english sentence and clean it
    const targetSentence = data.englishSentences[currentSentenceIndex] || "";
    // Remove Speaker prefix (e.g. "Hoa: Hello" -> "Hello")
    const targetContent = targetSentence.includes(":") ? targetSentence.split(":").slice(1).join(":").trim() : targetSentence;

    // Normalization for comparison - remove punctuation (. ? , ! ; :) for easier typing
    const normalizedInput = userTranslation
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "") // Remove punctuation
      .replace(/\s+/g, " ")
      .trim();
    const normalizedTarget = targetContent
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "") // Remove punctuation
      .replace(/\s+/g, " ")
      .trim();

    if (normalizedInput === normalizedTarget) {
      // Mark current sentence as completed
      setCompletedSentences((prev) => new Set(prev).add(currentSentenceIndex));
      
      // Reveal all words in the current sentence after successful check
      const targetWords = targetContent.split(/\s+/);
      const allIndices = new Set<number>();
      for (let i = 0; i < targetWords.length; i++) {
        allIndices.add(i);
      }
      setRevealedWordIndices(allIndices);
      
      message.success("Chính xác!");

      // Auto move to next sentence after a delay
      setTimeout(async () => {
        if (currentSentenceIndex < (data.totalSentences || 0) - 1) {
          const nextIndex = currentSentenceIndex + 1;
          
          // Check if ID is a number (history_id from database) - only update API for history items
          const isHistoryId = /^\d+$/.test(id);
          
          // Update current_index on server if this is a history item
          if (isHistoryId) {
            try {
              const historyId = parseInt(id, 10);
              await updateWritingHistoryIndex(historyId, nextIndex);
              
              if (process.env.NODE_ENV === "development") {
                console.log(`Updated current_index to ${nextIndex} for history_id: ${historyId}`);
              }
            } catch (error: any) {
              console.error("Error updating current_index:", error);
              // Don't show error message to user - just log it, allow them to continue
              // The progress will be saved next time they check
            }
          } else {
            // For UUID (newly created), update sessionStorage
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
          setRevealedWordIndices(new Set()); // Reset revealed words for next sentence
        } else {
          // If this is the last sentence, also update index to mark as completed
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
      // On incorrect answer, check and reveal only the correct words
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

      // Merge with previously revealed indices
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
      <DarkConfigProvider>
        <WritingPracticeSkeleton />
      </DarkConfigProvider>
    );
  }

  if (!data) {
    return (
      <DarkConfigProvider>
        <main className="bg-[#0f172a] flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-lg mb-4">Không tìm thấy dữ liệu bài luyện</p>
            <Button type="primary" onClick={() => router.push("/features/writing")}>
              Quay lại
            </Button>
          </div>
        </main>
      </DarkConfigProvider>
    );
  }

  return (
    <DarkConfigProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#3b82f6",
            colorBgContainer: "#1e293b",
            colorBorder: "#334155",
          },
        }}
      >
        <main className="bg-[#0f172a] py-8 text-slate-200">
          <div className="container mx-auto ">
            {/* Header & Breadcrumb matched to Flashcard page */}
            <div className="mb-8">
              <div className="mb-6 bg-[#1e293b] border border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2">
                <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Trang chủ
                </Link>
                <span className="text-slate-600">/</span>
                <Link href="/features/writing" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Luyện viết
                </Link>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300 font-medium">Hội thoại song ngữ</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Hội thoại song ngữ</h1>
                  <div className="flex items-center gap-4 text-slate-400">
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
                  size="small"
                  className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 hover:scale-105 h-9 px-4"
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
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-xl overflow-hidden relative">
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
                                ${
                                  isActive
                                    ? "bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-100 scale-100 z-10 ring-1 ring-blue-500/30"
                                    : isCompleted
                                    ? "bg-emerald-900/10 border-emerald-500/20 opacity-70 grayscale-[0.3] hover:opacity-100 transition-opacity"
                                    : "bg-slate-900/20 border-slate-800/30 opacity-40 blur-[1px] scale-[0.98] grayscale select-none pointer-events-none"
                                }
                              `}
                            >
                              <div
                                className={`text-base leading-relaxed break-words ${
                                  isActive ? "text-slate-100" : isCompleted ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                <span
                                  className={`text-sm font-bold mr-2 ${
                                    isActive ? "text-blue-400" : isCompleted ? "text-emerald-500" : "text-slate-600"
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
                <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden h-full flex flex-col">
                  {/* Header with Toggle Buttons */}
                  <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-[#1e293b] gap-3">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <span className="text-blue-500">📝</span> Transcript
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={toggleTranscript}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${
                          showTranscript
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {showTranscript ? "👁️‍🗨️" : "👁️"} Transcript
                      </button>
                      <button
                        onClick={toggleTranslation}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${
                          showTranslation
                            ? "bg-orange-600 border-orange-500 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        🌐 Dịch
                      </button>
                    </div>
                  </div>

                  {/* Transcript Content */}
                  <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {memoizedEnglishSentences.map((sentence, index) => {
                      const isCurrent = index === currentSentenceIndex;
                      const isRevealed = index < currentSentenceIndex || showTranscript || completedSentences.has(index);

                      const parts = sentence.split(":");
                      const speaker = parts[0]?.trim() || "";
                      const content = parts.slice(1).join(":").trim();

                      // Get corresponding Vietnamese sentence
                      const vietnameseSentence = memoizedVietnameseSentences[index] || "";
                      const vietnameseParts = vietnameseSentence.split(":");
                      const vietnameseContent = vietnameseParts.slice(1).join(":").trim();

                      // For current sentence, use revealedWordIndices from state (updated after check)
                      // For revealed sentences, show full text
                      const wordIndicesForCurrent = isCurrent ? revealedWordIndices : new Set<number>();

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                            isCurrent
                              ? "border-blue-500/50 bg-blue-900/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                              : "border-slate-700/50 bg-[#243146] opacity-70"
                          }`}
                        >
                          {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

                          <div className={`text-lg font-medium leading-relaxed font-sans break-words ${isCurrent ? "text-blue-300" : "text-slate-500"}`}>
                            <span className={`text-sm font-bold mr-2 ${isCurrent ? "text-blue-400" : "text-slate-500"}`}>
                              {speaker}:
                            </span>
                            {isRevealed ? <span>{content}</span> : <MaskedText text={content} revealedWordIndices={wordIndicesForCurrent} />}
                          </div>

                          {showTranslation && vietnameseContent && (
                            <div className="mt-3 text-sm text-slate-400 border-t border-slate-700/50 pt-2 italic">{vietnameseContent}</div>
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
                  className={`flex items-center justify-center border-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    showHint
                      ? "bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/20"
                      : "bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700"
                  }`}
                  title="Gợi ý"
                />

                {/* Hint Tooltip */}
                {showHint && currentEnglishSentence && (
                  <div className="absolute bottom-full left-0 mb-4 w-[300px] max-w-[80vw] bg-slate-800 border border-amber-500/30 rounded-2xl p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-amber-400 font-extrabold mb-3 text-xs uppercase tracking-widest">
                      <BulbOutlined /> Gợi ý dịch
                    </div>
                    <div className="text-slate-200 text-base leading-relaxed font-medium font-serif italic border-l-2 border-amber-500/50 pl-4 py-1">
                      "{currentEnglishSentence}"
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-slate-800 border-r border-b border-amber-500/30 rotate-45"></div>
                  </div>
                )}
              </div>

              {/* Center Input */}
              <div className="relative flex-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-3xl shadow-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-blue-500/10">
                <Input.TextArea
                  placeholder="Nhập bản dịch..."
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  autoSize={{ minRows: 1, maxRows: 5 }}
                  className="w-full bg-transparent! border-none! shadow-none! px-5! py-3.5! text-base! md:text-lg! text-slate-200 placeholder:text-slate-600 resize-none! font-medium "
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleCheck();
                  }}
                />
                <div className="absolute bottom-1 right-5 text-[10px] text-slate-600 font-bold tracking-wider opacity-60 pointer-events-none select-none hidden sm:block">
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
    </DarkConfigProvider>
  );
}
