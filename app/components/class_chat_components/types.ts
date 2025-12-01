export interface ClassChatItem {
  key: string;
  className: string;
  classCode: string;
  totalMessages: number;
  unreadMessages: number;
  lastActivity: string;
  participants: number;
  status: "Hoạt động" | "Tạm dừng";
}
