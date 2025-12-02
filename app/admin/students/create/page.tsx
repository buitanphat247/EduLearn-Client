"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Select, Button, Space, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import ImportExportConfig from "@/app/components/import_export_components/ImportExportConfig";

const { Option } = Select;

export default function CreateStudent() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Mock API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Create student values", values);
      message.success("Thêm học sinh mới thành công!");
      router.push("/admin/students");
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const values = form.getFieldsValue();
    console.log("Draft student values", values);
    message.success("Đã lưu nháp thông tin học sinh (mock)");
  };

  return (
    <div className="space-y-6">
      {/* Header: Back + Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/admin/students")} className="rounded-lg cursor-pointer">
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Thêm học sinh mới</h1>
        </div>
      </div>

      {/* Import / Export template */}
      <ImportExportConfig
        type="student"
        onImport={async (file) => {
          message.success(`Đã nhập file ${file.name} thành công!`);
        }}
        onExportTemplate={(format) => {
          message.info(`Đang xuất template ${format.toUpperCase()}...`);
        }}
      />

      {/* Main form */}
      <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Họ và tên */}
              <Form.Item
                name="name"
                label={<span className="text-gray-700 font-medium">Họ và tên</span>}
                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn A" className="rounded-lg cursor-text" />
              </Form.Item>

              {/* Mã học sinh */}
              <Form.Item
                name="studentId"
                label={<span className="text-gray-700 font-medium">Mã học sinh</span>}
                rules={[{ required: true, message: "Vui lòng nhập mã học sinh!" }]}
              >
                <Input placeholder="Ví dụ: HS001" className="rounded-lg cursor-text" />
              </Form.Item>

              {/* Lớp học */}
              <Form.Item
                name="class"
                label={<span className="text-gray-700 font-medium">Lớp học</span>}
                rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
              >
                <Select placeholder="Chọn lớp" className="rounded-lg cursor-pointer" allowClear>
                  <Option value="10A1">10A1</Option>
                  <Option value="11B2">11B2</Option>
                  <Option value="12C1">12C1</Option>
                  <Option value="9A3">9A3</Option>
                </Select>
              </Form.Item>

              {/* Email */}
              <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Email</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="ví dụ: nguyenvana@example.com" className="rounded-lg cursor-text" />
              </Form.Item>

              {/* Số điện thoại */}
              <Form.Item
                name="phone"
                label={<span className="text-gray-700 font-medium">Số điện thoại</span>}
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
              >
                <Input placeholder="Ví dụ: 0987654321" className="rounded-lg cursor-text" />
              </Form.Item>

              {/* Trạng thái */}
              <Form.Item
                name="status"
                label={<span className="text-gray-700 font-medium">Trạng thái</span>}
                initialValue="Đang học"
              >
                <Select className="rounded-lg cursor-pointer">
                  <Option value="Đang học">Đang học</Option>
                  <Option value="Tạm nghỉ">Tạm nghỉ</Option>
                  <Option value="Đã tốt nghiệp">Đã tốt nghiệp</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Space>
                <Button onClick={() => router.push("/admin/students")} className="rounded-lg cursor-pointer">
                  Hủy
                </Button>
                <Button onClick={handleSaveDraft} className="border-gray-300 rounded-lg cursor-pointer" icon={<SaveOutlined />}>
                  Lưu nháp
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  className="rounded-lg cursor-pointer"
                >
                  Thêm học sinh
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
}
