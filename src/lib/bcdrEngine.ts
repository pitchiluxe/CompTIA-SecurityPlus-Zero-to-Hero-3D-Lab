// ---------------------------------------------------------------------------
// Business Continuity & Disaster Recovery grading engine — Phase 18.
//
// Pure functions that grade the interactive exercises in BcdrView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Recovery Metric Classification ----

export type RecoveryMetric = 'rto' | 'rpo' | 'mttr' | 'mtbf';

export type MetricScenario = {
  id: string;
  description: string;
  correct: RecoveryMetric;
};

export const METRIC_SCENARIOS: MetricScenario[] = [
  { id: 'ms-0', description: 'The maximum acceptable time a system can be down before the business is unacceptably harmed', correct: 'rto' },
  { id: 'ms-1', description: 'The maximum acceptable amount of data loss, measured in time — e.g., losing at most 15 minutes of transactions', correct: 'rpo' },
  { id: 'ms-2', description: 'The average time it takes to repair a failed component and restore it to service', correct: 'mttr' },
  { id: 'ms-3', description: 'The average time a component is expected to operate before it fails', correct: 'mtbf' },
  { id: 'ms-4', description: 'A backup schedule is designed around this metric to ensure no more than 15 minutes of data is ever lost', correct: 'rpo' },
  { id: 'ms-5', description: 'A disaster recovery plan commits to restoring the payment system within 4 hours of an outage', correct: 'rto' },
  { id: 'ms-6', description: 'A hard drive vendor rates a drive at 1,000,000 hours between failures', correct: 'mtbf' },
  { id: 'ms-7', description: 'A post-incident review measures how long it took engineers to bring the service back online after the failure was detected', correct: 'mttr' },
];

export type MetricResult = {
  scenarioId: string;
  chosen: RecoveryMetric | undefined;
  correct: RecoveryMetric;
  isCorrect: boolean;
};

export type MetricGrade = {
  results: MetricResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeMetricClassification(answers: Record<string, RecoveryMetric>): MetricGrade {
  const results: MetricResult[] = METRIC_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    chosen: answers[s.id],
    correct: s.correct,
    isCorrect: answers[s.id] === s.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Alternate Site Selection ----

export type SiteType = 'hot' | 'warm' | 'cold' | 'cloud';

export type SiteScenario = {
  id: string;
  description: string;
  correct: SiteType;
  explanation: string;
};

export const SITE_SCENARIOS: SiteScenario[] = [
  { id: 'ss-0', description: 'A fully duplicated, continuously synchronised site that can take over within minutes, at the highest ongoing cost', correct: 'hot', explanation: 'Hot sites offer near-instant failover at the highest cost — appropriate only for the shortest RTOs.' },
  { id: 'ss-1', description: 'A site with basic infrastructure (power, network, some hardware) requiring hours to days to become operational, at moderate cost', correct: 'warm', explanation: 'Warm sites balance cost and recovery speed — some equipment exists but needs configuration and data restoration.' },
  { id: 'ss-2', description: 'An empty facility with power and connectivity but no pre-installed equipment, requiring the longest recovery time at the lowest cost', correct: 'cold', explanation: 'Cold sites are the cheapest option but require procuring and configuring everything from scratch — the slowest recovery.' },
  { id: 'ss-3', description: 'Recovery infrastructure is provisioned on demand from a public cloud provider, so cost scales with actual usage rather than idle capacity', correct: 'cloud', explanation: 'Cloud-based DR avoids paying for idle standby infrastructure, provisioning compute only when a disaster is declared.' },
  { id: 'ss-4', description: 'A trading platform with an RTO of 15 minutes selects this site type despite the high ongoing cost', correct: 'hot', explanation: 'An extremely short RTO like 15 minutes can only realistically be met by a hot site or equivalent active-active architecture.' },
  { id: 'ss-5', description: 'A company with an RTO of 3 days and a limited budget selects this site type', correct: 'cold', explanation: 'A multi-day RTO tolerance makes the slow, low-cost cold site an economically reasonable choice.' },
  { id: 'ss-6', description: 'A company wants to avoid maintaining idle physical infrastructure and instead spins up recovery servers only during an actual declared disaster', correct: 'cloud', explanation: 'This is the defining trait of cloud-based DR — infrastructure as code that stands up only when needed.' },
  { id: 'ss-7', description: 'A regional retailer needs recovery within about 24 hours and selects a site with some pre-installed servers that still require configuration', correct: 'warm', explanation: 'A roughly one-day RTO with partially ready infrastructure is the classic warm-site profile.' },
];

export type SiteResult = {
  scenarioId: string;
  chosen: SiteType | undefined;
  correct: SiteType;
  isCorrect: boolean;
  explanation: string;
};

export type SiteGrade = {
  results: SiteResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeSiteSelection(answers: Record<string, SiteType>): SiteGrade {
  const results: SiteResult[] = SITE_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    chosen: answers[s.id],
    correct: s.correct,
    isCorrect: answers[s.id] === s.correct,
    explanation: s.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- BC/DR Gap Audit ----

export type BcdrGapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type BcdrGapFinding = {
  id: string;
  area: string;
  description: string;
  severity: BcdrGapSeverity;
  isGap: boolean;
  explanation: string;
};

export const BCDR_GAP_FINDINGS: BcdrGapFinding[] = [
  { id: 'bg-0', area: 'Testing', description: 'The BC/DR plan has never been tested with a tabletop exercise or simulation', severity: 'high', isGap: true, explanation: 'An untested plan is a hypothesis, not a capability — the first real test should never be an actual disaster.' },
  { id: 'bg-1', area: 'Backups', description: 'Backups are taken nightly but restoration from those backups has never been tested', severity: 'critical', isGap: true, explanation: 'A backup that has never been restored is unverified — many organisations discover their backups were corrupt only during a real recovery attempt.' },
  { id: 'bg-2', area: 'Testing', description: 'The organisation performs an annual full-interruption test of its DR plan', severity: 'low', isGap: false, explanation: 'This is correct — full-interruption testing is the most rigorous validation that a plan actually works end to end.' },
  { id: 'bg-3', area: 'Backups', description: 'Backup media is stored only on-site, in the same building as the production servers', severity: 'critical', isGap: true, explanation: 'This violates the 3-2-1 rule — a single site disaster (fire, flood) destroys production and backups together.' },
  { id: 'bg-4', area: 'Backups', description: 'The organisation follows the 3-2-1 backup rule: 3 copies, on 2 different media types, with 1 copy offsite', severity: 'low', isGap: false, explanation: 'This is correct — 3-2-1 is the standard baseline for backup resilience.' },
  { id: 'bg-5', area: 'Alternate Site', description: 'The DR plan lists an alternate site, but the contract with that site provider expired 8 months ago', severity: 'critical', isGap: true, explanation: 'A DR plan that references an unavailable site provides false assurance — the plan is effectively unusable.' },
  { id: 'bg-6', area: 'High Availability', description: 'Critical systems use active-active redundancy across two regions with automatic failover', severity: 'low', isGap: false, explanation: 'This is correct — active-active with automatic failover is a strong, low-RTO high-availability design.' },
  { id: 'bg-7', area: 'Communications', description: 'The incident communication plan has no defined method for reaching employees if the primary email system is down', severity: 'high', isGap: true, explanation: 'A communication plan that depends entirely on the system most likely to be affected by the disaster is a single point of failure in the plan itself.' },
  { id: 'bg-8', area: 'Objectives', description: 'RTO and RPO values in the DR plan were derived directly from the Business Impact Analysis\'s MTD figures', severity: 'low', isGap: false, explanation: 'This is correct — recovery objectives should be driven by the business requirement (BIA/MTD), not chosen arbitrarily by IT.' },
  { id: 'bg-9', area: 'Ransomware', description: 'The ransomware recovery plan assumes backups are always available for restoration and does not consider that backups themselves might be encrypted by the attack', severity: 'critical', isGap: true, explanation: 'Modern ransomware specifically targets backup systems; a plan that does not verify immutable/offline backup copies exist has a fatal single point of failure.' },
];

export type BcdrGapResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: BcdrGapSeverity;
};

export type BcdrGapGrade = {
  results: BcdrGapResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeBcdrGaps(answers: Record<string, boolean>): BcdrGapGrade {
  const results: BcdrGapResult[] = BCDR_GAP_FINDINGS.map((f) => ({
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
