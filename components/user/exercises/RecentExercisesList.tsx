"use client";

import { Tag } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CustomCard from "@/components/common/CustomCard";

interface ExerciseItem {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: string;
  statusColor: string;
}

interface RecentExercisesListProps {
  exercises: ExerciseItem[];
}

export default function RecentExercisesList({ exercises }: RecentExercisesListProps) {
  const router = useRouter();

  return (
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
          {exercises.map((item, index) => (
            <div
              key={item.id}
              onClick={() => router.push(`/user/exercises/${item.id}`)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                index !== exercises.length - 1 ? "border-b border-gray-100" : ""
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
  );
}
