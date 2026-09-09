// ---------------------------------------------------------------------------
// Simulation engine types
//
// SAFETY CONTRACT: nothing in src/sim/ executes a command, opens a socket, or
// touches the host. Every "tool output" is a lookup in a prepared table.
// ---------------------------------------------------------------------------

/** How a piece of output was produced. Always surfaced in the UI. */
export type Provenance = 'real' | 'simulated' | 'prepared';

export const PROVENANCE_LABELS: Record<Provenance, string> = {
  real: 'Real tool output',
  simulated: 'Simulated output',
  prepared: 'Prepared sample evidence',
};

export type SimCommand = {
  /**
   * Curriculum phase this artifact belongs to. Used to scope the in-lab `help`
   * listing so a learner is not shown — or spoiled by — evidence from phases
   * they have not reached. It does NOT scope the allowlist itself.
   */
  phase: number;
  /** Exact command string the learner types, normalised (lowercase, single-spaced). */
  match: string;
  /** Tool family, used for grouping and UI hints. */
  tool: 'windows' | 'linux' | 'nmap' | 'wireshark' | 'platform';
  provenance: Provenance;
  /** Multi-line output shown in the terminal. */
  output: string;
  /** Short teaching note shown beside the output. */
  teaches?: string;
};

export type SimOutput = {
  command: string;
  provenance: Provenance;
  output: string;
  teaches?: string;
  recognised: boolean;
};

export type StepStatus = 'pending' | 'active' | 'done';

export type LabRunState = {
  labId: string;
  /** Index of the step the learner is on. */
  cursor: number;
  stepStatus: StepStatus[];
  transcript: SimOutput[];
  startedAt: number;
  completedAt?: number;
};

export type VerificationResult = {
  passed: boolean;
  checks: { label: string; passed: boolean; detail: string }[];
};

/**
 * A command as written in a per-phase file. The phase number is applied once at
 * composition time in commands.ts rather than repeated on every entry.
 */
export type PreparedCommand = Omit<SimCommand, 'phase'>;
