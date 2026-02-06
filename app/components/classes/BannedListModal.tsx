"use client";

import { Modal, Table, Button, Tag, App, Spin, message } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getBannedStudents, updateClassStudentStatus, getClassStudentId, type ClassStudentRecord } from "@/lib/api/classes";
import type { ColumnsType } from "antd/es/table";
import { ensureMinLoadingTime, formatStudentId } from "@/lib/utils/classUtils";

interface BannedListModalProps {
  open: boolean;
  onCancel: () => void;
  classId: string;
  className: string;
  onUnbanSuccess?: () => void;
}

interface BannedStudentItem {
  key: string;
  id: number | string; // class-student id
  userId: number | string;
  studentId: string;
  name: string;
  email: string;
  addedAt: string;
}

export default function BannedListModal({ open, onCancel, classId, className, onUnbanSuccess }: BannedListModalProps) {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [bannedStudents, setBannedStudents] = useState<BannedStudentItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Map API data to table format
  const mapBannedStudentToItem = useCallback((record: ClassStudentRecord): BannedStudentItem => {
    // Lấy userId từ student.user_id (vì API trả về user_id trong object student)
    const userId = record.student?.user_id || record.user_id;
    
    return {
      key: String(record.id),
      id: record.id,
      userId: userId,
      studentId: formatStudentId(userId, record.student?.username),
      name: record.student?.fullname || "",
      email: record.student?.email || "",
      addedAt: record.added_at,
    };
  }, []);

  // Fetch banned students
  const fetchBannedStudents = useCallback(async () => {
    if (!open || !classId) return;

    const startTime = Date.now();
    try {
      setLoading(true);
      const data = await getBannedStudents({
        classId: classId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      const mappedStudents = data.map(mapBannedStudentToItem);

      // Ensure minimum loading time
      await ensureMinLoadingTime(startTime);

      setBannedStudents(mappedStudents);
      // Note: API response doesn't include total, so we'll use the length for now
      // In a real scenario, you'd want the API to return total count
      setPagination((prev) => ({ ...prev, total: mappedStudents.length }));
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách học sinh bị cấm");
      setBannedStudents([]);
    } finally {
      setLoading(false);
    }
  }, [open, classId, pagination.current, pagination.pageSize, mapBannedStudentToItem]);

  useEffect(() => {
    fetchBannedStudents();
  }, [fetchBannedStudents]);

  const handleUnban = (student: BannedStudentItem) => {
    modal.confirm({
      title: "Xác nhận gỡ cấm học sinh",
      content: `Bạn có chắc chắn muốn gỡ cấm học sinh "${student.name}"? Học sinh này sẽ có thể tham gia các hoạt động của lớp học trở lại.`,
      okText: "Gỡ cấm",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Lấy class-student id nếu chưa có
          let classStudentId = student.id;
          if (!classStudentId) {
            const id = await getClassStudentId(classId, student.userId);
            if (!id) {
              message.error("Không tìm thấy ID bản ghi học sinh trong lớp");
              return;
            }
            classStudentId = id;
          }

          await updateClassStudentStatus({
            id: classStudentId,
            status: "online",
          });

          // Xóa học sinh khỏi danh sách banned
          setBannedStudents((prev) => prev.filter((s) => s.key !== student.key));
          
          // Cập nhật pagination
          setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

          message.success(`Đã gỡ cấm học sinh "${student.name}"`);
          
          // Callback để refresh danh sách chính nếu cần
          if (onUnbanSuccess) {
            onUnbanSuccess();
          }
        } catch (error: any) {
          message.error(error?.message || "Không thể gỡ cấm học sinh");
        }
      },
    });
  };

  const columns: ColumnsType<BannedStudentItem> = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: () => (
        <Tag color="red" icon={<UserOutlined />}>
          Bị cấm
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: BannedStudentItem) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleUnban(record)}
        >
          Gỡ cấm
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Danh sách học sinh bị cấm"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden={true}
    >
      <Spin spinning={loading}>
        <div style={{ minHeight: "400px" }}>
          <Table
            columns={columns}
            dataSource={bannedStudents}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }));
              },
              showSizeChanger: false,
            }}
            rowKey="key"
            scroll={{ y: 400 }}
          />
        </div>
      </Spin>
    </Modal>
  );
}

