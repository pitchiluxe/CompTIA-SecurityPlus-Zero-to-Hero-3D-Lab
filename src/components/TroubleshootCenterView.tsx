import { useState } from 'react';
import { TROUBLESHOOT_SCENARIOS, type TroubleshootScenario } from '../data/troubleshootScenarios';
import {
  SOCRATIC_PROMPTS,
  TROUBLESHOOT_FIELD_LABELS,
  TROUBLESHOOT_FIELD_PROMPTS,
  gradeDiagnosis,
  isDiagnosisComplete,
  type TroubleshootDiagnosis,
} from '../lib/troubleshootCenterEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { useQuizStore } from '../store/useQuizStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type EvidenceTab =
  | 'network'
  | 'devices'
  | 'logs'
  | 'alerts'
  | 'user'
  | 'process'
  | 'timeline'
  | 'changes';

const EVIDENCE_TABS: { id: EvidenceTab; label: string }[] = [
  { id: 'network', label: 'Network Diagram' },
  { id: 'devices', label: 'Device Status' },
  { id: 'logs', label: 'Logs' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'user', label: 'User Information' },
  { id: 'process', label: 'Process Information' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'changes', label: 'Change History' },
];

function EvidencePanel({ scenario, tab }: { scenario: TroubleshootScenario; tab: EvidenceTab }) {
  if (tab === 'network') {
    return <pre className="whitespace-pre-wrap font-mono text-xs text-white">{scenario.networkDiagram}</pre>;
  }
  if (tab === 'devices') {
    return (
      <ul className="space-y-2">
        {scenario.deviceStatus.map((d) => (
          <li key={d.device} className="text-sm">
            <span
              className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                d.status === 'alert'
                  ? 'bg-danger/15 text-danger'
                  : d.status === 'warning'
                    ? 'bg-warn/15 text-warn'
                    : 'bg-ok/15 text-ok'
              }`}
            >
              {d.status}
            </span>
            <span className="font-medium text-white">{d.device}</span>
            <span className="block pl-1 text-xs text-muted">{d.detail}</span>
          </li>
        ))}
      </ul>
    );
  }

  const lines =
    tab === 'logs'
      ? scenario.logs
      : tab === 'alerts'
        ? scenario.alerts
        : tab === 'user'
          ? scenario.userInfo
          : tab === 'process'
            ? scenario.processInfo
            : tab === 'timeline'
              ? scenario.timeline
              : scenario.changeHistory;

  return (
    <ul className="space-y-1.5 text-sm text-white">
      {lines.map((line, i) => (
        <li key={i}>· {line}</li>
      ))}
    </ul>
  );
}

export function TroubleshootCenterView() {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<EvidenceTab>('network');
  const [diagnosis, setDiagnosis] = useState<TroubleshootDiagnosis>({});
  const [submitted, setSubmitted] = useState(false);
  /** How many progressive hints the learner has asked for on this scenario. */
  const [hintsShown, setHintsShown] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const recordAttempt = useQuizStore((s) => s.record);

  const scenario = TROUBLESHOOT_SCENARIOS[index];
  const result = submitted ? gradeDiagnosis(scenario, diagnosis) : null;
  const complete = isDiagnosisComplete(diagnosis);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeDiagnosis(scenario, diagnosis);
    const allCorrect = graded.correctCount === graded.total;
    for (const conceptId of scenario.conceptIds) recordOutcome(conceptId, allCorrect);

    recordAttempt({
      kind: 'troubleshoot',
      subjectId: scenario.id,
      total: graded.total,
      correct: graded.correctCount,
      pbqTotal: 0,
      pbqCorrect: 0,
      durationMs: Date.now() - startedAt,
    });
  };

  const goTo = (next: number) => {
    setIndex(next);
    setTab('network');
    setDiagnosis({});
    setSubmitted(false);
    setHintsShown(0);
    setStartedAt(Date.now());
  };

  const fieldResult = (field: 'rootCause' | 'action') =>
    result?.fields.find((f) => f.field === field);

  return (
    <>
      <PageHeader
        title="Security Troubleshooting Center"
        subtitle="Ten realistic alerts. Work every investigation panel — network diagram, device status, logs, alerts, user, process, timeline, change history — before diagnosing a root cause and a recommended action."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TROUBLESHOOT_SCENARIOS.map((s, i) => (
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
            {s.number}. {s.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-white">{scenario.title}</h2>
            <span className="rounded bg-panel-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {scenario.category}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{scenario.alertSummary}</p>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Work it like an analyst
          </h2>
          <p className="mt-1 text-xs text-muted">
            Answer these to yourself before choosing an option. The answer is never revealed up
            front, and the hints below narrow the search without giving it away.
          </p>
          <ol
            className="mt-3 list-decimal space-y-1 pl-4 text-xs text-muted"
            data-testid="socratic-prompts"
          >
            {SOCRATIC_PROMPTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Progressive hints
          </h2>
          <span className="text-xs text-muted">
            {hintsShown} of {scenario.hints.length} used
          </span>
        </div>

        {hintsShown === 0 ? (
          <p className="mt-1 text-xs text-muted">
            Try the panels first. Each hint narrows where to look; none of them names the root
            cause.
          </p>
        ) : (
          <ol className="mt-3 space-y-2" data-testid="revealed-hints">
            {scenario.hints.slice(0, hintsShown).map((h, i) => (
              <li
                key={h}
                className="rounded-md border border-accent/30 bg-accent/5 p-3 text-sm text-white"
              >
                <span className="mr-2 font-mono text-xs text-accent">Hint {i + 1}</span>
                {h}
              </li>
            ))}
          </ol>
        )}

        {hintsShown < scenario.hints.length && (
          <div className="mt-3">
            <Button variant="ghost" onClick={() => setHintsShown((n) => n + 1)}>
              {hintsShown === 0 ? 'I am stuck — give me a hint' : 'Next hint'}
            </Button>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap gap-1.5" data-testid="evidence-tabs">
          {EVIDENCE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                tab === t.id
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-border bg-panel-2 text-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-4" data-testid="evidence-panel">
          <EvidencePanel scenario={scenario} tab={tab} />
        </div>
      </Card>

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
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Hints used</div>
              <div className="text-xl font-semibold text-white" data-testid="hints-used">
                {hintsShown}/{scenario.hints.length}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-3">
            <div className="text-xs uppercase tracking-wider text-accent">Debrief</div>
            <p className="mt-1 text-sm text-white">{scenario.debrief}</p>
          </div>
        </Card>
      )}

      {/* -------------------- Root cause and action -------------------- */}
      {(['rootCause', 'action'] as const).map((field) => {
        const options = field === 'rootCause' ? scenario.rootCauseOptions : scenario.actionOptions;
        const fr = fieldResult(field);

        return (
          <Card
            key={field}
            className={`mt-4 ${fr ? (fr.correct ? 'border-ok/60' : 'border-danger/60') : ''}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {TROUBLESHOOT_FIELD_LABELS[field]}
              </h3>
              {fr && (
                <span className={`text-xs font-semibold ${fr.correct ? 'text-ok' : 'text-danger'}`}>
                  {fr.correct ? 'Correct' : 'Incorrect'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{TROUBLESHOOT_FIELD_PROMPTS[field]}</p>

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
                      aria-label={`${TROUBLESHOOT_FIELD_LABELS[field]}: ${o.text}`}
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
              {[diagnosis.rootCause, diagnosis.action].filter(Boolean).length} of 2 parts answered
            </span>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => goTo(index)}>
              Retry this scenario
            </Button>
            {index < TROUBLESHOOT_SCENARIOS.length - 1 && (
              <Button onClick={() => goTo(index + 1)}>Next scenario</Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
