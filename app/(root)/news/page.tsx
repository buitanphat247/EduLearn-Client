"use client";

import { Pagination, Input, Select, ConfigProvider, theme } from "antd";
import { useState, useMemo } from "react";
import NewsCard from "@/app/components/news/NewsCard";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const news = [
  {
    id: 1,
    title: "Khai giảng khóa học mới - Nâng cao kỹ năng lập trình",
    excerpt: "Tham gia khóa học lập trình chuyên sâu với các công nghệ mới nhất...",
    image: "/images/banner/1.webp",
    date: "15/01/2024",
    category: "Tin tức",
  },
  {
    id: 2,
    title: "Hội thảo trực tuyến: Xu hướng giáo dục số 2024",
    excerpt: "Cùng các chuyên gia hàng đầu thảo luận về tương lai của giáo dục...",
    image: "/images/banner/2.webp",
    date: "12/01/2024",
    category: "Sự kiện",
  },
  {
    id: 3,
    title: "Ra mắt tính năng học tập AI mới",
    excerpt: "Trải nghiệm học tập cá nhân hóa với công nghệ trí tuệ nhân tạo...",
    image: "/images/banner/3.webp",
    date: "10/01/2024",
    category: "Tin tức",
  },
  {
    id: 4,
    title: "Chương trình khuyến mãi đặc biệt tháng 1",
    excerpt: "Giảm giá 50% cho tất cả khóa học trong tháng này...",
    image: "/images/banner/1.webp",
    date: "08/01/2024",
    category: "Tin tức",
  },
  {
    id: 5,
    title: "Workshop: Kỹ năng thuyết trình hiệu quả",
    excerpt: "Học cách thuyết trình tự tin và thu hút khán giả...",
    image: "/images/banner/2.webp",
    date: "05/01/2024",
    category: "Sự kiện",
  },
  {
    id: 6,
    title: "Cập nhật hệ thống học tập mới",
    excerpt: "Nâng cấp giao diện và tính năng để trải nghiệm tốt hơn...",
    image: "/images/banner/3.webp",
    date: "03/01/2024",
    category: "Tin tức",
  },
];

export default function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const pageSize = 6;

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  const total = filteredNews.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const categories = Array.from(new Set(news.map((item) => item.category)));

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Tin tức & Sự kiện</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Khám phá những xu hướng giáo dục mới nhất, các bài viết chuyên sâu và thông tin về các hoạt động cộng đồng sôi nổi.
          </p>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-12 max-w-4xl mx-auto">
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorBgContainer: '#1e293b',
                colorBorder: '#334155',
                colorPrimary: '#3b82f6',
                borderRadius: 12,
                controlHeight: 50,
                fontSize: 16,
              },
              components: {
                Input: {
                  activeBorderColor: '#60a5fa',
                  hoverBorderColor: '#60a5fa',
                  paddingInline: 20,
                },
                Select: {
                  optionSelectedBg: '#334155',
                }
              }
            }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  prefix={<SearchOutlined className="text-slate-400 text-xl mr-2" />}
                  placeholder="Tìm kiếm tin tức..."
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full shadow-lg shadow-black/20"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  className="w-full shadow-lg shadow-black/20"
                  onChange={handleCategoryChange}
                  options={categories.map((cat) => ({ label: cat, value: cat }))}
                />
              </div>
            </div>
          </ConfigProvider>
        </div>

        {currentNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNews.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  excerpt={item.excerpt}
                  image={item.image}
                  date={item.date}
                  category={item.category}
                />
              ))}
            </div>

            {total > pageSize && (
              <div className="flex justify-center mt-12">
                <div className="bg-white px-4 py-2 rounded-xl shadow-lg">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} tin tức`}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700">
            <p className="text-slate-400 text-lg">Không tìm thấy tin tức nào</p>
          </div>
        )}
      </div>
    </main>
  );
}
