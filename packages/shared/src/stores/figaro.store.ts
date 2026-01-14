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

// Nutrition types
export interface FigaroNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  meals: number;
}

export interface FigaroNutritionGoals {
  calories?: { target: number; unit: string };
  protein?: { target: number; unit: string };
  carbs?: { target: number; unit: string };
  fat?: { target: number; unit: string };
  water?: { target: number; unit: string };
}

export interface FigaroNutritionLog {
  id: string;
  description: string;
  meal_type: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  logged_at: string;
}

export interface FigaroNutrition {
  date: string;
  totals: FigaroNutritionTotals;
  goals: FigaroNutritionGoals;
  logs: FigaroNutritionLog[];
}

// Fitness types
export interface FigaroFitnessSummary {
  totalWorkouts: number;
  strengthSessions: number;
  cardioSessions: number;
  totalDurationMins: number;
  caloriesBurned: number;
  prsHit: number;
}

export interface FigaroFitnessGoals {
  workouts?: { target: number; unit: string };
  cardio_mins?: { target: number; unit: string };
  strength_sessions?: { target: number; unit: string };
}

export interface FigaroWorkout {
  id: string;
  exercise_name: string;
  exercise_type: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration_mins?: number;
  is_pr: boolean;
  logged_at: string;
}

export interface FigaroPR {
  id: string;
  exercise_name: string;
  pr_type: string;
  weight?: number;
  reps?: number;
  distance?: number;
  achieved_at: string;
}

export interface FigaroFitness {
  weekStart: string;
  summary: FigaroFitnessSummary;
  goals: FigaroFitnessGoals;
  workouts: FigaroWorkout[];
  recentPRs: FigaroPR[];
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
  nutrition: FigaroNutrition | null;
  fitness: FigaroFitness | null;

  // Sync state
  lastSyncAt: number | null;
  syncError: string | null;
  isSyncing: boolean;

  // Actions
  login: (token: string) => Promise<void>;
  logout: () => void;
  sync: () => Promise<void>;
  fetchNutrition: () => Promise<void>;
  fetchFitness: () => Promise<void>;

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
      nutrition: null,
      fitness: null,

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
          nutrition: null,
          fitness: null,
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

      fetchNutrition: async () => {
        const { session } = get();
        if (!session || !get().isSessionValid()) return;

        try {
          const response = await fetch("https://textfigaro.com/api/nutrition/daily", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch nutrition: ${response.status}`);
          }

          const data = await response.json();
          set({ nutrition: data });
        } catch (error) {
          console.error("[FigaroStore] Failed to fetch nutrition:", error);
        }
      },

      fetchFitness: async () => {
        const { session } = get();
        if (!session || !get().isSessionValid()) return;

        try {
          const response = await fetch("https://textfigaro.com/api/fitness/weekly", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch fitness: ${response.status}`);
          }

          const data = await response.json();
          set({ fitness: data });
        } catch (error) {
          console.error("[FigaroStore] Failed to fetch fitness:", error);
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
        nutrition: state.nutrition,
        fitness: state.fitness,
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
