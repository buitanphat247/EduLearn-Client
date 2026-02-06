"use client";

import { Input, Select, ConfigProvider, theme, Empty } from "antd";
import { useState, useMemo, useCallback } from "react";
import NewsCard from "@/app/components/news/NewsCard";
import { SearchOutlined } from "@ant-design/icons";
import DarkPagination from "@/app/components/common/DarkPagination";
import { news } from "./mock_data";
import { useTheme } from "@/app/context/ThemeContext";
import PageSkeleton from "@/app/components/common/PageSkeleton";

// Constants
const DEFAULT_PAGE_SIZE = 18;

export default function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme: currentTheme } = useTheme();
  const pageSize = DEFAULT_PAGE_SIZE;

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  const total = filteredNews.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const categories = Array.from(new Set(news.map((item) => item.category)));

  const handleSearch = useCallback((value: string) => {
    setIsLoading(true);
    setSearchText(value);
    setCurrentPage(1);
    setIsLoading(false);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setIsLoading(true);
    setSelectedCategory(value);
    setCurrentPage(1);
    setIsLoading(false);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Simulate loading delay for skeleton
    setIsLoading(false);
  }, []);

  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Tin tức & Sự kiện</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
            Khám phá những xu hướng giáo dục mới nhất, các bài viết chuyên sâu và thông tin về các hoạt động cộng đồng sôi nổi.
          </p>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Search & Filter Section */}
        <ConfigProvider
          theme={{
            algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorBgContainer: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
              colorBorder: currentTheme === 'dark' ? '#334155' : '#e2e8f0',
              colorText: currentTheme === 'dark' ? '#ffffff' : '#1e293b',
              colorTextPlaceholder: currentTheme === 'dark' ? '#94a3b8' : '#94a3b8',
            },
            components: {
              Input: {
                activeBorderColor: '#3b82f6',
                hoverBorderColor: '#3b82f6',
              },
              Select: {
                colorPrimary: '#3b82f6',
                colorPrimaryHover: '#3b82f6',
              }
            }
          }}
        >
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  prefix={<SearchOutlined className="text-slate-400 text-xl mr-2" />}
                  placeholder="Tìm kiếm tin tức..."
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full shadow-lg shadow-black/5 dark:shadow-black/20 h-12 text-base rounded-xl border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  className="w-full shadow-lg shadow-black/5 dark:shadow-black/20 h-12 text-base [&_.ant-select-selector]:rounded-xl! [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:items-center!"
                  onChange={handleCategoryChange}
                  options={categories.map((cat) => ({ label: cat, value: cat }))}
                />
              </div>
            </div>
          </div>
        </ConfigProvider>

        {isLoading ? (
          <PageSkeleton itemCount={pageSize} variant="grid" columns={3} showHeader={false} />
        ) : currentNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentNews.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  excerpt={item.excerpt}
                  image={item.image}
                  date={item.date}
                  category={item.category}
                />
              ))}
            </div>

            {total > pageSize && (
              <DarkPagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showTotal={(total, range) => (
                  <span className="text-slate-500 dark:text-slate-300">
                    {range[0]}-{range[1]} của {total} tin tức
                  </span>
                )}
                className="mt-12"
              />
            )}
          </>
        ) : (
          <div className="py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-500 dark:text-slate-400 text-lg">Không tìm thấy tin tức nào</span>} />
          </div>
        )}
      </div>
    </main>
  );
}
