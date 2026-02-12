"use client";

import { friendSocketClient } from "./friend-client";
import { FriendErrorPayload } from "./friend";

/**
 * Remove Friend Events
 */
export interface RemoveFriendEvent {
  user_id: number; // Current user who is removing the friend
  friend_id: number; // Friend request/relationship ID
}

export interface FriendRemovedPayload {
  friend_id: number;
  user_id: number;
  removed_user_id: number;
}

/**
 * Remove friend via socket
 */
export const removeFriend = (data: RemoveFriendEvent): Promise<FriendRemovedPayload> => {
  return new Promise((resolve, reject) => {
    const socket = friendSocketClient.getSocket();

    if (!socket || !socket.connected) {
      friendSocketClient.connect();
      setTimeout(() => {
        const connectedSocket = friendSocketClient.getSocket();
        if (!connectedSocket || !connectedSocket.connected) {
          reject(new Error("Socket not connected. Please try again."));
          return;
        }
        sendRemove(connectedSocket);
      }, 1000);
    } else {
      sendRemove(socket);
    }

    function sendRemove(sock: any) {
      const onSuccess = (payload: FriendRemovedPayload) => {
        sock.off("friend:removed", onSuccess);
        sock.off("friend:error", onError);
        resolve(payload);
      };

      const onError = (payload: FriendErrorPayload) => {
        sock.off("friend:removed", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error(payload.error || "Failed to remove friend"));
      };

      sock.on("friend:removed", onSuccess);
      sock.on("friend:error", onError);
      sock.emit("friend:remove", data);

      setTimeout(() => {
        sock.off("friend:removed", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error("Request timeout"));
      }, 10000);
    }
  });
};

/**
 * Listen for friend removed events
 */
export const onFriendRemoved = (callback: (payload: FriendRemovedPayload) => void): (() => void) => {
  const socket = friendSocketClient.getSocket();
  const eventName = "friend:removed";

  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on(eventName, callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off(eventName, callback);
      }
    };
  }

  socket.on(eventName, callback);

  return () => {
    if (socket) {
      socket.off(eventName, callback);
    }
  };
};
