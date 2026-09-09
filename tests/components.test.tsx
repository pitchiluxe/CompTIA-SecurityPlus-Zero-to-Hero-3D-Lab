import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from '../src/components/Dashboard';
import { EvidenceView } from '../src/components/EvidenceView';
import { LabView } from '../src/components/LabView';
import { LessonView } from '../src/components/LessonView';
import { NotesView } from '../src/components/NotesView';
import { QuizView } from '../src/components/QuizView';
import { Roadmap } from '../src/components/Roadmap';
import { SOCView } from '../src/components/SOCView';
import { Fallback2D } from '../src/scenes/Fallback2D';
import { PHASE_OUTLINE, PHASES } from '../src/data/curriculum';
import { SOC_DEVICES } from '../src/data/socDevices';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useEvidenceStore } from '../src/store/useEvidenceStore';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useNotesStore } from '../src/store/useNotesStore';
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
  useNotesStore.setState({ notes: [] });
  useEvidenceStore.setState({ evidence: [] });
  // jsdom has no WebGL; the platform must take the 2D path rather than crash.
  __setWebGLAvailable(false);
});

describe('Dashboard', () => {
  it('shows the current phase and links to the next lesson', () => {
    renderAt('/', '/', <Dashboard />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/Phase 0 — Platform Foundation/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue lesson/ })).toHaveAttribute(
      'href',
      '/lesson/p0-lesson-0'
    );
  });

  it('reflects completed work in the phase percentage', async () => {
    useProgressStore.getState().markLessonComplete('phase-0', 'p0-lesson-0');
    renderAt('/', '/', <Dashboard />);

    // 1 lesson of 3 items (1 lesson + 2 labs) = 33%. The figure appears in both
    // the stat tile and the progress bar, so assert the bar's accessible value.
    expect(screen.getByRole('progressbar', { name: 'Phase completion' })).toHaveAttribute(
      'aria-valuenow',
      '33'
    );
    expect(screen.getAllByText('33%').length).toBeGreaterThan(0);
  });
});

describe('Roadmap', () => {
  it('lists every planned phase and the five exam domains', () => {
    renderAt('/roadmap', '/roadmap', <Roadmap />);

    // The domain title appears both in the domain table and on the Phase 0 card.
    expect(screen.getAllByText('General Security Concepts').length).toBeGreaterThan(0);
    expect(screen.getByText('Phase 0')).toBeInTheDocument();
    expect(screen.getByText('Phase 27')).toBeInTheDocument();
    // Invariant rather than a magic number: every outline entry without a
    // built phase renders as Planned, so this stays correct as phases land —
    // including now that every outlined phase is built and none remain.
    expect(screen.queryAllByText('Planned')).toHaveLength(PHASE_OUTLINE.length - PHASES.length);
  });
});

describe('SOC environment', () => {
  it('falls back to the 2D topology when WebGL is unavailable', () => {
    renderAt('/soc', '/soc', <SOCView />);

    expect(screen.getByTestId('fallback-2d')).toBeInTheDocument();
    expect(screen.getByText(/WebGL is unavailable/)).toBeInTheDocument();
  });

  it('surfaces the alerting endpoint in the needs-attention card', () => {
    renderAt('/soc', '/soc', <SOCView />);

    // WS-01 alerts on purpose — it is the host investigated in the triage lab.
    expect(screen.getByText('Needs attention')).toBeInTheDocument();
    expect(screen.getAllByText('Windows 11 Pro WS-01').length).toBeGreaterThan(0);
    expect(screen.getByText('alert')).toBeInTheDocument();
  });

  it('opens the device inspection panel from the device list', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc', '/soc', <SOCView />);

    await user.click(screen.getByRole('button', { name: 'Palo Alto PA-220' }));

    const panel = screen.getByTestId('device-panel');
    // 10.0.0.1 appears twice inside the panel (device IP and ethernet1/1), so
    // scope the assertion to the panel and allow both.
    expect(within(panel).getAllByText('10.0.0.1').length).toBeGreaterThan(0);
    expect(within(panel).getByText(/Status: UP/)).toBeInTheDocument();
  });
});

describe('Fallback2D', () => {
  it('renders one accessible control per device', () => {
    const seen: string[] = [];
    render(<Fallback2D devices={SOC_DEVICES} onInspect={(d) => seen.push(d.id)} />);

    const buttons = screen.getAllByRole('button', { name: /^Inspect / });
    expect(buttons).toHaveLength(SOC_DEVICES.length);
  });

  it('reports the inspected device on click', async () => {
    const user = userEvent.setup({ delay: null });
    const seen: string[] = [];
    render(<Fallback2D devices={SOC_DEVICES} onInspect={(d) => seen.push(d.id)} />);

    await user.click(screen.getAllByRole('button', { name: /^Inspect / })[0]);
    expect(seen).toHaveLength(1);
  });
});

describe('LessonView', () => {
  it('renders sections and objectives', () => {
    renderAt('/lesson/p0-lesson-0', '/lesson/:lessonId', <LessonView />);

    expect(
      screen.getByRole('heading', { name: /Welcome to the Security\+ Zero-to-Hero Platform/ })
    ).toBeInTheDocument();
    expect(screen.getByText(/Concept — Safe, simulated labs/)).toBeInTheDocument();
  });

  it('marks the lesson complete', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lesson/p0-lesson-0', '/lesson/:lessonId', <LessonView />);

    await user.click(screen.getByRole('button', { name: 'Mark complete' }));
    expect(useProgressStore.getState().isLessonComplete('phase-0', 'p0-lesson-0')).toBe(true);
  });

  it('saves a note against the lesson', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lesson/p0-lesson-0', '/lesson/:lessonId', <LessonView />);

    await user.type(screen.getByLabelText('Lesson note'), 'provenance matters');
    await user.click(screen.getByRole('button', { name: 'Save note' }));

    expect(useNotesStore.getState().notes[0]).toMatchObject({
      lessonId: 'p0-lesson-0',
      content: 'provenance matters',
    });
  });

  it('reports an unknown lesson id', () => {
    renderAt('/lesson/nope', '/lesson/:lessonId', <LessonView />);
    expect(screen.getByText('Lesson not found')).toBeInTheDocument();
  });
});

describe('LabView', () => {
  it('runs a recognised command and labels its provenance', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'ipconfig /all');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText('$ ipconfig /all')).toBeInTheDocument();
    expect(within(transcript).getByText('Prepared sample evidence')).toBeInTheDocument();
    expect(within(transcript).getByText(/192\.168\.1\.10/)).toBeInTheDocument();
  });

  it('submits on Enter as well as the Run button', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'whoami{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText('$ whoami')).toBeInTheDocument();
    // The input clears so the next command does not concatenate onto the last.
    expect(screen.getByLabelText('Simulated command input')).toHaveValue('');
  });

  it('advances the active step when the matching command is run', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-1', '/lab/:labId', <LabView />);

    expect(screen.getByRole('progressbar', { name: 'Lab steps complete' })).toHaveAttribute(
      'aria-valuenow',
      '0'
    );

    // Step 0 of this lab expects `ipconfig /all`.
    await user.type(screen.getByLabelText('Simulated command input'), 'ipconfig /all{Enter}');

    expect(screen.getByRole('progressbar', { name: 'Lab steps complete' })).toHaveAttribute(
      'aria-valuenow',
      '14'
    );
  });

  it('refuses a command outside the allowlist without executing it', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'rm -rf /');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    expect(screen.getByText(/no command is ever executed on your machine/)).toBeInTheDocument();
  });

  it('scopes help to this lab and this phase', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'help');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    const text = screen.getByTestId('lab-transcript').textContent ?? '';

    // The lab's own step commands are surfaced first.
    expect(text).toContain('Commands for this lab:');
    expect(text).toContain('* netstat -ano');

    // Phase 0 lab: later-phase evidence must not be listed. Showing it here is
    // both noise and a spoiler for material the learner has not reached.
    expect(text).not.toContain('show email headers phish-01');
    expect(text).not.toContain('assess risk northwind-vpn');
    expect(text).not.toContain('systeminfo');

    expect(text).toContain('This is a closed allowlist.');
  });

  it('widens the help listing for a later-phase lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p3-lab-0', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'help');
    await user.click(screen.getByRole('button', { name: 'Run' }));

    const text = screen.getByTestId('lab-transcript').textContent ?? '';

    expect(text).toContain('* show email headers phish-01');
    // Earlier phases stay available — the learner has reached them.
    expect(text).toContain('netstat -ano');
    expect(text).toContain('assess risk northwind-vpn');
  });

  it('does not verify a lab that was never worked', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-0', '/lab/:labId', <LabView />);

    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(screen.getByText(/Not yet — finish the outstanding checks/)).toBeInTheDocument();
    expect(useProgressStore.getState().isLabComplete('phase-0', 'p0-lab-0')).toBe(false);
  });

  it('captures evidence into the locker', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p0-lab-0', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText(/Device inspection log/), 'fw-01 up 10.0.0.1');
    await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    const stored = useEvidenceStore.getState().getEvidenceForLab('p0-lab-0');
    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe('fw-01 up 10.0.0.1');
  });
});

describe('QuizView', () => {
  it('reveals the explanation immediately in practice mode', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p0-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'General Security Concepts' }));

    expect(screen.getByText(/Phase 0 covers platform foundation/)).toBeInTheDocument();
    expect(screen.getByText('Correct')).toBeInTheDocument();
  });

  it('feeds graded concepts into the mastery ladder on submit', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p0-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'General Security Concepts' }));
    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));

    expect(useMasteryStore.getState().getLevel('curriculum')).toBe(1);
  });

  it('shows a scaled score and domain breakdown after submitting', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p0-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'General Security Concepts' }));
    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));

    expect(screen.getByText('Scaled score')).toBeInTheDocument();
    expect(screen.getByText('Domain breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('scaled-score')).toHaveTextContent('900');
  });

  it('hides answers until submission in mock exam mode', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p0-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'Mock exam' }));
    expect(screen.getByText('Time remaining')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'General Security Concepts' }));
    expect(screen.queryByText(/Phase 0 covers platform foundation/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit exam/ }));
    expect(screen.getByText(/Phase 0 covers platform foundation/)).toBeInTheDocument();
  });
});

describe('Notes and evidence views', () => {
  it('adds and removes a note', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/notes', '/notes', <NotesView />);

    await user.type(screen.getByLabelText('New note'), 'least privilege');
    await user.click(screen.getByRole('button', { name: 'Save note' }));
    expect(screen.getByText('least privilege')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete note' }));
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('groups captured evidence by lab', () => {
    useEvidenceStore.getState().addEvidence('p0-lab-0', 'Device log', 'log', 'fw-01 up');
    renderAt('/evidence', '/evidence', <EvidenceView />);

    expect(screen.getByText('Enter the SOC Environment')).toBeInTheDocument();
    expect(screen.getByText('fw-01 up')).toBeInTheDocument();
  });

  it('shows an empty state with no evidence', () => {
    renderAt('/evidence', '/evidence', <EvidenceView />);
    expect(screen.getByText('No evidence captured')).toBeInTheDocument();
  });
});
