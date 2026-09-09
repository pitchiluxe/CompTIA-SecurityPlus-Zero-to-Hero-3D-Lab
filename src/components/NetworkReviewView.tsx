import { useMemo, useState } from 'react';
import {
  AREA_LABELS,
  CONFIG_ITEMS,
  ERROR_COUNT,
  FIREWALL_RULES,
  itemsInArea,
  type ConfigArea,
  type ConfigVerdict,
} from '../data/networkConfig';
import {
  countConfigReviewed,
  gradeConfigReview,
  isConfigReviewComplete,
  type ConfigAnswer,
} from '../lib/configReview';
import {
  findOverlyBroadPermits,
  findShadowedRules,
  hasExplicitDenyAll,
} from '../lib/firewallAnalysis';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

const AREAS = Object.keys(AREA_LABELS) as ConfigArea[];

const SEVERITY_TONE: Record<string, string> = {
  high: 'text-danger',
  medium: 'text-warn',
  low: 'text-accent',
};

type Tab = 'review' | 'firewall';

export function NetworkReviewView() {
  const [tab, setTab] = useState<Tab>('review');
  const [answer, setAnswer] = useState<ConfigAnswer>({});
  const [submitted, setSubmitted] = useState(false);
  const [ruleOrder, setRuleOrder] = useState(FIREWALL_RULES);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const result = submitted ? gradeConfigReview(answer) : null;

  const shadowed = useMemo(() => findShadowedRules(ruleOrder), [ruleOrder]);
  const broadPermits = useMemo(() => findOverlyBroadPermits(ruleOrder), [ruleOrder]);
  const denyAll = useMemo(() => hasExplicitDenyAll(ruleOrder), [ruleOrder]);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeConfigReview(answer);
    recordOutcome('network-hardening', graded.correctCount === graded.total);
    recordOutcome('config-review', graded.missedHighSeverity === 0);
  };

  /** Move the offending permit-any below the denies it currently shadows. */
  const reorderBroadPermit = () => {
    setRuleOrder((rules) => rules.map((r) => (r.id === 'fw2' ? { ...r, seq: 55 } : r)));
  };

  const restoreOrder = () => setRuleOrder(FIREWALL_RULES);

  return (
    <>
      <PageHeader
        title="Network Configuration Review"
        subtitle="An enterprise network configuration with errors injected. Nothing is labelled and there is no recommended value to compare against — decide from the config itself whether each item is correct."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['review', 'firewall'] as Tab[]).map((t) => (
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
            {t === 'review' ? 'Configuration review' : 'Firewall rule analysis'}
          </button>
        ))}
      </div>

      {/* ------------------------- Firewall analysis ------------------------- */}
      {tab === 'firewall' && (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Rule set, in evaluation order
            </h2>
            <p className="mt-1 text-xs text-muted">
              Rules are evaluated top-down and the first match wins. Shadowing is computed from CIDR
              and port containment, so reordering changes the analysis.
            </p>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-1 pr-3">Seq</th>
                    <th className="py-1 pr-3">Action</th>
                    <th className="py-1 pr-3">Proto</th>
                    <th className="py-1 pr-3">Source</th>
                    <th className="py-1 pr-3">Destination</th>
                    <th className="py-1 pr-3">Port</th>
                    <th className="py-1">Description</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[...ruleOrder]
                    .sort((a, b) => a.seq - b.seq)
                    .map((r) => {
                      const isDead = shadowed.some((s) => s.shadowedRule.id === r.id);
                      return (
                        <tr
                          key={r.id}
                          className={`border-t border-border ${isDead ? 'opacity-40' : ''}`}
                        >
                          <td className="py-1 pr-3 text-muted">{r.seq}</td>
                          <td
                            className={`py-1 pr-3 ${
                              r.action === 'permit' ? 'text-ok' : 'text-danger'
                            }`}
                          >
                            {r.action}
                          </td>
                          <td className="py-1 pr-3 text-muted">{r.protocol}</td>
                          <td className="py-1 pr-3 text-white">{r.source}</td>
                          <td className="py-1 pr-3 text-white">{r.destination}</td>
                          <td className="py-1 pr-3 text-white">{r.port}</td>
                          <td className="py-1 font-sans text-muted">{r.description}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              className={
                shadowed.length > 0
                  ? 'border-danger/50 lg:col-span-2'
                  : 'border-ok/40 lg:col-span-2'
              }
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Unreachable rules
              </h3>
              <div
                className={`mt-1 text-3xl font-bold ${
                  shadowed.length > 0 ? 'text-danger' : 'text-ok'
                }`}
                data-testid="shadowed-count"
              >
                {shadowed.length}
              </div>

              {shadowed.length === 0 ? (
                <p className="mt-2 text-sm text-muted">
                  Every rule can be reached. No earlier rule swallows a later one.
                </p>
              ) : (
                <ul className="mt-3 space-y-3" data-testid="shadow-findings">
                  {shadowed.map((s) => (
                    <li
                      key={s.shadowedRule.id}
                      className="rounded border border-border bg-panel-2 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-xs text-danger">
                          seq {s.shadowedRule.seq}
                        </span>
                        <span className="text-white">{s.shadowedRule.description}</span>
                        <span
                          className={`ml-auto text-[10px] font-semibold uppercase ${
                            s.kind === 'contradicted' ? 'text-danger' : 'text-warn'
                          }`}
                        >
                          {s.kind}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Never matches — seq {s.shadowedBy.seq} ({s.shadowedBy.action}{' '}
                        {s.shadowedBy.protocol} {s.shadowedBy.source} → {s.shadowedBy.destination}{' '}
                        {s.shadowedBy.port}) already covers everything it would.
                        {s.kind === 'contradicted' &&
                          ' The actions differ, so the intent of this rule is actively defeated.'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-4">
              <Card className={broadPermits.length > 0 ? 'border-danger/50' : 'border-ok/40'}>
                <h3 className="text-xs uppercase tracking-wider text-muted">Permit any/any/any</h3>
                <div
                  className={`mt-1 text-2xl font-bold ${
                    broadPermits.length > 0 ? 'text-danger' : 'text-ok'
                  }`}
                  data-testid="broad-permits"
                >
                  {broadPermits.length}
                </div>
                <p className="mt-1 text-xs text-muted">
                  A rule permitting everything from everywhere defeats the rule set below it.
                </p>
              </Card>

              <Card className={denyAll ? 'border-ok/40' : 'border-warn/50'}>
                <h3 className="text-xs uppercase tracking-wider text-muted">Explicit deny all</h3>
                <div
                  className={`mt-1 text-2xl font-bold ${denyAll ? 'text-ok' : 'text-warn'}`}
                  data-testid="deny-all"
                >
                  {denyAll ? 'Present' : 'Missing'}
                </div>
                <p className="mt-1 text-xs text-muted">
                  Makes the intent readable and gives you something to log against.
                </p>
              </Card>
            </div>
          </div>

          <Card className="mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Try the fix
            </h3>
            <p className="mt-1 text-sm text-muted">
              The analysis is computed, not scripted. Move the broad permit below the denies it
              currently swallows and watch the unreachable count change.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={reorderBroadPermit}>Move permit-any to seq 55</Button>
              <Button variant="ghost" onClick={restoreOrder}>
                Restore original order
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* -------------------------- Configuration review -------------------------- */}
      {tab === 'review' && (
        <>
          {result && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Review accuracy</div>
                  <div className="text-3xl font-bold text-white" data-testid="review-score">
                    {result.correctCount}/{result.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={result.percentage} label="Correct verdicts" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div
                  className={`rounded-md border p-3 ${
                    result.missedErrors > 0
                      ? 'border-danger/50 bg-danger/10'
                      : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">Missed errors</div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.missedErrors > 0 ? 'text-danger' : 'text-ok'
                    }`}
                    data-testid="missed-errors"
                  >
                    {result.missedErrors}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Misconfigurations passed as correct. They stay in production.
                  </p>
                </div>

                <div
                  className={`rounded-md border p-3 ${
                    result.falseErrors > 0 ? 'border-warn/50 bg-warn/10' : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">False errors</div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.falseErrors > 0 ? 'text-warn' : 'text-ok'
                    }`}
                    data-testid="false-errors"
                  >
                    {result.falseErrors}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Correct config flagged. Sends the network team chasing nothing.
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
                    data-testid="missed-high-config"
                  >
                    {result.missedHighSeverity}
                  </div>
                  <p className="mt-1 text-xs text-muted">The ones that give an attacker a path.</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="mb-4">
            <p className="text-sm text-muted">
              {CONFIG_ITEMS.length} configuration items across {AREAS.length} areas.{' '}
              {submitted ? (
                <span className="text-white">
                  {ERROR_COUNT} contained errors and {CONFIG_ITEMS.length - ERROR_COUNT} were
                  correct.
                </span>
              ) : (
                <span>Some are correct. Some are not. Nothing tells you which.</span>
              )}
            </p>
          </Card>

          <div className="space-y-6">
            {AREAS.map((area) => (
              <section key={area}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
                  {AREA_LABELS[area]}
                </h2>
                <div className="space-y-3">
                  {itemsInArea(area).map((item) => {
                    const itemResult = result?.items.find((r) => r.itemId === item.id);
                    const tone = itemResult
                      ? itemResult.correct
                        ? 'border-ok/50'
                        : 'border-danger/50'
                      : '';

                    return (
                      <Card key={item.id} className={tone}>
                        <div className="flex items-start justify-between gap-3">
                          <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded bg-soc-bg p-3 font-mono text-xs text-text">
                            {item.config}
                          </pre>
                          {itemResult && (
                            <span
                              className={`shrink-0 text-xs font-semibold ${
                                itemResult.correct ? 'text-ok' : 'text-danger'
                              }`}
                            >
                              {itemResult.correct
                                ? 'Correct'
                                : itemResult.errorKind === 'missed-error'
                                  ? 'Missed error'
                                  : 'False error'}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {(['correct', 'error'] as ConfigVerdict[]).map((v) => {
                            const chosen = answer[item.id] === v;
                            const isCorrect = item.verdict === v;
                            const label = v === 'correct' ? 'Correct' : 'Error';

                            let style =
                              'border-border bg-panel-2 text-muted hover:border-accent/60';
                            if (chosen) style = 'border-accent bg-accent/10 text-white';
                            if (submitted && isCorrect) style = 'border-ok bg-ok/10 text-white';
                            if (submitted && chosen && !isCorrect)
                              style = 'border-danger bg-danger/10 text-white';

                            return (
                              <button
                                key={v}
                                type="button"
                                disabled={submitted}
                                aria-label={`${item.id}: ${label}`}
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
                            {itemResult.explanation}
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
                <Button onClick={submit} disabled={!isConfigReviewComplete(answer)}>
                  Submit review
                </Button>
                <span className="text-sm text-muted">
                  {countConfigReviewed(answer)} of {CONFIG_ITEMS.length} reviewed
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
                Retry review
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
