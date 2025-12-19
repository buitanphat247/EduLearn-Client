"use client";

import { Pagination, Input, Select, ConfigProvider, theme } from "antd";
import { useState, useMemo } from "react";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import EventDetailModal, { EventDetail } from "@/app/components/events/EventDetailModal";

const { Search } = Input;

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
    color: "default",
    description: "Cuộc thi dành cho các dự án sáng tạo về công nghệ số, khuyến khích tinh thần đổi mới và sáng tạo.",
    organizer: "Ban Tổ chức",
    participants: "200+ thí sinh",
  },
  {
    id: 4,
    title: "Seminar: Phương pháp học tập hiện đại",
    date: "28/01/2024",
    time: "10:00 - 12:00",
    location: "Trực tuyến",
    status: "Sắp diễn ra",
    color: "blue",
    description: "Seminar về các phương pháp học tập hiện đại, giúp nâng cao hiệu quả học tập và phát triển kỹ năng.",
    organizer: "Phòng Đào tạo",
    participants: "80+ người tham gia",
  },
  {
    id: 5,
    title: "Training: Kỹ năng làm việc nhóm",
    date: "22/01/2024",
    time: "14:00 - 17:00",
    location: "Phòng B202",
    status: "Đang diễn ra",
    color: "green",
    description: "Khóa đào tạo về kỹ năng làm việc nhóm, giao tiếp và hợp tác hiệu quả trong môi trường làm việc.",
    organizer: "Trung tâm Phát triển Kỹ năng",
    participants: "60 người tham gia",
  },
  {
    id: 6,
    title: "Hội thảo: Tương lai của AI trong giáo dục",
    date: "12/01/2024",
    time: "09:00 - 11:00",
    location: "Hội trường lớn",
    status: "Đã kết thúc",
    color: "default",
    description: "Hội thảo về tương lai của trí tuệ nhân tạo trong giáo dục, các xu hướng và ứng dụng thực tế.",
    organizer: "Ban Công nghệ",
    participants: "150+ người tham gia",
  },
];


interface CardEventProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  color: string;
  onDetailClick?: () => void;
}

function CardEvent({ id, title, date, time, location, status, color, onDetailClick }: CardEventProps) {
  // Determine color classes based on event color
  const accentColor = color === 'blue' ? 'border-l-blue-500' : (color === 'green' ? 'border-l-emerald-500' : 'border-l-slate-500');
  const badgeClass = color === 'blue' 
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
    : (color === 'green' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700 text-slate-200 border-slate-600');

  return (
    <div
      onClick={onDetailClick}
      className={`group h-full bg-[#1e293b] rounded-2xl shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 border border-slate-700 overflow-hidden cursor-pointer relative border-l-4 ${accentColor}`}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${badgeClass}`}>
            {status}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors duration-300">
             <CalendarOutlined />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        {/* Details - Compact & Clean */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="w-8 flex justify-center"><CalendarOutlined className="text-blue-400"/></span>
            <span className="font-semibold text-slate-300">{date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
             <span className="w-8 flex justify-center"><ClockCircleOutlined className="text-orange-400"/></span>
            <span className="text-slate-300">{time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
             <span className="w-8 flex justify-center"><EnvironmentOutlined className="text-green-400"/></span>
            <span className="line-clamp-1 text-slate-300">{location}</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-700 flex items-center justify-between text-sm font-semibold text-white mt-auto">
          <span className="group-hover:text-blue-400 transition-colors">Xem chi tiết</span>
          <svg 
            className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 6;

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = !selectedStatus || event.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchText, selectedStatus]);

  const total = filteredEvents.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const statuses = Array.from(new Set(events.map((event) => event.status)));

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleEventClick = (event: EventDetail) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] pb-20">
      <div className="container mx-auto px-4 py-12">
        <EventDetailModal open={isModalOpen} event={selectedEvent} onCancel={handleModalClose} />

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Sự kiện</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Tham gia các sự kiện và hoạt động thú vị, mở rộng kiến thức và kết nối cộng đồng.
          </p>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Search & Filter Section */}
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
                  placeholder="Tìm kiếm sự kiện..."
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full shadow-lg shadow-black/20"
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                  className="w-full shadow-lg shadow-black/20"
                  onChange={handleStatusChange}
                  options={statuses.map((status) => ({ label: status, value: status }))}
                />
              </div>
            </div>
          </ConfigProvider>
        </div>

        {currentEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvents.map((event) => (
                <CardEvent
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  status={event.status}
                  color={event.color}
                  onDetailClick={() => handleEventClick(event)}
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
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-slate-400 text-lg">Không tìm thấy sự kiện nào phù hợp</p>
          </div>
        )}
      </div>
    </main>
  );
}

