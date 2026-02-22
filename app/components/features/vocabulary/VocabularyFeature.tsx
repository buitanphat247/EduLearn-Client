"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { App, Empty } from "antd";
import { BarChartOutlined, ReloadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { useTheme } from "@/app/context/ThemeContext";
import {
  getFolders,
  getVocabularyGroups,
  resetVocabularyProgress,
  type FolderResponse,
  type VocabularyGroupItem,
} from "@/lib/api/vocabulary";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useServerAuthedUser } from "@/app/context/ServerAuthedUserProvider";
import VocabularyCard from "@/app/components/vocabulary/VocabularyCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import VocabularyFeatureSkeleton from "./VocabularyFeatureSkeleton";

const PAGE_SIZE = 20;

export default function VocabularyFeature() {
  const { message } = App.useApp();
  const router = useRouter();
  const { theme } = useTheme();
  const user = useServerAuthedUser();
  const userId = user?.userId ? Number(user.userId) : undefined;

  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [vocabularyGroups, setVocabularyGroups] = useState<VocabularyGroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchQuery = useDebounce(searchText, 500);
  const prevSearchRef = useRef(debouncedSearchQuery);
  const prevGroupRef = useRef(selectedGroupId);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    getVocabularyGroups().then(data => {
      if (isMountedRef.current) setVocabularyGroups(data);
    });
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchFolders = useCallback(
    async (page?: number) => {
      const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
      const groupChanged = prevGroupRef.current !== selectedGroupId;

      if (searchChanged || groupChanged) {
        prevSearchRef.current = debouncedSearchQuery;
        prevGroupRef.current = selectedGroupId;
        setCurrentPage(1);
      }
      const pageToFetch = page ?? (searchChanged || groupChanged ? 1 : currentPage);

      setLoading(true);
      setFolders([]);
      try {
        const result = await getFolders({
          page: pageToFetch,
          limit: PAGE_SIZE,
          search: debouncedSearchQuery || undefined,
          vocabularyGroupId: selectedGroupId,
          userId,
        });

        if (!isMountedRef.current) return;

        setFolders(result.data);
        setTotal(result.total);
      } catch (error: unknown) {
        if (!isMountedRef.current) return;

        const err = error as { response?: { status?: number; data?: { message?: string } } };
        if (err?.response?.status === 403) {
          message.warning(err?.response?.data?.message || "Bạn cần gói Pro để truy cập từ vựng.");
          router.back();
          return;
        }
        const msg = error instanceof Error ? error.message : "Không thể tải danh sách folders";
        message.error(msg);
        setFolders([]);
        setTotal(0);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [currentPage, debouncedSearchQuery, selectedGroupId, message, userId, router]
  );

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleReset = useCallback(async () => {
    const isDark = theme === "dark";

    const result = await Swal.fire({
      title: "Đặt lại tiến trình?",
      text: "Toàn bộ tiến trình học từ vựng sẽ bị xóa, bao gồm lịch sử ôn tập và tiến trình folder. Hành động này không thể hoàn tác.",
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
      await resetVocabularyProgress();

      if (!isMountedRef.current) return;

      await Swal.fire({
        title: "Thành công!",
        text: "Tiến trình học từ vựng đã được đặt lại.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f8fafc" : "#1e293b",
      });

      fetchFolders();
    } catch (error) {
      if (!isMountedRef.current) return;

      Swal.fire({
        title: "Lỗi!",
        text: "Không thể đặt lại tiến trình. Vui lòng thử lại.",
        icon: "error",
        confirmButtonColor: isDark ? "#3b82f6" : "#2563eb",
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f8fafc" : "#1e293b",
      });
    } finally {
      if (isMountedRef.current) {
        setResetting(false);
      }
    }
  }, [fetchFolders, theme]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="container mx-auto">
      {/* Search + Actions */}
      <div className="mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <CustomInput
            placeholder="Tìm kiếm chủ đề từ vựng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            wrapperClassName="flex-1 w-full"
          />
          {/* Vocabulary Group Filter */}
          <div className="w-full md:w-64 shrink-0">
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : undefined)}
              className={`
                h-10 w-full px-3 rounded-lg
                bg-white dark:bg-[#1e293b]
                border border-slate-200 dark:border-slate-700/50
                text-slate-700 dark:text-slate-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-200 text-sm font-medium
                cursor-pointer appearance-none
              `}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem'
              }}
            >
              <option value="">Tất cả loại nhóm</option>
              {vocabularyGroups.map((group) => (
                <option key={group.vocabularyGroupId} value={group.vocabularyGroupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <Link
              href="/vocabulary/review"
              className={`
                h-10 px-4 rounded-lg
                bg-white dark:bg-[#1e293b]
                border border-slate-200 dark:border-slate-700/50
                text-slate-700 dark:text-slate-200 
                hover:text-blue-600 dark:hover:text-blue-400
                hover:bg-slate-50 dark:hover:bg-slate-700/50
                shadow-sm shadow-blue-500/5 dark:shadow-black/20
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                transition-all duration-200
                flex items-center justify-center gap-2
                font-medium w-full md:w-auto text-sm
              `}
            >
              <BarChartOutlined className="text-blue-500" />
              <span>Thống kê</span>
            </Link>
          </div>
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
        <VocabularyFeatureSkeleton />
      ) : folders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {folders.map((folder) => (
              <VocabularyCard
                key={folder.folderId}
                folderId={folder.folderId}
                folderName={folder.folderName}
                learned_count={folder.learned_count}
                total_count={folder.total_count}
                access_level={folder.access_level}
                href={`/vocabulary/${folder.folderId}`}
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
                  {range[0]}-{range[1]} của {total} folders
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
                {debouncedSearchQuery
                  ? "Không tìm thấy folder nào phù hợp"
                  : "Chưa có folder từ vựng nào"}
              </span>
            }
          />
        </div>
      )}
    </div>
  );
}
