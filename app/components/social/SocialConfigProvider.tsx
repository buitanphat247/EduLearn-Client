"use client";

import { ConfigProvider, theme } from "antd";
import type { ReactNode } from "react";

interface SocialConfigProviderProps {
    children: ReactNode;
}

export default function SocialConfigProvider({ children }: SocialConfigProviderProps) {
    // Using default algorithm for Light Mode
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#3b82f6',
                    borderRadius: 12,
                    controlHeight: 40,
                    fontFamily: 'inherit',
                },
                components: {
                    Button: {
                        colorPrimary: '#3b82f6',
                        algorithm: true,
                    },
                    Input: {
                        colorBgContainer: '#f3f4f6', // gray-100
                        colorBorder: 'transparent',
                        activeBorderColor: '#3b82f6',
                    }
                }
            }}
        >
            {children}
        </ConfigProvider>
    );
}
