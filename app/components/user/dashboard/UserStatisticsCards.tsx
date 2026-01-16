"use client";

import CustomCard from "@/app/components/common/CustomCard";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

interface StatItem {
  label: string;
  value: string;
  icon: typeof FileTextOutlined;
  color: string;
  bgColor: string;
}

interface UserStatisticsCardsProps {
  stats: StatItem[];
}

export default function UserStatisticsCards({ stats }: UserStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const numericValue = parseInt(stat.value.replace(/,/g, "")) || 0;
        return (
          <CustomCard key={index} padding="md" className="hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  <CountUp start={0} end={numericValue} duration={2} separator="," decimals={0} />
                </p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-xl`}>
                <Icon className={`text-2xl ${stat.color}`} />
              </div>
            </div>
          </CustomCard>
        );
      })}
    </div>
  );
}
