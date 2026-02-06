/**
 * Shared types for Socket.IO clients
 * Provides type-safe event handling and data structures
 */

/** Authentication response from server */
export interface SocketAuthResponse {
  success: boolean;
  user_id?: number | string;
  message?: string;
}

/** Socket connection response */
export interface SocketConnectedResponse {
  socketId: string;
  timestamp?: string;
}

/** Socket error response */
export interface SocketErrorResponse {
  code?: string;
  message: string;
  details?: unknown;
}

/** Generic socket event data - use specific types when possible */
export type SocketEventData = Record<string, unknown>;

/** Generic event callback type - allows flexible callback signatures */
export type SocketEventCallback<T = unknown> = (data: T) => void;

/** Connection state listener */
export type ConnectionStateListener = (connected: boolean) => void;
