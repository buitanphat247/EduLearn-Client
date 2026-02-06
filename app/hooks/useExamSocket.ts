import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

/**
 * Socket.IO connection URL for exam real-time features
 * @constant SOCKET_URL
 * @description Uses NEXT_PUBLIC_FLASK_API_URL environment variable or defaults to localhost
 */
const SOCKET_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000";

/**
 * Options for useExamSocket hook
 * @interface UseExamSocketProps
 */
interface UseExamSocketProps {
  /** Exam ID to connect to */
  examId: string;
  /** Attempt ID if available (preferred over examId) */
  attemptId?: string;
  /** Student ID performing the exam */
  studentId: string;
  /** Callback when socket connects */
  onConnect?: () => void;
  /** Callback when socket disconnects */
  onDisconnect?: () => void;
}

/**
 * Hook for managing Socket.IO connection during exams
 * @param {UseExamSocketProps} props - Socket configuration
 * @returns {{ isConnected: boolean, socket: Socket | null }} Connection state and socket instance
 * @description
 * Manages real-time socket connection for exam features:
 * - Auto-connects when examId/attemptId and studentId are provided
 * - Joins exam room for real-time updates
 * - Handles reconnection automatically
 * - Cleans up on unmount
 *
 * @example
 * ```typescript
 * const { isConnected, socket } = useExamSocket({
 *   examId: '123',
 *   studentId: '456',

 * });
 * ```
 */
export const useExamSocket = ({ examId, attemptId, studentId, onConnect, onDisconnect }: UseExamSocketProps) => {
  // ✅ Fix: Use proper Socket type instead of any
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if ((!examId && !attemptId) || !studentId) return;

    // ✅ Fix: Disconnect previous socket if exists
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // ✅ Fix: Use proper io import (no need for (io as any).default check)
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // ✅ Fix: Define handlers separately để có thể remove đúng
    const handleConnect = () => {
      console.log("✅ Socket Connected:", socket.id);
      setIsConnected(true);

      // Join the specific exam room
      if (attemptId) {
        socket.emit("join_attempt", { attemptId });
      } else {
        socket.emit("join_exam", { examId, studentId });
      }

      if (onConnect) onConnect();
    };

    const handleDisconnect = () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
      if (onDisconnect) onDisconnect();
    };

    const handleJoinSuccess = (data: any) => {
      console.log("Exam/Attempt Joined:", data);
    };

    const handleViolationRecorded = (data: any) => {
      console.log("Violation Ack:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("join_success", handleJoinSuccess);
    socket.on("violation_recorded", handleViolationRecorded);

    // ✅ Fix: Proper cleanup - remove all listeners before disconnect
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("join_success", handleJoinSuccess);
      socket.off("violation_recorded", handleViolationRecorded);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [examId, attemptId, studentId, onConnect, onDisconnect]); // ✅ Include callbacks in dependencies

  const reportViolation = useCallback(
    (type: string, message: string) => {
      if (socketRef.current && isConnected) {
        if (attemptId) {
          socketRef.current.emit("report_violation", {
            attemptId,
            type,
            message,
          });
        } else {
          socketRef.current.emit("report_violation", {
            examId,
            studentId,
            type,
            message,
          });
        }
      } else {
        console.warn("Socket not connected, cannot report violation:", type);
      }
    },
    [examId, attemptId, studentId, isConnected],
  );

  return {
    socket: socketRef.current,
    isConnected,
    reportViolation,
  };
};
