import { useMemo, useState } from 'react';
import { INCIDENTS, IR_PHASES, ORDER_OF_VOLATILITY, type Incident } from '../data/incidents';
import { gradeAssets, gradeContainment, gradeTimeline, shuffledTimeline } from '../lib/irEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'open' | 'evidence' | 'timeline' | 'assets' | 'contain' | 'remediate' | 'close';

const STEP_LABELS: Record<Step, string> = {
  open: '1. Open',
  evidence: '2. Evidence',
  timeline: '3. Timeline',
  assets: '4. Assets',
  contain: '5. Contain',
  remediate: '6. Remediate',
  close: '7. Close and report',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

export function IncidentConsoleView() {
  const incident: Incident = INCIDENTS[0];

  const [step, setStep] = useState<Step>('open');
  const [order, setOrder] = useState<number[]>(() => shuffledTimeline(incident));
  const [timelineSubmitted, setTimelineSubmitted] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetsSubmitted, setAssetsSubmitted] = useState(false);
  const [containment, setContainment] = useState<string[]>([]);
  const [containmentSubmitted, setContainmentSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const timelineResult = useMemo(
    () => (timelineSubmitted ? gradeTimeline(incident, order) : null),
    [incident, order, timelineSubmitted]
  );
  const assetResult = useMemo(
    () => (assetsSubmitted ? gradeAssets(incident, selectedAssets) : null),
    [incident, selectedAssets, assetsSubmitted]
  );
  const containmentResult = useMemo(
    () => (containmentSubmitted ? gradeContainment(incident, containment) : null),
    [incident, containment, containmentSubmitted]
  );

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
    recordOutcome('incident-timeline', gradeTimeline(incident, order).correct);
  };

  const submitAssets = () => {
    setAssetsSubmitted(true);
    const graded = gradeAssets(incident, selectedAssets);
    recordOutcome('incident-scoping', graded.correctCount === graded.total);
  };

  const submitContainment = () => {
    setContainmentSubmitted(true);
    const graded = gradeContainment(incident, containment);
    // Both axes must hold: the attacker stopped and the evidence intact.
    recordOutcome('containment', graded.contained && graded.evidencePreserved);
    recordOutcome('evidence-handling', graded.evidencePreserved);
  };

  return (
    <>
      <PageHeader
        title="Incident Console"
        subtitle={`${incident.reference} — ${incident.title}. This is the incident the platform has carried since Phase 0. Work it through to close.`}
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

      {/* ------------------------------- 1. Open ------------------------------- */}
      {step === 'open' && (
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
              The IR lifecycle
            </h3>
            <ol className="mt-3 space-y-2" data-testid="ir-phases">
              {IR_PHASES.map((p, i) => (
                <li key={p.id} className="text-sm">
                  <span className="mr-2 font-mono text-xs text-accent">{i + 1}</span>
                  <span className="text-white">{p.name}</span>
                  <span className="block pl-6 text-xs text-muted">{p.question}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {/* ----------------------------- 2. Evidence ----------------------------- */}
      {step === 'evidence' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Order of volatility
            </h2>
            <p className="mt-1 text-xs text-muted">
              Collect most volatile first. Anything below a source you skip may still be there
              later; anything above it will not.
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
              Why this ordering decides the incident
            </h2>
            <p className="mt-2 text-sm text-white">
              Memory sits at rank 2 and holds the running process, its full command line, and any
              keys or tokens in use. Rebooting the host — the most common instinct — discards all of
              it, and does not remove the attacker, because the persistence re-establishes the
              beacon at startup.
            </p>
            <p className="mt-3 text-sm text-muted">
              Chain of custody applies from the first capture: who collected it, when, from where,
              and every hand it passed through. Evidence with a gap in that record is evidence a
              lawyer can exclude.
            </p>
          </Card>
        </div>
      )}

      {/* ----------------------------- 3. Timeline ----------------------------- */}
      {step === 'timeline' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Reconstruct the timeline
            </h2>
            <p className="mt-1 text-xs text-muted">
              Events from six sources, out of order. Put them in the sequence they occurred. No
              single system saw the whole attack — this is what correlation produces.
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
                  setOrder(shuffledTimeline(incident));
                  setTimelineSubmitted(false);
                }}
              >
                Retry timeline
              </Button>
            )}
          </div>
        </>
      )}

      {/* ------------------------------ 4. Assets ------------------------------ */}
      {step === 'assets' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Identify the affected assets
            </h2>
            <p className="mt-1 text-xs text-muted">
              Select every asset genuinely involved. Scope follows the investigation, not the alert
              — and including assets that were merely nearby inflates the incident.
            </p>
          </Card>

          {assetResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Scoping accuracy
                  </div>
                  <div className="text-3xl font-bold text-white" data-testid="asset-score">
                    {assetResult.correctCount}/{assetResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={assetResult.percentage} label="Correct" />
                </div>
              </div>
              {assetResult.missed.length > 0 && (
                <p className="mt-3 text-sm text-danger" data-testid="assets-missed">
                  Missed: {assetResult.missed.join(', ')}
                </p>
              )}
              {assetResult.falselyIncluded.length > 0 && (
                <p className="mt-2 text-sm text-warn" data-testid="assets-false">
                  Not involved: {assetResult.falselyIncluded.join(', ')}
                </p>
              )}
            </Card>
          )}

          <div className="space-y-3">
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

      {/* ----------------------------- 5. Contain ----------------------------- */}
      {step === 'contain' && (
        <>
          <Card className="mb-4 border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Two axes, not one
            </h2>
            <p className="mt-2 text-sm text-white">
              Every containment action is judged twice: does it stop the attacker, and does it
              preserve the evidence you need to answer what happened? The fastest actions usually
              fail the second test, and that tension is the whole difficulty of containment.
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
                  <p className="mt-1 text-xs text-muted">
                    At least one action must actually cut the attacker's access.
                  </p>
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
                  <p className="mt-1 text-xs text-muted">
                    {containmentResult.evidenceDestroyingActions.length > 0
                      ? `Destroyed by: ${containmentResult.evidenceDestroyingActions
                          .map((a) => a.action)
                          .join('; ')}`
                      : 'No selected action destroys evidence.'}
                  </p>
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
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Eradication
            </h2>
            <p className="mt-1 text-xs text-muted">
              Removing the attacker, including every persistence mechanism on both hosts.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white" data-testid="eradication-steps">
              {incident.eradicationSteps.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Recovery</h2>
            <p className="mt-1 text-xs text-muted">
              Returning to service, and confirming business function rather than only threat
              removal.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white" data-testid="recovery-steps">
              {incident.recoverySteps.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* ------------------------------ 7. Close ------------------------------ */}
      {step === 'close' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Lessons learned
            </h2>
            <p className="mt-1 text-xs text-muted">
              Blameless. Every item below is a control gap, not a person's mistake — and each one is
              a finding from an earlier phase of this platform.
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

          <Card className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Closing this incident
            </h2>
            <p className="mt-2 text-sm text-muted">
              {incident.reference} began at 02:41:58 with a DNS query and was detected at 03:02:10 —
              twenty minutes of uncontested access. It has run through every phase of this platform
              since Phase 0: triaged in Phase 0, explained in Phase 3, investigated in Phase 7,
              found on both hosts in Phases 8 and 9, and closed here.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
