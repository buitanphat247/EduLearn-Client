"use client";

import { 
  EyeOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import ScrollAnimation from "@/app/components/common/ScrollAnimation";
import Image from "next/image";
import DarkConfigProvider from "@/app/components/common/DarkConfigProvider";
// ✅ Extracted hardcoded arrays to constants file
import { ABOUT_STATS, ABOUT_VALUES, TARGET_AUDIENCES } from "./constants";

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      {/* Hero Section */}
      <ScrollAnimation direction="up" delay={0}>
        <section className="relative bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-white overflow-hidden pt-20 pb-32 transition-colors duration-500">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="container mx-auto px-4 md:px-10 relative z-10">
            <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
                      Chúng tôi xây dựng nền tảng giáo dục số với{" "}
                      <span className="text-blue-600 dark:text-blue-400">AI</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0 transition-colors duration-300">
                      Trao quyền cho trường học, giáo viên và học sinh với LMS hàng đầu cho chuyển đổi số tại Việt Nam. Trải nghiệm tương lai của giáo dục ngay hôm nay.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-colors shadow-lg shadow-blue-500/30">
                      Tìm hiểu thêm
                    </button>
                    <button className="h-12 px-6 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 font-bold text-base transition-colors">
                      Xem Demo
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="w-full md:w-1/2 lg:w-3/5 aspect-video md:aspect-4/3 lg:aspect-video rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50 bg-slate-200 dark:bg-slate-800 transition-all duration-300">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFmUDfLwpFXm7tBnSg2ymj5N0YD-RRys7iyg-HzEHNAeQRZdAP7f2eYisPzkFGRmZaFPB2yss1pt8AYvIQKjLXCGVxt4dQErmcZpmM0uceSPNM91iuUp0EAJWvbjZAQFNsvxuJeWfuXTz_Ga5gDHoUYzHlVU0cPIR-1pCcJGbLHDPKV7favVKZLC63VjNyG4m8Xw38yoBJMyNaXDHWOVtnybHlugDJq2mj8X-8lPQPUM6n4neU5wq-DLVX0ai7E3ETVffz6zQI8Bg"
                  alt="Modern digital classroom with students using laptops"
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Stats Bar */}
      <ScrollAnimation direction="up" delay={100}>
        <div className="container mx-auto px-4 md:px-10 pb-10 -mt-16 relative z-20">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-8 md:p-12 border border-slate-200 dark:border-slate-700 transition-all duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 dark:divide-slate-700">
              {ABOUT_STATS.map((stat) => (
                <div key={stat.title} className="text-center group px-4">
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-600 dark:text-blue-400 text-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-white/5">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 transition-colors duration-300">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide uppercase transition-colors duration-300">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollAnimation>

      {/* Vision & Mission Section */}
      <ScrollAnimation direction="up" delay={200}>
        <section className="py-16 bg-white dark:bg-[#1a2332] transition-colors duration-500">
          <div className="container mx-auto px-4 md:px-10 ">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                  Tầm nhìn & Sứ mệnh của chúng tôi
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl transition-colors duration-300">
                  Chúng tôi cam kết cách mạng hóa lĩnh vực giáo dục thông qua công nghệ đáng tin cậy và đổi mới.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vision Card */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] p-8 hover:border-blue-500/50 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <EyeOutlined className="text-3xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Tầm nhìn của chúng tôi</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                      Trở thành đối tác LMS được hỗ trợ bởi AI hàng đầu cho chuyển đổi số trong các trường học và trung tâm đào tạo trên khắp Việt Nam.
                    </p>
                  </div>
                </div>
                {/* Mission Card */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1e293b] p-8 hover:border-blue-500/50 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FlagOutlined className="text-3xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Sứ mệnh của chúng tôi</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                      Trao quyền cho các tổ chức giáo dục với công nghệ minh bạch, hiệu quả và lấy người học làm trung tâm, kết nối khoảng cách giữa giảng dạy truyền thống và tương lai số.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Technology & Innovation Section */}
      <ScrollAnimation direction="up" delay={300}>
        <section className="py-16 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
          <div className="container mx-auto px-4 md:px-10 ">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                  Công nghệ & Đổi mới
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors duration-300">
                  Nền tảng của chúng tôi tận dụng các tính năng tiên tiến để tối ưu hóa quy trình giáo dục và đảm bảo tính toàn vẹn học thuật.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <CheckCircleOutlined className="text-4xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">AI Chống gian lận</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
                      Đảm bảo tính toàn vẹn trong các kỳ thi và bài tập với hệ thống giám sát AI tiên tiến phát hiện bất thường trong thời gian thực.
                    </p>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <ApiOutlined className="text-4xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Tích hợp liền mạch</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
                      Kết nối dễ dàng với các công cụ phổ biến như Azota, Google Meet và Zoom để tạo hệ sinh thái học tập thống nhất.
                    </p>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <DashboardOutlined className="text-4xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Quản lý tập trung</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
                      Một bảng điều khiển thống nhất để quản lý học sinh, lớp học, bài tập và điểm số một cách hiệu quả, tiết kiệm hàng giờ công việc hành chính.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Values for Education Section */}
      <ScrollAnimation direction="up" delay={400}>
        <section className="py-16 bg-white dark:bg-[#1a2332] border-t border-slate-200 dark:border-slate-800 transition-colors duration-500">
          <div className="container mx-auto px-4 md:px-10 ">
            <div className="flex flex-col gap-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center leading-tight transition-colors duration-300">
                Giá trị cho giáo dục
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ABOUT_VALUES.map((value, index) => (
                  <div key={index} className="flex flex-col items-center text-center gap-3 p-4">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{value.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Target Audience Section */}
      <ScrollAnimation direction="up" delay={500}>
        <section className="py-16 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
          <div className="container mx-auto px-4 md:px-10 ">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight transition-colors duration-300">Chúng tôi phục vụ ai</h2>
                <p className="text-slate-600 dark:text-slate-400 text-base transition-colors duration-300">Hỗ trợ toàn bộ hệ sinh thái giáo dục.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TARGET_AUDIENCES.map((audience, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl h-64 cursor-pointer">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                      <Image
                        src={audience.image}
                        alt={audience.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 z-10">
                      <h3 className="text-white text-xl font-bold mb-1">{audience.title}</h3>
                      <p className="text-white/80 text-sm">{audience.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

    
    </main>
  );
}
