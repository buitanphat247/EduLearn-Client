"use client";

import { Progress } from "antd";
import CustomCard from "@/components/common/CustomCard";

interface ProgressItem {
  subject: string;
  percent: number;
  color: {
    "0%": string;
    "100%": string;
  };
  textColor: string;
}

interface ProgressCardProps {
  items: ProgressItem[];
}

export default function ProgressCard({ items }: ProgressCardProps) {
  return (
    <CustomCard padding="lg" className="h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Tiến độ học tập</h2>
      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{item.subject}</span>
              <span className={`text-sm font-bold ${item.textColor}`}>{item.percent}%</span>
            </div>
            <Progress
              percent={item.percent}
              strokeColor={item.color}
              showInfo={false}
              className="h-2"
            />
          </div>
        ))}
      </div>
    </CustomCard>
  );
}
