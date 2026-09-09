import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 19 — Security Hardening
// Aligned with CompTIA Security+ SY0-701 (Domain 4: Security Operations)
//
// This phase consolidates and extends hardening controls first introduced in
// Phase 8 (Windows Security), Phase 9 (Linux Security), and Phase 11 (Network
// Security), adding the specific topics PROMPT.md calls out that were not yet
// covered in depth: patch management process, PowerShell security controls,
// Linux host firewalls, and the secure network management plane.
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Cross-Platform Endpoint Hardening ----------

const LESSON_19_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p19-l1-s0',
    title: 'Concept — The Hardening Baseline Mindset',
    body:
      'Hardening is the practice of reducing attack surface and enforcing deny-by-default wherever a system allows it: disable what is not used, restrict what remains to the minimum required, and log what happens so drift is detectable. The same five categories of control — firewalling, patch management, access control, logging, and service minimisation — recur on every platform. The exam consistently tests whether you can recognise the same underlying category across a Windows control, a Linux control, and a network control, rather than treating each platform as an unrelated topic.',
  },
  {
    id: 'p19-l1-s1',
    title: 'Concept — Windows Endpoint Hardening',
    body:
      'Windows Firewall with Advanced Security should default-deny inbound and only permit the specific ports a role requires. Microsoft Defender (or an EDR) provides both signature and behavioural detection. User rights assignment should follow least privilege — standing local administrator access is the single most common finding an auditor names first, because it lets an attacker reverse every other control. Service minimisation means disabling roles and features not in active use; every running service is attack surface regardless of whether it is currently exploited.',
  },
  {
    id: 'p19-l1-s2',
    title: 'Concept — Patch Management as a Process',
    body:
      'Patch management is a recurring process, not a one-time project, because new vulnerabilities are disclosed continuously. A mature program uses WSUS (or an equivalent) with a pilot ring — a small subset of machines that receive updates first, monitored briefly before fleet-wide approval — so a bad update is caught before it breaks production everywhere at once. On Linux, unattended-upgrades or an equivalent can auto-apply security-only updates nightly while leaving non-security package updates for scheduled, tested maintenance windows. A host with no updates in over a year has not "avoided problems" — it has accumulated every vulnerability disclosed since its last patch.',
  },
  {
    id: 'p19-l1-s3',
    title: 'Concept — PowerShell Security Controls',
    body:
      'PowerShell is both an administrative necessity and a favourite living-off-the-land tool for attackers, because it is already installed and trusted. Execution Policy restricts which scripts can run by default, though it is a safety net, not a security boundary, on its own. Constrained Language Mode restricts a session to a safe subset of the language, blocking direct access to sensitive APIs like Win32 calls, dramatically limiting what an attacker can do even with script execution. Script block logging and module logging record the actual code executed — including code that was obfuscated before execution — and should always be forwarded to a central SIEM, because local logs are the first thing an attacker with access will attempt to clear.',
  },
  {
    id: 'p19-l1-s4',
    title: 'Concept — Linux Endpoint Hardening',
    body:
      'A host-based firewall (firewalld, ufw, or nftables directly) should default-deny inbound, mirroring the Windows Firewall posture. SSH hardening (Phase 9) and file permission discipline remain foundational. Mandatory access control frameworks — SELinux (enforcing mode) or AppArmor — constrain what a process can do even if it is compromised, containing a web server exploit to the web server\'s own designated files rather than the whole filesystem. auditd should log privileged actions (every sudo invocation) and forward centrally, the same principle as Windows script block logging: local-only logs disappear with the attacker who caused them.',
  },
  {
    id: 'p19-l1-s5',
    title: 'Example — A hardening baseline scan finds inconsistent findings',
    body:
      'A combined baseline scan of one Windows host and one Linux host finds: the Windows host has Defender enabled but a stale local administrator account from a departed contractor; the Linux host has SELinux enforcing but auditd\'s log forwarding silently broke three months ago with no alert. Neither host is "worse" than the other — each has one strong control and one real gap, and both gaps are access-control or logging failures, not firewall or patching failures. Reading findings by category, not by platform, is what reveals that pattern.',
  },
  {
    id: 'p19-l1-s6',
    title: 'Review — What must stick',
    body:
      'The same five control categories — firewall, patching, access control, logging, service minimisation — apply on every platform; learn the category, not just the platform-specific tool name. Patch management is continuous, with a pilot ring before fleet-wide deployment. PowerShell Constrained Language Mode plus script block/module logging is the modern baseline for PowerShell security. SELinux/AppArmor contain a compromised process on Linux the way least privilege contains a compromised account on Windows. A control that silently stops working (broken log forwarding) is a distinct, often-missed finding from a control that was never configured.',
  },
];

const LESSON_19_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p19-q0',
    type: 'mcq',
    stem: 'Which hardening principle applies equally to Windows, Linux, and network devices: disable what is not used, restrict what remains, and log what happens?',
    options: [
      'Attack surface reduction and deny-by-default',
      'Full-disk encryption only',
      'Two-factor authentication only',
      'Antivirus signature updates only',
    ],
    answer: 0,
    explanation:
      'Attack surface reduction and deny-by-default are the universal hardening principles that manifest differently per platform but share the same underlying logic.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
  {
    id: 'p19-q1',
    type: 'mcq',
    stem: 'Why is a WSUS pilot ring used before approving an update fleet-wide?',
    options: [
      'To catch a bad update on a small subset of machines before it can break production everywhere at once',
      'To make patches install faster on every machine',
      'Pilot rings are only used for non-security updates',
      'To avoid ever installing security updates',
    ],
    answer: 0,
    explanation:
      'A pilot ring is a small, monitored subset of machines that receive updates first — limiting the blast radius if an update causes an unexpected problem.',
    domain: 'Security Operations',
    conceptId: 'patch-management',
  },
  {
    id: 'p19-q2',
    type: 'mcq',
    stem: 'What does PowerShell Constrained Language Mode restrict?',
    options: [
      'It limits a session to a safe subset of the language and blocks direct access to sensitive APIs like Win32 calls',
      'It prevents PowerShell from being installed at all',
      'It only restricts which colour scheme the console can use',
      'It disables all logging in PowerShell sessions',
    ],
    answer: 0,
    explanation:
      'Constrained Language Mode reduces what an attacker can accomplish even with script execution, by blocking access to sensitive underlying APIs.',
    domain: 'Security Operations',
    conceptId: 'powershell-hardening',
  },
  {
    id: 'p19-q3',
    type: 'mcq',
    stem: 'Why should PowerShell script block logging be forwarded to a central SIEM rather than kept only on the local host?',
    options: [
      'Local-only logs are the first thing an attacker with access will attempt to clear or tamper with',
      'Local logs take up too much disk space to matter',
      'Central forwarding is only required for compliance, never for security',
      'Script block logging cannot be stored locally at all',
    ],
    answer: 0,
    explanation:
      'Centralising logs protects the evidence from tampering by the same attacker whose actions the logs recorded.',
    domain: 'Security Operations',
    conceptId: 'powershell-hardening',
  },
  {
    id: 'p19-q4',
    type: 'mcq',
    stem: 'What is the primary purpose of SELinux in enforcing mode or AppArmor on a Linux host?',
    options: [
      'To constrain what a process can do — containing a compromised process to its designated files and actions, even if it is exploited',
      'To replace the need for a host firewall entirely',
      'To speed up file system performance',
      'To manage user password complexity',
    ],
    answer: 0,
    explanation:
      'Mandatory access control frameworks like SELinux and AppArmor limit the blast radius of a compromised process, similar in spirit to least privilege for user accounts.',
    domain: 'Security Operations',
    conceptId: 'linux-service-hardening',
  },
  {
    id: 'p19-q5',
    type: 'scenario',
    stem: 'A hardening audit finds a former contractor\'s account still in the local Administrators group six months after departure, alongside several low-severity configuration findings. Which finding should be remediated first?',
    options: [
      'The stale administrator account — standing unnecessary privilege lets an attacker (or the former contractor) reverse every other control',
      'The lowest-severity configuration finding, to clear easy items first',
      'Whichever finding was discovered first in the scan',
      'All findings should be treated with equal priority regardless of type',
    ],
    answer: 0,
    explanation:
      'Standing privileged access with no ongoing business need is the highest-priority finding because it undermines every other control an organisation might apply.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
  {
    id: 'p19-q6',
    type: 'scenario',
    stem: 'A Linux production host has unattended-upgrades enabled only for the security repository, leaving general package updates for a scheduled monthly maintenance window. Is this a reasonable configuration?',
    options: [
      'Yes — auto-applying security-only updates balances staying current against the risk of an untested non-security package breaking production',
      'No — every package update should install automatically every night with no testing',
      'No — automatic updates should never be enabled on a production system',
      'This configuration provides no security benefit at all',
    ],
    answer: 0,
    explanation:
      'Scoping automatic updates to security patches, while testing broader updates on a schedule, is a reasonable, common risk-balanced approach to patch management.',
    domain: 'Security Operations',
    conceptId: 'patch-management',
  },
  {
    id: 'p19-q7',
    type: 'scenario',
    stem: 'An auditd installation on a Linux server is confirmed running, but its log forwarding to the central SIEM has been silently broken for 90 days with no alert generated. How should this be classified compared to a host that never had auditd configured at all?',
    options: [
      'It is arguably worse — it creates false confidence that events are being centrally captured and reviewed when they are not',
      'It is a lower priority, since auditd is technically still running locally',
      'There is no meaningful difference between the two situations',
      'This can only be discovered during an active breach, never before'
    ],
    answer: 0,
    explanation:
      'A silently broken control creates false assurance, which can be more dangerous than an acknowledged gap because no one is looking for it.',
    domain: 'Security Operations',
    conceptId: 'linux-service-hardening',
  },
  {
    id: 'p19-q8',
    type: 'scenario',
    stem: 'A Windows workstation has Defender enabled and a strong firewall configuration, but has not received a Windows update in 14 months. What is the primary risk this represents?',
    options: [
      'Every vulnerability disclosed and patched in that 14-month window remains exploitable on this specific host',
      'Defender alone fully compensates for missing patches, so there is no meaningful risk',
      'The firewall configuration eliminates any risk from missing patches',
      'Missing updates only matter for server operating systems, not workstations',
    ],
    answer: 0,
    explanation:
      'Missing 14 months of patches means the host is vulnerable to every disclosed and patched vulnerability from that period — no other control fully substitutes for patching.',
    domain: 'Security Operations',
    conceptId: 'patch-management',
  },
  {
    id: 'p19-q9',
    type: 'scenario',
    stem: 'A combined Windows/Linux baseline audit categorises findings by control type (firewall, patching, access control, logging, service minimisation) rather than by which host each finding came from. What advantage does this give the analyst?',
    options: [
      'It reveals patterns — such as both hosts sharing the same category of gap (e.g., logging) — that would be missed if findings were only reviewed per platform',
      'It makes the report shorter with no analytical benefit',
      'It removes the need to fix any of the findings',
      'It only works if both hosts run the exact same operating system',
    ],
    answer: 0,
    explanation:
      'Grouping by control category surfaces cross-platform patterns (e.g., "both hosts have a logging gap") that a platform-by-platform review would present as two unrelated issues.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
  {
    id: 'p19-q-pbq',
    type: 'pbq',
    stem: 'Order the steps to harden a newly built workstation.',
    options: [
      'Install the latest patches and firmware',
      'Apply the organisation\'s hardening baseline',
      'Disable unnecessary services and accounts',
      'Enable logging and confirm telemetry reaches the SIEM',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Patch before you trust the system, then lock it to the baseline, remove attack surface, and ensure the security team can see what it does.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
];

// ---------- Lesson 2: Network & Infrastructure Hardening ----------

const LESSON_19_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p19-l2-s0',
    title: 'Concept — Reducing Network Attack Surface',
    body:
      'The network-layer equivalent of endpoint service minimisation: disable unused switch ports administratively, remove default/unnecessary services from network device management interfaces, and never leave a legacy insecure protocol enabled "just in case" once its secure replacement is deployed. An unused, enabled switch port is a walk-up attack vector for anyone with brief physical access; disabling it costs nothing and closes the door permanently until it is needed again.',
  },
  {
    id: 'p19-l2-s1',
    title: 'Concept — Strong Authentication for Infrastructure',
    body:
      'Network device administration should never rely on a single shared local password. Centralised AAA (Authentication, Authorization, and Accounting) via TACACS+ or RADIUS lets administrators authenticate with individual, revocable credentials, and every command can be logged against a specific person rather than "whoever knew the shared password." Combined with MFA for administrative access and SSH key-based authentication for device access, this closes the same class of gap that individual user account hygiene closes on endpoints.',
  },
  {
    id: 'p19-l2-s2',
    title: 'Concept — Segmentation and ACLs',
    body:
      'Segmentation (Phase 4, Phase 11) limits blast radius by architecture; ACLs enforce it at the traffic level. A well-designed ACL follows explicit-permit, implicit-deny: state exactly which flows are required, then let everything else fail closed by default, rather than trying to enumerate every flow that should be blocked. The most commonly missed segmentation failure is the management plane itself sharing a VLAN with general user or production traffic — meaning a single compromised workstation is one hop away from every switch and router\'s administrative interface.',
  },
  {
    id: 'p19-l2-s3',
    title: 'Concept — Secure Management Plane',
    body:
      'Out-of-band management uses a network physically or logically separate from the production data plane, so a production-network incident cannot also cut off the administrators trying to respond to it. A jump host (bastion host) is the single, hardened, heavily logged entry point administrators must pass through to reach any other management interface — rather than exposing RDP, SSH, or device consoles directly to a broader network. Legacy insecure management protocols (Telnet, HTTP for device web UIs) should be disabled entirely once SSH/HTTPS equivalents are confirmed working, not left enabled in parallel.',
  },
  {
    id: 'p19-l2-s4',
    title: 'Concept — Baselines, CIS Benchmarks, and Configuration Drift',
    body:
      'A CIS Benchmark is a vendor-neutral, community-developed configuration hardening standard for a specific OS, application, or device type, providing a concrete, testable baseline rather than vague advice like "harden the server." Baseline drift is the gradual divergence between a system\'s configured state and its intended hardened baseline — caused by emergency changes, forgotten temporary exceptions, or simple entropy over time. Configuration management tooling (and periodic re-scanning against the baseline) is what catches drift before it becomes the finding an auditor names.',
  },
  {
    id: 'p19-l2-s5',
    title: 'Example — Closing a management-plane gap from Phase 11',
    body:
      'Phase 11\'s network review found a flat management network with no dedicated jump host. The remediation: deploy a hardened bastion host requiring RADIUS-authenticated MFA login, place it on a dedicated out-of-band management VLAN, and reconfigure every switch and router to accept management SSH connections only from the bastion\'s IP — closing off any other path to those interfaces. Every administrative session through the bastion is logged individually, closing the accountability gap that a shared local password created.',
  },
  {
    id: 'p19-l2-s6',
    title: 'Review — What must stick',
    body:
      'Disable unused ports and legacy insecure protocols the moment their secure replacement is confirmed working — do not run both in parallel indefinitely. TACACS+/RADIUS with MFA replaces shared local device passwords with individually accountable, revocable credentials. ACLs should follow explicit-permit, implicit-deny. The management plane must be segmented from production traffic, ideally reached only through a jump host. CIS Benchmarks provide a concrete baseline; configuration drift is what erodes a baseline silently over time.',
  },
];

const LESSON_19_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p19-q10',
    type: 'mcq',
    stem: 'Why should unused switch ports be administratively disabled?',
    options: [
      'An enabled, unused port is a walk-up attack vector for anyone with brief physical access, and disabling it costs nothing',
      'Disabling unused ports improves switch throughput significantly',
      'Enabled unused ports are required for warranty compliance',
      'This has no security benefit',
    ],
    answer: 0,
    explanation:
      'Every enabled port that is not actively needed is unnecessary attack surface, and shutting it down administratively is a free, reversible hardening step.',
    domain: 'Security Operations',
    conceptId: 'network-hardening',
  },
  {
    id: 'p19-q11',
    type: 'mcq',
    stem: 'What is the primary benefit of using TACACS+ or RADIUS for network device administration instead of a single shared local password?',
    options: [
      'Individual, revocable administrator credentials with per-command accountability, rather than an untraceable shared secret',
      'It eliminates the need for any password at all',
      'It is required only for wireless access points, never for switches or routers',
      'It automatically encrypts all network traffic',
    ],
    answer: 0,
    explanation:
      'Centralised AAA lets each administrator authenticate individually, so actions can be traced to a specific person and access can be revoked without changing a shared credential everyone else also uses.',
    domain: 'Security Operations',
    conceptId: 'secure-management-plane',
  },
  {
    id: 'p19-q12',
    type: 'mcq',
    stem: 'What ACL design pattern is considered the secure standard?',
    options: [
      'Explicit-permit, implicit-deny — state exactly what is allowed, and block everything else by default',
      'Explicit-deny, implicit-permit — block only what is known to be bad',
      'No default rule at all, evaluated case by case',
      'Permit-all with logging only',
    ],
    answer: 0,
    explanation:
      'Explicit-permit with implicit deny ensures any flow not specifically accounted for fails closed, rather than being allowed by omission.',
    domain: 'Security Operations',
    conceptId: 'network-acls',
  },
  {
    id: 'p19-q13',
    type: 'mcq',
    stem: 'What is the primary purpose of a jump host (bastion host) in network management?',
    options: [
      'It is the single, hardened, heavily logged entry point administrators must pass through to reach other management interfaces',
      'It replaces the need for any firewall on the network',
      'It is used only for hosting public-facing websites',
      'It automatically patches every device on the network',
    ],
    answer: 0,
    explanation:
      'A jump host consolidates administrative access to a single, monitored chokepoint rather than exposing management interfaces directly across the network.',
    domain: 'Security Operations',
    conceptId: 'secure-management-plane',
  },
  {
    id: 'p19-q14',
    type: 'mcq',
    stem: 'What is a CIS Benchmark?',
    options: [
      'A vendor-neutral, community-developed configuration hardening standard for a specific OS or application',
      'A proprietary Microsoft-only patch schedule',
      'A network performance testing tool',
      'A type of firewall appliance',
    ],
    answer: 0,
    explanation:
      'CIS Benchmarks provide concrete, testable hardening configuration standards used as an audit baseline across many platforms and vendors.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
  {
    id: 'p19-q15',
    type: 'scenario',
    stem: 'A router\'s management interface accepts both Telnet and SSH connections, with the administrator explaining "Telnet is a backup in case SSH has issues." What is the flaw in this reasoning?',
    options: [
      'Telnet transmits credentials and session data in cleartext, so leaving it enabled recreates the exact risk SSH was deployed to eliminate — a working backup that reintroduces the vulnerability',
      'There is no flaw; having a backup protocol is always good practice',
      'SSH is less secure than Telnet, so this configuration improves security',
      'Telnet and SSH provide identical security guarantees',
    ],
    answer: 0,
    explanation:
      'A cleartext protocol enabled "just in case" is still exploitable at any time, regardless of the justification — it should be disabled once SSH is confirmed working.',
    domain: 'Security Operations',
    conceptId: 'network-hardening',
  },
  {
    id: 'p19-q16',
    type: 'scenario',
    stem: 'A company\'s network management plane shares the same VLAN as general employee workstation traffic. What is the specific risk this creates?',
    options: [
      'A single compromised employee workstation is one hop away from every switch and router\'s administrative interface on the same broadcast domain',
      'This configuration only affects network performance, not security',
      'VLANs provide no security boundary regardless of configuration',
      'This is only a risk if the workstations are also unpatched',
    ],
    answer: 0,
    explanation:
      'Sharing a broadcast domain between general user traffic and management interfaces means any compromised endpoint on that VLAN can directly target device administration.',
    domain: 'Security Operations',
    conceptId: 'network-hardening',
  },
  {
    id: 'p19-q17',
    type: 'scenario',
    stem: 'An organisation hardens every device against a CIS Benchmark during initial deployment but never re-scans afterward. Six months later, several devices have drifted from the baseline due to emergency changes made during incidents. What control was missing?',
    options: [
      'Periodic re-scanning or configuration management tooling to detect and correct baseline drift over time',
      'A stronger initial baseline would have made re-scanning unnecessary',
      'CIS Benchmarks are only meant to be applied once, by design',
      'Emergency changes during incidents should never be reverted afterward',
    ],
    answer: 0,
    explanation:
      'A baseline is a snapshot; without periodic re-verification or configuration management, real-world changes accumulate as undetected drift.',
    domain: 'Security Operations',
    conceptId: 'hardening-baseline',
  },
  {
    id: 'p19-q18',
    type: 'scenario',
    stem: 'Following the Phase 11 finding of a flat management network, a company deploys a bastion host requiring MFA, places it on a dedicated management VLAN, and restricts every device\'s management SSH access to only the bastion\'s IP. What class of vulnerability does this remediate?',
    options: [
      'Management-plane segmentation failure and lack of centralised, accountable administrative access',
      'A vulnerability in the SSH protocol itself',
      'A patch management gap',
      'A PowerShell logging gap'
    ],
    answer: 0,
    explanation:
      'This remediation directly addresses segmentation (isolating the management plane) and secure management access (a single accountable, MFA-protected entry point), not patching or endpoint logging.',
    domain: 'Security Operations',
    conceptId: 'secure-management-plane',
  },
];

// ---------- Lab 1: Harden a Windows and Linux Endpoint Baseline ----------

const LAB_19_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the combined endpoint hardening baseline scan across one Windows host and one Linux host.',
    command: 'show endpoint hardening baseline',
    expected: 'A combined report with findings tagged by control category (firewall, patching, access control, logging, service minimisation), not just by host.',
  },
  {
    id: 's1',
    instruction: 'Review the patch management status for both hosts.',
    command: 'show patch management status',
    expected: 'A report showing the Windows host is current and the Linux host has a stale, untested patch backlog.',
  },
  {
    id: 's2',
    instruction: 'Review the PowerShell security configuration on the Windows host.',
    command: 'show powershell security config',
    expected: 'A finding that script block logging is enabled but Constrained Language Mode is not applied to standard users.',
  },
  {
    id: 's3',
    instruction: 'Review the Linux service and mandatory access control baseline.',
    command: 'show linux service baseline',
    expected: 'A finding of unnecessary running services and SELinux in permissive (not enforcing) mode.',
  },
];

const LAB_19_0: Lab = {
  id: 'p19-lab-0',
  phaseId: 'phase-19',
  title: 'Harden a Windows and Linux Endpoint Baseline',
  objective:
    'Review a combined hardening baseline scan across a Windows and a Linux host, categorise findings by control type, and produce a prioritised remediation plan covering patching, PowerShell security, and Linux service/MAC configuration.',
  securityConcepts: [
    'Hardening baseline categories',
    'Patch management process',
    'PowerShell security controls',
    'Linux service minimisation and MAC (SELinux/AppArmor)',
  ],
  environment: 'Deterministic hardening simulator — prepared outputs only, nothing is executed against a real host',
  topology: 'One Windows 11 workstation (WS-19) and one Ubuntu Linux server (SRV-19), each with a mix of compliant and non-compliant baseline items',
  prerequisites: ['Complete Phase 8 (Windows Security)', 'Complete Phase 9 (Linux Security)'],
  steps: LAB_19_0_STEPS,
  expectedResults: [
    'Findings correctly categorised by control type across both hosts',
    'The Linux patch backlog identified as a patch-management gap',
    'Missing Constrained Language Mode identified as a PowerShell hardening gap',
    'SELinux permissive mode and unnecessary services identified as Linux findings',
  ],
  verification: [
    'Learner can name the control category for each finding, independent of which host it came from',
    'Learner can explain why Constrained Language Mode matters even with script block logging already enabled',
    'Learner can propose a prioritised remediation order across both hosts',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure how to categorise a finding → ask which of the five categories (firewall, patching, access control, logging, service minimisation) it most directly affects.',
    'Confused about SELinux permissive vs enforcing → permissive mode logs violations but does not block them; enforcing mode actually blocks. A permissive-mode SELinux provides visibility only, not containment.',
  ],
  challenge:
    'Write a one-page remediation plan: for each finding, state its control category, its severity, and a specific fix. Order the plan by what should be remediated first and justify the ordering.',
  evidence: [
    {
      id: 'ev0',
      label: 'Endpoint hardening audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Prioritised remediation plan',
      type: 'report',
      placeholder: 'Finding, category, severity, fix, and priority order',
    },
  ],
  securityLesson:
    'Windows and Linux hardening use different tool names for the same underlying categories. An analyst who only knows "the Windows way" or "the Linux way" cannot audit a mixed environment; the category-level view is what transfers between platforms.',
};

// ---------- Lab 2: Harden the Network Management Plane ----------

const LAB_19_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the network device hardening findings for the core switch and router.',
    command: 'show network device hardening',
    expected: 'A report showing Telnet still enabled alongside SSH, and unused switch ports still administratively up.',
  },
  {
    id: 's1',
    instruction: 'Review the current management plane configuration.',
    command: 'show management plane config',
    expected: 'A finding that the management plane shares a VLAN with general workstation traffic and has no jump host.',
  },
  {
    id: 's2',
    instruction: 'Review the access control lists protecting management interfaces.',
    command: 'show acl review',
    expected: 'A finding of an ACL with no default-deny rule at the end, relying only on explicit deny entries for known-bad sources.',
  },
  {
    id: 's3',
    instruction: 'Review the CIS benchmark compliance gaps for the network devices.',
    command: 'show cis benchmark gaps',
    expected: 'A consolidated list of specific CIS Benchmark items the devices fail, cross-referenced to the findings above.',
  },
];

const LAB_19_1: Lab = {
  id: 'p19-lab-1',
  phaseId: 'phase-19',
  title: 'Harden the Network Management Plane',
  objective:
    'Review network device hardening findings, the management plane architecture, and ACL configuration, then design a corrected, segmented, CIS-aligned management architecture.',
  securityConcepts: [
    'Network attack surface reduction',
    'Centralised AAA (TACACS+/RADIUS)',
    'ACL design (explicit-permit, implicit-deny)',
    'Secure management plane and jump hosts',
    'CIS Benchmarks and configuration drift',
  ],
  environment: 'Deterministic network hardening simulator — prepared outputs only',
  topology: 'Core switch and router pair with a flat management network, following on from the Phase 11 network review',
  prerequisites: ['Complete Phase 11 (Network Security)', 'Complete Lab 1 (Harden a Windows and Linux Endpoint Baseline)'],
  steps: LAB_19_1_STEPS,
  expectedResults: [
    'Telnet identified as an unnecessary legacy protocol left enabled alongside SSH',
    'Unused switch ports identified as still administratively enabled',
    'The management plane identified as unsegmented from general traffic with no jump host',
    'The ACL identified as missing an explicit-deny/default-deny closing rule',
  ],
  verification: [
    'Learner can propose a specific remediation for each finding (disable Telnet, shut unused ports, deploy a segmented jump host, add a default-deny ACL rule)',
    'Learner can explain why a shared management/user VLAN is a segmentation failure specifically, not a firewall failure',
    'Learner can map each finding to the CIS Benchmark item it violates',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure why Telnet is still a finding if SSH also works → any enabled path to cleartext credential exposure is exploitable regardless of whether a better path also exists.',
    'Confused about "no jump host" as a finding on its own → a jump host is what makes administrative access accountable and monitorable; without one, direct access to every device is itself the gap, independent of any individual device\'s configuration.',
  ],
  challenge:
    'Design a corrected management architecture: a dedicated out-of-band management VLAN, a hardened jump host with MFA, TACACS+/RADIUS for device AAA, an ACL restricting device management access to only the jump host\'s IP, and Telnet disabled fleet-wide.',
  evidence: [
    {
      id: 'ev0',
      label: 'Network hardening audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Corrected management architecture design',
      type: 'report',
      placeholder: 'Management VLAN, jump host, AAA method, ACL rules, and legacy protocol removal plan',
    },
  ],
  securityLesson:
    'Every finding in this lab already has a well-known fix — disable Telnet, shut unused ports, segment the management plane, add a default-deny ACL rule. None of it is exotic. The gap is always that no one revisited the network hardening baseline after the initial deployment.',
};

// ---------- Lessons ----------

const LESSON_19_L1: Lesson = {
  id: 'p19-lesson-0',
  phaseId: 'phase-19',
  title: 'Cross-Platform Endpoint Hardening',
  objectives: [
    'Recognise the five recurring hardening control categories across platforms',
    'Explain patch management as a continuous process using a pilot-ring model',
    'Explain PowerShell security controls including Constrained Language Mode and script block logging',
    'Explain Linux endpoint hardening including host firewalls and mandatory access control (SELinux/AppArmor)',
    'Prioritise hardening findings across a mixed Windows/Linux environment',
  ],
  sections: LESSON_19_L1_SECTIONS,
  quiz: LESSON_19_L1_QUIZ,
  concepts: [
    'hardening-baseline',
    'patch-management',
    'powershell-hardening',
    'linux-service-hardening',
  ],
  homework:
    'Take a hardening baseline item for Windows and one for Linux, apply both to a machine you own, and record what changed and what broke. Reverting is part of the exercise.',
  careerConnection:
    'Endpoint Security Engineer — organisations running mixed Windows/Linux fleets need someone who can audit both against the same underlying control categories, not someone who only speaks one platform\'s dialect.',
};

const LESSON_19_L2: Lesson = {
  id: 'p19-lesson-1',
  phaseId: 'phase-19',
  title: 'Network & Infrastructure Hardening',
  objectives: [
    'Explain network attack surface reduction including unused port and legacy protocol removal',
    'Explain centralised AAA (TACACS+/RADIUS) for infrastructure administration',
    'Apply explicit-permit, implicit-deny ACL design',
    'Design a secure, segmented management plane using a jump host',
    'Explain CIS Benchmarks and configuration drift',
  ],
  sections: LESSON_19_L2_SECTIONS,
  quiz: LESSON_19_L2_QUIZ,
  concepts: [
    'network-hardening',
    'secure-management-plane',
    'network-acls',
  ],
  homework:
    'Write the management-plane hardening checklist for a switch or router: authentication, unused ports, protocols, and access restrictions. State the risk each item removes.',
  careerConnection:
    'Network Security Engineer — the analyst who can design a segmented management plane with a jump host and centralised AAA is the one trusted to close the exact gap most flat networks share.',
};

// ---------- Phase export ----------

export const PHASE_19: Phase = {
  id: 'phase-19',
  number: 19,
  title: 'Security Hardening',
  description:
    'Consolidate and extend endpoint and network hardening: cross-platform control categories, patch management as a process, PowerShell security controls, Linux service/MAC hardening, network attack surface reduction, centralised AAA, ACL design, and a secure, segmented management plane — applied to a deliberately insecure mixed environment.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: [LESSON_19_L1, LESSON_19_L2],
  labs: [LAB_19_0, LAB_19_1],
};
