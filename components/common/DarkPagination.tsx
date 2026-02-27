"use client";

import { Pagination, ConfigProvider, theme as antTheme } from "antd";
import type { PaginationProps } from "antd";
import { useTheme } from "@/context/ThemeContext";

interface DarkPaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  className?: string;
}

export default function DarkPagination({
  current,
  total,
  pageSize,
  onChange,
  showTotal,
  showSizeChanger = false,
  showQuickJumper = false,
  className = "",
}: DarkPaginationProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex justify-center mt-16 ${className}`}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorBgContainer: isDark ? '#1e293b' : '#ffffff',
            colorBorder: isDark ? '#334155' : '#e2e8f0',
            colorPrimary: '#3b82f6',
            colorText: isDark ? '#ffffff' : '#334155',
            colorTextSecondary: isDark ? '#cbd5e1' : '#64748b',
          },
          components: {
            Pagination: {
              itemActiveBg: '#3b82f6',
              itemBg: isDark ? '#1e293b' : '#ffffff',
              itemInputBg: isDark ? '#1e293b' : '#ffffff',
              itemLinkBg: isDark ? '#1e293b' : '#ffffff',
              itemActiveColorDisabled: '#ffffff',
              colorText: isDark ? '#ffffff' : '#334155',
              colorTextDisabled: isDark ? '#64748b' : '#94a3b8',
              colorPrimary: '#ffffff',
              colorPrimaryHover: '#ffffff',
            }
          }
        }}
      >
        <div className={`
          px-4 py-2 rounded-xl shadow-lg border transition-colors duration-300
          bg-white dark:bg-[#1e293b] 
          border-slate-200 dark:border-slate-700/50 
          [&_.ant-pagination]:flex [&_.ant-pagination]:flex-wrap [&_.ant-pagination]:justify-center [&_.ant-pagination]:gap-1
          [&_.ant-pagination-item]:!border-none 
          [&_.ant-pagination-item]:text-slate-600 dark:[&_.ant-pagination-item]:text-white 
          [&_.ant-pagination-item:hover]:!border-none 
          [&_.ant-pagination-item-active]:bg-blue-600 
          [&_.ant-pagination-item-active]:!border-none 
          [&_.ant-pagination-item-active_a]:!text-white 
          [&_.ant-pagination-item-active_a]:!font-semibold 
          [&_.ant-pagination-item_a]:text-slate-600 dark:[&_.ant-pagination-item_a]:text-white 
          [&_.ant-pagination-prev]:text-slate-500 dark:[&_.ant-pagination-prev]:text-white 
          [&_.ant-pagination-next]:text-slate-500 dark:[&_.ant-pagination-next]:text-white 
          [&_.ant-pagination-total-text]:text-slate-500 dark:[&_.ant-pagination-total-text]:text-slate-300
          [&_.ant-pagination-total-text]:whitespace-nowrap
        `}>
          <Pagination
            current={current}
            total={total}
            pageSize={pageSize}
            onChange={onChange}
            showSizeChanger={showSizeChanger}
            showQuickJumper={showQuickJumper}
            showTotal={showTotal}
          />
        </div>
      </ConfigProvider>
    </div>
  );
}

