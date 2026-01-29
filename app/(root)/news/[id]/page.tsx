"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Tag } from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import NewsCard from "@/app/components/news/NewsCard";
import { newsDetailData, allNews, featuredNews } from "./mock_data";

const newsData = newsDetailData;


export default function NewsDetail() {
  const router = useRouter();
  const params = useParams();
  const newsId = parseInt(params.id as string, 10);
  const news = newsData[newsId];

  if (!news) {
    return (
      <main className="min-h-screen bg-[#0f172a] pb-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700">
            <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy bài viết</h1>
            <button onClick={() => router.push("/news")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">
              Quay lại trang tin tức
            </button>
          </div>
        </div>
      </main>
    );
  }

  const featuredNewsList = allNews.filter((item) => featuredNews.includes(item.id));
  const relatedNewsList = allNews.filter((item) => news.relatedNews.includes(item.id));

  return (
    <main className="min-h-screen bg-[#0f172a] pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-[#1e293b] border border-slate-700 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2">
          <Link href="/" className="text-blue-600 hover:text-blue-500 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/news" className="text-blue-600 hover:text-blue-500 transition-colors">
            Tin tức và sự kiện
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 line-clamp-1">{news.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <article className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 shadow-xl">
              <Tag color={news.category === "Tin tức" ? "blue" : "green"} className="mb-4 border-none px-3 py-1">
                {news.category}
              </Tag>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{news.title}</h1>

              <div className="flex items-center gap-6 text-slate-400 mb-8 border-b border-slate-700 pb-6">
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
                <img src={news.image} alt={news.title} className="w-full h-[400px] object-cover rounded-xl shadow-lg" />
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="prose prose-lg prose-invert max-w-none">
                    {news.content.map((paragraph, index) => (
                      <p key={index} className={`text-slate-300 leading-relaxed mb-4 ${paragraph.startsWith("•") ? "pl-4 text-slate-200" : ""}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Thư viện số</h3>
                        <p className="text-blue-100">Khám phá thêm nhiều nội dung hấp dẫn</p>
                      </div>
                      <button className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap">
                        Khám phá ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Widget 1: Featured News List */}
              <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Tin nổi bật
                </h2>
                <div className="space-y-4">
                  {featuredNewsList.map((item, index) => (
                    <div key={item.id} className="pb-4 border-b border-slate-700 last:border-0 last:pb-0 group">
                      {index === 0 ? (
                        <Link href={`/news/${item.id}`} className="block mb-2">
                          <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">{item.title}</h3>
                          <span className="text-sm text-blue-400 hover:underline">Xem chi tiết &gt;</span>
                        </Link>
                      ) : (
                        <Link href={`/news/${item.id}`} className="block">
                          <p className="text-xs text-slate-500 mb-1">{item.date}</p>
                          <h3 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 2: Back to School Banner */}
              <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">BACK TO SCHOOL</h3>
                  <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Ebook</span>
                    <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Podcast</span>
                  </div>
                  <button className="text-sm font-bold hover:underline bg-white/10 px-3 py-1.5 rounded transition-colors">Khám Phá Ngay</button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              </div>

              {/* Widget 3: CTA Block */}
              <div className="p-6 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Đăng ký thành viên</h3>
                <p className="text-slate-400 text-sm mb-4">Nhận ưu đãi và tài liệu miễn phí</p>
                <div className="space-y-3">
                  <button className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                    Đăng ký ngay
                  </button>
                  <button className="block w-full border border-slate-600 text-slate-300 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                    Tìm hiểu thêm
                  </button>
                </div>
              </div>

              {/* Widget 4: Book Week Banner */}
              <div className="p-5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-2xl text-white relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-lg font-bold mb-1 relative z-10">Tuần lễ đọc sách</h3>
                <p className="text-sm mb-4 relative z-10 text-white/90">Khám phá thế giới sách</p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              {/* Widget 5: Small Banners */}
              <div className="space-y-3">
                <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center justify-between shadow-sm">
                  <span className="font-medium">DLIB K12 Luôn bên bạn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm text-center font-medium shadow-sm">
                  Nội dung cập nhật liên tục
                </div>
              </div>

            </div>
          </div>
        </div>

        {relatedNewsList.length > 0 && (
          <div className="mt-16 border-t border-slate-800 pt-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
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

