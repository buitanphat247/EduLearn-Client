import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

interface ChatUIState {
  // Active conversation
  activeConversationId: string | null;

  // Loading states
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;

  // Socket status
  isConnected: boolean;

  // UI state
  isTyping: boolean;

  // Processed message IDs for deduplication
  processedMessageIds: Set<string>;
}

interface ChatUIActions {
  setActiveConversationId: (id: string | null) => void;
  setLoadingMessages: (loading: boolean) => void;
  setLoadingConversations: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  setTyping: (typing: boolean) => void;
  addProcessedMessageId: (id: string) => void;
  clearProcessedMessageIds: () => void;
  reset: () => void;
}

const initialState: ChatUIState = {
  activeConversationId: null,
  isLoadingMessages: false,
  isLoadingConversations: true,
  isConnected: false,
  isTyping: false,
  processedMessageIds: new Set(),
};

/**
 * Zustand store for Chat UI state
 * Handles client-only state, no server data
 */
export const useChatStore = create<ChatUIState & ChatUIActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setActiveConversationId: (id) => set({ activeConversationId: id }),

      setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

      setLoadingConversations: (loading) => set({ isLoadingConversations: loading }),

      setConnected: (connected) => set({ isConnected: connected }),

      setTyping: (typing) => set({ isTyping: typing }),

      addProcessedMessageId: (id) => {
        const current = get().processedMessageIds;
        // Limit size to prevent memory leak
        if (current.size > 1000) {
          const ids = Array.from(current);
          const newSet = new Set(ids.slice(-500));
          newSet.add(id);
          set({ processedMessageIds: newSet });
        } else {
          const newSet = new Set(current);
          newSet.add(id);
          set({ processedMessageIds: newSet });
        }
      },

      clearProcessedMessageIds: () => set({ processedMessageIds: new Set() }),

      reset: () => set(initialState),
    })),
    { name: "chat-store" },
  ),
);

// Selectors for optimized re-renders
export const selectActiveConversationId = (state: ChatUIState & ChatUIActions) => state.activeConversationId;
export const selectIsLoadingMessages = (state: ChatUIState & ChatUIActions) => state.isLoadingMessages;
export const selectIsConnected = (state: ChatUIState & ChatUIActions) => state.isConnected;
