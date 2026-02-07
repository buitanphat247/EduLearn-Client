"use client";

import CustomCard from "@/app/components/common/CustomCard";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic import for CountUp - only load on client to avoid hydration mismatch
const CountUp = dynamic(() => import("react-countup"), {
  ssr: false,
  loading: () => <span>0</span>,
});

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  hexColor: string;
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
          <CustomCard key={index} padding="md" className="hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold" style={{ color: stat.hexColor }}>
                  <Suspense fallback={<span>0</span>}>
                    <CountUp start={0} end={numericValue} duration={2} separator="," decimals={0} />
                  </Suspense>
                </p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-xl`}>
                <Icon className="text-2xl" style={{ color: stat.hexColor }} />
              </div>
            </div>
          </CustomCard>
        );
      })}
    </div>
  );
}
