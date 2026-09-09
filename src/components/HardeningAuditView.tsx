import { useState } from 'react';
import {
  BASELINE_ITEMS,
  CATEGORY_LABELS,
  FINDING_COUNT,
  itemsInCategory,
  type BaselineCategory,
  type Finding,
} from '../data/windowsBaseline';
import { countAudited, gradeAudit, isAuditComplete, type AuditAnswer } from '../lib/auditEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as BaselineCategory[];

const SEVERITY_TONE: Record<string, string> = {
  high: 'text-danger',
  medium: 'text-warn',
  low: 'text-accent',
};

export function HardeningAuditView() {
  const [answer, setAnswer] = useState<AuditAnswer>({});
  const [submitted, setSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const result = submitted ? gradeAudit(answer) : null;

  const submit = () => {
    setSubmitted(true);
    const graded = gradeAudit(answer);
    // Audit credit needs both directions right — flagging everything is not
    // an audit, and missing a high-severity finding is disqualifying.
    recordOutcome('endpoint-hardening', graded.correctCount === graded.total);
    recordOutcome('configuration-audit', graded.missedHighSeverity === 0);
  };

  return (
    <>
      <PageHeader
        title="Windows Hardening Audit"
        subtitle={`WS-01 measured against a security baseline. Classify each setting: is the current state compliant, or a finding? Not everything that looks wrong is wrong — and one item here is not a misconfiguration at all.`}
      />

      {result && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Audit accuracy</div>
              <div className="text-3xl font-bold text-white" data-testid="audit-score">
                {result.correctCount}/{result.total}
              </div>
            </div>
            <div className="min-w-48 flex-1">
              <ProgressBar percent={result.percentage} label="Correct classifications" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div
              className={`rounded-md border p-3 ${
                result.missedFindings > 0 ? 'border-danger/50 bg-danger/10' : 'border-ok/40 bg-ok/5'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted">Missed findings</div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  result.missedFindings > 0 ? 'text-danger' : 'text-ok'
                }`}
                data-testid="missed-findings"
              >
                {result.missedFindings}
              </div>
              <p className="mt-1 text-xs text-muted">
                Real misconfigurations called compliant. The host stays exposed.
              </p>
            </div>

            <div
              className={`rounded-md border p-3 ${
                result.falseFindings > 0 ? 'border-warn/50 bg-warn/10' : 'border-ok/40 bg-ok/5'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted">False findings</div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  result.falseFindings > 0 ? 'text-warn' : 'text-ok'
                }`}
                data-testid="false-findings"
              >
                {result.falseFindings}
              </div>
              <p className="mt-1 text-xs text-muted">
                Correct settings flagged. Wastes remediation effort and credibility.
              </p>
            </div>

            <div
              className={`rounded-md border p-3 ${
                result.missedHighSeverity > 0
                  ? 'border-danger/50 bg-danger/10'
                  : 'border-ok/40 bg-ok/5'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted">
                High severity missed
              </div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  result.missedHighSeverity > 0 ? 'text-danger' : 'text-ok'
                }`}
                data-testid="missed-high"
              >
                {result.missedHighSeverity}
              </div>
              <p className="mt-1 text-xs text-muted">
                Access paths an attacker could use. These are the ones that matter.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <p className="text-sm text-muted">
          {BASELINE_ITEMS.length} settings across {CATEGORIES.length} categories.{' '}
          {submitted ? (
            <span className="text-white">
              {FINDING_COUNT} were genuine findings and {BASELINE_ITEMS.length - FINDING_COUNT} were
              already compliant.
            </span>
          ) : (
            <span>Read the current value against the recommended value before deciding.</span>
          )}
        </p>
      </Card>

      <div className="space-y-6">
        {CATEGORIES.map((category) => (
          <section key={category}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-3">
              {itemsInCategory(category).map((item) => {
                const itemResult = result?.items.find((r) => r.itemId === item.id);
                const tone = itemResult
                  ? itemResult.correct
                    ? 'border-ok/50'
                    : 'border-danger/50'
                  : '';

                return (
                  <Card key={item.id} className={tone}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-white">{item.setting}</h3>
                      {itemResult && (
                        <span
                          className={`shrink-0 text-xs font-semibold ${
                            itemResult.correct ? 'text-ok' : 'text-danger'
                          }`}
                        >
                          {itemResult.correct
                            ? 'Correct'
                            : itemResult.errorKind === 'missed-finding'
                              ? 'Missed finding'
                              : 'False finding'}
                        </span>
                      )}
                    </div>

                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted">Current</dt>
                        <dd className="mt-0.5 break-words font-mono text-white">
                          {item.currentValue}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Recommended</dt>
                        <dd className="mt-0.5 break-words font-mono text-muted">
                          {item.recommendedValue}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {(['compliant', 'finding'] as Finding[]).map((v) => {
                        const chosen = answer[item.id] === v;
                        const isCorrect = item.verdict === v;
                        const label = v === 'compliant' ? 'Compliant' : 'Finding';

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
                            aria-label={`${item.setting}: ${label}`}
                            onClick={() =>
                              setAnswer((a) => ({ ...a, [item.id]: chosen ? undefined : v }))
                            }
                            className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                          >
                            {label}
                          </button>
                        );
                      })}

                      {submitted && item.severity && (
                        <span
                          className={`ml-auto text-xs font-semibold uppercase ${SEVERITY_TONE[item.severity]}`}
                        >
                          {item.severity} severity
                        </span>
                      )}
                    </div>

                    {itemResult && (
                      <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                        {itemResult.rationale}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <Button onClick={submit} disabled={!isAuditComplete(answer)}>
              Submit audit
            </Button>
            <span className="text-sm text-muted">
              {countAudited(answer)} of {BASELINE_ITEMS.length} classified
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
            Retry audit
          </Button>
        )}
      </div>
    </>
  );
}
