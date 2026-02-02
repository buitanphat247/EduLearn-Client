import { useEffect, useState, useCallback, useRef } from "react";
import { App } from "antd";

/**
 * Violation record interface
 * @interface Violation
 * @description Represents an anti-cheat violation event
 */
export interface Violation {
  /** Unique violation identifier */
  id: string;
  /** Violation type (e.g., 'tab_switch', 'fullscreen_exit', 'copy_paste') */
  type: string;
  /** Human-readable violation message */
  message: string;
  /** ISO timestamp when violation occurred */
  timestamp: string;
}

/**
 * Options for useAntiCheat hook
 * @interface UseAntiCheatProps
 */
interface UseAntiCheatProps {
  /** Callback function when violation is detected */
  onViolation?: (type: string, message: string) => void;
  /** Enable/disable anti-cheat detection (default: true) */
  enable?: boolean;
  /** Initial violations count (for resuming exams) */
  initialViolationsCount?: number;
}

/**
 * Hook for anti-cheat detection during exams
 * @param {UseAntiCheatProps} props - Anti-cheat configuration
 * @returns {Object} Object containing violations, fullscreen state, and handlers
 * @returns {Violation[]} returns.violations - List of detected violations
 * @returns {boolean} returns.isFullScreen - Whether exam is in fullscreen mode
 * @returns {Function} returns.enterFullScreen - Function to enter fullscreen
 * @returns {Function} returns.exitFullScreen - Function to exit fullscreen
 *
 * @description
 * Monitors and detects cheating behaviors:
 * - Tab switching
 * - Fullscreen exit
 * - Copy/paste attempts
 * - Developer tools access
 * - Window focus loss
 *
 * @example
 * ```typescript
 * const { violations, isFullScreen, enterFullScreen } = useAntiCheat({
 *   onViolation: (type, message) => {
 *     console.warn(`Violation: ${type} - ${message}`);
 *   },
 *   enable: true,
 *   initialViolationsCount: 0
 * });
 * ```
 */
export const useAntiCheat = ({ onViolation, enable = true, initialViolationsCount = 0 }: UseAntiCheatProps = {}) => {
  const { modal, message } = App.useApp();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Pause detection state (for when modals are open)
  const [paused, setPaused] = useState(false);
  const lastViolationTimeRef = useRef<number>(0);
  const fullscreenExitCountRef = useRef<number>(0);

  const enterFullScreenRef = useRef<() => void>(() => {});
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // Handle Initial Count
  useEffect(() => {
    if (initialViolationsCount !== undefined && initialViolationsCount > 0) {
      fullscreenExitCountRef.current = initialViolationsCount;
      // Pre-fill violation state with placeholders if they are generic
      const initialLogs: Violation[] = Array.from({ length: initialViolationsCount }, (_, i) => ({
        id: `init-${i}`,
        type: "resumed_violation",
        message: `Cảnh báo vi phạm lần ${i + 1}`,
        timestamp: "Trước đó",
      }));
      setViolations(initialLogs);
    }
  }, [initialViolationsCount]);

  // ✅ Constants for magic numbers
  const VIOLATION_COOLDOWN_MS = 1000;
  const DEVTOOLS_THRESHOLD = 200;
  const DEVTOOLS_CHECK_INTERVAL_MS = 2000;
  const INCIDENT_COOLDOWN_MS = 1000;

  // Helper to record violation
  const recordViolation = useCallback(
    (type: string, message: string) => {
      const now = Date.now();
      // ✅ Fix: Use constant instead of magic number
      // If paused, overlay is already showing, OR a violation was recorded < 1 second ago, ignore.
      if (paused || overlayRef.current || now - lastViolationTimeRef.current < VIOLATION_COOLDOWN_MS) return;

      lastViolationTimeRef.current = now;
      const newViolation: Violation = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      };
      setViolations((prev) => [newViolation, ...prev]);
      if (onViolationRef.current) onViolationRef.current(type, message);
    },
    [paused],
  );

  // Overlay Logic
  const toggleBlockingOverlaySecure = useCallback(
    (show: boolean, msg: string = "Cảnh báo gian lận") => {
      if (paused && show) return;

      if (show) {
        if (!overlayRef.current) {
          const div = document.createElement("div");
          div.style.cssText =
            "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-size:24px;text-align:center;backdrop-filter:blur(10px);";
          const upperMsg = msg.toUpperCase();
          const isLocked = upperMsg.includes("BỊ KHÓA");
          const isInfo = upperMsg.includes("HẾT LƯỢT");
          const isError = upperMsg.includes("KHÔNG THỂ");
          const isHardBlock = isLocked || isInfo || isError;

          let title = "CẢNH BÁO VI PHẠM";
          let icon = "⚠️";
          let btnText = "Quay lại Chế độ Toàn màn hình";
          let titleColor = "#ff4d4f"; // Default Red

          if (isInfo) {
            title = "THÔNG BÁO HỆ THỐNG";
            icon = "ℹ️";
            btnText = "Quay về lớp học";
            titleColor = "#4f46e5"; // Indigo for Info
          } else if (isLocked) {
            title = "BÀI THI ĐÃ BỊ KHÓA";
            icon = "🚫";
            btnText = "Quay lại";
          } else if (isError) {
            title = "KHÔNG THỂ BẮT ĐẦU";
            icon = "🚫";
            btnText = "Quay lại";
          }

          // ✅ Fix XSS: Use textContent và createElement instead of innerHTML
          const iconDiv = document.createElement("div");
          iconDiv.style.cssText = "font-size: 60px; margin-bottom: 20px;";
          iconDiv.textContent = icon;

          const titleEl = document.createElement("h2");
          titleEl.style.cssText = `color: ${titleColor}; font-weight: bold; font-size: 32px; margin-bottom: 15px;`;
          titleEl.textContent = title; // ✅ textContent escapes HTML

          const msgEl = document.createElement("p");
          msgEl.id = "overlay-msg";
          msgEl.style.cssText = "margin: 10px 0; font-size: 20px; line-height: 1.6;";
          msgEl.textContent = msg; // ✅ textContent escapes HTML

          const btnEl = document.createElement("button");
          btnEl.id = "resume-btn";
          btnEl.style.cssText = `margin-top: 40px; padding: 14px 50px; font-size: 18px; background: linear-gradient(135deg, ${isInfo ? "#6366f1 0%, #4f46e5 100%" : "#4f46e5 0%, #7c3aed 100%"}); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4); transition: transform 0.2s;`;
          btnEl.textContent = btnText; // ✅ textContent escapes HTML

          div.appendChild(iconDiv);
          div.appendChild(titleEl);
          div.appendChild(msgEl);
          div.appendChild(btnEl);
          document.body.appendChild(div);
          overlayRef.current = div;

          div.querySelector("#resume-btn")?.addEventListener("click", () => {
            if (isHardBlock) {
              window.dispatchEvent(new CustomEvent("exam_locked_exit"));
            } else {
              enterFullScreenRef.current();
            }
          });
        } else {
          // ✅ Fix XSS: Use textContent instead of innerHTML
          const p = overlayRef.current.querySelector("#overlay-msg") as HTMLElement;
          if (p) p.textContent = msg; // ✅ textContent escapes HTML
        }
      } else {
        if (overlayRef.current && document.body.contains(overlayRef.current)) {
          document.body.removeChild(overlayRef.current);
        }
        overlayRef.current = null;
      }
    },
    [paused],
  );

  const enterFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // @ts-ignore
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
      if ("keyboard" in navigator && "lock" in (navigator as any).keyboard) {
        try {
          await (navigator as any).keyboard.lock(["Escape"]);
        } catch (e) {
          console.error(e);
        }
      }
      toggleBlockingOverlaySecure(false);
    } catch (err) {
      console.error("Error attempting to enable full-screen mode:", err);
    }
  }, [toggleBlockingOverlaySecure]);

  useEffect(() => {
    enterFullScreenRef.current = enterFullScreen;
  }, [enterFullScreen]);

  const exitFullScreen = useCallback(async () => {
    try {
      if ("keyboard" in navigator && "unlock" in (navigator as any).keyboard) {
        (navigator as any).keyboard.unlock();
      }
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      toggleBlockingOverlaySecure(false);
    } catch (err) {
      console.error("Error attempting to exit full-screen mode:", err);
    }
  }, [toggleBlockingOverlaySecure]);

  // 0. Prevent Reload/Close (IMPORTANT: BeforeUnload)
  useEffect(() => {
    if (!enable) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to trigger browser confirmation dialog
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enable]);

  // ✅ Fix: Use refs để prevent handler recreation
  const checkDevToolsRef = useRef<() => void>(undefined);
  const recordViolationRef = useRef(recordViolation);
  const toggleBlockingOverlaySecureRef = useRef(toggleBlockingOverlaySecure);

  useEffect(() => {
    recordViolationRef.current = recordViolation;
    toggleBlockingOverlaySecureRef.current = toggleBlockingOverlaySecure;
  }, [recordViolation, toggleBlockingOverlaySecure]);

  // 1. Monitor DevTools (Relaxed Threshold)
  useEffect(() => {
    if (!enable || paused) return;

    // ✅ Fix: Define checkDevTools inside useEffect để có stable reference
    const checkDevTools = () => {
      if (paused) return; // Add check inside interval as well
      // ✅ Fix: Use constant instead of magic number
      const widthThreshold = window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD;
      const heightThreshold = window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD;

      if (widthThreshold || heightThreshold) {
        const msg = "Phát hiện hành vi gian lận!";
        recordViolationRef.current("devtools_open", msg);
        toggleBlockingOverlaySecureRef.current(true, msg);
      }
    };

    checkDevToolsRef.current = checkDevTools;

    // ✅ Fix: Use constant instead of magic number
    const interval = setInterval(checkDevTools, DEVTOOLS_CHECK_INTERVAL_MS);
    window.addEventListener("resize", checkDevTools);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkDevTools);
    };
  }, [enable, paused]); // ✅ Remove callbacks from dependencies, use refs instead

  // 2. Incident Monitor (Shared for Fullscreen & Focus Loss)
  const lastIncidentTimeRef = useRef<number>(0);
  const wasFullScreenRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      wasFullScreenRef.current = !!document.fullscreenElement;
    }
  }, []);

  const handleOutIncident = useCallback(
    (type: "exit_fullscreen" | "focus_loss", customMsg?: string) => {
      // 0. If overlay is ALREADY showing, do not count further incidents
      if (overlayRef.current) return;

      const now = Date.now();
      // ✅ Fix: Use constant instead of magic number
      // Protect against rapid firing
      if (now - lastIncidentTimeRef.current < INCIDENT_COOLDOWN_MS) return;
      lastIncidentTimeRef.current = now;

      // 1. Increment incident counter
      fullscreenExitCountRef.current += 1;
      const currentCount = fullscreenExitCountRef.current;

      // 2. Record formal violation EVERY incident (User wants 5 total = lock)
      recordViolation(type, `Cảnh báo vi phạm lần ${currentCount}`);

      // 3. Show overlay immediately
      let displayMsg = "";
      if (currentCount < 5) {
        displayMsg = `Vui lòng QUAY LẠI bài thi ngay!<br/>
                      <span style="font-size:18px; color:#ff4d4f; margin-top:20px; display:block; font-weight:bold;">
                        CẢNH BÁO VI PHẠM LẦN: ${currentCount}/5
                      </span>
                      <p style="font-size:14px; color:#888; margin-top:10px;">(Hệ thống sẽ TỰ ĐỘNG KHÓA bài thi nếu bạn vi phạm đủ 5 lần)</p>`;
      } else {
        displayMsg = `<span style="color:#ff4d4f; font-weight:bold;">BẠN ĐÃ VI PHẠM QUY CHẾ THI ĐỦ 5 LẦN.</span><br/>
                      Bài thi đã bị BỊ KHÓA vĩnh viễn và hệ thống đã tự động nộp bài làm của bạn.`;
      }
      toggleBlockingOverlaySecure(true, displayMsg);
    },
    [recordViolation, toggleBlockingOverlaySecure],
  );

  useEffect(() => {
    if (!enable || paused) return;

    const handleFullScreenChange = () => {
      if (paused) return;
      const isFull = !!document.fullscreenElement;
      const previouslyFull = wasFullScreenRef.current;
      wasFullScreenRef.current = isFull;

      setIsFullScreen(isFull);

      if (!isFull && previouslyFull && enable) {
        handleOutIncident("exit_fullscreen");
      } else if (isFull) {
        toggleBlockingOverlaySecure(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [enable, handleOutIncident, toggleBlockingOverlaySecure, paused]);

  // 3. Block Keys (Aggressive intercept)
  useEffect(() => {
    if (!enable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const key = e.key.toLowerCase();

      // 1. SILENTLY BLOCK ALL COMBINATIONS (Ctrl/Cmd/Alt + any key)
      // Per user request: This is for prevention, not recorded as violation
      if (isCtrlOrCmd || isAlt) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      // 2. SILENTLY BLOCK SPECIFIC SINGLE KEYS
      const forbiddenSingleKeys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "escape"];
      if (forbiddenSingleKeys.includes(key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const handleGesture = (e: any) => {
      e.preventDefault();
    };

    // Use capture phase (true) to intercept events before they reach other handlers
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("gesturestart", handleGesture);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("gesturestart", handleGesture);
    };
  }, [enable]);

  // 4. Visibility & Blur (Strict Alt+Tab Detection)
  useEffect(() => {
    if (!enable || paused) return;

    // Detect Tab Switch / Minimize
    const handleVisibilityChange = () => {
      if (paused) return;
      if (document.hidden) {
        handleOutIncident("focus_loss");
        document.title = "⚠️ VI PHẠM ⚠️";
      } else {
        document.title = "Làm bài thi";
      }
    };

    // Detect Loss of Focus (Alt+Tab, Click other Window)
    const handleBlur = () => {
      if (paused) return;
      handleOutIncident("focus_loss");
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enable, handleOutIncident, paused]);

  // FINAL CLEANUP: Ensure overlay is removed when component unmounts
  useEffect(() => {
    return () => {
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        document.body.removeChild(overlayRef.current);
      }
    };
  }, []);

  return {
    violations,
    isFullScreen,
    enterFullScreen,
    exitFullScreen,
    setPaused,
    toggleBlockingOverlaySecure,
  };
};
