"use client";

import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NewsCard from "@/app/components/news/NewsCard";

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
];

export default function News() {
  const router = useRouter();
  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div className="text-center md:text-left">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full">
                News Center
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Tin tức & Sự kiện</h2>
              <p className="text-slate-400 text-lg">Cập nhật xu hướng công nghệ và giáo dục mới nhất.</p>
           </div>
           
           <Link 
             href="/news" 
             prefetch={false}
             onMouseEnter={() => router.prefetch("/news")}
             className="hidden md:block"
           >
              <Button type="text" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 group">
                Xem tất cả <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Button>
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
             <NewsCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.excerpt}
                image={item.image}
                date={item.date}
                category={item.category}
                type="news"
             />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
            <Link 
              href="/news" 
              prefetch={false}
              onMouseEnter={() => router.prefetch("/news")}
            >
               <Button className="bg-[#1e293b] text-white border-slate-700 w-full h-12 rounded-xl">Xem tất cả tin tức</Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
