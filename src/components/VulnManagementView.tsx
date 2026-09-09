import { useMemo, useState } from 'react';
import {
  METRIC_LABELS,
  METRIC_NAMES,
  SEVERITY_COLOR,
  baseScore,
  formatVector,
  largestReduction,
  severityOf,
  type CvssVector,
} from '../lib/cvss';
import { VULN_FINDINGS, type FindingVerdict } from '../data/vulnFindings';
import {
  byRawScore,
  byRealPriority,
  countVulnTriaged,
  gradeVulnTriage,
  isVulnTriageComplete,
  prioritisationDelta,
  scoreFinding,
  type VulnAnswer,
} from '../lib/vulnTriage';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Tab = 'calculator' | 'findings' | 'prioritise';

const TAB_LABELS: Record<Tab, string> = {
  calculator: 'CVSS calculator',
  findings: 'Triage the findings',
  prioritise: 'Prioritisation',
};

const METRIC_ORDER: (keyof CvssVector)[] = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'];

const DEFAULT_VECTOR: CvssVector = {
  AV: 'N',
  AC: 'L',
  PR: 'N',
  UI: 'N',
  S: 'U',
  C: 'H',
  I: 'H',
  A: 'H',
};

export function VulnManagementView() {
  const [tab, setTab] = useState<Tab>('calculator');
  const [vector, setVector] = useState<CvssVector>(DEFAULT_VECTOR);
  const [answer, setAnswer] = useState<VulnAnswer>({});
  const [submitted, setSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const score = baseScore(vector);
  const severity = severityOf(score);
  const reduction = useMemo(() => largestReduction(vector), [vector]);
  const result = submitted ? gradeVulnTriage(answer) : null;

  const naive = useMemo(() => byRawScore(), []);
  const real = useMemo(() => byRealPriority(), []);
  const delta = useMemo(() => prioritisationDelta(), []);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeVulnTriage(answer);
    recordOutcome('vulnerability-triage', graded.correctCount === graded.total);
    recordOutcome('false-positives', graded.falseReports === 0);
  };

  return (
    <>
      <PageHeader
        title="Vulnerability Management"
        subtitle="A scanner reports many things. Verify what is real, score it properly, and prioritise by exposure rather than by the number the tool printed."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              t === tab
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ---------------------------- Calculator ---------------------------- */}
      {tab === 'calculator' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Base metrics
            </h2>
            <p className="mt-1 text-xs text-muted">
              This implements the published CVSS v3.1 formula. Change a metric and the score
              recalculates — the same arithmetic the official calculator performs.
            </p>

            <div className="mt-4 space-y-4">
              {METRIC_ORDER.map((metric) => {
                const options = METRIC_LABELS[metric];
                return (
                  <div key={metric}>
                    <div className="text-xs font-medium text-white">
                      {METRIC_NAMES[metric]}{' '}
                      <span className="font-mono text-muted">({metric})</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(Object.keys(options) as (keyof typeof options)[]).map((value) => {
                        const active = vector[metric] === value;
                        return (
                          <button
                            key={String(value)}
                            type="button"
                            aria-label={`${METRIC_NAMES[metric]}: ${options[value]}`}
                            onClick={() =>
                              setVector((v) => ({ ...v, [metric]: value }) as CvssVector)
                            }
                            className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? 'border-accent bg-accent/10 text-white'
                                : 'border-border bg-panel-2 text-muted hover:text-white'
                            }`}
                          >
                            {options[value]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="text-xs uppercase tracking-wider text-muted">Base score</div>
              <div
                className="mt-1 text-5xl font-bold"
                style={{ color: SEVERITY_COLOR[severity] }}
                data-testid="cvss-score"
              >
                {score.toFixed(1)}
              </div>
              <div
                className="mt-1 text-sm font-semibold uppercase tracking-wider"
                style={{ color: SEVERITY_COLOR[severity] }}
                data-testid="cvss-severity"
              >
                {severity}
              </div>
              <code className="mt-4 block break-all rounded bg-soc-bg p-2 font-mono text-[11px] text-muted">
                {formatVector(vector)}
              </code>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Mitigation moves the metrics
              </h3>
              {reduction ? (
                <p className="mt-2 text-sm text-white" data-testid="cvss-reduction">
                  Changing {METRIC_NAMES[reduction.metric]} to{' '}
                  {(METRIC_LABELS[reduction.metric] as Record<string, string>)[reduction.to]} would
                  drop the score to{' '}
                  <span className="font-bold">{reduction.newScore.toFixed(1)}</span>.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  No single metric change reduces this score further.
                </p>
              )}
              <p className="mt-3 text-xs text-muted">
                This is what controls actually do. Putting a service behind a VPN changes Attack
                Vector from Network to Adjacent; requiring authentication changes Privileges
                Required. The score is not a fixed property of the software.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ----------------------------- Findings ----------------------------- */}
      {tab === 'findings' && (
        <>
          {result && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Triage accuracy</div>
                  <div className="text-3xl font-bold text-white" data-testid="vuln-score">
                    {result.correctCount}/{result.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={result.percentage} label="Correct verdicts" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-md border p-3 ${
                    result.missedVulnerabilities > 0
                      ? 'border-danger/50 bg-danger/10'
                      : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Missed vulnerabilities
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.missedVulnerabilities > 0 ? 'text-danger' : 'text-ok'
                    }`}
                    data-testid="missed-vulns"
                  >
                    {result.missedVulnerabilities}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Real findings dismissed. The exposure stays open and nobody is looking.
                  </p>
                </div>

                <div
                  className={`rounded-md border p-3 ${
                    result.falseReports > 0 ? 'border-warn/50 bg-warn/10' : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">False reports</div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.falseReports > 0 ? 'text-warn' : 'text-ok'
                    }`}
                    data-testid="false-reports"
                  >
                    {result.falseReports}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    False positives reported as real. Wastes a maintenance window and costs
                    credibility with the team you sent it to.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {VULN_FINDINGS.map((f) => {
              const scored = scoreFinding(f);
              const itemResult = result?.items.find((r) => r.findingId === f.id);
              const tone = itemResult
                ? itemResult.correct
                  ? 'border-ok/50'
                  : 'border-danger/50'
                : '';

              return (
                <Card key={f.id} className={tone}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="font-mono text-xs text-accent">{f.cve}</code>
                        <span className="text-xs text-muted">
                          {f.host} · {f.service}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-medium text-white">{f.title}</h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: SEVERITY_COLOR[scored.severity] }}
                      >
                        {scored.score.toFixed(1)}
                      </div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: SEVERITY_COLOR[scored.severity] }}
                      >
                        {scored.severity}
                      </div>
                    </div>
                  </div>

                  <dl className="mt-3 space-y-2 text-xs">
                    <div>
                      <dt className="text-muted">Scanner reported</dt>
                      <dd className="mt-0.5 text-white">{f.scannerEvidence}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Manual verification found</dt>
                      <dd className="mt-0.5 text-white">{f.verificationEvidence}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['confirmed', 'false-positive'] as FindingVerdict[]).map((v) => {
                      const chosen = answer[f.id] === v;
                      const isCorrect = f.verdict === v;
                      const label = v === 'confirmed' ? 'Confirmed' : 'False positive';

                      let style = 'border-border bg-panel-2 text-muted hover:border-accent/60';
                      if (chosen) style = 'border-accent bg-accent/10 text-white';
                      if (submitted && isCorrect) style = 'border-ok bg-ok/10 text-white';
                      if (submitted && chosen && !isCorrect)
                        style = 'border-danger bg-danger/10 text-white';

                      return (
                        <button
                          key={v}
                          type="button"
                          disabled={submitted}
                          aria-label={`${f.cve}: ${label}`}
                          onClick={() =>
                            setAnswer((a) => ({ ...a, [f.id]: chosen ? undefined : v }))
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {itemResult && (
                    <>
                      <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                        {itemResult.rationale}
                      </p>
                      {f.verdict === 'confirmed' && (
                        <dl className="mt-3 space-y-2 text-xs">
                          <div>
                            <dt className="text-muted">Remediation</dt>
                            <dd className="mt-0.5 text-white">{f.remediation}</dd>
                          </div>
                          <div>
                            <dt className="text-muted">Validation</dt>
                            <dd className="mt-0.5 text-white">{f.validation}</dd>
                          </div>
                        </dl>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <>
                <Button onClick={submit} disabled={!isVulnTriageComplete(answer)}>
                  Submit verdicts
                </Button>
                <span className="text-sm text-muted">
                  {countVulnTriaged(answer)} of {VULN_FINDINGS.length} triaged
                </span>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswer({});
                  setSubmitted(false);
                }}
              >
                Retry triage
              </Button>
            )}
          </div>
        </>
      )}

      {/* --------------------------- Prioritisation --------------------------- */}
      {tab === 'prioritise' && (
        <>
          <Card className="mb-4 border-accent/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              CVSS measures the vulnerability, not your exposure
            </h2>
            <p className="mt-2 text-sm text-white">
              {delta.differs ? (
                <>
                  Sorting by raw score puts <strong>{delta.naiveTop.cve}</strong> first at{' '}
                  {delta.naiveTop.score.toFixed(1)}. Accounting for this environment puts{' '}
                  <strong>{delta.realTop.cve}</strong> first at {delta.realTop.score.toFixed(1)}.
                  The higher-scoring finding is not the more urgent one here.
                </>
              ) : (
                <>Both orderings agree on this finding set.</>
              )}
            </p>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Sorted by raw CVSS
              </h3>
              <p className="mt-1 text-xs text-muted">
                What the scanner hands you. Includes false positives.
              </p>
              <ol className="mt-3 space-y-2" data-testid="naive-order">
                {naive.map((f, i) => (
                  <li key={f.id} className="flex items-baseline gap-2 text-sm">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted">{i + 1}</span>
                    <span
                      className="w-9 shrink-0 font-mono text-xs"
                      style={{ color: SEVERITY_COLOR[f.severity] }}
                    >
                      {f.score.toFixed(1)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted">{f.title}</span>
                    {f.verdict === 'false-positive' && (
                      <span className="shrink-0 text-[10px] uppercase text-danger">FP</span>
                    )}
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="border-ok/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Sorted by real priority
              </h3>
              <p className="mt-1 text-xs text-muted">
                Verified findings only, with environmental exposure applied.
              </p>
              <ol className="mt-3 space-y-2" data-testid="real-order">
                {real.map((f, i) => (
                  <li key={f.id} className="flex items-baseline gap-2 text-sm">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted">{i + 1}</span>
                    <span
                      className="w-9 shrink-0 font-mono text-xs"
                      style={{ color: SEVERITY_COLOR[f.severity] }}
                    >
                      {f.score.toFixed(1)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-white">{f.title}</span>
                    {f.contextOverridesScore && (
                      <span className="shrink-0 text-[10px] uppercase text-warn">ctx</span>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="mt-4 space-y-3">
            {real
              .filter((f) => f.contextOverridesScore)
              .map((f) => (
                <Card key={f.id} className="border-warn/40">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-white">{f.title}</span>
                    <span className="font-mono text-xs text-warn">
                      scores {f.score.toFixed(1)}, ranks lower
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{f.contextNote}</p>
                </Card>
              ))}
          </div>
        </>
      )}
    </>
  );
}
