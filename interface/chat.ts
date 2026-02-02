/**
 * Chat and Messaging Type Definitions
 * @module interface/chat
 * @description TypeScript interfaces for chat functionality and messaging
 */

/**
 * Chat message interface
 * @interface ChatMessage
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Sender's user ID */
  senderId: string;
  /** Sender's display name */
  senderName: string;
  /** Sender's avatar URL */
  senderAvatar: string;
  /** Message content/text */
  content: string;
  /** ISO timestamp when message was sent */
  timestamp: string;
  /** Whether this message is from current user */
  isOwn?: boolean;
  /** Message type */
  type?: "text" | "image" | "file";
  /** Array of attachment URLs (for images/files) */
  attachments?: string[];
}

/**
 * Chat participant interface
 * @interface ChatParticipant
 */
export interface ChatParticipant {
  /** Participant's user ID */
  id: string;
  /** Participant's display name */
  name: string;
  /** Participant's avatar URL */
  avatar: string;
  /** Participant's role */
  role: "admin" | "teacher" | "student";
  /** Whether participant is currently online */
  isOnline: boolean;
  /** ISO timestamp of last seen activity */
  lastSeen?: string;
}

/**
 * Chat group information
 * @interface ChatGroupInfo
 */
export interface ChatGroupInfo {
  /** Group identifier */
  id: string;
  /** Group name */
  name: string;
  /** Group code/identifier */
  code: string;
  /** Optional group description */
  description?: string;
  /** Number of participants */
  participants: number;
  /** Total number of messages in group */
  totalMessages: number;
  /** ISO timestamp when group was created */
  createdAt: string;
  /** Group status */
  status: "Hoạt động" | "Tạm dừng";
}

/**
 * Class chat item for UI display
 * @interface ClassChatItem
 */
export interface ClassChatItem {
  /** Unique key for table/list rendering */
  key: string;
  /** Class name */
  className: string;
  /** Class code */
  classCode: string;
  /** Total number of messages */
  totalMessages: number;
  /** Number of unread messages */
  unreadMessages: number;
  /** ISO timestamp of last activity */
  lastActivity: string;
  /** Number of participants */
  participants: number;
  /** Chat status */
  status: "Hoạt động" | "Tạm dừng";
}

