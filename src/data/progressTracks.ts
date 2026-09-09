// ---------------------------------------------------------------------------
// Progress tracks.
//
// PROMPT.md's progress dashboard reports percentages against subject areas
// ("Foundations", "IAM", "Cryptography", ...) rather than against phase
// numbers. Those names do not map one-to-one onto phases — Security Operations
// spans six phases, IAM spans two — so the mapping is declared here once and
// asserted complete by a test: every built phase belongs to exactly one track,
// so no phase's work is invisible on the dashboard and none is double-counted.
// ---------------------------------------------------------------------------

export type ProgressTrack = {
  id: string;
  /** The label PROMPT.md's dashboard uses. */
  label: string;
  phaseNumbers: number[];
};

export const PROGRESS_TRACKS: ProgressTrack[] = [
  { id: 'foundations', label: 'Foundations', phaseNumbers: [0, 1, 2] },
  { id: 'threats', label: 'Threats', phaseNumbers: [3, 13] },
  { id: 'architecture', label: 'Architecture', phaseNumbers: [4, 11, 15] },
  { id: 'iam', label: 'IAM', phaseNumbers: [5, 27] },
  { id: 'cryptography', label: 'Cryptography', phaseNumbers: [6] },
  { id: 'secops', label: 'Security Operations', phaseNumbers: [7, 8, 9, 21, 22, 23] },
  { id: 'vulnmgmt', label: 'Vulnerability Management', phaseNumbers: [10, 19] },
  { id: 'ir', label: 'Incident Response', phaseNumbers: [12] },
  { id: 'cloud', label: 'Cloud Security', phaseNumbers: [14] },
  { id: 'appdata', label: 'Application & Data Security', phaseNumbers: [16] },
  { id: 'governance', label: 'Governance / Risk', phaseNumbers: [17, 18] },
  { id: 'automation', label: 'Automation', phaseNumbers: [20] },
  { id: 'career', label: 'Exam & Career', phaseNumbers: [24, 25, 26] },
];

export function trackForPhase(phaseNumber: number): ProgressTrack | undefined {
  return PROGRESS_TRACKS.find((t) => t.phaseNumbers.includes(phaseNumber));
}
