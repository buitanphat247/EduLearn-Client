import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import PrefetchRoutes from "./components/common/PrefetchRoutes";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts - Tăng tốc độ load fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch critical routes - Preload routes quan trọng */}
        <link rel="prefetch" href="/admin" as="document" />
        <link rel="prefetch" href="/admin/classes" as="document" />
        <link rel="prefetch" href="/user" as="document" />
        <link rel="prefetch" href="/user/classes" as="document" />
        
        {/* Font Awesome - Load async để không block render */}
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var html = document.documentElement;
                  // Disable transitions initially to prevent flash
                  html.classList.add('no-transitions');
                  
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    html.classList.add('dark');
                  }
                  
                  // Re-enable transitions immediately after DOM content is loaded
                  // interactive (DOMContentLoaded) is sooner than complete (window.load)
                  var removeNoTransitions = function() {
                      // RequestAnimationFrame ensures the paint with 'dark' class has happened
                      requestAnimationFrame(function() {
                        setTimeout(function() {
                          html.classList.remove('no-transitions');
                        }, 0);
                      });
                  };

                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', removeNoTransitions);
                  } else {
                    removeNoTransitions();
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${roboto.variable} antialiased`}
      >
        <AntdRegistry>
          <Providers>
            <PrefetchRoutes />
            {children}
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
