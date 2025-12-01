"use client";

import { useState, useEffect } from "react";
import ClassesHeader from "@/app/components/classes_components/ClassesHeader";
import ClassesTable from "@/app/components/classes_components/ClassesTable";
import ClassesSearchModal from "@/app/components/modal_components/ClassesSearchModal";
import type { ClassItem } from "@/app/components/classes_components/types";

const data: ClassItem[] = [
  { key: "1", name: "Lớp 10A1", code: "10A1", students: 35, teacher: "Nguyễn Văn A", status: "Đang hoạt động" },
  { key: "2", name: "Lớp 10A2", code: "10A2", students: 32, teacher: "Trần Thị B", status: "Đang hoạt động" },
  { key: "3", name: "Lớp 11B1", code: "11B1", students: 30, teacher: "Lê Văn C", status: "Tạm dừng" },
];

export default function AdminClasses() {
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
      <ClassesHeader onSearchClick={() => setIsSearchModalOpen(true)} />

      <ClassesTable data={data} />

      <ClassesSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={data} />
    </div>
  );
}

