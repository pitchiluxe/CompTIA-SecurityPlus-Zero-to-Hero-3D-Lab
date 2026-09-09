import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PHASES } from '../src/data/curriculum';
import { generatePortfolio, generateProject, repoNameFor } from '../src/lib/githubGenerator';
import { PHASE_25 } from '../src/data/phase25';
import { PHASE_25_COMMANDS } from '../src/sim/phase25Commands';
import { GitHubView } from '../src/components/GitHubView';
import { useProgressStore } from '../src/store/useProgressStore';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useEvidenceStore } from '../src/store/useEvidenceStore';
import { __setWebGLAvailable } from '../src/lib/webgl';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

function phaseText(): string {
  const lessons = PHASE_25.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_25.labs.flatMap((lab) => [
    lab.title,
    lab.objective,
    ...lab.securityConcepts,
    ...lab.steps.flatMap((s) => [s.instruction, s.expected, s.command ?? '']),
    ...lab.expectedResults,
    ...lab.verification,
    ...lab.troubleshooting,
    lab.challenge ?? '',
    lab.securityLesson,
  ]);
  const commands = PHASE_25_COMMANDS.flatMap((c) => [c.output, c.teaches ?? '']);
  return [...lessons, ...labs, ...commands].join('\n');
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  useEvidenceStore.setState({ evidence: [] });
  __setWebGLAvailable(false);
});

describe('githubGenerator — per-lab project', () => {
  const lab = PHASES[0].labs[0];

  it('produces the full nine-file PROMPT.md skeleton', () => {
    const project = generateProject(lab);
    const paths = project.files.map((f) => f.path);
    expect(paths).toEqual([
      'README.md',
      'architecture/overview.md',
      'configs/README.md',
      'screenshots/README.md',
      'evidence/README.md',
      'logs/README.md',
      'reports/README.md',
      'troubleshooting/README.md',
      'lessons-learned/README.md',
    ]);
  });

  it('derives the repo name identically via repoNameFor and generateProject', () => {
    const project = generateProject(lab);
    expect(project.repoName).toBe(repoNameFor(lab));
    expect(project.repoName).toMatch(/^[a-z0-9-]+$/);
  });

  it('pulls real findings, remediation, and validation content into reports/README.md', () => {
    const project = generateProject(lab);
    const reports = project.files.find((f) => f.path === 'reports/README.md')!;
    for (const result of lab.expectedResults) expect(reports.content).toContain(result);
    for (const item of lab.troubleshooting) expect(reports.content).toContain(item);
    for (const item of lab.verification) expect(reports.content).toContain(item);
  });

  it('includes a Technologies section listing the lab\'s security concepts', () => {
    const project = generateProject(lab);
    const readme = project.files.find((f) => f.path === 'README.md')!;
    expect(readme.content).toContain('## Technologies');
    for (const concept of lab.securityConcepts) expect(readme.content).toContain(concept);
  });

  it('never contains credential, key, or token material for any built lab', () => {
    const forbidden = [
      /BEGIN [A-Z ]*PRIVATE KEY/,
      /password\s*[:=]\s*\S+/i,
      /\bapi[_-]?key\s*[:=]/i,
      /secret\s*[:=]/i,
    ];
    for (const phase of PHASES) {
      for (const l of phase.labs) {
        const project = generateProject(l);
        for (const file of project.files) {
          for (const pattern of forbidden) {
            expect(file.content, `${project.repoName}/${file.path} matched ${pattern}`).not.toMatch(
              pattern
            );
          }
        }
      }
    }
  });
});

describe('githubGenerator — portfolio index', () => {
  it('counts every lab across every built phase exactly once', () => {
    const portfolio = generatePortfolio(PHASES);
    const expectedTotal = PHASES.reduce((sum, p) => sum + p.labs.length, 0);
    expect(portfolio.totalLabs).toBe(expectedTotal);
    expect(portfolio.totalPhases).toBe(PHASES.length);
  });

  it('groups labs by exam domain with no domain double-counted', () => {
    const portfolio = generatePortfolio(PHASES);
    const domainNames = portfolio.domains.map((d) => d.examDomain);
    expect(new Set(domainNames).size).toBe(domainNames.length);

    const sumAcrossDomains = portfolio.domains.reduce((sum, d) => sum + d.labCount, 0);
    expect(sumAcrossDomains).toBe(portfolio.totalLabs);
  });

  it('produces a single PORTFOLIO.md referencing every domain', () => {
    const portfolio = generatePortfolio(PHASES);
    expect(portfolio.files).toHaveLength(1);
    expect(portfolio.files[0].path).toBe('PORTFOLIO.md');
    for (const domain of portfolio.domains) {
      expect(portfolio.files[0].content).toContain(domain.examDomain);
    }
  });
});

describe('Phase 25 curriculum and safety', () => {
  it('has two lessons and two labs', () => {
    expect(PHASE_25.lessons).toHaveLength(2);
    expect(PHASE_25.labs).toHaveLength(2);
  });

  it('gives every prepared command a provenance and a substantial teaching note', () => {
    for (const command of PHASE_25_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(command.provenance);
      expect(command.teaches && command.teaches.length).toBeGreaterThan(40);
    }
  });

  it('contains no credential, key, or token material', () => {
    const text = phaseText();
    expect(text).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(text).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(text).not.toMatch(/\bapi[_-]?key\s*[:=]/i);
    expect(text).not.toMatch(/secret\s*[:=]/i);
  });
});

describe('GitHub Portfolio view', () => {
  it('defaults to Single Lab mode and lists every generated file', () => {
    renderAt('/github', '/github', <GitHubView />);
    expect(screen.getByLabelText('Lab')).toBeInTheDocument();
    expect(screen.getAllByText('README.md').length).toBeGreaterThan(0);
  });

  it('switches to Portfolio Overview mode and shows domain coverage', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/github', '/github', <GitHubView />);

    await user.click(screen.getByRole('button', { name: 'Portfolio Overview' }));

    const summary = screen.getByTestId('portfolio-summary');
    expect(summary).toBeInTheDocument();
    const expectedTotal = PHASES.reduce((sum, p) => sum + p.labs.length, 0);
    expect(summary.textContent).toContain(String(expectedTotal));
  });

  it('renders the PORTFOLIO.md content in Portfolio Overview mode', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/github', '/github', <GitHubView />);

    await user.click(screen.getByRole('button', { name: 'Portfolio Overview' }));

    expect(screen.getAllByText('PORTFOLIO.md').length).toBeGreaterThan(0);
  });

  it('switches back to Single Lab mode', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/github', '/github', <GitHubView />);

    await user.click(screen.getByRole('button', { name: 'Portfolio Overview' }));
    await user.click(screen.getByRole('button', { name: 'Single Lab' }));

    expect(screen.getByLabelText('Lab')).toBeInTheDocument();
  });
});
