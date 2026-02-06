"use client";

import io from "socket.io-client";

type SocketInstance = ReturnType<typeof io>;

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
      console.error("Error getting user ID:", error);
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
      console.error("Error getting encrypted user:", e);
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
      console.error("Error getting token:", e);
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
      console.warn("Socket URL not configured");
      return null;
    }

    const userId = this.getUserId();
    const encryptedUser = this.getEncryptedUser();
    const token = this.getToken(); // ✅ Get JWT token

    if (!userId) {
      console.warn("[FriendSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      console.log("[FriendSocket] Connecting to:", socketUrl);

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

      // Connection event handlers
      this.socket.on("connect", () => {
        console.log("Friend socket connected:", this.socket?.id);

        // Authenticate using encrypted user data
        if (encryptedUser || token) {
          console.log("[FriendSocket] Authenticating...");
          this.socket?.emit("authenticate", {
            encryptedData: encryptedUser,
            token: token,
          });
        } else {
          console.warn("[FriendSocket] Connected but no authentication data found!");
        }

        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("friend:authenticated", (data: any) => {
        console.log("[FriendSocket] Authentication successful:", data);
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Friend socket disconnected:", reason);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("Friend socket connection error:", error);
        this.isConnecting = false;

        // Notify all listeners
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("friend:error", (data: any) => {
        console.error("[FriendSocket] Server error:", data);
      });
    } catch (error) {
      console.error("Error creating friend socket connection:", error);
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
  emit(event: string, data: any): void {
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
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      this.socket.on(event, callback);

      // Return unsubscribe function
      return () => {
        if (this.socket) {
          this.socket.off(event, callback);
        }
      };
    }
    return () => {};
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
export const friendSocketClient = new FriendSocketClient();
