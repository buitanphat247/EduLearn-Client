"use client";

import { useRouter } from "next/navigation";
import CustomCard from "@/components/common/CustomCard";

interface QuickActionItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  gradient: string;
  borderColor: string;
  hoverBorderColor: string;
  iconColor: string;
  path: string;
}

interface QuickActionsGridProps {
  items: QuickActionItem[];
}

export default function QuickActionsGrid({ items }: QuickActionsGridProps) {
  const router = useRouter();

  return (
    <CustomCard padding="lg" className="h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${item.gradient} rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 border-2 ${item.borderColor} hover:${item.hoverBorderColor}`}
            >
              <Icon className={`text-4xl ${item.iconColor} mb-3`} />
              <span className="font-semibold text-gray-800">{item.label}</span>
            </div>
          );
        })}
      </div>
    </CustomCard>
  );
}
