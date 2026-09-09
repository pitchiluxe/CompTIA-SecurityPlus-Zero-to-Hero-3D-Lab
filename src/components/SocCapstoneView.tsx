import { useMemo, useState } from 'react';
import { getIncident, ORDER_OF_VOLATILITY } from '../data/incidents';
import { CAPSTONE_ALERTS } from '../data/capstoneAlerts';
import {
  gradeAssets,
  gradeContainment,
  gradeTimeline,
  shuffledTimeline,
} from '../lib/irEngine';
import {
  gradeTriage,
  isTriageComplete,
  type TriageAnswer,
  type TriageDecision,
} from '../lib/triageEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step =
  | 'detect'
  | 'triage'
  | 'investigate'
  | 'evidence'
  | 'contain'
  | 'remediate'
  | 'recover'
  | 'document';

const STEP_LABELS: Record<Step, string> = {
  detect: '1. Detect',
  triage: '2. Triage',
  investigate: '3. Investigate',
  evidence: '4. Collect Evidence',
  contain: '5. Contain',
  remediate: '6. Remediate',
  recover: '7. Recover',
  document: '8. Document',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const incident = getIncident('inc-1')!;

export function SocCapstoneView() {
  const [step, setStep] = useState<Step>('detect');

  const [triageAnswer, setTriageAnswer] = useState<TriageAnswer>({});
  const [triageSubmitted, setTriageSubmitted] = useState(false);

  const [order, setOrder] = useState<number[]>(() => shuffledTimeline(incident, 11));
  const [timelineSubmitted, setTimelineSubmitted] = useState(false);

  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetsSubmitted, setAssetsSubmitted] = useState(false);

  const [containment, setContainment] = useState<string[]>([]);
  const [containmentSubmitted, setContainmentSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const triageResult = useMemo(
    () => (triageSubmitted ? gradeTriage(triageAnswer, CAPSTONE_ALERTS) : null),
    [triageAnswer, triageSubmitted]
  );
  const timelineResult = useMemo(
    () => (timelineSubmitted ? gradeTimeline(incident, order) : null),
    [order, timelineSubmitted]
  );
  const assetResult = useMemo(
    () => (assetsSubmitted ? gradeAssets(incident, selectedAssets) : null),
    [selectedAssets, assetsSubmitted]
  );
  const containmentResult = useMemo(
    () => (containmentSubmitted ? gradeContainment(incident, containment) : null),
    [containment, containmentSubmitted]
  );

  const setTriageDecision = (alertId: string, decision: TriageDecision) => {
    setTriageAnswer((current) => ({
      ...current,
      [alertId]: current[alertId] === decision ? undefined : decision,
    }));
  };

  const submitTriage = () => {
    setTriageSubmitted(true);
    const graded = gradeTriage(triageAnswer, CAPSTONE_ALERTS);
    recordOutcome('alert-correlation', graded.correctCount === graded.total);
  };

  const moveEvent = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const submitTimeline = () => {
    setTimelineSubmitted(true);
    recordOutcome('alert-correlation', gradeTimeline(incident, order).correct);
  };

  const submitAssets = () => {
    setAssetsSubmitted(true);
    const graded = gradeAssets(incident, selectedAssets);
    recordOutcome('shared-credentials', graded.correctCount === graded.total);
  };

  const submitContainment = () => {
    setContainmentSubmitted(true);
    const graded = gradeContainment(incident, containment);
    recordOutcome('ransomware', graded.contained && graded.evidencePreserved);
    recordOutcome('containment', graded.contained && graded.evidencePreserved);
  };

  return (
    <>
      <PageHeader
        title="Full SOC Capstone"
        subtitle={`${incident.reference} — ${incident.title}. Work every stage — detect, triage, investigate, collect evidence, contain, remediate, recover, document — for a second full incident across the whole enterprise topology.`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              s === step
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      {/* ------------------------------ 1. Detect ------------------------------ */}
      {step === 'detect' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-white">{incident.title}</h2>
              <span className="rounded bg-danger/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
                {incident.severity}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted">{incident.reference}</p>
            <p className="mt-3 text-sm leading-relaxed text-white">{incident.summary}</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Enterprise topology
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Internet → perimeter firewall → VPN gateway → file/application servers → identity
              infrastructure → SIEM/EDR. This incident touches every layer.
            </p>
          </Card>
        </div>
      )}

      {/* ------------------------------ 2. Triage ------------------------------ */}
      {step === 'triage' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Triage the alert queue
            </h2>
            <p className="mt-1 text-xs text-muted">
              Four alerts, two real and two noise. Escalate what genuinely warrants investigation;
              close the rest as false positives.
            </p>
          </Card>

          {triageResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Triage score</div>
                  <div className="text-3xl font-bold text-white" data-testid="triage-score">
                    {triageResult.correctCount}/{triageResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={triageResult.percentage} label="Correct" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted" data-testid="triage-error-kinds">
                Missed incidents: {triageResult.missedIncidents} · False escalations:{' '}
                {triageResult.falseEscalations}
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {CAPSTONE_ALERTS.map((alert) => {
              const decision = triageAnswer[alert.id];
              const alertResult = triageResult?.alerts.find((a) => a.alertId === alert.id);

              return (
                <Card
                  key={alert.id}
                  className={
                    alertResult ? (alertResult.correct ? 'border-ok/50' : 'border-danger/50') : ''
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">{alert.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {alert.host} · {alert.user} · {alert.timestamp} · severity {alert.severity}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {(['escalate', 'close-fp'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          disabled={triageSubmitted}
                          onClick={() => setTriageDecision(alert.id, d)}
                          className={`rounded-md border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                            decision === d
                              ? 'border-accent bg-accent/10 text-white'
                              : 'border-border bg-panel-2 text-muted hover:text-white'
                          }`}
                        >
                          {d === 'escalate' ? 'Escalate' : 'Close (false positive)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {alertResult && (
                    <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                      {alertResult.rationale}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!triageSubmitted ? (
              <Button
                onClick={submitTriage}
                disabled={!isTriageComplete(triageAnswer, CAPSTONE_ALERTS)}
              >
                Submit triage
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setTriageAnswer({});
                  setTriageSubmitted(false);
                }}
              >
                Retry triage
              </Button>
            )}
          </div>
        </>
      )}

      {/* --------------------------- 3. Investigate --------------------------- */}
      {step === 'investigate' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Reconstruct the timeline
            </h2>
            <p className="mt-1 text-xs text-muted">
              Eight events from five sources, out of order. No single source saw the whole chain.
            </p>
          </Card>

          {timelineResult && (
            <Card className={`mb-4 ${timelineResult.correct ? 'border-ok/50' : 'border-warn/50'}`}>
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Events in order</div>
                  <div className="text-3xl font-bold text-white" data-testid="timeline-score">
                    {timelineResult.correctPositions}/{timelineResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={timelineResult.percentage} label="Correct positions" />
                </div>
              </div>
            </Card>
          )}

          <ol className="space-y-2" data-testid="timeline-builder">
            {order.map((eventIndex, position) => {
              const event = incident.timeline[eventIndex];
              const inPlace = timelineSubmitted && eventIndex === position;
              const wrong = timelineSubmitted && eventIndex !== position;

              return (
                <li key={eventIndex}>
                  <Card
                    className={inPlace ? 'border-ok/50' : wrong ? 'border-danger/50' : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-center font-mono text-xs text-muted">
                        {position + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white">{event.event}</div>
                        <div className="mt-0.5 text-xs text-muted">
                          {timelineSubmitted && (
                            <span className="mr-2 font-mono text-accent">{event.time}</span>
                          )}
                          {event.source}
                        </div>
                      </div>
                      {!timelineSubmitted && (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            aria-label={`Move up: ${event.event}`}
                            onClick={() => moveEvent(position, -1)}
                            disabled={position === 0}
                            className="rounded border border-border bg-panel-2 px-2 py-1 text-xs text-muted transition-colors hover:text-white disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Move down: ${event.event}`}
                            onClick={() => moveEvent(position, 1)}
                            disabled={position === order.length - 1}
                            className="rounded border border-border bg-panel-2 px-2 py-1 text-xs text-muted transition-colors hover:text-white disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex flex-wrap gap-3">
            {!timelineSubmitted ? (
              <Button onClick={submitTimeline}>Submit timeline</Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setOrder(shuffledTimeline(incident, 11));
                  setTimelineSubmitted(false);
                }}
              >
                Retry timeline
              </Button>
            )}
          </div>
        </>
      )}

      {/* ---------------------------- 4. Evidence ---------------------------- */}
      {step === 'evidence' && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Order of volatility
              </h2>
              <p className="mt-1 text-xs text-muted">
                Collect most volatile first — still true here, up until the ransomware exception
                changes what happens next.
              </p>
              <ol className="mt-3 space-y-2" data-testid="volatility-order">
                {ORDER_OF_VOLATILITY.map((v) => (
                  <li key={v.rank} className="flex gap-3 text-sm">
                    <span className="w-4 shrink-0 font-mono text-xs text-accent">{v.rank}</span>
                    <div>
                      <span className="text-white">{v.source}</span>
                      <span className="block text-xs text-muted">{v.note}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="border-warn/40">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-warn">
                Identify the affected assets
              </h2>
              <p className="mt-2 text-sm text-white">
                Select every asset genuinely involved in this chain before moving to containment —
                scope follows the investigation, not the alert.
              </p>

              {assetResult && (
                <div className="mt-3">
                  <ProgressBar
                    percent={assetResult.percentage}
                    label={`Scoping accuracy — ${assetResult.correctCount}/${assetResult.total}`}
                  />
                  {assetResult.missed.length > 0 && (
                    <p className="mt-2 text-sm text-danger" data-testid="assets-missed">
                      Missed: {assetResult.missed.join(', ')}
                    </p>
                  )}
                  {assetResult.falselyIncluded.length > 0 && (
                    <p className="mt-2 text-sm text-warn" data-testid="assets-false">
                      Not involved: {assetResult.falselyIncluded.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-4 space-y-3">
            {incident.affectedAssets.map((asset) => {
              const chosen = selectedAssets.includes(asset.name);
              const isCorrect = asset.confirmed;

              let tone = 'border-border';
              if (assetsSubmitted) {
                tone = chosen === isCorrect ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={asset.name} className={tone}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-sm text-white">{asset.name}</span>
                      <span className="block text-xs text-muted">{asset.role}</span>
                    </div>
                    <button
                      type="button"
                      disabled={assetsSubmitted}
                      aria-label={`Include ${asset.name}`}
                      onClick={() =>
                        setSelectedAssets((current) =>
                          chosen
                            ? current.filter((n) => n !== asset.name)
                            : [...current, asset.name]
                        )
                      }
                      className={`shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${
                        chosen
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-border bg-panel-2 text-muted hover:text-white'
                      }`}
                    >
                      {chosen ? 'In scope' : 'Include'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!assetsSubmitted ? (
              <Button onClick={submitAssets} disabled={selectedAssets.length === 0}>
                Submit scope
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAssets([]);
                  setAssetsSubmitted(false);
                }}
              >
                Retry scoping
              </Button>
            )}
          </div>
        </>
      )}

      {/* ------------------------------ 5. Contain ------------------------------ */}
      {step === 'contain' && (
        <>
          <Card className="mb-4 border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              The ransomware exception
            </h2>
            <p className="mt-2 text-sm text-white">
              Isolate first here, capture whatever evidence remains after. Active encryption and
              lateral spread continue for every minute containment is delayed — the opposite order
              from a single, static, already-contained host.
            </p>
          </Card>

          {containmentResult && (
            <Card className="mb-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-md border p-3 ${
                    containmentResult.contained
                      ? 'border-ok/40 bg-ok/5'
                      : 'border-danger/50 bg-danger/10'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Attacker stopped
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      containmentResult.contained ? 'text-ok' : 'text-danger'
                    }`}
                    data-testid="contained"
                  >
                    {containmentResult.contained ? 'Yes' : 'No'}
                  </div>
                </div>

                <div
                  className={`rounded-md border p-3 ${
                    containmentResult.evidencePreserved
                      ? 'border-ok/40 bg-ok/5'
                      : 'border-danger/50 bg-danger/10'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Evidence preserved
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      containmentResult.evidencePreserved ? 'text-ok' : 'text-danger'
                    }`}
                    data-testid="evidence-preserved"
                  >
                    {containmentResult.evidencePreserved ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ProgressBar
                  percent={containmentResult.percentage}
                  label={`Decisions correct — ${containmentResult.correctCount}/${containmentResult.total}`}
                />
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {incident.containmentOptions.map((option) => {
              const chosen = containment.includes(option.id);

              let tone = 'border-border';
              if (containmentSubmitted) {
                tone = chosen === option.recommended ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={option.id} className={tone}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm text-white">{option.action}</p>
                    <button
                      type="button"
                      disabled={containmentSubmitted}
                      aria-label={`Select: ${option.action}`}
                      onClick={() =>
                        setContainment((current) =>
                          chosen
                            ? current.filter((id) => id !== option.id)
                            : [...current, option.id]
                        )
                      }
                      className={`shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${
                        chosen
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-border bg-panel-2 text-muted hover:text-white'
                      }`}
                    >
                      {chosen ? 'Selected' : 'Select'}
                    </button>
                  </div>

                  {containmentSubmitted && (
                    <>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        <span className={option.stopsAttacker ? 'text-ok' : 'text-muted'}>
                          {option.stopsAttacker ? '✓' : '✕'} stops the attacker
                        </span>
                        <span className={option.preservesEvidence ? 'text-ok' : 'text-danger'}>
                          {option.preservesEvidence ? '✓' : '✕'} preserves evidence
                        </span>
                      </div>
                      <p className="mt-2 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                        {option.rationale}
                      </p>
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!containmentSubmitted ? (
              <Button onClick={submitContainment} disabled={containment.length === 0}>
                Submit containment plan
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setContainment([]);
                  setContainmentSubmitted(false);
                }}
              >
                Retry containment
              </Button>
            )}
          </div>
        </>
      )}

      {/* ---------------------------- 6. Remediate ---------------------------- */}
      {step === 'remediate' && (
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Eradication
          </h2>
          <p className="mt-1 text-xs text-muted">
            Removing the attacker and the shared-credential root cause that let them spread.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white" data-testid="eradication-steps">
            {incident.eradicationSteps.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* ------------------------------ 7. Recover ------------------------------ */}
      {step === 'recover' && (
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Recovery</h2>
          <p className="mt-1 text-xs text-muted">
            Restoring verified-clean business function, not just removing the ransomware process.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white" data-testid="recovery-steps">
            {incident.recoverySteps.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* ----------------------------- 8. Document ----------------------------- */}
      {step === 'document' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Lessons learned
            </h2>
            <p className="mt-1 text-xs text-muted">
              Blameless. Every item below is a control gap, not a person's mistake.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white" data-testid="lessons-learned">
              {incident.lessonsLearned.map((l) => (
                <li key={l}>· {l}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              The one change that mattered most
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white" data-testid="key-lesson">
              {incident.keyLesson}
            </p>
          </Card>
        </>
      )}
    </>
  );
}
