"use client";

import io from "socket.io-client";

type SocketInstance = ReturnType<typeof io>;

/**
 * Socket.io client instance
 * Singleton pattern để đảm bảo chỉ có 1 connection duy nhất
 */
class SocketClient {
  private socket: SocketInstance | null = null;
  private isConnecting = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  /**
   * Get socket server URL from environment or use default
   */
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
      console.warn(`[Socket] Connecting to origin: ${url.origin}`);
      return url.origin;
    } catch (e) {
      console.error("[Socket] URL derivation failed:", e);
      return socketUrl.split("/api")[0];
    }
  }

  /**
   * Get access token from cookie (more secure than localStorage)
   * ✅ Removed localStorage fallback to prevent XSS risk
   */
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    // ✅ Try cookie first (more secure, httpOnly cookies are not accessible via JS)
    // Note: If token is in httpOnly cookie, it won't be accessible here
    // This method should be used for non-httpOnly tokens only
    try {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        // Check for common token cookie names
        if ((name === "_at" || name === "access_token") && value) {
          try {
            return decodeURIComponent(value);
          } catch {
            return value;
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting token from cookie:", error);
      }
    }

    // ❌ Removed localStorage fallback (security risk - XSS vulnerability)
    // If token is needed, it should be provided via httpOnly cookie or secure context
    // Only use localStorage if absolutely necessary and document the security risk

    return null;
  }

  /**
   * Get user ID for socket authentication
   */
  private getUserId(): number | string | null {
    if (typeof window === "undefined") return null;

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.user_id || null;
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }

    return null;
  }

  /**
   * Connect to socket server
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
      console.warn("Socket URL not configured");
      return null;
    }

    const token = this.getAccessToken();
    const userId = this.getUserId();

    if (!token || !userId) {
      console.warn("No access token or user ID found. Socket connection requires authentication.");
      return null;
    }

    this.isConnecting = true;

    try {
      // Create socket connection with authentication
      this.socket = io(socketUrl, {
        auth: {
          token,
          user_id: userId,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      // Connection event handlers
      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
        this.isConnecting = false;

        // Join user room for receiving personal events
        const userId = this.getUserId();
        if (userId && this.socket) {
          this.socket.emit("join", { room: `user:${userId}` });
        }

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Socket disconnected:", reason);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("Socket connection error:", error);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });
    } catch (error) {
      console.error("Error creating socket connection:", error);
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

  /**
   * Emit event to server
   */
  emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to event from server
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) {
      console.warn(`Cannot listen to ${event}: Socket not initialized`);
      return () => {};
    }

    this.socket.on(event, callback);

    // Return unsubscribe function
    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
