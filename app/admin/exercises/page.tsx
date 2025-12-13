"use client";

import { useState, useEffect } from "react";
import ExercisesHeader from "@/app/components/exercises/ExercisesHeader";
import ExercisesTable from "@/app/components/exercises/ExercisesTable";
import ExercisesSearchModal from "@/app/components/exercises/ExercisesSearchModal";
import type { ExerciseItem } from "@/interface/exercises";

const data: ExerciseItem[] = [
  { key: "1", name: "Bài tập Toán chương 1", class: "10A1", subject: "Toán học", date: "15/01/2024", deadline: "20/01/2024", status: "Đang mở" },
  { key: "2", name: "Bài tập Văn tuần 2", class: "11B2", subject: "Ngữ văn", date: "14/01/2024", deadline: "18/01/2024", status: "Đang mở" },
  { key: "3", name: "Bài tập Lý chương 3", class: "12C1", subject: "Vật lý", date: "13/01/2024", deadline: "19/01/2024", status: "Đã đóng" },
  { key: "9", name: "Bài tập số 9", class: "9a3", subject: "Toán học", date: "01/09/2025", deadline: "Không thời hạn", status: "Đang mở" },
];

export default function AdminExercises() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Filter data based on selected filters and search query
  const filteredData = data.filter((item) => {
    const matchesClass = !selectedClass || item.class === selectedClass;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesStatus && matchesSearch;
  });

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
      <ExercisesHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClass={selectedClass}
        selectedStatus={selectedStatus}
        onClassChange={setSelectedClass}
        onStatusChange={setSelectedStatus}
      />

      <ExercisesTable data={filteredData} />

      <ExercisesSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={data} />
    </div>
  );
}

