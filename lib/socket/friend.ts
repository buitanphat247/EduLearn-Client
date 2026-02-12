"use client";

import { friendSocketClient } from "./friend-client";

/**
 * Friend Request Events
 */
export interface SendFriendRequestEvent {
  requester_id: number;
  email?: string;
  phone?: string;
}

export interface FriendRequestSentPayload {
  friend: FriendData;
  addressee_id: number;
}

export interface FriendRequestReceivedPayload {
  friend: FriendData;
  addressee_id: number;
}

export interface FriendErrorPayload {
  error: string;
  event: string;
}

export interface FriendData {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: "pending" | "accepted" | "rejected" | "blocked";
  created_at: string;
  accepted_at?: string | null;
  requester?: {
    user_id: number;
    username: string;
    fullname: string;
    email?: string;
    phone?: string | null;
    avatar?: string | null;
    status?: "online" | "offline" | "away";
  };
  addressee?: {
    user_id: number;
    username: string;
    fullname: string;
    email?: string;
    phone?: string | null;
    avatar?: string | null;
    status?: "online" | "offline" | "away";
  };
}

export interface AcceptFriendRequestEvent {
  user_id: number; // Current user (addressee) who is accepting
  friend_id: number; // Friend request record ID
  requester_id?: number; // Person who sent the request (for backend validation)
}

export interface RejectFriendRequestEvent {
  user_id: number; // Current user (addressee) who is rejecting
  friend_id: number; // Friend request record ID
  requester_id?: number; // Person who sent the request (for backend validation)
}

export interface FriendRequestAcceptedPayload {
  friend: FriendData;
  requester_id: number;
  addressee_id: number;
}

export interface FriendRequestRejectedPayload {
  friend_id: number;
  requester_id: number;
  addressee_id: number;
}

/**
 * Send friend request via socket
 */
export const sendFriendRequest = (data: SendFriendRequestEvent): Promise<FriendRequestSentPayload> => {
  return new Promise((resolve, reject) => {
    const socket = friendSocketClient.getSocket();
    
    if (!socket || !socket.connected) {
      friendSocketClient.connect();
      // Wait a bit for connection
      setTimeout(() => {
        const connectedSocket = friendSocketClient.getSocket();
        if (!connectedSocket || !connectedSocket.connected) {
          reject(new Error("Socket not connected. Please try again."));
          return;
        }
        sendRequest(connectedSocket);
      }, 1000);
    } else {
      sendRequest(socket);
    }

    function sendRequest(sock: any) {
      // Listen for success response
      const onSuccess = (payload: FriendRequestSentPayload) => {
        sock.off("friend:request-sent", onSuccess);
        sock.off("friend:error", onError);
        resolve(payload);
      };

      // Listen for error response
      const onError = (payload: FriendErrorPayload) => {
        sock.off("friend:request-sent", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error(payload.error || "Failed to send friend request"));
      };

      // Set up listeners
      sock.on("friend:request-sent", onSuccess);
      sock.on("friend:error", onError);

      // Emit the request
      sock.emit("friend:send-request", data);

      // Timeout after 10 seconds
      setTimeout(() => {
        sock.off("friend:request-sent", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error("Request timeout"));
      }, 10000);
    }
  });
};

/**
 * Listen for friend request received events
 */
/**
 * Accept friend request via socket
 */
export const acceptFriendRequest = (data: AcceptFriendRequestEvent): Promise<FriendRequestAcceptedPayload> => {
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
        sendAccept(connectedSocket);
      }, 1000);
    } else {
      sendAccept(socket);
    }

    function sendAccept(sock: any) {
      const onSuccess = (payload: FriendRequestAcceptedPayload) => {
        sock.off("friend:request-accepted", onSuccess);
        sock.off("friend:error", onError);
        resolve(payload);
      };

      const onError = (payload: FriendErrorPayload) => {
        sock.off("friend:request-accepted", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error(payload.error || "Failed to accept friend request"));
      };

      sock.on("friend:request-accepted", onSuccess);
      sock.on("friend:error", onError);
      sock.emit("friend:accept-request", data);

      setTimeout(() => {
        sock.off("friend:request-accepted", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error("Request timeout"));
      }, 10000);
    }
  });
};

/**
 * Reject friend request via socket
 */
export const rejectFriendRequest = (data: RejectFriendRequestEvent): Promise<FriendRequestRejectedPayload> => {
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
        sendReject(connectedSocket);
      }, 1000);
    } else {
      sendReject(socket);
    }

    function sendReject(sock: any) {
      const onSuccess = (payload: FriendRequestRejectedPayload) => {
        sock.off("friend:request-rejected", onSuccess);
        sock.off("friend:error", onError);
        resolve(payload);
      };

      const onError = (payload: FriendErrorPayload) => {
        sock.off("friend:request-rejected", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error(payload.error || "Failed to reject friend request"));
      };

      sock.on("friend:request-rejected", onSuccess);
      sock.on("friend:error", onError);
      sock.emit("friend:reject-request", data);

      setTimeout(() => {
        sock.off("friend:request-rejected", onSuccess);
        sock.off("friend:error", onError);
        reject(new Error("Request timeout"));
      }, 10000);
    }
  });
};

/**
 * Listen for friend request received events
 */
export const onFriendRequestReceived = (
  callback: (payload: FriendRequestReceivedPayload) => void
): (() => void) => {
  const socket = friendSocketClient.getSocket();
  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on("friend:request-received", callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off("friend:request-received", callback);
      }
    };
  }

  socket.on("friend:request-received", callback);
  
  return () => {
    if (socket) {
      socket.off("friend:request-received", callback);
    }
  };
};

/**
 * Listen for friend request accepted events
 */
export const onFriendRequestAccepted = (
  callback: (payload: FriendRequestAcceptedPayload) => void
): (() => void) => {
  const socket = friendSocketClient.getSocket();
  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on("friend:request-accepted", callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off("friend:request-accepted", callback);
      }
    };
  }

  socket.on("friend:request-accepted", callback);
  
  return () => {
    if (socket) {
      socket.off("friend:request-accepted", callback);
    }
  };
};

/**
 * Listen for friend request rejected events
 */
export const onFriendRequestRejected = (
  callback: (payload: FriendRequestRejectedPayload) => void
): (() => void) => {
  const socket = friendSocketClient.getSocket();
  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on("friend:request-rejected", callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off("friend:request-rejected", callback);
      }
    };
  }

  socket.on("friend:request-rejected", callback);
  
  return () => {
    if (socket) {
      socket.off("friend:request-rejected", callback);
    }
  };
};

/**
 * Listen for friend request sent confirmation
 */
export const onFriendRequestSent = (
  callback: (payload: FriendRequestSentPayload) => void
): (() => void) => {
  const socket = friendSocketClient.getSocket();
  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on("friend:request-sent", callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off("friend:request-sent", callback);
      }
    };
  }

  socket.on("friend:request-sent", callback);
  
  return () => {
    if (socket) {
      socket.off("friend:request-sent", callback);
    }
  };
};

/**
 * Listen for friend request errors
 */
export const onFriendError = (
  callback: (payload: FriendErrorPayload) => void
): (() => void) => {
  const socket = friendSocketClient.getSocket();
  if (!socket) {
    friendSocketClient.connect();
    const checkConnection = setInterval(() => {
      const connectedSocket = friendSocketClient.getSocket();
      if (connectedSocket && connectedSocket.connected) {
        clearInterval(checkConnection);
        connectedSocket.on("friend:error", callback);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      const sock = friendSocketClient.getSocket();
      if (sock) {
        sock.off("friend:error", callback);
      }
    };
  }

  socket.on("friend:error", callback);
  
  return () => {
    if (socket) {
      socket.off("friend:error", callback);
    }
  };
};

