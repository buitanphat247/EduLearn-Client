"use client";

import { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, Badge, Typography, message } from "antd";
import { RobotOutlined, SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/users";
import { classSocketClient } from "@/lib/socket/class-client";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AIGenerationSectionProps {
  uploadedFile: any;
  onLoadingChange?: (loading: boolean) => void;
}

export default function AIGenerationSection({ uploadedFile, onLoadingChange }: AIGenerationSectionProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const generateAutoTitle = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `AI Exam - ${dateStr} ${timeStr}`;
  };

  const onFinish = async (values: any) => {
    // Validate: Phải có file hoặc description
    if (!uploadedFile?.originFileObj && !values.description?.trim()) {
      message.error("Vui lòng upload file hoặc nhập mô tả/chủ đề");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // File (optional - có thể dùng description thay thế)
      if (uploadedFile?.originFileObj) {
        formData.append("file", uploadedFile.originFileObj);
      }

      // Title: Tự động tạo nếu không có
      const title = values.title?.trim() || generateAutoTitle();
      formData.append("title", title);

      // Description (required nếu không có file)
      formData.append("description", values.description?.trim() || "");

      // Số lượng câu hỏi (required)
      formData.append("num_questions", values.num_questions.toString());

      // Mode (default: llamaindex)
      formData.append("mode", values.mode || "llamaindex");

      // Class ID
      if (classId) {
        formData.append("class_id", classId);
      }

      // Teacher ID - Required by backend
      if (currentUser?.user_id) {
        formData.append("teacher_id", currentUser.user_id.toString());
      }

      // Các cấu hình khác (duration_minutes, total_score, max_attempts, difficulty)
      // KHÔNG gửi - để API dùng default values
      // is_published = false (mặc định từ API)

      // URL của Python AI Tool - Sử dụng endpoint đúng theo API docs
      const AI_API_URL = (process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000") + "/ai-exam/create_test";

      const response = await axios.post(AI_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        message.success("Đã sinh đề thi thành công bằng AI!");
        const testId = response.data.data.test_id;

        // Emit socket event to notify other users
        classSocketClient.emit("exam_created", { class_id: classId, test_id: testId });

        // Chuyển hướng đến trang editor để chỉnh sửa nội dung AI vừa sinh
        router.push(`/admin/classes/${classId}/examinate/ai_editor?testId=${testId}`);
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi kết nối với AI Server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Premium Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
          <RobotOutlined className="text-2xl text-white" />
        </div>
        <div>
          <Title level={4} className="mb-0! dark:text-gray-100!">
            Tạo đề thi bằng AI Agent
          </Title>
          <Text type="secondary" className="text-xs dark:text-gray-400">
            Sử dụng công nghệ RAG để sinh câu hỏi bám sát tài liệu
          </Text>
        </div>
        <Badge count="Smart Mode" style={{ backgroundColor: "#e6f4ff", color: "#0958d9", borderColor: "#91caff" }} className="ml-auto" />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          num_questions: 10,
          mode: "llamaindex",
        }}
        onFinish={onFinish}
      >
        <Form.Item name="title" className="hidden">
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <div className="flex justify-between w-full">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Mô tả hoặc Chủ đề <span className="text-red-500">*</span>
              </span>
              {uploadedFile && <Badge status="success" text={<span className="dark:text-gray-300">Đã kèm tài liệu</span>} />}
            </div>
          }
          rules={[
            {
              validator: (_, value) => {
                if (!uploadedFile?.originFileObj && !value?.trim()) {
                  return Promise.reject(new Error("Vui lòng upload file hoặc nhập mô tả/chủ đề"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea
            placeholder="Nhập nội dung tóm tắt hoặc yêu cầu cụ thể cho AI (Ví dụ: Hãy tập trung vào chương 2 - Kim loại kiềm)... Hoặc upload file tài liệu ở tab 'Tải file thủ công'"
            rows={4}
            disabled={loading}
            className="rounded-lg border-gray-200 dark:border-gray-600 hover:border-blue-400 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </Form.Item>

        <div className="mt-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-3">
            <SettingOutlined className="text-blue-600 dark:text-blue-400" />
            <span>Cấu hình AI nâng cao</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-0">
            <Form.Item
              name="num_questions"
              label={<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số lượng câu hỏi</span>}
            >
              <InputNumber min={1} max={30} disabled={loading} className="w-full rounded-lg h-10 flex items-center" />
            </Form.Item>
          </div>

          <div className="hidden">
            <Form.Item name="mode">
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="middle"
            loading={loading}
            disabled={loading}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 border-none shadow-none font-bold text-base"
          >
            {loading ? "AI ĐANG TẠO CÂU HỎI..." : "BẮT ĐẦU TẠO ĐỀ THI BẰNG AI"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
