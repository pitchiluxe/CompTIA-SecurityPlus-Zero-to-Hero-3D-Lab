import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  BASELINE_ITEMS,
  CATEGORY_LABELS,
  COMPLIANT_COUNT,
  FINDING_COUNT,
  getBaselineItem,
  itemsInCategory,
  type BaselineCategory,
} from '../src/data/windowsBaseline';
import { PHASE_8 } from '../src/data/phase8';
import {
  countAudited,
  gradeAudit,
  isAuditComplete,
  type AuditAnswer,
} from '../src/lib/auditEngine';
import { HardeningAuditView } from '../src/components/HardeningAuditView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_8_COMMANDS } from '../src/sim/phase8Commands';
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

/** Classify every baseline item correctly. */
function perfectAudit(): AuditAnswer {
  return Object.fromEntries(BASELINE_ITEMS.map((i) => [i.id, i.verdict]));
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 8 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_8.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'windows account',
      'group',
      'permission',
      'ntfs',
      'uac',
      'defender',
      'firewall',
      'event',
      'powershell',
      'service',
      'process',
      'scheduled task',
      'registry',
      'sysmon',
      'active directory',
      'kerberos',
    ];

    for (const topic of required) {
      expect(text, `Phase 8 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('delivers the six labs PROMPT.md specifies', () => {
    expect(PHASE_8.labs).toHaveLength(6);
    const titles = PHASE_8.labs.map((l) => l.title.toLowerCase());
    expect(titles.some((t) => t.includes('users and groups'))).toBe(true);
    expect(titles.some((t) => t.includes('permissions'))).toBe(true);
    expect(titles.some((t) => t.includes('windows events'))).toBe(true);
    expect(titles.some((t) => t.includes('suspicious process'))).toBe(true);
    expect(titles.some((t) => t.includes('failed authentication'))).toBe(true);
    expect(titles.some((t) => t.includes('harden'))).toBe(true);
  });

  it('scopes the hands-on labs to machines the learner owns', () => {
    // PROMPT.md asks for hands-on work; CLAUDE.md requires owned/authorised
    // environments. Both hands-on labs must say so explicitly.
    const handsOn = PHASE_8.labs.filter((l) => l.id === 'p8-lab-0' || l.id === 'p8-lab-5');
    expect(handsOn).toHaveLength(2);

    for (const lab of handsOn) {
      const text = [
        lab.environment,
        ...lab.steps.map((s) => `${s.instruction} ${s.expected ?? ''}`),
        lab.challenge ?? '',
      ]
        .join(' ')
        .toLowerCase();
      expect(text, `${lab.id} does not scope work to an owned machine`).toMatch(
        /you own|own vm|authorised to administer/
      );
    }
  });
});

describe('Windows baseline data', () => {
  it('contains both findings and compliant settings', () => {
    expect(FINDING_COUNT).toBeGreaterThan(0);
    expect(COMPLIANT_COUNT).toBeGreaterThan(0);
    expect(FINDING_COUNT + COMPLIANT_COUNT).toBe(BASELINE_ITEMS.length);
  });

  it('covers every declared category', () => {
    for (const category of Object.keys(CATEGORY_LABELS) as BaselineCategory[]) {
      expect(itemsInCategory(category).length, `${category} has no items`).toBeGreaterThan(0);
    }
  });

  it('gives every finding a severity and every compliant item none', () => {
    for (const item of BASELINE_ITEMS) {
      if (item.verdict === 'finding') {
        expect(item.severity, `${item.id} is a finding with no severity`).toBeTruthy();
      } else {
        expect(item.severity, `${item.id} is compliant but carries a severity`).toBeUndefined();
      }
    }
  });

  it('gives every item a substantive rationale', () => {
    for (const item of BASELINE_ITEMS) {
      expect(item.rationale.length, `${item.id} rationale too thin`).toBeGreaterThan(60);
    }
  });

  it('includes the settings that look correct at the headline level', () => {
    // UAC enabled but elevating without prompting, and Defender healthy but
    // excluding C:\ — both are findings that a status dashboard would miss.
    const uac = BASELINE_ITEMS.find((i) => i.setting.includes('elevation prompt'))!;
    expect(uac.verdict).toBe('finding');
    expect(uac.severity).toBe('high');

    const exclusions = BASELINE_ITEMS.find((i) => i.setting === 'Exclusion paths')!;
    expect(exclusions.verdict).toBe('finding');
    expect(exclusions.currentValue).toContain('C:\\');
  });

  it('treats the scheduled task as a high-severity finding', () => {
    const task = BASELINE_ITEMS.find((i) => i.setting.includes('SystemHealthCheck'))!;
    expect(task.verdict).toBe('finding');
    expect(task.severity).toBe('high');
    expect(task.rationale).toMatch(/persistence/i);
  });

  it('flags the local administrator membership as undermining the baseline', () => {
    const admins = BASELINE_ITEMS.find((i) => i.setting.includes('local Administrators'))!;
    expect(admins.verdict).toBe('finding');
    expect(admins.severity).toBe('high');
    expect(admins.rationale).toMatch(/Phase 1/);
  });

  it('resolves an item by id', () => {
    expect(getBaselineItem('b02')?.verdict).toBe('finding');
    expect(getBaselineItem('nope')).toBeUndefined();
  });
});

describe('audit grading', () => {
  it('scores a perfect audit with no errors in either direction', () => {
    const result = gradeAudit(perfectAudit());
    expect(result.correctCount).toBe(BASELINE_ITEMS.length);
    expect(result.percentage).toBe(100);
    expect(result.missedFindings).toBe(0);
    expect(result.falseFindings).toBe(0);
    expect(result.missedHighSeverity).toBe(0);
  });

  it('names calling a real finding compliant a missed finding', () => {
    const answer = { ...perfectAudit() };
    const finding = BASELINE_ITEMS.find((i) => i.verdict === 'finding')!;
    answer[finding.id] = 'compliant';

    const result = gradeAudit(answer);
    expect(result.missedFindings).toBe(1);
    expect(result.falseFindings).toBe(0);
    expect(result.items.find((r) => r.itemId === finding.id)?.errorKind).toBe('missed-finding');
  });

  it('names flagging a compliant setting a false finding', () => {
    const answer = { ...perfectAudit() };
    const compliant = BASELINE_ITEMS.find((i) => i.verdict === 'compliant')!;
    answer[compliant.id] = 'finding';

    const result = gradeAudit(answer);
    expect(result.falseFindings).toBe(1);
    expect(result.missedFindings).toBe(0);
    expect(result.items.find((r) => r.itemId === compliant.id)?.errorKind).toBe('false-finding');
  });

  it('counts missed high-severity findings separately', () => {
    const answer = { ...perfectAudit() };
    const high = BASELINE_ITEMS.find((i) => i.verdict === 'finding' && i.severity === 'high')!;
    const low = BASELINE_ITEMS.find((i) => i.verdict === 'finding' && i.severity === 'low')!;
    answer[high.id] = 'compliant';
    answer[low.id] = 'compliant';

    const result = gradeAudit(answer);
    expect(result.missedFindings).toBe(2);
    expect(result.missedHighSeverity).toBe(1);
  });

  it('penalises flagging everything as a finding', () => {
    // An auditor who flags every setting is not auditing.
    const answer: AuditAnswer = Object.fromEntries(
      BASELINE_ITEMS.map((i) => [i.id, 'finding' as const])
    );
    const result = gradeAudit(answer);

    expect(result.correctCount).toBeLessThan(BASELINE_ITEMS.length);
    expect(result.falseFindings).toBe(COMPLIANT_COUNT);
  });

  it('penalises calling everything compliant', () => {
    const answer: AuditAnswer = Object.fromEntries(
      BASELINE_ITEMS.map((i) => [i.id, 'compliant' as const])
    );
    const result = gradeAudit(answer);

    expect(result.missedFindings).toBe(FINDING_COUNT);
    expect(result.missedHighSeverity).toBeGreaterThan(0);
  });

  it('handles an empty audit without crashing', () => {
    const result = gradeAudit({});
    expect(result.correctCount).toBe(0);
    expect(result.items.every((i) => !i.answered)).toBe(true);
  });

  it('tracks completeness and count', () => {
    expect(isAuditComplete({})).toBe(false);
    expect(countAudited({})).toBe(0);
    expect(isAuditComplete(perfectAudit())).toBe(true);
    expect(countAudited(perfectAudit())).toBe(BASELINE_ITEMS.length);
  });
});

describe('Phase 8 simulated evidence', () => {
  it('shows Defender healthy while exclusions disable it', () => {
    const status = runCommand('get-mpcomputerstatus').output;
    expect(status).toMatch(/RealTimeProtectionEnabled\s*:\s*True/);

    const exclusions = runCommand('get-mppreference exclusions').output;
    expect(exclusions).toMatch(/ExclusionPath\s*:\s*\{C:\\\}/);
    expect(exclusions).toMatch(/entire system drive/i);
  });

  it('shows UAC enabled with the prompt behaviour that defeats it', () => {
    const out = runCommand('get-uac settings').output;
    expect(out).toMatch(/EnableLUA\s*:\s*1/);
    expect(out).toMatch(/Elevate without prompting/);
  });

  it('shows the public firewall profile disabled', () => {
    const out = runCommand('get-netfirewallprofile').output;
    expect(out).toMatch(/Name\s*:\s*Public[\s\S]*Enabled\s*:\s*False/);
  });

  it('contrasts the malicious scheduled task with a legitimate one', () => {
    const out = runCommand('get-scheduledtask suspicious').output;
    expect(out).toMatch(/SystemHealthCheck/);
    expect(out).toMatch(/WindowStyle Hidden/);
    expect(out).toMatch(/GoogleUpdateTaskMachineUA/);
  });

  it('records that script block logging is disabled', () => {
    const out = runCommand('get-powershell logging').output;
    expect(out).toMatch(/Script block logging\s+Disabled/);
    expect(out).toMatch(/PowerShell 2\.0 engine\s+Installed/);
  });

  it('states the most-restrictive rule for NTFS and share permissions', () => {
    const out = runCommand('compare ntfs share permissions').output;
    expect(out).toMatch(/MOST RESTRICTIVE WINS/i);
  });

  it('sequences remediation with privilege removal first', () => {
    const out = runCommand('harden windows endpoint').output;
    expect(out).toMatch(/ORDER MATTERS/);
    expect(out).toMatch(/Remove the administrator membership FIRST/i);
    expect(out).toMatch(/treat SystemHealthCheck as an incident/i);
  });

  it('labels every artifact with a provenance', () => {
    for (const c of PHASE_8_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
    }
  });

  it('contains no credentials or key material', () => {
    const all = PHASE_8_COMMANDS.map((c) => `${c.output} ${c.teaches ?? ''}`).join('\n');
    expect(all).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(all).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
  });
});

describe('HardeningAuditView', () => {
  it('renders every baseline item grouped by category', () => {
    renderAt('/hardening', '/hardening', <HardeningAuditView />);

    // Category headings are h2; setting names are h3, and one setting shares
    // its name with its category.
    for (const label of Object.values(CATEGORY_LABELS)) {
      expect(screen.getByRole('heading', { level: 2, name: label })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /: Compliant$/ })).toHaveLength(
      BASELINE_ITEMS.length
    );
  });

  it('blocks submission until every item is classified', () => {
    renderAt('/hardening', '/hardening', <HardeningAuditView />);
    expect(screen.getByRole('button', { name: 'Submit audit' })).toBeDisabled();
    expect(screen.getByText(`0 of ${BASELINE_ITEMS.length} classified`)).toBeInTheDocument();
  });

  // Walks all 24 baseline items; accessible-name lookups dominate the runtime.
  it('grades a perfect audit and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/hardening', '/hardening', <HardeningAuditView />);

    for (const item of BASELINE_ITEMS) {
      const label = item.verdict === 'compliant' ? 'Compliant' : 'Finding';
      await user.click(screen.getByRole('button', { name: `${item.setting}: ${label}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit audit' }));

    expect(screen.getByTestId('audit-score')).toHaveTextContent(`${BASELINE_ITEMS.length}/`);
    expect(screen.getByTestId('missed-findings')).toHaveTextContent('0');
    expect(screen.getByTestId('false-findings')).toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('endpoint-hardening')).toBe(1);
  }, 20_000);

  it('reports false findings when the learner flags everything', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/hardening', '/hardening', <HardeningAuditView />);

    for (const item of BASELINE_ITEMS) {
      await user.click(screen.getByRole('button', { name: `${item.setting}: Finding` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit audit' }));

    expect(screen.getByTestId('false-findings')).toHaveTextContent(String(COMPLIANT_COUNT));
    expect(screen.getByTestId('missed-high')).toHaveTextContent('0');
  }, 20_000);

  it('calls out missed high-severity findings', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/hardening', '/hardening', <HardeningAuditView />);

    for (const item of BASELINE_ITEMS) {
      await user.click(screen.getByRole('button', { name: `${item.setting}: Compliant` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit audit' }));

    expect(screen.getByTestId('missed-findings')).toHaveTextContent(String(FINDING_COUNT));
    expect(screen.getByTestId('missed-high')).not.toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('configuration-audit')).toBe(0);
  }, 20_000);
});

describe('Phase 8 labs and quizzes', () => {
  it('exposes the Defender exclusion in the hardening lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p8-lab-5', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'get-mppreference exclusions{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/entire system drive/i)).toBeInTheDocument();
  });

  it('exposes the persistence task in the process lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p8-lab-3', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'get-scheduledtask suspicious{Enter}'
    );

    // The task name appears in both the output and the teaching note.
    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/SystemHealthCheck/).length).toBeGreaterThan(0);
    expect(within(transcript).getByText(/WindowStyle Hidden/)).toBeInTheDocument();
  });

  it('grades the privilege model quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p8-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'An administrator can disable the other controls — Defender, audit policy, event logs — so every remaining finding becomes advisory',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('windows-groups')).toBe(1);
  });
});
