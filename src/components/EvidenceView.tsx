import { Trash2 } from 'lucide-react';
import { getLab } from '../data/curriculum';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { Card, EmptyState, PageHeader } from './ui';

const TYPE_TONE: Record<string, string> = {
  text: 'text-accent',
  log: 'text-warn',
  screenshot: 'text-accent-2',
  report: 'text-ok',
};

export function EvidenceView() {
  const evidence = useEvidenceStore((s) => s.evidence);
  const removeEvidence = useEvidenceStore((s) => s.removeEvidence);

  const byLab = evidence.reduce<Record<string, typeof evidence>>((acc, item) => {
    (acc[item.labId] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Evidence Locker"
        subtitle="Artifacts captured from labs. In a real engagement this is what backs a finding — undated, unsourced evidence is not evidence."
      />

      {evidence.length === 0 ? (
        <EmptyState
          title="No evidence captured"
          body="Run a lab and save an artifact from the evidence capture panel."
        />
      ) : (
        Object.entries(byLab).map(([labId, items]) => (
          <section key={labId} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              {getLab(labId)?.title ?? labId}
            </h2>
            <div className="space-y-3">
              {items
                .slice()
                .sort((a, b) => b.capturedAt - a.capturedAt)
                .map((item) => (
                  <Card key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${TYPE_TONE[item.type] ?? 'text-muted'}`}
                          >
                            {item.type}
                          </span>
                          <span className="font-mono text-xs text-muted">
                            {new Date(item.capturedAt).toLocaleString()}
                          </span>
                        </div>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-soc-bg p-3 font-mono text-xs text-text">
                          {item.content}
                        </pre>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEvidence(item.id)}
                        aria-label={`Delete evidence ${item.label}`}
                        className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-panel-2 hover:text-danger"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </Card>
                ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
