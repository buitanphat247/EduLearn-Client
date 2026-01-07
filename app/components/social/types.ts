export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
  isGroup?: boolean;
  isCloud?: boolean;
  isNotification?: boolean;
  members?: number;
  lastAccess?: string;
  isOwn?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  content: string;
  time: string;
  isOwn: boolean;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  mutualFriends?: number;
  isFriend?: boolean;
  friendshipId?: number;
}

export interface FriendRequestResponse {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  accepted_at?: string | null;
  requester?: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  addressee?: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}
