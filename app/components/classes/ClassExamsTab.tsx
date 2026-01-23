"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { App, Input, Button, Tag, Dropdown, Pagination, Empty } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined, CalendarOutlined, RobotOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import Swal from "sweetalert2";
import type { ClassExamsTabProps, Exam } from "./types";
import { getRagTestsByClass, deleteRagTest } from "@/lib/api/rag-exams";
import { getUserIdFromCookie } from "@/lib/utils/cookies";

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
  const { message, modal } = App.useApp();
  const [ragExams, setRagExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRagTests = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      let studentId = Number(getUserIdFromCookie());
      if (!studentId) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            studentId = Number(u.id || u.user_id);
          } catch (e) {
            console.error("Error parsing user", e);
          }
        }
      }

      if (!studentId) {
        console.warn("User ID not found, using guest/mock mode or failing.");
        // Optional: handle not logged in
      }

      console.log("Fetching exams for Student ID:", studentId);
      const tests = await getRagTestsByClass(classId, studentId, !readOnly);

      console.log(
        "RAG Tests Debug Data:",
        tests.map((t) => ({
          title: t.title,
          max_attempts: t.max_attempts,
          user_attempt_count: t.user_attempt_count,
          attemptsLeft: t.max_attempts - t.user_attempt_count,
          isLocked: t.max_attempts - t.user_attempt_count <= 0,
        }))
      );

      const mappedTests: Exam[] = tests.map((t) => {
        const max = Number(t.max_attempts);
        const count = Number(t.user_attempt_count);
        // Chỉ khóa bài nếu đang ở vai trò học sinh (readOnly)
        const isLocked = readOnly && max - count <= 0;

        return {
          id: t.id,
          title: t.title,
          date: t.created_at
            ? new Date(t.created_at).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" })
            : "N/A",
          time: t.created_at ? new Date(t.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "N/A",
          room: readOnly ? (isLocked ? `Hết lượt (${count}/${max})` : `Lượt: ${count}/${max}`) : "Trực tuyến",
          format: "Trắc nghiệm AI",
          subject: "RAG AI Test",
          subjectColor: isLocked ? "bg-gray-100 text-gray-500" : "",
          subjectStyle: isLocked ? undefined : {
            backgroundColor: "#fff7e6",
            color: "#d46b08",
            borderColor: "#ffd591",
            borderWidth: "1px",
            borderStyle: "solid"
          },
          isAi: true,
          isLocked: isLocked, // Attach lock status
          isPublished: t.is_published ?? false, // Add publish status
          end_at: t.end_at,
          max_violations: t.max_violations,
        };
      });
      setRagExams(mappedTests);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [classId, readOnly]);

  useEffect(() => {
    fetchRagTests();
  }, [fetchRagTests]);

  // Mock exam data - Emptying to show only real data
  const allExams: Exam[] = useMemo(() => [], []);

  const filteredExams = useMemo(() => {
    const combined = [...ragExams, ...allExams];
    return combined.filter((exam) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        exam.title.toLowerCase().includes(query) ||
        exam.room.toLowerCase().includes(query) ||
        exam.format.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query)
      );
    });
  }, [allExams, ragExams, searchQuery, readOnly]);

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
          if (readOnly) {
            router.push(`/user/classes/${classId}/exams/${exam.id}`);
          } else {
            router.push(`/admin/classes/${classId}/exams/${exam.id}`);
          }
          break;
        case "edit":
          if (exam.isAi) {
            router.push(`/admin/classes/${classId}/examinate/ai_editor?testId=${exam.id}`);
          } else {
            router.push(`/admin/classes/${classId}/exams/${exam.id}/edit`);
          }
          break;
        case "delete":
          if (exam.isAi) {
            modal.confirm({
              title: "Xác nhận xóa bộ đề AI",
              icon: <ExclamationCircleFilled />,
              content: `Bạn có chắc chắn muốn xóa bộ đề "${exam.title}"? Dữ liệu này sẽ được xóa vĩnh viễn khỏi hệ thống AI.`,
              okText: "Xóa",
              okType: "danger",
              cancelText: "Hủy",
              onOk: async () => {
                const success = await deleteRagTest(exam.id);
                if (success) {
                  message.success("Đã xóa bộ đề AI thành công");
                  fetchRagTests(); // Làm mới danh sách
                } else {
                  message.error("Lỗi khi xóa bộ đề AI");
                }
              },
            });
          } else {
            message.warning("Tính năng xóa kỳ thi truyền thống đang được phát triển");
          }
          break;
      }
    },
    [router, classId, message, modal, readOnly, fetchRagTests]
  );

  const handleCardClick = useCallback(
    (exam: any, e: React.MouseEvent) => {
      // Chỉ xử lý khi click vào card, không xử lý khi click vào dropdown menu (chỉ có ở admin)
      if (!readOnly && (e.target as HTMLElement).closest(".ant-dropdown-trigger")) {
        return;
      }

      // Chỉ hiển thị modal xác nhận khi ở chế độ readOnly (trang user)
      if (readOnly) {
        if (exam.isLocked) {
          Swal.fire({
            icon: "warning",
            title: "Đã hết lượt làm bài",
            text: "Bạn đã sử dụng hết số lượt làm bài cho phép của đề thi này.",
            confirmButtonText: "Đóng",
            confirmButtonColor: "#f59e0b",
          });
          return;
        }

        const isDevToolsOpen = () => {
          const threshold = 160;
          return window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
        };

        if (isDevToolsOpen()) {
          Swal.fire({
            icon: "error",
            title: "Phát hiện DevTools!",
            text: "Vui lòng đóng công cụ lập trình (Developer Tools) để có thể bắt đầu bài thi.",
            confirmButtonText: "Đóng",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        Swal.fire({
          title: "",
          html: `
            <div class="text-center mb-5">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-3">
                <span style="font-size: 32px;">📝</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800 uppercase tracking-tight">Xác nhận làm bài</h2>
            </div>

            <div class="text-left space-y-3">
              <!-- Exam Info Grid -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div class="bg-white p-1.5 rounded-lg shadow-sm text-sm">📅</div>
                  <div>
                    <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Ngày thi</p>
                    <p class="text-[12px] font-bold text-gray-700 leading-none">${exam.date}</p>
                  </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div class="bg-white p-1.5 rounded-lg shadow-sm text-sm">⏰</div>
                  <div>
                    <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Thời gian</p>
                    <p class="text-[12px] font-bold text-gray-700 leading-none">${exam.time}</p>
                  </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div class="bg-white p-1.5 rounded-lg shadow-sm text-sm">📄</div>
                  <div>
                    <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Hình thức</p>
                    <p class="text-[12px] font-bold text-gray-700 leading-none">${exam.format}</p>
                  </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div class="bg-white p-1.5 rounded-lg shadow-sm text-sm">🔄</div>
                  <div>
                    <p class="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Số lượt</p>
                    <p class="text-[12px] font-bold text-gray-700 leading-none">${exam.room}</p>
                  </div>
                </div>
              </div>

              <!-- Rules Box - More Professional Slate/Indigo -->
              <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm">🛡️</span>
                  <h3 class="font-bold text-indigo-700 uppercase text-[11px] tracking-widest">Quy định phòng thi</h3>
                </div>
                
                <ul class="space-y-1.5 p-0 m-0 list-none">
                  <li class="flex items-start gap-2 text-[12px] text-indigo-900/80">
                    <span class="text-indigo-400">•</span>
                    <span>Bắt buộc sử dụng <strong>Chế độ toàn màn hình</strong>.</span>
                  </li>
                  <li class="flex items-start gap-2 text-[12px] text-indigo-900/80">
                    <span class="text-indigo-400">•</span>
                    <span>Thoát Fullscreen > 3 lần sẽ tính <strong>01 lỗi vi phạm</strong>.</span>
                  </li>
                  <li class="flex items-start gap-2 text-[12px] text-indigo-900/80">
                    <span class="text-indigo-400">•</span>
                    <span>Tự động khóa bài nếu quá <strong>03 lỗi chính thức</strong>.</span>
                  </li>
                  <li class="flex items-start gap-2 text-[12px] text-indigo-900/80">
                    <span class="text-indigo-400">•</span>
                    <span>Cấm các hành vi gian lận (Copy/Paste, DevTools).</span>
                  </li>
                </ul>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: "#4f46e5",
          cancelButtonColor: "#f1f5f9",
          confirmButtonText: "Bắt đầu bài thi",
          cancelButtonText: "Quay lại",
          focusConfirm: true,
          width: "460px",
          customClass: {
            popup: "rounded-[24px] shadow-2xl border-0 p-6",
            htmlContainer: "p-0 m-0",
            actions: "mt-8 gap-3",
            confirmButton:
              "px-8 py-3 rounded-xl font-bold text-[14px] text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
            cancelButton:
              "px-8 py-3 rounded-xl font-bold text-[14px] text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 border-0",
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/user/classes/${classId}/exams/${exam.id}`);
          }
        });
      }
    },
    [router, classId, readOnly]
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
          className="flex-1 dark:bg-gray-700/50 dark:!border-slate-600 dark:text-white dark:placeholder-gray-500 hover:dark:!border-slate-500 focus:dark:!border-blue-500"
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
              onClick={(e) => handleCardClick(exam, e)}
              className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 ${
                exam.isAi ? "border-cyan-500" : "border-orange-500"
              } border-t border-r border-b border-gray-200 dark:!border-slate-600 p-6 hover:shadow-md transition-shadow ${readOnly ? "cursor-pointer" : ""} ${
                exam.isLocked ? "opacity-60 grayscale cursor-not-allowed" : ""
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Tag 
                      className={`${exam.subjectColor} border-0 font-semibold`}
                      style={exam.subjectStyle}
                    >
                      {exam.subject}
                    </Tag>
                    {exam.isAi && (
                      <Tag 
                        icon={<RobotOutlined />} 
                        className="font-bold"
                        style={{
                          backgroundColor: "#e6f4ff",
                          color: "#0958d9",
                          borderColor: "#91caff",
                          borderWidth: "1px",
                          borderStyle: "solid"
                        }}
                      >
                        THI THỬ AI
                      </Tag>
                    )}
                    {!readOnly && exam.isPublished !== undefined && (
                      <Tag 
                        color={exam.isPublished ? "blue" : "orange"} 
                        className="font-bold"
                        style={{
                          backgroundColor: exam.isPublished ? "#e6f4ff" : "#fff7e6",
                          color: exam.isPublished ? "#0958d9" : "#d46b08",
                          borderColor: exam.isPublished ? "#91caff" : "#ffd591"
                        }}
                      >
                        {exam.isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                      </Tag>
                    )}
                  </div>
                  {!readOnly && (
                    <Dropdown
                      menu={{
                        items: getMenuItems(exam),
                        onClick: ({ key }) => handleMenuClick(key, exam),
                      }}
                      trigger={["click"]}
                    >
                      <Button type="text" icon={<MoreOutlined />} className="shrink-0" />
                    </Dropdown>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-3 line-clamp-2">{exam.title}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className={exam.isAi ? "text-cyan-500" : "text-orange-500"} />
                      <span className="line-clamp-1">
                        {exam.date} - {exam.time}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 mt-2">
                      <div>Phòng thi: {exam.room}</div>
                      <div>Hình thức: {exam.format}</div>
                      {exam.end_at && (
                         <div className="text-red-500 font-medium">Hạn chót: {new Date(exam.end_at).toLocaleString("vi-VN", {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}</div>
                      )}
                      {exam.max_violations !== undefined && (
                         <div className="text-orange-600 font-medium">Vi phạm tối đa: {exam.max_violations} lỗi</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : !isLoading ? (
          <div className="col-span-full">
            <Empty description={searchQuery ? "Không tìm thấy kỳ thi nào" : "Chưa có kỳ thi nào"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : null}
      </div>

      {totalExams > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, totalExams)} của {totalExams} kết quả
          </div>
          <Pagination current={currentPage} total={totalExams} pageSize={pageSize} onChange={onPageChange} showSizeChanger={false} />
        </div>
      )}
    </div>
  );
});

export default ClassExamsTab;
