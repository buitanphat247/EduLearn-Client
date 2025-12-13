"use client";

import { useState } from "react";
import StudentsHeader from "@/app/components/students/StudentsHeader";
import StudentsTable from "@/app/components/students/StudentsTable";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import type { StudentItem } from "@/interface/students";

const data: StudentItem[] = [
  { key: "1", name: "Nguyễn Văn A", studentId: "HS001", class: "10A1", email: "nguyenvana@example.com", phone: "0987654321", status: "Đang học" },
  { key: "2", name: "Trần Thị B", studentId: "HS002", class: "10A1", email: "tranthib@example.com", phone: "0987654322", status: "Đang học" },
  { key: "3", name: "Lê Văn C", studentId: "HS003", class: "11B2", email: "levanc@example.com", phone: "0987654323", status: "Tạm nghỉ" },
  { key: "4", name: "Phạm Thị D", studentId: "HS004", class: "12C1", email: "phamthid@example.com", phone: "0987654324", status: "Đã tốt nghiệp" },
];

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewStudent = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-3">
      <StudentsHeader 
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <StudentsTable data={filteredData} onViewStudent={handleViewStudent} />

      {/* Modal xem chi tiết học sinh */}
      <StudentDetailModal
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
}
