import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  ALERTS,
  LOG_SOURCES,
  PIVOT_SUGGESTIONS,
  SEVERITY_COLOR,
  SEVERITY_ORDER,
  STATUS_LABELS,
  eventsFrom,
  getAlert,
  incidentTimeline,
  pivot,
  type LogSourceId,
  type Severity,
} from '../data/socTelemetry';
import {
  countTriaged,
  gradeTriage,
  isTriageComplete,
  statusFor,
  type TriageAnswer,
  type TriageDecision,
} from '../lib/triageEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Tab = 'dashboard' | 'investigate' | 'timeline';

const TAB_LABELS: Record<Tab, string> = {
  dashboard: 'Alert dashboard',
  investigate: 'Investigation console',
  timeline: 'Incident timeline',
};

export function SocConsoleView() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [answer, setAnswer] = useState<TriageAnswer>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [query, setQuery] = useState('');
  const [activeSource, setActiveSource] = useState<LogSourceId | 'all'>('all');

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const result = submitted ? gradeTriage(answer) : null;
  const selectedAlert = selectedAlertId ? getAlert(selectedAlertId) : undefined;

  const visibleAlerts = useMemo(
    () => (severityFilter === 'all' ? ALERTS : ALERTS.filter((a) => a.severity === severityFilter)),
    [severityFilter]
  );

  const pivotResults = useMemo(() => (query.trim() ? pivot(query) : []), [query]);

  const sourceEvents = useMemo(
    () => (activeSource === 'all' ? [] : eventsFrom(activeSource)),
    [activeSource]
  );

  const timeline = useMemo(() => incidentTimeline(), []);

  const submit = () => {
    setSubmitted(true);
    const graded = gradeTriage(answer);
    // Triage credit requires getting the discrimination right in both
    // directions — no missed incidents and no false escalations.
    recordOutcome('alert-triage', graded.correctCount === graded.total);
    recordOutcome('false-positives', graded.falseEscalations === 0);
  };

  return (
    <>
      <PageHeader
        title="SOC Console"
        subtitle="Five alerts are waiting. Triage each one: escalate the real incidents, close the noise. Pivot across log sources to gather evidence before you decide."
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

      {/* ----------------------------- Dashboard ----------------------------- */}
      {tab === 'dashboard' && (
        <>
          {result && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Triage accuracy</div>
                  <div className="text-3xl font-bold text-white" data-testid="triage-score">
                    {result.correctCount}/{result.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={result.percentage} label="Correct decisions" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-md border p-3 ${
                    result.missedIncidents > 0
                      ? 'border-danger/50 bg-danger/10'
                      : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    Missed incidents
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.missedIncidents > 0 ? 'text-danger' : 'text-ok'
                    }`}
                    data-testid="missed-incidents"
                  >
                    {result.missedIncidents}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Real incidents closed as noise. The dangerous error — an attacker keeps working.
                  </p>
                </div>

                <div
                  className={`rounded-md border p-3 ${
                    result.falseEscalations > 0
                      ? 'border-warn/50 bg-warn/10'
                      : 'border-ok/40 bg-ok/5'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted">
                    False escalations
                  </div>
                  <div
                    className={`mt-1 text-2xl font-bold ${
                      result.falseEscalations > 0 ? 'text-warn' : 'text-ok'
                    }`}
                    data-testid="false-escalations"
                  >
                    {result.falseEscalations}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Noise escalated as real. The expensive error — it burns analyst hours and
                    credibility.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted">Severity</span>
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={`rounded border px-2 py-1 text-xs transition-colors ${
                  severityFilter === 'all'
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-border bg-panel-2 text-muted hover:text-white'
                }`}
              >
                All
              </button>
              {SEVERITY_ORDER.filter((s) => ALERTS.some((a) => a.severity === s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverityFilter(s)}
                  className={`rounded border px-2 py-1 text-xs capitalize transition-colors ${
                    severityFilter === s
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-border bg-panel-2 text-muted hover:text-white'
                  }`}
                  style={severityFilter === s ? undefined : { color: SEVERITY_COLOR[s] }}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[64rem] text-left text-sm">
              <thead className="bg-panel-2 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Alert</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Destination</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Host</th>
                  <th className="px-3 py-2">IOC</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Triage</th>
                </tr>
              </thead>
              <tbody>
                {visibleAlerts.map((a) => {
                  const decision = answer[a.id];
                  const alertResult = result?.alerts.find((r) => r.alertId === a.id);
                  const rowTone = alertResult
                    ? alertResult.correct
                      ? 'bg-ok/5'
                      : 'bg-danger/5'
                    : '';

                  return (
                    <tr key={a.id} className={`border-t border-border ${rowTone}`}>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted">
                        {a.timestamp}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAlertId(a.id);
                            setTab('investigate');
                          }}
                          className="text-left text-white hover:text-accent"
                        >
                          {a.title}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black"
                          style={{ backgroundColor: SEVERITY_COLOR[a.severity] }}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted">
                        {a.source}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted">
                        {a.destination}
                      </td>
                      <td className="px-3 py-2 text-muted">{a.user}</td>
                      <td className="px-3 py-2 text-muted">{a.host}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-accent">
                        {a.ioc ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">
                        {STATUS_LABELS[statusFor(decision)]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <div className="flex gap-1">
                          {(['escalate', 'close-fp'] as TriageDecision[]).map((d) => {
                            const chosen = decision === d;
                            const label = d === 'escalate' ? 'Escalate' : 'Close FP';
                            return (
                              <button
                                key={d}
                                type="button"
                                disabled={submitted}
                                aria-label={`${a.title}: ${label}`}
                                onClick={() =>
                                  setAnswer((prev) => ({
                                    ...prev,
                                    [a.id]: chosen ? undefined : d,
                                  }))
                                }
                                className={`rounded border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                                  chosen
                                    ? d === 'escalate'
                                      ? 'border-danger bg-danger/15 text-white'
                                      : 'border-ok bg-ok/15 text-white'
                                    : 'border-border bg-panel-2 text-muted hover:text-white'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {result && (
            <div className="mt-4 space-y-3">
              {result.alerts.map((r) => {
                const alert = getAlert(r.alertId)!;
                return (
                  <Card key={r.alertId} className={r.correct ? 'border-ok/50' : 'border-danger/50'}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-white">{alert.title}</span>
                      <span
                        className={`text-xs font-semibold ${r.correct ? 'text-ok' : 'text-danger'}`}
                      >
                        {r.correct
                          ? 'Correct'
                          : r.errorKind === 'missed-incident'
                            ? 'Missed incident'
                            : 'False escalation'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{r.rationale}</p>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <>
                <Button onClick={submit} disabled={!isTriageComplete(answer)}>
                  Submit triage
                </Button>
                <span className="text-sm text-muted">
                  {countTriaged(answer)} of {ALERTS.length} triaged
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

      {/* -------------------------- Investigation --------------------------- */}
      {tab === 'investigate' && (
        <>
          {selectedAlert && (
            <Card className="mb-4 border-accent/40">
              <div className="text-xs uppercase tracking-wider text-accent">Investigating</div>
              <h2 className="mt-1 text-base font-semibold text-white">{selectedAlert.title}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                <span>host {selectedAlert.host}</span>
                <span>user {selectedAlert.user}</span>
                {selectedAlert.ioc && <span>IOC {selectedAlert.ioc}</span>}
              </div>
            </Card>
          )}

          <Card className="mb-4">
            <label htmlFor="pivot-input" className="block text-sm font-medium text-white">
              Pivot on an indicator
            </label>
            <p className="mt-1 text-xs text-muted">
              Take an indicator from one source and find it everywhere else. This is the core
              investigative move — a single log tells you almost nothing on its own.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Search size={16} className="shrink-0 text-muted" aria-hidden />
              <input
                id="pivot-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Pivot indicator"
                placeholder="203.0.113.55"
                className="min-w-0 flex-1 rounded border border-border bg-panel-2 px-2 py-1.5 font-mono text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PIVOT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded border border-border bg-panel-2 px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>

          {query.trim() && (
            <Card className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Pivot results — {pivotResults.length} event
                {pivotResults.length === 1 ? '' : 's'} across{' '}
                {new Set(pivotResults.map((e) => e.source)).size} source
                {new Set(pivotResults.map((e) => e.source)).size === 1 ? '' : 's'}
              </h3>
              {pivotResults.length === 0 ? (
                <p className="mt-2 text-sm text-muted">
                  No events match that indicator. Check the value, or try one of the suggestions.
                </p>
              ) : (
                <ul className="mt-3 space-y-2" data-testid="pivot-results">
                  {pivotResults
                    .slice()
                    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                    .map((e) => (
                      <li key={e.id} className="rounded border border-border bg-soc-bg p-2">
                        <div className="flex flex-wrap items-baseline gap-2 text-xs">
                          <span className="font-mono text-muted">{e.timestamp}</span>
                          <span className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                            {e.source}
                          </span>
                          {e.eventId && (
                            <span className="font-mono text-muted">id {e.eventId}</span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-xs text-text">{e.message}</p>
                      </li>
                    ))}
                </ul>
              )}
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Browse a log source
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {LOG_SOURCES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSource(activeSource === s.id ? 'all' : s.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    activeSource === s.id
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-border bg-panel-2 text-muted hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {activeSource !== 'all' && (
              <>
                <p className="mt-3 text-xs text-muted">
                  {LOG_SOURCES.find((s) => s.id === activeSource)?.description}
                </p>
                <ul className="mt-3 space-y-2" data-testid="source-events">
                  {sourceEvents.map((e) => (
                    <li key={e.id} className="rounded border border-border bg-soc-bg p-2">
                      <div className="flex flex-wrap items-baseline gap-2 text-xs">
                        <span className="font-mono text-muted">{e.timestamp}</span>
                        {e.host && <span className="text-muted">{e.host}</span>}
                        {e.user && <span className="text-muted">{e.user}</span>}
                      </div>
                      <p className="mt-1 font-mono text-xs text-text">{e.message}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </>
      )}

      {/* ----------------------------- Timeline ----------------------------- */}
      {tab === 'timeline' && (
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Incident timeline
          </h2>
          <p className="mt-1 text-xs text-muted">
            Every event belonging to the incident, in order, across all sources. No single system
            saw the whole thing — this is what correlation produces.
          </p>
          <ol className="mt-4 space-y-3" data-testid="incident-timeline">
            {timeline.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-16 shrink-0 pt-0.5 text-right font-mono text-xs text-accent">
                  {e.timestamp}
                </span>
                <div className="min-w-0 flex-1 border-l border-border pl-3">
                  <div className="flex flex-wrap items-baseline gap-2 text-xs">
                    <span className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                      {e.source}
                    </span>
                    {e.host && <span className="text-muted">{e.host}</span>}
                    {e.user && <span className="text-muted">{e.user}</span>}
                  </div>
                  <p className="mt-1 font-mono text-xs text-text">{e.message}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </>
  );
}
