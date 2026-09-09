import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 8 — Windows Security
// Aligned with CompTIA Security+ SY0-701
//
// PROMPT.md names six labs, two of which are hands-on ("create users/groups in
// an isolated lab", "harden a Windows endpoint"). CLAUDE.md requires labs stay
// isolated to owned or authorised environments. Both are satisfied by giving
// each lab a simulated walkthrough in-platform AND real commands the learner
// can run on a VM they own — clearly separated, so nothing pretends to be
// something it is not.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p8-lesson-0',
    phaseId: 'phase-8',
    title: 'Accounts, Groups and the Windows Privilege Model',
    objectives: [
      'Describe local versus domain accounts and where each is authoritative',
      'Explain how group membership grants privilege',
      'Explain UAC and why it is not a security boundary',
      'Identify excessive local administrator membership as a finding',
      'Explain Active Directory and Kerberos from the endpoint perspective',
    ],
    concepts: ['windows-accounts', 'windows-groups', 'uac', 'least-privilege', 'active-directory'],
    homework:
      'On a Windows machine you own, list the local groups and their members, and state what each group is actually able to do. Note any account with more privilege than its purpose needs.',
    careerConnection:
      'The first question on any Windows incident is what the account could do. Reading group membership correctly is the fastest way to answer it.',
    sections: [
      {
        id: 'p8-l0-s0',
        title: 'Concept — Local and domain accounts',
        body: "Windows accounts come in two kinds. A local account exists in one machine's SAM database and is meaningful only there. A domain account lives in Active Directory and is recognised across the domain. Both are identified internally by a security identifier rather than a name, which is why renaming the Administrator account achieves very little — its SID still ends in 500 and attackers enumerate by SID, not by name.",
      },
      {
        id: 'p8-l0-s1',
        title: 'Concept — Groups are how privilege is granted',
        body: 'Windows grants rights to groups and puts accounts in groups. Administrators can do essentially anything on the machine. Users is the standard, unprivileged membership. Beyond those, several built-in groups confer more than their names suggest — Backup Operators can read any file regardless of its ACL, because backing up requires it. That is a genuine privilege-escalation path that looks innocuous on an org chart.',
      },
      {
        id: 'p8-l0-s2',
        title: 'Concept — UAC, and what it actually is',
        body: "User Account Control splits an administrator's token in two: a filtered standard-user token for everyday work, and a full token available only after explicit consent. It stops a great deal of accidental and low-effort privileged execution. It is worth knowing that Microsoft does not treat UAC as a security boundary they will service — bypasses exist and are not always fixed. Treat it as a strong guardrail, not a wall.",
      },
      {
        id: 'p8-l0-s3',
        title: 'Concept — Built-in accounts',
        body: 'Administrator (RID 500) and Guest should both be disabled. Named administrative accounts give the same capability with attribution, which is the Phase 2 non-repudiation argument applied to Windows. Service accounts are a separate matter: they should have no interactive logon right at all, and in modern environments Group Managed Service Accounts handle their password rotation automatically.',
      },
      {
        id: 'p8-l0-s4',
        title: 'Concept — Active Directory security from the endpoint',
        body: 'Phase 5 covered Active Directory as a directory service. From the endpoint side what matters is different: a domain-joined machine trusts the domain for authentication and accepts configuration from Group Policy. Two consequences follow. Domain groups such as Domain Admins appear in local group membership, so a local audit must read domain principals as well as local ones. And Group Policy pushes settings to every machine at once, which makes it both the most efficient hardening mechanism available and a high-value target — an attacker who can edit a GPO configures your whole estate.',
      },
      {
        id: 'p8-l0-s5',
        title: 'Concept — Kerberos on the endpoint',
        body: 'Kerberos is how a domain-joined Windows machine authenticates, and Phase 5 walked the exchange. What matters here is what it leaves on the host. Tickets are cached in memory, which is why credential theft targets LSASS and why Sysmon event 10 — one process reading another process memory — is a high-signal detection. Note also that a Windows logon type 3 event on a domain host usually means Kerberos succeeded upstream, so the endpoint log alone will not tell you whether the credential was phished or legitimately used.',
      },
      {
        id: 'p8-l0-s6',
        title: 'Example — One finding that undermines a whole baseline',
        body: 'The audit of WS-01 finds analyst1 in the local Administrators group. Compare that to the Phase 1 enumeration, where the same account was in Users only. It was elevated at some point and nobody removed it. This single item matters more than the rest of the baseline combined, because an administrator can disable Defender, alter audit policy, and clear the event log — every other control on that host becomes advisory.',
      },
      {
        id: 'p8-l0-s7',
        title: 'Review — What must stick',
        body: 'Local accounts are per-machine, domain accounts are directory-wide, and both are really SIDs. Groups grant privilege; Backup Operators is more powerful than it sounds. UAC splits the admin token and is a guardrail rather than a boundary. Administrator and Guest disabled, named admin accounts for attribution. Standing local admin invalidates every other control on the host.',
      },
    ],
    quiz: [
      {
        id: 'p8-q0',
        type: 'scenario',
        stem: 'A hardening audit finds a standard user in the local Administrators group. Why does this matter more than the other findings on the same host?',
        options: [
          'It allows the user to install software',
          'An administrator can disable the other controls — Defender, audit policy, event logs — so every remaining finding becomes advisory',
          'It violates licensing terms',
          'It prevents Group Policy from applying',
        ],
        answer: 1,
        explanation:
          'Standing local administrator rights let the holder undo the rest of the baseline from the endpoint. This is why privilege removal is sequenced first in any remediation plan.',
        examClue:
          'When ordering remediation, remove standing privilege before hardening anything that privilege could reverse.',
        domain: 'Security Operations',
        conceptId: 'windows-groups',
      },
      {
        id: 'p8-q1',
        type: 'mcq',
        stem: 'Why does renaming the built-in Administrator account provide limited security benefit?',
        options: [
          'Windows reverts the name at next boot',
          'The account is identified by a well-known SID ending in 500, which enumeration uses regardless of the name',
          'Renaming breaks Group Policy',
          'The old name remains in the event log',
        ],
        answer: 1,
        explanation:
          'Enumeration works on SIDs, not display names. Renaming is mild obscurity; disabling the account and using named administrative accounts is the actual control.',
        domain: 'Security Operations',
        conceptId: 'windows-accounts',
      },
      {
        id: 'p8-q2',
        type: 'mcq',
        stem: 'Which statement about User Account Control is accurate?',
        options: [
          'UAC is a security boundary Microsoft services against bypasses',
          'UAC splits the administrator token so full privilege requires explicit consent, but it is a guardrail rather than a boundary',
          'UAC prevents all privilege escalation',
          'UAC applies only to standard users',
        ],
        answer: 1,
        explanation:
          'UAC filters the admin token and requires consent to use full privilege. Microsoft explicitly does not treat it as a serviceable security boundary, so bypasses exist. It is valuable and it is not a wall.',
        domain: 'Security Architecture',
        conceptId: 'uac',
      },
    ],
  },

  {
    id: 'p8-lesson-1',
    phaseId: 'phase-8',
    title: 'NTFS Permissions and the Share Interaction',
    objectives: [
      'Read an NTFS ACL including inheritance flags',
      'Distinguish NTFS from share permissions',
      'Apply the most-restrictive rule when both are in play',
      'Explain what happens to permissions when files move',
    ],
    concepts: ['ntfs', 'windows-permissions', 'share-permissions'],
    homework:
      'Write out what a user gets when share permissions say Change and NTFS says Read. Then reverse the two and explain the result.',
    careerConnection:
      'The NTFS-versus-share question appears on almost every Windows exam and in every file-server access ticket you will ever handle.',
    sections: [
      {
        id: 'p8-l1-s0',
        title: 'Concept — Reading an ACL',
        body: 'An NTFS access control list is an ordered set of entries, each naming a principal and the rights allowed or denied. The rights worth knowing are Read, Write, Read and Execute, Modify, and Full Control — where Full Control additionally includes the ability to change permissions and take ownership, which is why it is rarely appropriate for ordinary users.',
      },
      {
        id: 'p8-l1-s1',
        title: 'Concept — Inheritance',
        body: 'Entries marked (OI) object inherit and (CI) container inherit propagate to files and subfolders. An entry is either Inherited from the parent or Explicit on the object itself. This matters when troubleshooting: changing a parent folder fixes every inheriting child at once, while explicit entries on a child survive the parent change and are exactly where unexpected access hides.',
      },
      {
        id: 'p8-l1-s2',
        title: 'Concept — NTFS versus share permissions',
        body: 'NTFS permissions apply locally and over the network, and are granular. Share permissions apply only over the network, and are coarse — Read, Change, Full Control. When both are in play the effective access is the more restrictive of the two. So share Full Control combined with NTFS Read gives Read; the reverse combination also gives Read. Common practice is to set the share permissively and control everything with NTFS, so there is only one place to reason about.',
      },
      {
        id: 'p8-l1-s3',
        title: 'Concept — What happens when files move',
        body: 'A file moved within the same NTFS volume keeps its explicit permissions. A file copied anywhere, or moved to a different volume, inherits the permissions of its destination. This is a real source of accidental exposure: dragging a restricted folder to a different drive can silently widen access, and nothing warns you.',
      },
      {
        id: 'p8-l1-s4',
        title: 'Concept — Deny, and why to avoid it',
        body: 'An explicit Deny normally overrides an Allow, which sounds useful and creates unmaintainable permission sets in practice. Prefer removing an Allow to adding a Deny. A folder tree with scattered Deny entries becomes something nobody can reason about, and "why can this person not open the file" turns into an afternoon.',
      },
      {
        id: 'p8-l1-s5',
        title: 'Review — What must stick',
        body: 'Full Control includes changing permissions and taking ownership. (OI)(CI) means inheritance down the tree; explicit beats inherited for troubleshooting attention. NTFS applies locally and remotely; share only remotely; the more restrictive wins. Move within a volume keeps permissions, copy or cross-volume inherits. Avoid Deny.',
      },
    ],
    quiz: [
      {
        id: 'p8-q3',
        type: 'scenario',
        stem: 'A share grants Full Control to Authenticated Users. NTFS on the same folder grants Read to the same group. What access does a network user get?',
        options: ['Full Control', 'Change', 'Read', 'No access'],
        answer: 2,
        explanation:
          'When share and NTFS permissions both apply, the more restrictive result wins. NTFS Read is more restrictive than share Full Control, so effective access is Read.',
        examClue:
          'Evaluate share and NTFS separately, then take the more restrictive of the two results.',
        domain: 'Security Architecture',
        conceptId: 'share-permissions',
      },
      {
        id: 'p8-q4',
        type: 'scenario',
        stem: 'A restricted folder is copied from D: to E:. What happens to its permissions?',
        options: [
          'Explicit permissions are preserved',
          'The copy inherits the permissions of its destination, potentially widening access',
          'All permissions are removed',
          'The copy is blocked',
        ],
        answer: 1,
        explanation:
          'Copies always inherit from the destination, as do moves across volumes. Only a move within the same volume preserves explicit permissions — and nothing warns you when access widens.',
        domain: 'Security Architecture',
        conceptId: 'ntfs',
      },
      {
        id: 'p8-q5',
        type: 'mcq',
        stem: 'What does the (CI) flag on an access control entry indicate?',
        options: [
          'The entry is a Deny rule',
          'The entry is inherited by subfolders (container inherit)',
          'The entry applies only to the current user',
          'The entry cannot be modified',
        ],
        answer: 1,
        explanation:
          '(CI) is container inherit, propagating to subfolders; (OI) is object inherit, propagating to files. Together they apply the entry down the whole tree.',
        domain: 'Security Architecture',
        conceptId: 'windows-permissions',
      },
    ],
  },

  {
    id: 'p8-lesson-2',
    phaseId: 'phase-8',
    title: 'Defender, Firewall and Endpoint Controls',
    objectives: [
      'Interpret Defender status output correctly',
      'Explain why exclusions can silently disable protection',
      'Read firewall profiles and identify which matters most',
      'Explain BitLocker modes and recovery key escrow',
    ],
    concepts: ['defender', 'windows-firewall', 'bitlocker', 'endpoint-hardening'],
    homework:
      'Check Defender, the host firewall, and BitLocker status on a machine you own and record the state of each. For any that are off, write what risk that accepts.',
    careerConnection:
      'Reporting "Defender is enabled" from a dashboard without checking exclusions is a mistake that shows up in real audit findings.',
    sections: [
      {
        id: 'p8-l2-s0',
        title: 'Concept — Defender status is not the whole picture',
        body: 'Get-MpComputerStatus reports real-time protection, behaviour monitoring, cloud protection, signature age and tamper protection. Every one of those can read healthy while the product scans nothing, because exclusions are configured separately. A broad exclusion path disables protection in practice while the status output stays green. Always check exclusions as a distinct step.',
      },
      {
        id: 'p8-l2-s1',
        title: 'Concept — Why broad exclusions happen',
        body: 'They are almost never malicious. A developer reports slow builds, someone excludes the whole drive to prove it is Defender, and it is never narrowed afterwards. The security consequence is severe and asymmetric: attackers actively enumerate exclusion paths, because a folder Defender ignores is a safe place to stage tools. Tamper protection prevents an attacker changing Defender settings, but does not help if a legitimate administrator already excluded C:\\.',
      },
      {
        id: 'p8-l2-s2',
        title: 'Concept — Firewall profiles',
        body: 'Windows Firewall applies one of three profiles depending on the network: Domain when a domain controller is reachable, Private for trusted home networks, Public for everything else. Public is the one that matters most, because it applies in hotels, cafes and conference venues — precisely where the laptop is most exposed and least protected by anything else in your estate. A disabled public profile is worse than a disabled domain profile.',
      },
      {
        id: 'p8-l2-s3',
        title: 'Concept — BitLocker',
        body: 'BitLocker encrypts the volume, protecting data at rest against someone who has the physical device. TPM-only unlocks automatically at boot, which is convenient and defeats the purpose for a stolen laptop — the thief simply powers it on. TPM plus PIN requires something the attacker does not have. Recovery keys must be escrowed to Active Directory or Entra ID, because an unescrowed key turns a routine hardware fault into permanent data loss.',
      },
      {
        id: 'p8-l2-s4',
        title: 'Scenario — Reading a green dashboard sceptically',
        body: 'WS-01 reports Defender fully enabled, signatures one day old, tamper protection on. It also excludes the entire C: drive, has the public firewall profile disabled, and has script block logging off. A dashboard summarising this host as compliant would be accurate about every field it checked and wrong about the host. Check the settings the dashboard does not.',
      },
      {
        id: 'p8-l2-s5',
        title: 'Review — What must stick',
        body: 'Defender status and Defender exclusions are separate checks; a broad exclusion disables protection while status stays green. Three firewall profiles — Domain, Private, Public — and Public matters most. BitLocker TPM-only unlocks automatically; TPM plus PIN is the meaningful configuration. Escrow recovery keys or encryption becomes data loss.',
      },
    ],
    quiz: [
      {
        id: 'p8-q6',
        type: 'scenario',
        stem: 'Get-MpComputerStatus reports real-time protection enabled and signatures one day old. Get-MpPreference shows ExclusionPath containing C:\\. What is the actual state?',
        options: [
          'The host is protected; exclusions only affect scheduled scans',
          'Defender is effectively disabled for the system drive while reporting healthy',
          'The exclusion is overridden by real-time protection',
          'Tamper protection prevents exclusions from applying',
        ],
        answer: 1,
        explanation:
          'Exclusions apply to real-time protection too. Excluding the system drive means Defender scans nothing that matters while every status field still reads True — which is why status and exclusions are separate checks.',
        examClue:
          'When a question shows a healthy status alongside a configuration detail, the detail is the answer.',
        domain: 'Security Operations',
        conceptId: 'defender',
      },
      {
        id: 'p8-q7',
        type: 'mcq',
        stem: 'Which Windows Firewall profile is most important on a laptop that travels?',
        options: ['Domain', 'Private', 'Public', 'All are equivalent'],
        answer: 2,
        explanation:
          'Public applies on untrusted networks — hotels, cafes, conferences — where the host is most exposed and has no other protection around it. The domain profile applies where your other controls already exist.',
        domain: 'Security Architecture',
        conceptId: 'windows-firewall',
      },
      {
        id: 'p8-q8',
        type: 'scenario',
        stem: 'A laptop uses BitLocker in TPM-only mode and is stolen. What protection does this provide against the thief?',
        options: [
          'Strong — the data cannot be accessed without the recovery key',
          'Limited — the TPM releases the key automatically at boot, so the thief only needs to get past the logon',
          'None — TPM-only mode does not encrypt the drive',
          'Complete — BitLocker detects the theft and wipes the volume',
        ],
        answer: 1,
        explanation:
          'TPM-only unlocks the volume automatically during boot. It protects against offline attacks such as removing the drive, but not against someone who simply powers the laptop on. TPM plus PIN requires something the attacker does not have.',
        domain: 'Security Architecture',
        conceptId: 'bitlocker',
      },
    ],
  },

  {
    id: 'p8-lesson-3',
    phaseId: 'phase-8',
    title: 'Event Viewer, Sysmon and PowerShell Logging',
    objectives: [
      'Navigate the Windows event logs and the key event IDs',
      'Explain what Sysmon adds over the built-in logging',
      'Explain why PowerShell script block logging matters most',
      'Identify logging gaps that hide living-off-the-land attacks',
    ],
    concepts: ['event-viewer', 'sysmon', 'powershell-security', 'windows-logs'],
    homework:
      'Open Event Viewer on your own machine, find a 4624, and write down its Logon Type and what that type tells you about how the logon happened.',
    careerConnection:
      'Knowing which logging settings are off by default — and turning them on — is one of the highest-value things a junior analyst can contribute.',
    sections: [
      {
        id: 'p8-l3-s0',
        title: 'Concept — The event logs',
        body: "Security holds authentication and audit events, System holds service and driver events, Application holds software events. Beyond these, individual products write to their own operational channels — PowerShell and Sysmon both do. The Security log is where Phase 7's investigation lived, and the IDs to know are the same four: 4624, 4625, 4688, 4672.",
      },
      {
        id: 'p8-l3-s1',
        title: 'Concept — What Sysmon adds',
        body: 'Sysmon is a free Microsoft tool that writes far richer telemetry than the built-in log. Three events justify deploying it on their own. Event 1 records process creation with hashes and the full command line. Event 3 records network connections attributed to the process that made them. Event 22 does the same for DNS queries. That process attribution is exactly what the Phase 7 firewall log could not provide.',
      },
      {
        id: 'p8-l3-s2',
        title: 'Concept — Sysmon event 10 and credential dumping',
        body: "Event 10 records one process opening a handle to another process's memory. This is the detection for credential dumping: reading LSASS memory to extract credentials is a technique that has no legitimate equivalent for most processes. If you deploy Sysmon and tune only one rule, tune this one.",
      },
      {
        id: 'p8-l3-s3',
        title: 'Concept — PowerShell logging, and the default that hurts',
        body: 'Script block logging records what PowerShell actually executed, after de-obfuscation — so an encoded command appears in the log as its decoded form. It is the highest-value logging setting on Windows for living-off-the-land detection, and it is off by default. Module logging and transcription add further depth. Note that execution policy is not security: it prevents accidental script execution and is bypassable by design.',
      },
      {
        id: 'p8-l3-s4',
        title: 'Concept — The PowerShell 2.0 downgrade',
        body: 'The version 2.0 engine predates both script block logging and AMSI. If it remains installed, an attacker can invoke it explicitly and operate entirely outside your logging and antimalware scanning. Removing the optional feature closes a bypass that no amount of logging configuration on version 5 will cover.',
      },
      {
        id: 'p8-l3-s5',
        title: 'Scenario — The gap that hid the Phase 7 attack',
        body: 'WS-01 had process creation auditing on, which produced the 4688 that named powershell.exe. It did not have command-line auditing, so the arguments were absent — and for a living-off-the-land attack the arguments are the entire evidence, because the binary is legitimate. Script block logging was off as well. The investigation succeeded on network and EDR telemetry instead; with those two settings enabled it would have been far faster.',
      },
      {
        id: 'p8-l3-s6',
        title: 'Review — What must stick',
        body: 'Security, System, Application, plus per-product channels. 4624, 4625, 4688, 4672. Sysmon adds process-attributed network and DNS events, and event 10 detects credential dumping. Script block logging is the highest-value setting and is off by default. Execution policy is not a security control. Remove PowerShell 2.0.',
      },
    ],
    quiz: [
      {
        id: 'p8-q9',
        type: 'mcq',
        stem: 'What does Sysmon provide that the built-in Windows Security log does not?',
        options: [
          'Encrypted log storage',
          'Network connections and DNS queries attributed to the originating process',
          'Automatic remediation of threats',
          'Longer log retention',
        ],
        answer: 1,
        explanation:
          'Sysmon events 3 and 22 tie network connections and DNS queries to the process responsible — the exact attribution a firewall log cannot give you. Event 10 additionally detects process memory access such as LSASS reads.',
        domain: 'Security Operations',
        conceptId: 'sysmon',
      },
      {
        id: 'p8-q10',
        type: 'scenario',
        stem: 'An attacker runs a base64-encoded PowerShell command. Which logging setting records the decoded content?',
        options: [
          'Process creation auditing (4688) without command line',
          'PowerShell script block logging',
          'PowerShell execution policy',
          'Windows Firewall logging',
        ],
        answer: 1,
        explanation:
          'Script block logging records what PowerShell actually executed after de-obfuscation, so the decoded command appears in event 4104. Basic 4688 shows only that powershell.exe ran; execution policy logs nothing at all.',
        examClue:
          'For obfuscated PowerShell, the answer is script block logging — it captures post-de-obfuscation content.',
        domain: 'Security Operations',
        conceptId: 'powershell-security',
      },
      {
        id: 'p8-q11',
        type: 'scenario',
        stem: 'Why does leaving the PowerShell 2.0 engine installed weaken detection?',
        options: [
          'Version 2.0 runs faster and evades performance monitoring',
          'Version 2.0 predates script block logging and AMSI, so invoking it bypasses both',
          'Version 2.0 cannot be restricted by execution policy',
          'Version 2.0 requires administrator rights, escalating any attack',
        ],
        answer: 1,
        explanation:
          'An attacker invoking the legacy engine operates outside script block logging and AMSI scanning entirely. Removing the optional feature closes a bypass that logging configuration on version 5 cannot cover.',
        domain: 'Security Operations',
        conceptId: 'powershell-security',
      },
      {
        id: 'p8-q12',
        type: 'mcq',
        stem: "Which Sysmon event ID detects a process reading another process's memory, such as credential dumping from LSASS?",
        options: ['Event 1', 'Event 3', 'Event 10', 'Event 22'],
        answer: 2,
        explanation:
          'Event 10 records process access. Event 1 is process creation, 3 is network connection, 22 is DNS query. Reading LSASS memory has no legitimate equivalent for most processes, which makes this a high-signal detection.',
        domain: 'Security Operations',
        conceptId: 'sysmon',
      },
    ],
  },

  {
    id: 'p8-lesson-4',
    phaseId: 'phase-8',
    title: 'Services, Scheduled Tasks, Registry and Persistence',
    objectives: [
      'Identify services and scheduled tasks used for persistence',
      'Explain the common registry autostart locations',
      'Distinguish a hardening finding from an active compromise',
      'Sequence a remediation plan correctly',
    ],
    concepts: ['windows-services', 'scheduled-tasks', 'registry-security', 'persistence'],
    homework:
      'List the scheduled tasks and auto-start services on a machine you own and account for each one. Then name the three persistence locations you would check first on a suspect host.',
    careerConnection:
      'Persistence is what makes an incident recur after you thought you had cleaned it. Finding it is the difference between remediation and a repeat callout.',
    sections: [
      {
        id: 'p8-l4-s0',
        title: 'Concept — Why persistence exists',
        body: 'An attacker who gains access loses it at the next reboot unless they arrange otherwise. Persistence is that arrangement, and Windows offers many places to put it: services, scheduled tasks, registry run keys, startup folders, WMI subscriptions. Cleaning an endpoint without finding the persistence mechanism means the attacker returns, and the second callout is usually harder because the obvious evidence has been removed.',
      },
      {
        id: 'p8-l4-s1',
        title: 'Concept — Scheduled tasks',
        body: 'A malicious task looks a great deal like a legitimate one, so read the details rather than the name. The signals worth checking together: a benign-sounding name, a hidden window style, SYSTEM privilege, a regular short interval, and a creation timestamp. That last one is decisive during an investigation — a task created two minutes after your intrusion timeline is not a coincidence.',
      },
      {
        id: 'p8-l4-s2',
        title: 'Concept — Services and registry autostart',
        body: 'Services run at boot with high privilege, and an unquoted service path containing spaces is a classic escalation path. The registry autostart locations to know are Run and RunOnce under both HKLM and HKCU. HKLM entries affect every user and require privilege to write; HKCU entries affect only that user and need no elevation at all — which makes HKCU the quieter choice for an attacker without admin rights.',
      },
      {
        id: 'p8-l4-s3',
        title: 'Concept — Registry security',
        body: 'Registry keys carry ACLs like files do. Two consequences matter: a writable key under HKLM\\...\\Run is a privilege-escalation path, because a low-privileged user can arrange code to run in a higher-privileged context. And auditing on sensitive keys turns registry modification into a detection rather than an archaeology exercise after the fact.',
      },
      {
        id: 'p8-l4-s4',
        title: 'Concept — A hardening finding is not always a hardening finding',
        body: 'The WS-01 audit lists SystemHealthCheck alongside settings like log size and UAC prompts. It does not belong in that category. A hidden PowerShell task running as SYSTEM every thirty minutes, created two minutes after the intrusion, is an active compromise. Deleting it as part of a tidy-up would destroy the evidence needed to answer how it got there and whether anything else was left behind.',
      },
      {
        id: 'p8-l4-s5',
        title: 'Concept — Sequencing remediation',
        body: 'Order changes the outcome. Remove standing local administrator rights first, because while they exist every other change can be reversed from the endpoint. Investigate anything that looks like an active compromise before removing it. Then apply the configuration changes, highest severity first. A remediation plan without an order is a list, not a plan.',
      },
      {
        id: 'p8-l4-s6',
        title: 'Review — What must stick',
        body: 'Persistence survives reboots: services, scheduled tasks, Run and RunOnce keys, startup folders, WMI. Judge tasks by hidden window, SYSTEM privilege, interval and creation time, not by name. HKLM affects everyone and needs privilege; HKCU needs none. Registry keys have ACLs and a writable autostart key is an escalation path. Investigate compromise before deleting it, and remove standing privilege first.',
      },
    ],
    quiz: [
      {
        id: 'p8-q13',
        type: 'scenario',
        stem: 'A scheduled task named SystemHealthCheck runs powershell.exe with a hidden window as SYSTEM every 30 minutes, created two minutes after a known intrusion. What is the correct first action?',
        options: [
          'Delete the task as part of hardening',
          'Investigate it as active persistence, preserving evidence of how it was created',
          'Rename it and monitor',
          'Reduce its frequency to daily',
        ],
        answer: 1,
        explanation:
          'This is a compromise indicator, not a configuration item. Deleting it destroys the evidence of how it was created and whether anything else was left behind. Investigate, then remove as part of incident response.',
        examClue:
          'A creation timestamp that matches an incident timeline turns a config finding into an investigation.',
        domain: 'Security Operations',
        conceptId: 'persistence',
      },
      {
        id: 'p8-q14',
        type: 'mcq',
        stem: 'Why might an attacker without administrator rights prefer HKCU\\...\\Run over HKLM\\...\\Run?',
        options: [
          'HKCU entries execute earlier in the boot sequence',
          'HKCU is writable by the user without elevation, while HKLM requires privilege',
          'HKCU entries are not logged',
          'HKLM does not support autostart entries',
        ],
        answer: 1,
        explanation:
          'HKCU affects only the current user and needs no elevation, so it is available to an attacker who has not yet escalated. HKLM affects all users but requires administrative rights to write.',
        domain: 'Security Operations',
        conceptId: 'registry-security',
      },
      {
        id: 'p8-q15',
        type: 'pbq',
        stem: 'Order this remediation plan: [0] Apply configuration hardening by severity, [1] Remove the user from local Administrators, [2] Investigate the suspicious scheduled task.',
        options: [
          'Remove the user from local Administrators',
          'Investigate the suspicious scheduled task',
          'Apply configuration hardening by severity',
        ],
        answer: [1, 2, 0],
        explanation:
          'Remove standing privilege first — while it exists, every other change can be reversed from the endpoint. Then investigate the active compromise, because deleting it later destroys evidence. Configuration hardening comes last.',
        domain: 'Security Operations',
        conceptId: 'endpoint-hardening',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p8-lab-0',
    phaseId: 'phase-8',
    title: 'Create Users and Groups in an Isolated Lab',
    objective:
      'Enumerate the account and group model on WS-01, then create a correctly scoped user and group on a Windows VM you own.',
    securityConcepts: ['Windows accounts', 'Groups', 'Least privilege', 'Service accounts'],
    environment:
      'Simulated enumeration in-platform, plus real commands for a Windows VM you own or are authorised to administer',
    topology: 'WS-01 (Windows 11, domain lab.local)',
    prerequisites: ['Complete Phase 7'],
    steps: [
      {
        id: 's0',
        instruction: 'Enumerate the local accounts and note which are disabled.',
        command: 'get-localuser',
        expected: 'Administrator and Guest disabled; analyst1 and svc-backup enabled.',
      },
      {
        id: 's1',
        instruction: 'Enumerate local Administrators membership.',
        command: 'get-localgroupmember administrators',
        expected: 'analyst1 is present — a finding, since Phase 1 showed it in Users only.',
      },
      {
        id: 's2',
        instruction:
          'ON YOUR OWN VM ONLY: create a standard user and a group, then add the user to the group. Do this on a machine you own or are authorised to administer — never on a production or third-party system.',
        expected:
          'New-LocalUser -Name labuser -NoPassword:$false; New-LocalGroup -Name LabReaders; Add-LocalGroupMember -Group LabReaders -Member labuser',
      },
      {
        id: 's3',
        instruction: 'Verify your work on your VM by re-enumerating group membership.',
        expected: 'Get-LocalGroupMember -Group LabReaders shows the new user.',
      },
    ],
    expectedResults: [
      'Local accounts enumerated and disabled ones identified',
      'Excessive Administrators membership identified as a finding',
      'A correctly scoped user and group created on the learner own VM',
      'Membership verified by re-enumeration',
    ],
    verification: [
      'Learner can explain why Administrator and Guest are disabled',
      'Learner can explain why analyst1 in Administrators is a finding',
      'Learner can state why service accounts should not log on interactively',
    ],
    troubleshooting: [
      'New-LocalUser not recognised → you are on an older PowerShell; use net user instead, or update.',
      'Commands refused → you need administrative rights on YOUR OWN lab VM. Never work around this on a machine you do not administer.',
    ],
    challenge:
      'Design the group model for a five-person team where two members need to administer one application and nobody needs domain admin. State the groups, their members, and what each grants — then explain how you would detect if someone were added to a privileged group outside your process.',
    evidence: [
      {
        id: 'ev0',
        label: 'Account and group model',
        type: 'report',
        placeholder: 'Account, enabled?, groups, what that grants',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Group membership is how Windows grants privilege, so enumerating it is how you answer "what could this account do". The finding here — a standard user in local Administrators — undermines every other control on the host.',
  },

  {
    id: 'p8-lab-1',
    phaseId: 'phase-8',
    title: 'Apply and Interpret NTFS Permissions',
    objective:
      'Read an NTFS ACL including inheritance, and work out effective access when share permissions also apply.',
    securityConcepts: ['NTFS', 'Share permissions', 'Inheritance', 'Effective access'],
    environment: 'Deterministic simulator — prepared ACL artifacts, nothing is executed',
    topology: 'C:\\reports on WS-01, shared to the network',
    prerequisites: ['Complete "Create Users and Groups in an Isolated Lab"'],
    steps: [
      {
        id: 's0',
        instruction: 'Read the ACL on the reports directory.',
        command: 'get-acl c:\\reports',
        expected:
          'SYSTEM and Administrators FullControl inherited; analyst1 ReadAndExecute explicit.',
      },
      {
        id: 's1',
        instruction: 'Review how NTFS and share permissions interact.',
        command: 'compare ntfs share permissions',
        expected: 'The more restrictive of the two wins when both apply.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the Phase 1 view of the same directory.',
        command: 'icacls c:\\reports',
        expected: 'The same permissions in icacls notation.',
      },
    ],
    expectedResults: [
      'ACL read including inheritance flags',
      'Explicit distinguished from inherited entries',
      'Effective access computed across NTFS and share',
      'Two notations for the same permissions recognised',
    ],
    verification: [
      'Learner can compute effective access from a share and NTFS pair',
      'Learner can explain what (OI)(CI) means',
      'Learner can explain what happens to permissions on copy versus move',
    ],
    troubleshooting: [
      'Effective access unclear → work out share and NTFS separately, then take the more restrictive.',
      'Unexpected access on a subfolder → look for an explicit entry; it survives parent changes.',
    ],
    challenge:
      'A folder must be readable by all staff, writable by the finance team, and invisible to contractors. Design the permissions using only Allow entries — no Deny — and explain why avoiding Deny matters for whoever maintains this after you.',
    evidence: [
      {
        id: 'ev0',
        label: 'Permission design',
        type: 'report',
        placeholder: 'Principal, NTFS rights, share rights, effective access',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'When share and NTFS permissions both apply, the more restrictive wins. Setting shares permissively and controlling access entirely with NTFS gives you one place to reason about instead of two.',
  },

  {
    id: 'p8-lab-2',
    phaseId: 'phase-8',
    title: 'Inspect Windows Events',
    objective:
      'Navigate the Windows event logs, identify the key event IDs, and find the logging gaps that hide living-off-the-land attacks.',
    securityConcepts: ['Event Viewer', 'Windows event IDs', 'Sysmon', 'Logging gaps'],
    environment: 'Deterministic simulator — prepared log artifacts, nothing is executed',
    topology: 'WS-01 Security log, PowerShell operational channel, Sysmon',
    prerequisites: ['Complete "Apply and Interpret NTFS Permissions"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the Security log from the intrusion.',
        command: 'get-eventlog -logname security -newest 5',
        expected: '4625 failures, a 4624 success, then a 4688 process creation.',
      },
      {
        id: 's1',
        instruction: 'Review what Sysmon is configured to record.',
        command: 'show sysmon config',
        expected: 'Process creation, network connection, DNS query, and process access events.',
      },
      {
        id: 's2',
        instruction: 'Check the PowerShell logging configuration and find the gap.',
        command: 'get-powershell logging',
        expected: 'Script block logging disabled; PowerShell 2.0 engine still installed.',
      },
    ],
    expectedResults: [
      'Key event IDs recognised',
      'Sysmon capabilities distinguished from built-in logging',
      'Script block logging identified as disabled',
      'PowerShell 2.0 downgrade path identified',
    ],
    verification: [
      'Learner can state what 4624, 4625, 4688 and 4672 mean',
      'Learner can explain what Sysmon events 3, 10 and 22 add',
      'Learner can explain why script block logging matters most',
    ],
    troubleshooting: [
      'Unsure which log holds an event → Security for authentication and audit, System for services, and per-product operational channels for the rest.',
      'Wondering why 4688 was not enough → without command-line auditing it records that powershell.exe ran, not what it ran.',
    ],
    challenge:
      'The Phase 7 investigation relied on network and EDR telemetry because the Windows logging was incomplete. Name the two settings that would have made it faster, say what each would have shown, and explain why neither is on by default.',
    evidence: [
      {
        id: 'ev0',
        label: 'Logging gap analysis',
        type: 'report',
        placeholder: 'Setting, current state, what it would show, why it matters',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The highest-value Windows logging settings are off by default. Script block logging and command-line auditing between them turn living-off-the-land attacks from nearly invisible into plainly readable.',
  },

  {
    id: 'p8-lab-3',
    phaseId: 'phase-8',
    title: 'Identify Suspicious Process Behaviour',
    objective:
      'Distinguish persistence from legitimate scheduled activity, and recognise the signals that separate them.',
    securityConcepts: ['Persistence', 'Scheduled tasks', 'Services', 'Process behaviour'],
    environment:
      'Deterministic simulator — prepared task and service artifacts, nothing is executed',
    topology: 'WS-01 scheduled tasks and services',
    prerequisites: ['Complete "Inspect Windows Events"'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare the scheduled tasks on the host.',
        command: 'get-scheduledtask suspicious',
        expected: 'SystemHealthCheck: hidden PowerShell, SYSTEM, 30-minute interval.',
      },
      {
        id: 's1',
        instruction: 'Review the running services and note what is disabled.',
        command: 'get-service running',
        expected: 'Print Spooler stopped and disabled; Sysmon64 running.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the process that ran during the intrusion.',
        command: 'tasklist',
        expected: 'powershell.exe PID 6644.',
      },
    ],
    expectedResults: [
      'Malicious task distinguished from legitimate one',
      'Creation timestamp correlated with the incident timeline',
      'Disabled high-risk service recognised as correct',
      'Persistence understood as surviving reboot',
    ],
    verification: [
      'Learner can name four signals that mark a task as suspicious',
      'Learner can explain why creation time matters',
      'Learner can explain why Print Spooler is commonly disabled',
    ],
    troubleshooting: [
      'Both tasks look plausible → compare window style, privilege, interval and creation time rather than name.',
      'Unsure whether to delete → if the creation time matches an incident, treat it as evidence first.',
    ],
    challenge:
      'List five places on Windows an attacker could establish persistence, and for each name the command or tool you would use to enumerate it. Then say which of the five a standard user could use without any elevation.',
    evidence: [
      {
        id: 'ev0',
        label: 'Persistence enumeration',
        type: 'report',
        placeholder: 'Location, enumeration method, privilege required',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Cleaning an endpoint without finding the persistence means the attacker returns. Judge a scheduled task by its window style, privilege, interval and creation time — never by its name, which is chosen to reassure you.',
  },

  {
    id: 'p8-lab-4',
    phaseId: 'phase-8',
    title: 'Investigate Failed Authentication',
    objective:
      'Work a Windows authentication failure from the event log to a conclusion, distinguishing attack patterns from user error.',
    securityConcepts: [
      'Authentication events',
      'Logon types',
      'Attack patterns',
      'Account lockout',
    ],
    environment: 'Deterministic simulator — prepared authentication logs, nothing is executed',
    topology: 'DC-01 Security log',
    prerequisites: ['Complete "Identify Suspicious Process Behaviour"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the failed and successful logons from the intrusion.',
        command: 'get-eventlog -logname security -newest 5',
        expected: 'Three 4625 failures then a 4624 success.',
      },
      {
        id: 's1',
        instruction: 'Compare the three password attack shapes.',
        command: 'compare password attacks',
        expected: 'Brute force, spraying and stuffing differ by accounts, attempts and sources.',
      },
      {
        id: 's2',
        instruction: 'Review the brute-force pattern for contrast.',
        command: 'show auth log brute-force',
        expected: 'One account, very many attempts, one source.',
      },
      {
        id: 's3',
        instruction: 'Review the spraying pattern.',
        command: 'show auth log password-spraying',
        expected: 'Many accounts, one attempt each, slow.',
      },
    ],
    expectedResults: [
      'Failed and successful logons correlated',
      'Attack shape identified from log structure',
      'Logon types interpreted',
      'The intrusion pattern distinguished from brute force and spraying',
    ],
    verification: [
      'Learner can state what varies between the failed attempts and what that means',
      'Learner can explain why account lockout would not have helped here',
      'Learner can interpret logon types 2, 3 and 10',
    ],
    troubleshooting: [
      'All failures look alike → check what varies: usernames, passwords, or source addresses. Each tells a different story.',
      'Unsure of logon type → 2 is console, 3 is network, 10 is RDP.',
    ],
    challenge:
      'The intrusion showed three failures with different usernames followed by a success. Explain what that means about what the attacker already had, why account lockout would not have stopped it, and which control would have.',
    evidence: [
      {
        id: 'ev0',
        label: 'Authentication analysis',
        type: 'report',
        placeholder: 'Events, what varies, attack shape, controls that would apply',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Read what varies between failed attempts. Varying passwords against one account is brute force; varying usernames from one source means the password was already known and only the naming convention was in question.',
  },

  {
    id: 'p8-lab-5',
    phaseId: 'phase-8',
    title: 'Harden a Windows Endpoint',
    objective:
      'Audit WS-01 against a hardening baseline, separate genuine findings from compliant settings, and sequence the remediation correctly.',
    securityConcepts: [
      'Endpoint hardening',
      'Security baselines',
      'Configuration audit',
      'Remediation sequencing',
    ],
    environment:
      'Interactive hardening audit in-platform, plus real commands for a Windows VM you own',
    topology: 'WS-01 across eight baseline categories',
    prerequisites: ['Complete all earlier Phase 8 labs'],
    steps: [
      {
        id: 's0',
        instruction: 'Check the Defender status.',
        command: 'get-mpcomputerstatus',
        expected: 'Everything reads healthy — which is not sufficient.',
      },
      {
        id: 's1',
        instruction: 'Check the Defender exclusions separately.',
        command: 'get-mppreference exclusions',
        expected: 'The entire C: drive is excluded.',
      },
      {
        id: 's2',
        instruction: 'Check the firewall profiles.',
        command: 'get-netfirewallprofile',
        expected: 'Public profile disabled.',
      },
      {
        id: 's3',
        instruction: 'Check the UAC configuration in detail.',
        command: 'get-uac settings',
        expected: 'UAC enabled but administrators elevate without prompting.',
      },
      {
        id: 's4',
        instruction:
          'Open the Windows Hardening Audit and classify every baseline item as compliant or a finding.',
        expected: 'Both error directions graded, with high-severity misses called out.',
      },
      {
        id: 's5',
        instruction: 'Review the sequenced remediation plan.',
        command: 'harden windows endpoint',
        expected: 'Privilege removal first; the scheduled task treated as an incident.',
      },
    ],
    expectedResults: [
      'Defender status and exclusions checked as separate steps',
      'Firewall and UAC findings identified',
      'Full baseline audited with findings separated from compliant settings',
      'Remediation sequenced with privilege removal first',
    ],
    verification: [
      'Learner can explain why a healthy Defender status is not sufficient evidence',
      'Learner can explain why UAC "Enabled" can still be a finding',
      'Learner can justify the remediation order',
    ],
    troubleshooting: [
      'Tempted to flag everything → a compliant setting flagged as a finding wastes remediation effort and credibility. Read the recommended value.',
      'Unsure about severity → ask what an attacker gains. Access paths outrank information disclosure.',
    ],
    challenge:
      'ON YOUR OWN VM ONLY: run the equivalent read-only checks (Get-MpComputerStatus, Get-MpPreference, Get-NetFirewallProfile, Get-LocalGroupMember) against a Windows machine you own. Compare its state to this baseline, list your findings by severity, and write the remediation order with justification.',
    evidence: [
      {
        id: 'ev0',
        label: 'Hardening audit findings',
        type: 'report',
        placeholder: 'Setting, current, recommended, verdict, severity, remediation order',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Order changes the outcome. Remove standing local administrator rights first, because while they exist every other change can be reversed from the endpoint. And one item on this list is an active compromise rather than a misconfiguration — deleting it as a tidy-up would destroy the evidence.',
  },
];

export const PHASE_8: Phase = {
  id: 'phase-8',
  number: 8,
  title: 'Windows Security',
  description:
    'The platform most enterprises actually run. Accounts and the privilege model, NTFS permissions, Defender and firewall, the logging settings that are off by default, and the persistence mechanisms that make an incident recur.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: LESSONS,
  labs: LABS,
};
