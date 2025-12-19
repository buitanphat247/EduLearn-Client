"use client";

import { Statistic, Card } from "antd";
import { 
  RocketOutlined, 
  GlobalOutlined, 
  HeartOutlined, 
  SafetyCertificateOutlined,
  ExperimentOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";

const stats = [
  { title: "Học viên", value: "15,000+", icon: <HeartOutlined /> },
  { title: "Khóa học", value: "500+", icon: <RocketOutlined /> },
  { title: "Chuyên gia", value: "100+", icon: <ExperimentOutlined /> },
  { title: "Đánh giá 5*", value: "98%", icon: <SafetyCertificateOutlined /> },
];

export default function About() {
  return (
    <main className="min-h-screen bg-[#001529]">
      {/* 1. Hero Section - Vibrant & Dynamic */}
      <section className="relative bg-[#001529] text-white overflow-hidden pt-20 pb-32">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-3xl translate-y-1/3 translate-x-1/4"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <span className="inline-block py-1 px-4 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 mb-6 backdrop-blur-sm">
                VỀ CHÚNG TÔI
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Kiến tạo <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Tương lai số
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                Chúng tôi không chỉ cung cấp khóa học. Chúng tôi xây dựng môi trường học tập tiên tiến, nơi công nghệ và tri thức hòa quyện.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1">
                  Tham gia ngay
                </button>
                <button className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold backdrop-blur-sm transition-all">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            
            {/* Right Side Visual */}
            <div className="md:w-1/2 relative">
               <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2rem] rotate-3 opacity-60 blur-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] border border-white/10 shadow-2xl p-8 flex flex-col justify-center items-center text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">
                         <ThunderboltOutlined className="text-4xl text-white"/>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">EduLearn Next</h3>
                      <p className="text-gray-400">Nền tảng giáo dục 4.0</p>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce duration-[3000ms]">
                      <GlobalOutlined className="text-3xl text-purple-600"/>
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-24 h-16 bg-blue-600 rounded-xl shadow-xl flex items-center justify-center animate-pulse">
                      <span className="font-bold text-white text-xl">A+</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Stats Bar */}
      <div className="container mx-auto px-4 pb-10 -mt-16 relative z-20">
        <div className="bg-[#1e293b] rounded-3xl shadow-2xl shadow-black/40 p-8 md:p-12 border border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-700">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group px-4">
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 text-2xl group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  {stat.icon}
                </div>
                <Statistic
                  value={stat.value}
                  valueStyle={{ fontWeight: 800, fontSize: '36px', color: '#ffffff' }}
                />
                <div className="text-slate-400 font-medium mt-1 text-sm tracking-wide uppercase">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bento Grid - Mission & Vision */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden">
        {/* Decorative background elements for dark mode */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
           <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Giá trị cốt lõi</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Mission - Large Box */}
              <div className="md:col-span-2 bg-[#111827] rounded-3xl p-10 text-white shadow-xl relative overflow-hidden group border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-900/20 transition-colors duration-700"></div>
                 
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-14 h-14 bg-blue-900/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-blue-500/20">
                       <RocketOutlined className="text-3xl text-blue-400"/>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 text-white">Sứ mệnh của chúng tôi</h3>
                      <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                        Trao quyền cho người học thông qua công nghệ. Chúng tôi xây dựng cầu nối giữa tri thức hàn lâm và ứng dụng thực tiễn, giúp mọi cá nhân phát huy tối đa tiềm năng.
                      </p>
                    </div>
                 </div>
              </div>

              {/* Vision - Tall Box (Dark Mode) */}
              <div className="bg-[#111827] rounded-3xl p-10 shadow-xl border border-slate-800 flex flex-col hover:border-purple-500/30 transition-colors group">
                 <div className="w-14 h-14 bg-purple-900/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                   <HeartOutlined className="text-3xl"/>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4">Tầm nhìn</h3>
                 <p className="text-slate-400 leading-relaxed flex-1">
                   Trở thành hệ sinh thái giáo dục số 1 khu vực, nơi mỗi giờ học là một trải nghiệm đầy cảm hứng và hiệu quả.
                 </p>
              </div>

              {/* Core Values - Box 3 (Dark Mode) */}
              <div className="bg-[#111827] rounded-3xl p-10 shadow-xl border border-slate-800 hover:border-emerald-500/30 transition-colors group">
                 <div className="w-14 h-14 bg-emerald-900/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                   <SafetyCertificateOutlined className="text-3xl"/>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4">Chất lượng</h3>
                 <p className="text-slate-400 leading-relaxed">
                   Cam kết nội dung chuẩn mực, được kiểm duyệt bởi hội đồng chuyên môn uy tín.
                 </p>
              </div>

              {/* Innovation - Box 4 */}
              <div className="md:col-span-2 bg-[#111827] text-white rounded-3xl p-10 shadow-xl border border-slate-800 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                 <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-900/10 rounded-full blur-3xl group-hover:bg-cyan-900/20 transition-colors"></div>
                 
                 <div className="relative z-10 flex items-center gap-8">
                    <div className="w-14 h-14 bg-cyan-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-500/20">
                       <ExperimentOutlined className="text-3xl text-cyan-400"/>
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold mb-2 text-white">Đổi mới sáng tạo</h3>
                       <p className="text-slate-400 max-w-2xl">
                         Liên tục cập nhật công nghệ AI, Big Data vào giảng dạy để cá nhân hóa lộ trình học tập.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="py-20 bg-[#0B1120]">
         <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-[#111827] rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-800">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

               <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Sẵn sàng bứt phá?</h2>
                  <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                     Tham gia cộng đồng hơn 15,000 học viên ngay hôm nay và bắt đầu hành trình chinh phục tri thức.
                  </p>
                  <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-600/30">
                     Đăng ký miễn phí
                  </button>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}

