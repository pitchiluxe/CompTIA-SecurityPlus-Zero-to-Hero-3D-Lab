// ---------------------------------------------------------------------------
// Application & Data Security grading engine — Phase 16.
//
// Pure functions that grade the interactive exercises in AppDataSecurityView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Vulnerability Classification ----

export type VulnCategory =
  | 'injection'
  | 'xss'
  | 'broken-auth'
  | 'broken-access-control'
  | 'security-misconfig'
  | 'sensitive-data-exposure';

export type VulnScenario = {
  id: string;
  description: string;
  correct: VulnCategory;
};

export const VULN_SCENARIOS: VulnScenario[] = [
  { id: 'vs-0', description: "A login form builds its query as \"SELECT * FROM users WHERE user='\" + input + \"'\" with no parameterisation", correct: 'injection' },
  { id: 'vs-1', description: 'A comment field echoes user input directly into the page HTML with no output encoding, allowing a <script> tag to execute for other viewers', correct: 'xss' },
  { id: 'vs-2', description: 'The password reset endpoint accepts a new password without verifying the old one or a time-limited reset token', correct: 'broken-auth' },
  { id: 'vs-3', description: "Changing the \"id\" parameter in /invoices/1042 to /invoices/1043 reveals another customer's invoice with no ownership check", correct: 'broken-access-control' },
  { id: 'vs-4', description: 'The production application server still exposes the framework\'s default admin console with the sample default credentials active', correct: 'security-misconfig' },
  { id: 'vs-5', description: 'Credit card numbers are stored in the database in plaintext instead of tokenised or encrypted at rest', correct: 'sensitive-data-exposure' },
  { id: 'vs-6', description: 'A search box passes user input straight into an OS shell command to grep a log file', correct: 'injection' },
  { id: 'vs-7', description: 'Session tokens do not expire and are not invalidated on logout, so a captured token remains valid indefinitely', correct: 'broken-auth' },
  { id: 'vs-8', description: 'A verbose error page returned to the public internet reveals the full stack trace, database version, and internal file paths', correct: 'security-misconfig' },
];

export type VulnResult = {
  scenarioId: string;
  chosen: VulnCategory | undefined;
  correct: VulnCategory;
  isCorrect: boolean;
};

export type VulnGrade = {
  results: VulnResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeVulnClassification(answers: Record<string, VulnCategory>): VulnGrade {
  const results: VulnResult[] = VULN_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    chosen: answers[s.id],
    correct: s.correct,
    isCorrect: answers[s.id] === s.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Data Classification Assignment ----

export type DataClassLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export type DataClassItem = {
  id: string;
  asset: string;
  correct: DataClassLevel;
  explanation: string;
};

export const DATA_CLASS_ITEMS: DataClassItem[] = [
  { id: 'dc-0', asset: 'Marketing brochure already published on the public website', correct: 'public', explanation: 'Already publicly released; no confidentiality control is needed.' },
  { id: 'dc-1', asset: 'Internal company org chart and employee directory', correct: 'internal', explanation: 'Not secret, but not meant for outside distribution — internal use only.' },
  { id: 'dc-2', asset: 'Customer database including names, emails, and purchase history', correct: 'confidential', explanation: 'Business-sensitive customer data requiring access controls and encryption.' },
  { id: 'dc-3', asset: 'Database of customer Social Security numbers and full payment card numbers', correct: 'restricted', explanation: 'Regulated PII/PCI data — the highest classification, with the strictest controls and smallest access list.' },
  { id: 'dc-4', asset: "Next quarter's unannounced product roadmap", correct: 'confidential', explanation: 'Business-sensitive and competitively damaging if leaked, but not regulated personal data.' },
  { id: 'dc-5', asset: 'Signed source code repository containing the encryption key management module', correct: 'restricted', explanation: 'Compromise of this code could undermine every other control in the system — restrict to the smallest possible group.' },
  { id: 'dc-6', asset: 'Company holiday schedule and cafeteria menu', correct: 'internal', explanation: 'Low sensitivity, but still not intended for public release.' },
  { id: 'dc-7', asset: "A press release scheduled for publication next week", correct: 'internal', explanation: 'Confidential only until its scheduled release; treat as internal-until-published, not public yet.' },
  { id: 'dc-8', asset: 'Electronic health records containing diagnoses and treatment history', correct: 'restricted', explanation: 'Regulated health data (e.g., HIPAA) — restricted classification with audit-logged access.' },
];

export type DataClassResult = {
  itemId: string;
  asset: string;
  chosen: DataClassLevel | undefined;
  correct: DataClassLevel;
  isCorrect: boolean;
  explanation: string;
};

export type DataClassGrade = {
  results: DataClassResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeDataClassification(answers: Record<string, DataClassLevel>): DataClassGrade {
  const results: DataClassResult[] = DATA_CLASS_ITEMS.map((item) => ({
    itemId: item.id,
    asset: item.asset,
    chosen: answers[item.id],
    correct: item.correct,
    isCorrect: answers[item.id] === item.correct,
    explanation: item.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Application / Data Protection Misconfiguration Audit ----

export type AppMisconfigSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AppMisconfigFinding = {
  id: string;
  area: string;
  description: string;
  severity: AppMisconfigSeverity;
  isMisconfig: boolean;
  explanation: string;
};

export const APP_MISCONFIG_FINDINGS: AppMisconfigFinding[] = [
  { id: 'am-0', area: 'Input Validation', description: 'All user input is validated and parameterised queries are used for every database call', severity: 'low', isMisconfig: false, explanation: 'This is correct — parameterised queries are the standard defence against SQL injection.' },
  { id: 'am-1', area: 'Session Mgmt', description: 'Session cookies are missing the Secure and HttpOnly flags', severity: 'high', isMisconfig: true, explanation: 'Without Secure, cookies can be sent over plain HTTP; without HttpOnly, client-side scripts (including injected XSS) can read the session cookie.' },
  { id: 'am-2', area: 'Authentication', description: 'Failed login attempts are rate-limited and lock the account after 5 attempts', severity: 'low', isMisconfig: false, explanation: 'This is correct — rate limiting and lockout are baseline defences against brute-force and credential-stuffing attacks.' },
  { id: 'am-3', area: 'Data at Rest', description: 'Customer payment card numbers are stored in the database in plaintext', severity: 'critical', isMisconfig: true, explanation: 'Cardholder data must be tokenised or encrypted at rest; plaintext storage fails PCI DSS outright.' },
  { id: 'am-4', area: 'Data Masking', description: 'The customer support UI displays a card number as "**** **** **** 4242" instead of the full number', severity: 'low', isMisconfig: false, explanation: 'This is correct — masking limits exposure to only the last four digits needed for support workflows.' },
  { id: 'am-5', area: 'DLP', description: 'A user emails a spreadsheet containing 10,000 customer SSNs to a personal Gmail account and no alert is generated', severity: 'critical', isMisconfig: true, explanation: 'This is exactly the exfiltration pattern DLP is meant to catch. Missing detection means DLP rules are not covering outbound email or personal domains.' },
  { id: 'am-6', area: 'API Security', description: 'The public API returns full user records including internal admin notes when only a display name was requested', severity: 'high', isMisconfig: true, explanation: 'Excessive data exposure — the API should return only the fields the caller needs, not the full internal object.' },
  { id: 'am-7', area: 'Encryption', description: 'All data in transit between the browser and the application uses TLS 1.2 or higher', severity: 'low', isMisconfig: false, explanation: 'This is correct — TLS 1.2+ is the accepted minimum for encryption in transit.' },
  { id: 'am-8', area: 'Access Control', description: 'Any authenticated user can access /admin/reports by directly typing the URL, with no role check', severity: 'critical', isMisconfig: true, explanation: 'Missing server-side authorisation (broken access control) — the UI may hide the link, but the endpoint itself must enforce the role check.' },
  { id: 'am-9', area: 'Retention', description: 'Customer records are retained indefinitely with no defined deletion schedule after account closure', severity: 'medium', isMisconfig: true, explanation: 'Data retained beyond its legal/business need increases breach impact and may violate data-minimisation requirements.' },
];

export type AppMisconfigResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: AppMisconfigSeverity;
};

export type AppMisconfigGrade = {
  results: AppMisconfigResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeAppMisconfigs(answers: Record<string, boolean>): AppMisconfigGrade {
  const results: AppMisconfigResult[] = APP_MISCONFIG_FINDINGS.map((f) => ({
    findingId: f.id,
    description: `${f.area}: ${f.description}`,
    chosen: answers[f.id],
    correct: f.isMisconfig,
    isCorrect: answers[f.id] === f.isMisconfig,
    explanation: f.explanation,
    severity: f.severity,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}
