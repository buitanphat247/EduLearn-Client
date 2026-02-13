"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { socketClient } from "@/lib/socket";

type ConnectionStatus = "connected" | "disconnected" | "connecting" | "reconnecting";

interface UseConnectionStatusReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  reconnect: () => void;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
}

/**
 * Hook to track socket connection status
 * Provides status indicator and manual reconnect functionality
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial status check
    if (socketClient.isConnected()) {
      setStatus("connected");
      setLastConnectedAt(new Date());
    }

    // Subscribe to connection changes
    const unsubscribe = socketClient.onConnectionChange((isConnected) => {
      if (isConnected) {
        setStatus("connected");
        setLastConnectedAt(new Date());
        setReconnectAttempts(0);
      } else {
        setStatus("disconnected");
      }
    });

    return () => {
      unsubscribe();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const reconnect = useCallback(() => {
    if (status === "connecting" || status === "reconnecting") {
      return; // Already attempting
    }

    setStatus("reconnecting");
    setReconnectAttempts((prev) => prev + 1);

    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      socketClient.connect();
    }, delay);
  }, [status, reconnectAttempts]);

  return {
    status,
    isConnected: status === "connected",
    reconnect,
    lastConnectedAt,
    reconnectAttempts,
  };
}
