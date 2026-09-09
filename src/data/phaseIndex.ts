import raw from './phaseIndex.json';

// ---------------------------------------------------------------------------
// Lightweight phase index.
//
// The Dashboard needs phase titles, descriptions and lesson/lab names for
// progress totals and "continue where you left off" links. It does NOT need
// lesson bodies, quiz questions, lab steps or evidence templates.
//
// Importing `curriculum.ts` would pull the entire curriculum graph — every
// phase's full text — into the initial bundle, because Dashboard is the eager
// landing route. This module imports nothing from the phase files, so that
// content stays in the lazily-loaded route chunks that actually need it.
//
// GENERATED from the real curriculum. `tests/curriculum.test.ts` asserts the
// two stay identical, so drift is caught rather than discovered.
// ---------------------------------------------------------------------------

export type PhaseIndexItem = {
  id: string;
  title: string;
};

export type PhaseIndexEntry = {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: PhaseIndexItem[];
  labs: PhaseIndexItem[];
};

export const PHASE_INDEX: PhaseIndexEntry[] = raw;

/** Total gradeable items in a phase — lessons plus labs. */
export function indexItemCount(entry: PhaseIndexEntry): number {
  return entry.lessons.length + entry.labs.length;
}

export function getIndexEntry(id: string): PhaseIndexEntry | undefined {
  return PHASE_INDEX.find((p) => p.id === id);
}
