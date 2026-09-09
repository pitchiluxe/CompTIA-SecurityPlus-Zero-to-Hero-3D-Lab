import { useState } from 'react';
import { RISK_SCENARIOS } from '../data/riskScenarios';
import {
  assign,
  assignedElsewhere,
  fieldsAsked,
  gradeScenario,
  isComplete,
} from '../lib/riskEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { useProgressStore } from '../store/useProgressStore';
import {
  RISK_FIELD_DEFINITIONS,
  RISK_FIELD_LABELS,
  type RiskField,
  type ScenarioAnswer,
} from '../types';
import { Button, Card, PageHeader, ProgressBar } from './ui';

export function ScenarioWorkbench() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<ScenarioAnswer>({});
  const [submitted, setSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);

  const scenario = RISK_SCENARIOS[index];
  const fields = fieldsAsked(scenario);
  const result = submitted ? gradeScenario(scenario, answer) : null;
  const complete = isComplete(scenario, answer);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeScenario(scenario, answer);
    // A scenario is a single reasoning exercise: credit its concepts only when
    // the learner separated every field correctly.
    const allCorrect = graded.correctCount === graded.total;
    for (const conceptId of scenario.conceptIds) recordOutcome(conceptId, allCorrect);
    if (allCorrect) markLessonComplete('phase-2', scenario.id, graded.percentage);
  };

  const goTo = (next: number) => {
    setIndex(next);
    setAnswer({});
    setSubmitted(false);
  };

  return (
    <>
      <PageHeader
        title="Risk Scenario Workbench"
        subtitle="Read the business scenario, then place each item where it belongs. Options are shared across all six fields — assigning one removes it from the others, so you have to decide what each item actually is."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {RISK_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              i === index
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <h2 className="text-base font-semibold text-white">{scenario.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{scenario.business}</p>
      </Card>

      {result && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Score</div>
              <div className="text-3xl font-bold text-white" data-testid="scenario-score">
                {result.correctCount}/{result.total}
              </div>
            </div>
            <div className="min-w-48 flex-1">
              <ProgressBar percent={result.percentage} label="Fields correct" />
            </div>
          </div>
          <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-3">
            <div className="text-xs uppercase tracking-wider text-accent">Debrief</div>
            <p className="mt-1 text-sm text-white">{scenario.debrief}</p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {fields.map((field) => {
          const fieldResult = result?.fields.find((f) => f.field === field);
          const taken = assignedElsewhere(answer, field);
          const chosen = answer[field];

          // Which field currently holds each option, so a learner can see where
          // it went and move it directly rather than having to unassign first.
          const holderOf = (optionId: string) =>
            (Object.keys(answer) as RiskField[]).find((f) => answer[f] === optionId);

          let tone = 'border-border';
          if (fieldResult) tone = fieldResult.correct ? 'border-ok/60' : 'border-danger/60';

          return (
            <Card key={field} className={tone}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  {RISK_FIELD_LABELS[field]}
                </h3>
                {fieldResult && (
                  <span
                    className={`text-xs font-semibold ${
                      fieldResult.correct ? 'text-ok' : 'text-danger'
                    }`}
                  >
                    {fieldResult.correct ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">{RISK_FIELD_DEFINITIONS[field]}</p>

              <ul className="mt-3 space-y-1.5">
                {scenario.options.map((option) => {
                  const isChosen = chosen === option.id;
                  const isTaken = taken.has(option.id);
                  const isCorrectHere = option.correctFor === field;

                  let style = 'border-border bg-panel-2 text-muted hover:border-accent/60';
                  if (isTaken && !isChosen)
                    style = 'border-border/50 bg-panel-2/50 text-muted/60 hover:border-accent/60';
                  if (isChosen) style = 'border-accent bg-accent/10 text-white';
                  if (submitted && isCorrectHere) style = 'border-ok bg-ok/10 text-white';
                  if (submitted && isChosen && !isCorrectHere)
                    style = 'border-danger bg-danger/10 text-white';

                  const holder = isTaken ? holderOf(option.id) : undefined;

                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        disabled={submitted}
                        aria-label={`${RISK_FIELD_LABELS[field]}: ${option.text}`}
                        // Clicking an option held by another field moves it here.
                        // The engine already clears the old slot; blocking the
                        // click would make "this is a threat, not a
                        // vulnerability" corrections impossible to express.
                        onClick={() =>
                          setAnswer((a) => assign(a, field, isChosen ? undefined : option.id))
                        }
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                      >
                        {option.text}
                        {holder && !submitted && (
                          <span className="ml-2 text-[11px] italic text-muted">
                            — currently {RISK_FIELD_LABELS[holder]}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {fieldResult && (
                <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                  {fieldResult.rationale}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <Button onClick={submit} disabled={!complete}>
              Submit assessment
            </Button>
            <span className="text-sm text-muted">
              {Object.keys(answer).length} of {fields.length} fields placed
            </span>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => goTo(index)}>
              Retry this scenario
            </Button>
            {index < RISK_SCENARIOS.length - 1 && (
              <Button onClick={() => goTo(index + 1)}>Next scenario</Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
