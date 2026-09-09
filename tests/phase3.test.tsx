import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ATTACK_CHAIN, detectionOpportunityCount, getAttackStage } from '../src/data/attackChain';
import { DEFENCE_LAYERS } from '../src/data/defenceLayers';
import { PATH_STAGES } from '../src/data/connectionPath';
import { PHASE_3 } from '../src/data/phase3';
import { AttackChainView } from '../src/components/AttackChainView';
import { AttackChainFallback2D } from '../src/scenes/AttackChainFallback2D';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_3_COMMANDS } from '../src/sim/phase3Commands';
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

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 3 content safety', () => {
  const allText = [
    ...PHASE_3_COMMANDS.map((c) => `${c.output} ${c.teaches ?? ''}`),
    ...PHASE_3.lessons.flatMap((l) => l.sections.map((s) => s.body)),
    ...PHASE_3.labs.flatMap((l) => [l.objective, l.securityLesson, l.challenge ?? '']),
    ...ATTACK_CHAIN.map((s) => `${s.summary} ${s.evidence.join(' ')} ${s.detection.join(' ')}`),
  ].join('\n');

  it('contains no executable script or shell payloads', () => {
    // Phase 3 describes attacks; it must never carry runnable technique.
    const forbidden = [
      /<script[\s>]/i,
      /powershell\s+-enc/i,
      /Invoke-Expression|IEX\s*\(/i,
      /base64\s+-d\s*\|/i,
      /curl\s+\S+\s*\|\s*(ba)?sh/i,
      /eval\s*\(/,
    ];
    for (const pattern of forbidden) {
      expect(allText, `Phase 3 content matched ${pattern}`).not.toMatch(pattern);
    }
  });

  it('contains no credentials, hashes, or key material', () => {
    const forbidden = [
      /password\s*[:=]\s*\S+/i,
      /BEGIN [A-Z ]*PRIVATE KEY/,
      /\$2[aby]\$\d{2}\$/, // bcrypt hash
      /[0-9a-f]{32}:[0-9a-f]{32}/i, // LM:NT hash pair
      /api[_-]?key\s*[:=]/i,
    ];
    for (const pattern of forbidden) {
      expect(allText, `Phase 3 content matched ${pattern}`).not.toMatch(pattern);
    }
  });

  it('uses only reserved documentation domains and addresses', () => {
    // RFC 2606 reserves .example/.test/.invalid/.localhost; RFC 5737 reserves
    // 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24 for documentation.
    const domains = allText.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/gi) ?? [];
    const allowedSuffix =
      /(\.example|\.test|\.invalid|\.localhost|\.local|nmap\.org|example\.net|example\.com)$/i;
    const ipLike = /^\d{1,3}(\.\d{1,3}){3}$/;
    const allowedIp =
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|0\.0\.0\.0|255\.)/;

    for (const d of domains) {
      if (ipLike.test(d)) {
        expect(allowedIp.test(d), `${d} is not a private or documentation address`).toBe(true);
      } else if (/\.(com|net|org|io|co|uk)$/i.test(d)) {
        expect(allowedSuffix.test(d), `${d} is not a reserved documentation domain`).toBe(true);
      }
    }
  });

  it('states plainly that the credential capture stage is simulated', () => {
    const stage = getAttackStage('credential-capture')!;
    expect(stage.summary).toMatch(/SIMULATED ONLY/);
    expect(stage.summary).toMatch(/does not implement/i);
  });

  it('labels the chain transcript as describing evidence rather than performing actions', () => {
    const out = runCommand('trace attack chain phish-01').output;
    expect(out).toMatch(/NOTHING IS EXECUTED/);
    expect(out).toMatch(/describes evidence, not actions/);
  });

  it('frames insider investigation as an HR and legal process', () => {
    const out = runCommand('show insider indicators').output;
    expect(out).toMatch(/none of these alone proves malice/i);
    expect(out).toMatch(/HR and legal process/i);
  });
});

describe('Phase 3 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_3.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'malware',
      'virus',
      'worm',
      'trojan',
      'ransomware',
      'spyware',
      'rootkit',
      'botnet',
      'phishing',
      'spear phishing',
      'whaling',
      'smishing',
      'vishing',
      'social engineering',
      'brute force',
      'credential stuffing',
      'password spraying',
      'insider',
      'supply chain',
      'wireless',
      'cloud',
      'mobile',
      'iot',
    ];

    for (const topic of required) {
      expect(text, `Phase 3 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('ships five lessons and five labs', () => {
    expect(PHASE_3.lessons).toHaveLength(5);
    expect(PHASE_3.labs).toHaveLength(5);
  });

  it('maps to the largest exam domain', () => {
    expect(PHASE_3.examDomain).toBe('Threats, Vulnerabilities, and Mitigations');
  });
});

describe('attack chain data', () => {
  it('runs the six stages PROMPT.md specifies, in order', () => {
    expect(ATTACK_CHAIN.map((s) => s.id)).toEqual([
      'delivery',
      'user-action',
      'credential-capture',
      'suspicious-login',
      'execution',
      'alert',
    ]);
    expect(ATTACK_CHAIN.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('lays the chain out left to right', () => {
    const xs = ATTACK_CHAIN.map((s) => s.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('gives every stage evidence, detection signals, and a control', () => {
    for (const s of ATTACK_CHAIN) {
      expect(s.evidence.length, `${s.id} has no evidence`).toBeGreaterThan(0);
      expect(s.detection.length, `${s.id} has no detection signals`).toBeGreaterThan(0);
      expect(s.controlThatShouldCatchIt.length).toBeGreaterThan(10);
    }
  });

  it('cross-links every stage to a real Phase 2 defence layer', () => {
    const layers = new Set(DEFENCE_LAYERS.map((l) => l.title));
    for (const s of ATTACK_CHAIN) {
      expect(layers, `${s.id} names an unknown layer "${s.defenceLayer}"`).toContain(
        s.defenceLayer
      );
    }
  });

  it('cross-links path stages to real Phase 1 connection-path stages', () => {
    const stages = new Set(PATH_STAGES.map((p) => p.id));
    for (const s of ATTACK_CHAIN) {
      if (s.pathStage) expect(stages).toContain(s.pathStage);
    }
  });

  it('counts every detection opportunity across the chain', () => {
    const expected = ATTACK_CHAIN.reduce((n, s) => n + s.detection.length, 0);
    expect(detectionOpportunityCount()).toBe(expected);
    expect(detectionOpportunityCount()).toBeGreaterThanOrEqual(6);
  });

  it('resolves a stage by id', () => {
    expect(getAttackStage('execution')?.title).toBe('Execution and beaconing');
    // @ts-expect-error probing an invalid id at runtime
    expect(getAttackStage('nope')).toBeUndefined();
  });
});

describe('Phase 3 simulated evidence', () => {
  it('separates the three password attacks by log shape', () => {
    expect(runCommand('show auth log brute-force').output).toMatch(/one account, one source/i);
    expect(runCommand('show auth log password-spraying').output).toMatch(
      /many accounts, ONE attempt each/i
    );
    expect(runCommand('show auth log credential-stuffing').output).toMatch(/MANY sources/i);
  });

  it('explains why lockout misses password spraying', () => {
    const teaches = PHASE_3_COMMANDS.find(
      (c) => c.match === 'show auth log password-spraying'
    )!.teaches!;
    expect(teaches).toMatch(/never trips account lockout/i);
    expect(teaches).toMatch(/across accounts/i);
  });

  it('shows ransomware deleting recovery before encrypting', () => {
    const out = runCommand('show ransomware indicators').output;
    const shadowLine = out.indexOf('shadow copies deleted');
    const renameLine = out.indexOf('File rename rate');
    expect(shadowLine).toBeGreaterThan(-1);
    expect(renameLine).toBeGreaterThan(shadowLine);
  });

  it('demonstrates a rootkit as a discrepancy between two vantage points', () => {
    const out = runCommand('show rootkit discrepancy').output;
    expect(out).toMatch(/hidden/);
    expect(out).toMatch(/OFFLINE DISK ANALYSIS/);
  });

  it('carries five phishing indicators in the sample headers', () => {
    const out = runCommand('show email headers phish-01').output;
    expect(out).toMatch(/spf=softfail/);
    expect(out).toMatch(/dkim=none/);
    expect(out).toMatch(/dmarc=none/);
    expect(out).toMatch(/Reply-To/);
    expect(out).toMatch(/Domain-Age: 4 days/);
  });

  it('ties the chain transcript back to the Phase 0 incident', () => {
    const teaches = PHASE_3_COMMANDS.find(
      (c) => c.match === 'trace attack chain phish-01'
    )!.teaches!;
    expect(teaches).toMatch(/Phase 0 incident/);
    expect(runCommand('trace attack chain phish-01').output).toContain('203.0.113.55');
  });
});

describe('AttackChainFallback2D', () => {
  it('renders one accessible control per stage', () => {
    render(<AttackChainFallback2D selectedId={null} brokenIds={[]} onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^Inspect stage / })).toHaveLength(
      ATTACK_CHAIN.length
    );
  });

  it('marks a broken stage in its accessible name and shows containment', () => {
    render(
      <AttackChainFallback2D selectedId={null} brokenIds={['user-action']} onSelect={() => {}} />
    );
    expect(screen.getByRole('button', { name: /User action, broken/ })).toBeInTheDocument();
    expect(screen.getByText(/CONTAINED at stage 2/)).toBeInTheDocument();
  });
});

describe('AttackChainView', () => {
  it('falls back to the 2D chain when WebGL is unavailable', () => {
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);
    expect(screen.getByTestId('attack-chain-fallback-2d')).toBeInTheDocument();
  });

  it('states the simulation-only disclaimer prominently', () => {
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);
    expect(screen.getByText('Simulation only.')).toBeInTheDocument();
    expect(
      screen.getByText(/No malicious code, credential capture, or attack tooling exists/)
    ).toBeInTheDocument();
  });

  it('reports an unbroken chain as reaching command and control', () => {
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);
    expect(screen.getByTestId('chain-status')).toHaveTextContent(/Chain complete/);
  });

  it('contains the attack at the first broken link', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);

    await user.click(
      screen.getByRole('button', { name: 'Break the chain at stage 2, User action' })
    );
    expect(screen.getByTestId('chain-status')).toHaveTextContent('Contained at stage 2');
  });

  it('reports containment at the earliest broken link, not the latest', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);

    await user.click(
      screen.getByRole('button', { name: 'Break the chain at stage 5, Execution and beaconing' })
    );
    expect(screen.getByTestId('chain-status')).toHaveTextContent('Contained at stage 5');

    // Breaking an earlier link should move containment earlier.
    await user.click(screen.getByRole('button', { name: 'Break the chain at stage 1, Delivery' }));
    expect(screen.getByTestId('chain-status')).toHaveTextContent('Contained at stage 1');
  });

  it('resets the chain', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);

    await user.click(screen.getByRole('button', { name: 'Break the chain at stage 1, Delivery' }));
    await user.click(screen.getByRole('button', { name: /Reset chain/ }));
    expect(screen.getByTestId('chain-status')).toHaveTextContent(/Chain complete/);
  });

  it('shows evidence, detection, and the mapped defence layer for a stage', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/attack-chain', '/attack-chain', <AttackChainView />);

    await user.click(screen.getByRole('button', { name: '5. Execution and beaconing' }));

    expect(screen.getByText('Evidence produced')).toBeInTheDocument();
    expect(screen.getByText(/netstat -ano showing PID 6644/)).toBeInTheDocument();
    expect(screen.getByText('Command and Control')).toBeInTheDocument();
  });
});

describe('Phase 3 labs run end to end', () => {
  it('surfaces the five phishing indicators in the analysis lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p3-lab-0', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'show email headers phish-01{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/spf=softfail/)).toBeInTheDocument();
    expect(within(transcript).getByText('Prepared sample evidence')).toBeInTheDocument();
  });

  it('distinguishes the password attacks in the investigation lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p3-lab-2', '/lab/:labId', <LabView />);

    const input = screen.getByLabelText('Simulated command input');
    await user.type(input, 'show auth log password-spraying{Enter}');
    await user.type(input, 'compare password attacks{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/312 accounts, one attempt each/)).toBeInTheDocument();
    expect(within(transcript).getByText(/Cross-account correlation/)).toBeInTheDocument();
  });

  it('reconstructs all six stages in the chain lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p3-lab-4', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'trace attack chain phish-01{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/\[6\] ALERT/)).toBeInTheDocument();
    expect(within(transcript).getByText(/NOTHING IS EXECUTED/)).toBeInTheDocument();
  });
});

describe('Phase 3 quizzes', () => {
  it('grades the malware lesson quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p3-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'A worm' }));
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('malware-types')).toBe(1);
  });

  it('tags every Phase 3 question with a recognised domain and concept', () => {
    for (const lesson of PHASE_3.lessons) {
      for (const q of lesson.quiz) {
        expect(q.domain, `${q.id} has no domain`).toBeTruthy();
        expect(q.conceptId, `${q.id} has no conceptId`).toBeTruthy();
      }
    }
  });
});
