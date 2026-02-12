"use client";

import io from "socket.io-client";
import { SocketAuthResponse, SocketErrorResponse, SocketEventData } from "./types";

type SocketInstance = ReturnType<typeof io>;

const isDev = process.env.NODE_ENV === "development";

/**
 * Socket client cho Chat namespace (/chat)
 */
class ChatSocketClient {
  private socket: SocketInstance | null = null;
  private isConnecting = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  private getSocketUrl(): string {
    if (typeof window === "undefined") return "";
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.edulearning.io.vn/api";
    let socketUrl = envUrl || apiUrl;
    try {
      if (typeof socketUrl === "string" && socketUrl.includes("//") && !socketUrl.includes("://")) {
        socketUrl = socketUrl.replace("//", "://");
      }
      const url = new URL(socketUrl.includes("://") ? socketUrl : `https://${socketUrl}`);
      console.warn(`[ChatSocket] Connecting to origin: ${url.origin}`);
      return url.origin;
    } catch (e) {
      console.error("[ChatSocket] URL derivation failed:", e);
      return socketUrl.split("/api")[0];
    }
  }

  private getUserId(): number | string | null {
    if (typeof window === "undefined") return null;

    try {
      const { getUserIdFromCookie } = require("@/lib/utils/cookies");
      const userId = getUserIdFromCookie();
      if (userId) return userId;

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.user_id) return user.user_id;
        if (user.id) return user.id;
      }
    } catch (error) {
      if (isDev) console.error("[ChatSocket] Error getting user ID:", error);
    }
    return null;
  }

  /**
   * Get encrypted user data from cookie _u
   * NOTE: Cookie _u is NOT httpOnly, so JavaScript can read it
   */
  private getEncryptedUser(): string | null {
    if (typeof window === "undefined") return null;

    try {
      const { getCookie } = require("@/lib/utils/cookies");
      // Get encrypted user from cookie _u
      const encryptedUser = getCookie("_u");
      if (encryptedUser) return encryptedUser;
    } catch (e) {
      if (isDev) console.error("[ChatSocket] Error getting encrypted user:", e);
    }

    return null;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const { getCookie } = require("@/lib/utils/cookies");
      const token = getCookie("_at") || getCookie("access_token") || getCookie("token");
      if (token) return token;
      return localStorage.getItem("token") || localStorage.getItem("access_token");
    } catch (e) {
      return null;
    }
  }

  connect(): SocketInstance | null {
    // Return existing connection if available
    if (this.socket?.connected) {
      return this.socket;
    }

    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return this.socket;
    }

    const socketUrl = this.getSocketUrl();
    if (!socketUrl) {
      if (isDev) console.warn("[ChatSocket] Socket URL not configured");
      return null;
    }

    const userId = this.getUserId();
    const encryptedUser = this.getEncryptedUser();

    if (!userId) {
      if (isDev) console.warn("[ChatSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      if (isDev) console.log("[ChatSocket] Connecting to:", socketUrl);

      // Connect to /chat namespace
      this.socket = io(`${socketUrl}/chat`, {
        auth: {
          user_id: userId,
        },
        query: {
          userId: String(userId),
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        if (isDev) console.log("[ChatSocket] Connected:", this.socket?.id);

        // Authenticate using encrypted user data
        if (encryptedUser) {
          this.socket?.emit("authenticate", { encryptedData: encryptedUser });
        }

        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("chat:authenticated", (data: SocketAuthResponse) => {
        if (isDev) console.log("[ChatSocket] Authenticated:", data.user_id);
      });

      this.socket.on("disconnect", (reason: string) => {
        if (isDev) console.log("[ChatSocket] Disconnected:", reason);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        if (isDev) console.error("[ChatSocket] Connection error:", error.message);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("chat:error", (data: SocketErrorResponse) => {
        if (isDev) console.error("[ChatSocket] Error:", data.message);
      });
    } catch (error) {
      if (isDev) console.error("[ChatSocket] Creation failed:", error);
      this.isConnecting = false;
      return null;
    }

    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): SocketInstance | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  emit(event: string, data: SocketEventData): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on<T = unknown>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      this.connect();
    }

    // Wait for socket to be initialized
    if (this.socket) {
      this.socket.on(event, callback as (...args: unknown[]) => void);
      return () => {
        this.socket?.off(event, callback as (...args: unknown[]) => void);
      };
    }
    return () => {};
  }

  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback as (...args: unknown[]) => void);
    } else {
      this.socket.off(event);
    }
  }
}

export const chatSocketClient = new ChatSocketClient();
