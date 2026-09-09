// ---------------------------------------------------------------------------
// Phase 8 — Windows hardening baseline.
//
// A configuration audit is the gradeable form of "harden a Windows endpoint":
// given the current state of a host, which settings are findings and which are
// already correct? That mirrors the Phase 7 triage discrimination — not
// everything that looks wrong is wrong, and an auditor who flags everything is
// as unhelpful as one who flags nothing.
//
// Settings and rationale follow the shape of CIS/Microsoft security baselines.
// Values describe WS-01, the endpoint carried since Phase 0.
// ---------------------------------------------------------------------------

export type BaselineCategory =
  | 'accounts'
  | 'uac'
  | 'defender'
  | 'firewall'
  | 'auditing'
  | 'powershell'
  | 'services'
  | 'encryption';

export const CATEGORY_LABELS: Record<BaselineCategory, string> = {
  accounts: 'Accounts and groups',
  uac: 'User Account Control',
  defender: 'Microsoft Defender',
  firewall: 'Windows Firewall',
  auditing: 'Audit policy',
  powershell: 'PowerShell security',
  services: 'Services and tasks',
  encryption: 'Disk encryption',
};

export type Finding = 'compliant' | 'finding';

export type BaselineItem = {
  id: string;
  category: BaselineCategory;
  setting: string;
  /** What the host is actually configured to right now. */
  currentValue: string;
  /** What the baseline expects. */
  recommendedValue: string;
  /** Whether the current state is a finding — the thing the learner decides. */
  verdict: Finding;
  /** Severity if it is a finding; omitted when compliant. */
  severity?: 'high' | 'medium' | 'low';
  /** Why it matters, shown after grading. */
  rationale: string;
};

export const BASELINE_ITEMS: BaselineItem[] = [
  // ---------------------------- Accounts ----------------------------
  {
    id: 'b00',
    category: 'accounts',
    setting: 'Built-in Administrator account status',
    currentValue: 'Disabled',
    recommendedValue: 'Disabled',
    verdict: 'compliant',
    rationale:
      'The built-in Administrator has a well-known SID (RID 500) and is a standard target. Disabled is correct — named administrative accounts provide the same capability with attribution.',
  },
  {
    id: 'b01',
    category: 'accounts',
    setting: 'Guest account status',
    currentValue: 'Disabled',
    recommendedValue: 'Disabled',
    verdict: 'compliant',
    rationale:
      'Guest allows unauthenticated access and has no legitimate modern use. Disabled is correct.',
  },
  {
    id: 'b02',
    category: 'accounts',
    setting: 'Members of local Administrators group',
    currentValue: 'Administrator (disabled), LAB\\Domain Admins, LAB\\analyst1',
    recommendedValue: 'Administrator (disabled), LAB\\Domain Admins',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'analyst1 is a standard user who should not hold local administrator rights. This is the finding that undermines everything else in this baseline — an administrator can disable Defender, alter audit policy, and clear the event log. Note this contradicts the Phase 1 enumeration, where analyst1 was in Users only; the account was elevated at some point and nobody removed it.',
  },
  {
    id: 'b03',
    category: 'accounts',
    setting: 'Interactive logon: do not display last signed-in user',
    currentValue: 'Disabled (username is shown)',
    recommendedValue: 'Enabled',
    verdict: 'finding',
    severity: 'low',
    rationale:
      'Showing the last username gives an attacker with physical access half a credential and confirms the naming convention. Low severity — it is a small information disclosure, not an access path.',
  },

  // ------------------------------ UAC -------------------------------
  {
    id: 'b10',
    category: 'uac',
    setting: 'User Account Control',
    currentValue: 'Enabled',
    recommendedValue: 'Enabled',
    verdict: 'compliant',
    rationale:
      'UAC splits an administrator token so privileged actions require explicit consent. It is not a security boundary Microsoft will service, but it stops a great deal of accidental and low-effort privileged execution.',
  },
  {
    id: 'b11',
    category: 'uac',
    setting: 'UAC elevation prompt behaviour for administrators',
    currentValue: 'Elevate without prompting',
    recommendedValue: 'Prompt for consent on the secure desktop',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'Elevate-without-prompting silently grants full privilege to anything an administrator runs, which defeats the point of UAC entirely. Note that UAC being "Enabled" is not sufficient — this is a case where the headline setting looks right and the detail is what matters.',
  },

  // ---------------------------- Defender ----------------------------
  {
    id: 'b20',
    category: 'defender',
    setting: 'Real-time protection',
    currentValue: 'Enabled',
    recommendedValue: 'Enabled',
    verdict: 'compliant',
    rationale:
      'Real-time protection scans files as they are accessed rather than only on a schedule, which is what stops execution rather than merely reporting it afterwards. Enabled is correct — but note this field reads True even when a broad exclusion means nothing is actually being scanned.',
  },
  {
    id: 'b21',
    category: 'defender',
    setting: 'Cloud-delivered protection',
    currentValue: 'Enabled',
    recommendedValue: 'Enabled',
    verdict: 'compliant',
    rationale:
      'Cloud protection provides detection for threats newer than the local signature set. Correct.',
  },
  {
    id: 'b22',
    category: 'defender',
    setting: 'Exclusion paths',
    currentValue: 'C:\\ (entire system drive)',
    recommendedValue: 'Narrowly scoped exclusions only, documented and reviewed',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'Excluding the whole system drive disables Defender in practice while leaving it reporting as Enabled. Broad exclusions are a common real-world finding, usually added to fix a performance complaint and never revisited. Attackers specifically enumerate exclusion paths, because a folder Defender ignores is a safe place to work.',
  },
  {
    id: 'b23',
    category: 'defender',
    setting: 'Signature age',
    currentValue: '1 day',
    recommendedValue: 'Less than 7 days',
    verdict: 'compliant',
    rationale:
      'Signature age under seven days means the local detection set is current. Signature age matters less than it once did, because cloud-delivered protection covers threats newer than the local set — which is why both settings appear in this baseline.',
  },

  // ---------------------------- Firewall ----------------------------
  {
    id: 'b30',
    category: 'firewall',
    setting: 'Windows Firewall — Domain profile',
    currentValue: 'Enabled, inbound block by default',
    recommendedValue: 'Enabled, inbound block by default',
    verdict: 'compliant',
    rationale:
      'Default-deny inbound means unsolicited connections are dropped unless a rule permits them. Correct — though the domain profile applies where your other network controls already exist, so it is the least critical of the three profiles.',
  },
  {
    id: 'b31',
    category: 'firewall',
    setting: 'Windows Firewall — Public profile',
    currentValue: 'Disabled',
    recommendedValue: 'Enabled, inbound block by default',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'The public profile applies on untrusted networks — hotels, cafes, conferences — which is exactly where a laptop is most exposed and least protected by anything else. A disabled public profile is worse than a disabled domain profile.',
  },

  // ---------------------------- Auditing ----------------------------
  {
    id: 'b40',
    category: 'auditing',
    setting: 'Audit logon events',
    currentValue: 'Success and Failure',
    recommendedValue: 'Success and Failure',
    verdict: 'compliant',
    rationale:
      'Both are needed. Failures show attempts; successes show what worked — and the Phase 7 investigation depended on having both.',
  },
  {
    id: 'b41',
    category: 'auditing',
    setting: 'Audit process creation (4688)',
    currentValue: 'Success',
    recommendedValue: 'Success',
    verdict: 'compliant',
    rationale:
      'Process creation auditing is what produced the 4688 event attributing PowerShell in the Phase 7 investigation.',
  },
  {
    id: 'b42',
    category: 'auditing',
    setting: 'Include command line in process creation events',
    currentValue: 'Disabled',
    recommendedValue: 'Enabled',
    verdict: 'finding',
    severity: 'medium',
    rationale:
      'Without this, a 4688 event records that powershell.exe ran but not what it ran. For living-off-the-land attacks the command line is the entire evidence — the binary is legitimate and only the arguments are hostile.',
  },
  {
    id: 'b43',
    category: 'auditing',
    setting: 'Security log maximum size',
    currentValue: '20 MB, overwrite as needed',
    recommendedValue: '≥ 196 MB, with forwarding to the SIEM',
    verdict: 'finding',
    severity: 'medium',
    rationale:
      'A 20 MB log on a busy host rolls over in hours, so evidence is gone before anyone investigates. Note the real fix is forwarding to the SIEM — local retention is a fallback, not the strategy.',
  },

  // --------------------------- PowerShell ---------------------------
  {
    id: 'b50',
    category: 'powershell',
    setting: 'PowerShell script block logging',
    currentValue: 'Disabled',
    recommendedValue: 'Enabled',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'Script block logging records what PowerShell actually executed, after any de-obfuscation. It is the single highest-value Windows logging setting for detecting living-off-the-land attacks, and it is off by default.',
  },
  {
    id: 'b51',
    category: 'powershell',
    setting: 'PowerShell execution policy',
    currentValue: 'RemoteSigned',
    recommendedValue: 'RemoteSigned or AllSigned',
    verdict: 'compliant',
    rationale:
      'RemoteSigned is a reasonable default. Worth knowing: execution policy is not a security control — it prevents accidental execution, and is bypassable by design with a documented flag. Treat it as a guardrail, never a boundary.',
  },
  {
    id: 'b52',
    category: 'powershell',
    setting: 'Windows PowerShell 2.0 engine',
    currentValue: 'Installed',
    recommendedValue: 'Removed',
    verdict: 'finding',
    severity: 'medium',
    rationale:
      'PowerShell 2.0 predates script block logging and AMSI, so invoking it downgrades an attacker straight past your logging. Removing the legacy engine closes that bypass.',
  },

  // ---------------------- Services and tasks ------------------------
  {
    id: 'b60',
    category: 'services',
    setting: 'Scheduled task: SystemHealthCheck',
    currentValue: 'Runs powershell.exe -WindowStyle Hidden every 30 minutes as SYSTEM',
    recommendedValue: 'No undocumented tasks running hidden PowerShell as SYSTEM',
    verdict: 'finding',
    severity: 'high',
    rationale:
      'A benign-sounding name, a hidden window, SYSTEM privilege, and a regular interval. This is persistence — the mechanism that survives the reboot after you clean the endpoint. Compare the interval to the Phase 7 beacon.',
  },
  {
    id: 'b61',
    category: 'services',
    setting: 'Print Spooler service',
    currentValue: 'Stopped and disabled',
    recommendedValue: 'Disabled where printing is not required',
    verdict: 'compliant',
    rationale:
      'Spooler has a long history of privilege-escalation vulnerabilities. Disabled where unused is correct.',
  },
  {
    id: 'b62',
    category: 'services',
    setting: 'SMBv1 protocol',
    currentValue: 'Not installed',
    recommendedValue: 'Not installed',
    verdict: 'compliant',
    rationale:
      'SMBv1 is obsolete and was the propagation mechanism for major worm outbreaks. Absent is correct.',
  },

  // --------------------------- Encryption ---------------------------
  {
    id: 'b70',
    category: 'encryption',
    setting: 'BitLocker on the system drive',
    currentValue: 'Enabled, TPM + PIN',
    recommendedValue: 'Enabled, TPM + PIN',
    verdict: 'compliant',
    rationale:
      'TPM plus PIN protects against an attacker who has the physical device. TPM alone would unlock automatically at boot, which defeats the purpose for a stolen laptop.',
  },
  {
    id: 'b71',
    category: 'encryption',
    setting: 'BitLocker recovery key escrow',
    currentValue: 'Backed up to Active Directory',
    recommendedValue: 'Backed up to Active Directory or Entra ID',
    verdict: 'compliant',
    rationale:
      'Escrowed recovery keys mean encryption does not become data loss. An unescrowed key is an availability incident waiting to happen.',
  },
];

export function getBaselineItem(id: string): BaselineItem | undefined {
  return BASELINE_ITEMS.find((i) => i.id === id);
}

export function itemsInCategory(category: BaselineCategory): BaselineItem[] {
  return BASELINE_ITEMS.filter((i) => i.category === category);
}

export const FINDING_COUNT = BASELINE_ITEMS.filter((i) => i.verdict === 'finding').length;
export const COMPLIANT_COUNT = BASELINE_ITEMS.filter((i) => i.verdict === 'compliant').length;
