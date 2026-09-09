import { useMemo, useState } from 'react';
import { PHASES } from '../data/curriculum';
import { generatePortfolio, generateProject } from '../lib/githubGenerator';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { Button, Card, PageHeader } from './ui';

type Mode = 'lab' | 'portfolio';

export function GitHubView() {
  const labs = useMemo(() => PHASES.flatMap((p) => p.labs), []);
  const [mode, setMode] = useState<Mode>('lab');
  const [labId, setLabId] = useState(labs[0]?.id ?? '');
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const evidence = useEvidenceStore((s) => s.evidence).filter((e) => e.labId === labId);
  const lab = labs.find((l) => l.id === labId);
  const project = useMemo(() => (lab ? generateProject(lab) : null), [lab]);
  const portfolio = useMemo(() => generatePortfolio(PHASES), []);

  const file = mode === 'lab' ? project?.files[activeFile] : portfolio.files[0];

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied; the textarea below remains selectable.
      setCopied(false);
    }
  };

  return (
    <>
      <PageHeader
        title="GitHub Portfolio Generator"
        subtitle="Turn a completed lab into a documented repository. Employers read repos, not certificates alone — this is the artifact that proves you did the work."
        actions={
          <>
            <Button variant={mode === 'lab' ? 'primary' : 'ghost'} onClick={() => setMode('lab')}>
              Single Lab
            </Button>
            <Button
              variant={mode === 'portfolio' ? 'primary' : 'ghost'}
              onClick={() => setMode('portfolio')}
            >
              Portfolio Overview
            </Button>
          </>
        }
      />

      {mode === 'lab' && (
        <Card className="mb-6">
          <label htmlFor="lab-select" className="block text-sm font-medium text-white">
            Lab
          </label>
          <select
            id="lab-select"
            value={labId}
            onChange={(e) => {
              setLabId(e.target.value);
              setActiveFile(0);
            }}
            className="mt-2 w-full max-w-md rounded border border-border bg-panel-2 p-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            {labs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          {project && (
            <p className="mt-3 text-sm text-muted">
              Repository name:{' '}
              <code className="rounded bg-panel-2 px-2 py-0.5 font-mono text-accent">
                {project.repoName}
              </code>{' '}
              · {project.files.length} files · {evidence.length} evidence artifact(s) captured
            </p>
          )}

          <p className="mt-3 text-xs text-muted">
            Generated documentation never contains credentials, keys, tokens, or personal data.
            Before publishing, confirm any evidence you paste in has been redacted the same way.
          </p>
        </Card>
      )}

      {mode === 'portfolio' && (
        <Card className="mb-6">
          <div data-testid="portfolio-summary">
            <p className="text-sm text-muted">
              <span className="font-mono text-accent">{portfolio.totalLabs}</span> labs across{' '}
              <span className="font-mono text-accent">{portfolio.totalPhases}</span> built phases,
              spanning <span className="font-mono text-accent">{portfolio.domains.length}</span>{' '}
              exam domains.
            </p>
            <ul className="mt-3 space-y-1">
              {portfolio.domains.map((d) => (
                <li key={d.examDomain} className="flex justify-between text-sm">
                  <span className="text-white">{d.examDomain}</span>
                  <span className="font-mono text-xs text-muted">{d.labCount} labs</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {mode === 'lab' && project && (
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Files</h2>
            <ul className="mt-3 space-y-1">
              {project.files.map((f, i) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setActiveFile(i)}
                    className={`w-full truncate rounded px-2 py-1.5 text-left font-mono text-xs transition-colors ${
                      i === activeFile
                        ? 'bg-panel-2 text-accent'
                        : 'text-muted hover:bg-panel-2 hover:text-white'
                    }`}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="truncate font-mono text-sm text-white">{file?.path}</h2>
              <Button variant="ghost" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded bg-soc-bg p-4 font-mono text-xs text-text">
              {file?.content}
            </pre>
          </Card>
        </div>
      )}

      {mode === 'portfolio' && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate font-mono text-sm text-white">{file?.path}</h2>
            <Button variant="ghost" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="mt-3 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded bg-soc-bg p-4 font-mono text-xs text-text">
            {file?.content}
          </pre>
        </Card>
      )}
    </>
  );
}
