import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  ALERTS,
  LOG_EVENTS,
  LOG_SOURCES,
  SEVERITY_ORDER,
  eventsFrom,
  getAlert,
  incidentTimeline,
  pivot,
} from '../src/data/socTelemetry';
import { PHASE_7 } from '../src/data/phase7';
import {
  countTriaged,
  gradeTriage,
  isTriageComplete,
  statusFor,
  type TriageAnswer,
} from '../src/lib/triageEngine';
import { SocConsoleView } from '../src/components/SocConsoleView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_7_COMMANDS } from '../src/sim/phase7Commands';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

/** Triage every alert correctly. */
function perfectTriage(): TriageAnswer {
  return Object.fromEntries(
    ALERTS.map((a) => [a.id, a.correctVerdict === 'true-positive' ? 'escalate' : 'close-fp'])
  );
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 7 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_7.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'siem',
      'soar',
      'edr',
      'xdr',
      'log management',
      'alert triage',
      'threat intelligence',
      'ioc',
      'ioa',
      'dashboard',
      'windows event',
      'linux',
      'firewall',
      'dns',
      'web proxy',
    ];

    for (const topic of required) {
      expect(text, `Phase 7 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('maps to the largest exam domain', () => {
    expect(PHASE_7.examDomain).toBe('Security Operations');
  });

  it('ships four lessons and four labs', () => {
    expect(PHASE_7.lessons).toHaveLength(4);
    expect(PHASE_7.labs).toHaveLength(4);
  });
});

describe('SOC telemetry data', () => {
  it('provides every dashboard column PROMPT.md requires', () => {
    for (const a of ALERTS) {
      expect(a.timestamp, `${a.id} has no timestamp`).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(SEVERITY_ORDER).toContain(a.severity);
      expect(a.source).toBeTruthy();
      expect(a.destination).toBeTruthy();
      expect(a.user).toBeTruthy();
      expect(a.host).toBeTruthy();
      // IOC is legitimately optional — not every rule produces one.
      expect(a.correctVerdict).toMatch(/true-positive|false-positive/);
    }
  });

  it('includes false positives, so triage is a real discrimination', () => {
    const fp = ALERTS.filter((a) => a.correctVerdict === 'false-positive');
    const tp = ALERTS.filter((a) => a.correctVerdict === 'true-positive');
    expect(fp.length).toBeGreaterThan(0);
    expect(tp.length).toBeGreaterThan(0);
  });

  it('gives every alert a substantive verdict rationale', () => {
    for (const a of ALERTS) {
      expect(a.verdictRationale.length, `${a.id} rationale too thin`).toBeGreaterThan(80);
    }
  });

  it('covers all six log sources with events', () => {
    for (const s of LOG_SOURCES) {
      expect(eventsFrom(s.id).length, `${s.id} has no events`).toBeGreaterThan(0);
    }
  });

  it('follows the investigation sequence PROMPT.md specifies', () => {
    // multiple failed logins -> successful login -> unusual location ->
    // suspicious process
    const timeline = incidentTimeline();
    const failures = timeline.filter((e) => e.eventId === 4625);
    const success = timeline.find((e) => e.eventId === 4624);
    const process = timeline.find((e) => e.eventId === 4688);

    expect(failures.length).toBeGreaterThanOrEqual(3);
    expect(success).toBeDefined();
    expect(process).toBeDefined();

    // Order: failures before success before process creation.
    expect(failures[0].timestamp < success!.timestamp).toBe(true);
    expect(success!.timestamp < process!.timestamp).toBe(true);
  });

  it('shows the attacker guessing the username convention, not the password', () => {
    const failures = LOG_EVENTS.filter((e) => e.eventId === 4625);
    const usernames = new Set(failures.map((e) => e.user));
    // Different usernames from one source = username guessing, which means the
    // password was already known. That is the teaching point.
    expect(usernames.size).toBe(failures.length);
    expect(new Set(failures.map((e) => e.srcIp)).size).toBe(1);
  });

  it('keeps the beacon regular in interval and near-constant in size', () => {
    const flows = LOG_EVENTS.filter(
      (e) => e.source === 'firewall' && e.dstIp === '203.0.113.55'
    ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    expect(flows.length).toBeGreaterThanOrEqual(3);

    const minutes = flows.map((f) => {
      const [h, m] = f.timestamp.split(':').map(Number);
      return h * 60 + m;
    });
    const gaps = minutes.slice(1).map((m, i) => m - minutes[i]);
    // Every gap identical — that regularity is the detection signal.
    expect(new Set(gaps).size).toBe(1);
  });

  it('resolves an alert by id', () => {
    expect(getAlert('a2')?.severity).toBe('critical');
    expect(getAlert('nope')).toBeUndefined();
  });
});

describe('pivoting', () => {
  it('finds a process across endpoint and EDR telemetry by PID', () => {
    const results = pivot('6644');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(new Set(results.map((r) => r.source)).size).toBeGreaterThan(1);
  });

  it('finds the beacon across firewall flows by destination address', () => {
    const results = pivot('203.0.113.55');
    expect(results.every((r) => r.dstIp === '203.0.113.55' || r.domain)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it('crosses sources when pivoting on a host', () => {
    const sources = new Set(pivot('WS-01').map((e) => e.source));
    // The point of pivoting: one indicator, several different log sources.
    expect(sources.size).toBeGreaterThanOrEqual(3);
  });

  it('returns nothing for an unknown indicator rather than guessing', () => {
    expect(pivot('192.0.2.99')).toHaveLength(0);
    expect(pivot('')).toHaveLength(0);
  });

  it('matches indicators case-insensitively', () => {
    expect(pivot('ws-01').length).toBe(pivot('WS-01').length);
  });
});

describe('triage grading', () => {
  it('scores a perfect triage with no errors in either direction', () => {
    const result = gradeTriage(perfectTriage());
    expect(result.correctCount).toBe(ALERTS.length);
    expect(result.percentage).toBe(100);
    expect(result.missedIncidents).toBe(0);
    expect(result.falseEscalations).toBe(0);
  });

  it('names closing a real incident a missed incident', () => {
    const answer: TriageAnswer = { ...perfectTriage() };
    const tp = ALERTS.find((a) => a.correctVerdict === 'true-positive')!;
    answer[tp.id] = 'close-fp';

    const result = gradeTriage(answer);
    expect(result.missedIncidents).toBe(1);
    expect(result.falseEscalations).toBe(0);
    expect(result.alerts.find((r) => r.alertId === tp.id)?.errorKind).toBe('missed-incident');
  });

  it('names escalating noise a false escalation', () => {
    const answer: TriageAnswer = { ...perfectTriage() };
    const fp = ALERTS.find((a) => a.correctVerdict === 'false-positive')!;
    answer[fp.id] = 'escalate';

    const result = gradeTriage(answer);
    expect(result.falseEscalations).toBe(1);
    expect(result.missedIncidents).toBe(0);
    expect(result.alerts.find((r) => r.alertId === fp.id)?.errorKind).toBe('false-escalation');
  });

  it('penalises escalating everything', () => {
    // The instinct to escalate all alerts must not score well.
    const answer: TriageAnswer = Object.fromEntries(ALERTS.map((a) => [a.id, 'escalate' as const]));
    const result = gradeTriage(answer);

    expect(result.correctCount).toBeLessThan(ALERTS.length);
    expect(result.falseEscalations).toBeGreaterThan(0);
  });

  it('handles an empty triage without crashing', () => {
    const result = gradeTriage({});
    expect(result.correctCount).toBe(0);
    expect(result.alerts.every((a) => !a.answered)).toBe(true);
  });

  it('tracks completeness and count', () => {
    expect(isTriageComplete({})).toBe(false);
    expect(countTriaged({})).toBe(0);
    expect(isTriageComplete(perfectTriage())).toBe(true);
    expect(countTriaged(perfectTriage())).toBe(ALERTS.length);
  });

  it('maps decisions to investigation status', () => {
    expect(statusFor('escalate')).toBe('escalated');
    expect(statusFor('close-fp')).toBe('closed-fp');
    expect(statusFor(undefined)).toBe('new');
  });
});

describe('Phase 7 simulated evidence', () => {
  it('states plainly that SOAR detects nothing', () => {
    const out = runCommand('compare detection tooling').output;
    expect(out).toMatch(/SOAR does not detect anything/i);
  });

  it('contrasts IOC brittleness with IOA durability', () => {
    const out = runCommand('compare ioc ioa').output;
    expect(out).toMatch(/brittle/i);
    expect(out).toMatch(/durable/i);
  });

  it('builds the beacon rule on regularity rather than volume', () => {
    const out = runCommand('show siem rule beacon').output;
    expect(out).toMatch(/stddev\(interval_seconds\)/);
    expect(out).toMatch(/regularity, not volume/i);
    expect(out).not.toMatch(/bytes >/);
  });

  it('warns that five alerts is not five incidents', () => {
    expect(runCommand('show alert queue').output).toMatch(/Five alerts\. Not five incidents/i);
  });

  it('teaches that no single source sees the whole attack', () => {
    expect(runCommand('show log sources').output).toMatch(/NO SINGLE SOURCE SEES THE WHOLE ATTACK/);
  });

  it('names enrichment as the step analysts skip', () => {
    const out = runCommand('show triage workflow').output;
    expect(out).toMatch(/STEP 3 IS THE ONE ANALYSTS SKIP/);
    expect(out).toMatch(/WITHOUT tuning/i);
  });

  it('presents the false positive rate as a tuning problem', () => {
    expect(runCommand('show dashboard summary').output).toMatch(
      /tuning problem, not an analyst problem/i
    );
  });

  it('keeps every artifact labelled with a provenance', () => {
    for (const c of PHASE_7_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
    }
  });
});

describe('SOC Console', () => {
  it('renders the dashboard with every required column', () => {
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    for (const col of [
      'Time',
      'Alert',
      'Severity',
      'Source',
      'Destination',
      'User',
      'Host',
      'IOC',
      'Status',
    ]) {
      expect(screen.getByRole('columnheader', { name: col })).toBeInTheDocument();
    }
  });

  it('blocks submission until every alert is triaged', () => {
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);
    expect(screen.getByRole('button', { name: 'Submit triage' })).toBeDisabled();
    expect(screen.getByText(`0 of ${ALERTS.length} triaged`)).toBeInTheDocument();
  });

  it('grades a perfect triage and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    for (const a of ALERTS) {
      const label = a.correctVerdict === 'true-positive' ? 'Escalate' : 'Close FP';
      await user.click(screen.getByRole('button', { name: `${a.title}: ${label}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit triage' }));

    expect(screen.getByTestId('triage-score')).toHaveTextContent(`${ALERTS.length}/`);
    expect(screen.getByTestId('missed-incidents')).toHaveTextContent('0');
    expect(screen.getByTestId('false-escalations')).toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('alert-triage')).toBe(1);
  });

  it('reports a false escalation when the learner escalates everything', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    for (const a of ALERTS) {
      await user.click(screen.getByRole('button', { name: `${a.title}: Escalate` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit triage' }));

    expect(screen.getByTestId('false-escalations')).not.toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('false-positives')).toBe(0);
  });

  it('filters the queue by severity', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(screen.getByRole('button', { name: 'critical' }));
    const criticalCount = ALERTS.filter((a) => a.severity === 'critical').length;
    expect(screen.getAllByRole('button', { name: /: Escalate$/ })).toHaveLength(criticalCount);
  });

  it('pivots on an indicator across multiple sources', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(screen.getByRole('button', { name: 'Investigation console' }));
    await user.type(screen.getByLabelText('Pivot indicator'), 'WS-01');

    const results = screen.getByTestId('pivot-results');
    expect(within(results).getAllByRole('listitem').length).toBe(pivot('WS-01').length);
  });

  it('reports honestly when a pivot finds nothing', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(screen.getByRole('button', { name: 'Investigation console' }));
    await user.type(screen.getByLabelText('Pivot indicator'), '192.0.2.99');

    expect(screen.getByText(/No events match that indicator/)).toBeInTheDocument();
  });

  it('browses a single log source', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(screen.getByRole('button', { name: 'Investigation console' }));
    await user.click(screen.getByRole('button', { name: 'DNS query log' }));

    const events = screen.getByTestId('source-events');
    expect(within(events).getAllByRole('listitem')).toHaveLength(eventsFrom('dns').length);
  });

  it('renders the correlated incident timeline in order', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(screen.getByRole('button', { name: 'Incident timeline' }));

    const timeline = screen.getByTestId('incident-timeline');
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(incidentTimeline().length);
  });

  it('opens an alert into the investigation console', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-console', '/soc-console', <SocConsoleView />);

    await user.click(
      screen.getByRole('button', { name: 'Interactive PowerShell with sustained outbound TLS' })
    );

    expect(screen.getByText('Investigating')).toBeInTheDocument();
    expect(screen.getByLabelText('Pivot indicator')).toBeInTheDocument();
  });
});

describe('Phase 7 labs and quizzes', () => {
  it('shows the beacon rule logic in the detection lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p7-lab-3', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'show siem rule beacon{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/regularity, not volume/i)).toBeInTheDocument();
  });

  it('shows the pivot chain in the investigation lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p7-lab-2', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'show pivot example{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/five pivots/i)).toBeInTheDocument();
  });

  it('grades the triage lesson quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p7-lesson-2', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'Check for a scheduled job, the destination reputation, and the permitting firewall policy name',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('alert-triage')).toBe(1);
  });
});
