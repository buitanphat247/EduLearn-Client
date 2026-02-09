import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "@/app/components/social/types";

interface SocialProfileState {
  currentUser: User | null;
  isSettingsOpen: boolean;
  isProfileOpen: boolean;
  isAddFriendOpen: boolean;
  isHydrated: boolean;
}

interface SocialProfileActions {
  setCurrentUser: (user: User | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  setIsAddFriendOpen: (open: boolean) => void;
  toggleSettings: () => void;
  toggleProfile: () => void;
  toggleAddFriend: () => void;
  hydrate: () => void;
}

/**
 * Type guard for user data validation
 */
function isValidUserData(data: unknown): data is {
  user_id?: number | string;
  id?: number | string;
  username?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role_id?: number;
} {
  return (
    data !== null &&
    typeof data === "object" &&
    (typeof (data as any).user_id === "number" ||
      typeof (data as any).user_id === "string" ||
      typeof (data as any).id === "number" ||
      typeof (data as any).id === "string")
  );
}

/**
 * Zustand store for Social Profile state
 * Manages current user and UI modal states
 */
export const useSocialProfileStore = create<SocialProfileState & SocialProfileActions>()(
  devtools(
    (set, get) => ({
      currentUser: null,
      isSettingsOpen: false,
      isProfileOpen: false,
      isAddFriendOpen: false,
      isHydrated: false,

      setCurrentUser: (user) => set({ currentUser: user }),

      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setIsProfileOpen: (open) => set({ isProfileOpen: open }),
      setIsAddFriendOpen: (open) => set({ isAddFriendOpen: open }),

      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
      toggleAddFriend: () => set((state) => ({ isAddFriendOpen: !state.isAddFriendOpen })),

      hydrate: () => {
        if (get().isHydrated) return;

        try {
          const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          if (!userStr) {
            set({ isHydrated: true });
            return;
          }

          const userData = JSON.parse(userStr);

          if (!isValidUserData(userData)) {
            console.error("Invalid user data structure");
            localStorage.removeItem("user");
            set({ isHydrated: true });
            return;
          }

          const user: User = {
            id: userData.user_id || userData.id || "",
            username: userData.username || "",
            fullname: userData.fullname || "",
            email: userData.email,
            phone: userData.phone || null,
            avatar: userData.avatar || null,
            role_id: userData.role_id,
          };

          set({ currentUser: user, isHydrated: true });
        } catch (e) {
          console.error("Error parsing user from local storage", e);
          localStorage.removeItem("user");
          set({ isHydrated: true });
        }
      },
    }),
    { name: "social-profile-store" },
  ),
);

// Selectors
export const selectCurrentUser = (state: SocialProfileState) => state.currentUser;
export const selectIsSettingsOpen = (state: SocialProfileState) => state.isSettingsOpen;
export const selectIsProfileOpen = (state: SocialProfileState) => state.isProfileOpen;
export const selectIsAddFriendOpen = (state: SocialProfileState) => state.isAddFriendOpen;
