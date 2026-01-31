"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { useState } from "react";
import NewsCard from "@/app/components/news/NewsCard";
import EventDetailModal, { EventDetail } from "@/app/components/events/EventDetailModal";

const events: EventDetail[] = [
  {
    id: 1,
    title: "Hội thảo: Công nghệ trong Giáo dục",
    date: "25/01/2024",
    time: "14:00 - 17:00",
    location: "Trực tuyến",
    status: "Sắp diễn ra",
    color: "blue",
    description: "Hội thảo sẽ tập trung vào các công nghệ mới nhất trong giáo dục, bao gồm AI, VR/AR, và các nền tảng học tập trực tuyến.",
    organizer: "Ban Giáo dục",
    participants: "100+ người tham gia",
  },
  {
    id: 2,
    title: "Workshop: Kỹ năng thuyết trình hiệu quả",
    date: "20/01/2024",
    time: "09:00 - 12:00",
    location: "Phòng A101",
    status: "Đang diễn ra",
    color: "green",
    description: "Workshop thực hành về kỹ năng thuyết trình, giúp bạn tự tin hơn khi trình bày ý tưởng trước đám đông.",
    organizer: "Trung tâm Đào tạo",
    participants: "50 người tham gia",
  },
  {
    id: 3,
    title: "Cuộc thi: Sáng tạo dự án số",
    date: "15/01/2024",
    time: "08:00 - 18:00",
    location: "Hội trường lớn",
    status: "Đã kết thúc",
    color: "gray",
    description: "Cuộc thi dành cho các dự án sáng tạo về công nghệ số, khuyến khích tinh thần đổi mới và sáng tạo.",
    organizer: "Ban Tổ chức",
    participants: "200+ thí sinh",
  },
];

export default function Events() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: EventDetail) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      <EventDetailModal 
        open={isModalOpen} 
        event={selectedEvent} 
        onCancel={() => setIsModalOpen(false)} 
      />

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -translate-x-1/2 translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-center md:text-left">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-purple-400 uppercase bg-purple-500/10 rounded-full">
              Kết nối & Chia sẻ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Sự kiện sắp diễn ra</h2>
            <p className="text-slate-400 text-lg">Đừng bỏ lỡ các hoạt động thú vị từ cộng đồng.</p>
          </div>
          
          <Link 
            href="/events" 
            prefetch={false}
            onMouseEnter={() => router.prefetch("/events")}
            className="hidden md:block"
          >
            <Button type="text" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 group">
              Xem tất cả <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
             <NewsCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                category={event.status}
                type="event"
                time={event.time}
                location={event.location}
                accentColor={
                  event.color === 'blue' ? 'border-blue-500' :
                  event.color === 'green' ? 'border-emerald-500' : 
                  'border-slate-600'
                }
                onClick={() => handleEventClick(event)}
             />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
            <Link 
              href="/events" 
              prefetch={false}
              onMouseEnter={() => router.prefetch("/events")}
            >
               <Button className="bg-[#1e293b] text-white border-slate-700 w-full h-12 rounded-xl">Xem tất cả sự kiện</Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
