"use client";

import io from "socket.io-client";

type SocketInstance = ReturnType<typeof io>;

/**
 * Socket client for Notification namespace (/notification)
 */
class NotificationSocketClient {
  private socket: SocketInstance | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private pendingClassJoins: Set<string | number> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  private getSocketUrl(): string {
    if (typeof window === "undefined") return "";

    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envUrl) {
      return envUrl;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611";
    return apiUrl.replace("/api", "");
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
      console.warn("[NotificationSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      console.log("[NotificationSocket] Connecting to:", socketUrl);

      this.socket = io(`${socketUrl}/notification`, {
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
        console.log("Notification socket connected:", this.socket?.id);

        // Reset auth state on connect/reconnect
        this.isAuthenticated = false;

        // ✅ Send both encrypted cookie AND JWT token for robust auth
        if (encryptedUser || token) {
          console.log("[NotificationSocket] Authenticating...");
          this.socket?.emit("authenticate", {
            encryptedData: encryptedUser,
            token: token,
          });
        } else {
          console.warn("[NotificationSocket] Connected but no authentication data found!");
        }

        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("notification:authenticated", (data: any) => {
        console.log("[NotificationSocket] Authentication successful:", data);
        this.isAuthenticated = true;

        // Process any room joins that were requested before authentication
        if (this.pendingClassJoins.size > 0) {
          console.log(`[NotificationSocket] Joining ${this.pendingClassJoins.size} pending class rooms`);
          this.pendingClassJoins.forEach((classId) => {
            this.socket?.emit("join_class_notifications", { class_id: classId });
          });
          this.pendingClassJoins.clear();
        }
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Notification socket disconnected:", reason);
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("Notification socket connection error:", error);
        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      // Listen for server confirmation
      this.socket.on("notification:connected", (data: any) => {
        console.log("[NotificationSocket] Server confirmed connection:", data);
      });

      // Listen for server errors
      this.socket.on("notification:error", (data: any) => {
        console.error("[NotificationSocket] Server error:", data);
        if (data?.code === "AUTH_TIMEOUT") {
          // Retry auth logic could go here
        }
      });
    } catch (error) {
      console.error("Error creating notification socket connection:", error);
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

  emit(event: string, data: any): void {
    if (!this.socket) this.connect();
    if (this.socket) this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) this.connect();
    if (this.socket) {
      this.socket.on(event, callback);
      return () => {
        this.socket?.off(event, callback);
      };
    }
    return () => {};
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  joinClassNotifications(classId: string | number) {
    if (this.isAuthenticated && this.socket?.connected) {
      console.log("[NotificationSocket] Emitting join_class_notifications:", classId);
      this.socket.emit("join_class_notifications", { class_id: classId });
    } else {
      console.log("[NotificationSocket] Queuing class join until authenticated:", classId);
      this.pendingClassJoins.add(classId);
      // If we aren't even connecting, trigger it
      if (!this.socket?.connected && !this.isConnecting) {
        this.connect();
      }
    }
  }

  leaveClassNotifications(classId: string | number) {
    console.log("[NotificationSocket] Emitting leave_class_notifications:", classId);
    this.emit("leave_class_notifications", { class_id: classId });
  }
}

export const notificationSocketClient = new NotificationSocketClient();
