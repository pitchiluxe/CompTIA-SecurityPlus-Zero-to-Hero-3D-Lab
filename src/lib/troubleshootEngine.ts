import type { IamIncident } from '../data/iamIncidents';
import type { LifecycleStageId } from '../data/identityLifecycle';

// ---------------------------------------------------------------------------
// Phase 5 — IAM troubleshooting grading.
//
// Three-part diagnosis, graded in order: which stage failed, why, and what to
// do. Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type DiagnosisField = 'stage' | 'cause' | 'fix';

export const DIAGNOSIS_ORDER: DiagnosisField[] = ['stage', 'cause', 'fix'];

export const DIAGNOSIS_LABELS: Record<DiagnosisField, string> = {
  stage: 'Which stage failed',
  cause: 'Root cause',
  fix: 'Correct fix',
};

export const DIAGNOSIS_PROMPTS: Record<DiagnosisField, string> = {
  stage:
    'Localise the fault before explaining it — an engineer who fixes the wrong layer fixes nothing.',
  cause: 'What actually went wrong, given the evidence rather than the most dramatic possibility.',
  fix: 'The action that addresses the cause, not the symptom and not a different problem.',
};

export type Diagnosis = {
  stage?: LifecycleStageId;
  cause?: string;
  fix?: string;
};

export type DiagnosisFieldResult = {
  field: DiagnosisField;
  correct: boolean;
  answered: boolean;
  /** Explains the learner's own choice first, then the correction. */
  rationale: string;
};

export type DiagnosisResult = {
  incidentId: string;
  fields: DiagnosisFieldResult[];
  correctCount: number;
  total: number;
  percentage: number;
};

export function isDiagnosisComplete(diagnosis: Diagnosis): boolean {
  return Boolean(diagnosis.stage && diagnosis.cause && diagnosis.fix);
}

function gradeOptionField(
  field: DiagnosisField,
  chosenId: string | undefined,
  options: IamIncident['causeOptions']
): DiagnosisFieldResult {
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

export function gradeDiagnosis(incident: IamIncident, diagnosis: Diagnosis): DiagnosisResult {
  const stageCorrect = diagnosis.stage === incident.correctStage;
  const fields: DiagnosisFieldResult[] = [
    {
      field: 'stage',
      correct: stageCorrect,
      answered: Boolean(diagnosis.stage),
      rationale: !diagnosis.stage
        ? `Not answered. ${incident.stageRationale}`
        : incident.stageRationale,
    },
    gradeOptionField('cause', diagnosis.cause, incident.causeOptions),
    gradeOptionField('fix', diagnosis.fix, incident.fixOptions),
  ];

  const correctCount = fields.filter((f) => f.correct).length;
  return {
    incidentId: incident.id,
    fields,
    correctCount,
    total: fields.length,
    percentage: Math.round((correctCount / fields.length) * 100),
  };
}
