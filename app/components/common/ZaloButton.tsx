"use client";

import { useState, useEffect } from "react";

const ZALO_PHONE = "0984380205";
const ZALO_URL = `https://zalo.me/${ZALO_PHONE}`;

export default function ZaloButton() {
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                {/* Tooltip */}
                <div
                    className="zalo-tooltip"
                    style={{
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "translateY(0)" : "translateY(8px)",
                        pointerEvents: hovered ? "auto" : "none",
                    }}
                >
                    Chat với chúng tôi qua Zalo
                </div>

                {/* Button */}
                <a
                    href={ZALO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="zalo-btn"
                    aria-label="Liên hệ Zalo"
                >
                    {/* Chat message icon */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                    >
                        <path
                            d="M21 11.5C21 16.75 16.75 21 11.5 21C9.8 21 8.2 20.55 6.8 19.75L3 21L4.25 17.2C3.45 15.8 3 14.2 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 21 6.25 21 11.5Z"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="8.5" cy="12" r="1.2" fill="white" />
                        <circle cx="12" cy="12" r="1.2" fill="white" />
                        <circle cx="15.5" cy="12" r="1.2" fill="white" />
                    </svg>

                    {/* Ripple */}
                    <span className="zalo-ripple" />
                </a>
            </div>

            <style>{`
        .zalo-tooltip {
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        @media (prefers-color-scheme: dark) {
          .zalo-tooltip {
            background: #1e293b;
            color: #e2e8f0;
            border-color: rgba(51,65,85,0.5);
          }
        }
        .zalo-btn {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0068FF;
          box-shadow: 0 4px 16px rgba(0,104,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: zalo-bounce 3s ease-in-out infinite;
          text-decoration: none;
        }
        .zalo-btn:hover {
          background: #0054CC;
          box-shadow: 0 6px 24px rgba(0,104,255,0.5);
          transform: scale(1.1);
          animation: none;
        }
        .zalo-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #0068FF;
          animation: zalo-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes zalo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes zalo-ping {
          0% { transform: scale(1); opacity: 0.3; }
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
        </>
    );
}
