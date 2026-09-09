// ---------------------------------------------------------------------------
// Phase 26 — Career Mode target roles.
//
// PROMPT.md names eight target roles and a seven-step workflow: extract
// skills, map to Security+ concepts, identify gaps, build targeted labs,
// generate interview questions, generate troubleshooting scenarios,
// recommend portfolio projects.
//
// Every conceptId below is a real, already-used conceptId elsewhere in this
// platform's quiz bank or lesson concept list — Career Mode maps roles onto
// concepts that already have lessons, labs, and mastery tracking behind them,
// rather than inventing a parallel skill taxonomy.
// ---------------------------------------------------------------------------

export type CareerSkill = {
  label: string;
  conceptIds: string[];
};

export type CareerRole = {
  id: string;
  title: string;
  summary: string;
  skills: CareerSkill[];
};

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'soc-analyst-1',
    title: 'SOC Analyst I',
    summary:
      'Entry-level analyst triaging alerts, correlating log sources, and escalating true positives within an established SOC.',
    skills: [
      { label: 'Alert triage and correlation', conceptIds: ['alert-correlation'] },
      { label: 'Incident response fundamentals', conceptIds: ['incident-response', 'containment'] },
      { label: 'Phishing and malware recognition', conceptIds: ['phishing'] },
      { label: 'Password attack recognition', conceptIds: ['password-spraying'] },
    ],
  },
  {
    id: 'junior-security-analyst',
    title: 'Junior Security Analyst',
    summary:
      'Generalist analyst supporting vulnerability management, architecture review, and incident documentation.',
    skills: [
      {
        label: 'Vulnerability management',
        conceptIds: ['vulnerability-management', 'cvss', 'patch-management'],
      },
      { label: 'Defense-in-depth and architecture', conceptIds: ['defense-in-depth'] },
      { label: 'Least privilege and access control', conceptIds: ['least-privilege'] },
      { label: 'Incident evidence handling', conceptIds: ['evidence-handling'] },
    ],
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    summary:
      'Broad analyst role covering malware/ransomware response, containment, and network-layer investigation.',
    skills: [
      { label: 'Ransomware and malware response', conceptIds: ['ransomware'] },
      { label: 'Lateral movement and containment', conceptIds: ['lateral-movement', 'containment'] },
      { label: 'Firewall and network review', conceptIds: ['firewall-misconfiguration'] },
      { label: 'DNS and traffic analysis', conceptIds: ['dns-tunnelling'] },
    ],
  },
  {
    id: 'security-operations-analyst',
    title: 'Security Operations Analyst',
    summary:
      'SOC-adjacent role focused on the full incident response lifecycle and change-history review.',
    skills: [
      { label: 'SIEM and alert correlation', conceptIds: ['alert-correlation'] },
      { label: 'Incident response lifecycle', conceptIds: ['incident-response', 'containment'] },
      { label: 'Ransomware response', conceptIds: ['ransomware'] },
      { label: 'Change history review', conceptIds: ['change-management'] },
    ],
  },
  {
    id: 'it-security-technician',
    title: 'IT Security Technician',
    summary:
      'Hands-on endpoint and infrastructure role covering patching, privilege management, and hardening.',
    skills: [
      { label: 'Patch and vulnerability management', conceptIds: ['patch-management', 'cvss'] },
      { label: 'Privilege escalation awareness', conceptIds: ['privilege-escalation'] },
      { label: 'Living-off-the-land awareness', conceptIds: ['living-off-the-land'] },
      { label: 'Least privilege enforcement', conceptIds: ['least-privilege'] },
    ],
  },
  {
    id: 'iam-analyst',
    title: 'IAM Analyst',
    summary:
      'Identity-focused analyst supporting account lifecycle, authentication, and access reviews.',
    skills: [
      { label: 'Account lifecycle', conceptIds: ['account-lifecycle', 'deprovisioning'] },
      { label: 'Authentication protocols', conceptIds: ['mfa', 'oauth', 'federation'] },
      { label: 'Identity providers', conceptIds: ['identity-provider'] },
      { label: 'Compromised account response', conceptIds: ['account-compromise'] },
    ],
  },
  {
    id: 'junior-iam-engineer',
    title: 'Junior IAM Engineer',
    summary:
      'Implementation-track IAM role covering provisioning, federation, and privileged access design.',
    skills: [
      { label: 'Identity lifecycle', conceptIds: ['deprovisioning', 'account-lifecycle'] },
      { label: 'Federation and SSO concepts', conceptIds: ['federation', 'identity-provider', 'oauth'] },
      { label: 'Least privilege and access control', conceptIds: ['least-privilege'] },
      { label: 'Shared credential risk', conceptIds: ['shared-credentials'] },
    ],
  },
  {
    id: 'security-support-specialist',
    title: 'Security Support Specialist',
    summary:
      'Front-line support role focused on recognising and escalating common security issues correctly.',
    skills: [
      {
        label: 'Phishing and password attack recognition',
        conceptIds: ['phishing', 'password-spraying'],
      },
      { label: 'Firewall and configuration troubleshooting', conceptIds: ['firewall-misconfiguration'] },
      { label: 'Vendor and third-party risk', conceptIds: ['vendor-risk'] },
      { label: 'MFA and authentication basics', conceptIds: ['mfa'] },
    ],
  },
];

export function getRole(id: string): CareerRole | undefined {
  return CAREER_ROLES.find((r) => r.id === id);
}
