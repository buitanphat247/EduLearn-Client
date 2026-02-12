"use client";

import io from "socket.io-client";
import { SocketAuthResponse, SocketConnectedResponse, SocketErrorResponse, SocketEventData } from "./types";

type SocketInstance = ReturnType<typeof io>;

const isDev = process.env.NODE_ENV === "development";

/**
 * Socket client for Class namespace (/class)
 */
class ClassSocketClient {
  private socket: SocketInstance | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private pendingClassJoins: Set<string | number> = new Set();
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
      console.warn(`[ClassSocket] Connecting to origin: ${url.origin}`);
      return url.origin;
    } catch (e) {
      console.error("[ClassSocket] URL derivation failed:", e);
      return socketUrl.split("/api")[0];
    }
  }

  private getUserId(): number | string | null {
    if (typeof window === "undefined") return null;

    try {
      // Import from cookies utility
      const { getUserIdFromCookie } = require("@/lib/utils/cookies");
      const userId = getUserIdFromCookie();
      if (userId) return userId;

      // Fallback to localStorage for compatibility
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.user_id) return user.user_id;
        if (user.id) return user.id;
      }
    } catch (error) {
      if (isDev) console.error("[ClassSocket] Error getting user ID:", error);
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
      if (isDev) console.error("[ClassSocket] Error getting encrypted user:", e);
    }

    return null;
  }

  /**
   * Get JWT token from cookie or localStorage
   */
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
    if (this.socket?.connected) return this.socket;
    if (this.isConnecting) return this.socket;

    const socketUrl = this.getSocketUrl();
    if (!socketUrl) return null;

    const userId = this.getUserId();
    const encryptedUser = this.getEncryptedUser();
    const token = this.getToken(); // ✅ Get JWT token

    // User ID is required for socket connection identification
    if (!userId) {
      if (isDev) console.warn("[ClassSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      if (isDev) console.log("[ClassSocket] Connecting to:", socketUrl);

      this.socket = io(`${socketUrl}/class`, {
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
        if (isDev) console.log("[ClassSocket] Connected:", this.socket?.id);

        this.isAuthenticated = false;

        // Authenticate using encrypted user data
        if (encryptedUser || token) {
          this.socket?.emit("authenticate", {
            encryptedData: encryptedUser,
            token: token,
          });
        }

        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("class:authenticated", (data: SocketAuthResponse) => {
        if (isDev) console.log("[ClassSocket] Authenticated:", data.user_id);
        this.isAuthenticated = true;

        if (this.pendingClassJoins.size > 0) {
          this.pendingClassJoins.forEach((classId) => {
            this.socket?.emit("join_class", { class_id: classId });
          });
          this.pendingClassJoins.clear();
        }
      });

      this.socket.on("disconnect", (reason: string) => {
        if (isDev) console.log("[ClassSocket] Disconnected:", reason);
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        if (isDev) console.error("[ClassSocket] Connection error:", error.message);
        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      // Listen for server confirmation
      this.socket.on("class:connected", (data: SocketConnectedResponse) => {
        if (isDev) console.log("[ClassSocket] Server confirmed:", data.socketId);
      });

      // Listen for server errors
      this.socket.on("class:error", (data: SocketErrorResponse) => {
        if (isDev) console.error("[ClassSocket] Error:", data.message);
      });
    } catch (error) {
      if (isDev) console.error("[ClassSocket] Creation failed:", error);
      this.isConnecting = false;
      return null;
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  getSocket(): SocketInstance | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  emit(event: string, data: SocketEventData): void {
    if (!this.socket) this.connect();
    if (this.socket) this.socket.emit(event, data);
  }

  on<T = unknown>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) this.connect();
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

  joinClass(classId: string | number) {
    if (this.isAuthenticated && this.socket?.connected) {
      this.emit("join_class", { class_id: classId });
    } else {
      this.pendingClassJoins.add(classId);
      if (!this.socket?.connected && !this.isConnecting) {
        this.connect();
      }
    }
  }

  leaveClass(classId: string | number) {
    this.emit("leave_class", { class_id: classId });
  }
}

export const classSocketClient = new ClassSocketClient();
