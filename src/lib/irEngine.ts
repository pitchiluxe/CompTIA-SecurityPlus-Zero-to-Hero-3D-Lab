import type { ContainmentOption, Incident } from '../data/incidents';

// ---------------------------------------------------------------------------
// Phase 12 — incident response grading.
//
// Containment is graded on two axes rather than as right/wrong, because that
// is what makes it hard: the fastest action often destroys evidence, and the
// evidence-preserving action can leave the attacker working.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type ContainmentAnswer = string[];

export type ContainmentResult = {
  chosen: ContainmentOption[];
  /** Recommended actions the learner selected. */
  correctlyChosen: ContainmentOption[];
  /** Recommended actions the learner missed. */
  missed: ContainmentOption[];
  /** Non-recommended actions the learner selected. */
  wronglyChosen: ContainmentOption[];
  /** True when the selection actually stops the attacker's access. */
  contained: boolean;
  /** True when nothing selected destroys evidence. */
  evidencePreserved: boolean;
  /** Actions selected that destroy evidence. */
  evidenceDestroyingActions: ContainmentOption[];
  correctCount: number;
  total: number;
  percentage: number;
};

export function gradeContainment(
  incident: Incident,
  selectedIds: ContainmentAnswer
): ContainmentResult {
  const selected = new Set(selectedIds);
  const options = incident.containmentOptions;

  const chosen = options.filter((o) => selected.has(o.id));
  const recommended = options.filter((o) => o.recommended);

  const correctlyChosen = chosen.filter((o) => o.recommended);
  const missed = recommended.filter((o) => !selected.has(o.id));
  const wronglyChosen = chosen.filter((o) => !o.recommended);
  const evidenceDestroyingActions = chosen.filter((o) => !o.preservesEvidence);

  // Containment is a property of the whole selection: at least one chosen
  // action must actually stop the attacker's access.
  const contained = chosen.some((o) => o.stopsAttacker);
  const evidencePreserved = evidenceDestroyingActions.length === 0;

  // Score every option: selecting a recommended one and leaving a
  // non-recommended one alone are both correct decisions.
  const correctCount = options.filter(
    (o) => (o.recommended && selected.has(o.id)) || (!o.recommended && !selected.has(o.id))
  ).length;

  return {
    chosen,
    correctlyChosen,
    missed,
    wronglyChosen,
    contained,
    evidencePreserved,
    evidenceDestroyingActions,
    correctCount,
    total: options.length,
    percentage: options.length > 0 ? Math.round((correctCount / options.length) * 100) : 0,
  };
}

// ------------------------------- Timeline -------------------------------

export type TimelineAnswer = number[];

export type TimelineResult = {
  correct: boolean;
  /** How many events sit in their correct position. */
  correctPositions: number;
  total: number;
  percentage: number;
};

/**
 * Grade a reconstructed timeline. The learner supplies indices into the
 * incident's event list in the order they believe events occurred.
 */
export function gradeTimeline(incident: Incident, order: TimelineAnswer): TimelineResult {
  const total = incident.timeline.length;
  if (order.length !== total) {
    return { correct: false, correctPositions: 0, total, percentage: 0 };
  }

  // The stored timeline is already chronological, so position i should hold i.
  const correctPositions = order.filter((eventIndex, position) => eventIndex === position).length;

  return {
    correct: correctPositions === total,
    correctPositions,
    total,
    percentage: total > 0 ? Math.round((correctPositions / total) * 100) : 0,
  };
}

/** Events shuffled deterministically, so the exercise is reproducible. */
export function shuffledTimeline(incident: Incident, seed = 7): number[] {
  const indices = incident.timeline.map((_, i) => i);
  let s = seed >>> 0 || 1;
  const next = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// ---------------------------- Affected assets ----------------------------

export type AssetAnswer = string[];

export type AssetResult = {
  correctlyIdentified: string[];
  missed: string[];
  falselyIncluded: string[];
  correctCount: number;
  total: number;
  percentage: number;
};

export function gradeAssets(incident: Incident, selectedNames: AssetAnswer): AssetResult {
  const selected = new Set(selectedNames);
  const assets = incident.affectedAssets;

  const correctlyIdentified = assets
    .filter((a) => a.confirmed && selected.has(a.name))
    .map((a) => a.name);
  const missed = assets.filter((a) => a.confirmed && !selected.has(a.name)).map((a) => a.name);
  const falselyIncluded = assets
    .filter((a) => !a.confirmed && selected.has(a.name))
    .map((a) => a.name);

  const correctCount = assets.filter(
    (a) => (a.confirmed && selected.has(a.name)) || (!a.confirmed && !selected.has(a.name))
  ).length;

  return {
    correctlyIdentified,
    missed,
    falselyIncluded,
    correctCount,
    total: assets.length,
    percentage: assets.length > 0 ? Math.round((correctCount / assets.length) * 100) : 0,
  };
}
