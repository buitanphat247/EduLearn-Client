"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { message as antMessage } from "antd";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import {
    getChatRooms,
    ChatRoomType,
    createChatRoom,
    deleteConversation as deleteConversationApi,
} from "@/lib/api/chat-room";
import {
    getMessages,
    sendMessage as apiSendMessage,
    markAsRead,
} from "@/lib/api/chat-message";
import { Conversation, Message } from "@/app/components/social/types";
import {
    chatSocketClient,
    joinChatRoom,
    leaveChatRoom,
    onMessageReceived,
    onMessageRead,
} from "@/lib/socket";
import { useSocialProfile } from "./SocialProfileContext";

interface ChatContextType {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    loadingMessages: boolean;
    loadingConversations: boolean;
    groupCount: number;
    lastReadMessageIds: Record<string, string | number>;
    fetchConversations: () => Promise<void>;
    loadMessages: (roomId: string) => Promise<void>;
    sendMessage: (content: string, file?: File) => Promise<void>;
    startChat: (friendId: string) => Promise<string | null>;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    markConversationAsRead: (roomId: string) => Promise<void>;
    deleteConversation: (roomId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);
    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    const { currentUser } = useSocialProfile();
    const currentUserRef = useRef(currentUser);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [groupCount, setGroupCount] = useState(0);
    const [lastReadMessageIds, setLastReadMessageIds] = useState<Record<string, string | number>>({});

    const activeConversationIdRef = useRef(activeConversationId);
    const skipAutoLoadMessagesRef = useRef(false);
    const processedMessageIdsRef = useRef(new Set<string>());
    const fetchConversationsRef = useRef<() => Promise<void>>(() => Promise.resolve());

    const CONVERSATIONS_LIMIT = 100;
    const MESSAGES_LIMIT = 50;
    const MAX_PROCESSED_IDS = 1000;

    useEffect(() => {
        const interval = setInterval(() => {
            if (processedMessageIdsRef.current.size > MAX_PROCESSED_IDS) {
                const ids = Array.from(processedMessageIdsRef.current);
                processedMessageIdsRef.current = new Set(ids.slice(-500));
            }
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = useCallback(async () => {
        const userId = getUserIdFromCookie();
        if (!userId) return;

        try {
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
            if (isNaN(userIdNumber)) return;

            const result = await getChatRooms({ userId: userIdNumber, limit: CONVERSATIONS_LIMIT });

            const newLastReadMap: Record<string, string | number> = {};

            const mappedConversations: Conversation[] = result.data.map((room) => {
                const isOwnLastMessage = String(room.last_message?.sender_id) === String(userIdNumber);
                const lastContent = room.last_message?.content;

                if (room.room_type === ChatRoomType.DIRECT) {
                    const partnerMember = (room.members || []).find(
                        (m: any) => String(m.user_id) !== String(userIdNumber)
                    );
                    if (partnerMember && partnerMember.last_read_message_id) {
                        newLastReadMap[String(room.room_id)] = partnerMember.last_read_message_id;
                    }
                }

                return {
                    id: String(room.room_id),
                    name: room.name || (room?.members || []).find((m: any) => String(m.user_id) !== String(userIdNumber))?.user?.fullname || "Cuộc trò chuyện",
                    avatar: room.room_type === ChatRoomType.DIRECT
                        ? (room?.members || []).find((m: any) => String(m.user_id) !== String(userIdNumber))?.user?.avatar
                        : undefined,
                    lastMessage: lastContent ? (isOwnLastMessage ? `Bạn: ${lastContent}` : lastContent) : "Bắt đầu cuộc trò chuyện",
                    time: room.last_message?.created_at ? new Date(room.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
                    unread: room.unread_count || 0,
                    isGroup: room.room_type === ChatRoomType.GROUP,
                    memberIds: (room.members || []).map((m: any) => m.user_id),
                    isEmpty: !room.last_message,
                };
            });

            setConversations((prev) => {
                const activeInPrev = prev.find((c) => String(c.id) === String(activeConversationIdRef.current));
                const activeInMapped = mappedConversations.find((c) => String(c.id) === String(activeConversationIdRef.current));
                if (activeInPrev && !activeInMapped) {
                    return [activeInPrev, ...mappedConversations];
                }
                return mappedConversations;
            });

            const groups = result.data.filter((room) => room.room_type === ChatRoomType.GROUP);
            setGroupCount(groups.length);
            setLastReadMessageIds((prev) => ({ ...prev, ...newLastReadMap }));
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    // Sync ref
    useEffect(() => {
        fetchConversationsRef.current = fetchConversations;
    }, [fetchConversations]);

    const loadMessages = useCallback(async (roomId: string) => {
        const userId = getUserIdFromCookie();
        if (!userId) return;

        const currentRoomIdRef = roomId;
        setLoadingMessages(true);
        setMessages([]);

        try {
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
            const roomIdNumber = parseInt(String(roomId), 10);
            if (isNaN(roomIdNumber)) {
                setMessages([]);
                setLoadingMessages(false);
                return;
            }

            await markAsRead(userIdNumber, roomIdNumber);

            const result = await getMessages({
                userId: userIdNumber,
                roomId: roomIdNumber,
                limit: MESSAGES_LIMIT,
            });

            if (currentRoomIdRef === roomId) {
                const mappedMessages: Message[] = result.data.map((msg: any) => ({
                    id: String(msg.message_id),
                    sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
                    senderAvatar: msg.sender?.avatar,
                    content: (msg.content || "").trim(),
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isOwn: String(msg.sender_id) === String(userIdNumber),
                    fileAttachment: msg.fileAttachment,
                }));

                setMessages(mappedMessages);

                setConversations((prev) =>
                    prev.map((c) => String(c.id) === String(roomId) ? { ...c, unread: 0 } : c)
                );

                fetchConversationsRef.current();
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error loading messages:", error);
            }
        } finally {
            if (currentRoomIdRef === roomId) {
                setLoadingMessages(false);
            }
        }
    }, []);

    const sendMessage = useCallback(async (content: string, file?: File) => {
        const userId = getUserIdFromCookie();
        if (!userId || !activeConversationId) return;

        try {
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
            let roomIdNum: number;
            let currentRoomId = activeConversationId;

            if (currentRoomId.startsWith("temp_")) {
                const friendIdStr = currentRoomId.split("_")[1];
                const friendId = parseInt(friendIdStr, 10);

                const room = await createChatRoom({
                    userId: userIdNumber,
                    room_type: ChatRoomType.DIRECT,
                    members: [friendId],
                });

                const createdRoomId = room?.room_id || (room as any)?.id || (room as any)?.data?.room_id || (room as any)?.data?.id;

                if (!createdRoomId) {
                    throw new Error("Chat creation failed");
                }

                roomIdNum = createdRoomId;
                joinChatRoom(roomIdNum);

                const realIdStr = String(roomIdNum);
                skipAutoLoadMessagesRef.current = true;
                setActiveConversationId(realIdStr);

                setConversations((prev) => {
                    const tempIndex = prev.findIndex((c) => c.id === currentRoomId);
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

            if (isNaN(roomIdNum)) throw new Error("Invalid Room ID");

            await apiSendMessage({
                sender_id: userIdNumber,
                room_id: roomIdNum,
                content: content.trim(),
            });

            setConversations((prev) => {
                const newArr = [...prev];
                const idx = newArr.findIndex((c) => String(c.id) === String(currentRoomId));
                if (idx !== -1) {
                    const updated = { ...newArr[idx] };
                    updated.lastMessage = `Bạn: ${content.trim()}`;
                    updated.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    updated.unread = 0;
                    updated.isEmpty = false;
                    newArr.splice(idx, 1);
                    return [updated, ...newArr];
                }
                return prev;
            });

            fetchConversationsRef.current();

        } catch (error: any) {
            console.error("Error sending message:", error);
            antMessage.error(error.message || "Gửi tin nhắn thất bại");
        }
    }, [activeConversationId]);

    const startChat = useCallback(async (friendId: string) => {
        const userId = getUserIdFromCookie();
        if (!userId) return null;

        try {
            const friendIdStr = String(friendId);
            const existingRoom = conversations.find(
                (c) => !c.isGroup && c.memberIds?.length === 2 && c.memberIds.some((id) => String(id) === friendIdStr)
            );

            if (existingRoom) {
                setActiveConversationId(String(existingRoom.id));
                return existingRoom.id;
            }

            const tempId = `temp_${friendId}`;
            setActiveConversationId(tempId);
            return tempId;

        } catch (error) {
            console.error("Error starting chat", error);
        }
        return null;
    }, [conversations]);

    const markConversationAsRead = async (roomId: string) => {
        const userId = getUserIdFromCookie();
        const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
        const roomIdNumber = parseInt(roomId, 10);

        if (!userIdNumber || isNaN(roomIdNumber)) return;

        setConversations((prev) => prev.map((c) => String(c.id) === String(roomId) ? { ...c, unread: 0 } : c));
        await markAsRead(userIdNumber, roomIdNumber);
    };

    const deleteConversationHandler = async (roomId: string) => {
        try {
            const userId = getUserIdFromCookie();
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;
            if (!userIdNumber) return;

            setConversations((prev) => prev.filter((c) => c.id !== roomId));
            if (activeConversationIdRef.current === roomId) {
                setActiveConversationId(null);
            }
            await deleteConversationApi(userIdNumber as number, roomId); // Force number cast valid logic
        } catch (error) {
            console.error("Delete conversation failed", error);
            fetchConversations();
        }
    };

    // Socket Listeners
    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
        const roomId = activeConversationId;
        if (roomId && !roomId.startsWith("temp_")) {
            const roomIdNum = parseInt(roomId, 10);
            if (!isNaN(roomIdNum)) {
                joinChatRoom(roomIdNum);
                if (!skipAutoLoadMessagesRef.current) {
                    setMessages([]);
                    loadMessages(roomId);
                } else {
                    skipAutoLoadMessagesRef.current = false;
                }
            }
        } else {
            setMessages([]);
        }

        return () => {
            if (roomId && !roomId.startsWith("temp_")) {
                const roomIdNum = parseInt(roomId, 10);
                if (!isNaN(roomIdNum)) leaveChatRoom(roomIdNum);
            }
        };
    }, [activeConversationId, loadMessages]);

    useEffect(() => {
        chatSocketClient.connect();

        const unsubscribeConnection = chatSocketClient.onConnectionChange((isConnected) => {
            if (isConnected && activeConversationIdRef.current) {
                const roomIdNum = parseInt(activeConversationIdRef.current, 10);
                if (!isNaN(roomIdNum)) joinChatRoom(roomIdNum);
            }
        });

        const unsubscribeMessage = onMessageReceived((payload) => {
            const msg = payload.data || payload;
            const msgId = String(msg.message_id || "");
            if (msgId && processedMessageIdsRef.current.has(msgId)) return;
            if (msgId) processedMessageIdsRef.current.add(msgId);

            const currentActiveId = activeConversationIdRef.current;
            const userId = getUserIdFromCookie();
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

            setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => c.id === String(msg.room_id));
                let newConv = existingIndex !== -1 ? { ...prev[existingIndex] } : null;

                if (!newConv) {
                    fetchConversationsRef.current();
                    return prev;
                }

                const isOwn = String(msg.sender_id) === String(userIdNumber);
                newConv.lastMessage = isOwn ? `Bạn: ${msg.content}` : msg.content;
                newConv.time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                if (!isOwn) newConv.unread = (newConv.unread || 0) + 1;

                const others = prev.filter((_, i) => i !== existingIndex);
                return [newConv, ...others];
            });

            if (String(msg.room_id) === String(currentActiveId)) {
                const newMessage: Message = {
                    id: String(msg.message_id || Date.now()),
                    sender: msg.sender?.fullname || msg.sender?.username || "Unknown",
                    senderAvatar: msg.sender?.avatar,
                    content: (msg.content || "").trim(),
                    time: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isOwn: String(msg.sender_id) === String(userIdNumber),
                    fileAttachment: msg.fileAttachment,
                };

                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMessage.id)) return prev;
                    if (newMessage.isOwn) { // Optimistic dedupe
                        const tempMatchIndex = prev.findIndex((m) => m.id.startsWith("temp_msg_") && m.content.trim() === newMessage.content.trim() && m.isOwn);
                        if (tempMatchIndex !== -1) {
                            const newArr = [...prev];
                            newArr[tempMatchIndex] = newMessage;
                            return newArr;
                        }
                    }
                    return [...prev, newMessage];
                });
            }
        });

        const unsubscribeRead = onMessageRead((payload) => {
            const data = (payload as any).data || payload;
            const { room_id, user_id, message_id } = data;
            const userId = getUserIdFromCookie();
            const userIdNumber = typeof userId === "string" ? parseInt(userId, 10) : userId;

            if (String(user_id) !== String(userIdNumber)) {
                setLastReadMessageIds((prev) => ({ ...prev, [String(room_id)]: message_id }));
            }
        });

        return () => {
            unsubscribeConnection();
            unsubscribeMessage();
            unsubscribeRead();
        };
    }, []); // Global socket init

    // Initial Fetch
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const value = useMemo(() => ({
        conversations,
        activeConversationId,
        messages,
        loadingMessages,
        loadingConversations,
        groupCount,
        lastReadMessageIds,
        fetchConversations,
        loadMessages,
        sendMessage,
        startChat,
        setActiveConversationId,
        markConversationAsRead,
        deleteConversation: deleteConversationHandler,
    }), [
        conversations,
        activeConversationId,
        messages,
        loadingMessages,
        loadingConversations,
        groupCount,
        lastReadMessageIds,
        fetchConversations,
        loadMessages,
        sendMessage,
        startChat
    ]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
