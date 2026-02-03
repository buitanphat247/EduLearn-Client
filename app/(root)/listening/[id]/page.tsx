"use client";

import ListeningDetailSkeleton from "@/app/components/features/listening/ListeningDetailSkeleton";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaCheck, FaKeyboard, FaLanguage, FaListAlt, FaEllipsisV, FaVolumeUp, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { IoMdSkipForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "antd";
import apiClient from "@/app/config/api";
import { message } from "antd";

// --- Types ---
interface Lesson {
  id: number;
  name: string;
  level: string;
  language: string;
}

interface Challenge {
  id_challenges: number;
  lesson_id: number;
  position_challenges: number;
  content_challenges: string;
  audioSrc_challenges: string;
  timeStart: number;
  timeEnd: number;
  solution_challenges: string[][];
  translateText_challenges: string;
  lesson?: Lesson;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Challenge[];
}

// --- Components ---
const MaskedText = ({ text, revealed, userInput = "" }: { text: string; revealed: boolean; userInput?: string }) => {
  // If the entire sentence is already revealed (completed), just show it.
  if (revealed) return <span>{text}</span>;

  // Split both target text and user input into words
  const words = text.split(" ");
  const userWords = userInput.trim().split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        // Normalize for comparison: remove punctuation, lowercase
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]|_/g, "");
        const cleanTarget = normalize(word);

        // Check if the user has a matching word at the same index
        const cleanInput = userWords[idx] ? normalize(userWords[idx]) : "";

        // It's a match if the cleaned words match
        let isMatch = cleanTarget === cleanInput;

        // Secondary strict check: User input shouldn't have characters NOT in the target (e.g. "november'" vs "November")
        // preventing "november'" (contains ') from matching "November" (has no ')
        if (isMatch && userWords[idx]) {
          const lowerTarget = word.toLowerCase();
          const lowerInput = userWords[idx].toLowerCase();
          // Check if every char in input exists in target (bag of chars check? No, just existence is enough for punctuation usually)
          // Using simple inclusion for efficiency:
          for (const char of lowerInput) {
            if (!lowerTarget.includes(char)) {
              isMatch = false;
              break;
            }
          }
        }

        if (isMatch) {
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
};

export default function ListeningPage() {
  const params = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Data State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [lessonInfo, setLessonInfo] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  // Playback State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Interaction State
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const [showAppTranscript, setShowAppTranscript] = useState(false);
  const [showAppTranslation, setShowAppTranslation] = useState(false);
  const [furthestIdx, setFurthestIdx] = useState(0);

  // State for persistence and reveal logic
  const [history, setHistory] = useState<Record<number, { input: string; feedback: "none" | "correct" | "incorrect"; submittedInput: string }>>({});

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      // Handle params.id which might be undefined initially or array
      const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

      if (!id) return;

      try {
        setLoading(true);
        setChallenges([]); // Clear challenges to prevent stale data
        setLessonInfo(null);
        // Using apiClient configured with /api-proxy
        const response = await apiClient.get<ApiResponse>(`/challenges/by-lesson/${id}`);

        if (response.data?.status && response.data?.data) {
          const sortedData = response.data.data.sort((a, b) => a.position_challenges - b.position_challenges);
          setChallenges(sortedData);
          if (sortedData.length > 0 && sortedData[0].lesson) {
            setLessonInfo(sortedData[0].lesson);
          }
        } else {
          message.error("Không thể tải bài học");
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
        message.error("Có lỗi xảy ra khi tải bài học");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // Derived State
  const currentChallenge = challenges[currentIdx];
  const currentHistory = history[currentIdx] || { input: "", feedback: "none", submittedInput: "" };

  // Reset/Load State on Change Index
  useEffect(() => {
    const savedState = history[currentIdx];
    if (savedState) {
      setUserInput(savedState.input);
      setFeedback(savedState.feedback);
    } else {
      setUserInput("");
      setFeedback("none");
    }

    setIsPlaying(false);
    setCurrentTime(0);

    // If we moved to a new index higher than before, update furthest
    if (currentIdx > furthestIdx) {
      setFurthestIdx(currentIdx);
    }
  }, [currentIdx]); // Removed history from dep to avoid loop, we rely on currentIdx for loading

  // Update history when typing
  const handleInputChange = (val: string) => {
    setUserInput(val);
    setHistory((prev) => ({
      ...prev,
      [currentIdx]: {
        input: val,
        feedback: prev[currentIdx]?.feedback || "none",
        submittedInput: prev[currentIdx]?.submittedInput || "",
      },
    }));
  };

  // Maintain Playback Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [currentIdx, playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Ensure speed is applied once meta loaded
      audioRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const checkAnswer = () => {
    if (!currentChallenge) return;

    // Normalization logic
    const normalizedInput = userInput
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const normalizedTarget = currentChallenge.content_challenges
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    let newFeedback: "correct" | "incorrect" = "incorrect";

    if (normalizedInput === normalizedTarget) {
      newFeedback = "correct";
      message.success("Chính xác!");

      // Auto advance after 1.5 seconds
      if (currentIdx < challenges.length - 1) {
        setTimeout(() => {
          setCurrentIdx((prev) => prev + 1);
        }, 1500);
      } else {
        setTimeout(() => {
          message.success("Chúc mừng! Bạn đã hoàn thành bài học.");
        }, 1000);
      }
    } else {
      newFeedback = "incorrect";
      message.error("Chưa chính xác, hãy thử lại!");
    }

    setFeedback(newFeedback);
    setHistory((prev) => ({
      ...prev,
      [currentIdx]: {
        input: userInput,
        feedback: newFeedback,
        // Reveal partials on check
        submittedInput: userInput,
      },
    }));
  };

  const skipSentence = () => {
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  // --- Render Loading ---
  if (loading) {
    return <ListeningDetailSkeleton />;
  }

  // --- Render Empty ---
  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-500">
        <p>Không tìm thấy nội dung bài học.</p>
      </div>
    );
  }

  return (
    <RouteErrorBoundary routeName="listening">
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500">
      <div className="container mx-auto">
        {/* Header & Breadcrumb */}
        <div className="mb-8">
          <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <Link href="/listening" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Học nghe
            </Link>
            {lessonInfo && (
              <>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{lessonInfo.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{lessonInfo ? lessonInfo.name : "Học Nghe"}</h1>
              <p className="text-slate-500 dark:text-slate-400">
                {challenges.length > 0 ? `Câu ${currentIdx + 1} trên tổng số ${challenges.length} câu` : "Đang tải nội dung bài học..."}
              </p>
            </div>

            <button
              onClick={() => router.push("/listening")}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            >
              <IoArrowBackOutline className="text-lg transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold text-sm">Quay lại danh sách</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - MAIN INTERACTION */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shortcuts Bar */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FaKeyboard className="text-xl" />
                <span className="font-semibold">Phím tắt</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono border border-slate-300 dark:border-slate-600">Enter</kbd>
                <span>Kiểm tra / Tiếp tục</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono border border-slate-300 dark:border-slate-600">Ctrl</kbd>
                <span>Phát lại âm thanh</span>
              </div>
            </div>

            {/* Progress Badge */}
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 shadow-lg shadow-blue-900/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                CÂU {currentIdx + 1}/{challenges.length}
              </span>
            </div>

            {/* Audio Player Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
              {/* Background Glow Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-sky-500 to-indigo-500 opacity-70"></div>

              <audio
                ref={audioRef}
                src={currentChallenge.audioSrc_challenges}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-5">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105 active:scale-95 border-2 border-blue-500/50"
                >
                  {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration || 0.1}
                      step="0.1"
                      value={currentTime}
                      onChange={(e) => {
                        const newVal = Number(e.target.value);
                        setCurrentTime(newVal);
                        if (audioRef.current) audioRef.current.currentTime = newVal;
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <button className="hover:text-blue-500 dark:hover:text-blue-400 transition">
                    <FaVolumeUp />
                  </button>
                  <button className="hover:text-blue-500 dark:hover:text-blue-400 transition">
                    <FaEllipsisV />
                  </button>
                </div>

                <div
                  onClick={changeSpeed}
                  className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition select-none min-w-[80px] text-center"
                >
                  {playbackSpeed}x
                </div>
              </div>
            </div>

            {/* Input Area */}
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
                      ${feedback === "correct"
                      ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-200"
                      : feedback === "incorrect"
                        ? "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200"
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500/50 focus:bg-slate-50 dark:focus:bg-[#253248] text-slate-800 dark:text-slate-200"
                    }
                    `}
                  rows={3}
                  placeholder="Nhập câu bạn nghe được..."
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      checkAnswer();
                    }
                  }}
                />
                <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${userInput ? "opacity-100" : "opacity-0"}`}>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Press Enter ↵</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={checkAnswer}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 flex items-center gap-2 border border-emerald-500/50"
                >
                  <FaCheck /> Kiểm tra
                </button>
                <button
                  onClick={skipSentence}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all transform active:scale-95 flex items-center gap-2 border border-slate-300 dark:border-slate-600"
                >
                  Bỏ qua <IoMdSkipForward />
                </button>
              </div>
            </div>

            {/* Hint / Result Area */}
            <div className={`transition-all duration-500 ease-in-out`}>
              {/* Result Box */}
              <div
                className={`
                      relative overflow-hidden rounded-2xl p-6 min-h-[100px] flex flex-col items-center justify-center border-2
                      ${feedback === "correct"
                    ? "bg-white dark:bg-[#1e293b] border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
                    : "bg-white dark:bg-[#1e293b] border-slate-300 dark:border-slate-700 border-dashed"
                  }
                 `}
              >
                <div className="text-xl md:text-2xl font-medium text-center tracking-wide relative z-10 transition-all">
                  <MaskedText
                    text={currentChallenge.content_challenges}
                    revealed={feedback === "correct"}
                    userInput={currentHistory.submittedInput}
                  />
                </div>

                {/* Translation appearing effect */}
                {feedback === "correct" && (
                  <div className="mt-4 text-center text-slate-500 dark:text-slate-400 italic font-light animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {currentChallenge.translateText_challenges || "Không có dịch nghĩa"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - TRANSCRIPT */}
          <div className="lg:col-span-5 h-[calc(100vh-8rem)] sticky top-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-[#1e293b] gap-3">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <FaListAlt className="text-blue-500" /> Transcript
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAppTranscript(!showAppTranscript)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${showAppTranscript
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
                      }`}
                  >
                    {showAppTranscript ? <FaEyeSlash /> : <FaEye />} Transcript
                  </button>
                  <button
                    onClick={() => setShowAppTranslation(!showAppTranslation)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition border ${showAppTranslation
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
                                    ${isCurrent
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
                        <div className="mt-3 text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700/50 pt-2 italic">{s.translateText_challenges}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RouteErrorBoundary>
  );
}
