import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";

    return [
      // Note: /api-proxy/assignment-attachments/* and /api-proxy/writing-chat-bot/* routes 
      // are handled by API route handlers (to connect to Flask backend). Only rewrite other /api-proxy routes.
      {
        source: "/api-proxy/:path((?!assignment-attachments|writing-chat-bot).*)",
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
      {
        protocol: "https",
        hostname: "elements-resized.envatousercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "file.hstatic.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  
  // Suppress source map warnings in development
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (dev) {
      // Suppress source map warnings
      config.ignoreWarnings = [
        { module: /node_modules\/next\/dist/ },
        { file: /\.next\/dev\/server\/chunks/ },
      ];
    }
    return config;
  },

  // Turbopack configuration (empty for now, using webpack for production builds)
  turbopack: {},
  
  // Suppress logging for incoming requests and body size warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
    // Disable incoming request logging to suppress body size warnings
    incomingRequests: false,
  },

  experimental: {
    optimizePackageImports: ["@ant-design/icons", "antd", "react-quill-new"],
    serverActions: {
      bodySizeLimit: "500MB", // Increase body size limit for large file uploads (must be uppercase MB)
    },
  },
  
  // Use standalone output for Docker/production builds
  output: "standalone",
};

export default nextConfig;
