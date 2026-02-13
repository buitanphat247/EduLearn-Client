"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
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
import { Form, Select, Radio, Button, Input, Spin, App, Modal, Pagination, Empty } from "antd";
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
        className="group bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-4 transition-all cursor-pointer shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{type}</span>
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
        <h4 className="text-slate-900 dark:text-slate-200 text-sm font-medium mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{previewText}</h4>
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
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  
  // Modal "Xem tất cả" states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [allHistories, setAllHistories] = useState<WritingHistoryItem[]>([]);
  const [loadingAllHistories, setLoadingAllHistories] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Refs for race condition protection
  const abortControllerRef = useRef<AbortController | null>(null);
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
        const response = await getWritingTopics(category);
        
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

  // Fetch history function - memoized with race condition protection
  const fetchHistory = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoadingHistories(true);
    const userId = getUserIdFromCookie();
    if (!userId) {
      if (isMountedRef.current) {
        setLoadingHistories(false);
      }
      return;
    }

    try {
      const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) {
        if (isMountedRef.current) {
          setLoadingHistories(false);
        }
        return;
      }

      const historyResponse = await getWritingHistory({
        user_id: userIdNumber,
        limit: 3,
        page: 1,
        order_by: "created_at",
        order_desc: true,
      });

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (historyResponse.status === 200 && historyResponse.data?.histories) {
        // Map API response to WritingHistoryItem format with proper typing
        const mappedHistories: WritingHistoryItem[] = historyResponse.data.histories.map((item: {
          id: number;
          user_id?: number;
          current_index?: number;
          created_at?: string;
          updated_at?: string;
          data?: {
            language?: string;
            topic?: string;
            difficulty?: number;
            vietnameseSentences?: string[];
            englishSentences?: string[];
            totalSentences?: number;
            practiceType?: string | null;
            contentType?: string;
            userPoints?: number;
          };
        }) => ({
          id: item.id,
          user_id: item.user_id,
          current_index: item.current_index ?? 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          // Flatten nested data fields
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
          setHistories(mappedHistories);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Error fetching history:", error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingHistories(false);
      }
    }
  }, []);

  // Initial load - Load topics first, then history (non-blocking)
  useEffect(() => {
    isMountedRef.current = true;
    
    const initData = async () => {
      try {
        // Load topics first (required for form)
        await fetchTopics("communication");
        // Set loading to false after topics load (don't wait for history)
        if (isMountedRef.current) {
          setIsInitialLoading(false);
        }
        // Load history in background (non-blocking)
        fetchHistory().catch((error) => {
          if (isMountedRef.current) {
            console.error("Error fetching history:", error);
          }
        });
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Error initializing data:", error);
          setIsInitialLoading(false);
        }
      }
    };
    
    initData();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
    (item: WritingHistoryItem, closeModal?: boolean) => {
      // Use history_id (item.id) from database as the navigation ID
      // Practice page will fetch data from API using this ID
      if (item.id) {
        // Close modal if navigating from modal
        if (closeModal && isHistoryModalOpen) {
          setIsHistoryModalOpen(false);
        }
        // Navigate using history_id (number from database)
        // No need to save to sessionStorage - practice page will fetch from API
        router.push(`/writing/${item.id}`);
      } else {
        message.error("Không tìm thấy ID của bài luyện tập");
      }
    },
    [router, message, isHistoryModalOpen]
  );

  // Fetch all histories with pagination - memoized
  const fetchAllHistories = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!isMountedRef.current) return;

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
        });

        // Check if component is still mounted
        if (!isMountedRef.current) return;

        if (historyResponse.status === 200 && historyResponse.data) {
          // Map API response to WritingHistoryItem format
          const mappedHistories: WritingHistoryItem[] = historyResponse.data.histories.map((item: {
            id: number;
            user_id?: number;
            current_index?: number;
            created_at?: string;
            updated_at?: string;
            data?: {
              language?: string;
              topic?: string;
              difficulty?: number;
              vietnameseSentences?: string[];
              englishSentences?: string[];
              totalSentences?: number;
              practiceType?: string | null;
              contentType?: string;
              userPoints?: number;
            };
          }) => ({
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
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Error fetching all histories:", error);
          message.error("Không thể tải lịch sử luyện tập");
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingAllHistories(false);
        }
      }
    },
    [message]
  );

  // Handle open "Xem tất cả" modal
  const handleOpenHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(true);
    // Fetch first page when opening modal
    fetchAllHistories(1, 10);
  }, [fetchAllHistories]);

  // Handle pagination change
  const handleHistoryPaginationChange = useCallback(
    (page: number, pageSize: number) => {
      fetchAllHistories(page, pageSize);
    },
    [fetchAllHistories]
  );

  // Handle form submit - memoized with double submit prevention
  const handleSubmit = useCallback(
    async (values: {
      goal?: string;
      method?: string;
      topic_select?: string;
      topic_custom?: string;
    }) => {
      // Prevent double submit
      if (isSubmittingRef.current || submitting) {
        return;
      }

      if (!isMountedRef.current) return;

      try {
        isSubmittingRef.current = true;
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

        const topicValue = values.topic_select || values.topic_custom;
        if (!topicValue) {
          if (isMountedRef.current) {
            message.warning("Vui lòng chọn hoặc nhập chủ đề");
            setSubmitting(false);
            setIsCreatingModalOpen(false);
          }
          isSubmittingRef.current = false;
          return;
        }

        const modeValue = values.method === "ai" ? "AI_GENERATED" : "CUSTOM";
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

        // Refresh history after creating new content (non-blocking)
        fetchHistory().catch((error) => {
          if (isMountedRef.current) {
            console.error("Error refreshing history:", error);
          }
        });

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
    [goalToLearningPurpose, message, fetchHistory, router, submitting]
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

            <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2">
              <span className="text-yellow-500 dark:text-yellow-400 text-2xl animate-pulse">✨</span>
              <span>Tạo bài luyện viết mới</span>
            </h2>

            <Form form={form} layout="vertical" className="relative z-10" onFinish={handleSubmit}>
              {/* Row 1: Language */}
              <Form.Item
                label={
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
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
                  classNames={{
                    popup: {
                      root: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }
                  }}
                  options={languageOptions}
                />
              </Form.Item>

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
                        let activeClass = "";
                        if (isSelected) {
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
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
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
                          if (item.color === "blue") activeClass = "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-500";
                          if (item.color === "purple") activeClass = "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-500";
                        } else {
                          activeClass = "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
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
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                      <span className="mr-2">📚</span>Chủ đề
                    </span>
                  }
                  name="topic_select"
                  className="mb-0"
                >
                  <Select
                    className="w-full text-sm"
                    size="middle"
                    classNames={{
                      popup: {
                        root: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      }
                    }}
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
                    className="text-sm bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/80"
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
        )}
      </div>

      {/* Right Column: Practice History */}
      <div className="lg:col-span-8">
        {isInitialLoading || loadingHistories ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700/50 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
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
              <button
                onClick={handleOpenHistoryModal}
                className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
              >
                Xem tất cả
              </button>
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
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm italic">Chưa có lịch sử luyện tập</div>
            )}

            <button className="w-full mt-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-xl transition-all">
              Xem lịch sử chi tiết
            </button>
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

      {/* History Modal - View All with Pagination */}
      <Modal
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Tất cả lịch sử luyện tập
            </span>
          </div>
        }
        footer={null}
        centered
        width={800}
        className="history-modal"
        destroyOnHidden={false} // Keep state for better UX when reopening
      >
        <div className="min-h-[400px]">
          {loadingAllHistories ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : allHistories.length > 0 ? (
            <>
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {allHistories.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onNavigate={(item) => handleHistoryNavigate(item, true)}
                  />
                ))}
              </div>
              <div className="flex justify-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <Pagination
                  current={historyPagination.current}
                  pageSize={historyPagination.pageSize}
                  total={historyPagination.total}
                  onChange={handleHistoryPaginationChange}
                  onShowSizeChange={handleHistoryPaginationChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} bài luyện tập`
                  }
                  pageSizeOptions={['10', '20', '50', '100']}
                  className="dark:[&_.ant-pagination-item]:bg-slate-800 dark:[&_.ant-pagination-item]:border-slate-700 dark:[&_.ant-pagination-item]:text-white dark:[&_.ant-pagination-item-active]:bg-blue-600 dark:[&_.ant-pagination-item-active]:border-blue-600 dark:[&_.ant-pagination-prev]:text-white dark:[&_.ant-pagination-next]:text-white dark:[&_.ant-pagination-jump-prev]:text-white dark:[&_.ant-pagination-jump-next]:text-white"
                />
              </div>
            </>
          ) : (
            <Empty
              description="Chưa có lịch sử luyện tập"
              className="py-20"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
