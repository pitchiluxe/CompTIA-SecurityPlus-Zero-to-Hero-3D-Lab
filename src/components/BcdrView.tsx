import { useMemo, useState } from 'react';
import {
  METRIC_SCENARIOS,
  SITE_SCENARIOS,
  BCDR_GAP_FINDINGS,
  gradeMetricClassification,
  gradeSiteSelection,
  gradeBcdrGaps,
  type RecoveryMetric,
  type SiteType,
} from '../lib/bcdrEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'metrics' | 'sites' | 'gaps' | 'knowledge' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  metrics: '1. Recovery Metrics',
  sites: '2. Alternate Site Selection',
  gaps: '3. BC/DR Gap Audit',
  knowledge: '4. Disaster Scenario Knowledge Check',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const METRIC_LABELS: Record<RecoveryMetric, string> = {
  rto: 'RTO',
  rpo: 'RPO',
  mttr: 'MTTR',
  mtbf: 'MTBF',
};

const METRICS: RecoveryMetric[] = ['rto', 'rpo', 'mttr', 'mtbf'];

const SITE_LABELS: Record<SiteType, string> = {
  hot: 'Hot Site',
  warm: 'Warm Site',
  cold: 'Cold Site',
  cloud: 'Cloud-Based',
};

const SITE_TYPES: SiteType[] = ['hot', 'warm', 'cold', 'cloud'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function BcdrView() {
  const [step, setStep] = useState<Step>('metrics');

  const [metricAnswers, setMetricAnswers] = useState<Record<string, RecoveryMetric>>({});
  const [metricSubmitted, setMetricSubmitted] = useState(false);

  const [siteAnswers, setSiteAnswers] = useState<Record<string, SiteType>>({});
  const [siteSubmitted, setSiteSubmitted] = useState(false);

  const [gapAnswers, setGapAnswers] = useState<Record<string, boolean>>({});
  const [gapsSubmitted, setGapsSubmitted] = useState(false);

  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<string, string>>({});
  const [knowledgeSubmitted, setKnowledgeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const metricResult = useMemo(
    () => (metricSubmitted ? gradeMetricClassification(metricAnswers) : null),
    [metricAnswers, metricSubmitted]
  );
  const siteResult = useMemo(
    () => (siteSubmitted ? gradeSiteSelection(siteAnswers) : null),
    [siteAnswers, siteSubmitted]
  );
  const gapResult = useMemo(
    () => (gapsSubmitted ? gradeBcdrGaps(gapAnswers) : null),
    [gapAnswers, gapsSubmitted]
  );

  const KNOWLEDGE_QUESTIONS = useMemo(
    () => [
      {
        id: 'kq-0',
        stem: 'A company follows the 3-2-1 backup rule. What does this mean?',
        options: [
          '3 copies of data, on 2 different media types, with 1 copy stored offsite',
          '3 offsite copies with no local copy at all',
          '2 copies of data on 1 media type, stored onsite only',
          '1 copy of data, backed up 3 times per day',
        ],
        correct: 0,
        conceptId: 'backup-strategies',
      },
      {
        id: 'kq-1',
        stem: 'What is the key difference between active-active and active-passive high availability?',
        options: [
          'In active-active, all nodes handle live traffic simultaneously; in active-passive, a standby node takes over only after the active node fails',
          'Active-passive nodes always respond faster than active-active nodes',
          'Active-active requires only a single node',
          'There is no meaningful difference between the two',
        ],
        correct: 0,
        conceptId: 'high-availability',
      },
      {
        id: 'kq-2',
        stem: 'Why must an organisation verify backup integrity before restoring from it during a ransomware incident?',
        options: [
          'Backups taken after or during the initial compromise may already be encrypted or otherwise contain the ransomware',
          'Backup verification is only required for cloud-based backups',
          'Ransomware never affects backup systems',
          'Verification is only needed if the backup is more than a year old',
        ],
        correct: 0,
        conceptId: 'disaster-scenarios',
      },
      {
        id: 'kq-3',
        stem: 'What type of BC/DR test involves participants talking through a scenario without executing any actual recovery actions?',
        options: ['Tabletop exercise', 'Full-interruption test', 'Parallel test', 'Live cutover'],
        correct: 0,
        conceptId: 'bcdr-testing',
      },
      {
        id: 'kq-4',
        stem: 'Why is a cloud provider outage a distinct disaster scenario from an organisation\'s own server outage?',
        options: [
          'The organisation has no direct control over the provider\'s recovery timeline and must rely on the provider\'s SLA and its own multi-region/multi-provider contingency',
          'Cloud outages are always resolved instantly',
          'A cloud outage can always be fixed by restarting the local server',
          'Cloud providers never experience outages',
        ],
        correct: 0,
        conceptId: 'disaster-scenarios',
      },
    ],
    []
  );

  const submitMetrics = () => {
    setMetricSubmitted(true);
    const graded = gradeMetricClassification(metricAnswers);
    recordOutcome('rto-rpo', graded.correctCount === graded.total);
  };

  const submitSites = () => {
    setSiteSubmitted(true);
    const graded = gradeSiteSelection(siteAnswers);
    recordOutcome('alternate-sites', graded.correctCount === graded.total);
  };

  const submitGaps = () => {
    setGapsSubmitted(true);
    const graded = gradeBcdrGaps(gapAnswers);
    recordOutcome('backup-strategies', graded.correctCount === graded.total);
  };

  const submitKnowledge = () => {
    setKnowledgeSubmitted(true);
    const correct = KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === KNOWLEDGE_QUESTIONS.length;
    recordOutcome('disaster-scenarios', allCorrect);
    recordOutcome('high-availability', knowledgeAnswers['kq-1'] === '0');
    recordOutcome('bcdr-testing', knowledgeAnswers['kq-3'] === '0');
  };

  const completedSteps = [metricSubmitted, siteSubmitted, gapsSubmitted, knowledgeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Business Continuity & Disaster Recovery"
        subtitle="Phase 18 — Master RTO/RPO/MTTR/MTBF, backup strategies, high availability, alternate site selection, BC/DR testing, and disaster-specific recovery design. Aligned with Security+ SY0-701 Domain 5."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="BC/DR exercises" />
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              step === s ? 'bg-accent text-black' : 'bg-panel-2 text-muted hover:text-white',
            ].join(' ')}
          >
            {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Step 1: Recovery Metrics */}
      {step === 'metrics' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Recovery Metric</h2>
          <p className="mb-4 text-sm text-muted">
            For each statement, select the correct metric: <strong>RTO</strong>, <strong>RPO</strong>, <strong>MTTR</strong>, or <strong>MTBF</strong>.
          </p>

          <div className="space-y-3">
            {METRIC_SCENARIOS.map((s) => {
              const chosen = metricAnswers[s.id];
              const result = metricResult?.results.find((r) => r.scenarioId === s.id);
              return (
                <div
                  key={s.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{s.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {METRICS.map((m) => (
                      <button
                        key={m}
                        onClick={() => !metricSubmitted && setMetricAnswers((prev) => ({ ...prev, [s.id]: m }))}
                        disabled={metricSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === m
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          metricSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {METRIC_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{METRIC_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!metricSubmitted ? (
            <Button
              onClick={submitMetrics}
              disabled={Object.keys(metricAnswers).length < METRIC_SCENARIOS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {metricResult!.correctCount}/{metricResult!.total} ({metricResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                RTO and RPO are business-driven targets; MTTR and MTBF are measured historical averages. Confusing them is one of the exam\'s most common traps.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Alternate Site Selection */}
      {step === 'sites' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Choose the Alternate Site Type</h2>
          <p className="mb-4 text-sm text-muted">
            For each scenario, select the most appropriate site type: <strong>Hot</strong>, <strong>Warm</strong>, <strong>Cold</strong>, or <strong>Cloud-Based</strong>.
          </p>

          <div className="space-y-3">
            {SITE_SCENARIOS.map((s) => {
              const chosen = siteAnswers[s.id];
              const result = siteResult?.results.find((r) => r.scenarioId === s.id);
              return (
                <div
                  key={s.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{s.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {SITE_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => !siteSubmitted && setSiteAnswers((prev) => ({ ...prev, [s.id]: t }))}
                        disabled={siteSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === t
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          siteSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {SITE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{SITE_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!siteSubmitted ? (
            <Button
              onClick={submitSites}
              disabled={Object.keys(siteAnswers).length < SITE_SCENARIOS.length}
            >
              Submit Selection
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {siteResult!.correctCount}/{siteResult!.total} ({siteResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Site selection is a direct trade-off between RTO and cost — match the site to the tightest requirement it must satisfy, not to whichever option seems most impressive.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Gap Audit */}
      {step === 'gaps' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">BC/DR Gap Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">gap</strong> or a <strong className="text-ok">correct practice</strong>?
          </p>

          <div className="space-y-3">
            {BCDR_GAP_FINDINGS.map((f) => {
              const chosen = gapAnswers[f.id];
              const result = gapResult?.results.find((r) => r.findingId === f.id);
              return (
                <div
                  key={f.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase ${SEVERITY_COLORS[f.severity]}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs text-muted">{f.area}</span>
                  </div>
                  <div className="mb-3 text-sm font-medium text-white">{f.description}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !gapsSubmitted && setGapAnswers((prev) => ({ ...prev, [f.id]: true }))}
                      disabled={gapsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === true
                          ? 'bg-danger/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        gapsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Gap
                    </button>
                    <button
                      onClick={() => !gapsSubmitted && setGapAnswers((prev) => ({ ...prev, [f.id]: false }))}
                      disabled={gapsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === false
                          ? 'bg-ok/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        gapsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Correct Practice
                    </button>
                  </div>
                  {result && (
                    <div className={`mt-2 text-xs ${result.isCorrect ? 'text-ok' : 'text-danger'}`}>
                      {result.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!gapsSubmitted ? (
            <Button
              onClick={submitGaps}
              disabled={Object.keys(gapAnswers).length < BCDR_GAP_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {gapResult!.correctCount}/{gapResult!.total} ({gapResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                An untested backup, an expired site contract, and a communication plan that depends on the system it is meant to work around all share the same shape: a control that looks fine on paper and fails exactly when needed.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Knowledge Check */}
      {step === 'knowledge' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Disaster Scenario Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about backups, high availability, ransomware recovery, testing, and cloud outages.
          </p>

          <div className="space-y-4">
            {KNOWLEDGE_QUESTIONS.map((q, qi) => {
              const chosen = knowledgeAnswers[q.id];
              const isCorrect = knowledgeSubmitted && chosen === String(q.correct);
              const isWrong = knowledgeSubmitted && chosen !== String(q.correct);
              return (
                <div
                  key={q.id}
                  className={[
                    'rounded-lg border p-4',
                    isCorrect
                      ? 'border-ok/40 bg-ok/5'
                      : isWrong
                        ? 'border-danger/40 bg-danger/5'
                        : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">
                    {qi + 1}. {q.stem}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => !knowledgeSubmitted && setKnowledgeAnswers((prev) => ({ ...prev, [q.id]: String(oi) }))}
                        disabled={knowledgeSubmitted}
                        className={[
                          'block w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                          chosen === String(oi)
                            ? knowledgeSubmitted
                              ? oi === q.correct
                                ? 'bg-ok/20 text-ok'
                                : 'bg-danger/20 text-danger'
                              : 'bg-accent/20 text-accent'
                            : knowledgeSubmitted && oi === q.correct
                              ? 'bg-ok/10 text-ok'
                              : 'bg-panel text-muted hover:text-white',
                          knowledgeSubmitted ? 'cursor-default' : 'hover:bg-panel-2',
                        ].join(' ')}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!knowledgeSubmitted ? (
            <Button
              onClick={submitKnowledge}
              disabled={Object.keys(knowledgeAnswers).length < KNOWLEDGE_QUESTIONS.length}
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length}/{KNOWLEDGE_QUESTIONS.length}
              </div>
              <p className="mt-1 text-xs text-muted">
                Four disasters can produce the same symptom — "the system is down" — but each demands a different, specific recovery response.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 18 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Recovery Metrics</div>
              <div className="text-xs text-muted">
                {metricResult ? `${metricResult.correctCount}/${metricResult.total} (${metricResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. Alternate Site Selection</div>
              <div className="text-xs text-muted">
                {siteResult ? `${siteResult.correctCount}/${siteResult.total} (${siteResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. BC/DR Gap Audit</div>
              <div className="text-xs text-muted">
                {gapResult ? `${gapResult.correctCount}/${gapResult.total} (${gapResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. Disaster Scenario Knowledge Check</div>
              <div className="text-xs text-muted">
                {knowledgeSubmitted
                  ? `${KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length}/${KNOWLEDGE_QUESTIONS.length}`
                  : 'Not attempted'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
