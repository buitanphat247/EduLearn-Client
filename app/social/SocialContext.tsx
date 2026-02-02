"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import {
  getFriends,
  getFriendRequests,
  FriendRequestResponse,
} from "@/lib/api/friends";
import {
  getChatRooms,
  ChatRoomType,
  createChatRoom,
  deleteConversation as deleteConversationApi,
} from "@/lib/api/chat-room";
import {
  getBlockedUsers,
  blockUser as apiBlockUser,
  unblockUser as apiUnblockUser,
  UserBlock,
} from "@/lib/api/chat-block";
import { Contact, Conversation, Message } from "@/app/components/social/types";
import {
  friendSocketClient,
  chatSocketClient,
  onFriendRequestReceived,
  onFriendRequestAccepted,
  onFriendRequestRejected,
  onFriendError,
  onFriendRemoved,
  joinChatRoom,
  leaveChatRoom,
  onMessageReceived,
  onMessageRead,
  onUserBlocked,
  onUserUnblocked,
} from "@/lib/socket";
import {
  getMessages,
  sendMessage as apiSendMessage,
  markAsRead,
  ChatMessageResponse,
} from "@/lib/api/chat-message";

interface User {
  id: string | number;
  username: string;
  fullname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role_name?: string;
}

interface SocialContextType {
  currentUser: User | null;
  contacts: Contact[];
  friendRequests: FriendRequestResponse[];
  receivedFriendRequests: FriendRequestResponse[];
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  loadingMessages: boolean;
  loadingConversations: boolean;
  groupCount: number;
  fetchContacts: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  sendMessage: (content: string, file?: File) => Promise<void>;
  startChat: (friendId: string) => Promise<string | null>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setFriendRequests: React.Dispatch<
    React.SetStateAction<FriendRequestResponse[]>
  >;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  markConversationAsRead: (roomId: string) => Promise<void>;
  deleteConversation: (roomId: string) => Promise<void>;
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  blockedUsers: UserBlock[]; // New: Full list for the UI
  blockUser: (friendId: string) => Promise<void>;
  unblockUser: (friendId: string) => Promise<void>;
  lastReadMessageIds: Record<string, string | number>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProfileOpen: boolean;
  setIsProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddFriendOpen: boolean;
  setIsAddFriendOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);

  // Update pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>(
    []
  );
  const [groupCount, setGroupCount] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockedByUserIds, setBlockedByUserIds] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<UserBlock[]>([]);
  
  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

  // Derived state
  const currentUserId = getUserIdFromCookie();
  const currentUserIdNumber =
    typeof currentUserId === "string"
      ? parseInt(currentUserId, 10)
      : typeof currentUserId === "number"
      ? currentUserId
      : null;

  const receivedFriendRequests = useMemo(() => {
    if (currentUserIdNumber === null) return [];
    return friendRequests.filter(
      (request) => String(request.addressee_id) === String(currentUserIdNumber)
    );
  }, [friendRequests, currentUserIdNumber]);

  // ✅ Fix: Validate user data structure để prevent XSS
  interface UserData {
    user_id?: number | string;
    id?: number | string;
    username?: string;
    fullname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: { role_name?: string };
  }

  function isValidUserData(data: any): data is UserData {
    return (
      data &&
      typeof data === 'object' &&
      (typeof data.user_id === 'number' || typeof data.user_id === 'string' ||
       typeof data.id === 'number' || typeof data.id === 'string')
    );
  }

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      
      // ✅ Validate user data structure
      if (!isValidUserData(user)) {
        console.error("Invalid user data structure");
        localStorage.removeItem("user"); // Clean corrupted data
        return;
      }
      
      setCurrentUser({
        id: user.user_id || user.id,
        username: user.username || '',
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role_name: user.role?.role_name,
      });
    } catch (e) {
      console.error("Error parsing user from local storage", e);
      localStorage.removeItem("user"); // ✅ Clean corrupted data
    }
  }, []);

  // Fetch Blocked Users
  useEffect(() => {
    const userId = getUserIdFromCookie();
    if (userId) {
      getBlockedUsers(Number(userId)).then((blocks) => {
        const iBlocked = new Set<string>();
        const blockedMe = new Set<string>();

        blocks.forEach((b) => {
          if (String(b.blocker_id) === String(userId)) {
            iBlocked.add(String(b.blocked_id));
          } else if (String(b.blocked_id) === String(userId)) {
            blockedMe.add(String(b.blocker_id));
          }
        });

        setBlockedUserIds(iBlocked);
        setBlockedByUserIds(blockedMe);
        setBlockedUsers(blocks.filter(b => String(b.blocker_id) === String(userId))); // Only show ones I blocked
      });
    }
  }, []);

  // Socket: Block events removed from here and moved to the main useEffect below to avoid stale closures
  

  const fetchContacts = useCallback(async () => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    try {
      const response = await getFriends({ userId });
      const mappedContacts: Contact[] = response.data.map((friend) => {
        const userIdStr = String(userId);
        const isRequester = String(friend.requester_id) === userIdStr;
        const friendUser = isRequester ? friend.addressee : friend.requester;

        return {
          id: String(friendUser?.user_id),
          name: friendUser?.fullname || friendUser?.username || "Unknown",
          avatar: friendUser?.avatar || undefined,
          status: (friendUser?.status as "online" | "offline" | "away") || "offline",
          isFriend: true,
          friendshipId: friend.id,
        };
      });
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) return;

      const result = await getFriendRequests({
        userId: userIdNumber,
        limit: FRIEND_REQUESTS_LIMIT,
      });
      setFriendRequests(result.requests || []);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  }, []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const activeConversationIdRef = React.useRef(activeConversationId);
  const currentUserRef = React.useRef(currentUser);
  const [lastReadMessageIds, setLastReadMessageIds] = useState<
    Record<string, string | number>
  >({});
  const skipAutoLoadMessagesRef = React.useRef(false);
  const processedMessageIdsRef = React.useRef(new Set<string>());
  
  // ✅ Constants for magic numbers
  const FRIEND_REQUESTS_LIMIT = 50;
  const CONVERSATIONS_LIMIT = 100;
  const MESSAGES_LIMIT = 50;
  const MAX_PROCESSED_IDS = 1000;
  
  // ✅ Fix: Cleanup processedMessageIdsRef periodically để prevent memory leak
  useEffect(() => {
    const interval = setInterval(() => {
      if (processedMessageIdsRef.current.size > MAX_PROCESSED_IDS) {
        // Keep only recent 500 IDs
        const ids = Array.from(processedMessageIdsRef.current);
        processedMessageIdsRef.current = new Set(ids.slice(-500));
      }
    }, 60000); // Cleanup every minute
    
    return () => clearInterval(interval);
  }, []);

  // Join/Leave Socket Room when activeConversationId changes
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    currentUserRef.current = currentUser;

    const roomId = activeConversationId;
    if (roomId && !roomId.startsWith("temp_")) {
      const roomIdNum = parseInt(roomId, 10);
      if (!isNaN(roomIdNum)) {
        console.log("Socket: Joining room", roomIdNum);
        joinChatRoom(roomIdNum);

        // Only load messages if NOT explicitly skipped (e.g. during creation/transition)
        if (!skipAutoLoadMessagesRef.current) {
          setMessages([]); // Clear previous messages immediately
          loadMessages(roomId);
        } else {
          // Reset flag after skip
          skipAutoLoadMessagesRef.current = false;
        }
      }
    } else {
      // If temp or null, clear messages immediately to avoid showing old chat data
      setMessages([]);
    }

    return () => {
      if (roomId && !roomId.startsWith("temp_")) {
        const roomIdNum = parseInt(roomId, 10);
        if (!isNaN(roomIdNum)) {
          console.log("Socket: Leaving room", roomIdNum);
          leaveChatRoom(roomIdNum);
        }
      }
    };
  }, [activeConversationId]);

  // Fetch Conversations (Chat Rooms)
  const fetchConversations = useCallback(async () => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNumber)) return;

      const result = await getChatRooms({ userId: userIdNumber, limit: CONVERSATIONS_LIMIT });

      const newLastReadMap: Record<string, string | number> = {};

      const mappedConversations: Conversation[] = result.data.map((room) => {
        const isOwnLastMessage =
          String(room.last_message?.sender_id) === String(userIdNumber);
        const lastContent = room.last_message?.content;

        // Extract partner's last read message ID for Direct Chat
        if (room.room_type === ChatRoomType.DIRECT) {
          const partnerMember = (room.members || []).find(
            (m: any) => String(m.user_id) !== String(userIdNumber)
          );
          if (partnerMember && partnerMember.last_read_message_id) {
            newLastReadMap[String(room.room_id)] =
              partnerMember.last_read_message_id;
          }
        }

        return {
          id: String(room.room_id),
          name:
            room.name ||
            (room?.members || []).find(
              (m: any) => String(m.user_id) !== String(userIdNumber)
            )?.user?.fullname ||
            "Cuộc trò chuyện",
          avatar:
            room.room_type === ChatRoomType.DIRECT
              ? (room?.members || []).find(
                  (m: any) => String(m.user_id) !== String(userIdNumber)
                )?.user?.avatar
              : undefined,
          lastMessage: lastContent
            ? isOwnLastMessage
              ? `Bạn: ${lastContent}`
              : lastContent
            : "Bắt đầu cuộc trò chuyện",
          time: room.last_message?.created_at
            ? new Date(room.last_message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread: room.unread_count || 0,
          isGroup: room.room_type === ChatRoomType.GROUP,
          memberIds: (room.members || []).map((m: any) => m.user_id),
          isEmpty: !room.last_message,
        };
      });

      setConversations((prev) => {
        // Preserve active conversation if it exists locally but not in backend response (e.g. newly created empty room)
        const activeInPrev = prev.find(
          (c) => String(c.id) === String(activeConversationIdRef.current)
        );
        const activeInMapped = mappedConversations.find(
          (c) => String(c.id) === String(activeConversationIdRef.current)
        );

        if (activeInPrev && !activeInMapped) {
          return [activeInPrev, ...mappedConversations];
        }
        return mappedConversations;
      });

      // Update group count based on these rooms to ensure consistency
      const groups = result.data.filter(
        (room) => room.room_type === ChatRoomType.GROUP
      );
      setGroupCount(groups.length);

      // Update Last Read Status (Persistence)
      setLastReadMessageIds((prev) => ({ ...prev, ...newLastReadMap }));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ✅ Fix: Use refs for stable references (stale closure fix)
  // Define refs after functions are defined
  const fetchContactsRef = React.useRef<() => Promise<void>>(() => Promise.resolve());
  const fetchConversationsRef = React.useRef<() => Promise<void>>(() => Promise.resolve());
  
  useEffect(() => {
    fetchContactsRef.current = fetchContacts;
    fetchConversationsRef.current = fetchConversations;
  }, [fetchContacts, fetchConversations]);

  // ✅ Fix: Race condition - Add AbortController và roomId check
  const loadMessages = useCallback(async (roomId: string) => {
    const userId = getUserIdFromCookie();
    if (!userId) return;

    const currentRoomIdRef = roomId; // ✅ Capture roomId để check later
    setLoadingMessages(true);
    setMessages([]); // ✅ Clear immediately
    
    const controller = new AbortController();
    
    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      // Catch invalid ID or non-numeric ID (like temp_)
      const roomIdNumber = parseInt(String(roomId), 10);
      if (isNaN(roomIdNumber)) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }
 
      await markAsRead(userIdNumber, roomIdNumber); // Only mark real rooms
 
      // ✅ Pass signal to prevent race condition (if getMessages supports it)
      const result = await getMessages({
        userId: userIdNumber,
        roomId: roomIdNumber,
        limit: MESSAGES_LIMIT,
      });
 
      // ✅ Only update if still on the same room
      if (currentRoomIdRef === roomId) {
        // Map messages
        const mappedMessages: Message[] = result.data.map((msg: any) => ({
          id: String(msg.message_id),
          sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
          senderAvatar: msg.sender?.avatar,
          content: (msg.content || "").trim(),
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: String(msg.sender_id) === String(userIdNumber),
          fileAttachment: msg.fileAttachment, // Preserve if available
        }));
 
        setMessages(mappedMessages);

        // Optimistic Update: Clear badge immediately
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(roomId) ? { ...c, unread: 0 } : c
          )
        );

        // ✅ Use ref instead of direct call
        fetchConversationsRef.current();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error loading messages:", error);
      }
      // setMessages([]); // Do not clear messages on error to prevent flashing empty state
    } finally {
      // ✅ Only update loading state if still on the same room
      if (currentRoomIdRef === roomId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // Send Message
  const sendMessage = React.useCallback(async (content: string, file?: File) => {
    const userId = getUserIdFromCookie();
    if (!userId || !activeConversationId) return;

    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      let roomIdNum: number;
      let currentRoomId = activeConversationId;

      // Handle Temp ID (Lazy Creation)
      if (currentRoomId.startsWith("temp_")) {
        const friendIdStr = currentRoomId.split("_")[1];
        const friendId = parseInt(friendIdStr, 10);

        // Create Real Room NOW
        const room = await createChatRoom({
          userId: userIdNumber,
          room_type: ChatRoomType.DIRECT,
          members: [friendId],
        });

        const createdRoomId =
          room?.room_id ||
          (room as any)?.id ||
          (room as any)?.data?.room_id ||
          (room as any)?.data?.id;

        if (!createdRoomId) {
          console.error("Room creation failed, result:", room);
          throw new Error("API lỗi: " + JSON.stringify(room).slice(0, 50));
        }

        roomIdNum = createdRoomId;

        // Force Join Room immediately so we don't miss any socket events (Realtime Seen Fix)
        joinChatRoom(roomIdNum);

        // Update Active ID & Conversations List (Replace Temp with Real)
        const realIdStr = String(roomIdNum);

        // Prevent auto-load messages when switching ID to avoid flash
        skipAutoLoadMessagesRef.current = true;
        setActiveConversationId(realIdStr);

        setConversations((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === realIdStr);
          const tempIndex = prev.findIndex((c) => c.id === currentRoomId);

          if (existingIndex !== -1) {
            const existing = prev[existingIndex];
            const others = prev.filter(
              (_, i) => i !== existingIndex && i !== tempIndex
            );
            return [existing, ...others];
          }

          if (tempIndex !== -1) {
            const newArr = [...prev];
            newArr[tempIndex] = { ...newArr[tempIndex], id: realIdStr };
            return newArr;
          }
          return prev;
        });

        currentRoomId = realIdStr;
      } else {
        roomIdNum = Number(currentRoomId);
      }

      if (isNaN(roomIdNum)) throw new Error("ID phòng chat không hợp lệ");

      // API Call
      const sentMsg = await apiSendMessage({
        sender_id: userIdNumber,
        room_id: roomIdNum,
        content: content.trim(),
      });

      // Update Conversation List (Last Message)
      setConversations((prev) => {
        const newArr = [...prev];
        const idx = newArr.findIndex((c) => String(c.id) === String(currentRoomId));
        if (idx !== -1) {
          const updated = { ...newArr[idx] };
          updated.lastMessage = `Bạn: ${content.trim()}`; // Explicitly set "Bạn:" prefix for own message
          updated.time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          updated.unread = 0; // Sending a message implies having read the room
          updated.isEmpty = false;
          newArr.splice(idx, 1);
          return [updated, ...newArr];
        }
        return prev;
      });

      // ✅ Use ref instead of direct call
      fetchConversationsRef.current();
    } catch (error: any) {
      console.error("Error sending message:", error);
      antMessage.error(error.message || "Gửi tin nhắn thất bại");
    }
  }, [activeConversationId]);

  // Start Chat (Find or Create)
  const startChat = React.useCallback(async (friendId: string) => {
    const userId = getUserIdFromCookie();
    if (!userId) return null;

    try {
      const userIdNumber =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      const friendIdNumber = parseInt(friendId, 10);

      if (isNaN(userIdNumber) || isNaN(friendIdNumber)) return null;

      const friendIdStr = String(friendIdNumber);

      // 1. Check local cache first (Fastest)
      const existingRoom = conversations.find(
        (c) =>
          !c.isGroup &&
          c.memberIds?.length === 2 &&
          c.memberIds.some((id) => String(id) === friendIdStr)
      );

      if (existingRoom) {
        setActiveConversationId(String(existingRoom.id));
        return existingRoom.id;
      }

      // 2. If not found locally, use TEMP ID (Lazy Creation)
      // We do NOT add it to the conversation list yet. The UI (page.tsx) handles the "virtual" conversation for display.
      const tempId = `temp_${friendIdNumber}`;
      setActiveConversationId(tempId);
      return tempId;


    } catch (error) {
      console.error("Error starting chat:", error);
      antMessage.error("Không thể mở cuộc trò chuyện");
    }
    return null;
  }, [conversations]);



  const blockUserHandler = useCallback(
    async (friendId: string) => {
      const userId = getUserIdFromCookie();
      if (!userId) return;
      try {
        await apiBlockUser(Number(userId), Number(friendId));
        antMessage.success("Đã chặn người dùng");
      } catch (error) {
        console.error("Error blocking user:", error);
        antMessage.error("Không thể chặn người dùng");
      }
    },
    []
  );

  const unblockUserHandler = useCallback(
    async (friendId: string) => {
      const userId = getUserIdFromCookie();
      if (!userId) return;
      try {
        await apiUnblockUser(Number(userId), Number(friendId));
        antMessage.success("Đã bỏ chặn người dùng");
      } catch (error) {
        console.error("Error unblocking user:", error);
        antMessage.error("Không thể bỏ chặn người dùng");
      }
    },
    []
  );

  // Mark Conversation as Read Wrapper
  const markConversationAsRead = async (roomId: string) => {
    // Use Ref first to avoid Cookie Overwrite issues in dev
    const currentUser = currentUserRef.current;
    let userIdNumber = currentUser?.id
      ? typeof currentUser.id === "string"
        ? parseInt(currentUser.id, 10)
        : currentUser.id
      : null;

    if (!userIdNumber) {
      // Fallback to cookie
      const userId = getUserIdFromCookie();
      if (userId) {
        userIdNumber =
          typeof userId === "string" ? parseInt(userId, 10) : userId;
      }
    }

    if (!userIdNumber) return;

    const roomIdNumber = parseInt(roomId, 10);

    if (isNaN(userIdNumber) || isNaN(roomIdNumber)) return;

    // Optimistic Update: Clear badge immediately
    setConversations((prev) =>
      prev.map((c) =>
        String(c.id) === String(roomId) ? { ...c, unread: 0 } : c
      )
    );

    try {
      await markAsRead(userIdNumber, roomIdNumber);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteConversationHandler = async (roomId: string) => {
    try {
      const currentUser = currentUserRef.current;
      let userIdNumber = currentUser?.id
        ? typeof currentUser.id === "string"
          ? parseInt(currentUser.id, 10)
          : currentUser.id
        : null;
      if (!userIdNumber) {
        const userId = getUserIdFromCookie();
        userIdNumber =
          typeof userId === "string"
            ? parseInt(userId, 10)
            : (userId as number);
      }

      if (!userIdNumber) return;

      // Optimistic: Remove from list
      setConversations((prev) => prev.filter((c) => c.id !== roomId));
      if (activeConversationIdRef.current === roomId) {
        setActiveConversationId(null);
      }

      await deleteConversationApi(userIdNumber, roomId);
      antMessage.success("Đã xóa đoạn chat");
    } catch (error: any) {
      console.error("Delete conversation failed", error);
      antMessage.error("Không thể xóa đoạn chat");
      fetchConversations();
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchContacts();
    fetchConversations();
    fetchFriendRequests();
  }, [fetchContacts, fetchConversations, fetchFriendRequests]);

  // Effect 1: Socket Connection & Friend Events & Chat
  useEffect(() => {
    // Connect sockets
    friendSocketClient.connect();
    chatSocketClient.connect();

    // Friend Events Listeners
    const unsubscribeReceived = onFriendRequestReceived((payload) => {
      const newRequest: FriendRequestResponse = {
        id: payload.friend.id,
        requester_id: payload.friend.requester_id,
        addressee_id: payload.friend.addressee_id,
        // ✅ Fix: Type safety - Remove 'as any', use proper type assertion
        status: payload.friend.status as 'pending' | 'accepted' | 'rejected',
        created_at: payload.friend.created_at,
        accepted_at: payload.friend.accepted_at || null,
        requester: payload.friend.requester,
        addressee: payload.friend.addressee,
      };

      setFriendRequests((prev) => {
        const exists = prev.some((req) => req.id === newRequest.id);
        if (!exists) return [newRequest, ...prev];
        return prev;
      });
      antMessage.info(
        `Bạn có lời mời kết bạn mới từ ${
          payload.friend.requester?.fullname || "ai đó"
        }`
      );
    });

    const unsubscribeAccepted = onFriendRequestAccepted((payload) => {
      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== payload.friend.id)
      );
      const userId = getUserIdFromCookie();
      const userIdNum =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      if (userIdNum === payload.friend.requester_id) {
        antMessage.success(
          `${
            payload.friend.addressee?.fullname || "Ai đó"
          } đã chấp nhận lời mời kết bạn của bạn`
        );
      }
      fetchContactsRef.current();
    });

    const unsubscribeRejected = onFriendRequestRejected((payload) => {
      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== payload.friend_id)
      );
    });

    const unsubscribeRemoved = onFriendRemoved((payload) => {
      fetchContactsRef.current();
      const currentUserId = getUserIdFromCookie();
      const currentUserIdNum =
        typeof currentUserId === "string"
          ? parseInt(currentUserId, 10)
          : currentUserId;
      if (currentUserIdNum === payload.removed_user_id) {
        antMessage.info("Bạn đã bị hủy kết bạn");
      }
    });

    const unsubscribeError = onFriendError((payload) => {
      console.error("Socket error", payload);
    });

    // Chat Socket Listeners (Global)

    // Rejoin chat room on reconnection
    const unsubscribeConnection = chatSocketClient.onConnectionChange(
      (isConnected) => {
        if (isConnected && activeConversationIdRef.current) {
          console.log(
            "Reconnected to chat socket, re-joining room:",
            activeConversationIdRef.current
          );
          const roomIdNum = parseInt(activeConversationIdRef.current, 10);
          if (!isNaN(roomIdNum)) joinChatRoom(roomIdNum);
        }
      }
    );

    // Global Message Listener
    const unsubscribeMessage = onMessageReceived((payload) => {
      console.log("Socket: Global onMessageReceived fired", payload);
      const msg = payload.data || payload;

      // Hard Deduplication for Socket Events
      const msgId = String(msg.message_id || "");
      // ✅ Fix: Memory leak - Cleanup old IDs if set too large
      if (msgId && processedMessageIdsRef.current.has(msgId)) {
        return;
      }
      if (msgId) {
        processedMessageIdsRef.current.add(msgId);
        // ✅ Cleanup if too large
        if (processedMessageIdsRef.current.size > MAX_PROCESSED_IDS) {
          const ids = Array.from(processedMessageIdsRef.current);
          processedMessageIdsRef.current = new Set(ids.slice(-500));
        }
      }

      const currentActiveId = activeConversationIdRef.current;
      const currentPath = pathnameRef.current;

      // Define userIdNumber early
      const currentUser = currentUserRef.current;
      let userIdNumber = currentUser?.id
        ? typeof currentUser.id === "string"
          ? parseInt(currentUser.id, 10)
          : currentUser.id
        : null;

      if (!userIdNumber) {
        const userId = getUserIdFromCookie();
        userIdNumber =
          typeof userId === "string"
            ? parseInt(userId, 10)
            : (userId as number);
      }

      console.log(
        "Socket: Processing message for room",
        msg.room_id,
        "Active Room (Ref):",
        currentActiveId,
        "Path:",
        currentPath
      );

      // Always update conversation list OPTIMISTICALLY to avoid race conditions
      // fetchConversations(); // REMOVED: Causing race condition with MarkAsRead

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.id === String(msg.room_id)
        );
        const senderName =
          msg.sender?.fullname || msg.sender?.username || "Unknown";
        // Check if we already handled this message to avoid dups? (Optional but good)
        // Optimization: Create new object

        let newConv = existingIndex !== -1 ? { ...prev[existingIndex] } : null;

        // If conversation doesn't exist locally, we MIGHT need to fetch.
        // But for now, let's assume it exists or we can't update it easily without full fetch.
        // ✅ Use ref instead of direct call
        // If it doesn't exist, maybe trigger fetch?
        if (!newConv) {
          fetchConversationsRef.current(); // Fallback for new rooms
          return prev;
        }

        // Update fields
        const isOwn = String(msg.sender_id) === String(userIdNumber);
        newConv.lastMessage = isOwn ? `Bạn: ${msg.content}` : msg.content;
        newConv.time = new Date(
          msg.created_at || Date.now()
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (!isOwn) {
          // Always increment unread count to keep "synced" with server state
          // We handle Visual Hiding in Sidebar component
          newConv.unread = (newConv.unread || 0) + 1;
        }

        // Move to top
        const others = prev.filter((_, i) => i !== existingIndex);
        return [newConv, ...others];
      });
      // We are viewing if:
      // 1. Logic Room ID matches Active Room ID
      // 2. AND we are on the main social page (not contacts, etc.) where ChatArea is visible.
      const isChatVisible =
        currentPath === "/social" ||
        currentPath === "/social/messages" ||
        (currentPath?.startsWith("/social") &&
          !currentPath?.includes("/contacts"));

      // If active room matches, update messages state
      if (String(msg.room_id) === String(currentActiveId)) {
        // Use Ref for stability
        const currentUser = currentUserRef.current;
        let userIdNumber = currentUser?.id
          ? typeof currentUser.id === "string"
            ? parseInt(currentUser.id, 10)
            : currentUser.id
          : null;

        if (!userIdNumber) {
          const userId = getUserIdFromCookie();
          userIdNumber =
            typeof userId === "string"
              ? parseInt(userId, 10)
              : (userId as number);
        }

        const newMessage: Message = {
          id: String(msg.message_id || Date.now()),
          sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
          senderAvatar: msg.sender?.avatar,
          content: (msg.content || "").trim(),
          time: new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isOwn: String(msg.sender_id) === String(userIdNumber),
          fileAttachment: msg.fileAttachment,
        };

        setMessages((prev) => {
          if (!newMessage.content && !newMessage.fileAttachment) return prev;
          
          // 1. Check for standard duplicate by ID
          if (prev.some((m) => m.id === newMessage.id)) return prev;

          // 2. Check for Optimistic Message (temp_msg_) overlap (Deduplication)
          if (newMessage.isOwn) {
            // Find a temp message with same content sent recently (last 10 items to be safe)
            const tempMatchIndex = prev.findIndex(
              (m) =>
                m.id.startsWith("temp_msg_") &&
                m.content.trim() === newMessage.content.trim() &&
                m.isOwn
            );

            if (tempMatchIndex !== -1) {
              // Replace temp message with real socket message
              const newArr = [...prev];
              newArr[tempMatchIndex] = newMessage;
              return newArr;
            }
          }

          return [...prev, newMessage];
        });

        // REMOVED: Auto Mark as Read on Receipt
        // User Requirement: Only mark read on Scroll or Input Focus
        /*
        if (isChatVisible && document.hasFocus()) {
          if (userIdNumber && !isNaN(Number(msg.room_id))) {
            markAsRead(userIdNumber, Number(msg.room_id));
          }
        }
        */
      }
    });

    const unsubscribeUnblocked = onUserUnblocked((data) => {
      console.log("Socket: onUserUnblocked", data);
      const unblockedId = String(data.userId);
      if (data.initiatedByMe) {
        setBlockedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(unblockedId);
          return next;
        });
        setBlockedUsers((prev) =>
          prev.filter((b) => String(b.blocked_id) !== unblockedId)
        );
      } else {
        setBlockedByUserIds((prev) => {
          const next = new Set(prev);
          next.delete(unblockedId);
          return next;
        });
      }
      // Re-fetch contacts for real-time update
      fetchContactsRef.current();
    });

    const unsubscribeBlocked = onUserBlocked((data) => {
      console.log("Socket: onUserBlocked", data);
      const blockedId = String(data.userId);
      const userId = getUserIdFromCookie();

      if (data.initiatedByMe) {
        setBlockedUserIds((prev) => {
          const next = new Set(prev);
          next.add(blockedId);
          return next;
        });
        // Re-fetch full objects for the list
        if (userId) {
          getBlockedUsers(Number(userId)).then((blocks) => {
            setBlockedUsers(
              blocks.filter((b) => String(b.blocker_id) === String(userId))
            );
          });
        }
      } else {
        setBlockedByUserIds((prev) => {
          const next = new Set(prev);
          next.add(blockedId);
          return next;
        });
      }
      // Re-fetch to sync if needed, but don't filter out anymore
      fetchContactsRef.current();
    });

    const unsubscribeRead = onMessageRead((payload) => {
      console.log("Socket: onMessageRead", payload);
      const data = (payload as any).data || payload;
      const { room_id, user_id, message_id } = data;

      const currentUser = currentUserRef.current;
      const currentUserIdNum = currentUser?.id
        ? typeof currentUser.id === "string"
          ? parseInt(currentUser.id, 10)
          : currentUser.id
        : null;

      if (!currentUserIdNum) {
        console.warn("Socket: No current user found in Ref");
      }

      if (String(user_id) !== String(currentUserIdNum)) {
        console.log(
          "Socket: Updating lastReadMessageIds for Room",
          room_id,
          "User",
          user_id,
          "Msg",
          message_id
        );
        setLastReadMessageIds((prev) => ({
          ...prev,
          [String(room_id)]: message_id,
        }));
      } else {
        console.log("Socket: Ignoring own read event. Me:", currentUserIdNum);
      }
    });

    return () => {
      friendSocketClient.disconnect();
      chatSocketClient.disconnect();
      unsubscribeReceived();
      unsubscribeAccepted();
      unsubscribeRejected();
      unsubscribeRemoved();
      unsubscribeError();
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeRead();
      unsubscribeBlocked();
      unsubscribeUnblocked();
    };
  }, [currentUserIdNumber]); // ✅ Fix: Remove callbacks from dependencies, use refs instead

  const value = React.useMemo(() => ({
        currentUser,
        contacts,
        friendRequests,
        receivedFriendRequests,
        conversations,
        activeConversationId,
        messages,
        loadingMessages,
        groupCount,
        fetchContacts,
        fetchConversations,
        fetchFriendRequests,
        loadMessages, // Used twice in original? loadMessages,
        loadingConversations,
        sendMessage,
        startChat,
        setContacts,
        setFriendRequests,
        setActiveConversationId,
        isSettingsOpen,
        setIsSettingsOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAddFriendOpen,
        setIsAddFriendOpen,
        markConversationAsRead,
        deleteConversation: deleteConversationHandler,
        lastReadMessageIds,
        blockedUserIds,
        blockedByUserIds,
        blockedUsers,
        blockUser: blockUserHandler,
        unblockUser: unblockUserHandler,
  }), [
        currentUser,
        contacts,
        friendRequests,
        receivedFriendRequests,
        conversations,
        activeConversationId,
        messages,
        loadingMessages,
        groupCount,
        fetchContacts,
        fetchConversations,
        fetchFriendRequests,
        loadMessages,
        loadingConversations,
        sendMessage,
        startChat,
        deleteConversationHandler,
        lastReadMessageIds,
        blockedUserIds,
        blockedByUserIds,
        blockedUsers,
        blockUserHandler,
        unblockUserHandler,
        // Boolean setters are stable usually (useState) but harmless to add or omit if stable
        // Adding state values that might change reference
        isSettingsOpen,
        isProfileOpen,
        isAddFriendOpen,
  ]);

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider");
  }
  return context;
}
