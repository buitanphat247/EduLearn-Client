import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import PrefetchRoutes from "./components/common/PrefetchRoutes";
import ErrorBoundary from "./error-boundary";
import { noTransitionsScript } from "./scripts/no-transitions";
import { Analytics } from "@vercel/analytics/next";
import DevToolsBlocker from "./components/security/DevToolsBlocker";

// Optimize font loading - chỉ load weights cần thiết
const roboto = Roboto({
  weight: ['400', '500', '700'], // Chỉ load 3 weights thay vì toàn bộ
  subsets: ["latin"], // Chỉ load latin subset
  display: "swap", // Hiển thị fallback font ngay, swap khi font load xong
  variable: "--font-roboto",
  preload: true, // Preload font files
  fallback: ['system-ui', 'arial'], // Fallback fonts
});

export const metadata: Metadata = {
  title: "Thư viện số - Nền tảng học tập trực tuyến",
  description: "Thư viện số - Nền tảng học tập và tài liệu trực tuyến",
  other: {
    "font-awesome": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const isDark = theme?.value === "dark";

  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="vi" className={isDark ? "dark" : ""} suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts - Tăng tốc độ load fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ✅ Prefetch routes được xử lý bởi PrefetchRoutes component - không hardcode ở đây */}
        {/* PrefetchRoutes component sẽ prefetch routes dựa trên user context và pathname */}

        {/* Font Awesome - Load async để không block render */}

        {/* ✅ Use Next.js Script component instead of dangerouslySetInnerHTML to prevent XSS */}
        <Script
          id="no-transitions-script"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: noTransitionsScript,
          }}
        />
        {/* Critical CSS moved to Header.css to prevent hydration errors */}
      </head>
      <body
        className={`${roboto.variable} antialiased`}
      >
        <AntdRegistry>
          <ErrorBoundary>
            <Providers theme={isDark ? "dark" : "light"}>
              <PrefetchRoutes />
              {children}
            </Providers>
          </ErrorBoundary>
        </AntdRegistry>
        <Analytics />
        <DevToolsBlocker />
      </body>
    </html>
  );
}
