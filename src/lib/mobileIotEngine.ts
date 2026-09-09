// ---------------------------------------------------------------------------
// Mobile / IoT / Embedded Security grading engine — Phase 15.
//
// Pure functions that grade the interactive exercises in MobileIotView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Device Ownership Model Classification ----

export type OwnershipModel = 'byod' | 'cobo' | 'cope' | 'cyod';

export type OwnershipScenario = {
  id: string;
  description: string;
  correct: OwnershipModel;
};

export const OWNERSHIP_SCENARIOS: OwnershipScenario[] = [
  { id: 'os-0', description: 'Employee uses a personal iPhone for email and Teams; IT manages only the work profile', correct: 'byod' },
  { id: 'os-1', description: 'Employees choose from three IT-approved laptop models; IT purchases, images, and owns every unit', correct: 'cyod' },
  { id: 'os-2', description: 'Company-issued handheld used exclusively for warehouse inventory scanning; no personal apps allowed', correct: 'cobo' },
  { id: 'os-3', description: 'Company-issued smartphone the employee may also use for personal calls, photos, and social media', correct: 'cope' },
  { id: 'os-4', description: "A sales rep's personal Android tablet is enrolled in MDM; the company can only wipe the work container", correct: 'byod' },
  { id: 'os-5', description: 'A field technician receives a locked-down ruggedised tablet solely for the work-order dispatch app', correct: 'cobo' },
  { id: 'os-6', description: 'New hires pick between three pre-approved phone models from an IT catalogue; IT retains ownership and control', correct: 'cyod' },
  { id: 'os-7', description: "An executive's company-owned iPhone has both the corporate email app and a personal Instagram app installed", correct: 'cope' },
];

export type OwnershipResult = {
  scenarioId: string;
  chosen: OwnershipModel | undefined;
  correct: OwnershipModel;
  isCorrect: boolean;
};

export type OwnershipGrade = {
  results: OwnershipResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeOwnershipModels(answers: Record<string, OwnershipModel>): OwnershipGrade {
  const results: OwnershipResult[] = OWNERSHIP_SCENARIOS.map((s) => ({
    scenarioId: s.id,
    chosen: answers[s.id],
    correct: s.correct,
    isCorrect: answers[s.id] === s.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Network Segmentation Zone Assignment ----

export type SegmentZone = 'corporate' | 'iot' | 'guest' | 'management';

export type SegmentItem = {
  id: string;
  asset: string;
  correct: SegmentZone;
  explanation: string;
};

export const SEGMENT_ITEMS: SegmentItem[] = [
  { id: 'sg-0', asset: 'Employee laptops and workstations', correct: 'corporate', explanation: 'Trusted user endpoints belong on the corporate VLAN with normal access to internal resources.' },
  { id: 'sg-1', asset: 'Smart HVAC thermostats and building sensors', correct: 'iot', explanation: 'Low-security embedded devices belong on an isolated IoT VLAN with no path to corporate assets.' },
  { id: 'sg-2', asset: 'Visitor Wi-Fi for conference room guests', correct: 'guest', explanation: 'Guest traffic should reach only the internet, never internal subnets.' },
  { id: 'sg-3', asset: 'Switch and firewall management interfaces', correct: 'management', explanation: 'Out-of-band management traffic belongs on a dedicated, tightly restricted management VLAN.' },
  { id: 'sg-4', asset: 'Networked IP security cameras', correct: 'iot', explanation: 'Cameras are embedded devices with historically weak firmware security — isolate them like any other IoT device.' },
  { id: 'sg-5', asset: 'Domain controllers and file servers', correct: 'corporate', explanation: 'Core identity and data infrastructure stays on the protected corporate/server VLAN.' },
  { id: 'sg-6', asset: 'Smart TV in the lobby running a slideshow', correct: 'iot', explanation: 'Consumer-grade smart devices should never share a broadcast domain with corporate endpoints.' },
  { id: 'sg-7', asset: 'SNMP monitoring traffic for network devices', correct: 'management', explanation: 'SNMP and other device-management protocols belong on the management VLAN, reachable only from the NOC.' },
  { id: 'sg-8', asset: 'Badge readers and door access controllers', correct: 'iot', explanation: 'Physical-access embedded controllers are IoT devices and should be isolated the same way.' },
  { id: 'sg-9', asset: 'Contractor devices with internet-only access, no internal resources', correct: 'guest', explanation: 'Untrusted third-party devices belong on the guest segment regardless of who owns them.' },
];

export type SegmentResult = {
  itemId: string;
  asset: string;
  chosen: SegmentZone | undefined;
  correct: SegmentZone;
  isCorrect: boolean;
  explanation: string;
};

export type SegmentGrade = {
  results: SegmentResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeSegmentation(answers: Record<string, SegmentZone>): SegmentGrade {
  const results: SegmentResult[] = SEGMENT_ITEMS.map((item) => ({
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

// ---- Mobile / IoT Misconfiguration Audit ----

export type MobileMisconfigSeverity = 'critical' | 'high' | 'medium' | 'low';

export type MobileMisconfigFinding = {
  id: string;
  area: string;
  description: string;
  severity: MobileMisconfigSeverity;
  isMisconfig: boolean;
  explanation: string;
};

export const MOBILE_MISCONFIG_FINDINGS: MobileMisconfigFinding[] = [
  { id: 'mm-0', area: 'MDM', description: 'BYOD devices can enrol without any passcode or biometric policy enforced', severity: 'critical', isMisconfig: true, explanation: 'A lost device with no lock screen exposes the corporate work container to anyone who picks it up.' },
  { id: 'mm-1', area: 'IoT', description: 'IP cameras are still running factory-default admin/admin credentials', severity: 'critical', isMisconfig: true, explanation: 'Default credentials are the single most common cause of IoT botnet recruitment (e.g., Mirai).' },
  { id: 'mm-2', area: 'Segmentation', description: 'The IoT VLAN has an ACL that blocks all access to corporate subnets', severity: 'low', isMisconfig: false, explanation: 'This is correct — IoT devices should never reach corporate resources directly.' },
  { id: 'mm-3', area: 'MDM', description: 'Jailbroken and rooted devices are automatically blocked from MDM enrolment', severity: 'low', isMisconfig: false, explanation: 'This is correct — jailbreak/root detection is a baseline MDM compliance check.' },
  { id: 'mm-4', area: 'Firmware', description: 'Smart thermostats have not received a firmware update in 3 years; the vendor has ended support', severity: 'high', isMisconfig: true, explanation: 'End-of-life firmware means known vulnerabilities will never be patched. Plan replacement or isolate further.' },
  { id: 'mm-5', area: 'Device Identity', description: 'Every IoT device is issued a unique X.509 certificate for mutual TLS authentication', severity: 'low', isMisconfig: false, explanation: 'This is correct — per-device certificates prevent a stolen shared credential from impersonating the whole fleet.' },
  { id: 'mm-6', area: 'App Security', description: 'The corporate app catalogue allows sideloading unsigned APKs on managed Android devices', severity: 'high', isMisconfig: true, explanation: 'Sideloading bypasses app-store review, the primary control against malicious mobile applications.' },
  { id: 'mm-7', area: 'BYOD', description: 'The BYOD policy has no separation (containerisation/MAM) between work and personal data', severity: 'high', isMisconfig: true, explanation: 'Without a work container, a wipe or a malicious personal app can affect corporate data and vice versa.' },
  { id: 'mm-8', area: 'Segmentation', description: 'Guest Wi-Fi and IoT devices share the same VLAN and broadcast domain', severity: 'critical', isMisconfig: true, explanation: 'A compromised IoT device could pivot directly to unmanaged guest traffic and vice versa. They need separate VLANs.' },
  { id: 'mm-9', area: 'Mobile', description: 'Remote wipe for lost or stolen devices is enabled and tested quarterly', severity: 'low', isMisconfig: false, explanation: 'This is correct — a tested remote-wipe capability is a core mobile-security control.' },
];

export type MobileMisconfigResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: MobileMisconfigSeverity;
};

export type MobileMisconfigGrade = {
  results: MobileMisconfigResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeMobileMisconfigs(answers: Record<string, boolean>): MobileMisconfigGrade {
  const results: MobileMisconfigResult[] = MOBILE_MISCONFIG_FINDINGS.map((f) => ({
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
