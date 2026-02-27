"use client";

import { CalendarOutlined } from "@ant-design/icons";
import CustomCard from "@/components/common/CustomCard";
import ClassListItem from "./ClassListItem";

interface ClassItem {
  id: string;
  name: string;
  time: string;
  teacher: string;
  room: string;
}

interface UpcomingClassesListProps {
  classes: ClassItem[];
}

export default function UpcomingClassesList({ classes }: UpcomingClassesListProps) {
  return (
    <CustomCard padding="none" className="h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          Lịch học hôm nay
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {classes.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                index !== classes.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <ClassListItem name={item.name} teacher={item.teacher} time={item.time} room={item.room} />
            </div>
          ))}
        </div>
      </div>
    </CustomCard>
  );
}
