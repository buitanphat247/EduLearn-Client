"use client";

import { useEffect, useState } from "react";
import { App, Skeleton } from "antd";
import { getFolders, type FolderResponse } from "@/lib/api/vocabulary";
import VocabularyCard from "@/app/components/vocabulary/VocabularyCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";

import VocabularyFeatureSkeleton from "./VocabularyFeatureSkeleton";

export default function VocabularyFeature() {
  const { message } = App.useApp();
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchText);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearchQuery]);

  const fetchFolders = async () => {
    const startTime = Date.now();
    setLoading(true);
    setFolders([]); // Clear folders to prevent overlap
    try {
      const result = await getFolders({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery || undefined,
      });

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setFolders(result.data);
      setTotal(result.total);
    } catch (error: any) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      message.error(error?.message || "Không thể tải danh sách folders");
      setFolders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full flex flex-col items-center">
      <CustomInput
        placeholder="Tìm kiếm chủ đề từ vựng..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        wrapperClassName="w-full max-w-2xl mb-16"
      />

      <div className="w-full">
        {loading ? (
          <VocabularyFeatureSkeleton />
        ) : folders.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {folders.map((folder) => (
                <VocabularyCard
                  key={folder.folderId}
                  folderId={folder.folderId}
                  folderName={folder.folderName}
                  href={`/vocabulary/${folder.folderId}`}
                />
              ))}
            </div>

            {total > pageSize && (
              <div className="mt-12 md:mt-16">
                <DarkPagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  showTotal={(total, range) => (
                    <span className="text-slate-600 dark:text-slate-300">
                      {range[0]}-{range[1]} của {total} folders
                    </span>
                  )}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 md:py-40 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed transition-colors duration-300">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {debouncedSearchQuery ? "Không tìm thấy folder nào phù hợp" : "Chưa có folder từ vựng nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

