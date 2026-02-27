import { Card, Tag } from "antd";
import { ReactNode } from "react";

interface GradeStatCardProps {
  title: string;
  value: string | ReactNode;
  borderColor: "blue" | "green" | "yellow" | "purple";
  subtitle?: string | ReactNode;
  tag?: { color: string; text: string };
}

const borderColorClasses = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  yellow: "border-l-yellow-500",
  purple: "border-l-purple-500",
};

export default function GradeStatCard({ title, value, borderColor, subtitle, tag }: GradeStatCardProps) {
  return (
    <Card
      className={`border border-gray-200 hover:shadow-lg transition-all duration-300 ${borderColorClasses[borderColor]} border-l-4`}
      styles={{
        body: { padding: "20px" },
      }}
    >
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="flex items-center gap-2">
        {typeof value === "string" ? (
          <span className="text-2xl font-bold text-gray-800">{value}</span>
        ) : (
          value
        )}
        {tag && <Tag color={tag.color}>{tag.text}</Tag>}
      </div>
      {subtitle && (
        <div className={`text-xs mt-1 ${typeof subtitle === "string" ? "text-gray-500" : ""}`}>
          {subtitle}
        </div>
      )}
    </Card>
  );
}

