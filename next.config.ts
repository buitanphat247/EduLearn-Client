import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";

    return [
      // Note: /api-proxy/assignment-attachments/*, /api-proxy/writing-chat-bot/*, and /api-proxy/friends/* routes
      // are handled by API route handlers (to connect to Flask/backend). Only rewrite other /api-proxy routes.
      {
        source: "/api-proxy/:path((?!assignment-attachments|writing-chat-bot).*)",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Browser Cache Headers - Cache static assets for 1 year
  async headers() {
    return [
      // Cache JS files (hashed by Next.js) - 1 year immutable
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache static files in /public folder - 1 year
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache fonts - 1 year immutable
      {
        source: "/:path*.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.woff",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.ttf",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images - 1 year
      {
        source: "/:path*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.jpeg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.gif",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache CSS files - 1 year
      {
        source: "/:path*.css",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache Font Awesome from CDN (via proxy/rewrite if needed)
      {
        source: "/api-proxy/font-awesome/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
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
      config.ignoreWarnings = [{ module: /node_modules\/next\/dist/ }, { file: /\.next\/dev\/server\/chunks/ }];
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
    // Disable optimizePackageImports for antd to avoid HMR issues with rc-overflow
    // optimizePackageImports: ["@ant-design/icons", "antd", "react-quill-new"],
    optimizePackageImports: ["@ant-design/icons", "react-quill-new"],
    serverActions: {
      bodySizeLimit: "500MB", // Increase body size limit for large file uploads (must be uppercase MB)
    },
  },

  // Use standalone output for Docker/production builds
  output: "standalone",
};

export default nextConfig;
