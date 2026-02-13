"use client";

import { useState, useEffect } from "react";
import { Input, Collapse, ConfigProvider, theme as antTheme, Empty } from "antd";
import {
  SearchOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
  UserOutlined,
  WalletOutlined,
  BookOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/app/context/ThemeContext";



interface FAQItem {
  id: string | number;
  category: string;
  question: string;
  answer: string;
}

interface FAQClientProps {
  faqData: FAQItem[];
}

export default function FAQClient({ faqData }: FAQClientProps) {
  const { theme } = useTheme();
  const [faqs, setFaqs] = useState<FAQItem[]>(faqData || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Đồng bộ lại state khi SSR trả về data
  useEffect(() => {
    setFaqs(faqData || []);
  }, [faqData]);

  // Fallback: nếu SSR không đọc được markdown (faqData rỗng) thì gọi /api/faq (cũng đọc từ docs)
  useEffect(() => {
    if (faqData && faqData.length > 0) return;

    let cancelled = false;

    const fetchFaqFromApi = async () => {
      try {
        const res = await fetch("/api/faq", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.status && Array.isArray(json.data)) {
          setFaqs(json.data as FAQItem[]);
        }
      } catch (error) {
        console.error("Không thể tải dữ liệu FAQ từ /api/faq", error);
      }
    };

    fetchFaqFromApi();

    return () => {
      cancelled = true;
    };
  }, [faqData]);

  const categories = [
    { id: "all", label: "Tất cả", icon: <QuestionCircleOutlined /> },
    { id: "account", label: "Tài khoản", icon: <UserOutlined /> },
    { id: "courses", label: "Khóa học", icon: <BookOutlined /> },
    { id: "payment", label: "Thanh toán", icon: <WalletOutlined /> },
    { id: "technical", label: "Kỹ thuật", icon: <CodeOutlined /> },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorBgContainer: isDark ? "#1e293b" : "#ffffff",
          colorBorder: isDark ? "#334155" : "#e2e8f0",
          colorText: isDark ? "#f1f5f9" : "#1e293b",
        },
        components: {
          Input: {
            activeBorderColor: "#3b82f6",
            hoverBorderColor: "#60a5fa",
            controlHeight: 50,
            fontSize: 16,
          },
          Collapse: {
            headerBg: isDark ? "#1e293b" : "#ffffff",
            contentBg: isDark ? "#0f172a" : "#f8fafc",
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">
                Hỗ trợ khách hàng
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 leading-tight">Câu hỏi thường gặp</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Tìm kiếm câu trả lời cho những thắc mắc phổ biến nhất về nền tảng, khóa học và tài khoản của bạn.
              </p>

              <div className="max-w-2xl mx-auto relative shadow-2xl shadow-blue-500/10 dark:shadow-black/20 rounded-2xl">
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  prefix={<SearchOutlined className="text-xl text-slate-400 mr-2" />}
                  allowClear
                  size="large"
                  className="rounded-2xl! border-0! shadow-none! py-3"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar Categories */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 px-2">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3
                        ${activeCategory === cat.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                        }
                      `}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span>{cat.label}</span>
                      {activeCategory === cat.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-8 xl:col-span-9">
              {filteredFAQs.length > 0 ? (
                <Collapse
                  accordion
                  ghost
                  expandIcon={({ isActive }) => (
                    <span>
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    </span>
                  )}
                  className="bg-transparent flex flex-col gap-4 [&_.ant-collapse-header]:items-center!"
                  items={filteredFAQs.map((faq) => ({
                    key: faq.id,
                    label: (
                      <div className="flex items-start h-full py-1">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 m-0 mt-0.5">{faq.question}</h3>
                      </div>
                    ),
                    children: (
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-base pb-4 pl-4 border-l-2 border-slate-100 dark:border-slate-700 ml-2 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    ),
                    className:
                      "bg-white dark:bg-[#1e293b] rounded-2xl! border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
                  }))}
                />
              ) : (
                <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Không tìm thấy câu hỏi phù hợp</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
                      </div>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ConfigProvider>
  );
}
