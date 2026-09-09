// ---------------------------------------------------------------------------
// Security Hardening grading engine — Phase 19.
//
// Pure functions that grade the interactive exercises in SecurityHardeningView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Control Category Classification ----

export type ControlCategory = 'firewall' | 'patching' | 'access-control' | 'logging' | 'service-minimization';

export type ControlItem = {
  id: string;
  description: string;
  correct: ControlCategory;
};

export const CONTROL_ITEMS: ControlItem[] = [
  { id: 'ci-0', description: 'Windows Firewall blocks inbound RDP from any address except the management subnet', correct: 'firewall' },
  { id: 'ci-1', description: 'WSUS is configured to auto-approve critical and security updates after a 3-day pilot ring', correct: 'patching' },
  { id: 'ci-2', description: "A former contractor's account remains in the local Administrators group six months after departure", correct: 'access-control' },
  { id: 'ci-3', description: 'PowerShell script block logging is enabled and forwarded to the SIEM', correct: 'logging' },
  { id: 'ci-4', description: 'Unattended-upgrades installs security patches nightly on all production Linux hosts', correct: 'patching' },
  { id: 'ci-5', description: 'The Bluetooth and CUPS printing services are disabled on a headless application server', correct: 'service-minimization' },
  { id: 'ci-6', description: 'auditd logs every sudo invocation and forwards logs to a central collector', correct: 'logging' },
  { id: 'ci-7', description: "A switch's unused access ports are administratively shut down", correct: 'service-minimization' },
  { id: 'ci-8', description: 'Router management access requires RADIUS-authenticated login with a role-based privilege level', correct: 'access-control' },
  { id: 'ci-9', description: 'A network ACL enforces an implicit deny after explicitly permitting only required management flows', correct: 'access-control' },
];

export type ControlResult = {
  itemId: string;
  chosen: ControlCategory | undefined;
  correct: ControlCategory;
  isCorrect: boolean;
};

export type ControlGrade = {
  results: ControlResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeControlCategory(answers: Record<string, ControlCategory>): ControlGrade {
  const results: ControlResult[] = CONTROL_ITEMS.map((c) => ({
    itemId: c.id,
    chosen: answers[c.id],
    correct: c.correct,
    isCorrect: answers[c.id] === c.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Platform Identification ----

export type Platform = 'windows' | 'linux' | 'network';

export type PlatformItem = {
  id: string;
  description: string;
  correct: Platform;
  explanation: string;
};

export const PLATFORM_ITEMS: PlatformItem[] = [
  { id: 'pi-0', description: 'Group Policy pushes a password complexity requirement to every domain-joined workstation', correct: 'windows', explanation: 'Group Policy is a Windows Active Directory mechanism for pushing configuration to domain-joined machines.' },
  { id: 'pi-1', description: 'SELinux enforcing mode blocks a compromised web server process from writing outside its designated directory', correct: 'linux', explanation: 'SELinux is a Linux kernel security module providing mandatory access control.' },
  { id: 'pi-2', description: 'An out-of-band management network is physically separate from the production data plane', correct: 'network', explanation: 'Out-of-band management is a network architecture pattern, independent of any single host OS.' },
  { id: 'pi-3', description: 'BitLocker with a TPM protects data at rest on laptop hard drives', correct: 'windows', explanation: 'BitLocker is a Windows-native full-disk encryption feature.' },
  { id: 'pi-4', description: 'AppArmor profiles restrict which files a specific daemon process can access', correct: 'linux', explanation: 'AppArmor is a Linux mandatory access control framework, an alternative to SELinux.' },
  { id: 'pi-5', description: '802.1X port-based authentication requires a device certificate before granting network access', correct: 'network', explanation: '802.1X is a network access control standard enforced at the switch port or wireless access point.' },
  { id: 'pi-6', description: 'Constrained Language Mode restricts PowerShell to a safe subset of commands for standard users', correct: 'windows', explanation: 'Constrained Language Mode is a PowerShell (Windows) execution restriction.' },
  { id: 'pi-7', description: 'nftables rules on a bastion host permit only SSH from a single management IP', correct: 'linux', explanation: 'nftables (successor to iptables) is a Linux kernel packet-filtering framework.' },
];

export type PlatformResult = {
  itemId: string;
  chosen: Platform | undefined;
  correct: Platform;
  isCorrect: boolean;
  explanation: string;
};

export type PlatformGrade = {
  results: PlatformResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradePlatformIdentification(answers: Record<string, Platform>): PlatformGrade {
  const results: PlatformResult[] = PLATFORM_ITEMS.map((p) => ({
    itemId: p.id,
    chosen: answers[p.id],
    correct: p.correct,
    isCorrect: answers[p.id] === p.correct,
    explanation: p.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Hardening Gap Audit ----

export type HardeningGapSeverity = 'critical' | 'high' | 'medium' | 'low';

export type HardeningGapFinding = {
  id: string;
  area: string;
  description: string;
  severity: HardeningGapSeverity;
  isGap: boolean;
  explanation: string;
};

export const HARDENING_GAP_FINDINGS: HardeningGapFinding[] = [
  { id: 'hg-0', area: 'Windows Patching', description: 'WSUS auto-approves critical and security updates after a 3-business-day pilot ring', severity: 'low', isGap: false, explanation: 'This is correct — a short pilot ring catches bad updates before fleet-wide deployment, without indefinitely delaying critical patches.' },
  { id: 'hg-1', area: 'Windows Patching', description: 'A domain workstation has not received a Windows update in 14 months', severity: 'critical', isGap: true, explanation: '14 months of missed patches means dozens of known, exploitable vulnerabilities remain open on that host.' },
  { id: 'hg-2', area: 'PowerShell', description: 'PowerShell script block logging and module logging are both enabled and forwarded to the SIEM', severity: 'low', isGap: false, explanation: 'This is correct — these logs are essential for detecting obfuscated or living-off-the-land PowerShell attacks.' },
  { id: 'hg-3', area: 'Access Control', description: "A former employee's account remains in the local Administrators group six months after departure", severity: 'critical', isGap: true, explanation: 'Standing privileged access for a departed employee is an active, unnecessary risk with no business justification.' },
  { id: 'hg-4', area: 'Linux Patching', description: 'Linux production hosts have unattended-upgrades enabled for the security repository only', severity: 'low', isGap: false, explanation: 'This is correct — auto-applying security-only updates balances currency against the risk of an untested non-security package breaking production.' },
  { id: 'hg-5', area: 'Service Minimization', description: 'A Linux web server runs 14 unnecessary services including Bluetooth and CUPS printing', severity: 'medium', isGap: true, explanation: 'Every unnecessary running service is additional attack surface with no corresponding business need on a headless server.' },
  { id: 'hg-6', area: 'Logging', description: "auditd is installed but its log forwarding to the central SIEM has been silently broken for 90 days with no alert", severity: 'high', isGap: true, explanation: 'A logging control that silently stops working is worse than having no control — it creates false confidence that events are being captured and reviewed.' },
  { id: 'hg-7', area: 'Network Management', description: 'Router management interfaces still accept Telnet in addition to SSH', severity: 'high', isGap: true, explanation: 'Telnet transmits credentials and session data in cleartext; leaving it enabled alongside SSH still exposes the same risk it was meant to replace.' },
  { id: 'hg-8', area: 'Network ACLs', description: 'Network ACLs use an explicit-permit, implicit-deny structure for all management traffic', severity: 'low', isGap: false, explanation: 'This is correct — explicit-permit with implicit deny is the standard, secure ACL design pattern.' },
  { id: 'hg-9', area: 'Segmentation', description: 'The network management plane shares the same VLAN as general user workstation traffic', severity: 'critical', isGap: true, explanation: 'A compromised user workstation on the same broadcast domain as management interfaces can directly attack network device administration.' },
];

export type HardeningGapResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: HardeningGapSeverity;
};

export type HardeningGapGrade = {
  results: HardeningGapResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeHardeningGaps(answers: Record<string, boolean>): HardeningGapGrade {
  const results: HardeningGapResult[] = HARDENING_GAP_FINDINGS.map((f) => ({
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
