"use client";

import io from "socket.io-client";

type SocketInstance = ReturnType<typeof io>;

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

    // Try to get from environment variable
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envUrl) {
      return envUrl;
    }

    // Default: same origin as API, but on socket.io path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1611";
    return apiUrl.replace("/api", "");
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
      console.warn("[ClassSocket] No user ID found, cannot connect");
      return null;
    }

    this.isConnecting = true;

    try {
      console.log("[ClassSocket] Connecting to:", socketUrl);

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
        console.log("Class socket connected:", this.socket?.id);

        this.isAuthenticated = false;

        // Authenticate using encrypted user data
        if (encryptedUser || token) {
          console.log("[ClassSocket] Authenticating...");
          this.socket?.emit("authenticate", {
            encryptedData: encryptedUser,
            token: token,
          });
        } else {
          console.warn("[ClassSocket] Connected but no authentication data found!");
        }

        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(true));
      });

      this.socket.on("class:authenticated", (data: any) => {
        console.log("[ClassSocket] Authentication successful:", data);
        this.isAuthenticated = true;

        if (this.pendingClassJoins.size > 0) {
          console.log(`[ClassSocket] Joining ${this.pendingClassJoins.size} pending class rooms`);
          this.pendingClassJoins.forEach((classId) => {
            this.socket?.emit("join_class", { class_id: classId });
          });
          this.pendingClassJoins.clear();
        }
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Class socket disconnected:", reason);
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("Class socket connection error:", error);
        this.isConnecting = false;
        this.connectionListeners.forEach((listener) => listener(false));
      });

      // Listen for server confirmation
      this.socket.on("class:connected", (data: any) => {
        console.log("[ClassSocket] Server confirmed connection:", data);
      });

      // Listen for server errors
      this.socket.on("class:error", (data: any) => {
        try {
          console.error("[ClassSocket] Server error:", typeof data === "object" ? JSON.stringify(data, null, 2) : data);
        } catch (e) {
          console.error("[ClassSocket] Server error (raw):", data);
        }
      });
    } catch (error) {
      console.error("Error creating class socket connection:", error);
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

  // Helper method specifically for class updates
  joinClass(classId: string | number) {
    console.log(`[ClassSocket] Attempting to join class room: ${classId}`);
    if (this.isAuthenticated && this.socket?.connected) {
      console.log(`[ClassSocket] Emitting join_class for: ${classId}`);
      this.emit("join_class", { class_id: classId });
    } else {
      console.log(`[ClassSocket] Queueing join_class for: ${classId} (waiting for auth)`);
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
