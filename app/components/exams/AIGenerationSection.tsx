"use client";

import React, { useState } from "react";
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Divider, 
  Space, 
  message, 
  Spin, 
  Badge,
  Collapse,
  Card,
  Typography
} from "antd";
import { 
  RobotOutlined, 
  SettingOutlined, 
  FileTextOutlined,
  ThunderboltFilled,
  LoadingOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

interface AIGenerationSectionProps {
  uploadedFile: any;
}

export default function AIGenerationSection({ uploadedFile }: AIGenerationSectionProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      if (uploadedFile?.originFileObj) {
        formData.append("file", uploadedFile.originFileObj);
      }
      
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("num_questions", values.num_questions.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("mode", values.mode);
      formData.append("duration_minutes", values.duration_minutes.toString());
      formData.append("max_attempts", values.max_attempts.toString()); // Added
      formData.append("class_id", classId);

      // URL của Python AI Tool - Nên để trong env
      const AI_API_URL = "http://localhost:5000/question/create_test";
      
      const response = await axios.post(AI_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        message.success("Đã sinh đề thi thành công bằng AI!");
        const testId = response.data.data.test_id;
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
    <div 
      className="relative overflow-hidden bg-white"
    >
      {/* Premium Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
          <RobotOutlined className="text-2xl text-white" />
        </div>
        <div>
          <Title level={4} className="!mb-0">Tạo đề thi bằng AI Agent</Title>
          <Text type="secondary" className="text-xs">Sử dụng công nghệ RAG để sinh câu hỏi bám sát tài liệu</Text>
        </div>
        <Badge 
          count="Smart Mode" 
          style={{ backgroundColor: '#e6f4ff', color: '#0958d9', borderColor: '#91caff' }} 
          className="ml-auto"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          num_questions: 10,
          difficulty: "hard",
          mode: "llamaindex",
          duration_minutes: 45,
          max_attempts: 0 // 0 = Infinity
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label={<span className="font-semibold text-gray-700">Tên bộ đề</span>}
          rules={[{ required: true, message: "Vui lòng nhập tên bộ đề" }]}
        >
          <Input 
            placeholder="Ví dụ: Kiểm tra giữa kỳ môn Hóa học" 
            className="rounded-lg h-11 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all"
            prefix={<FileTextOutlined className="text-gray-400 mr-2" />}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <div className="flex justify-between w-full">
              <span className="font-semibold text-gray-700">Mô tả hoặc Chủ đề</span>
              {uploadedFile && <Badge status="success" text="Đã kèm tài liệu" />}
            </div>
          }
        >
          <TextArea 
            placeholder="Nhập nội dung tóm tắt hoặc yêu cầu cụ thể cho AI (Ví dụ: Hãy tập trung vào chương 2 - Kim loại kiềm)..." 
            rows={4}
            className="rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
          />
        </Form.Item>

        <div className="mt-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700 font-bold mb-3">
            <SettingOutlined className="text-blue-600" />
            <span>Cấu hình AI nâng cao</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0">
            <Form.Item name="num_questions" label={<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số lượng câu hỏi</span>}>
              <InputNumber min={1} max={30} className="w-full rounded-lg h-10 flex items-center" />
            </Form.Item>
            <Form.Item name="duration_minutes" label={<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian (phút)</span>}>
              <InputNumber min={5} max={180} className="w-full rounded-lg h-10 flex items-center" />
            </Form.Item>
            <Form.Item name="max_attempts" label={<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số lượt làm bài</span>}>
              <InputNumber min={0} max={100} className="w-full rounded-lg h-10 flex items-center" placeholder="0 = Không giới hạn" />
            </Form.Item>
          </div>

          <div className="hidden">
            <Form.Item name="difficulty">
              <Input />
            </Form.Item>
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
            size="large"
            loading={loading}
            disabled={loading}
            className="h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:opacity-90 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 font-bold text-lg transition-all transform hover:scale-[1.01] active:scale-[0.98]"
          >
            {loading ? "AI ĐANG TẠO CÂU HỎI..." : "BẮT ĐẦU TẠO ĐỀ THI BẰNG AI"}
          </Button>
        </div>

        {loading && (
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl flex items-center gap-3 animate-pulse border border-blue-100">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <div>
              <div className="text-blue-700 font-semibold text-sm">AI Agent đang đọc tài liệu...</div>
              <div className="text-blue-500 text-xs">Quá trình này có thể mất 30-60 giây tùy độ dài tài liệu.</div>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}
