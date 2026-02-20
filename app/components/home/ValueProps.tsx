"use client";

import React from "react";
import { RocketOutlined, BarChartOutlined, CheckCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Image from "next/image";
import ScrollAnimation from "@/app/components/common/ScrollAnimation";

export default function ValueProps() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden bg-white dark:bg-[#0f172a] transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-[1280px]">
        {/* Row 1: Rapid Deployment */}
        <ScrollAnimation direction="right" delay={0}>
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            {/* Image Left */}
            <div className="lg:w-1/2 order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-600/10 rounded-3xl transform rotate-3 scale-105 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500"></div>
              <div className="relative rounded-3xl shadow-2xl w-full overflow-hidden h-[400px] border border-slate-200 dark:border-slate-700/50">
                <Image
                  src="https://dongphucgiadinh.com/wp-content/uploads/2024/03/dong-phuc-dai-hoc-su-pham-ky-thuat-tphcm-1.jpg"
                  alt="Teacher using tablet in classroom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Content Right */}
            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-4">
                <RocketOutlined className="text-xl" />
                <span>Khởi tạo nhanh chóng</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Triển khai nhanh, sẵn sàng sử dụng
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Hệ thống dựa trên nền tảng đám mây giúp các trường học có thể áp dụng ngay lập tức mà không cần cài đặt phần cứng phức tạp. Nhập dữ liệu và bắt đầu quá trình chuyển đổi số ngay hôm nay.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Tự động chuyển đổi và đồng bộ dữ liệu</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Đội ngũ hỗ trợ 24/7 dành riêng cho các trường học</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-500 text-xl mt-1 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Ứng dụng di động hỗ trợ sẵn trên iOS và Android</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollAnimation>

        {/* Row 2: Smart Analytics */}
        <ScrollAnimation direction="left" delay={200}>
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Content Left */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-4">
                <BarChartOutlined className="text-xl" />
                <span>Phân tích thông minh</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Thông tin chi tiết hỗ trợ học tập tốt hơn
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Hệ thống không chỉ lưu giữ kết quả học tập; mà còn phân tích chúng. Nhận diện sớm các học sinh đang gặp khó khăn bằng công nghệ phân tích và tự động cung cấp công cụ tự học cá nhân hóa.
              </p>
              <button className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group transition-colors">
                Khám phá tính năng thống kê
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Image Right */}
            <div className="lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-purple-100 dark:bg-purple-600/10 rounded-3xl transform -rotate-2 scale-105 group-hover:-rotate-3 group-hover:scale-110 transition-all duration-500"></div>
              <div className="relative rounded-3xl shadow-2xl w-full overflow-hidden h-[400px] border border-slate-200 dark:border-slate-700/50">
                <Image
                  src="https://i2-vnexpress.vnecdn.net/2024/08/18/truong-spkt-tp-hcm-1695834673-7197-2461-1723971191.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=qyvCFOgV_BruAkOQmPsDpA"
                  alt="Trường Đại học Sư phạm Kỹ thuật TP.HCM"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

