"use client";

import React from "react";
import { Avatar } from "antd";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    role: "Sinh viên CNTT",
    content: "Thư viện số giúp tôi tiếp cận nguồn tài liệu học lập trình chất lượng cao. Các khóa học rất thực tế và dễ hiểu.",
    avatar: "A",
    color: "#f56a00",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    role: "Giáo viên Tiếng Anh",
    content: "Công cụ hỗ trợ giảng dạy tuyệt vời. Tôi thường xuyên sử dụng để tìm kiếm tài liệu tham khảo cho bài giảng của mình.",
    avatar: "B",
    color: "#7265e6",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    role: "Học sinh THPT",
    content: "Nhờ tính năng luyện thi trực tuyến, em đã đạt điểm cao trong kỳ thi vừa qua. Rất cảm ơn đội ngũ phát triển.",
    avatar: "C",
    color: "#ffbf00",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-purple-400 uppercase bg-purple-500/10 rounded-full">
            Cảm nhận học viên
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Mọi người nói gì về chúng tôi?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Hàng ngàn học viên đã thay đổi cuộc đời nhờ việc tự học hiệu quả qua nền tảng.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
             <div key={item.id} className="bg-[#1e293b] rounded-3xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative group">
                {/* Decorative Quote */}
                <div className="absolute top-6 right-8 text-slate-700/50 group-hover:text-blue-500/20 transition-colors duration-300">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                </div>

                <div className="flex items-center gap-4 mb-6">
                   <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                      <Avatar size={56} style={{ backgroundColor: item.color, verticalAlign: 'middle', border: '4px solid #1e293b' }}>
                        {item.avatar}
                      </Avatar>
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-lg">{item.name}</h4>
                      <p className="text-blue-400 text-sm font-medium">{item.role}</p>
                   </div>
                </div>
                
                <p className="text-slate-300 leading-relaxed italic relative z-10">"{item.content}"</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
