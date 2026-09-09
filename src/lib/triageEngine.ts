import { ALERTS, type Alert, type InvestigationStatus } from '../data/socTelemetry';

// ---------------------------------------------------------------------------
// Phase 7 — alert triage grading.
//
// The skill being assessed is discrimination: which alerts are real and which
// are noise. An analyst who escalates everything is as unhelpful as one who
// escalates nothing, so both error directions are graded and named.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type TriageDecision = 'escalate' | 'close-fp';

export type TriageAnswer = Record<string, TriageDecision | undefined>;

export type TriageAlertResult = {
  alertId: string;
  decision?: TriageDecision;
  answered: boolean;
  correct: boolean;
  /** Which way it went wrong, for targeted feedback. */
  errorKind?: 'missed-incident' | 'false-escalation';
  rationale: string;
};

export type TriageResult = {
  alerts: TriageAlertResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Real incidents the learner closed as noise — the dangerous error. */
  missedIncidents: number;
  /** Noise the learner escalated — the expensive error. */
  falseEscalations: number;
};

const expectedDecision = (alert: Alert): TriageDecision =>
  alert.correctVerdict === 'true-positive' ? 'escalate' : 'close-fp';

export function gradeTriage(answer: TriageAnswer, alerts: Alert[] = ALERTS): TriageResult {
  const results: TriageAlertResult[] = alerts.map((alert) => {
    const decision = answer[alert.id];
    const expected = expectedDecision(alert);
    const correct = decision === expected;

    let errorKind: TriageAlertResult['errorKind'];
    if (decision && !correct) {
      // Closing a real incident is the dangerous error; escalating noise is
      // the expensive one. They deserve different names.
      errorKind = expected === 'escalate' ? 'missed-incident' : 'false-escalation';
    }

    return {
      alertId: alert.id,
      decision,
      answered: decision !== undefined,
      correct,
      errorKind,
      rationale: alert.verdictRationale,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  return {
    alerts: results,
    correctCount,
    total: alerts.length,
    percentage: alerts.length > 0 ? Math.round((correctCount / alerts.length) * 100) : 0,
    missedIncidents: results.filter((r) => r.errorKind === 'missed-incident').length,
    falseEscalations: results.filter((r) => r.errorKind === 'false-escalation').length,
  };
}

export function isTriageComplete(answer: TriageAnswer, alerts: Alert[] = ALERTS): boolean {
  return alerts.every((a) => answer[a.id] !== undefined);
}

export function countTriaged(answer: TriageAnswer, alerts: Alert[] = ALERTS): number {
  return alerts.filter((a) => answer[a.id] !== undefined).length;
}

/** Status implied by a triage decision, for the dashboard column. */
export function statusFor(decision: TriageDecision | undefined): InvestigationStatus {
  if (decision === 'escalate') return 'escalated';
  if (decision === 'close-fp') return 'closed-fp';
  return 'new';
}
