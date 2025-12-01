"use client";

import { useState, useEffect, useMemo } from "react";
import UserExercisesHeader from "@/app/components/user_exercises_components/UserExercisesHeader";
import UserExercisesTable from "@/app/components/user_exercises_components/UserExercisesTable";
import UserExercisesSearchModal from "@/app/components/modal_components/UserExercisesSearchModal";
import type { UserExerciseItem } from "@/app/components/user_exercises_components/types";

const data: UserExerciseItem[] = [
  { key: "1", name: "Bài tập Toán chương 1", class: "9A3", subject: "Toán học", date: "15/01/2024", deadline: "20/01/2024", status: "Chưa nộp" },
  { key: "2", name: "Bài tập Văn tuần 2", class: "9A3", subject: "Ngữ văn", date: "14/01/2024", deadline: "18/01/2024", status: "Đã nộp" },
  { key: "3", name: "Bài tập Lý chương 3", class: "9A3", subject: "Vật lý", date: "13/01/2024", deadline: "19/01/2024", status: "Quá hạn" },
];

export default function UserExercises() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Filter data based on status
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesStatus;
    });
  }, [selectedStatus]);

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
      <UserExercisesHeader
        onSearchClick={() => setIsSearchModalOpen(true)}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <UserExercisesTable data={filteredData} />

      <UserExercisesSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={data} />
    </div>
  );
}

