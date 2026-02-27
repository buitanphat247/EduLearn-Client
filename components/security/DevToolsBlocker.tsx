"use client";

import { useEffect } from "react";

/**
 * Component to block DevTools and Inspection shortcuts
 */
export default function DevToolsBlocker() {
    useEffect(() => {
        // Only run in production or when explicitly enabled
        if (process.env.NODE_ENV !== "production") return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Allow normal typing
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.key.startsWith('F')) return;

            // F12
            if (e.key === "F12") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+I (Inspect)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+Shift+C (Inspect Element)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.key === "u") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl+S (Save Page)
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // Disable right-click
        document.addEventListener("contextmenu", handleContextMenu);

        // Disable keyboard shortcuts
        document.addEventListener("keydown", handleKeyDown, { capture: true });

        // Detect DevTools opening (basic check)
        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;

            if (widthThreshold || heightThreshold) {
                // Optional: Redirect or show warning
                // document.body.innerHTML = "Access Denied";
            }
        };

        // window.addEventListener('resize', checkDevTools);

        // Cleanup
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
            // window.removeEventListener('resize', checkDevTools);
        };
    }, []);

    return null;
}
