"use client";

import { Card, List, Progress, Tag } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CustomCard from "@/app/components/ui_components/CustomCard";
import ExerciseListItem from "@/app/components/user_components/ExerciseListItem";
import ClassListItem from "@/app/components/user_components/ClassListItem";

const recentExercises = [
  {
    id: "1",
    title: "Bài tập Toán chương 1",
    subject: "Toán học",
    deadline: "20/01/2024",
    status: "Chưa nộp",
    statusColor: "orange",
  },
  {
    id: "2",
    title: "Bài tập Văn tuần 2",
    subject: "Ngữ văn",
    deadline: "18/01/2024",
    status: "Đã nộp",
    statusColor: "green",
  },
  {
    id: "3",
    title: "Bài tập Lý chương 3",
    subject: "Vật lý",
    deadline: "19/01/2024",
    status: "Quá hạn",
    statusColor: "red",
  },
];

const upcomingClasses = [
  {
    id: "1",
    name: "Toán học",
    time: "08:00 - 08:45",
    teacher: "Nguyễn Văn A",
    room: "Phòng 101",
  },
  {
    id: "2",
    name: "Ngữ văn",
    time: "09:00 - 09:45",
    teacher: "Trần Thị B",
    room: "Phòng 102",
  },
  {
    id: "3",
    name: "Vật lý",
    time: "10:00 - 10:45",
    teacher: "Lê Văn C",
    room: "Phòng 103",
  },
];

export default function UserDashboard() {
  const router = useRouter();

  // Lấy giờ hiện tại để chào mừng
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{getGreeting()}, Học sinh!</h1>
          <p className="text-blue-50 text-lg">Chào mừng bạn quay trở lại. Dưới đây là tổng quan về học tập của bạn.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomCard padding="md" className="hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Tổng bài tập</p>
              <p className="text-3xl font-bold text-green-600">12</p>
            </div>
            <div className="bg-green-100 p-4 rounded-xl">
              <FileTextOutlined className="text-2xl text-green-600" />
            </div>
          </div>
        </CustomCard>

        <CustomCard padding="md" className="hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Đã hoàn thành</p>
              <p className="text-3xl font-bold text-emerald-600">8</p>
            </div>
            <div className="bg-emerald-100 p-4 rounded-xl">
              <CheckCircleOutlined className="text-2xl text-emerald-600" />
            </div>
          </div>
        </CustomCard>

        <CustomCard padding="md" className="hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Chưa hoàn thành</p>
              <p className="text-3xl font-bold text-orange-600">3</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-xl">
              <ClockCircleOutlined className="text-2xl text-orange-600" />
            </div>
          </div>
        </CustomCard>

        <CustomCard padding="md" className="hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Khóa học đang học</p>
              <p className="text-3xl font-bold text-blue-600">5</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl">
              <BookOutlined className="text-2xl text-blue-600" />
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Card */}
        <CustomCard padding="lg" className="h-full">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Tiến độ học tập</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Toán học</span>
                <span className="text-sm font-bold text-green-600">85%</span>
              </div>
              <Progress
                percent={85}
                strokeColor={{
                  "0%": "#10b981",
                  "100%": "#34d399",
                }}
                showInfo={false}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Ngữ văn</span>
                <span className="text-sm font-bold text-blue-600">72%</span>
              </div>
              <Progress
                percent={72}
                strokeColor={{
                  "0%": "#3b82f6",
                  "100%": "#60a5fa",
                }}
                showInfo={false}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Vật lý</span>
                <span className="text-sm font-bold text-orange-600">68%</span>
              </div>
              <Progress
                percent={68}
                strokeColor={{
                  "0%": "#f97316",
                  "100%": "#fb923c",
                }}
                showInfo={false}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Hóa học</span>
                <span className="text-sm font-bold text-purple-600">90%</span>
              </div>
              <Progress
                percent={90}
                strokeColor={{
                  "0%": "#a855f7",
                  "100%": "#c084fc",
                }}
                showInfo={false}
                className="h-2"
              />
            </div>
          </div>
        </CustomCard>

        {/* Quick Actions */}
        <CustomCard padding="lg" className="h-full">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => router.push("/user/exercises")}
              className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
            >
              <FileTextOutlined className="text-4xl text-blue-600 mb-3" />
              <span className="font-semibold text-gray-800">Bài tập</span>
            </div>
            <div
              onClick={() => router.push("/user/documents")}
              className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all duration-200 hover:scale-105 border-2 border-orange-200 hover:border-orange-400"
            >
              <BookOutlined className="text-4xl text-orange-600 mb-3" />
              <span className="font-semibold text-gray-800">Tài liệu</span>
            </div>
            <div
              onClick={() => router.push("/user/community")}
              className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-green-50 to-green-100 rounded-xl cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:scale-105 border-2 border-green-200 hover:border-green-400"
            >
              <TeamOutlined className="text-4xl text-green-600 mb-3" />
              <span className="font-semibold text-gray-800">Cộng đồng</span>
            </div>
            <div
              onClick={() => router.push("/user/grades")}
              className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
            >
              <CheckCircleOutlined className="text-4xl text-purple-600 mb-3" />
              <span className="font-semibold text-gray-800">Điểm số</span>
            </div>
          </div>
        </CustomCard>
      </div>

      {/* Recent Exercises and Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exercises */}
        <CustomCard padding="none" className="h-full">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Bài tập gần đây</h2>
            <a
              onClick={() => router.push("/user/exercises")}
              className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              Xem tất cả
              <ArrowRightOutlined />
            </a>
          </div>
          <div className="p-4">
            <div className="space-y-0">
              {recentExercises.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/user/exercises/${item.id}`)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index !== recentExercises.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <Tag color={item.statusColor === "green" ? "success" : item.statusColor === "orange" ? "warning" : "error"}>
                      {item.status}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{item.subject}</span>
                    <span>•</span>
                    <span>Hạn: {item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CustomCard>

        {/* Upcoming Classes */}
        <CustomCard padding="none" className="h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarOutlined className="text-blue-500" />
              Lịch học hôm nay
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-0">
              {upcomingClasses.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    index !== upcomingClasses.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <ClassListItem name={item.name} teacher={item.teacher} time={item.time} room={item.room} />
                </div>
              ))}
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
}

