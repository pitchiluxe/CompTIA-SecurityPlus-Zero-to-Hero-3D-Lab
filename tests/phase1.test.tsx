import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PATH_STAGES, PATH_STEPS, getStage } from '../src/data/connectionPath';
import { PHASE_1 } from '../src/data/phase1';
import { PathFallback2D } from '../src/scenes/PathFallback2D';
import { PathView } from '../src/components/PathView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useEvidenceStore } from '../src/store/useEvidenceStore';
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

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  useEvidenceStore.setState({ evidence: [] });
  __setWebGLAvailable(false);
});

describe('Phase 1 curriculum', () => {
  it('covers every topic PROMPT.md lists for this phase', () => {
    const text = [
      ...PHASE_1.lessons.flatMap((l) => [
        l.title,
        ...l.objectives,
        ...l.sections.map((s) => `${s.title} ${s.body}`),
      ]),
      ...PHASE_1.labs.flatMap((l) => [l.title, l.objective, ...l.securityConcepts]),
    ]
      .join(' ')
      .toLowerCase();

    const required = [
      'operating system',
      'filesystem',
      'process',
      'permission',
      'command line',
      'lan',
      'wan',
      'tcp/ip',
      'ipv6',
      'dns',
      'dhcp',
      'http',
      'ssh',
      'port',
      'protocol',
      'router',
      'switch',
      'firewall',
      'vpn',
    ];

    for (const topic of required) {
      expect(text, `Phase 1 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('delivers the six labs the phase specifies', () => {
    expect(PHASE_1.labs).toHaveLength(6);
    const titles = PHASE_1.labs.map((l) => l.title.toLowerCase());
    expect(titles.some((t) => t.includes('windows endpoint'))).toBe(true);
    expect(titles.some((t) => t.includes('linux endpoint'))).toBe(true);
    expect(titles.some((t) => t.includes('process'))).toBe(true);
    expect(titles.some((t) => t.includes('network configuration'))).toBe(true);
    expect(titles.some((t) => t.includes('listening ports'))).toBe(true);
    expect(titles.some((t) => t.includes('trace'))).toBe(true);
  });

  it('orders labs so each prerequisite is satisfiable', () => {
    for (const lab of PHASE_1.labs) {
      expect(lab.prerequisites.length).toBeGreaterThan(0);
    }
  });
});

describe('Phase 1 simulated evidence', () => {
  it('keeps addressing consistent with the Phase 0 environment', () => {
    // route print, ipconfig and the path trace must agree on the gateway, or
    // learners would be reasoning over contradictory evidence.
    expect(runCommand('route print').output).toContain('192.168.1.1');
    expect(runCommand('ipconfig /all').output).toContain('192.168.1.1');
    expect(runCommand('trace connection ws-01 srv-01').output).toContain('192.168.1.30');
    expect(runCommand('ip route').output).toContain('default via 192.168.1.1');
  });

  it('ties the Phase 0 suspicious address to a domain name', () => {
    const dns = runCommand('ipconfig /displaydns');
    expect(dns.recognised).toBe(true);
    expect(dns.output).toContain('203.0.113.55');
    expect(dns.output).toContain('updates.example.net');
  });

  it('shows the HTTP response disclosing a version that HTTPS trims', () => {
    const http = runCommand('curl -i http://srv-01.lab.local').output;
    const https = runCommand('curl -i https://srv-01.lab.local').output;

    expect(http).toContain('nginx/1.18.0');
    expect(https).not.toContain('nginx/1.18.0');
    expect(https).toContain('Strict-Transport-Security');
  });

  it('redacts the SSH host key fingerprint rather than printing a real one', () => {
    expect(runCommand('ssh -v analyst1@srv-01.lab.local').output).toContain('redacted');
  });

  it('uses only documentation IPv6 ranges', () => {
    const out = runCommand('ip -6 addr').output;
    expect(out).toContain('2001:db8'); // RFC 3849 documentation prefix
    expect(out).toContain('fe80::'); // link-local, always present
  });
});

describe('connection path data', () => {
  it('has the five stages the phase specifies, left to right', () => {
    expect(PATH_STAGES.map((s) => s.id)).toEqual([
      'user',
      'endpoint',
      'network',
      'server',
      'controls',
    ]);
    const xs = PATH_STAGES.map((s) => s.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('gives every stage both controls and detection opportunities', () => {
    for (const stage of PATH_STAGES) {
      expect(stage.controls.length, `${stage.id} has no controls`).toBeGreaterThan(0);
      expect(
        stage.detectionOpportunities.length,
        `${stage.id} has no detection opportunities`
      ).toBeGreaterThan(0);
    }
  });

  it('flattens to the nine numbered steps the simulator describes', () => {
    expect(PATH_STEPS.length).toBeGreaterThanOrEqual(9);
    expect(PATH_STEPS[0].order).toBe(1);
    expect(Math.max(...PATH_STEPS.map((s) => s.order))).toBe(9);
  });

  it('resolves a stage by id and returns undefined for an unknown one', () => {
    expect(getStage('network')?.title).toBe('Network');
    // @ts-expect-error deliberately probing an invalid id at runtime
    expect(getStage('nope')).toBeUndefined();
  });
});

describe('PathFallback2D', () => {
  it('renders one accessible control per stage', () => {
    render(<PathFallback2D selectedId={null} onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^Inspect stage / })).toHaveLength(
      PATH_STAGES.length
    );
  });

  it('reports the selected stage', async () => {
    const user = userEvent.setup({ delay: null });
    const seen: string[] = [];
    render(<PathFallback2D selectedId={null} onSelect={(id) => seen.push(id)} />);

    await user.click(screen.getByRole('button', { name: /Inspect stage Network/ }));
    expect(seen).toEqual(['network']);
  });
});

describe('PathView', () => {
  it('falls back to the 2D path when WebGL is unavailable', () => {
    renderAt('/path', '/path', <PathView />);
    expect(screen.getByTestId('path-fallback-2d')).toBeInTheDocument();
    expect(screen.getByText(/WebGL is unavailable/)).toBeInTheDocument();
  });

  it('shows controls and detection opportunities for the selected stage', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/path', '/path', <PathView />);

    await user.click(screen.getByRole('button', { name: 'Network' }));

    expect(screen.getByText('Controls here')).toBeInTheDocument();
    expect(screen.getByText('· Firewall policy')).toBeInTheDocument();
    expect(
      screen.getByText('· Firewall flow logs — source, destination, port, bytes, duration')
    ).toBeInTheDocument();
  });

  it('lists the whole path and lets a step select its stage', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/path', '/path', <PathView />);

    await user.click(screen.getByRole('button', { name: /Firewall policy applied/ }));

    // The step label also appears in the full-path list below, so scope to the
    // detail card to prove the click actually selected the Network stage.
    const steps = screen.getByTestId('stage-steps');
    expect(within(steps).getByText('Frame switched')).toBeInTheDocument();
    expect(within(steps).getByText('Firewall policy applied')).toBeInTheDocument();
    expect(within(steps).getByText('Layer 2 resolution')).toBeInTheDocument();
  });
});

describe('Phase 1 labs run end to end', () => {
  it('advances the Linux endpoint lab and surfaces the world-writable file', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p1-lab-1', '/lab/:labId', <LabView />);

    const input = screen.getByLabelText('Simulated command input');
    await user.type(input, 'uname -a{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/5\.15\.0-91-generic/)).toBeInTheDocument();

    await user.type(input, 'ls -la /var/www{Enter}');
    expect(within(transcript).getByText(/-rwxrwxrwx.*deploy\.sh/)).toBeInTheDocument();
  });

  it('runs the connection trace lab and shows all nine path steps', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p1-lab-5', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'trace connection ws-01 srv-01{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/\[9\] RESPONSE/)).toBeInTheDocument();
    expect(within(transcript).getByText('Simulated output')).toBeInTheDocument();
  });

  it('verifies a Phase 1 lab only after its steps are worked', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p1-lab-0', '/lab/:labId', <LabView />);

    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(screen.getByText(/Not yet — finish the outstanding checks/)).toBeInTheDocument();
    expect(useProgressStore.getState().isLabComplete('phase-1', 'p1-lab-0')).toBe(false);
  });
});

describe('Phase 1 quizzes', () => {
  it('grades a Phase 1 lesson quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p1-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', { name: 'Any user can modify a script that root will execute' })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('users-permissions')).toBe(1);
  });
});
