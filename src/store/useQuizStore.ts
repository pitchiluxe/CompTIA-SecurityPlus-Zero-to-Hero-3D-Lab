import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Attempt history.
//
// The mastery store answers "how well do I know this concept?" — a per-concept
// ladder with no memory of individual sittings. PROMPT.md's quiz system also
// asks for score, accuracy, improvement and time, and none of those can be
// derived from a mastery level: improvement in particular needs at least two
// timestamped attempts to exist.
//
// So this store keeps one row per completed sitting. It is deliberately
// append-only and small (counts and timestamps, never the questions or the
// learner's answers), which keeps localStorage bounded no matter how much
// practice happens.
// ---------------------------------------------------------------------------

export type AttemptKind = 'lesson' | 'domain' | 'weak' | 'adaptive' | 'mock' | 'troubleshoot';

export type AttemptRecord = {
  id: string;
  kind: AttemptKind;
  /** Lesson id, domain id, or scenario id — whatever the attempt was scoped to. */
  subjectId?: string;
  total: number;
  correct: number;
  percentage: number;
  /** PBQ sub-score, so practical performance can be reported separately. */
  pbqTotal: number;
  pbqCorrect: number;
  /** Present for sessions that produce a weighted scaled score. */
  scaledScore?: number;
  durationMs: number;
  completedAt: number;
};

export type NewAttempt = Omit<AttemptRecord, 'id' | 'percentage' | 'completedAt'> & {
  completedAt?: number;
};

/** Attempts are capped so a heavy practice habit cannot grow storage without bound. */
export const MAX_ATTEMPTS = 200;

function percentOf(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

type QuizStore = {
  attempts: AttemptRecord[];
  record: (attempt: NewAttempt) => void;
  /** Attempts of one kind, or all of them, newest first. */
  history: (kind?: AttemptKind) => AttemptRecord[];
  /** Mean percentage across attempts of a kind, or all quiz-type attempts. */
  averagePercent: (kind?: AttemptKind) => number | null;
  /** Accuracy across every question ever answered, not a mean of means. */
  overallAccuracy: () => number | null;
  /** PBQ-only accuracy across every attempt that contained one. */
  pbqPercent: () => number | null;
  /** Troubleshooting Center accuracy. */
  troubleshootPercent: () => number | null;
  /** Most recent mock-exam scaled score. */
  latestScaledScore: () => number | null;
  /**
   * Improvement in percentage points: mean of the most recent three attempts
   * minus the mean of the first three. Null until there are enough attempts
   * for the comparison to mean anything.
   */
  improvement: () => number | null;
  /** Mean seconds spent per question across every recorded attempt. */
  averageSecondsPerQuestion: () => number | null;
  countByKind: (kind: AttemptKind) => number;
  resetAll: () => void;
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      attempts: [],

      record: (attempt) => {
        const row: AttemptRecord = {
          ...attempt,
          id: `${attempt.kind}-${attempt.completedAt ?? Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          percentage: percentOf(attempt.correct, attempt.total),
          completedAt: attempt.completedAt ?? Date.now(),
        };
        set((state) => ({ attempts: [...state.attempts, row].slice(-MAX_ATTEMPTS) }));
      },

      history: (kind) => {
        const rows = kind ? get().attempts.filter((a) => a.kind === kind) : get().attempts;
        return [...rows].sort((a, b) => b.completedAt - a.completedAt);
      },

      averagePercent: (kind) => {
        const rows = kind
          ? get().attempts.filter((a) => a.kind === kind)
          : get().attempts.filter((a) => a.kind !== 'troubleshoot');
        return mean(rows.map((a) => a.percentage));
      },

      overallAccuracy: () => {
        const rows = get().attempts.filter((a) => a.kind !== 'troubleshoot');
        const total = rows.reduce((sum, a) => sum + a.total, 0);
        if (total === 0) return null;
        return percentOf(
          rows.reduce((sum, a) => sum + a.correct, 0),
          total
        );
      },

      pbqPercent: () => {
        const total = get().attempts.reduce((sum, a) => sum + a.pbqTotal, 0);
        if (total === 0) return null;
        return percentOf(
          get().attempts.reduce((sum, a) => sum + a.pbqCorrect, 0),
          total
        );
      },

      troubleshootPercent: () => {
        const rows = get().attempts.filter((a) => a.kind === 'troubleshoot');
        const total = rows.reduce((sum, a) => sum + a.total, 0);
        if (total === 0) return null;
        return percentOf(
          rows.reduce((sum, a) => sum + a.correct, 0),
          total
        );
      },

      latestScaledScore: () => {
        const mocks = get()
          .attempts.filter((a) => a.kind === 'mock' && a.scaledScore !== undefined)
          .sort((a, b) => b.completedAt - a.completedAt);
        return mocks.length > 0 ? mocks[0].scaledScore! : null;
      },

      improvement: () => {
        const rows = [...get().attempts]
          .filter((a) => a.kind !== 'troubleshoot')
          .sort((a, b) => a.completedAt - b.completedAt);
        if (rows.length < 4) return null;
        const window = Math.min(3, Math.floor(rows.length / 2));
        const first = mean(rows.slice(0, window).map((a) => a.percentage))!;
        const last = mean(rows.slice(-window).map((a) => a.percentage))!;
        return last - first;
      },

      averageSecondsPerQuestion: () => {
        const rows = get().attempts.filter((a) => a.durationMs > 0 && a.total > 0);
        if (rows.length === 0) return null;
        const questions = rows.reduce((sum, a) => sum + a.total, 0);
        const ms = rows.reduce((sum, a) => sum + a.durationMs, 0);
        return Math.round(ms / questions / 1000);
      },

      countByKind: (kind) => get().attempts.filter((a) => a.kind === kind).length,

      resetAll: () => set({ attempts: [] }),
    }),
    {
      name: 'securityplus-attempts',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
