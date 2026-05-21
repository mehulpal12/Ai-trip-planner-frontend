import { create } from "zustand";
// 1. Import your auth store to grab the actual login token
import { useAuthStore } from "@/lib/authStore";

interface UserProfile {
  id: string;
  bio?: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  status: "upcoming" | "completed";
}

interface FullUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: UserProfile;
  trips: Trip[];
}

interface UserStoreState {
  data: FullUserData | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<boolean>;
  clearUserData: () => void;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchUserData: async () => {
    if (get().data) {
      console.log("🟢 Zustand: Data already cached, skipping fetch.");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 2. Extract the actual active token from your authentication store state
      const accessToken = useAuthStore.getState().accessToken;

      if (!accessToken) {
        throw new Error("No access token found. User is likely logged out.");
      }

      console.log("🔵 Zustand: Fetching profile from Express backend...");
      const response = await fetch("http://localhost:4000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // 3. Pass the REAL token value
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch. Server responded with status: ${response.status}`);
      }

      // Backend wraps data inside { success, data }
      const result = await response.json();
      const payload: FullUserData = result.data;
      console.log("✨ Zustand Fetch Success! Incoming Data Payload:", payload);

      set({ data: payload, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "An unexpected error occurred";
      console.error("❌ Zustand Fetch Error:", errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateUserPreferences: async (newPrefs) => {
    const currentData = get().data;
    if (!currentData) {
      console.warn("⚠️ Zustand: Cannot update preferences because no user data is loaded yet.");
      return false;
    }

    try {
      const accessToken = useAuthStore.getState().accessToken;
      const updatedPreferences = { ...currentData.profile?.preferences, ...newPrefs };

      console.log("🔄 Zustand Optimistic Update: Patching preferences with:", newPrefs);

      set({
        data: {
          ...currentData,
          profile: {
            ...currentData.profile!,
            preferences: updatedPreferences as UserProfile["preferences"],
          },
        },
      });

      console.log("📡 Zustand: Syncing preferences via PATCH request...");
      // 4. Swapped method from 'GET' to 'PATCH' so body parsing works perfectly
      const response = await fetch("http://localhost:4000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPrefs),
      });

      if (!response.ok) throw new Error("Server rejected preference update.");

      console.log("✅ Zustand: Server sync successful!");
      return true;
    } catch (error) {
      console.error("❌ Zustand Preferences Sync Failed:", error);
      return false;
    }
  },

  clearUserData: () => {
    console.log("🧹 Zustand: Clearing user data state (Logging out)...");
    set({ data: null, isLoading: false, error: null });
  },
}));