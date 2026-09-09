// ---------------------------------------------------------------------------
// Governance, Risk & Compliance grading engine — Phase 17.
//
// Pure functions that grade the interactive exercises in GrcView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Risk Treatment Matching ----

export type RiskTreatment = 'avoid' | 'transfer' | 'mitigate' | 'accept';

export type RiskTreatmentScenario = {
  id: string;
  description: string;
  correct: RiskTreatment;
};

export const RISK_TREATMENT_SCENARIOS: RiskTreatmentScenario[] = [
  { id: 'rt-0', description: 'The company purchases cyber liability insurance to cover the financial cost of a future breach', correct: 'transfer' },
  { id: 'rt-1', description: 'Leadership decides not to launch a risky new IoT product line because the security risk is judged unacceptable', correct: 'avoid' },
  { id: 'rt-2', description: 'The company deploys MFA and endpoint encryption to reduce the likelihood and impact of account compromise', correct: 'mitigate' },
  { id: 'rt-3', description: 'Management formally documents a low-impact, low-likelihood risk and signs off on taking no further action', correct: 'accept' },
  { id: 'rt-4', description: 'The company outsources credit card processing entirely to a PCI-compliant payment provider', correct: 'transfer' },
  { id: 'rt-5', description: 'The company cancels a planned expansion into a region with an unacceptable level of political and cyber instability', correct: 'avoid' },
  { id: 'rt-6', description: 'The company deploys a web application firewall and patches a known vulnerability identified in a scan', correct: 'mitigate' },
  { id: 'rt-7', description: 'After all cost-effective mitigations are applied, the executive team formally accepts the remaining residual risk', correct: 'accept' },
];

export type RiskTreatmentResult = {
  scenarioId: string;
  chosen: RiskTreatment | undefined;
  correct: RiskTreatment;
  isCorrect: boolean;
};

export type RiskTreatmentGrade = {
  results: RiskTreatmentResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeRiskTreatment(answers: Record<string, RiskTreatment>): RiskTreatmentGrade {
  const results: RiskTreatmentResult[] = RISK_TREATMENT_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    chosen: answers[s.id],
    correct: s.correct,
    isCorrect: answers[s.id] === s.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Governance Document Hierarchy Classification ----

export type DocumentType = 'policy' | 'standard' | 'procedure' | 'guideline';

export type DocumentItem = {
  id: string;
  statement: string;
  correct: DocumentType;
  explanation: string;
};

export const DOCUMENT_ITEMS: DocumentItem[] = [
  { id: 'dg-0', statement: 'All employees must complete annual security awareness training as a condition of continued system access', correct: 'policy', explanation: 'A high-level, mandatory statement of management intent — a policy.' },
  { id: 'dg-1', statement: 'Passwords must be a minimum of 14 characters and rotated every 90 days', correct: 'standard', explanation: 'A specific, measurable, mandatory requirement that implements a policy — a standard.' },
  { id: 'dg-2', statement: 'Step-by-step instructions for provisioning a new user account in Active Directory, including which groups to assign', correct: 'procedure', explanation: 'Detailed, sequential how-to instructions — a procedure.' },
  { id: 'dg-3', statement: 'A recommended (not mandatory) approach for choosing a strong, memorable passphrase', correct: 'guideline', explanation: 'Advisory and not mandatory — a guideline.' },
  { id: 'dg-4', statement: 'The organisation will protect the confidentiality, integrity, and availability of all information assets', correct: 'policy', explanation: 'A broad, high-level statement of intent — a policy, not a specific control.' },
  { id: 'dg-5', statement: 'All production servers must run TLS 1.2 or higher', correct: 'standard', explanation: 'A specific, measurable, mandatory technical requirement — a standard.' },
  { id: 'dg-6', statement: 'Steps an analyst must follow, in order, when responding to a reported phishing email', correct: 'procedure', explanation: 'Sequential, actionable steps — a procedure.' },
  { id: 'dg-7', statement: 'A suggested (not required) approach for organising project files to improve team collaboration', correct: 'guideline', explanation: 'Advisory best practice, not mandatory — a guideline.' },
];

export type DocumentResult = {
  itemId: string;
  statement: string;
  chosen: DocumentType | undefined;
  correct: DocumentType;
  isCorrect: boolean;
  explanation: string;
};

export type DocumentGrade = {
  results: DocumentResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeDocumentHierarchy(answers: Record<string, DocumentType>): DocumentGrade {
  const results: DocumentResult[] = DOCUMENT_ITEMS.map((item) => ({
    itemId: item.id,
    statement: item.statement,
    chosen: answers[item.id],
    correct: item.correct,
    isCorrect: answers[item.id] === item.correct,
    explanation: item.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Governance Gap Audit ----

export type GrcGapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type GrcGapFinding = {
  id: string;
  area: string;
  description: string;
  severity: GrcGapSeverity;
  isGap: boolean;
  explanation: string;
};

export const GRC_GAP_FINDINGS: GrcGapFinding[] = [
  { id: 'gg-0', area: 'Risk Register', description: 'The risk register has not been reviewed or updated in over two years', severity: 'high', isGap: true, explanation: 'A stale risk register no longer reflects current threats, assets, or controls and cannot support real decisions.' },
  { id: 'gg-1', area: 'Risk Acceptance', description: 'Every accepted risk includes a documented business justification and executive sign-off', severity: 'low', isGap: false, explanation: 'This is correct — risk acceptance must be a deliberate, documented, and accountable decision, not silence.' },
  { id: 'gg-2', area: 'Policy', description: 'Security policies exist but have never been formally approved by executive management', severity: 'high', isGap: true, explanation: 'An unapproved policy has no authority and cannot be enforced — approval is what makes it a policy rather than a draft.' },
  { id: 'gg-3', area: 'Vendor Risk', description: 'Vendor contracts for critical suppliers include a right-to-audit clause', severity: 'low', isGap: false, explanation: 'This is correct — a right-to-audit clause lets the organisation verify a vendor\'s controls directly rather than relying on trust alone.' },
  { id: 'gg-4', area: 'Vendor Risk', description: 'A third-party vendor with direct access to customer data has never completed a security questionnaire', severity: 'critical', isGap: true, explanation: 'Granting data access without any vendor risk assessment extends the organisation\'s attack surface with zero visibility.' },
  { id: 'gg-5', area: 'BIA', description: 'The business impact analysis identifies critical processes and their maximum tolerable downtime', severity: 'low', isGap: false, explanation: 'This is correct — identifying criticality and MTD is exactly what a BIA is for.' },
  { id: 'gg-6', area: 'Awareness', description: 'Employees receive security awareness training once during onboarding and never again', severity: 'medium', isGap: true, explanation: 'Threats and policies evolve; awareness training must be recurring (typically annual) to remain effective.' },
  { id: 'gg-7', area: 'Audit', description: 'An internal audit finding from 18 months ago remains open with no remediation plan or target date', severity: 'high', isGap: true, explanation: 'An audit finding without a tracked remediation plan is a control failure the organisation has chosen to ignore, not fix.' },
  { id: 'gg-8', area: 'Compliance', description: 'The compliance program maps each regulatory requirement to a specific internal control that satisfies it', severity: 'low', isGap: false, explanation: 'This is correct — a control-to-requirement mapping is how a compliance program demonstrates coverage, not just intent.' },
  { id: 'gg-9', area: 'Policy', description: 'A department\'s standard document contradicts the parent policy it is supposed to implement', severity: 'medium', isGap: true, explanation: 'Standards must implement, not contradict, their parent policy; a conflict means one of the two documents is wrong and creates enforcement ambiguity.' },
];

export type GrcGapResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: GrcGapSeverity;
};

export type GrcGapGrade = {
  results: GrcGapResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeGrcGaps(answers: Record<string, boolean>): GrcGapGrade {
  const results: GrcGapResult[] = GRC_GAP_FINDINGS.map((f) => ({
    findingId: f.id,
    description: `${f.area}: ${f.description}`,
    chosen: answers[f.id],
    correct: f.isGap,
    isCorrect: answers[f.id] === f.isGap,
    explanation: f.explanation,
    severity: f.severity,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}
