"use client";

import { useState, useEffect } from "react";
import { Button, Input, message } from "antd";
import { HomeOutlined, SearchOutlined, ArrowLeftOutlined, RocketOutlined, FireOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import PrefetchLink from "@/app/components/common/PrefetchLink";
import { track404, trackEvent } from "@/lib/utils/analytics";

// Popular pages to suggest
const POPULAR_PAGES = [
  { href: "/", label: "Trang chủ", icon: <HomeOutlined /> },
  { href: "/features/vocabulary", label: "Từ vựng", icon: <RocketOutlined /> },
  { href: "/features/writing", label: "Luyện viết", icon: <RocketOutlined /> },
  { href: "/features/listening", label: "Luyện nghe", icon: <RocketOutlined /> },
  { href: "/news", label: "Tin tức", icon: <RocketOutlined /> },
  { href: "/events", label: "Sự kiện", icon: <RocketOutlined /> },
  { href: "/about", label: "Về chúng tôi", icon: <RocketOutlined /> },
  { href: "/guide", label: "Hướng dẫn", icon: <RocketOutlined /> },
];

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPages, setFilteredPages] = useState(POPULAR_PAGES);

  // Track 404 page với analytics
  useEffect(() => {
    if (typeof window !== "undefined") {
      track404(pathname || window.location.pathname, document.referrer);
    }
  }, [pathname]);

  // Filter pages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPages(POPULAR_PAGES);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = POPULAR_PAGES.filter(
      (page) =>
        page.label.toLowerCase().includes(query) ||
        page.href.toLowerCase().includes(query)
    );
    setFilteredPages(filtered.length > 0 ? filtered : POPULAR_PAGES);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Track search event
    trackEvent({
      event_name: "404_search",
      event_category: "404 Page",
      event_label: value,
    });

    // If exact match found, navigate
    const exactMatch = POPULAR_PAGES.find(
      (page) => page.href === value || page.label.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      router.push(exactMatch.href);
      message.success(`Đang chuyển đến ${exactMatch.label}`);
    }
  };

  const handlePageClick = (href: string, label: string) => {
    trackEvent({
      event_name: "404_page_click",
      event_category: "404 Page",
      event_label: label,
      page_path: href,
    });
    router.push(href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Icon Section - Separate from 404 */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <SearchOutlined className="text-6xl text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 404 Number - Clean and Modern */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-extrabold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Oops! Trang không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 max-w-xl mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Có thể URL đã thay đổi hoặc trang đã bị xóa. Hãy thử quay lại trang chủ hoặc sử dụng menu điều hướng.
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <Input
              prefix={<SearchOutlined className="text-slate-500 dark:text-slate-400" />}
              placeholder="Tìm kiếm trang hoặc nội dung..."
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
              allowClear
              className="shadow-lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nhập từ khóa để tìm trang phổ biến
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            size="large"
            className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]"
            onClick={() => {
              trackEvent({
                event_name: "404_home_click",
                event_category: "404 Page",
              });
              router.push("/");
            }}
          >
            Về trang chủ
          </Button>
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            className="border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 min-w-[160px]"
            onClick={() => {
              trackEvent({
                event_name: "404_back_click",
                event_category: "404 Page",
              });
              router.back();
            }}
          >
            Quay lại
          </Button>
        </div>

        {/* Popular Pages Suggestions */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center gap-2">
            <FireOutlined className="text-orange-500" />
            <span>Trang phổ biến:</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {filteredPages.map((page) => (
              <Button
                key={page.href}
                type="default"
                icon={page.icon}
                onClick={() => handlePageClick(page.href, page.label)}
                className="border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                {page.label}
              </Button>
            ))}
          </div>
          {filteredPages.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Không tìm thấy trang nào. Hãy thử từ khóa khác.
            </p>
          )}
        </div>
      </div>

      {/* Decorative Elements - More Dynamic */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-blue-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300 rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-20 w-20 h-20 bg-pink-300 rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute bottom-1/3 left-20 w-16 h-16 bg-indigo-300 rounded-full opacity-25 blur-xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
    </div>
  );
}
