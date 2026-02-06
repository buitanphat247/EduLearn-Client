"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { App, Button, Table, Tag, Input, Tooltip, Avatar, Select, Modal, InputNumber, Descriptions } from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PaperClipOutlined,
  UndoOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomCard from "@/app/components/common/CustomCard";
import DataLoadingSplash from "@/app/components/common/DataLoadingSplash";
import {
  getAssignmentById,
  getAssignmentStudents,
  updateAssignmentStudent,
  ungradeAssignmentStudent,
  type AssignmentDetailResponse,
  type AssignmentStudentResponse
} from "@/lib/api/assignments";
import { getClassById } from "@/lib/api/classes";
import { getCurrentUser } from "@/lib/api/users";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const classId = params?.id as string;
  const exerciseId = params?.exerciseId as string;

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentDetailResponse | null>(null);
  const [classInfo, setClassInfo] = useState<any | null>(null);

  // Data for table
  const [dataSource, setDataSource] = useState<AssignmentStudentResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Stats
  const [submittedCount, setSubmittedCount] = useState(0);

  // Grading Modal State
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AssignmentStudentResponse | null>(null);
  const [gradeScore, setGradeScore] = useState<number | null>(null);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [ungradingStudentId, setUngradingStudentId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();

      // 1. Fetch Assignment & Class Info (Run once or in parallel)
      const promises: Promise<any>[] = [getAssignmentById(exerciseId)];

      if (currentUser?.user_id) {
        promises.push(getClassById(classId, currentUser.user_id));
      }

      const results = await Promise.all(promises);
      const assignmentData = results[0];
      const classData = results.length > 1 ? results[1] : null;

      setAssignment(assignmentData);
      if (classData) setClassInfo(classData);

      // 2. Fetch Submitted Count (for stats) - count 'submitted', 'resubmitted', 'late', and 'graded'
      // because graded assignments are also submitted
      const [submittedResult, resubmittedResult, lateResult, gradedResult] = await Promise.all([
        getAssignmentStudents({
          assignmentId: exerciseId,
          status: 'submitted',
        }),
        getAssignmentStudents({
          assignmentId: exerciseId,
          status: 'resubmitted',
        }),
        getAssignmentStudents({
          assignmentId: exerciseId,
          status: 'late',
        }),
        getAssignmentStudents({
          assignmentId: exerciseId,
          status: 'graded',
        }),
      ]);
      setSubmittedCount(submittedResult.total + resubmittedResult.total + lateResult.total + gradedResult.total);

    } catch (error: any) {
      console.error(error);
      message.error("Không thể tải thông tin bài tập");
    } finally {
      setLoading(false);
    }
  }, [exerciseId, classId, message]);

  // Separate effect for Table Data to support pagination/filtering without re-fetching static info
  const fetchTableData = useCallback(async () => {
    if (!assignment) return; // Wait for assignment to be loaded

    try {
      setTableLoading(true);
      const result = await getAssignmentStudents({
        assignmentId: exerciseId,
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });

      setDataSource(result.data);
      setTotalRecords(result.total);
    } catch (error) {
      console.error("Error fetching table data", error);
    } finally {
      setTableLoading(false);
    }
  }, [assignment, exerciseId, currentPage, pageSize, debouncedSearchQuery, filterStatus]);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger table refresh when filters change
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Fast refresh handler
  const handleFastRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh both assignment info and table data
      await Promise.all([
        fetchData(),
        fetchTableData(),
      ]);
      message.success("Đã làm mới dữ liệu");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể làm mới dữ liệu");
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, fetchTableData, message]);

  // Grading Handlers
  const handleOpenGradingModal = (record: AssignmentStudentResponse) => {
    setSelectedStudent(record);
    setGradeScore(record.score || null);
    setIsGradingModalOpen(true);
  };

  const handleCloseGradingModal = () => {
    setIsGradingModalOpen(false);
    setSelectedStudent(null);
    setGradeScore(null);
  };

  const handleSaveGrade = async () => {
    if (!selectedStudent) return;
    if (gradeScore === null || gradeScore === undefined) {
      message.warning("Vui lòng nhập điểm số");
      return;
    }

    try {
      setIsSubmittingGrade(true);
      await updateAssignmentStudent(selectedStudent.id, {
        score: gradeScore,
        status: 'graded'
      });

      message.success("Đã chấm điểm thành công");

      // Refresh data to get latest stats and table data
      await Promise.all([
        fetchData(),
        fetchTableData(),
      ]);

      handleCloseGradingModal();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi lưu điểm");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleUngrade = async (studentId?: number) => {
    const targetId = studentId || selectedStudent?.id;
    if (!targetId) return;

    try {
      if (studentId) {
        setUngradingStudentId(targetId);
      } else {
        setIsSubmittingGrade(true);
      }

      await ungradeAssignmentStudent(targetId);

      message.success("Đã gỡ điểm thành công. Học sinh có thể nộp lại bài.");

      // Refresh data to get latest stats and table data
      await Promise.all([
        fetchData(),
        fetchTableData(),
      ]);

      if (!studentId) {
        handleCloseGradingModal();
      }
    } catch (error: any) {
      message.error(error.message || "Lỗi khi gỡ điểm");
    } finally {
      if (studentId) {
        setUngradingStudentId(null);
      } else {
        setIsSubmittingGrade(false);
      }
    }
  };


  const columns: ColumnsType<AssignmentStudentResponse> = [
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "name",
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar src={student?.avatar} icon={<UserOutlined />} />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{student?.fullname || "N/A"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{student?.email || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Chưa nộp";
        let icon = <CloseCircleOutlined />;

        if (status === "submitted" || status === "resubmitted") {
          color = "processing";
          text = status === "resubmitted" ? "Đã nộp lại" : "Đã nộp";
          icon = <CheckCircleOutlined />;
        } else if (status === "graded") {
          color = "success";
          text = "Đã chấm";
          icon = <CheckCircleOutlined />;
        } else if (status === "late") {
          color = "warning";
          text = "Nộp muộn";
          icon = <ClockCircleOutlined />;
        } else if (status === "assigned" || status === "viewed") {
          // Default
        }

        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      key: "score",
      width: 100,
      render: (score) => score !== null ? <span className="font-bold text-gray-800 dark:text-gray-200">{score}</span> : "-",
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) =>
        date ? dayjs(date).format("HH:mm - DD/MM/YYYY") : "-",
    },
    {
      title: "File đính kèm",
      dataIndex: "attachments",
      key: "files",
      render: (attachments: any[]) => {
        if (!attachments || attachments.length === 0) return "-";
        return (
          <div className="flex flex-col gap-1">
            {attachments.map((att: any) => (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <PaperClipOutlined /> {att.file_name}
              </a>
            ))}
          </div>
        );
      }
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => {
        const isGraded = record.status === "graded";
        const canGrade = record.status === "submitted" || record.status === "graded" || record.status === "late" || record.status === "resubmitted";
        const isUngrading = ungradingStudentId === record.id;

        if (!canGrade) return null;

        return (
          <div className="flex items-center gap-2">
            {isGraded && (
              <Tooltip title="Gỡ điểm để học sinh có thể nộp lại">
                <Button
                  danger
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={() => handleUngrade(record.id)}
                  loading={isUngrading}
                >
                  Gỡ điểm
                </Button>
              </Tooltip>
            )}
            <Tooltip title={isGraded ? "Cập nhật điểm" : "Chấm điểm"}>
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenGradingModal(record)}
              >
                {isGraded ? "Sửa điểm" : "Chấm điểm"}
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  if (loading && !assignment) return <DataLoadingSplash tip="Đang tải thông tin..." />;
  if (!assignment) return <div className="p-8 text-center">Bài tập không tồn tại</div>;

  // Stats
  const totalStudents = classInfo?.student_count || 0;
  const notSubmittedCount = Math.max(0, totalStudents - submittedCount);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/admin/classes/${classId}`)}
          className="border-none bg-white shadow-sm hover:bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          Quay lại
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={handleFastRefresh}
          loading={refreshing}
          className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
        >
          Làm mới
        </Button>
      </div>

      {/* Info Card */}
      <CustomCard
        title={
          <div className="flex items-center gap-2">
            <InfoCircleOutlined className="text-blue-500" />
            <span>Thông tin bài tập</span>
          </div>
        }
        bodyClassName="py-6"
      >
        <Descriptions column={2} bordered layout="horizontal">
          <Descriptions.Item label="Tên bài tập" span={1}>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{assignment.title}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Lớp học" span={1}>
            <span className="font-medium text-gray-700 dark:text-gray-300">{classInfo?.name || "..."}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Hạn nộp" span={1}>
            <span className="flex items-center gap-2">
              <ClockCircleOutlined className="text-orange-500" />
              <span className="font-medium dark:text-gray-200">
                {assignment.due_at ? dayjs(assignment.due_at).format("HH:mm - DD/MM/YYYY") : "Không có thời hạn"}
              </span>
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={(!assignment.due_at || dayjs().isBefore(dayjs(assignment.due_at))) ? "processing" : "error"}>
              {(!assignment.due_at || dayjs().isBefore(dayjs(assignment.due_at))) ? "Đang mở" : "Đã hết hạn"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tiến độ nộp bài" span={2}>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Tổng số: <span className="font-bold text-gray-800 dark:text-gray-200">{totalStudents}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Đã nộp: <span className="font-bold text-green-600">{submittedCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CloseCircleOutlined className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Chưa nộp: <span className="font-bold text-gray-600 dark:text-gray-400">{notSubmittedCount}</span>
                </span>
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </CustomCard>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <Select
            placeholder="Trạng thái"
            style={{ width: '100%', height: '40px', boxShadow: 'none' }}
            allowClear
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'submitted', label: 'Đã nộp' },
              { value: 'graded', label: 'Đã chấm' },
              { value: 'assigned', label: 'Chưa nộp' },
            ]}
            className="no-shadow-select"
          />
        </div>
        <div className="flex-1">
          <Input
            size="large"
            placeholder="Tìm kiếm học sinh theo tên hoặc email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full transition-shadow border-gray-200"
            allowClear
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ boxShadow: 'none' }}
          />
        </div>
      </div>

      {/* Submissions Table */}
      <CustomCard padding="none" className="border-gray-200 shadow-sm">
        <Table
          loading={tableLoading}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: false,
          }}
          rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        />
      </CustomCard>

      {/* Grading Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2">
            <Avatar
              size={40}
              src={selectedStudent?.student?.avatar}
              icon={<UserOutlined />}
            />
            <div>
              <div className="font-semibold text-gray-800">{selectedStudent?.student?.fullname}</div>
              <div className="text-xs text-gray-400 font-normal">{selectedStudent?.student?.email}</div>
            </div>
          </div>
        }
        open={isGradingModalOpen}
        onCancel={handleCloseGradingModal}
        centered
        width={360}
        footer={
          <div className="flex gap-2 pt-2">
            {selectedStudent?.status === 'graded' && (
              <Button
                danger
                className="flex-1"
                onClick={() => handleUngrade()}
                loading={isSubmittingGrade}
              >
                Gỡ điểm
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={handleCloseGradingModal}
              disabled={isSubmittingGrade}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveGrade}
              loading={isSubmittingGrade}
            >
              {selectedStudent?.status === 'graded' ? 'Cập nhật điểm' : 'Lưu điểm'}
            </Button>
          </div>
        }
        destroyOnHidden
      >
        <div className="py-4 space-y-6">
          {/* Score Input */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-3">Nhập điểm số</div>
            <InputNumber
              min={0}
              max={10}
              step={0.5}
              value={gradeScore}
              onChange={(value) => setGradeScore(value)}
              size="middle"
              controls={false}
              className="!w-20 [&_input]:!text-center [&_input]:!text-xl [&_input]:!font-bold"
              placeholder="0"
            />
            <span className="text-gray-400 ml-2 text-lg">/10</span>
          </div>

          {/* Quick Select */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[5, 6, 7, 8, 9, 10].map(score => (
              <Button
                key={score}
                size="small"
                type={gradeScore === score ? "primary" : "default"}
                className={gradeScore === score ? "bg-blue-600" : ""}
                onClick={() => setGradeScore(score)}
              >
                {score}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
