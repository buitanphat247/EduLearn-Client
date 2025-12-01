"use client";

import { useState, useEffect } from "react";
import NewsHeader from "@/app/components/news_components/NewsHeader";
import NewsTable from "@/app/components/news_components/NewsTable";
import NewsSearchModal from "@/app/components/modal_components/NewsSearchModal";
import type { NewsItem } from "@/app/components/news_components/types";

const data: NewsItem[] = [
  { key: "1", title: "Khai giảng khóa học mới", category: "Tin tức", date: "15/01/2024", status: "Đã xuất bản" },
  { key: "2", title: "Hội thảo trực tuyến", category: "Sự kiện", date: "12/01/2024", status: "Đã xuất bản" },
  { key: "3", title: "Ra mắt tính năng AI", category: "Tin tức", date: "10/01/2024", status: "Bản nháp" },
];

export default function AdminNews() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  return (
    <div className="space-y-3">
      <NewsHeader onSearchClick={() => setIsSearchModalOpen(true)} />

      <NewsTable data={data} />

      <NewsSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={data} />
    </div>
  );
}
