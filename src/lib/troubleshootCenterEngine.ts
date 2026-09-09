import type { TroubleshootScenario } from '../data/troubleshootScenarios';

// ---------------------------------------------------------------------------
// Phase 22 — Security Troubleshooting Center grading.
//
// Two-part diagnosis, graded together: root cause first, recommended action
// second. Unlike Phase 5's IAM troubleshooting (which localises a lifecycle
// stage first), these ten scenarios span unrelated domains — there is no
// shared "stage" to diagnose, only root cause and the response it justifies.
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type TroubleshootDiagnosisField = 'rootCause' | 'action';

export const TROUBLESHOOT_FIELD_ORDER: TroubleshootDiagnosisField[] = ['rootCause', 'action'];

export const TROUBLESHOOT_FIELD_LABELS: Record<TroubleshootDiagnosisField, string> = {
  rootCause: 'Root cause',
  action: 'Recommended action',
};

export const TROUBLESHOOT_FIELD_PROMPTS: Record<TroubleshootDiagnosisField, string> = {
  rootCause:
    'What the evidence actually supports, not the most dramatic explanation available.',
  action:
    'The response that addresses the confirmed root cause and its actual scope — not a broader or narrower one.',
};

/**
 * PROMPT.md's Socratic mode: the questions an instructor asks instead of
 * handing over the answer. Shown before any hint is requested, on every
 * scenario, because the sequence itself is the transferable skill — the
 * scenario changes, the questions do not.
 */
export const SOCRATIC_PROMPTS: string[] = [
  'What happened? State it in one sentence, without interpreting it yet.',
  'What evidence do you actually have — and which panel is it in?',
  'What would you check first, and why that before anything else?',
  'Which log or panel would confirm or rule out your leading idea?',
  'What hypothesis are you testing right now?',
  'What would prove it wrong? If nothing could, it is not yet a hypothesis.',
];

export type TroubleshootDiagnosis = {
  rootCause?: string;
  action?: string;
};

export type TroubleshootFieldResult = {
  field: TroubleshootDiagnosisField;
  correct: boolean;
  answered: boolean;
  rationale: string;
};

export type TroubleshootResult = {
  scenarioId: string;
  fields: TroubleshootFieldResult[];
  correctCount: number;
  total: number;
  percentage: number;
};

export function isDiagnosisComplete(diagnosis: TroubleshootDiagnosis): boolean {
  return Boolean(diagnosis.rootCause && diagnosis.action);
}

function gradeField(
  field: TroubleshootDiagnosisField,
  chosenId: string | undefined,
  options: TroubleshootScenario['rootCauseOptions']
): TroubleshootFieldResult {
  const chosen = options.find((o) => o.id === chosenId);
  const correctOption = options.find((o) => o.correct)!;
  const correct = Boolean(chosen?.correct);

  const rationale = !chosen
    ? `Not answered. ${correctOption.rationale}`
    : correct
      ? chosen.rationale
      : `${chosen.rationale} The correct answer is "${correctOption.text}" — ${correctOption.rationale}`;

  return { field, correct, answered: Boolean(chosen), rationale };
}

export function gradeDiagnosis(
  scenario: TroubleshootScenario,
  diagnosis: TroubleshootDiagnosis
): TroubleshootResult {
  const fields: TroubleshootFieldResult[] = [
    gradeField('rootCause', diagnosis.rootCause, scenario.rootCauseOptions),
    gradeField('action', diagnosis.action, scenario.actionOptions),
  ];

  const correctCount = fields.filter((f) => f.correct).length;
  return {
    scenarioId: scenario.id,
    fields,
    correctCount,
    total: fields.length,
    percentage: Math.round((correctCount / fields.length) * 100),
  };
}
