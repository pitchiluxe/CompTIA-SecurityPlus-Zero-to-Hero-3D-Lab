import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PHASE_8 } from '../src/data/phase8';
import { PHASE_9 } from '../src/data/phase9';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_9_COMMANDS } from '../src/sim/phase9Commands';
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

describe('Phase 9 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_9.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'users',
      'groups',
      'permission',
      'sudo',
      'process',
      'service',
      'systemd',
      'ssh',
      'log',
      'file permission',
      'firewall',
      'package management',
      'secure configuration',
    ];

    for (const topic of required) {
      expect(text, `Phase 9 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('delivers the five labs PROMPT.md specifies', () => {
    expect(PHASE_9.labs).toHaveLength(5);
    const titles = PHASE_9.labs.map((l) => l.title.toLowerCase());
    expect(titles.some((t) => t.includes('create users'))).toBe(true);
    expect(titles.some((t) => t.includes('permissions'))).toBe(true);
    expect(titles.some((t) => t.includes('harden ssh'))).toBe(true);
    expect(titles.some((t) => t.includes('authentication logs'))).toBe(true);
    expect(titles.some((t) => t.includes('suspicious activity'))).toBe(true);
  });

  it('scopes the hands-on labs to machines the learner owns', () => {
    const handsOn = PHASE_9.labs.filter((l) => l.id === 'p9-lab-0' || l.id === 'p9-lab-2');
    expect(handsOn).toHaveLength(2);

    for (const lab of handsOn) {
      const text = [
        lab.environment,
        ...lab.steps.map((s) => `${s.instruction} ${s.expected ?? ''}`),
      ]
        .join(' ')
        .toLowerCase();
      expect(text, `${lab.id} does not scope work to an owned machine`).toMatch(
        /you own|own vm|authorised to administer/
      );
    }
  });

  it('closes with an explicit mapping onto the Windows phase', () => {
    const mapping = PHASE_9.lessons[PHASE_9.lessons.length - 1];
    expect(mapping.concepts).toContain('platform-mapping');

    const text = mapping.sections
      .map((section) => section.body)
      .join(' ')
      .toLowerCase();
    for (const term of ['uid 0', 'sudo', 'auditd', 'sysmon', 'systemd']) {
      expect(text, `mapping lesson never mentions "${term}"`).toContain(term);
    }
  });
});

describe('Phase 9 simulated evidence', () => {
  it('redacts password hashes rather than fabricating them', () => {
    const out = runCommand('cat /etc/shadow').output;
    expect(out).toContain('[REDACTED]');
    // A real SHA-512 crypt hash is ~86 chars after the $6$ prefix; assert none.
    expect(out).not.toMatch(/\$6\$[./A-Za-z0-9]{20,}/);
  });

  it('contrasts a scoped sudo grant with an unrestricted one', () => {
    expect(runCommand('sudo -l -u deploy').output).toMatch(/\(ALL : ALL\) NOPASSWD: ALL/);
    // The Phase 1 grant remains the scoped counterexample.
    expect(runCommand('sudo -l').output).toMatch(/systemctl restart nginx/);
  });

  it('surfaces the non-standard SUID binary among expected ones', () => {
    const out = runCommand('find / -perm -4000').output;
    expect(out).toContain('/usr/bin/sudo');
    expect(out).toContain('/usr/local/bin/backup-helper');
  });

  it('ties the SUID binary creation time to the intrusion window', () => {
    const out = runCommand('ls -la /usr/local/bin/backup-helper').output;
    expect(out).toMatch(/-rwsr-xr-x/);
    expect(out).toMatch(/two minutes after the Phase 7 intrusion/i);
  });

  it('explains that directory write permits deleting files you cannot write', () => {
    const out = runCommand('explain linux permissions').output;
    expect(out).toMatch(/create and DELETE entries/);
    expect(out).toMatch(/sticky/i);
  });

  it('identifies the SSH settings that make root brute-forceable', () => {
    const out = runCommand('show sshd config').output;
    expect(out).toMatch(/PermitRootLogin yes\s+<-- finding/);
    expect(out).toMatch(/PasswordAuthentication yes\s+<-- finding/);
  });

  it('warns about lockout ordering before disabling password authentication', () => {
    const out = runCommand('harden sshd').output;
    expect(out).toMatch(/ORDER MATTERS/);
    expect(out).toMatch(/confirm key-based login WORKS in a second session/i);
    expect(out).toMatch(/sshd -t/);
  });

  it('shows the compromise succeeding by key rather than by brute force', () => {
    const out = runCommand('show auth log linux').output;
    expect(out).toMatch(/Failed password for root/);
    expect(out).toMatch(/Accepted publickey for deploy/);
  });

  it('marks the systemd unit with all three persistence properties', () => {
    const out = runCommand('systemctl list-units suspicious').output;
    expect(out).toMatch(/User=root/);
    expect(out).toMatch(/Restart=always/);
    expect(out).toMatch(/WantedBy=multi-user\.target/);
  });

  it('flags the unauthenticated package repository', () => {
    const out = runCommand('show package status').output;
    expect(out).toMatch(/trusted=yes/);
    expect(out).toMatch(/http:\/\//);
    expect(out).toMatch(/signature check disabled/i);
  });

  it('names the auditd gaps the intrusion actually used', () => {
    const out = runCommand('show auditd rules').output;
    expect(out).toMatch(/NOT WATCHED/);
    expect(out).toMatch(/\/etc\/systemd\/system\//);
    expect(out).toMatch(/\/usr\/local\/bin\//);
  });

  it('maps Windows concepts onto Linux equivalents', () => {
    const out = runCommand('compare windows linux security').output;
    for (const pair of ['UID 0', 'sudo', 'auditd', 'systemd unit']) {
      expect(out).toContain(pair);
    }
    expect(out).toMatch(/Only the dialect changes/i);
  });

  it('labels every artifact with a provenance', () => {
    for (const c of PHASE_9_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
    }
  });

  it('contains no usable credential material', () => {
    const all = PHASE_9_COMMANDS.map((c) => `${c.output} ${c.teaches ?? ''}`).join('\n');
    expect(all).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(all).not.toMatch(/ssh-rsa AAAA[0-9A-Za-z+/]{20,}/);
    expect(all).not.toMatch(/password\s*[:=]\s*\S+/i);
  });
});

describe('cross-platform continuity with Phase 8', () => {
  it('describes the same intrusion on both hosts', () => {
    // Phase 8 found a scheduled task on WS-01; Phase 9 finds a systemd unit
    // and SUID binary on SRV-01. Both must reference the same incident.
    const win = runCommand('get-scheduledtask suspicious').output;
    const lin = runCommand('systemctl list-units suspicious').output;
    expect(win).toMatch(/2026-09-08 02:5\d/);
    expect(lin).toMatch(/2026-09-08 02:5\d/);
  });

  it('gives both platforms an equivalent persistence lesson', () => {
    const winLab = PHASE_8.labs.find((l) => l.id === 'p8-lab-3')!;
    const linLab = PHASE_9.labs.find((l) => l.id === 'p9-lab-4')!;
    expect(winLab.securityLesson.toLowerCase()).toContain('persistence');
    expect(linLab.securityLesson.toLowerCase()).toContain('persistence');
  });

  it('keeps the Phase 1 sudo grant consistent with the Phase 9 review', () => {
    // analyst1 held one scoped command in Phase 1; Phase 9 uses that as the
    // counterexample to deploy's unrestricted grant.
    expect(runCommand('sudo -l').output).toMatch(/systemctl restart nginx/);
    expect(runCommand('getent group sudo').output).toContain('analyst1');
  });
});

describe('Phase 9 labs and quizzes', () => {
  it('surfaces the unrestricted sudo grant in the users lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p9-lab-0', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'sudo -l -u deploy{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/NOPASSWD: ALL/).length).toBeGreaterThan(0);
    expect(
      within(transcript).getByText(/Matching Defaults entries for deploy/)
    ).toBeInTheDocument();
  });

  it('surfaces the SUID binary in the permissions lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p9-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'find / -perm -4000{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/backup-helper/).length).toBeGreaterThan(0);
    expect(within(transcript).getByText(/8 SUID binaries found/)).toBeInTheDocument();
  });

  it('shows the lockout warning in the SSH hardening lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p9-lab-2', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'harden sshd{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/ORDER MATTERS/)).toBeInTheDocument();
  });

  it('grades the permissions quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p9-lesson-1', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'Yes — deletion modifies the directory, not the file, unless the sticky bit is set',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('file-permissions')).toBe(1);
  });

  it('tags every Phase 9 question with a domain and concept', () => {
    for (const lesson of PHASE_9.lessons) {
      for (const q of lesson.quiz) {
        expect(q.domain, `${q.id} has no domain`).toBeTruthy();
        expect(q.conceptId, `${q.id} has no conceptId`).toBeTruthy();
      }
    }
  });
});
