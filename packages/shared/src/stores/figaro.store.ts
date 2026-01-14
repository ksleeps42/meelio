import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FigaroSyncService, type ModuleSummary } from "../lib/figaro-sync.service";

// Types for Figaro data
export interface FigaroListSummary {
  name: string;
  items: string[];
  count: number;
}

export interface FigaroReminder {
  id: string;
  content: string;
  time: string; // ISO string
}

export interface FigaroBriefing {
  shortcode: string;
  generatedAt: string; // ISO string
}

export interface FigaroSession {
  token: string;
  expiresAt: number; // Unix timestamp
}

export type SubscriptionTier = "free" | "pro" | "power" | null;

export interface FigaroState {
  // Auth
  isAuthenticated: boolean;
  session: FigaroSession | null;

  // Subscription
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;

  // Cached data from sync
  lists: FigaroListSummary[];
  reminders: FigaroReminder[];
  briefing: FigaroBriefing | null;
  memoriesCount: number;

  // Sync state
  lastSyncAt: number | null;
  syncError: string | null;
  isSyncing: boolean;

  // Actions
  login: (token: string) => Promise<void>;
  logout: () => void;
  sync: () => Promise<void>;

  // Helpers
  canAccessFigaroWidgets: () => boolean;
  isSessionValid: () => boolean;
}

const syncService = new FigaroSyncService();

export const useFigaroStore = create<FigaroState>()(
  persist(
    (set, get) => ({
      // Initial auth state
      isAuthenticated: false,
      session: null,

      // Initial subscription state
      isPremium: false,
      subscriptionTier: null,

      // Initial cached data
      lists: [],
      reminders: [],
      briefing: null,
      memoriesCount: 0,

      // Initial sync state
      lastSyncAt: null,
      syncError: null,
      isSyncing: false,

      login: async (token: string) => {
        try {
          // Set session with 24h expiry (will be refreshed on sync)
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
          set({
            isAuthenticated: true,
            session: { token, expiresAt },
            syncError: null,
          });

          // Immediately sync to get user data
          await get().sync();
        } catch (error) {
          console.error("[FigaroStore] Login failed:", error);
          set({
            isAuthenticated: false,
            session: null,
            syncError: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          session: null,
          isPremium: false,
          subscriptionTier: null,
          lists: [],
          reminders: [],
          briefing: null,
          memoriesCount: 0,
          lastSyncAt: null,
          syncError: null,
          isSyncing: false,
        });
      },

      sync: async () => {
        const { session, isSyncing, lastSyncAt } = get();

        // Don't sync if already syncing
        if (isSyncing) return;

        // Don't sync if no valid session
        if (!session || !get().isSessionValid()) {
          set({
            syncError: "No valid session",
            isAuthenticated: false,
          });
          return;
        }

        // Check if we should sync (stale check)
        if (!syncService.shouldSync(lastSyncAt)) {
          return;
        }

        set({ isSyncing: true, syncError: null });

        try {
          const summary = await syncService.fetchModuleSummary(session.token);

          set({
            // Update subscription info
            isPremium: summary.subscription.tier !== "free",
            subscriptionTier: summary.subscription.tier,

            // Update cached data
            lists: summary.lists,
            reminders: summary.reminders,
            briefing: summary.briefing,
            memoriesCount: summary.memoriesCount,

            // Update sync state
            lastSyncAt: Date.now(),
            isSyncing: false,
            syncError: null,
          });
        } catch (error) {
          console.error("[FigaroStore] Sync failed:", error);

          // If unauthorized, clear auth state
          if (error instanceof Error && error.message.includes("401")) {
            set({
              isAuthenticated: false,
              session: null,
              isSyncing: false,
              syncError: "Session expired",
            });
          } else {
            set({
              isSyncing: false,
              syncError: error instanceof Error ? error.message : "Sync failed",
            });
          }
        }
      },

      canAccessFigaroWidgets: () => {
        const state = get();
        return state.isAuthenticated && state.isSessionValid();
      },

      isSessionValid: () => {
        const { session } = get();
        if (!session) return false;
        // Consider session valid if it has more than 5 minutes left
        return session.expiresAt > Date.now() + 5 * 60 * 1000;
      },
    }),
    {
      name: "figaro:local:figaro",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        // Persist auth and subscription
        isAuthenticated: state.isAuthenticated,
        session: state.session,
        isPremium: state.isPremium,
        subscriptionTier: state.subscriptionTier,
        // Persist cached data for offline access
        lists: state.lists,
        reminders: state.reminders,
        briefing: state.briefing,
        memoriesCount: state.memoriesCount,
        // Persist sync timestamp
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// Helper to get Figaro session outside of React components
export const getFigaroSession = (): FigaroSession | null => {
  return useFigaroStore.getState().session;
};
