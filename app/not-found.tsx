"use client";

import { Button } from "antd";
import { HomeOutlined, SearchOutlined, ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import PrefetchLink from "@/app/components/common/PrefetchLink";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Icon Section - Separate from 404 */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <SearchOutlined className="text-6xl text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* 404 Number - Clean and Modern */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-extrabold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Trang không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 mb-2 max-w-xl mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Có thể URL đã thay đổi hoặc trang đã bị xóa. Hãy thử quay lại trang chủ hoặc sử dụng menu điều hướng.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            size="large"
            className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]"
            onClick={() => router.push("/")}
          >
            Về trang chủ
          </Button>
          <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            className="border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 min-w-[160px]"
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
            <RocketOutlined className="text-blue-500" />
            <span>Bạn có thể thử:</span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <PrefetchLink
              href="/"
              className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:text-white hover:bg-linear-to-r hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 border border-blue-200 hover:border-transparent"
            >
              Trang chủ
            </PrefetchLink>
            <PrefetchLink
              href="/admin"
              className="px-5 py-2.5 text-sm font-medium text-purple-600 hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-purple-600 rounded-lg transition-all duration-200 border border-purple-200 hover:border-transparent"
            >
              Quản trị
            </PrefetchLink>
            <PrefetchLink
              href="/user"
              className="px-5 py-2.5 text-sm font-medium text-pink-600 hover:text-white hover:bg-linear-to-r hover:from-pink-500 hover:to-pink-600 rounded-lg transition-all duration-200 border border-pink-200 hover:border-transparent"
            >
              Người dùng
            </PrefetchLink>
          </div>
        </div>
      </div>

      {/* Decorative Elements - More Dynamic */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-blue-300 rounded-full opacity-30 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300 rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/2 right-20 w-20 h-20 bg-pink-300 rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute bottom-1/3 left-20 w-16 h-16 bg-indigo-300 rounded-full opacity-25 blur-xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
    </div>
  );
}
