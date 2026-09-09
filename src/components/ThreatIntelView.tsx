import { useMemo, useState } from 'react';
import {
  ACTOR_TYPES,
  ATTACK_MAPPING,
  CREDIBILITY_LABELS,
  INDICATORS,
  INTEL_LIFECYCLE,
  PYRAMID_TIERS,
  RELIABILITY_LABELS,
  STIX_OBJECT_TYPES,
  type IndicatorKind,
  type PyramidTier,
} from '../data/threatIntel';
import {
  actionability,
  admiraltyRating,
  confidenceScore,
  gradeAttackMapping,
  gradeFeedTriage,
  gradeIndicatorKinds,
  gradePyramid,
  rankFeedItems,
  tacticsCovered,
  type Actionability,
} from '../lib/intelEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'lifecycle' | 'indicators' | 'pyramid' | 'attack' | 'actors' | 'feeds';

const STEP_LABELS: Record<Step, string> = {
  lifecycle: '1. Lifecycle',
  indicators: '2. IOC vs IOA',
  pyramid: '3. Pyramid of Pain',
  attack: '4. ATT&CK map',
  actors: '5. Threat actors',
  feeds: '6. Feed triage',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const ACTION_LABELS: Record<Actionability, string> = {
  act: 'Act on it',
  corroborate: 'Corroborate first',
  disregard: 'Disregard',
};

const ACTIONS = Object.keys(ACTION_LABELS) as Actionability[];

export function ThreatIntelView() {
  const [step, setStep] = useState<Step>('lifecycle');

  const [kinds, setKinds] = useState<Record<string, IndicatorKind>>({});
  const [kindsSubmitted, setKindsSubmitted] = useState(false);

  const [tiers, setTiers] = useState<Record<string, PyramidTier>>({});
  const [tiersSubmitted, setTiersSubmitted] = useState(false);

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappingSubmitted, setMappingSubmitted] = useState(false);

  const [verdicts, setVerdicts] = useState<Record<string, Actionability>>({});
  const [verdictsSubmitted, setVerdictsSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const kindResult = useMemo(
    () => (kindsSubmitted ? gradeIndicatorKinds(kinds) : null),
    [kinds, kindsSubmitted]
  );
  const pyramidResult = useMemo(
    () => (tiersSubmitted ? gradePyramid(tiers) : null),
    [tiers, tiersSubmitted]
  );
  const attackResult = useMemo(
    () => (mappingSubmitted ? gradeAttackMapping(mapping) : null),
    [mapping, mappingSubmitted]
  );
  const feedResult = useMemo(
    () => (verdictsSubmitted ? gradeFeedTriage(verdicts) : null),
    [verdicts, verdictsSubmitted]
  );

  const rankedFeed = useMemo(() => rankFeedItems(), []);

  const submitKinds = () => {
    setKindsSubmitted(true);
    const graded = gradeIndicatorKinds(kinds);
    recordOutcome('ioc-vs-ioa', graded.correctCount === graded.total);
  };

  const submitTiers = () => {
    setTiersSubmitted(true);
    const graded = gradePyramid(tiers);
    recordOutcome('pyramid-of-pain', graded.correctCount === graded.total);
  };

  const submitMapping = () => {
    setMappingSubmitted(true);
    const graded = gradeAttackMapping(mapping);
    recordOutcome('mitre-attack', graded.correctCount === graded.total);
  };

  const submitVerdicts = () => {
    setVerdictsSubmitted(true);
    const graded = gradeFeedTriage(verdicts);
    recordOutcome('intel-sourcing', graded.correctCount === graded.total);
    // Over-trusting a weak source is the failure this exercise exists to catch.
    recordOutcome('source-reliability', graded.overTrusted.length === 0);
  };

  return (
    <>
      <PageHeader
        title="Threat Intelligence"
        subtitle="Turn the artifacts left by IR-2026-0908-01 into intelligence: classify the indicators, rank them by what they cost the attacker, map the incident to ATT&CK, and triage a feed."
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

      {/* ----------------------------- 1. Lifecycle ---------------------------- */}
      {step === 'lifecycle' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              The intelligence lifecycle
            </h2>
            <p className="mt-1 text-xs text-muted">
              Six phases, and a loop rather than a line. Each row shows the question the phase
              answers and the way it is usually failed.
            </p>
            <ol className="mt-3 space-y-3" data-testid="intel-lifecycle">
              {INTEL_LIFECYCLE.map((phase, i) => (
                <li key={phase.id} className="text-sm">
                  <span className="mr-2 font-mono text-xs text-accent">{i + 1}</span>
                  <span className="text-white">{phase.name}</span>
                  <span className="block pl-6 text-xs text-muted">{phase.question}</span>
                  <span className="block pl-6 text-xs text-warn">{phase.failureMode}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              STIX and TAXII
            </h2>
            <p className="mt-2 text-sm text-white">
              <span className="font-semibold">STIX</span> is the language — structured objects and
              the relationships between them. <span className="font-semibold">TAXII</span> is the
              transport that moves STIX between parties. Conflating them is the standard mistake.
            </p>
            <ul className="mt-3 space-y-2 text-xs" data-testid="stix-objects">
              {STIX_OBJECT_TYPES.map((o) => (
                <li key={o.type}>
                  <span className="font-mono text-accent">{o.type}</span>
                  <span className="block text-muted">{o.purpose}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* ---------------------------- 2. IOC vs IOA ---------------------------- */}
      {step === 'indicators' && (
        <>
          <Card className="mb-4 border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Compromise or attack?
            </h2>
            <p className="mt-2 text-sm text-white">
              An <span className="font-semibold">indicator of compromise</span> is evidence
              something <em>has</em> happened — an artifact you match against. An{' '}
              <span className="font-semibold">indicator of attack</span> is evidence something{' '}
              <em>is</em> happening — a behaviour, a sequence, an intent. IOCs are how you confirm.
              IOAs are how you catch the next one.
            </p>
          </Card>

          {kindResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Classified</div>
                  <div className="text-3xl font-bold text-white" data-testid="indicator-score">
                    {kindResult.correctCount}/{kindResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={kindResult.percentage} label="Correct" />
                </div>
              </div>
              {kindResult.ioaCalledIoc.length > 0 && (
                <p className="mt-3 text-sm text-warn" data-testid="ioa-called-ioc">
                  Called behaviours artifacts: {kindResult.ioaCalledIoc.length}. That is the costly
                  direction — it turns a durable detection into a blocklist entry.
                </p>
              )}
            </Card>
          )}

          <div className="space-y-3">
            {INDICATORS.map((indicator) => {
              const chosen = kinds[indicator.id];
              let tone = 'border-border';
              if (kindsSubmitted) {
                tone = chosen === indicator.kind ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={indicator.id} className={tone}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">{indicator.value}</p>
                      <p className="mt-0.5 text-xs text-muted">{indicator.source}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {(['ioc', 'ioa'] as IndicatorKind[]).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          disabled={kindsSubmitted}
                          aria-label={`${kind.toUpperCase()}: ${indicator.value}`}
                          onClick={() => setKinds((c) => ({ ...c, [indicator.id]: kind }))}
                          className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors disabled:cursor-not-allowed ${
                            chosen === kind
                              ? 'border-accent bg-accent/10 text-white'
                              : 'border-border bg-panel-2 text-muted hover:text-white'
                          }`}
                        >
                          {kind}
                        </button>
                      ))}
                    </div>
                  </div>

                  {kindsSubmitted && (
                    <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                      <span className="font-semibold uppercase text-white">
                        {indicator.kind}
                      </span>{' '}
                      — {indicator.rationale}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!kindsSubmitted ? (
              <Button onClick={submitKinds} disabled={Object.keys(kinds).length === 0}>
                Submit classification
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setKinds({});
                  setKindsSubmitted(false);
                }}
              >
                Retry classification
              </Button>
            )}
          </div>
        </>
      )}

      {/* --------------------------- 3. Pyramid of Pain ------------------------ */}
      {step === 'pyramid' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              The Pyramid of Pain
            </h2>
            <p className="mt-1 text-xs text-muted">
              Not all indicators are worth the same. The question is never "can I detect this" but
              "what does it cost the attacker when I do".
            </p>
            <ol className="mt-3 space-y-2" data-testid="pyramid-tiers">
              {[...PYRAMID_TIERS].reverse().map((tier) => (
                <li key={tier.id} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 text-xs uppercase tracking-wider text-accent">
                    {tier.painToAttacker}
                  </span>
                  <div>
                    <span className="text-white">{tier.name}</span>
                    <span className="block text-xs text-muted">{tier.evasionCost}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {pyramidResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Placed correctly</div>
                  <div className="text-3xl font-bold text-white" data-testid="pyramid-score">
                    {pyramidResult.correctCount}/{pyramidResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={pyramidResult.percentage} label="Correct" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted" data-testid="pyramid-rank-compare">
                Your placements total {pyramidResult.chosenRankTotal} rank points against a true
                total of {pyramidResult.actualRankTotal}. Placing everything near the apex inflates
                this without improving accuracy.
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {INDICATORS.map((indicator) => {
              const chosen = tiers[indicator.id];
              let tone = 'border-border';
              if (tiersSubmitted) {
                tone = chosen === indicator.tier ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={indicator.id} className={tone}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm text-white">{indicator.value}</p>
                    <select
                      aria-label={`Tier for: ${indicator.value}`}
                      disabled={tiersSubmitted}
                      value={chosen ?? ''}
                      onChange={(e) =>
                        setTiers((c) => ({ ...c, [indicator.id]: e.target.value as PyramidTier }))
                      }
                      className="shrink-0 rounded-md border border-border bg-panel-2 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed"
                    >
                      <option value="">Choose a tier…</option>
                      {PYRAMID_TIERS.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {tiersSubmitted && (
                    <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                      {indicator.rationale}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!tiersSubmitted ? (
              <Button onClick={submitTiers} disabled={Object.keys(tiers).length === 0}>
                Submit placements
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setTiers({});
                  setTiersSubmitted(false);
                }}
              >
                Retry placements
              </Button>
            )}
          </div>
        </>
      )}

      {/* ----------------------------- 4. ATT&CK map --------------------------- */}
      {step === 'attack' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Map the incident to ATT&amp;CK
            </h2>
            <p className="mt-1 text-xs text-muted">
              ATT&amp;CK is a catalogue of technique, not a scoring system. Its value is that it
              gives two teams a shared name for the same behaviour — and shows you which stages of
              an intrusion you cannot currently see.
            </p>
            <p className="mt-3 text-xs text-muted" data-testid="attack-tactics">
              Tactics touched by this incident: {tacticsCovered().join(', ')}
            </p>
          </Card>

          {attackResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Mapped correctly</div>
                  <div className="text-3xl font-bold text-white" data-testid="attack-score">
                    {attackResult.correctCount}/{attackResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={attackResult.percentage} label="Correct" />
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {ATTACK_MAPPING.map((technique) => {
              const chosen = mapping[technique.incidentStage];
              let tone = 'border-border';
              if (mappingSubmitted) {
                tone = chosen === technique.id ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={technique.id} className={tone}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm text-white">{technique.incidentStage}</p>
                    <select
                      aria-label={`Technique for: ${technique.incidentStage}`}
                      disabled={mappingSubmitted}
                      value={chosen ?? ''}
                      onChange={(e) =>
                        setMapping((c) => ({ ...c, [technique.incidentStage]: e.target.value }))
                      }
                      className="shrink-0 rounded-md border border-border bg-panel-2 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed"
                    >
                      <option value="">Choose a technique…</option>
                      {[...ATTACK_MAPPING]
                        .sort((a, b) => a.id.localeCompare(b.id))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id} — {t.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {mappingSubmitted && (
                    <div className="mt-3 rounded-md border border-border bg-panel-2 p-3">
                      <p className="text-sm text-white">
                        <span className="font-mono text-accent">{technique.id}</span>{' '}
                        {technique.name}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">
                        {technique.tactic}
                      </p>
                      <p className="mt-2 text-sm text-muted">{technique.detectionNote}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!mappingSubmitted ? (
              <Button onClick={submitMapping} disabled={Object.keys(mapping).length === 0}>
                Submit mapping
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setMapping({});
                  setMappingSubmitted(false);
                }}
              >
                Retry mapping
              </Button>
            )}
          </div>
        </>
      )}

      {/* ---------------------------- 5. Threat actors ------------------------- */}
      {step === 'actors' && (
        <>
          <Card className="mb-4 border-warn/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-warn">
              Attribution is the least actionable output
            </h2>
            <p className="mt-2 text-sm text-white">
              Naming the group behind an intrusion changes no control you would deploy. What
              actually changes your decisions is the actor <em>type</em>: their resources, their
              patience, and what they want. A nation-state that waits nine months and organised
              crime that encrypts on day two demand different detection strategies.
            </p>
          </Card>

          <div className="grid gap-3 md:grid-cols-2" data-testid="actor-list">
            {ACTOR_TYPES.map((actor) => (
              <Card key={actor.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{actor.name}</h3>
                  <span className="rounded bg-panel-2 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                    {actor.location}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-xs text-muted">
                  <div>
                    <dt className="inline uppercase tracking-wider">Sophistication: </dt>
                    <dd className="inline text-white">{actor.sophistication}</dd>
                  </div>
                  <div>
                    <dt className="inline uppercase tracking-wider">Resources: </dt>
                    <dd className="inline text-white">{actor.resources}</dd>
                  </div>
                  <div>
                    <dt className="inline uppercase tracking-wider">Motivation: </dt>
                    <dd className="inline text-white">{actor.motivations.join(', ')}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted">{actor.typicalTargets}</p>
                <p className="mt-2 border-l-2 border-accent/50 pl-2 text-xs text-white">
                  {actor.tell}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ----------------------------- 6. Feed triage -------------------------- */}
      {step === 'feeds' && (
        <>
          <Card className="mb-4 border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              The Admiralty Code
            </h2>
            <p className="mt-2 text-sm text-white">
              Two independent judgements, never collapsed into one: how reliable is the{' '}
              <span className="font-semibold">source</span> (A–F), and how credible is this
              particular <span className="font-semibold">claim</span> (1–6). A usually-reliable
              source can still report something doubtful, and an unreliable source occasionally
              tells the truth.
            </p>
            <p className="mt-3 text-xs text-muted">
              Relevance is checked first and separately: a confirmed report from a perfect source
              about a product you do not run is still not actionable here.
            </p>
          </Card>

          {feedResult && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Triaged</div>
                  <div className="text-3xl font-bold text-white" data-testid="feed-score">
                    {feedResult.correctCount}/{feedResult.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={feedResult.percentage} label="Correct" />
                </div>
              </div>
              {feedResult.overTrusted.length > 0 && (
                <p className="mt-3 text-sm text-danger" data-testid="feed-overtrusted">
                  Over-trusted {feedResult.overTrusted.length}. Acting on weakly sourced claims is
                  how a feed becomes a false-positive generator.
                </p>
              )}
              {feedResult.underTrusted.length > 0 && (
                <p className="mt-2 text-sm text-warn" data-testid="feed-undertrusted">
                  Under-trusted {feedResult.underTrusted.length}. Discarding good intelligence has a
                  cost too; it is just a quieter one.
                </p>
              )}
            </Card>
          )}

          <div className="space-y-3">
            {rankedFeed.map((item) => {
              const chosen = verdicts[item.id];
              const actual = actionability(item);
              let tone = 'border-border';
              if (verdictsSubmitted) {
                tone = chosen === actual ? 'border-ok/50' : 'border-danger/50';
              }

              return (
                <Card key={item.id} className={tone}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">{item.headline}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.sourceName} · {item.sourceType} · {item.ageDays}d old
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="font-mono text-accent">{admiraltyRating(item)}</span>{' '}
                        <span className="text-muted">
                          {RELIABILITY_LABELS[item.reliability]} ·{' '}
                          {CREDIBILITY_LABELS[item.credibility]}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {ACTIONS.map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={verdictsSubmitted}
                          aria-label={`${ACTION_LABELS[action]}: ${item.headline}`}
                          onClick={() => setVerdicts((c) => ({ ...c, [item.id]: action }))}
                          className={`rounded-md border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed ${
                            chosen === action
                              ? 'border-accent bg-accent/10 text-white'
                              : 'border-border bg-panel-2 text-muted hover:text-white'
                          }`}
                        >
                          {ACTION_LABELS[action]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {verdictsSubmitted && (
                    <div className="mt-3 rounded-md border border-border bg-panel-2 p-3">
                      <p className="text-sm text-white">
                        {ACTION_LABELS[actual]} — confidence {confidenceScore(item)}/10
                        {!item.relevantToEstate && ', and not relevant to this estate'}
                      </p>
                      <p className="mt-1 text-sm text-muted">{item.note}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!verdictsSubmitted ? (
              <Button onClick={submitVerdicts} disabled={Object.keys(verdicts).length === 0}>
                Submit triage
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setVerdicts({});
                  setVerdictsSubmitted(false);
                }}
              >
                Retry triage
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
