"use client";

import { useState } from "react";
import NewsHeader from "@/app/components/news/NewsHeader";
import NewsTable from "@/app/components/news/NewsTable";
import type { NewsItem } from "@/interface/news";

const data: NewsItem[] = [
  { key: "1", title: "Khai giảng khóa học mới", category: "Tin tức", date: "15/01/2024", status: "Đã xuất bản" },
  { key: "2", title: "Hội thảo trực tuyến", category: "Sự kiện", date: "12/01/2024", status: "Đã xuất bản" },
  { key: "3", title: "Ra mắt tính năng AI", category: "Tin tức", date: "10/01/2024", status: "Bản nháp" },
];

export default function AdminNews() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-3">
      <NewsHeader 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <NewsTable data={filteredData} />
    </div>
  );
}
