"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Tag } from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import NewsCard from "@/app/components/news/NewsCard";
import NewsDetailSkeleton from "@/app/components/news/NewsDetailSkeleton";
import { newsDetailData, allNews, featuredNews } from "./mock_data";

const newsData = newsDetailData;


export default function NewsDetail() {
  const router = useRouter();
  const params = useParams();
  const newsId = parseInt(params.id as string, 10);
  const news = newsData[newsId];

  // Memoize filtered lists to prevent recalculation on every render
  const featuredNewsList = useMemo(() => 
    allNews.filter((item) => featuredNews.includes(item.id)),
    [] // allNews và featuredNews are constants
  );

  const relatedNewsList = useMemo(() => 
    allNews.filter((item) => news?.relatedNews?.includes(item.id) || false),
    [news?.relatedNews]
  );

  if (!news) {
    return (
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Không tìm thấy bài viết
            </h1>
            <button
              onClick={() => router.push("/news")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Quay lại trang tin tức
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors duration-300">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            Trang chủ
          </Link>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <Link
            href="/news"
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            Tin tức và sự kiện
          </Link>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-slate-600 dark:text-slate-300 line-clamp-1">
            {news.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-lg dark:shadow-xl transition-colors duration-300">
              <Tag
                color={news.category === "Tin tức" ? "blue" : "green"}
                className="mb-4 border-none px-3 py-1"
              >
                {news.category}
              </Tag>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6 leading-tight transition-colors duration-300">
                {news.title}
              </h1>

              <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6 transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <CalendarOutlined />
                  <span>{news.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span>{news.author}</span>
                </div>
              </div>

              <div className="mb-8">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  {/* Sử dụng prose với dark:prose-invert để tự động đổi màu text trong nội dung bài viết */}
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none transition-colors duration-300">
                    {news.content.map((paragraph, index) => (
                      <p
                        key={index}
                        className={`leading-relaxed mb-4 ${paragraph.startsWith("•")
                          ? "pl-4 text-slate-700 dark:text-slate-200 italic"
                          : "text-slate-600 dark:text-slate-300"
                          }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* EduLearn Card - Moved outside article */}
            <div className="mt-8 p-8 rounded-2xl bg-blue-600 bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/10 blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Thư viện số EduLearn</h3>
                  <p className="text-blue-100 text-lg max-w-md font-medium">
                    Khám phá kho tàng tri thức vô tận với hàng ngàn tài liệu và khóa học chất lượng.
                  </p>
                </div>
                <Link
                  href="/"
                  className="group/btn relative z-10 px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-100 transition-all duration-300 shrink-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Khám phá ngay
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Widget 1: Featured News List */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-lg transition-colors duration-300">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Tin nổi bật
                </h2>
                <div className="space-y-4">
                  {featuredNewsList.map((item, index) => (
                    <div
                      key={item.id}
                      className="pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0 group transition-colors duration-300"
                    >
                      {index === 0 ? (
                        <Link href={`/news/${item.id}`} className="block mb-2">
                          <h3 className="text-base font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h3>
                          <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Xem chi tiết &gt;
                          </span>
                        </Link>
                      ) : (
                        <Link href={`/news/${item.id}`} className="block">
                          <p className="text-xs text-slate-500 mb-1">
                            {item.date}
                          </p>
                          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 2: Back to School Banner */}
              <div className="p-5 bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">BACK TO SCHOOL</h3>
                  <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                      Ebook
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                      Podcast
                    </span>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Khám Phá Ngay
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              </div>

              {/* Widget 3: CTA Block */}
              <div className="p-6 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg text-center transition-colors duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">
                  Đăng ký thành viên
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  Nhận ưu đãi và tài liệu miễn phí
                </p>
                <div className="space-y-3">
                  <button className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                    Đăng ký ngay
                  </button>
                  <button className="block w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Tìm hiểu thêm
                  </button>
                </div>
              </div>

              {/* Widget 4: Book Week Banner */}
              <div className="p-5 bg-linear-to-b from-amber-500 to-orange-600 rounded-2xl text-white relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-lg font-bold mb-1 relative z-10">
                  Tuần lễ đọc sách
                </h3>
                <p className="text-sm mb-4 relative z-10 text-white/90">
                  Khám phá thế giới sách
                </p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              {/* Widget 5: Small Banners */}
              <div className="space-y-3">
                <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-between shadow-sm transition-colors duration-300">
                  <span className="font-medium">DLIB K12 Luôn bên bạn</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-500 text-sm text-center font-medium shadow-sm transition-colors duration-300">
                  Nội dung cập nhật liên tục
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedNewsList.length > 0 && (
          <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12 transition-colors duration-300">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3 transition-colors duration-300">
              <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
              Tin tức liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNewsList.map((item) => (
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
          </div>
        )}
      </div>
    </main>
  );
}

