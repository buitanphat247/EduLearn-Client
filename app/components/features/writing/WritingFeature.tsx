"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
  CommentOutlined,
  ReadOutlined,
  ProjectOutlined,
  RobotOutlined,
  EditOutlined,
  RocketOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  RightOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Form, Select, Radio, Button, Input, Spin, App } from "antd";
import {
  getWritingTopics,
  generateWritingContent,
  getWritingHistory,
  type WritingTopic,
  type WritingGenerateConfig,
  type WritingHistoryItem,
  type WritingGenerateResponse,
} from "@/lib/api/writing";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import WritingFeatureSkeleton from "./WritingFeatureSkeleton";

// Memoized History Item Component with custom comparison
const HistoryItem = memo(
  ({ item, onNavigate }: { item: WritingHistoryItem; onNavigate: (item: WritingHistoryItem) => void }) => {
  const type = useMemo(() => {
    if (item.practiceType === "IELTS") return "IELTS";
    if (item.practiceType === "WORK") return "Công việc";
    return "Giao tiếp";
  }, [item.practiceType]);

  const previewText = useMemo(() => {
    if (item.vietnameseSentences && item.vietnameseSentences.length > 0) {
      const firstSentence = item.vietnameseSentences[0];
      const parts = firstSentence.split(":");
      return parts.slice(1).join(":").trim();
    }
    return item.topic || "Chủ đề luyện viết";
  }, [item.vietnameseSentences, item.topic]);

  const relativeTime = useMemo(() => {
    if (!item.created_at) return "Vừa xong";
    const date = new Date(item.created_at);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  }, [item.created_at]);

  // Calculate progress: current_index / totalSentences
  const progressInfo = useMemo(() => {
    const currentIndex = typeof item.current_index === "number" ? item.current_index : 0;
    const total = item.totalSentences || 0;
    
    if (total === 0) return null;
    
    // If current_index >= total, means completed
    if (currentIndex >= total) {
      return { text: "Hoàn thành", isCompleted: true };
    }
    
    // Show current progress (current_index is 0-based, so display current_index + 1)
    return { text: `Câu ${currentIndex + 1}/${total}`, isCompleted: false };
  }, [item.current_index, item.totalSentences]);

  return (
    <div
      onClick={() => onNavigate(item)}
      className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{type}</span>
        <div className="flex items-center gap-2">
          {progressInfo && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                progressInfo.isCompleted
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/20"
              }`}
            >
              {progressInfo.text}
            </span>
          )}
          {item.userPoints !== undefined && item.userPoints > 0 && (
            <span className="text-amber-400 text-xs font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <StarFilled className="text-[10px]" /> {item.userPoints.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <h4 className="text-slate-200 text-sm font-medium mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">{previewText}</h4>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <ClockCircleOutlined /> {relativeTime}
        </span>
        <RightOutlined className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
      </div>
    </div>
  );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent re-render if item data hasn't changed
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.current_index === nextProps.item.current_index &&
      prevProps.item.userPoints === nextProps.item.userPoints &&
      prevProps.item.totalSentences === nextProps.item.totalSentences &&
      prevProps.item.topic === nextProps.item.topic &&
      prevProps.item.practiceType === nextProps.item.practiceType &&
      prevProps.item.created_at === nextProps.item.created_at &&
      prevProps.item.vietnameseSentences?.[0] === nextProps.item.vietnameseSentences?.[0] &&
      prevProps.onNavigate === nextProps.onNavigate
    );
  }
);

HistoryItem.displayName = "HistoryItem";

export default function WritingFeature() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [topics, setTopics] = useState<Record<string, WritingTopic[]>>({});
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [histories, setHistories] = useState<WritingHistoryItem[]>([]);
  const [loadingHistories, setLoadingHistories] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Helper function to log topics for debugging - memoized
  const logTopics = useCallback((topicsData: Record<string, WritingTopic[]>) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Topics data:", topicsData);
      Object.entries(topicsData).forEach(([groupName, topicList]) => {
        console.log(`Group: ${groupName}, Topics count: ${topicList?.length || 0}`);
        topicList?.forEach((topic) => {
          console.log(`  - ${topic.label} (${topic.value})`);
        });
      });
    }
  }, []);

  // Map goal value to category - memoized
  const goalToCategory = useCallback((goal: string): "general" | "ielts" | "work" | undefined => {
    if (goal === "communication") return "general";
    if (goal === "ielts") return "ielts";
    if (goal === "work") return "work";
    return undefined;
  }, []);

  // Fetch topics when goal changes - memoized
  const fetchTopics = useCallback(
    async (goal: string) => {
      const category = goalToCategory(goal);
      if (!category) return;

      setLoadingTopics(true);
      try {
        const response = await getWritingTopics(category);
        if (response.status === 200 && response.data) {
          // Log để debug
          logTopics(response.data);
          setTopics(response.data);
          // Reset topic_select when topics change
          form.setFieldsValue({ topic_select: undefined });
        } else {
          message.warning("Không có dữ liệu chủ đề");
          setTopics({});
        }
      } catch (error: any) {
        message.error(error?.message || "Không thể tải danh sách chủ đề");
        setTopics({});
      } finally {
        setLoadingTopics(false);
      }
    },
    [goalToCategory, logTopics, message, form]
  );

  // Fetch history function - memoized
  const fetchHistory = useCallback(async () => {
    setLoadingHistories(true);
    const userId = getUserIdFromCookie();
    if (!userId) {
      setLoadingHistories(false);
      return;
    }

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) {
        setLoadingHistories(false);
        return;
      }

      const historyResponse = await getWritingHistory({
        user_id: userIdNumber,
        limit: 3,
        page: 1,
        order_by: "created_at",
        order_desc: true,
      });
      if (historyResponse.status === 200 && historyResponse.data?.histories) {
        // Map API response to WritingHistoryItem format
        // API response has nested structure: { id, current_index, data: { vietnameseSentences, totalSentences, ... } }
        const mappedHistories: WritingHistoryItem[] = historyResponse.data.histories.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          current_index: item.current_index ?? 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          // Flatten nested data fields
          language: item.data?.language || "English",
          topic: item.data?.topic || "",
          difficulty: item.data?.difficulty || 2,
          vietnameseSentences: item.data?.vietnameseSentences || [],
          englishSentences: item.data?.englishSentences || [],
          totalSentences: item.data?.totalSentences || 0,
          practiceType: item.data?.practiceType || null,
          contentType: item.data?.contentType || "DIALOGUE",
          userPoints: item.data?.userPoints || 0,
        }));
        setHistories(mappedHistories);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistories(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([fetchTopics("communication"), fetchHistory()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, [fetchTopics, fetchHistory]);

  // Map goal to learningPurpose - memoized
  const goalToLearningPurpose = useCallback((goal: string): "COMMUNICATION" | "IELTS" | "WORK" => {
    if (goal === "communication") return "COMMUNICATION";
    if (goal === "ielts") return "IELTS";
    if (goal === "work") return "WORK";
    return "COMMUNICATION";
  }, []);

  // Watch for goal changes - memoized
  const handleGoalChange = useCallback(
    (goal: string) => {
      form.setFieldsValue({ goal });
      fetchTopics(goal);
    },
    [form, fetchTopics]
  );

  // Handle navigation to practice page - memoized
  const handleHistoryNavigate = useCallback(
    (item: WritingHistoryItem) => {
      // Use history_id (item.id) from database as the navigation ID
      // Practice page will fetch data from API using this ID
      if (item.id) {
        // Navigate using history_id (number from database)
        // No need to save to sessionStorage - practice page will fetch from API
        router.push(`/features/writing/${item.id}`);
      } else {
        message.error("Không tìm thấy ID của bài luyện tập");
      }
    },
    [router, message]
  );

  // Handle form submit - memoized
  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        setSubmitting(true);

        // Get user_id from cookie
        const userId = getUserIdFromCookie();
        if (!userId) {
          message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          setSubmitting(false);
          return;
        }

        const topicValue = values.topic_select || values.topic_custom;
        if (!topicValue) {
          message.warning("Vui lòng chọn hoặc nhập chủ đề");
          setSubmitting(false);
          return;
        }

        const modeValue = values.method === "ai" ? "AI_GENERATED" : "CUSTOM";
        const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

        if (isNaN(userIdNumber)) {
          message.error("User ID không hợp lệ");
          setSubmitting(false);
          return;
        }

        const config: WritingGenerateConfig = {
          contentType: "DIALOGUE",
          customTopic: !!values.topic_custom && !values.topic_select,
          customTopicText: values.topic_custom || "",
          difficulty: 2, // Default difficulty
          language: "English",
          learningPurpose: goalToLearningPurpose(values.goal || "communication"),
          mode: modeValue as "AI_GENERATED" | "CUSTOM",
          topic: topicValue,
          user_id: userIdNumber,
        };

        const response = await generateWritingContent(config);

        // Store data in sessionStorage to pass to practice page
        sessionStorage.setItem(`writing_${response.id}`, JSON.stringify(response));

        // Refresh history after creating new content
        await fetchHistory();

        // Navigate to practice page with generated content ID
        router.push(`/features/writing/${response.id}`);
      } catch (error: any) {
        message.error(error?.message || "Không thể tạo bài luyện viết");
      } finally {
        setSubmitting(false);
      }
    },
    [goalToLearningPurpose, message, fetchHistory, router]
  );

  // Memoized static options
  const languageOptions = useMemo(
    () => [
      {
        value: "en",
        label: (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-base">🇬🇧</span> Tiếng Anh
          </span>
        ),
      },
      {
        value: "vi",
        label: (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-base">🇻🇳</span> Tiếng Việt
          </span>
        ),
      },
    ],
    []
  );

  const goalOptions = useMemo(
    () => [
      { value: "communication", icon: <CommentOutlined />, label: "Giao tiếp", color: "red" },
      { value: "ielts", icon: <ReadOutlined />, label: "IELTS", color: "blue" },
      { value: "work", icon: <ProjectOutlined />, label: "Công việc", color: "amber" },
    ],
    []
  );

  const methodOptions = useMemo(
    () => [
      { value: "ai", icon: <RobotOutlined />, label: "AI tạo từ chủ đề", color: "blue" },
      { value: "custom", icon: <EditOutlined />, label: "Tự nhập đoạn văn", color: "purple" },
    ],
    []
  );

  // Memoized topic options from topics state
  const topicOptions = useMemo(() => {
    return Object.entries(topics).flatMap(([groupName, topicList]) => {
      const validTopics = Array.isArray(topicList) ? topicList : [];
      return validTopics.map((topic: WritingTopic) => ({
        value: topic.value,
        label: <span className="text-sm">{topic.label}</span>,
        key: `${groupName}-${topic.value}`,
      }));
    });
  }, [topics]);

  if (isInitialLoading) {
    return <WritingFeatureSkeleton />;
  }

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Configuration Form */}
      <div className="lg:col-span-4">
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <h2 className="text-xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-2xl animate-pulse">✨</span>
            <span>Tạo bài luyện viết mới</span>
          </h2>

          <Form form={form} layout="vertical" className="relative z-10" onFinish={handleSubmit}>
            {/* Row 1: Language */}
            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  <span className="mr-2">🌍</span>Ngôn ngữ
                </span>
              }
              name="language"
              initialValue="en"
              className="mb-4"
            >
              <Select
                className="w-full text-sm"
                disabled
                size="middle"
                popupClassName="bg-slate-800 border border-slate-700"
                options={languageOptions}
              />
            </Form.Item>

            {/* Row 2: Learning Goal */}
            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-base">
                  <span className="mr-2">🎯</span>Mục đích học
                </span>
              }
              name="goal"
              initialValue="communication"
              className="mb-5"
            >
              <div className="grid grid-cols-3 gap-3">
                {goalOptions.map((item) => (
                  <Form.Item shouldUpdate noStyle key={item.value}>
                    {({ getFieldValue, setFieldsValue }) => {
                      const isSelected = getFieldValue("goal") === item.value;
                      let activeClass = "";
                      if (isSelected) {
                        if (item.color === "red") activeClass = "bg-red-500/10 border-red-500 text-red-500";
                        if (item.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-500";
                        if (item.color === "amber") activeClass = "bg-amber-500/10 border-amber-500 text-amber-500";
                      } else {
                        activeClass = "bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800";
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setFieldsValue({ goal: item.value });
                            handleGoalChange(item.value);
                          }}
                          className={`h-10 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg border transition-all ${activeClass}`}
                        >
                          {item.icon} {item.label}
                        </button>
                      );
                    }}
                  </Form.Item>
                ))}
              </div>
            </Form.Item>

            {/* Row 3: Method */}
            <Form.Item
              label={
                <span className="text-slate-300 font-medium text-sm">
                  <span className="mr-2">📝</span>Cách tạo bài
                </span>
              }
              name="method"
              initialValue="ai"
              className="mb-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {methodOptions.map((item) => (
                  <Form.Item shouldUpdate noStyle key={item.value}>
                    {({ getFieldValue, setFieldsValue }) => {
                      const isSelected = getFieldValue("method") === item.value;
                      let activeClass = "";
                      if (isSelected) {
                        if (item.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-500";
                        if (item.color === "purple") activeClass = "bg-purple-500/10 border-purple-500 text-purple-500";
                      } else {
                        activeClass = "bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800";
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => setFieldsValue({ method: item.value })}
                          className={`h-10 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg border transition-all ${activeClass}`}
                        >
                          {item.icon} {item.label}
                        </button>
                      );
                    }}
                  </Form.Item>
                ))}
              </div>
            </Form.Item>

            {/* Row 4: Topic */}
            <div className="space-y-3 mb-6">
              <Form.Item
                label={
                  <span className="text-slate-300 font-medium text-sm">
                    <span className="mr-2">📚</span>Chủ đề
                  </span>
                }
                name="topic_select"
                className="mb-0"
              >
                <Select
                  className="w-full text-sm"
                  size="middle"
                  popupClassName="bg-slate-800 border border-slate-700"
                  placeholder="Chọn chủ đề..."
                  loading={loadingTopics}
                  notFoundContent={loadingTopics ? <Spin size="small" /> : "Không có chủ đề nào"}
                  options={topicOptions}
                />
              </Form.Item>
              <Form.Item name="topic_custom" className="mb-0">
                <Input
                  size="middle"
                  placeholder="Hoặc nhập chủ đề bạn muốn viết..."
                  className="text-sm bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/80"
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-500/20 text-base font-bold h-11 rounded-xl"
              icon={<RocketOutlined />}
            >
              Bắt đầu luyện viết
            </Button>
          </Form>
        </div>
      </div>

      {/* Right Column: Practice History */}
      <div className="lg:col-span-8">
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HistoryOutlined className="text-blue-400" />
              Lịch sử luyện tập
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full cursor-pointer hover:text-white transition-colors">
              Xem tất cả
            </span>
          </div>

          {loadingHistories ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : histories.length > 0 ? (
            <div className="space-y-4">
              {histories.map((item) => (
                <HistoryItem key={item.id} item={item} onNavigate={handleHistoryNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">Chưa có lịch sử luyện tập</div>
          )}

          <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white border border-dashed border-slate-700 hover:border-slate-500 rounded-xl transition-all">
            Xem lịch sử chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
