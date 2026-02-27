"use client";

import { useEffect, useRef, useState, memo } from "react";
import type { MathfieldElement } from "mathlive";

// Global styles cho keyboard - inject một lần duy nhất
const KEYBOARD_STYLES = `
  /* Override MathLive keyboard positioning */
  .ML__keyboard,
  .ML__keyboard.is-visible,
  div[class*="ML__keyboard"] {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    width: 100vw !important;
    max-width: 100vw !important;
    z-index: 999999 !important;
    max-height: 40vh !important;
    min-height: 200px !important;
    background: #1a1a1a !important;
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    
    /* Force reset transform và bottom */
    transform: none !important;
    translate: none !important;
    margin: 0 !important;
    padding: 0 !important;
    
    /* Override MathLive variables */
    --keyboard-height: auto !important;
    --background-height: 0px !important;
  }
  
  /* Đảm bảo backdrop không che */
  .ML__backdrop,
  .MLK_backdrop {
    display: none !important;
  }
  
  /* Đảm bảo visible */
  .ML__keyboard,
  .ML__keyboard * {
    visibility: visible !important;
    opacity: 1 !important;
  }
`;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        placeholder?: string;
        "virtual-keyboard-mode"?: "auto" | "manual" | "onfocus" | "off";
      };
    }
  }
}

interface MathFieldInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autofocus?: boolean;
}

export const MathFieldInput = memo<MathFieldInputProps>(
  ({ value, onChange, placeholder = "Nhập công thức...", className = "", autofocus = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mfeRef = useRef<MathfieldElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Load MathLive và inject styles
    useEffect(() => {
      if (typeof window === "undefined") return;

      // Inject styles
      const styleId = "mathlive-keyboard-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = KEYBOARD_STYLES;
        document.head.appendChild(style);
      }

      // Load MathLive
      import("mathlive")
        .then((mod) => {
          if (!customElements.get("math-field")) {
            customElements.define("math-field", mod.MathfieldElement);
          }
          setIsReady(true);
        })
        .catch((err) => console.error("Failed to load MathLive:", err));
    }, []);

    // Setup MathField khi ready
    useEffect(() => {
      if (!isReady || !containerRef.current) return;

      const mfe = containerRef.current.querySelector("math-field") as MathfieldElement;
      if (!mfe) return;

      mfeRef.current = mfe;

      // Cấu hình - set properties trực tiếp
      const mfeAny = mfe as any;
      mfeAny.virtualKeyboardMode = "manual";
      mfeAny.smartFence = true;
      mfeAny.smartSuperscript = true;
      mfeAny.removeExtraneousParentheses = true;

      // Set giá trị ban đầu
      if (value) {
        mfe.value = value;
      }

      // Helper để force show keyboard
      const showKeyboard = () => {
        const mvk = (window as any).mathVirtualKeyboard;
        if (mvk) {
          mvk.visible = true;
          if (typeof mvk.show === 'function') {
            mvk.show();
          }
          if (mfe && typeof (mfe as any).executeCommand === 'function') {
            (mfe as any).executeCommand(['showVirtualKeyboard']);
          }
        }
      };

      // Event handlers
      const handleInput = () => {
        onChange(mfe.value);
      };

      const handleFocus = () => {
        requestAnimationFrame(showKeyboard);
      };

      mfe.addEventListener("input", handleInput);
      mfe.addEventListener("focus", handleFocus);

      // Auto focus và show keyboard
      if (autofocus) {
        setTimeout(() => {
          mfe.focus();
          setTimeout(showKeyboard, 100);
          setTimeout(showKeyboard, 300);
        }, 100);
      }

      // Cleanup
      return () => {
        mfe.removeEventListener("input", handleInput);
        mfe.removeEventListener("focus", handleFocus);
      };
    }, [isReady, autofocus]);

    // Sync value khi prop thay đổi
    useEffect(() => {
      if (mfeRef.current && mfeRef.current.value !== value) {
        mfeRef.current.value = value || "";
      }
    }, [value]);

    if (!isReady) {
      return (
        <div className={`p-4 border rounded bg-gray-50 text-center text-gray-500 ${className}`}>
          Đang tải...
        </div>
      );
    }

    return (
      <div ref={containerRef} className={className}>
        {/* @ts-ignore */}
        <math-field
          virtual-keyboard-mode="manual"
          placeholder={placeholder}
          style={{
            width: "100%",
            fontSize: "20px",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            minHeight: "60px",
            fontFamily: '"Times New Roman", serif',
            display: "block",
          }}
        />
      </div>
    );
  }
);

MathFieldInput.displayName = "MathFieldInput";
