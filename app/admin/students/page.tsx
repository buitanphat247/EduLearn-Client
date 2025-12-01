"use client";

import { useState, useEffect } from "react";
import StudentsHeader from "@/app/components/students_components/StudentsHeader";
import StudentsTable from "@/app/components/students_components/StudentsTable";
import StudentsSearchModal from "@/app/components/modal_components/StudentsSearchModal";
import type { StudentItem } from "@/app/components/students_components/types";

const data: StudentItem[] = [
  { key: "1", name: "Nguyễn Văn A", studentId: "HS001", class: "10A1", email: "nguyenvana@example.com", phone: "0987654321", status: "Đang học" },
  { key: "2", name: "Trần Thị B", studentId: "HS002", class: "10A1", email: "tranthib@example.com", phone: "0987654322", status: "Đang học" },
  { key: "3", name: "Lê Văn C", studentId: "HS003", class: "11B2", email: "levanc@example.com", phone: "0987654323", status: "Tạm nghỉ" },
  { key: "4", name: "Phạm Thị D", studentId: "HS004", class: "12C1", email: "phamthid@example.com", phone: "0987654324", status: "Đã tốt nghiệp" },
];

export default function AdminStudents() {
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
      <StudentsHeader onSearchClick={() => setIsSearchModalOpen(true)} />

      <StudentsTable data={data} />

      <StudentsSearchModal open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={data} />
    </div>
  );
}
