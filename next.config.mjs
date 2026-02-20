import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611/api";

        return [
            // Note: /api-proxy/assignment-attachments/* and /api-proxy/friends/* routes
            // are handled by API route handlers (to connect to Flask/backend).
            // /api-proxy/writing-chat-bot/* is now proxied through NestJS (with auth) → Python backend
            {
                source: "/api-proxy/:path*",
                destination: `${apiUrl}/:path*`,
            },
        ];
    },

    productionBrowserSourceMaps: false,

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
            // Security Headers - CSP and other security headers
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://cdn.tailwindcss.com https://unpkg.com https://vercel.live",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com",
                            "font-src 'self' https://fonts.gstatic.com data:",
                            "img-src 'self' data: blob: https: http:",
                            "connect-src 'self' https: wss: ws: http://localhost:* ws://localhost:* https://vercel.live",
                            "frame-ancestors 'self'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "media-src 'self' blob: https:",
                            "worker-src 'self' blob:",
                            "object-src 'none'",
                        ].join("; "),
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(self), geolocation=()",
                    },
                    // Cross-Origin-Embedder-Policy removed - too strict, blocks external images
                    // Only needed for SharedArrayBuffer or high isolation features
                    // {
                    //     key: "Cross-Origin-Embedder-Policy",
                    //     value: "require-corp",
                    // },
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin",
                    },
                    {
                        key: "Cross-Origin-Resource-Policy",
                        value: "cross-origin",
                    },
                ],
            },
        ];
    },

    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
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
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "hoc24.vn",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "dongphucgiadinh.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i2-vnexpress.vnecdn.net",
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
    webpack: (config, { dev }) => {
        if (dev) {
            // Suppress source map warnings
            config.ignoreWarnings = [{ module: /node_modules\/next\/dist/ }, { file: /\.next\/dev\/server\/chunks/ }];
        }
        return config;
    },

    // Turbopack configuration (commented out to avoid accidental activation)
    // turbopack: {},

    // Suppress logging for incoming requests and body size warnings
    logging: {
        fetches: {
            fullUrl: false,
        },
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

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "aio-lms",

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js proxy, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
            // Automatically tree-shake Sentry logger statements to reduce bundle size
            removeDebugLogging: true,
        },
    },
});
