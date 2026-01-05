"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { App, Input, Button, Tag, Dropdown, Pagination, Empty } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined, CalendarOutlined } from "@ant-design/icons";
import type { ClassExamsTabProps, Exam } from "./types";

const ClassExamsTab = memo(function ClassExamsTab({
  classId,
  searchQuery,
  onSearchChange,
  currentPage,
  pageSize,
  onPageChange,
  readOnly = false,
}: ClassExamsTabProps) {
  const router = useRouter();
  const { message } = App.useApp();

  // Mock exam data - memoized
  const allExams: Exam[] = useMemo(
    () => [
      {
        id: "1",
        title: "Kiểm tra 1 tiết Vật Lý",
        date: "Thứ 6, 19/04/2024",
        time: "08:00 AM",
        room: "A204",
        format: "Trắc nghiệm",
        subject: "Vật lý",
        subjectColor: "bg-orange-100 text-orange-700",
      },
      {
        id: "2",
        title: "Thi giữa kỳ Hóa Học",
        date: "Thứ 2, 22/04/2024",
        time: "09:30 AM",
        room: "B101",
        format: "Tự luận",
        subject: "Hóa học",
        subjectColor: "bg-green-100 text-green-700",
      },
      {
        id: "3",
        title: "Kiểm tra 15 phút Toán",
        date: "Thứ 3, 23/04/2024",
        time: "10:00 AM",
        room: "C305",
        format: "Trắc nghiệm",
        subject: "Toán",
        subjectColor: "bg-blue-100 text-blue-700",
      },
      {
        id: "4",
        title: "Thi cuối kỳ Ngữ Văn",
        date: "Thứ 5, 25/04/2024",
        time: "02:00 PM",
        room: "D201",
        format: "Tự luận",
        subject: "Ngữ Văn",
        subjectColor: "bg-purple-100 text-purple-700",
      },
    ],
    []
  );

  const filteredExams = useMemo(
    () =>
      allExams.filter((exam) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          exam.title.toLowerCase().includes(query) ||
          exam.room.toLowerCase().includes(query) ||
          exam.format.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query)
        );
      }),
    [allExams, searchQuery]
  );

  const totalExams = filteredExams.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExams = useMemo(() => filteredExams.slice(startIndex, endIndex), [filteredExams, startIndex, endIndex]);

  const handleCreateExam = () => {
    router.push(`/admin/classes/${classId}/examinate`);
  };

  const getMenuItems = useCallback(
    (exam: Exam): MenuProps["items"] => {
      const items: MenuProps["items"] = [
        {
          key: "view",
          label: "Xem chi tiết",
        },
      ];

      // Only show edit/delete actions if not readOnly
      if (!readOnly) {
        items.push(
          {
            key: "edit",
            label: "Chỉnh sửa",
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa",
            danger: true,
          }
        );
      }

      return items;
    },
    [readOnly]
  );

  const handleMenuClick = useCallback(
    (key: string, exam: Exam) => {
      switch (key) {
        case "view":
          // Use user route if readOnly, otherwise use admin route
          if (readOnly) {
            router.push(`/user/classes/${classId}/exams/${exam.id}`);
          } else {
            router.push(`/admin/classes/${classId}/exams/${exam.id}`);
          }
          break;
        case "edit":
          router.push(`/admin/classes/${classId}/exams/${exam.id}/edit`);
          break;
        case "delete":
          message.warning("Tính năng xóa kỳ thi đang được phát triển");
          break;
      }
    },
    [router, classId, message, readOnly]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          size="middle"
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm kỳ thi..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPageChange(1);
          }}
          className="flex-1"
          allowClear
        />
        {!readOnly && (
          <Button size="middle" icon={<PlusOutlined />} onClick={handleCreateExam} className="bg-blue-600 hover:bg-blue-700">
            Tạo kỳ thi mới
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentExams.length > 0 ? (
          currentExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg border-l-4 border-orange-500 border-t border-r border-b p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Tag className={`${exam.subjectColor} border-0 font-semibold`}>{exam.subject}</Tag>
                  <Dropdown
                    menu={{
                      items: getMenuItems(exam),
                      onClick: ({ key }) => handleMenuClick(key, exam),
                    }}
                    trigger={["click"]}
                  >
                    <Button type="text" icon={<MoreOutlined />} className="shrink-0" />
                  </Dropdown>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg mb-3 line-clamp-2">{exam.title}</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-orange-500" />
                      <span className="line-clamp-1">
                        {exam.date} - {exam.time}
                      </span>
                    </div>
                    <div className="text-xs">
                      <div>Phòng thi: {exam.room}</div>
                      <div>Hình thức: {exam.format}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <Empty description={searchQuery ? "Không tìm thấy kỳ thi nào" : "Chưa có kỳ thi nào"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>

      {totalExams > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, totalExams)} của {totalExams} kết quả
          </div>
          <Pagination current={currentPage} total={totalExams} pageSize={pageSize} onChange={onPageChange} showSizeChanger={false} />
        </div>
      )}
    </div>
  );
});

export default ClassExamsTab;

