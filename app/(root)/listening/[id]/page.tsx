"use client";

import ListeningDetailSkeleton from "@/app/components/features/listening/ListeningDetailSkeleton";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import AudioPlayer from "@/app/components/features/listening/AudioPlayer";
import InputArea from "@/app/components/features/listening/InputArea";
import { useListeningAudio } from "@/app/hooks/useListeningAudio";
import { useListeningChallenge } from "@/app/hooks/useListeningChallenge";
import { useListeningProgress } from "@/app/hooks/useListeningProgress";
import { useListeningLessonDetailQuery } from "@/app/hooks/queries/useListeningQuery";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FaKeyboard } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

export default function ListeningPage() {
  const params = useParams();
  const router = useRouter();

  // Extract lessonId once - stable value
  const lessonId = useMemo(() => {
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
    return id ? parseInt(id, 10) : null;
  }, [params?.id]);

  const lessonIdStr = useMemo(() => {
    return Array.isArray(params?.id) ? params.id[0] : params?.id;
  }, [params?.id]);

  // Data State
  // Fetch Data via React Query
  const { data, isLoading: loading, error } = useListeningLessonDetailQuery(lessonIdStr);
  const challenges = data || [];
  const lessonInfo = challenges.length > 0 && challenges[0].lesson ? challenges[0].lesson : null;
  const dataReady = challenges.length > 0;

  // UI State
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Progress Restore State
  const [pendingRestoreTime, setPendingRestoreTime] = useState<number | null>(null);

  // Handle Query Errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching lesson:", error);
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải bài học");
    }
  }, [error]);

  // Challenge hook
  const {
    currentIdx,
    setCurrentIdx,
    userInput,
    feedback,
    currentHistory,
    history,
    handleInputChange,
    checkAnswer,
    skipSentence,
    resetStateForIndex,
  } = useListeningChallenge(challenges);

  const currentChallengeData = challenges[currentIdx];

  // Audio hook
  const {
    audioRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata: originalHandleLoadedMetadata,
    handleAudioEnded,
    changeSpeed,
    formatTime,
  } = useListeningAudio({
    audioSrc: currentChallengeData?.audioSrc_challenges || "",
    playbackSpeed,
  });

  // Stable callback for restoring time via audio metadata
  const handleLoadedMetadata = useCallback(() => {
    originalHandleLoadedMetadata();
    if (pendingRestoreTime !== null) {
      if (audioRef.current) {
        audioRef.current.currentTime = pendingRestoreTime;
      }
      setCurrentTime(pendingRestoreTime);
      setPendingRestoreTime(null);
    }
  }, [originalHandleLoadedMetadata, pendingRestoreTime, audioRef, setCurrentTime]);

  // Stable callback for setCurrentTime used by progress hook
  const handleRestoreTime = useCallback((time: number) => {
    setPendingRestoreTime(time);
  }, []);

  // Progress Hook - only activate after data is ready
  useListeningProgress({
    lessonId: dataReady ? lessonId : null,
    currentIdx,
    currentTime,
    setCurrentIdx,
    setCurrentTime: handleRestoreTime,
    totalChallenges: challenges.length,
  });

  // Reset state when index changes
  useEffect(() => {
    resetStateForIndex(currentIdx);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  // Handle speed change
  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const newSpeed = changeSpeed(speeds);
    setPlaybackSpeed(newSpeed);
  }, [changeSpeed]);

  // Handle audio seek
  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, [setCurrentTime, audioRef]);

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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {lessonInfo ? lessonInfo.name : "Học Nghe"}
                </h1>
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

          <div className="space-y-6">
            {/* Shortcuts Bar */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FaKeyboard className="text-xl" />
                <span className="font-semibold">Phím tắt</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono border border-slate-300 dark:border-slate-600">
                  Enter
                </kbd>
                <span>Kiểm tra / Tiếp tục</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-bold font-mono border border-slate-300 dark:border-slate-600">
                  Ctrl
                </kbd>
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
            {currentChallengeData && (
              <AudioPlayer
                audioRef={audioRef}
                audioSrc={currentChallengeData.audioSrc_challenges}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackSpeed={playbackSpeed}
                onTogglePlay={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                onChangeSpeed={handleSpeedChange}
                onSeek={handleSeek}
                formatTime={formatTime}
              />
            )}

            {/* Input Area */}
            {currentChallengeData && (
              <InputArea
                userInput={userInput}
                feedback={feedback}
                currentChallengeContent={currentChallengeData.content_challenges}
                currentChallengeTranslation={currentChallengeData.translateText_challenges}
                currentHistorySubmittedInput={currentHistory.submittedInput}
                onInputChange={handleInputChange}
                onCheck={checkAnswer}
                onSkip={skipSentence}
              />
            )}
          </div>
        </div>
      </div>
    </RouteErrorBoundary>
  );
}
