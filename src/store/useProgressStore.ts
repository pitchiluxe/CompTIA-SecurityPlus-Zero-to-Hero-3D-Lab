import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Progress } from '../types';

// Keys are `${phaseId}:lesson:${lessonId}` / `${phaseId}:lab:${labId}` so the
// two namespaces can never collide.
const lessonKey = (phaseId: string, lessonId: string) => `${phaseId}:lesson:${lessonId}`;
const labKey = (phaseId: string, labId: string) => `${phaseId}:lab:${labId}`;

type ProgressStore = {
  progress: Record<string, Progress>;
  markLessonComplete: (phaseId: string, lessonId: string, score?: number) => void;
  markLabComplete: (phaseId: string, labId: string) => void;
  isLessonComplete: (phaseId: string, lessonId: string) => boolean;
  isLabComplete: (phaseId: string, labId: string) => boolean;
  /** Completed items recorded for a phase. */
  countCompleted: (phaseId: string) => number;
  /**
   * Percent of a phase complete. `totalItems` comes from the curriculum —
   * the store cannot know it, and deriving it from stored rows alone would
   * always report 100%.
   */
  phasePercent: (phaseId: string, totalItems: number) => number;
  resetAll: () => void;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      markLessonComplete: (phaseId, lessonId, score = 0) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonKey(phaseId, lessonId)]: {
              phaseId,
              lessonId,
              completed: true,
              score,
              timestamp: Date.now(),
            },
          },
        }));
      },

      markLabComplete: (phaseId, labId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [labKey(phaseId, labId)]: {
              phaseId,
              labId,
              completed: true,
              timestamp: Date.now(),
            },
          },
        }));
      },

      isLessonComplete: (phaseId, lessonId) =>
        get().progress[lessonKey(phaseId, lessonId)]?.completed ?? false,

      isLabComplete: (phaseId, labId) => get().progress[labKey(phaseId, labId)]?.completed ?? false,

      countCompleted: (phaseId) =>
        Object.values(get().progress).filter((p) => p.phaseId === phaseId && p.completed).length,

      phasePercent: (phaseId, totalItems) => {
        if (totalItems <= 0) return 0;
        const done = get().countCompleted(phaseId);
        return Math.min(100, Math.round((done / totalItems) * 100));
      },

      resetAll: () => set({ progress: {} }),
    }),
    {
      name: 'securityplus-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
