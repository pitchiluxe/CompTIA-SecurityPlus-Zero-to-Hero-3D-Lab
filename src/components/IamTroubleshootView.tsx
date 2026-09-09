import { useState } from 'react';
import { IDENTITY_LIFECYCLE, type LifecycleStageId } from '../data/identityLifecycle';
import { IAM_INCIDENTS } from '../data/iamIncidents';
import {
  DIAGNOSIS_LABELS,
  DIAGNOSIS_PROMPTS,
  gradeDiagnosis,
  isDiagnosisComplete,
  type Diagnosis,
} from '../lib/troubleshootEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

export function IamTroubleshootView() {
  const [index, setIndex] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({});
  const [submitted, setSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const incident = IAM_INCIDENTS[index];
  const result = submitted ? gradeDiagnosis(incident, diagnosis) : null;
  const complete = isDiagnosisComplete(diagnosis);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeDiagnosis(incident, diagnosis);
    // Credit the concepts only on a fully correct diagnosis — localising the
    // stage but proposing the wrong fix is not a solved incident.
    const allCorrect = graded.correctCount === graded.total;
    for (const conceptId of incident.conceptIds) recordOutcome(conceptId, allCorrect);
  };

  const goTo = (next: number) => {
    setIndex(next);
    setDiagnosis({});
    setSubmitted(false);
  };

  const fieldResult = (field: 'stage' | 'cause' | 'fix') =>
    result?.fields.find((f) => f.field === field);

  return (
    <>
      <PageHeader
        title="IAM Troubleshooting"
        subtitle="Three real identity failures. Localise the failing lifecycle stage first, then the root cause, then the fix — an engineer who cannot localise a fault ends up fixing the wrong layer."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {IAM_INCIDENTS.map((inc, i) => (
          <button
            key={inc.id}
            type="button"
            onClick={() => goTo(i)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              i === index
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {i + 1}. {inc.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-white">{incident.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{incident.symptom}</p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Evidence</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-white">
            {incident.evidence.map((e) => (
              <li key={e}>· {e}</li>
            ))}
          </ul>
        </Card>
      </div>

      {result && (
        <Card className="mt-4">
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Diagnosis</div>
              <div className="text-3xl font-bold text-white" data-testid="diagnosis-score">
                {result.correctCount}/{result.total}
              </div>
            </div>
            <div className="min-w-48 flex-1">
              <ProgressBar percent={result.percentage} label="Correct" />
            </div>
          </div>
          <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-3">
            <div className="text-xs uppercase tracking-wider text-accent">Debrief</div>
            <p className="mt-1 text-sm text-white">{incident.debrief}</p>
          </div>
        </Card>
      )}

      {/* ------------------------- Stage ------------------------- */}
      <Card
        className={`mt-4 ${
          fieldResult('stage')
            ? fieldResult('stage')!.correct
              ? 'border-ok/60'
              : 'border-danger/60'
            : ''
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            {DIAGNOSIS_LABELS.stage}
          </h3>
          {fieldResult('stage') && (
            <span
              className={`text-xs font-semibold ${
                fieldResult('stage')!.correct ? 'text-ok' : 'text-danger'
              }`}
            >
              {fieldResult('stage')!.correct ? 'Correct' : 'Incorrect'}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{DIAGNOSIS_PROMPTS.stage}</p>

        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {IDENTITY_LIFECYCLE.map((s) => {
            const chosen = diagnosis.stage === s.id;
            const isCorrect = s.id === incident.correctStage;

            let style = 'border-border bg-panel-2 text-muted hover:border-accent/60';
            if (chosen) style = 'border-accent bg-accent/10 text-white';
            if (submitted && isCorrect) style = 'border-ok bg-ok/10 text-white';
            if (submitted && chosen && !isCorrect) style = 'border-danger bg-danger/10 text-white';

            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={submitted}
                  aria-label={`Stage: ${s.order}. ${s.title}`}
                  onClick={() =>
                    setDiagnosis((d) => ({
                      ...d,
                      stage: chosen ? undefined : (s.id as LifecycleStageId),
                    }))
                  }
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                >
                  {s.order}. {s.title}
                </button>
              </li>
            );
          })}
        </ul>

        {fieldResult('stage') && (
          <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
            {fieldResult('stage')!.rationale}
          </p>
        )}
      </Card>

      {/* -------------------- Cause and fix -------------------- */}
      {(['cause', 'fix'] as const).map((field) => {
        const options = field === 'cause' ? incident.causeOptions : incident.fixOptions;
        const fr = fieldResult(field);

        return (
          <Card
            key={field}
            className={`mt-4 ${fr ? (fr.correct ? 'border-ok/60' : 'border-danger/60') : ''}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {DIAGNOSIS_LABELS[field]}
              </h3>
              {fr && (
                <span className={`text-xs font-semibold ${fr.correct ? 'text-ok' : 'text-danger'}`}>
                  {fr.correct ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{DIAGNOSIS_PROMPTS[field]}</p>

            <ul className="mt-3 space-y-1.5">
              {options.map((o) => {
                const chosen = diagnosis[field] === o.id;

                let style = 'border-border bg-panel-2 text-muted hover:border-accent/60';
                if (chosen) style = 'border-accent bg-accent/10 text-white';
                if (submitted && o.correct) style = 'border-ok bg-ok/10 text-white';
                if (submitted && chosen && !o.correct)
                  style = 'border-danger bg-danger/10 text-white';

                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      disabled={submitted}
                      aria-label={`${DIAGNOSIS_LABELS[field]}: ${o.text}`}
                      onClick={() =>
                        setDiagnosis((d) => ({ ...d, [field]: chosen ? undefined : o.id }))
                      }
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                    >
                      {o.text}
                    </button>
                  </li>
                );
              })}
            </ul>

            {fr && (
              <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                {fr.rationale}
              </p>
            )}
          </Card>
        );
      })}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <Button onClick={submit} disabled={!complete}>
              Submit diagnosis
            </Button>
            <span className="text-sm text-muted">
              {[diagnosis.stage, diagnosis.cause, diagnosis.fix].filter(Boolean).length} of 3 parts
              answered
            </span>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => goTo(index)}>
              Retry this incident
            </Button>
            {index < IAM_INCIDENTS.length - 1 && (
              <Button onClick={() => goTo(index + 1)}>Next incident</Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
