// ---------------------------------------------------------------------------
// Security Automation grading engine — Phase 20.
//
// Pure functions that grade the interactive exercises in AutomationView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- IOC Type Classification ----

export type IocType = 'ip' | 'domain' | 'md5' | 'sha256' | 'url';

export type IocItem = {
  id: string;
  value: string;
  correct: IocType;
};

export const IOC_ITEMS: IocItem[] = [
  { id: 'ioc-0', value: '203.0.113.45', correct: 'ip' },
  { id: 'ioc-1', value: 'malicious-update-server.example', correct: 'domain' },
  { id: 'ioc-2', value: 'd41d8cd98f00b204e9800998ecf8427e', correct: 'md5' },
  { id: 'ioc-3', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', correct: 'sha256' },
  { id: 'ioc-4', value: 'hxxps://malicious-site[.]example/payload.exe', correct: 'url' },
  { id: 'ioc-5', value: '198.51.100.23', correct: 'ip' },
  { id: 'ioc-6', value: 'c2-relay.badinfra.example', correct: 'domain' },
  { id: 'ioc-7', value: '5d41402abc4b2a76b9719d911017c592', correct: 'md5' },
  { id: 'ioc-8', value: 'http://phish-login.example/verify', correct: 'url' },
];

export type IocResult = {
  itemId: string;
  chosen: IocType | undefined;
  correct: IocType;
  isCorrect: boolean;
};

export type IocGrade = {
  results: IocResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeIocClassification(answers: Record<string, IocType>): IocGrade {
  const results: IocResult[] = IOC_ITEMS.map((i) => ({
    itemId: i.id,
    chosen: answers[i.id],
    correct: i.correct,
    isCorrect: answers[i.id] === i.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Automation Pipeline Stage Identification ----

export type PipelineStage = 'parsing' | 'detection' | 'enrichment' | 'reporting' | 'response';

export type PipelineItem = {
  id: string;
  description: string;
  correct: PipelineStage;
  explanation: string;
};

export const PIPELINE_ITEMS: PipelineItem[] = [
  { id: 'pl-0', description: 'A script reads a raw authentication log file line by line and extracts the timestamp, username, and source IP using a regular expression', correct: 'parsing', explanation: 'Extracting structured fields from unstructured text is the parsing stage.' },
  { id: 'pl-1', description: 'The script counts failed login attempts per source IP within a 10-minute window and flags any IP exceeding five attempts', correct: 'detection', explanation: 'Applying a threshold or rule to parsed data to identify a suspicious pattern is detection.' },
  { id: 'pl-2', description: "The script queries a threat-intelligence API to check whether the flagged IP has a known malicious reputation", correct: 'enrichment', explanation: 'Adding external context (reputation, geolocation, prior sightings) to a raw finding is enrichment.' },
  { id: 'pl-3', description: 'The script writes a structured summary of findings, evidence, and recommended remediation to a report file', correct: 'reporting', explanation: 'Turning findings into a structured, human-readable artifact is the reporting stage.' },
  { id: 'pl-4', description: 'The script automatically blocks the flagged IP at the firewall with no human review', correct: 'response', explanation: 'Taking an automated remediation action is the response stage — and this example specifically lacks the human-in-the-loop check a destructive action should require.' },
  { id: 'pl-5', description: "The script extracts every IP address, domain, and file hash mentioned in an incident ticket's free-text notes", correct: 'parsing', explanation: 'Extracting structured indicators from unstructured text is parsing, even when the source is a ticket rather than a log file.' },
  { id: 'pl-6', description: 'The script cross-references an extracted file hash against a malware database and adds a confidence score', correct: 'enrichment', explanation: 'Adding external context and a derived confidence score to a raw indicator is enrichment.' },
  { id: 'pl-7', description: 'The script opens a ticket in the case management system only after a human analyst confirms the finding', correct: 'response', explanation: 'This is still the response stage, but correctly gated behind human approval before any action is taken.' },
];

export type PipelineResult = {
  itemId: string;
  chosen: PipelineStage | undefined;
  correct: PipelineStage;
  isCorrect: boolean;
  explanation: string;
};

export type PipelineGrade = {
  results: PipelineResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradePipelineStage(answers: Record<string, PipelineStage>): PipelineGrade {
  const results: PipelineResult[] = PIPELINE_ITEMS.map((p) => ({
    itemId: p.id,
    chosen: answers[p.id],
    correct: p.correct,
    isCorrect: answers[p.id] === p.correct,
    explanation: p.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Automation Security Gap Audit ----

export type AutomationGapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AutomationGapFinding = {
  id: string;
  area: string;
  description: string;
  severity: AutomationGapSeverity;
  isGap: boolean;
  explanation: string;
};

export const AUTOMATION_GAP_FINDINGS: AutomationGapFinding[] = [
  { id: 'ag-0', area: 'Credential Handling', description: "The script's threat-intel API token is written directly in the source file rather than loaded from an environment variable or secrets manager", severity: 'critical', isGap: true, explanation: 'A hardcoded token is exposed to anyone who can read the source file or its version-control history.' },
  { id: 'ag-1', area: 'Credential Handling', description: 'The script reads its threat-intel API token from an environment variable set outside the source code', severity: 'low', isGap: false, explanation: 'This is correct — keeping the token out of the codebase is the baseline secure practice.' },
  { id: 'ag-2', area: 'Error Handling', description: 'The script has no error handling and crashes silently if the API returns a rate-limit response', severity: 'high', isGap: true, explanation: 'A script that fails silently on a rate-limit response can miss findings entirely with no indication anything went wrong.' },
  { id: 'ag-3', area: 'Logging', description: 'The script logs every action it takes, including timestamps, for audit purposes', severity: 'low', isGap: false, explanation: 'This is correct — an automation script should be as auditable as a human analyst\'s actions.' },
  { id: 'ag-4', area: 'Human-in-the-Loop', description: 'The script automatically and irreversibly disables a user account the moment it detects suspicious behaviour, with no human approval step', severity: 'critical', isGap: true, explanation: 'A destructive, hard-to-reverse action taken on an automated false positive can cause significant unnecessary business disruption.' },
  { id: 'ag-5', area: 'Human-in-the-Loop', description: 'The script requires human analyst approval before executing any destructive remediation action, such as disabling an account', severity: 'low', isGap: false, explanation: 'This is correct — human-in-the-loop approval is the standard safeguard before an irreversible automated action.' },
  { id: 'ag-6', area: 'Evidence Collection', description: 'The evidence-collection function does not record a hash of collected files, breaking chain-of-custody verification later', severity: 'high', isGap: true, explanation: 'Without a hash recorded at collection time, no one can later prove the evidence was not altered.' },
  { id: 'ag-7', area: 'Evidence Collection', description: 'The script computes and stores a SHA-256 hash of every piece of evidence it collects, alongside a timestamp', severity: 'low', isGap: false, explanation: 'This is correct — a hash plus timestamp at collection time is exactly what chain-of-custody verification requires.' },
  { id: 'ag-8', area: 'Resilience', description: "The script retries failed API calls indefinitely with no backoff, effectively hammering the vendor's API during an outage", severity: 'medium', isGap: true, explanation: 'Retrying without backoff can worsen an outage for the vendor and for every other consumer of that API, and may get the script\'s own access rate-limited or revoked.' },
  { id: 'ag-9', area: 'Input Validation', description: 'The script validates and sanitises data pulled from an external API before using it in further processing', severity: 'low', isGap: false, explanation: 'This is correct — data from any external source, even a trusted API, should be validated before it drives further automated decisions.' },
];

export type AutomationGapResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: AutomationGapSeverity;
};

export type AutomationGapGrade = {
  results: AutomationGapResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeAutomationGaps(answers: Record<string, boolean>): AutomationGapGrade {
  const results: AutomationGapResult[] = AUTOMATION_GAP_FINDINGS.map((f) => ({
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
