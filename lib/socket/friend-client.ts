"use client";

import io from "socket.io-client";
import { SocketAuthResponse, SocketErrorResponse, SocketEventData } from "./types";

type SocketInstance = ReturnType<typeof io>;

const isDev = process.env.NODE_ENV === "development";

/**
 * Socket client cho Friend namespace (/friends)
 * Tách biệt với socket client chính để handle friend-specific events
 */
class FriendSocketClient {
  private socket: SocketInstance | null = null;
  private isConnecting = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  /**
   * Get socket server URL from environment or use default
   */
  private getSocketUrl(): string {
    if (typeof window === "undefined") return "";

    // Try to get from environment variable
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envUrl) {
      return envUrl;
    }

    // Default: same origin as API, but on socket.io path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611";
    return apiUrl.replace("/api", "");
  }

  /**
   * Get user ID for socket connection
   */
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
      if (isDev) console.error("[FriendSocket] Error getting user ID:", error);
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
      if (isDev) console.error("[FriendSocket] Error getting encrypted user:", e);
    }

    return null;
  }

  /**
   * Get JWT token from cookie _at
   */
  private getToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      const { getCookie } = require("@/lib/utils/cookies");
      const token = getCookie("_at");
      if (token) return token;
    } catch (e) {
      if (isDev) console.error("[FriendSocket] Error getting token:", e);
    }
    return null;
  }

  /**
   * Connect to /friends namespace
   */
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
      if (isDev) console.warn("[FriendSocket] Socket URL not configured");
      return null;
    }

    const userId = this.getUserId();
    const encryptedUser = this.getEncryptedUser();
    const token = this.getToken(); // ✅ Get JWT token

    if (!userId) {
      if (isDev) console.warn("[FriendSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      if (isDev) console.log("[FriendSocket] Connecting to:", socketUrl);

      // Connect to /friends namespace with auth token and userId
      this.socket = io(`${socketUrl}/friends`, {
        auth: {
          user_id: userId,
          token: token, // ✅ Send token in handshake auth as well
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
        if (isDev) console.log("[FriendSocket] Connected:", this.socket?.id);

        // Authenticate using encrypted user data
        if (encryptedUser || token) {
          this.socket?.emit("authenticate", {
            encryptedData: encryptedUser,
            token: token,
          });
        }

        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("friend:authenticated", (data: SocketAuthResponse) => {
        if (isDev) console.log("[FriendSocket] Authenticated:", data.user_id);
      });

      this.socket.on("disconnect", (reason: string) => {
        if (isDev) console.log("[FriendSocket] Disconnected:", reason);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        if (isDev) console.error("[FriendSocket] Connection error:", error.message);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("friend:error", (data: SocketErrorResponse) => {
        if (isDev) console.error("[FriendSocket] Error:", data.message);
      });
    } catch (error) {
      if (isDev) console.error("[FriendSocket] Creation failed:", error);
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

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: SocketEventData): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen to event from server
   */
  on<T = unknown>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on(event, callback as (...args: unknown[]) => void);

      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off(event, callback as (...args: unknown[]) => void);
        }
      };
    }
    return () => {};
  }

  /**
   * Remove event listener
   */
  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as (...args: unknown[]) => void);
    } else {
      this.socket.off(event);
    }
  }
}

// Export singleton instance
export const friendSocketClient = new FriendSocketClient();
