import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";
    
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "autobot-161.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  
  experimental: {
    optimizePackageImports: [
      "@ant-design/icons",
      "antd",
      "react-quill-new",
    ],
  },
};

export default nextConfig;
