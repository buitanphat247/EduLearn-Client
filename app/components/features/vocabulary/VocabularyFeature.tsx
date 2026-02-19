"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { App, Empty } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import {
  getFolders,
  type FolderResponse,
} from "@/lib/api/vocabulary";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useServerAuthedUser } from "@/app/context/ServerAuthedUserProvider";
import VocabularyCard from "@/app/components/vocabulary/VocabularyCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";

import VocabularyFeatureSkeleton from "./VocabularyFeatureSkeleton";

const MIN_LOADING_MS = 250;

async function withMinDelay<T>(fn: () => Promise<T>, minMs = MIN_LOADING_MS): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const remaining = Math.max(0, minMs - (Date.now() - start));
    if (remaining) await new Promise((r) => setTimeout(r, remaining));
    return result;
  } catch (e) {
    const remaining = Math.max(0, minMs - (Date.now() - start));
    if (remaining) await new Promise((r) => setTimeout(r, remaining));
    throw e;
  }
}

export default function VocabularyFeature() {
  const { message } = App.useApp();
  const user = useServerAuthedUser();
  const userId = user?.userId ? Number(user.userId) : undefined;

  // Folder state
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchQuery = useDebounce(searchText, 500);
  const prevSearchRef = useRef(debouncedSearchQuery);

  // Fetch folders
  const fetchFolders = useCallback(
    async (page?: number) => {
      const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
      if (searchChanged) {
        prevSearchRef.current = debouncedSearchQuery;
        setCurrentPage(1);
      }
      const pageToFetch = page ?? (searchChanged ? 1 : currentPage);

      setLoading(true);
      setFolders([]);
      try {
        const result = await withMinDelay(() =>
          getFolders({
            page: pageToFetch,
            limit: pageSize,
            search: debouncedSearchQuery || undefined,
            userId,
          })
        );
        setFolders(result.data);
        setTotal(result.total);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Không thể tải danh sách folders";
        message.error(msg);
        setFolders([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearchQuery, message, userId]
  );

  // Auto-fetch on dependency change
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return (
    <div className="container mx-auto px-4">
      {/* Search + Stats */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <CustomInput
            placeholder="Tìm kiếm chủ đề từ vựng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            wrapperClassName="flex-1 w-full"
          />
          <div className="w-full md:w-auto shrink-0">
            <Link
              href="/vocabulary/review"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium w-full md:w-auto"
            >
              <BarChartOutlined className="text-blue-500" />
              <span>Thống kê</span>
            </Link>
          </div>
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
                href={`/vocabulary/${folder.folderId}`}
              />
            ))}
          </div>

          {total > pageSize && (
            <DarkPagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
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
