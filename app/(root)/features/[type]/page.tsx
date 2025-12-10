"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { App, Spin, Pagination, Input } from "antd";
import { getFolders, type FolderResponse } from "@/lib/api/vocabulary";
import VocabularyCard from "@/app/components/vocabulary/VocabularyCard";

const { Search } = Input;

export default function Features() {
  const { message } = App.useApp();
  const params = useParams();
  const type = params?.type as string;
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const titles: Record<string, string> = {
    translator: 'Dịch thuật',
    vocabulary: 'Học từ vựng',
    writing: 'Luyện viết',
    listening: 'Luyện nghe',
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchText);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (type === "vocabulary") {
      fetchFolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, currentPage, pageSize, debouncedSearchQuery]);

  const fetchFolders = async () => {
    const startTime = Date.now();
    setLoading(true);
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
      
      console.error("Error fetching folders:", error);
      message.error(error?.message || "Không thể tải danh sách folders");
      setFolders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const descriptions: Record<string, string> = {
    translator: 'Dịch thuật nhanh chóng và chính xác',
    vocabulary: 'Học từ vựng theo chủ đề và chuyên ngành',
    writing: 'Luyện viết và cải thiện kỹ năng viết',
    listening: 'Luyện nghe và phát triển kỹ năng nghe hiểu',
  };

  return (
    <main className="container min-h-screen mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {titles[type || ''] || 'Tính năng'}
        </h1>
        <p className="text-gray-600 text-lg">
          {descriptions[type || ''] || 'Khám phá các tính năng hữu ích'}
        </p>
      </div>

      {type === "vocabulary" && (
        <div>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full md:w-auto">
                <Search
                  placeholder="Tìm kiếm folder..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="large"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : folders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {folders.map((folder) => (
                  <VocabularyCard
                    key={folder.folderId}
                    folderId={folder.folderId}
                    folderName={folder.folderName}
                    href={`/features/vocabulary/${folder.folderId}`}
                  />
                ))}
              </div>

              {total > pageSize && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} folders`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {debouncedSearchQuery ? "Không tìm thấy folder nào" : "Chưa có folder nào"}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

