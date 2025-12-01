import { ReactNode } from "react";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export default function CustomCard({ children, className = "", padding = "md", onClick }: CustomCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 transition-all duration-300 ${paddingClasses[padding]} ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
