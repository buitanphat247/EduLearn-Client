"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Spin } from "antd";
import StudentDetailModal from "@/app/components/students/StudentDetailModal";
import ClassHeader from "@/app/components/classes/ClassHeader";
import ClassInfoCard from "@/app/components/classes/ClassInfoCard";
import ClassStudentsTable from "@/app/components/classes/ClassStudentsTable";
import UpdateClassModal from "@/app/components/classes/UpdateClassModal";
import AddSingleStudentModal from "@/app/components/classes/AddSingleStudentModal";
import { getClassById, removeStudentFromClass, deleteClass, type ClassDetailResponse, type ClassStudent } from "@/lib/api/classes";
import { type StudentResponse } from "@/lib/api/users";
import type { StudentItem } from "@/interface/students";

export default function ClassDetail() {
  const router = useRouter();
  const params = useParams();
  const { modal, message } = App.useApp();
  const classId = params?.id as string;
  
  const [classData, setClassData] = useState<{
    id: string;
    name: string;
    code: string;
    students: number;
    status: "Đang hoạt động" | "Tạm dừng";
  } | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddSingleModalOpen, setIsAddSingleModalOpen] = useState(false);
  const [isAddMultipleModalOpen, setIsAddMultipleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [originalClassData, setOriginalClassData] = useState<ClassDetailResponse | null>(null);

  // Map API student to StudentItem
  const mapStudentToItem = (student: ClassStudent, className: string, _index: number): StudentItem => {
    return {
      key: String(student.user_id),
      studentId: student.username || `HS${String(student.user_id).padStart(3, "0")}`,
      name: student.fullname,
      email: student.email,
      phone: "", // API không có phone, để trống
      class: className,
      status: "Đang học" as const, // Mặc định "Đang học" vì API không có status
    };
  };

  // Fetch class detail
  const fetchClassDetail = useCallback(async () => {
    if (!classId) return;

    const startTime = Date.now();
    try {
      const data = await getClassById(classId);

      // Map class data
      const mappedClassData = {
        id: String(data.class_id),
        name: data.name,
        code: data.code,
        students: data.student_count,
        status: data.status === "active" ? "Đang hoạt động" as const : "Tạm dừng" as const,
      };

      // Map students
      const mappedStudents: StudentItem[] = (data.students || []).map((student: ClassStudent, index: number) =>
        mapStudentToItem(student, data.name, index)
      );

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setClassData(mappedClassData);
      setStudents(mappedStudents);
      setOriginalClassData(data); // Lưu original data để dùng cho update
    } catch (error: any) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      message.error(error?.message || "Không thể tải thông tin lớp học");
      setClassData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, message]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin lớp học..." />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="space-y-6">
        <ClassHeader className="Lớp học" onEdit={() => {}} onDelete={() => {}} />
        <ClassInfoCard
          classInfo={{
            name: "Không tìm thấy",
            code: "N/A",
            students: 0,
            status: "Không tồn tại",
          }}
        />
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    modal.confirm({
      title: "Xác nhận xóa lớp học",
      content: `Bạn có chắc chắn muốn xóa lớp học "${classData.name}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteClass(classId);
          message.success(`Đã xóa lớp học "${classData.name}" thành công`);
          // Redirect về trang danh sách lớp học
          router.push("/admin/classes");
        } catch (error: any) {
          message.error(error?.message || "Không thể xóa lớp học");
        }
      },
    });
  };

  const handleViewStudent = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleRemoveStudent = (student: StudentItem) => {
    modal.confirm({
      title: "Xác nhận xóa học sinh",
      content: `Bạn có chắc chắn muốn xóa học sinh "${student.name}" ra khỏi lớp "${classData.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await removeStudentFromClass({
            classId: classId,
            userId: student.key,
          });

          // Cập nhật state trực tiếp
          setStudents((prev) => prev.filter((s) => s.key !== student.key));
          setClassData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              students: prev.students - 1,
            };
          });

          message.success(`Đã xóa học sinh "${student.name}" ra khỏi lớp`);
        } catch (error: any) {
          message.error(error?.message || "Không thể xóa học sinh khỏi lớp");
        }
      },
    });
  };

  const handleAddSingle = () => {
    setIsAddSingleModalOpen(true);
  };

  const handleAddMultiple = () => {
    setIsAddMultipleModalOpen(true);
  };

  const handleAddStudentSuccess = (student: StudentResponse) => {
    // Map API student to StudentItem format
    const newStudent: StudentItem = {
      key: String(student.user_id),
      studentId: student.username || `HS${String(student.user_id).padStart(3, "0")}`,
      name: student.fullname,
      email: student.email,
      phone: student.phone || "",
      class: classData?.name || "",
      status: "Đang học" as const,
    };

    // Cập nhật state trực tiếp
    setStudents((prev) => [...prev, newStudent]);
    setClassData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students + 1,
      };
    });
    
    // Không đóng modal để có thể thêm tiếp
    message.success(`Đã thêm học sinh "${student.fullname}" vào lớp`);
  };

  // Get existing student IDs for filtering
  const existingStudentIds = students.map((s) => s.key);

  return (
    <div className="space-y-6">
      {/* Header */}
      <ClassHeader className={classData.name} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Thông tin lớp học */}
      <ClassInfoCard
        classInfo={{
          name: classData.name,
          code: classData.code,
          students: classData.students,
          status: classData.status,
        }}
      />

      {/* Danh sách học sinh */}
      <ClassStudentsTable 
        students={students} 
        onViewStudent={handleViewStudent} 
        onRemoveStudent={handleRemoveStudent}
        onAddSingle={handleAddSingle}
        onAddMultiple={handleAddMultiple}
      />

      {/* Modal chỉnh sửa lớp học */}
      {originalClassData && (
        <UpdateClassModal
          open={isEditModalOpen}
          classId={classId}
          currentName={classData.name}
          currentCode={classData.code}
          currentStudentCount={classData.students}
          currentStatus={originalClassData.status}
          onCancel={() => setIsEditModalOpen(false)}
          onSuccess={(updatedName) => {
            setIsEditModalOpen(false);
            // Cập nhật state trực tiếp thay vì gọi lại API
            setClassData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                name: updatedName,
              };
            });
            // Cập nhật originalClassData để đồng bộ
            setOriginalClassData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                name: updatedName,
              };
            });
          }}
        />
      )}

      {/* Modal thêm học sinh single */}
      {classData && (
        <AddSingleStudentModal
          open={isAddSingleModalOpen}
          classId={classId}
          existingStudentIds={existingStudentIds}
          onCancel={() => setIsAddSingleModalOpen(false)}
          onSuccess={handleAddStudentSuccess}
        />
      )}

      {/* Modal xem chi tiết học sinh */}
      <StudentDetailModal
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        classInfo={{
          name: classData.name,
          code: classData.code,
        }}
      />
    </div>
  );
}
