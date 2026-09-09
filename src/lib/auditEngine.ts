import { BASELINE_ITEMS, type BaselineItem, type Finding } from '../data/windowsBaseline';

// ---------------------------------------------------------------------------
// Phase 8 — hardening audit grading.
//
// Same discrimination shape as Phase 7 triage, applied to configuration:
// missing a real finding is dangerous, flagging a compliant setting is
// expensive. Both directions are named.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type AuditAnswer = Record<string, Finding | undefined>;

export type AuditItemResult = {
  itemId: string;
  chosen?: Finding;
  answered: boolean;
  correct: boolean;
  errorKind?: 'missed-finding' | 'false-finding';
  rationale: string;
};

export type AuditResult = {
  items: AuditItemResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Real misconfigurations the learner called compliant. */
  missedFindings: number;
  /** Correct settings the learner flagged as findings. */
  falseFindings: number;
  /** High-severity findings missed — worth calling out separately. */
  missedHighSeverity: number;
};

export function gradeAudit(
  answer: AuditAnswer,
  items: BaselineItem[] = BASELINE_ITEMS
): AuditResult {
  const results: AuditItemResult[] = items.map((item) => {
    const chosen = answer[item.id];
    const correct = chosen === item.verdict;

    let errorKind: AuditItemResult['errorKind'];
    if (chosen && !correct) {
      errorKind = item.verdict === 'finding' ? 'missed-finding' : 'false-finding';
    }

    return {
      itemId: item.id,
      chosen,
      answered: chosen !== undefined,
      correct,
      errorKind,
      rationale: item.rationale,
    };
  });

  const missedHighSeverity = results.filter((r) => {
    if (r.errorKind !== 'missed-finding') return false;
    return items.find((i) => i.id === r.itemId)?.severity === 'high';
  }).length;

  const correctCount = results.filter((r) => r.correct).length;
  return {
    items: results,
    correctCount,
    total: items.length,
    percentage: items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0,
    missedFindings: results.filter((r) => r.errorKind === 'missed-finding').length,
    falseFindings: results.filter((r) => r.errorKind === 'false-finding').length,
    missedHighSeverity,
  };
}

export function isAuditComplete(
  answer: AuditAnswer,
  items: BaselineItem[] = BASELINE_ITEMS
): boolean {
  return items.every((i) => answer[i.id] !== undefined);
}

export function countAudited(answer: AuditAnswer, items: BaselineItem[] = BASELINE_ITEMS): number {
  return items.filter((i) => answer[i.id] !== undefined).length;
}
