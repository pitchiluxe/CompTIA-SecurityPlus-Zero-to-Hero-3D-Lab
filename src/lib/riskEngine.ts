import {
  RISK_FIELD_ORDER,
  type RiskField,
  type RiskScenario,
  type ScenarioAnswer,
  type ScenarioFieldResult,
  type ScenarioOption,
  type ScenarioResult,
} from '../types';

// ---------------------------------------------------------------------------
// Risk-assessment scenario grading.
//
// Pure functions over scenario data, mirroring the simulation engine: same
// inputs always produce the same result, so scenarios are testable and
// reproducible.
// ---------------------------------------------------------------------------

/** The option that correctly answers a field, if the scenario defines one. */
export function correctOptionFor(
  scenario: RiskScenario,
  field: RiskField
): ScenarioOption | undefined {
  return scenario.options.find((o) => o.correctFor === field);
}

/** Options a learner may choose from — the whole shared pool, in stable order. */
export function optionPool(scenario: RiskScenario): ScenarioOption[] {
  return scenario.options;
}

/**
 * Fields this scenario actually asks about. A scenario is not required to
 * exercise all six, though the Phase 2 set does.
 */
export function fieldsAsked(scenario: RiskScenario): RiskField[] {
  return RISK_FIELD_ORDER.filter((f) => scenario.options.some((o) => o.correctFor === f));
}

export function gradeScenario(scenario: RiskScenario, answer: ScenarioAnswer): ScenarioResult {
  const fields: ScenarioFieldResult[] = fieldsAsked(scenario).map((field) => {
    const correctOption = correctOptionFor(scenario, field);
    const chosenOptionId = answer[field];
    const correct = chosenOptionId !== undefined && chosenOptionId === correctOption?.id;

    // Explain the learner's own choice when they got it wrong — telling them
    // only the right answer skips the misconception that produced the error.
    const chosen = scenario.options.find((o) => o.id === chosenOptionId);
    const rationale = correct
      ? (correctOption?.rationale ?? '')
      : chosen
        ? `${chosen.rationale} The correct answer is "${correctOption?.text}" — ${correctOption?.rationale}`
        : `Not answered. The correct answer is "${correctOption?.text}" — ${correctOption?.rationale}`;

    return {
      field,
      chosenOptionId,
      correctOptionId: correctOption?.id ?? '',
      correct,
      rationale,
    };
  });

  const correctCount = fields.filter((f) => f.correct).length;
  const total = fields.length;

  return {
    scenarioId: scenario.id,
    fields,
    correctCount,
    total,
    percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
  };
}

/** True once every asked field has a selection. */
export function isComplete(scenario: RiskScenario, answer: ScenarioAnswer): boolean {
  return fieldsAsked(scenario).every((f) => answer[f] !== undefined);
}

/**
 * Options already assigned to another field. The pool is shared, so placing an
 * option in one slot removes it from the others — that constraint is what
 * forces the threat/vulnerability distinction rather than allowing six
 * independent guesses.
 */
export function assignedElsewhere(answer: ScenarioAnswer, field: RiskField): Set<string> {
  const taken = new Set<string>();
  for (const [key, value] of Object.entries(answer)) {
    if (key !== field && value) taken.add(value);
  }
  return taken;
}

/** Assign an option to a field, clearing it from whichever field held it. */
export function assign(
  answer: ScenarioAnswer,
  field: RiskField,
  optionId: string | undefined
): ScenarioAnswer {
  const next: ScenarioAnswer = { ...answer };

  if (optionId === undefined) {
    delete next[field];
    return next;
  }

  for (const key of Object.keys(next) as RiskField[]) {
    if (next[key] === optionId) delete next[key];
  }
  next[field] = optionId;
  return next;
}
