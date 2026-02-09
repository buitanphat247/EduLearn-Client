import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface FriendUIState {
  // Selected friend for viewing profile
  selectedFriendId: string | null;

  // Modal states
  isAddFriendModalOpen: boolean;
  isBlockListOpen: boolean;

  // Socket status
  isConnected: boolean;
}

interface FriendUIActions {
  setSelectedFriendId: (id: string | null) => void;
  openAddFriendModal: () => void;
  closeAddFriendModal: () => void;
  openBlockList: () => void;
  closeBlockList: () => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState: FriendUIState = {
  selectedFriendId: null,
  isAddFriendModalOpen: false,
  isBlockListOpen: false,
  isConnected: false,
};

/**
 * Zustand store for Friend UI state
 * Handles modals and UI-only state
 */
export const useFriendStore = create<FriendUIState & FriendUIActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedFriendId: (id) => set({ selectedFriendId: id }),

      openAddFriendModal: () => set({ isAddFriendModalOpen: true }),
      closeAddFriendModal: () => set({ isAddFriendModalOpen: false }),

      openBlockList: () => set({ isBlockListOpen: true }),
      closeBlockList: () => set({ isBlockListOpen: false }),

      setConnected: (connected) => set({ isConnected: connected }),

      reset: () => set(initialState),
    }),
    { name: "friend-store" },
  ),
);

// Selectors
export const selectSelectedFriendId = (state: FriendUIState & FriendUIActions) => state.selectedFriendId;
export const selectIsAddFriendModalOpen = (state: FriendUIState & FriendUIActions) => state.isAddFriendModalOpen;
