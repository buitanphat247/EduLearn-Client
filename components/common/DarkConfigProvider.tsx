"use client";

import { ConfigProvider, theme } from "antd";
import type { ReactNode } from "react";

interface DarkConfigProviderProps {
  children: ReactNode;
}

export default function DarkConfigProvider({ children }: DarkConfigProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: '#1e293b',
          colorBorder: '#334155',
          colorPrimary: '#3b82f6',
          borderRadius: 12,
          controlHeight: 50,
          fontSize: 16,
        },
        components: {
          Input: {
            activeBorderColor: '#60a5fa',
            hoverBorderColor: '#60a5fa',
            paddingInline: 20,
          },
          Select: {
            optionSelectedBg: '#334155',
          },
          Button: {
            colorPrimary: '#3b82f6',
            colorPrimaryHover: '#2563eb',
            colorPrimaryActive: '#1d4ed8',
          },
          Table: {
            colorBgContainer: '#111827',
            headerBg: '#1f2937',
            borderColor: 'transparent',
          },
          Pagination: {
            itemBg: '#111827',
            itemActiveBg: '#1f2937',
          },
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}

