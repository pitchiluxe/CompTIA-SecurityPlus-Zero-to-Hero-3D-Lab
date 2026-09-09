// ---------------------------------------------------------------------------
// CompTIA Security+ Zero-to-Hero 3D Lab Platform — Core types
// Aligned with CompTIA Security+ SY0-701 objectives
// ---------------------------------------------------------------------------

/** Mastery levels 0-6 (never encountered → teach) */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MasteryLevelKey =
  'never' | 'recognize' | 'understand' | 'explain' | 'apply' | 'implement' | 'teach';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: 'Never encountered',
  1: 'Recognize',
  2: 'Understand',
  3: 'Explain',
  4: 'Apply',
  5: 'Implement / Troubleshoot',
  6: 'Teach',
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: '#475569',
  1: '#64748b',
  2: '#3b82f6',
  3: '#0ea5e9',
  4: '#22c55e',
  5: '#84cc16',
  6: '#facc15',
};

/** Quiz question types */
export type QuizType = 'mcq' | 'scenario' | 'pbq';

export type QuizQuestion = {
  id: string;
  type: QuizType;
  stem: string;
  options?: string[];
  answer: number | number[];
  explanation: string;
  examClue?: string;
  domain?: string;
  conceptId?: string;
};

export type QuizResult = {
  questionId: string;
  correct: boolean;
  timeSpentMs: number;
  userAnswer?: number | number[];
};

/** Lesson section */
export type LessonSection = {
  id: string;
  title: string;
  body: string;
};

/** A lesson within a phase */
export type Lesson = {
  id: string;
  phaseId: string;
  title: string;
  objectives: string[];
  sections: LessonSection[];
  quiz: QuizQuestion[];
  concepts: string[];
  /**
   * Step 11 of the Master Learning Engine: what the learner does away from the
   * platform to convert understanding into practice. Required, because a lesson
   * without one quietly drops a step from the teaching loop.
   */
  homework: string;
  careerConnection?: string;
};

/** A lab within a phase */
export type Lab = {
  id: string;
  phaseId: string;
  title: string;
  objective: string;
  securityConcepts: string[];
  environment: string;
  topology: string;
  prerequisites: string[];
  steps: LabStep[];
  expectedResults: string[];
  verification: string[];
  troubleshooting: string[];
  challenge?: string;
  evidence: EvidenceTemplate[];
  securityLesson: string;
};

export type LabStep = {
  id: string;
  instruction: string;
  command?: string;
  expected?: string;
};

export type EvidenceTemplate = {
  id: string;
  label: string;
  type: 'text' | 'log' | 'screenshot' | 'report';
  placeholder: string;
};

/** A phase of the course */
export type Phase = {
  id: string;
  number: number;
  title: string;
  description: string;
  examDomain: string;
  lessons: Lesson[];
  labs: Lab[];
  scene?: string;
};

/** Progress record */
export type Progress = {
  phaseId: string;
  lessonId?: string;
  labId?: string;
  completed: boolean;
  score?: number;
  timestamp: number;
};

/** Mastery entry */
export type MasteryEntry = {
  conceptId: string;
  level: MasteryLevel;
  lastReviewed: number;
  nextReview: number;
  weak: boolean;
};

/** User note */
export type Note = {
  id: string;
  lessonId?: string;
  labId?: string;
  content: string;
  createdAt: number;
};

/** Evidence item */
export type EvidenceItem = {
  id: string;
  labId: string;
  label: string;
  type: 'text' | 'log' | 'screenshot' | 'report';
  content: string;
  capturedAt: number;
};

/** GitHub project generator output */
export type GitHubProject = {
  labId: string;
  repoName: string;
  files: GitHubProjectFile[];
  generatedAt: number;
};

export type GitHubProjectFile = {
  path: string;
  content: string;
};

/** 3D device types */
export type DeviceType =
  'pc' | 'server' | 'firewall' | 'switch' | 'router' | 'ap' | 'dc' | 'siem' | 'laptop';

export type DeviceStatus = 'up' | 'down' | 'alert' | 'warning';

export interface Interface {
  name: string;
  ip: string;
  mac: string;
  status: DeviceStatus;
}

export interface Device {
  id: string;
  type: DeviceType;
  label: string;
  position: [number, number, number];
  ip?: string;
  mac?: string;
  status: DeviceStatus;
  interfaces?: Interface[];
  users?: string[];
  securityState?: Record<string, unknown>;
  events?: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'alert';
  source: string;
  message: string;
}

/** Application view/route */
export type View =
  'dashboard' | 'roadmap' | 'lab' | 'quiz' | 'progress' | 'notes' | 'evidence' | 'soc' | 'github';

// ---------------------------------------------------------------------------
// Phase 2 — risk assessment scenarios
//
// The six fields a learner must separate for any business scenario. Keeping
// them as one union (rather than six independent questions) is deliberate: the
// options are drawn from a single shared pool, so placing one correctly means
// ruling it out for the other five.
// ---------------------------------------------------------------------------

export type RiskField = 'asset' | 'threat' | 'vulnerability' | 'risk' | 'control' | 'residualRisk';

export const RISK_FIELD_ORDER: RiskField[] = [
  'asset',
  'threat',
  'vulnerability',
  'risk',
  'control',
  'residualRisk',
];

export const RISK_FIELD_LABELS: Record<RiskField, string> = {
  asset: 'Asset',
  threat: 'Threat',
  vulnerability: 'Vulnerability',
  risk: 'Risk',
  control: 'Control',
  residualRisk: 'Residual risk',
};

export const RISK_FIELD_DEFINITIONS: Record<RiskField, string> = {
  asset: 'What has value and needs protecting.',
  threat: 'The actor or event that could cause harm. A threat exists whether or not you are weak.',
  vulnerability: 'The weakness a threat could exploit. A vulnerability is yours to fix.',
  risk: 'The likelihood a threat exploits the vulnerability, combined with the impact if it does.',
  control: 'The safeguard applied to reduce likelihood or impact.',
  residualRisk: 'What remains after the control is applied. It is never zero.',
};

export type ScenarioOption = {
  id: string;
  text: string;
  /** The one field this option correctly answers; null marks a pure distractor. */
  correctFor: RiskField | null;
  /** Shown after grading — why this belongs where it does, or why it does not. */
  rationale: string;
};

export type RiskScenario = {
  id: string;
  title: string;
  /** The business narrative the learner reasons over. */
  business: string;
  options: ScenarioOption[];
  /** Closing teaching note, shown once the scenario is submitted. */
  debrief: string;
  domain: string;
  conceptIds: string[];
};

export type ScenarioAnswer = Partial<Record<RiskField, string>>;

export type ScenarioFieldResult = {
  field: RiskField;
  chosenOptionId?: string;
  correctOptionId: string;
  correct: boolean;
  rationale: string;
};

export type ScenarioResult = {
  scenarioId: string;
  fields: ScenarioFieldResult[];
  correctCount: number;
  total: number;
  percentage: number;
};
