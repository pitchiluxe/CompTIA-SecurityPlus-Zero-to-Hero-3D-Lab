import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MasteryEntry, MasteryLevel } from '../types';
import {
  applyOutcome,
  clampLevel,
  dueForReview,
  masteryPercentage,
  nextReviewAt,
  WEAK_THRESHOLD,
} from '../lib/srs';

type MasteryStore = {
  mastery: Record<string, MasteryEntry>;
  setLevel: (conceptId: string, level: MasteryLevel) => void;
  getLevel: (conceptId: string) => MasteryLevel;
  increment: (conceptId: string) => void;
  decrement: (conceptId: string) => void;
  /** Grade a concept from a quiz outcome, applying spaced-repetition timing. */
  recordOutcome: (conceptId: string, correct: boolean) => void;
  getWeakAreas: () => MasteryEntry[];
  getStrongAreas: () => MasteryEntry[];
  getDue: (now?: number) => MasteryEntry[];
  overallPercent: () => number;
  resetAll: () => void;
};

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      mastery: {},

      setLevel: (conceptId, level) => {
        const now = Date.now();
        set((state) => ({
          mastery: {
            ...state.mastery,
            [conceptId]: {
              conceptId,
              level,
              lastReviewed: now,
              nextReview: nextReviewAt(level, now),
              weak: level <= WEAK_THRESHOLD,
            },
          },
        }));
      },

      getLevel: (conceptId) => get().mastery[conceptId]?.level ?? 0,

      increment: (conceptId) =>
        get().setLevel(conceptId, clampLevel(get().getLevel(conceptId) + 1)),

      decrement: (conceptId) =>
        get().setLevel(conceptId, clampLevel(get().getLevel(conceptId) - 1)),

      recordOutcome: (conceptId, correct) => {
        set((state) => ({
          mastery: {
            ...state.mastery,
            [conceptId]: applyOutcome(state.mastery[conceptId], conceptId, correct),
          },
        }));
      },

      getWeakAreas: () => Object.values(get().mastery).filter((m) => m.level <= WEAK_THRESHOLD),

      getStrongAreas: () => Object.values(get().mastery).filter((m) => m.level >= 4),

      getDue: (now = Date.now()) => dueForReview(Object.values(get().mastery), now),

      overallPercent: () => masteryPercentage(Object.values(get().mastery)),

      resetAll: () => set({ mastery: {} }),
    }),
    {
      name: 'securityplus-mastery',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
