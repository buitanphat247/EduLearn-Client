"use client";

import React, { Suspense } from "react";

interface DynamicIconProps {
    type: string;
    [key: string]: any;
}

/**
 * Dynamic Icon Component to avoid HMR issues with @ant-design/icons
 * Usage: <DynamicIcon type="UserOutlined" />
 * 
 * Note: This uses dynamic import which may have TypeScript limitations.
 * For better type safety and performance, use iconRegistry.ts instead.
 * 
 * This component is kept as a fallback option but is not recommended for production.
 */
const DynamicIcon: React.FC<DynamicIconProps> = ({ type, ...props }) => {
    // Create a dynamic component using React.lazy
    // Note: TypeScript may show errors for dynamic imports, but it works at runtime
    const AntIcon = React.lazy(() => {
        // @ts-ignore - Dynamic imports with template strings are not fully typed
        return import(`@ant-design/icons/es/icons/${type}.js`).catch(() => {
            // Fallback to a simple span if icon fails to load
            return Promise.resolve({
                default: ({ ...fallbackProps }: any) => <span {...fallbackProps}>⚠</span>
            });
        });
    });

    // Must use Suspense with a fallback item, or the icon won't load
    return (
        <Suspense fallback={<span style={{ display: "inline-block", width: "1em" }} />}>
            <AntIcon {...props} />
        </Suspense>
    );
};

export default DynamicIcon;
