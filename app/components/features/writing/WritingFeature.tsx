"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CommentOutlined,
  ReadOutlined,
  ProjectOutlined,
  RocketOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  RightOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Form, Spin, App, Modal, Pagination, Empty } from "antd";
import {
  getWritingTopics,
  generateWritingContent,
  getWritingHistory,
  type WritingTopic,
  type WritingGenerateConfig,
  type WritingHistoryItem,
} from "@/lib/api/writing";
import { getUsageStatusForFeature, type FeatureUsageStatus } from "@/lib/api/subscription";
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
        return parts.slice(1).join(":").trim() || firstSentence;
      }
      return "Chủ đề luyện viết";
    }, [item.vietnameseSentences]);

    const languageInfo = useMemo(() => {
      const map: Record<string, { label: string, flag: string }> = {
        "English": { label: "Tiếng Anh", flag: "🇬🇧" },
        "Chinese": { label: "Tiếng Trung", flag: "🇨🇳" },
        "Korean": { label: "Tiếng Hàn", flag: "🇰🇷" },
        "Japanese": { label: "Tiếng Nhật", flag: "🇯🇵" },
        "German": { label: "Tiếng Đức", flag: "🇩🇪" },
      };
      return map[item.language || "English"] || { label: item.language || "Unknown", flag: "🌐" };
    }, [item.language]);

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
        className="group bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-4 transition-all cursor-pointer shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{type}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{languageInfo.flag} {languageInfo.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {progressInfo && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${progressInfo.isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  }`}
              >
                {progressInfo.text}
              </span>
            )}
            {item.userPoints !== undefined && item.userPoints > 0 && (
              <span className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                <StarFilled className="text-[10px]" /> {item.userPoints.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <h4 className="text-slate-900 dark:text-slate-200 text-sm font-medium mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{previewText}</h4>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">Mã chủ đề: {item.topic}</div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ClockCircleOutlined /> {relativeTime}
          </span>
          <RightOutlined className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600 dark:text-blue-400" />
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
      prevProps.item.language === nextProps.item.language &&
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);

  // History states
  const [allHistories, setAllHistories] = useState<WritingHistoryItem[]>([]);
  const [loadingAllHistories, setLoadingAllHistories] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Số lượt tạo bài còn lại (theo gói)
  const [writingUsage, setWritingUsage] = useState<FeatureUsageStatus | null>(null);

  // Refs for race condition protection
  const abortControllerRef = useRef<AbortController | null>(null);
  const historyAbortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  // Map goal value to category - memoized
  const goalToCategory = useCallback((goal: string): "general" | "ielts" | "work" | undefined => {
    if (goal === "communication") return "general";
    if (goal === "ielts") return "ielts";
    if (goal === "work") return "work";
    return undefined;
  }, []);

  // Fetch topics when goal changes - memoized with race condition protection
  const fetchTopics = useCallback(
    async (goal: string) => {
      const category = goalToCategory(goal);
      if (!category || !isMountedRef.current) return;

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoadingTopics(true);
      try {
        const response = await getWritingTopics(category, abortController.signal);

        // Check if component is still mounted and request not cancelled
        if (!isMountedRef.current || abortController.signal.aborted) {
          return;
        }

        if (response.status === 200 && response.data) {
          setTopics(response.data);
          // Reset topic_select when topics change
          if (isMountedRef.current) {
            form.setFieldsValue({ topic_select: undefined });
          }
        } else {
          if (isMountedRef.current) {
            message.warning("Không có dữ liệu chủ đề");
            setTopics({});
          }
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        if (isMountedRef.current) {
          message.error(error?.message || "Không thể tải danh sách chủ đề");
          setTopics({});
        }
      } finally {
        if (isMountedRef.current && !abortController.signal.aborted) {
          setLoadingTopics(false);
        }
      }
    },
    [goalToCategory, message, form]
  );

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
        router.push(`/writing/${item.id}`);
      } else {
        message.error("Không tìm thấy ID của bài luyện tập");
      }
    },
    [router, message]
  );

  // Fetch all histories with pagination - memoized
  const fetchAllHistories = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!isMountedRef.current) return;

      // Cancel previous history request if exists
      if (historyAbortControllerRef.current) {
        historyAbortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      historyAbortControllerRef.current = abortController;

      setLoadingAllHistories(true);
      const userId = getUserIdFromCookie();
      if (!userId) {
        if (isMountedRef.current) {
          setLoadingAllHistories(false);
        }
        return;
      }

      try {
        const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
        if (isNaN(userIdNumber) || userIdNumber <= 0) {
          if (isMountedRef.current) {
            setLoadingAllHistories(false);
          }
          return;
        }

        const historyResponse = await getWritingHistory({
          user_id: userIdNumber,
          limit: pageSize,
          page: page,
          order_by: "created_at",
          order_desc: true,
        }, abortController.signal);

        // Check if component is still mounted and request not cancelled
        if (!isMountedRef.current || abortController.signal.aborted) {
          return;
        }

        if (historyResponse.status === 200 && historyResponse.data) {
          // Map API response to WritingHistoryItem format
          const mappedHistories: WritingHistoryItem[] = historyResponse.data.histories.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            current_index: item.current_index ?? 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
            language: (item.data?.language || "English") as "English",
            topic: item.data?.topic || "",
            difficulty: item.data?.difficulty || 2,
            vietnameseSentences: item.data?.vietnameseSentences || [],
            englishSentences: item.data?.englishSentences || [],
            totalSentences: item.data?.totalSentences || 0,
            practiceType: item.data?.practiceType || null,
            contentType: (item.data?.contentType || "DIALOGUE") as "DIALOGUE",
            userPoints: item.data?.userPoints || 0,
          }));

          if (isMountedRef.current) {
            setAllHistories(mappedHistories);
            setHistoryPagination({
              current: historyResponse.data.page || page,
              pageSize: historyResponse.data.limit || pageSize,
              total: historyResponse.data.total || 0,
            });
          }
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        if (isMountedRef.current) {
          console.error("Error fetching all histories:", error);
          message.error("Không thể tải lịch sử luyện tập");
        }
      } finally {
        if (isMountedRef.current && !abortController.signal.aborted) {
          setLoadingAllHistories(false);
        }
      }
    },
    [message]
  );



  // Handle pagination change
  const handleHistoryPaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchAllHistories(page, pageSize);
    },
    [fetchAllHistories]
  );

  // Initial load - Nhiều luồng chạy song song để tăng tốc màn hình tạo bài
  useEffect(() => {
    isMountedRef.current = true;

    const initData = async () => {
      try {
        const [_, __, usage] = await Promise.all([
          fetchTopics("communication"),
          fetchAllHistories(1, 10).catch((error) => {
            if (isMountedRef.current) console.error("Error fetching history:", error);
          }),
          getUsageStatusForFeature("ai_writing").catch(() => ({
            allowed: false,
            currentCount: 0,
            limit: 0,
          })),
        ]);
        if (isMountedRef.current) {
          if (usage) setWritingUsage(usage);
          setIsInitialLoading(false);
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Error initializing data:", error);
          setIsInitialLoading(false);
        }
      }
    };

    initData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopics, fetchAllHistories]);

  // Handle form submit - memoized with double submit prevention
  const handleSubmit = useCallback(
    async (values: {
      goal?: string;
      difficulty?: number;
      topic_select?: string;
      language?: string;
    }) => {
      // Lock synchronously so double-click / Strict Mode second invoke cannot pass
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      if (submitting) {
        isSubmittingRef.current = false;
        return;
      }

      if (!isMountedRef.current) {
        isSubmittingRef.current = false;
        return;
      }

      try {
        setSubmitting(true);
        setIsCreatingModalOpen(true); // Open modal when starting

        // Get user_id from cookie
        const userId = getUserIdFromCookie();
        if (!userId) {
          if (isMountedRef.current) {
            message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            setSubmitting(false);
            setIsCreatingModalOpen(false);
          }
          isSubmittingRef.current = false;
          return;
        }

        const topicValue = values.topic_select;
        if (!topicValue) {
          if (isMountedRef.current) {
            message.warning("Vui lòng chọn chủ đề");
            setSubmitting(false);
            setIsCreatingModalOpen(false);
          }
          isSubmittingRef.current = false;
          return;
        }

        const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

        if (isNaN(userIdNumber) || userIdNumber <= 0) {
          if (isMountedRef.current) {
            message.error("User ID không hợp lệ");
            setSubmitting(false);
            setIsCreatingModalOpen(false);
          }
          isSubmittingRef.current = false;
          return;
        }

        const config: WritingGenerateConfig = {
          difficulty: values.difficulty || 2,
          learningPurpose: goalToLearningPurpose(values.goal || "communication"),
          topic: topicValue,
          user_id: userIdNumber,
          targetLanguage: values.language || "English",
        };

        const response = await generateWritingContent(config);

        // Check if component is still mounted
        if (!isMountedRef.current) {
          isSubmittingRef.current = false;
          return;
        }

        // Validate response has ID before proceeding
        if (!response?.id) {
          message.error("Không nhận được ID từ server. Vui lòng thử lại.");
          setSubmitting(false);
          setIsCreatingModalOpen(false);
          isSubmittingRef.current = false;
          return;
        }

        // Store data in sessionStorage to pass to practice page
        try {
          sessionStorage.setItem(`writing_${response.id}`, JSON.stringify(response));
        } catch (storageError) {
          console.warn("Failed to save to sessionStorage:", storageError);
          // Continue anyway - practice page can fetch from API
        }

        // Refresh history and lượt tạo bài còn lại (non-blocking)
        fetchAllHistories(1, 10).catch((error) => {
          if (isMountedRef.current) {
            console.error("Error refreshing history:", error);
          }
        });
        getUsageStatusForFeature("ai_writing").then(setWritingUsage).catch(() => {});

        // Close modal and navigate to practice page
        setIsCreatingModalOpen(false);
        router.push(`/writing/${response.id}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Không thể tạo bài luyện viết";
        if (isMountedRef.current) {
          message.error(errorMessage);
          setIsCreatingModalOpen(false);
        }
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
        isSubmittingRef.current = false;
      }
    },
    [goalToLearningPurpose, message, fetchAllHistories, router, submitting]
  );

  const goalOptions = useMemo(
    () => [
      { value: "communication", icon: <CommentOutlined />, label: "Giao tiếp", color: "red" },
      { value: "ielts", icon: <ReadOutlined />, label: "IELTS", color: "blue" },
      { value: "work", icon: <ProjectOutlined />, label: "Công việc", color: "amber" },
    ],
    []
  );

  const languageOptions = useMemo(
    () => [
      { value: "English", label: "Tiếng Anh", flag: "🇬🇧" },
      { value: "Chinese", label: "Tiếng Trung", flag: "🇨🇳" },
      { value: "Korean", label: "Tiếng Hàn", flag: "🇰🇷" },
      { value: "Japanese", label: "Tiếng Nhật", flag: "🇯🇵" },
      { value: "German", label: "Tiếng Đức", flag: "🇩🇪" },
    ],
    []
  );

  const difficultyOptions = useMemo(
    () => [
      { value: 1, label: "Dễ", color: "emerald", icon: "🌱" },
      { value: 2, label: "Trung bình", color: "blue", icon: "⭐" },
      { value: 3, label: "Khó", color: "amber", icon: "🔥" },
      { value: 4, label: "Rất khó", color: "orange", icon: "⚡" },
      { value: 5, label: "Siêu khó", color: "red", icon: "💀" },
    ],
    []
  );

  // Memoized topic options from topics state

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Configuration Form */}
      <div className="lg:col-span-4">
        {isInitialLoading ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700/50 rounded-lg mx-auto mb-6" />
            <div className="space-y-6">
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg" />
              <div className="h-20 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg" />
              <div className="h-20 w-full bg-slate-100 dark:bg-slate-700/30 rounded-lg" />
              <div className="h-11 w-full bg-slate-200 dark:bg-slate-700/50 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <span className="text-yellow-500 dark:text-yellow-400 text-2xl animate-pulse">✨</span>
              <span>Tạo bài luyện viết mới</span>
            </h2>
            {writingUsage != null && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                {writingUsage.limit === -1
                  ? "Không giới hạn lượt tạo bài"
                  : writingUsage.limit === 0
                    ? "Tính năng chưa được bật cho gói của bạn"
                    : `Còn ${Math.max(0, writingUsage.limit - writingUsage.currentCount)} / ${writingUsage.limit} lượt tạo bài hôm nay`}
              </p>
            )}

            <Form form={form} layout="vertical" className="relative z-10" onFinish={handleSubmit}>
              {/* Row 1: Target Language */}
              <div className="space-y-3 mb-6">
                <Form.Item
                  label={
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-base">
                      <span className="mr-2">🌍</span>Ngôn ngữ
                    </span>
                  }
                  name="language"
                  initialValue="English"
                  className="mb-0"
                >
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue, setFieldsValue }) => (
                      <div className="relative">
                        <select
                          className={`w-full h-10 px-3 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none`}
                          value={getFieldValue("language") || "English"}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            setFieldsValue({ language: newLang });
                            if (newLang !== "English" && getFieldValue("goal") === "ielts") {
                              setFieldsValue({ goal: "communication" });
                              handleGoalChange("communication");
                            }
                          }}
                        >
                          {languageOptions.map((lang) => (
                            <option key={lang.value} value={lang.value} className="font-normal text-slate-700 dark:text-slate-300">
                              {lang.flag} {lang.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 dark:text-slate-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </Form.Item>
              </div>

              {/* Row 2: Learning Goal */}
              <Form.Item
                label={
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-base">
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
                        const currentLang = getFieldValue("language") || "English";
                        const isDisabled = item.value === "ielts" && currentLang !== "English";

                        let activeClass = "";
                        if (isDisabled) {
                          activeClass = "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60";
                        } else if (isSelected) {
                          if (item.color === "red") activeClass = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-500";
                          if (item.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-500";
                          if (item.color === "amber") activeClass = "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-500";
                        } else {
                          activeClass = "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (isDisabled) return;
                              setFieldsValue({ goal: item.value });
                              handleGoalChange(item.value);
                            }}
                            disabled={isDisabled}
                            title={isDisabled ? "IELTS chỉ hỗ trợ đối với Tiếng Anh" : ""}
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

              {/* Row 3: Difficulty */}
              <Form.Item
                label={
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                    <span className="mr-2">📊</span>Độ khó
                  </span>
                }
                name="difficulty"
                initialValue={2}
                className="mb-4"
              >
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {difficultyOptions.map((item) => (
                    <Form.Item shouldUpdate noStyle key={item.value}>
                      {({ getFieldValue, setFieldsValue }) => {
                        const isSelected = getFieldValue("difficulty") === item.value;
                        let activeClass = "";
                        if (isSelected) {
                          if (item.color === "emerald") activeClass = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-500";
                          if (item.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-500";
                          if (item.color === "amber") activeClass = "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-500";
                          if (item.color === "orange") activeClass = "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-500";
                          if (item.color === "red") activeClass = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-500";
                        } else {
                          activeClass = "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => setFieldsValue({ difficulty: item.value })}
                            className={`h-10 px-3 flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg border transition-all whitespace-nowrap ${activeClass}`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
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
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                      <span className="mr-2">📚</span>Chủ đề
                    </span>
                  }
                  name="topic_select"
                  className="mb-0"
                >
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue, setFieldsValue }) => (
                      <div className="relative">
                        <select
                          className={`w-full h-10 px-3 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none ${!getFieldValue("topic_select") ? "text-slate-400 dark:text-slate-500" : ""}`}
                          value={getFieldValue("topic_select") || ""}
                          onChange={(e) => setFieldsValue({ topic_select: e.target.value })}
                          disabled={loadingTopics}
                        >
                          <option value="" disabled hidden>Chọn chủ đề...</option>
                          {Object.entries(topics).map(([groupName, topicList]) => (
                            <optgroup key={groupName} label={groupName} className="font-semibold text-slate-900 dark:text-slate-200">
                              {Array.isArray(topicList) && topicList.map((topic) => (
                                <option key={`${groupName}-${topic.value}`} value={topic.value} className="font-normal text-slate-700 dark:text-slate-300">
                                  {topic.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 dark:text-slate-500">
                          {loadingTopics ? (
                            <Spin size="small" />
                          ) : (
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </Form.Item>
                </Form.Item>
              </div>

              <button
                type="submit"
                disabled={submitting || (writingUsage != null && !writingUsage.allowed)}
                className={`flex items-center justify-center gap-2 w-full mt-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 text-base font-bold h-11 rounded-xl transition-all ${submitting || (writingUsage != null && !writingUsage.allowed) ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {submitting ? <Spin size="small" /> : <RocketOutlined />}
                {writingUsage != null && !writingUsage.allowed ? "Đã hết lượt tạo bài" : "Bắt đầu luyện viết"}
              </button>
            </Form>
          </div>
        )}
      </div>

      {/* Right Column: Practice History */}
      <div className="lg:col-span-8">
        {isInitialLoading ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/30 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl sticky top-8 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HistoryOutlined className="text-blue-600 dark:text-blue-400" />
                Lịch sử luyện tập
              </h3>
            </div>

            {loadingAllHistories ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : allHistories.length > 0 ? (
              <>
                <div className="space-y-4 mb-6 pr-2 custom-scrollbar">
                  {allHistories.map((item) => (
                    <HistoryItem key={item.id} item={item} onNavigate={handleHistoryNavigate} />
                  ))}
                </div>
                {historyPagination.total > 0 && (
                  <div className="flex justify-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Pagination
                      current={historyPagination.current}
                      pageSize={historyPagination.pageSize}
                      total={historyPagination.total}
                      onChange={handleHistoryPaginationChange}
                      onShowSizeChange={handleHistoryPaginationChange}
                      showSizeChanger={false}
                      showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bài`}
                      className="dark:[&_.ant-pagination-item]:bg-slate-800 dark:[&_.ant-pagination-item]:border-slate-700 dark:[&_.ant-pagination-item]:text-white dark:[&_.ant-pagination-item-active]:bg-blue-600 dark:[&_.ant-pagination-item-active]:border-blue-600 dark:[&_.ant-pagination-prev]:text-white dark:[&_.ant-pagination-next]:text-white"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm italic">
                <Empty description="Chưa có lịch sử luyện tập" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creating Modal - Cannot be closed while creating */}
      <Modal
        open={isCreatingModalOpen}
        closable={false}
        maskClosable={false}
        footer={null}
        centered
        width={400}
        keyboard={false} // Prevent ESC key from closing
        destroyOnHidden={false} // Keep modal state for better UX
      >
        <div className="text-center py-6">
          <Spin size="large" className="mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Đang tạo bài luyện viết
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Vui lòng đợi trong giây lát...
          </p>
        </div>
      </Modal>


    </div>
  );
}
