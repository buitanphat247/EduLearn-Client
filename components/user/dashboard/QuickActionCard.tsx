import { Card } from "antd";
import { ReactNode } from "react";

interface QuickActionCardProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export default function QuickActionCard({ icon, label, onClick }: QuickActionCardProps) {
  return (
    <Card hoverable className="text-center cursor-pointer" onClick={onClick}>
      {icon}
      <div className="font-semibold">{label}</div>
    </Card>
  );
}

