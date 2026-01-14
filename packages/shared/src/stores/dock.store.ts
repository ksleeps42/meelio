import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

interface DockIconsVisibility {
  timer: boolean;
  breathing: boolean;
  soundscapes: boolean;
  tasks: boolean;
  siteBlocker: boolean;
  tabStash: boolean;
  backgrounds: boolean;
  clock: boolean;
  notes?: boolean;
  bookmarks?: boolean;
  calendar?: boolean;
  figaroBriefing?: boolean;
  figaroLists?: boolean;
  figaroReminders?: boolean;
}

interface DockState {
  isTimerVisible: boolean;
  isBreathingVisible: boolean;
  isGreetingsVisible: boolean;
  isSoundscapesVisible: boolean;
  isTasksVisible: boolean;
  isBackgroundsVisible: boolean;
  isSiteBlockerVisible: boolean;
  isTabStashVisible: boolean;
  isNotesVisible: boolean;
  isBookmarksVisible: boolean;
  isCalendarVisible: boolean;
  isFigaroBriefingVisible: boolean;
  isFigaroListsVisible: boolean;
  isFigaroRemindersVisible: boolean;

  dockIconsVisible: DockIconsVisibility;

  currentOnboardingStep: number;

  showIconLabels: boolean;

  toggleTimer: () => void;
  toggleBreathing: () => void;
  toggleGreetings: () => void;
  toggleSoundscapes: () => void;
  toggleTasks: () => void;
  toggleBackgrounds: () => void;
  toggleSiteBlocker: () => void;
  toggleTabStash: () => void;
  toggleNotes: () => void;
  toggleBookmarks: () => void;
  toggleCalendar: () => void;
  toggleFigaroBriefing: () => void;
  toggleFigaroLists: () => void;
  toggleFigaroReminders: () => void;

  setTimerVisible: (visible: boolean) => void;
  setBreathingVisible: (visible: boolean) => void;
  setGreetingsVisible: (visible: boolean) => void;
  setSoundscapesVisible: (visible: boolean) => void;
  setTasksVisible: (visible: boolean) => void;
  setBackgroundsVisible: (visible: boolean) => void;
  setSiteBlockerVisible: (visible: boolean) => void;
  setTabStashVisible: (visible: boolean) => void;
  setNotesVisible: (visible: boolean) => void;
  setBookmarksVisible: (visible: boolean) => void;
  setCalendarVisible: (visible: boolean) => void;
  setFigaroBriefingVisible: (visible: boolean) => void;
  setFigaroListsVisible: (visible: boolean) => void;
  setFigaroRemindersVisible: (visible: boolean) => void;

  setDockIconVisible: (
    iconId: keyof DockIconsVisibility,
    visible: boolean
  ) => void;

  setCurrentOnboardingStep: (step: number) => void;
  setShowIconLabels: (visible: boolean) => void;
  reset: () => void;
}

export const useDockStore = create<DockState>()(
  persist(
    (set) => ({
      isTimerVisible: false,
      isBreathingVisible: false,
      isGreetingsVisible: true,
      isSoundscapesVisible: false,
      isTasksVisible: false,
      isNotesVisible: false,
      isBackgroundsVisible: false,
      isSiteBlockerVisible: false,
      isTabStashVisible: false,
      isBookmarksVisible: false,
      isCalendarVisible: false,
      isFigaroBriefingVisible: false,
      isFigaroListsVisible: false,
      isFigaroRemindersVisible: false,

      dockIconsVisible: {
        timer: true,
        breathing: true,
        soundscapes: true,
        tasks: true,
        siteBlocker: true,
        tabStash: true,
        backgrounds: true,
        clock: false,
        notes: true,
        bookmarks: true,
        calendar: true,
        figaroBriefing: true,
        figaroLists: true,
        figaroReminders: true,
      },

      showIconLabels: false,

      currentOnboardingStep: -1,

      toggleTimer: () => {
        set((state) => {
          return {
            isTimerVisible: !state.isTimerVisible,
            isBreathingVisible: false,
            isGreetingsVisible: state.isTimerVisible ? false : true,
          };
        });
      },

      toggleBreathing: () => {
        set((state) => ({
          isBreathingVisible: !state.isBreathingVisible,
          isTimerVisible: false,
          isGreetingsVisible: state.isBreathingVisible ? true : false,
        }));
      },

      toggleSoundscapes: () => {
        set((state) => ({ isSoundscapesVisible: !state.isSoundscapesVisible }));
      },

      toggleTasks: () => {
        set((state) => ({ isTasksVisible: !state.isTasksVisible }));
      },

      toggleBackgrounds: () => {
        set((state) => ({ isBackgroundsVisible: !state.isBackgroundsVisible }));
      },

      toggleGreetings: () => {
        set((state) => ({ isGreetingsVisible: !state.isGreetingsVisible }));
      },

      toggleSiteBlocker: () => {
        set((state) => ({ isSiteBlockerVisible: !state.isSiteBlockerVisible }));
      },

      toggleTabStash: () => {
        set((state) => ({ isTabStashVisible: !state.isTabStashVisible }));
      },

      toggleNotes: () => {
        set((state) => ({ isNotesVisible: !state.isNotesVisible }));
      },

      toggleBookmarks: () => {
        set((state) => ({ isBookmarksVisible: !state.isBookmarksVisible }));
      },

      toggleCalendar: () => {
        set((state) => ({ isCalendarVisible: !state.isCalendarVisible }));
      },

      toggleFigaroBriefing: () => {
        set((state) => ({ isFigaroBriefingVisible: !state.isFigaroBriefingVisible }));
      },

      toggleFigaroLists: () => {
        set((state) => ({ isFigaroListsVisible: !state.isFigaroListsVisible }));
      },

      toggleFigaroReminders: () => {
        set((state) => ({ isFigaroRemindersVisible: !state.isFigaroRemindersVisible }));
      },

      setTimerVisible: (visible: boolean) => {
        set({ isTimerVisible: visible });
      },

      setBreathingVisible: (visible: boolean) => {
        set({ isBreathingVisible: visible });
      },

      setGreetingsVisible: (visible: boolean) => {
        set({ isGreetingsVisible: visible });
      },

      setSoundscapesVisible: (visible: boolean) => {
        set({ isSoundscapesVisible: visible });
      },

      setTasksVisible: (visible: boolean) => {
        set({ isTasksVisible: visible });
      },

      setBackgroundsVisible: (visible: boolean) => {
        set({ isBackgroundsVisible: visible });
      },

      setSiteBlockerVisible: (visible: boolean) => {
        set({ isSiteBlockerVisible: visible });
      },

      setTabStashVisible: (visible: boolean) => {
        set({ isTabStashVisible: visible });
      },

      setNotesVisible: (visible: boolean) => {
        set({ isNotesVisible: visible });
      },

      setBookmarksVisible: (visible: boolean) => {
        set({ isBookmarksVisible: visible });
      },

      setCalendarVisible: (visible: boolean) => {
        set({ isCalendarVisible: visible });
      },

      setFigaroBriefingVisible: (visible: boolean) => {
        set({ isFigaroBriefingVisible: visible });
      },

      setFigaroListsVisible: (visible: boolean) => {
        set({ isFigaroListsVisible: visible });
      },

      setFigaroRemindersVisible: (visible: boolean) => {
        set({ isFigaroRemindersVisible: visible });
      },

      setDockIconVisible: (
        iconId: keyof DockIconsVisibility,
        visible: boolean
      ) => {
        set((state) => ({
          dockIconsVisible: {
            ...state.dockIconsVisible,
            [iconId]: visible,
          },
        }));
      },

      setCurrentOnboardingStep: (step: number) => {
        set({ currentOnboardingStep: step });
      },

      setShowIconLabels: (visible: boolean) => {
        set({ showIconLabels: visible });
      },

      reset: () => {
        set({
          isTimerVisible: false,
          isBreathingVisible: false,
          isGreetingsVisible: true,
          isSoundscapesVisible: false,
          isTasksVisible: false,
          isBackgroundsVisible: false,
          isSiteBlockerVisible: false,
          isTabStashVisible: false,
          isNotesVisible: false,
          isBookmarksVisible: false,
          isCalendarVisible: false,
          isFigaroBriefingVisible: false,
          isFigaroListsVisible: false,
          isFigaroRemindersVisible: false,

          currentOnboardingStep: -1,
        });
      },
    }),
    {
      name: "figaro:local:dock",
      storage: createJSONStorage(() => localStorage),
      version: 9,
      migrate: (persistedState: any, _version: number) => {
        const state = { ...persistedState };
        state.dockIconsVisible = state.dockIconsVisible || {};
        if (state.dockIconsVisible.notes === undefined) {
          state.dockIconsVisible.notes = true;
        }
        if (state.isNotesVisible === undefined) {
          state.isNotesVisible = false;
        }
        if (state.dockIconsVisible.bookmarks === undefined) {
          state.dockIconsVisible.bookmarks = true;
        }
        if (state.isBookmarksVisible === undefined) {
          state.isBookmarksVisible = false;
        }
        if (state.dockIconsVisible.calendar === undefined) {
          state.dockIconsVisible.calendar = true;
        }
        if (state.isCalendarVisible === undefined) {
          state.isCalendarVisible = false;
        }
        if (state.dockIconsVisible.figaroBriefing === undefined) {
          state.dockIconsVisible.figaroBriefing = true;
        }
        if (state.isFigaroBriefingVisible === undefined) {
          state.isFigaroBriefingVisible = false;
        }
        if (state.dockIconsVisible.figaroLists === undefined) {
          state.dockIconsVisible.figaroLists = true;
        }
        if (state.isFigaroListsVisible === undefined) {
          state.isFigaroListsVisible = false;
        }
        if (state.dockIconsVisible.figaroReminders === undefined) {
          state.dockIconsVisible.figaroReminders = true;
        }
        if (state.isFigaroRemindersVisible === undefined) {
          state.isFigaroRemindersVisible = false;
        }
        delete state.dockIconsVisible.weather;
        delete state.isWeatherVisible;
        return state;
      },
      partialize: (state) => ({
        isTimerVisible: state.isTimerVisible,
        isBreathingVisible: state.isBreathingVisible,
        isGreetingsVisible: state.isGreetingsVisible,
        dockIconsVisible: state.dockIconsVisible,
        currentOnboardingStep: state.currentOnboardingStep,
        showIconLabels: state.showIconLabels,
      }),
    }
  )
);
