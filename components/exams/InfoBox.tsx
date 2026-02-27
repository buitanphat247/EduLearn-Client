"use client";

import { ReactNode } from "react";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

interface InfoBoxProps {
  type?: "info" | "warning" | "success";
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}

export default function InfoBox({ type = "info", icon, title, children }: InfoBoxProps) {
  const getStyles = () => {
    switch (type) {
      case "warning":
        return {
          container: "bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      case "success":
        return {
          container: "bg-green-50/50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/50",
          iconColor: "text-green-600 dark:text-green-400",
        };
      default:
        return {
          container: "bg-blue-50/50 dark:bg-slate-800 rounded-lg p-4 border border-blue-100 dark:border-slate-700",
          iconColor: "text-blue-500 dark:text-blue-400",
        };
    }
  };

  const styles = getStyles();
  const defaultIcon =
    type === "success" ? (
      <QuestionCircleOutlined className={`${styles.iconColor} text-lg shrink-0 mt-0.5`} />
    ) : (
      <InfoCircleOutlined className={`${styles.iconColor} text-lg shrink-0 mt-0.5`} />
    );

  return (
    <div className={`${styles.container} transition-colors duration-200`}>
      <div className="flex gap-3">
        {icon || defaultIcon}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {title && <p className="font-medium mb-1 dark:text-gray-200">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
