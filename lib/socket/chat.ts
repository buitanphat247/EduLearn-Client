import { chatSocketClient } from "./chat-client";

export const joinChatRoom = (roomId: string | number) => {
  chatSocketClient.emit("join_room", { room_id: roomId });
};

export const leaveChatRoom = (roomId: string | number) => {
  chatSocketClient.emit("leave_room", { room_id: roomId });
};

export const onMessageReceived = (callback: (message: any) => void) => {
  return chatSocketClient.on("receive_message", callback);
};

export const onNewMessageNotification = (callback: (message: any) => void) => {
  return chatSocketClient.on("new_message_notification", callback);
};

export const onMessageRead = (callback: (data: { room_id: number; user_id: number; message_id: number }) => void) => {
  return chatSocketClient.on("message_read", callback);
};

export const onUserBlocked = (callback: (data: { userId: number; isBlocked: boolean; initiatedByMe: boolean }) => void) => {
  return chatSocketClient.on("user_blocked", callback);
};

export const onUserUnblocked = (callback: (data: { userId: number; initiatedByMe: boolean }) => void) => {
  return chatSocketClient.on("user_unblocked", callback);
};
