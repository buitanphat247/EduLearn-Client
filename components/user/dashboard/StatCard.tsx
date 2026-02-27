import { Card, Statistic } from "antd";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  prefix: ReactNode;
  valueStyle?: React.CSSProperties;
}

export default function StatCard({ title, value, prefix, valueStyle }: StatCardProps) {
  return (
    <Card>
      <Statistic title={title} value={value} prefix={prefix} styles={{ content: valueStyle }} />
    </Card>
  );
}

