import type { Lab } from '../types';
import { runCommand } from './commands';
import type { LabRunState, SimOutput, StepStatus, VerificationResult } from './types';

// ---------------------------------------------------------------------------
// Deterministic lab runner.
//
// Pure functions over an immutable LabRunState: the same state plus the same
// input always yields the same next state. That makes labs reproducible,
// testable, and safe to replay — and means the engine holds no hidden I/O.
// ---------------------------------------------------------------------------

export function load(lab: Lab, now: number = Date.now()): LabRunState {
  const stepStatus: StepStatus[] = lab.steps.map((_, i) => (i === 0 ? 'active' : 'pending'));
  return {
    labId: lab.id,
    cursor: 0,
    stepStatus,
    transcript: [],
    startedAt: now,
  };
}

export function reset(lab: Lab, now: number = Date.now()): LabRunState {
  return load(lab, now);
}

/** Mark the current step done and advance. No-op once every step is done. */
export function advance(state: LabRunState, lab: Lab, now: number = Date.now()): LabRunState {
  if (state.cursor >= lab.steps.length) return state;

  const stepStatus = [...state.stepStatus];
  stepStatus[state.cursor] = 'done';
  const cursor = state.cursor + 1;
  if (cursor < stepStatus.length) stepStatus[cursor] = 'active';

  const completed = cursor >= lab.steps.length;
  return {
    ...state,
    cursor,
    stepStatus,
    completedAt: completed ? now : state.completedAt,
  };
}

/** Jump to an arbitrary step without changing what has been completed. */
export function goToStep(state: LabRunState, index: number, lab: Lab): LabRunState {
  if (index < 0 || index >= lab.steps.length) return state;
  const stepStatus = state.stepStatus.map<StepStatus>((s, i) =>
    i === index ? (s === 'done' ? 'done' : 'active') : s === 'active' ? 'pending' : s
  );
  return { ...state, cursor: index, stepStatus };
}

/**
 * Run one simulated command and append it to the transcript. If the command
 * matches the current step's expected command, the step auto-advances.
 */
export function step(
  state: LabRunState,
  lab: Lab,
  input: string,
  now: number = Date.now()
): { state: LabRunState; output: SimOutput } {
  const output = runCommand(input);
  const withTranscript: LabRunState = {
    ...state,
    transcript: [...state.transcript, output],
  };

  const currentStep = lab.steps[state.cursor];
  const satisfiesStep =
    output.recognised &&
    currentStep?.command !== undefined &&
    currentStep.command.trim().toLowerCase() === output.command;

  return {
    state: satisfiesStep ? advance(withTranscript, lab, now) : withTranscript,
    output,
  };
}

/**
 * Verify the lab against its declared verification criteria.
 * A criterion passes when every step is complete and at least one recognised
 * command was run — evidence that the learner actually worked the lab rather
 * than clicking through it.
 */
export function verify(state: LabRunState, lab: Lab): VerificationResult {
  const allStepsDone = state.stepStatus.every((s) => s === 'done');
  const recognisedCount = state.transcript.filter((t) => t.recognised).length;

  const checks = [
    {
      label: 'All lab steps completed',
      passed: allStepsDone,
      detail: `${state.stepStatus.filter((s) => s === 'done').length}/${lab.steps.length} steps done`,
    },
    {
      label: 'At least one command run in the simulator',
      passed: recognisedCount > 0,
      detail: `${recognisedCount} recognised command(s) in transcript`,
    },
    ...lab.verification.map((v) => ({
      label: v,
      passed: allStepsDone,
      detail: allStepsDone ? 'Satisfied by completed steps' : 'Complete all steps to satisfy',
    })),
  ];

  return { passed: checks.every((c) => c.passed), checks };
}

/** Percent complete, for progress bars. */
export function completionPercent(state: LabRunState): number {
  if (state.stepStatus.length === 0) return 0;
  const done = state.stepStatus.filter((s) => s === 'done').length;
  return Math.round((done / state.stepStatus.length) * 100);
}

/** Render the transcript as plain text suitable for evidence capture. */
export function transcriptToEvidence(state: LabRunState): string {
  if (state.transcript.length === 0) return '(no commands run)';
  return state.transcript
    .map((t) => `$ ${t.command}\n[${t.provenance.toUpperCase()}]\n${t.output}`)
    .join('\n\n');
}
