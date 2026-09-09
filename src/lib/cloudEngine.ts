// ---------------------------------------------------------------------------
// Cloud Security grading engine — Phase 14.
//
// Pure functions that grade the interactive exercises in CloudSecurityView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Service Model Classification ----

export type ServiceModel = 'iaas' | 'paas' | 'saas';

export type CloudService = {
  id: string;
  name: string;
  description: string;
  correct: ServiceModel;
};

export const CLOUD_SERVICES: CloudService[] = [
  { id: 'cs-0', name: 'Amazon EC2', description: 'Virtual machines you manage (OS, middleware, apps)', correct: 'iaas' },
  { id: 'cs-1', name: 'Azure Virtual Machines', description: 'IaaS compute — you manage the guest OS up', correct: 'iaas' },
  { id: 'cs-2', name: 'AWS S3', description: 'Object storage — provider manages servers, you manage data and access', correct: 'iaas' },
  { id: 'cs-3', name: 'AWS Lambda', description: 'Serverless functions — you deploy code, provider manages everything else', correct: 'paas' },
  { id: 'cs-4', name: 'Azure App Service', description: 'Managed web hosting — deploy code, provider manages runtime and OS', correct: 'paas' },
  { id: 'cs-5', name: 'Google Cloud Run', description: 'Managed container execution — deploy a container, provider scales it', correct: 'paas' },
  { id: 'cs-6', name: 'Microsoft 365', description: 'Email, calendar, docs — you manage users and data', correct: 'saas' },
  { id: 'cs-7', name: 'Salesforce', description: 'CRM application — you configure and manage your data', correct: 'saas' },
  { id: 'cs-8', name: 'Slack', description: 'Team messaging — provider manages the entire application', correct: 'saas' },
];

export type ServiceModelResult = {
  serviceId: string;
  serviceName: string;
  chosen: ServiceModel | undefined;
  correct: ServiceModel;
  isCorrect: boolean;
};

export type ServiceModelGrade = {
  results: ServiceModelResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeServiceModels(answers: Record<string, ServiceModel>): ServiceModelGrade {
  const results: ServiceModelResult[] = CLOUD_SERVICES.map((svc) => ({
    serviceId: svc.id,
    serviceName: svc.name,
    chosen: answers[svc.id],
    correct: svc.correct,
    isCorrect: answers[svc.id] === svc.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Shared Responsibility Assignment ----

export type ResponsibilityOwner = 'provider' | 'customer' | 'shared';

export type ResponsibilityItem = {
  id: string;
  task: string;
  correct: ResponsibilityOwner;
  explanation: string;
};

export const RESPONSIBILITY_ITEMS: ResponsibilityItem[] = [
  { id: 'sr-0', task: 'Physical data centre security', correct: 'provider', explanation: 'The provider always owns the physical facility, power, cooling, and physical access controls.' },
  { id: 'sr-1', task: 'Hypervisor patching', correct: 'provider', explanation: 'The provider manages the virtualisation layer. Customers never patch the hypervisor.' },
  { id: 'sr-2', task: 'Guest OS patching (IaaS)', correct: 'customer', explanation: 'In IaaS, the customer manages the OS upward, including patching, hardening, and configuration.' },
  { id: 'sr-3', task: 'Data classification', correct: 'customer', explanation: 'The customer always decides what data is sensitive and how it should be handled. The provider offers tools, not decisions.' },
  { id: 'sr-4', task: 'IAM policy configuration', correct: 'customer', explanation: 'The customer defines who can access what. The provider gives you IAM; configuring it is your responsibility.' },
  { id: 'sr-5', task: 'Network backbone availability', correct: 'provider', explanation: 'The global network connecting regions and availability zones is the provider\'s infrastructure.' },
  { id: 'sr-6', task: 'Security group rules', correct: 'customer', explanation: 'Security groups are customer-configured firewalls. The provider provides the feature; the customer writes the rules.' },
  { id: 'sr-7', task: 'Encryption key management (CMK)', correct: 'customer', explanation: 'With customer-managed keys, the customer controls rotation, access policies, and revocation.' },
  { id: 'sr-8', task: 'S3 bucket access controls', correct: 'customer', explanation: 'Bucket policies and ACLs are the customer\'s configuration. A public bucket is a customer misconfiguration.' },
  { id: 'sr-9', task: 'Hardware decommissioning', correct: 'provider', explanation: 'The provider securely decommissions physical storage media per their compliance certifications.' },
];

export type ResponsibilityResult = {
  itemId: string;
  task: string;
  chosen: ResponsibilityOwner | undefined;
  correct: ResponsibilityOwner;
  isCorrect: boolean;
  explanation: string;
};

export type ResponsibilityGrade = {
  results: ResponsibilityResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeResponsibility(answers: Record<string, ResponsibilityOwner>): ResponsibilityGrade {
  const results: ResponsibilityResult[] = RESPONSIBILITY_ITEMS.map((item) => ({
    itemId: item.id,
    task: item.task,
    chosen: answers[item.id],
    correct: item.correct,
    isCorrect: answers[item.id] === item.correct,
    explanation: item.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Misconfiguration Audit ----

export type MisconfigSeverity = 'critical' | 'high' | 'medium' | 'low';

export type MisconfigFinding = {
  id: string;
  service: string;
  description: string;
  severity: MisconfigSeverity;
  isMisconfig: boolean;
  explanation: string;
};

export const MISCONFIG_FINDINGS: MisconfigFinding[] = [
  { id: 'mc-0', service: 'S3', description: 'Block Public Access disabled on customer-data bucket', severity: 'critical', isMisconfig: true, explanation: 'Customer PII is publicly readable. Enable all Block Public Access settings immediately.' },
  { id: 'mc-1', service: 'IAM', description: 'User admin-jsmith has Action: *, Resource: *', severity: 'critical', isMisconfig: true, explanation: 'Wildcard IAM policy violates least privilege. Replace with scoped service-specific policies.' },
  { id: 'mc-2', service: 'EC2', description: 'Security group sg-app allows SSH from 0.0.0.0/0', severity: 'high', isMisconfig: true, explanation: 'SSH open to the internet enables brute-force attacks. Restrict to bastion SG or management CIDR.' },
  { id: 'mc-3', service: 'RDS', description: 'Database lab-prod-db has encryption at rest disabled', severity: 'high', isMisconfig: true, explanation: 'Unencrypted database storing customer data fails compliance requirements. Snapshot, encrypt, and restore.' },
  { id: 'mc-4', service: 'Lambda', description: 'process-orders has DB password in environment variables', severity: 'high', isMisconfig: true, explanation: 'Hardcoded secrets are visible to anyone who can describe the function. Use Secrets Manager.' },
  { id: 'mc-5', service: 'API GW', description: '/api/internal/admin has no authentication', severity: 'critical', isMisconfig: true, explanation: 'Unauthenticated admin endpoint allows anyone to invoke admin functions. Add IAM or JWT auth.' },
  { id: 'mc-6', service: 'S3', description: 'lab-prod-assets has SSE-S3 encryption enabled', severity: 'low', isMisconfig: false, explanation: 'This is correctly configured — encryption at rest with AWS-managed keys.' },
  { id: 'mc-7', service: 'EC2', description: 'sg-web allows HTTPS (443) from 0.0.0.0/0', severity: 'low', isMisconfig: false, explanation: 'A web server must accept HTTPS from the public internet. This is expected and correct.' },
  { id: 'mc-8', service: 'CloudTrail', description: 'CloudTrail is enabled in single-region mode', severity: 'medium', isMisconfig: true, explanation: 'Single-region CloudTrail misses API activity in other regions. Enable multi-region or organisation trail.' },
  { id: 'mc-9', service: 'Secrets Mgr', description: 'db-creds-prod has not been rotated in 237 days', severity: 'high', isMisconfig: true, explanation: 'Stale credentials extend the window of compromise. Enable automatic rotation on a 30-60 day schedule.' },
];

export type MisconfigResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: MisconfigSeverity;
};

export type MisconfigGrade = {
  results: MisconfigResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeMisconfigs(answers: Record<string, boolean>): MisconfigGrade {
  const results: MisconfigResult[] = MISCONFIG_FINDINGS.map((f) => ({
    findingId: f.id,
    description: `${f.service}: ${f.description}`,
    chosen: answers[f.id],
    correct: f.isMisconfig,
    isCorrect: answers[f.id] === f.isMisconfig,
    explanation: f.explanation,
    severity: f.severity,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}
