"use client";

import { Modal, Form, Input, Button, App } from "antd";
import { useState, useEffect } from "react";
import { updateClass, type UpdateClassParams } from "@/lib/api/classes";
import { getCurrentUser } from "@/lib/api/users";

interface UpdateClassModalProps {
  open: boolean;
  classId: string | number;
  currentName: string;
  currentCode: string;
  currentStudentCount: number;
  currentStatus: "active" | "inactive";
  onCancel: () => void;
  onSuccess: (updatedName: string) => void;
}

export default function UpdateClassModal({
  open,
  classId,
  currentName,
  currentCode,
  currentStudentCount,
  currentStatus,
  onCancel,
  onSuccess,
}: UpdateClassModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: currentName,
      });
    }
  }, [open, form, currentName]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const user = getCurrentUser();
      if (!user || !user.user_id) {
        message.error("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const params: UpdateClassParams = {
        name: values.name.trim(),
        code: currentCode, // Giữ nguyên code
        student_count: currentStudentCount, // Giữ nguyên số học sinh
        status: currentStatus, // Giữ nguyên trạng thái
        created_by: Number(user.user_id),
      };

      await updateClass(classId, params);
      message.success("Cập nhật lớp học thành công!");
      form.resetFields();
      onSuccess(values.name.trim()); // Truyền tên mới vào callback
    } catch (error: any) {
      message.error(error?.message || "Không thể cập nhật lớp học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      message.warning("Đang cập nhật lớp học, vui lòng đợi...");
      return;
    }
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Chỉnh sửa lớp học"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      maskClosable={!submitting}
      closable={!submitting}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên lớp"
          rules={[
            { required: true, message: "Vui lòng nhập tên lớp" },
            { max: 255, message: "Tên lớp không được vượt quá 255 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên lớp học" disabled={submitting} size="middle" />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={submitting} size="middle">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting} size="middle" className="bg-blue-500 hover:bg-blue-600">
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

