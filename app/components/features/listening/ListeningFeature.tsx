"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { App, Empty } from "antd";
import { getLessons, resetListeningProgress, type Lesson } from "@/lib/api/lessons";
import { useQueryClient } from "@tanstack/react-query";
import { useListeningLessonsQuery, listeningKeys } from "@/app/hooks/queries/useListeningQuery";
import { ReloadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { useTheme } from "@/app/context/ThemeContext";
import LessonCard from "@/app/components/listening/LessonCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import CustomSelect from "@/app/components/common/CustomSelect";
import ListeningFeatureSkeleton from "./ListeningFeatureSkeleton";

const LEVEL_OPTIONS = [
  { label: "A1", value: "A1" },
  { label: "A2", value: "A2" },
  { label: "B1", value: "B1" },
  { label: "B2", value: "B2" },
  { label: "C1", value: "C1" },
  { label: "C2", value: "C2" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

const LANGUAGE_OPTIONS = [
  { label: "Tiếng Anh", value: "en" },
  { label: "Tiếng Việt", value: "vi" },
  { label: "Tiếng Pháp", value: "fr" },
  { label: "Tiếng Đức", value: "de" },
  { label: "Tiếng Tây Ban Nha", value: "es" },
] as const;

const PAGE_SIZE = 20;

export default function ListeningFeature() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [resetting, setResetting] = useState(false);

  // ✅ Keep state synced with URL over page reloads
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLevel = searchParams.get("level") || undefined;
  const initialLanguage = searchParams.get("language") || undefined;
  const initialSearch = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(initialLevel);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(initialLanguage);
  const [searchText, setSearchText] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);

  // ✅ Auto sync state changes back to URL silently without full page scroll/reload
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (currentPage > 1) {
      if (params.get("page") !== String(currentPage)) { params.set("page", String(currentPage)); changed = true; }
    } else if (params.has("page")) { params.delete("page"); changed = true; }

    if (selectedLevel) {
      if (params.get("level") !== selectedLevel) { params.set("level", selectedLevel); changed = true; }
    } else if (params.has("level")) { params.delete("level"); changed = true; }

    if (selectedLanguage) {
      if (params.get("language") !== selectedLanguage) { params.set("language", selectedLanguage); changed = true; }
    } else if (params.has("language")) { params.delete("language"); changed = true; }

    if (debouncedSearchQuery) {
      if (params.get("search") !== debouncedSearchQuery) { params.set("search", debouncedSearchQuery); changed = true; }
    } else if (params.has("search")) { params.delete("search"); changed = true; }

    if (changed) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, selectedLevel, selectedLanguage, debouncedSearchQuery, pathname, router, searchParams]);

  // Use React Query hooks
  const {
    data: lessonsResult,
    isLoading: lessonsLoading,
    isRefetching,
    error,
    refetch,
  } = useListeningLessonsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearchQuery || undefined,
    level: selectedLevel,
    language: selectedLanguage,
  });

  const lessons = lessonsResult?.data || [];
  const total = lessonsResult?.total || 0;
  const loading = lessonsLoading || (!lessons.length && isRefetching);

  // Handle errors from query
  useEffect(() => {
    if (error) {
      console.error("Error fetching lessons:", error);
      message.error(error instanceof Error ? error.message : "Không thể tải danh sách lessons");
    }
  }, [error, message]);

  const handleReset = useCallback(async () => {
    const isDark = theme === "dark";

    const result = await Swal.fire({
      title: "Đặt lại tiến trình?",
      text: "Toàn bộ tiến trình luyện nghe sẽ bị xóa. Hành động này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: isDark ? "#475569" : "#94a3b8",
      confirmButtonText: "Đặt lại ngay",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
      background: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#f8fafc" : "#1e293b",
    });

    if (!result.isConfirmed) return;

    try {
      setResetting(true);
      await resetListeningProgress();

      await Swal.fire({
        title: "Thành công!",
        text: "Tiến trình luyện nghe đã được đặt lại.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f8fafc" : "#1e293b",
      });

      // ✅ Invalidate ALL listening caches (lessons list + detail pages)
      queryClient.invalidateQueries({ queryKey: listeningKeys.all });
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể đặt lại tiến trình. Vui lòng thử lại.",
        icon: "error",
        confirmButtonColor: isDark ? "#3b82f6" : "#2563eb",
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f8fafc" : "#1e293b",
      });
    } finally {
      setResetting(false);
    }
  }, [queryClient, theme]);

  // Debounce search - skip on mount
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);



  const handleLevelChange = useCallback((value: string | undefined) => {
    setSelectedLevel(value);
    setCurrentPage(1);
  }, []);

  const handleLanguageChange = useCallback((value: string | undefined) => {
    setSelectedLanguage(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      {/* Search and Filters */}
      <div className="mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <CustomInput
            placeholder="Tìm kiếm bài học..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            wrapperClassName="flex-1 w-full"
          />
          <CustomSelect
            placeholder="Chọn cấp độ"
            value={selectedLevel}
            onChange={handleLevelChange}
            options={[...LEVEL_OPTIONS]}
            wrapperClassName="w-full md:w-48"
            allowClear
          />
          <CustomSelect
            placeholder="Chọn ngôn ngữ"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={[...LANGUAGE_OPTIONS]}
            wrapperClassName="w-full md:w-48"
            allowClear
          />
          <button
            onClick={handleReset}
            disabled={resetting}
            className={`
              h-10 px-4 rounded-lg
              bg-white dark:bg-[#1e293b]
              border border-red-200 dark:border-red-900/50
              text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300
              hover:bg-red-50 dark:hover:bg-red-900/20
              shadow-sm shadow-red-500/5 dark:shadow-black/20
              focus:outline-none focus:ring-2 focus:ring-red-500/20
              transition-all duration-200
              flex items-center justify-center gap-2
              shrink-0 font-medium text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <ReloadOutlined className={resetting ? "animate-spin" : ""} />
            <span>Đặt lại tiến trình</span>
          </button>
        </div>
      </div>

      {loading ? (
        <ListeningFeatureSkeleton />
      ) : lessons.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {lessons.map((lesson: Lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                name={lesson.name}
                level={lesson.level}
                language={lesson.language}
                challengeCount={lesson.challengeCount}
                practiceCount={lesson.practiceCount}
                audioSrc={lesson.audioSrc}
                progressInfo={lesson.progressInfo}
              />
            ))}
          </div>

          {total > PAGE_SIZE && (
            <DarkPagination
              current={currentPage}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={handlePageChange}
              showTotal={(total, range) => (
                <span className="text-slate-600 dark:text-slate-300">
                  {range[0]}-{range[1]} của {total} bài học
                </span>
              )}
            />
          )}
        </>
      ) : (
        <div className="py-20 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed transition-colors duration-300">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-slate-500 dark:text-slate-400 text-lg">
                {debouncedSearchQuery || selectedLevel || selectedLanguage
                  ? "Không tìm thấy bài học nào phù hợp"
                  : "Chưa có bài học nào"}
              </span>
            }
          />
        </div>
      )}
    </div>
  );
}
