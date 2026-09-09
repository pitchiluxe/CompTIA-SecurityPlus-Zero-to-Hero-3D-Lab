// ---------------------------------------------------------------------------
// Phase 22 — Security Troubleshooting Center scenarios.
//
// PROMPT.md: ten scenarios, each investigated through a common interface —
// network diagram, device status, logs, alerts, user information, process
// information, timeline, and previous change history — before the learner
// diagnoses a root cause and a recommended action. The interface is revealed
// before the answer; nothing here front-loads a conclusion.
//
// All people, hosts, IPs, and organisations are fictional. IPs use RFC 1918
// (private) or RFC 5737 (documentation) ranges only.
// ---------------------------------------------------------------------------

export type TroubleshootOption = {
  id: string;
  text: string;
  correct: boolean;
  /** Why this is right, or the specific misconception it represents. */
  rationale: string;
};

export type DeviceStatusEntry = {
  device: string;
  status: 'up' | 'warning' | 'alert';
  detail: string;
};

export type TroubleshootScenario = {
  id: string;
  number: number;
  title: string;
  category: string;
  alertSummary: string;
  networkDiagram: string;
  deviceStatus: DeviceStatusEntry[];
  logs: string[];
  alerts: string[];
  userInfo: string[];
  processInfo: string[];
  timeline: string[];
  changeHistory: string[];
  rootCauseOptions: TroubleshootOption[];
  actionOptions: TroubleshootOption[];
  /**
   * Progressive hints, least to most specific. Requested one at a time and
   * never shown by default: hint 1 narrows which evidence panel matters, hint 2
   * names the pattern to look for, hint 3 points at the decisive line. None of
   * the three states the root cause — that judgement stays with the learner.
   */
  hints: string[];
  debrief: string;
  conceptIds: string[];
};

export const TROUBLESHOOT_SCENARIOS: TroubleshootScenario[] = [
  // -------------------------------------------------------------------
  // 1: Compromised account
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-0',
    number: 1,
    title: 'Compromised Account',
    category: 'Identity',
    alertSummary:
      "SIEM impossible-travel alert: user 'mchen' authenticated successfully from a location roughly 4,800 miles from the office, 39 minutes after a normal office login.",
    networkDiagram:
      'mchen-ws (10.20.4.15, office LAN) → corporate VPN concentrator → identity provider (IdP) → SaaS email portal. The flagged session reached the SaaS portal\'s public login endpoint directly from an external IP, without passing through the VPN at all.',
    deviceStatus: [
      { device: 'mchen-ws', status: 'up', detail: 'EDR reports no malware; the only activity from this workstation is the earlier legitimate office login.' },
      { device: 'idp-01', status: 'warning', detail: 'Authenticated the flagged session using a previously issued refresh token — no new password or MFA challenge occurred.' },
    ],
    logs: [
      '08:02 IdP: mchen authenticated with password + MFA from 10.20.4.15 (office network)',
      '08:41 SaaS portal: mchen session resumed via refresh token from 203.0.113.44 (external, ~4,800 miles from office) — no new MFA challenge',
      '08:44 SaaS portal: mchen exported "Q3-Payroll-Export.xlsx" (312 records) — first bulk export by this user in 90 days',
      '08:46 SaaS portal: new inbox rule created — auto-forward all mail matching subject "invoice" to an external address',
    ],
    alerts: [
      'Impossible travel: mchen authenticated from the office and from 203.0.113.44 only 39 minutes apart',
      'Anomalous mailbox rule creation for mchen (auto-forward to external address)',
    ],
    userInfo: [
      'mchen — Accounts Payable analyst, no travel on file with HR for this week',
      'No help-desk password reset or MFA re-enrollment ticket in the last 30 days',
    ],
    processInfo: [
      'No suspicious process on mchen-ws; EDR shows only ordinary Outlook and Excel activity around the 08:02 login',
    ],
    timeline: [
      '08:02 — mchen logs in normally from the office (password + MFA)',
      '08:41 — a session resumes via refresh token from an external IP; no new MFA challenge occurs',
      '08:44 — a bulk export of a payroll file occurs for the first time in 90 days',
      '08:46 — an auto-forward mail rule is created, targeting an external address',
    ],
    changeHistory: [
      '08:46 — Mailbox auto-forward rule added, attributed to mchen via the portal (no help-desk or admin action recorded)',
    ],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'An attacker is reusing a valid session or refresh token obtained separately (for example, through phishing or token theft), so the SaaS portal never re-challenged MFA for the new session',
        correct: true,
        rationale:
          'A session resumed by an already-issued refresh token skips authentication entirely — that is exactly why no new MFA event appears at 08:41, and it is the single clue that localises this as a token-reuse compromise rather than a fresh credential guess.',
      },
      {
        id: 'rc1',
        text: 'mchen is legitimately travelling for business and simply forgot to notify IT',
        correct: false,
        rationale:
          'HR has no travel on file, and 39 minutes is not physically enough time to travel 4,800 miles. Read the evidence before reaching for the most benign explanation.',
      },
      {
        id: 'rc2',
        text: 'The SIEM impossible-travel rule is a false positive caused by ordinary VPN exit-node rotation',
        correct: false,
        rationale:
          'The flagged session bypassed the VPN entirely and hit the SaaS portal\'s public endpoint directly from an external IP — VPN exit-node behaviour would still route through the VPN concentrator.',
      },
      {
        id: 'rc3',
        text: 'The identity provider itself has been breached and is issuing fraudulent tokens for every user in the organisation',
        correct: false,
        rationale:
          'Nothing in the evidence points beyond this single account. Scope conclusions to what the evidence actually supports — a platform-wide breach is a far larger and unsupported claim.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Revoke all active sessions and refresh tokens for mchen, force a password reset and MFA re-enrollment, remove the malicious mail-forwarding rule, and review the exported file for sensitive data exposure',
        correct: true,
        rationale:
          'A password reset alone does not invalidate an already-issued session token — containment must explicitly revoke sessions/tokens, and the forwarding rule and exported data both need direct remediation.',
      },
      {
        id: 'a1',
        text: 'Reset only the mchen password and consider the incident closed',
        correct: false,
        rationale:
          'A password reset does not invalidate a live session token. The attacker\'s session and the forwarding rule would both survive this action untouched.',
      },
      {
        id: 'a2',
        text: 'Disable the identity provider for all users until further notice',
        correct: false,
        rationale:
          'Disproportionate — this breaks access for every employee to contain a single-account compromise with a much narrower, well-understood scope.',
      },
      {
        id: 'a3',
        text: 'Delete the mchen account entirely',
        correct: false,
        rationale:
          'Deletion destroys evidence needed for the investigation and does not, by itself, address the exported data or confirm the forwarding rule is removed.',
      },
    ],
    debrief:
      'Session and refresh tokens can outlive the credential used to obtain them — "disabled" and "revoked" are different states, and a password reset touches only the former. The mailbox auto-forward rule is the classic signature of business email compromise (BEC): once inside, an attacker sets up a durable channel that survives the next legitimate password change.',
    hints: [
      'Compare the two authentications in the log. One of them did something the other did not — look at what each was challenged for.',
      'The second session was never challenged for MFA at all. Ask yourself what a system accepts as proof of an earlier successful authentication.',
      'The IdP entry says the session resumed "via refresh token". A token issued before the attacker arrived is still a valid credential — which is why the password itself was never needed.',
    ],
    conceptIds: ['account-compromise', 'session-hijacking', 'mfa', 'business-email-compromise'],
  },

  // -------------------------------------------------------------------
  // 2: Phishing incident
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-1',
    number: 2,
    title: 'Phishing Incident',
    category: 'Email',
    alertSummary:
      'Fourteen employees in Finance and Procurement received an email from "billing@supp1ier-corp.com" referencing an overdue invoice payment; several reported it via the phishing-report button.',
    networkDiagram:
      'External sender → Secure Email Gateway (SEG) → Exchange Online mailboxes (14 recipients) → one recipient clicked a link → external landing page mimicking the company SSO login.',
    deviceStatus: [
      { device: 'seg-01', status: 'warning', detail: 'Delivered the message to all 14 recipients; the lookalike sending domain was not yet present on any blocklist.' },
      { device: 'r.patel-ws', status: 'up', detail: 'EDR shows no malicious download or process activity; only a browser page load was recorded.' },
    ],
    logs: [
      'SEG: message from "billing@supp1ier-corp.com" delivered to 14 recipients; SPF result = softfail, not hard-blocked',
      'Proxy: r.patel clicked the embedded link, page loaded a credential-harvesting page styled as the company SSO portal',
      'Proxy: no POST request (form submission) was recorded from r.patel\'s session — the page loaded but no credentials were sent',
      'Phishing-report mailbox: 3 of the 14 recipients reported the message within 10 minutes of delivery',
    ],
    alerts: [
      'SEG bulk-sender correlation: identical message delivered to 14 recipients from one external sending domain',
    ],
    userInfo: [
      '14 recipients across Finance and Procurement',
      'r.patel clicked the link but did not submit the login form, per proxy logs, and reported the email 3 minutes later',
    ],
    processInfo: ['No suspicious process activity on any of the 14 recipients\' workstations'],
    timeline: [
      'Lookalike-domain email delivered to 14 mailboxes',
      'r.patel clicks the embedded link 6 minutes later',
      'The credential-harvesting page loads; no submission event is recorded',
      'r.patel reports the email via the phishing-report button 3 minutes after clicking',
    ],
    changeHistory: ['No configuration changes associated with this incident'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A convincing lookalike-domain email bypassed the email gateway\'s technical filtering, relying on employees to be the last line of defence — which is exactly what happened when it was reported',
        correct: true,
        rationale:
          'SPF softfail was not enough to block delivery outright, and the lookalike domain was not yet blocklisted — the technical control let it through, and the human control (reporting) is what actually caught it.',
      },
      {
        id: 'rc1',
        text: "r.patel's workstation is infected with malware from opening the link",
        correct: false,
        rationale:
          'EDR shows no malicious process or download on that workstation — only a page load was recorded, with no evidence of any executable content delivered.',
      },
      {
        id: 'rc2',
        text: 'This is internal email spoofing where an employee impersonated the sender',
        correct: false,
        rationale:
          'The sender domain is external and merely resembles the company\'s real supplier domain (a lookalike/typosquat) — it is not an internal account or internal spoofing.',
      },
      {
        id: 'rc3',
        text: 'Since no credentials were actually submitted, this was a false alarm requiring no response',
        correct: false,
        rationale:
          'A confirmed lookalike-domain phishing email reaching 14 mailboxes is a real incident regardless of whether one recipient\'s click resulted in submitted credentials — the same message may still be sitting unread in 11 other inboxes.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Block the sender domain and close lookalike variants at the email gateway, search all mailboxes for the same message and remove any remaining copies, and reinforce that user reporting worked correctly here',
        correct: true,
        rationale:
          'Blocking stops recurrence, searching and purging closes the exposure for the 11 recipients who have not yet reported or acted, and recognising that reporting worked reinforces the behaviour that actually contained this incident.',
      },
      {
        id: 'a1',
        text: 'Take no action since no credentials were submitted',
        correct: false,
        rationale:
          'Eleven of the fourteen recipients have not reported anything — leaving the message in place assumes, without evidence, that no one else will click it.',
      },
      {
        id: 'a2',
        text: 'Disable all 14 recipients\' accounts as a precaution',
        correct: false,
        rationale:
          'Disproportionate — nothing in the evidence indicates any of the 14 accounts were actually compromised; only one click with no submission occurred.',
      },
      {
        id: 'a3',
        text: 'Force a company-wide password reset for every employee',
        correct: false,
        rationale:
          'This incident is scoped to 14 recipients of one message, not the entire organisation — a company-wide reset is unsupported by the evidence and disrupts everyone unnecessarily.',
      },
    ],
    debrief:
      'Email security is layered defence: SPF/DKIM/DMARC and the gateway are the technical layer, and user reporting is the human layer. Here the technical layer let a well-crafted lookalike through, and the human layer is what actually worked — which is exactly the outcome layered defence is designed to produce, and exactly why the correct response praises the report rather than treating "no submitted credentials" as "nothing happened."',
    hints: [
      'Before deciding how bad this is, establish what actually happened after the click. The proxy log is the panel that answers it.',
      'A page loading and credentials being submitted are two different events. Check whether the proxy recorded a form submission, not just a page load.',
      'There is no POST request from that session — the harvesting page rendered but nothing was sent. Now ask what the gateway did with the message, and why 14 people received it at all.',
    ],
    conceptIds: ['phishing', 'email-security', 'spf-dkim-dmarc', 'security-awareness'],
  },

  // -------------------------------------------------------------------
  // 3: Malware alert
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-2',
    number: 3,
    title: 'Malware Alert',
    category: 'Endpoint',
    alertSummary:
      "EDR critical alert: a file matching a known ransomware-loader hash executed and was terminated/quarantined on finance-ws-07, four seconds after launch.",
    networkDiagram:
      'finance-ws-07 (10.30.2.22) → attempted SMB write to \\\\fileserver01\\finance$ (blocked by EDR file-write hook) → attempted outbound connection to a newly registered external domain (blocked by DNS filtering).',
    deviceStatus: [
      { device: 'finance-ws-07', status: 'alert', detail: 'EDR terminated and quarantined the malicious process 4 seconds after execution began.' },
      { device: 'fileserver01', status: 'up', detail: 'No file modifications on the finance$ share correspond to the blocked encryption attempt.' },
    ],
    logs: [
      'EDR: "invoice_report.exe" matched a known ransomware-loader hash; process terminated and quarantined 4 seconds after execution',
      'EDR: prior to termination, the process attempted to enumerate and encrypt files on \\\\fileserver01\\finance$ — blocked by the file-write hook',
      'Email gateway: the file arrived as a ZIP attachment from an external sender approximately 2 hours before execution',
      'DNS filtering: outbound resolution attempt to a domain registered 6 days earlier was blocked',
    ],
    alerts: [
      'EDR critical: known ransomware-loader hash executed and quarantined',
      'DNS filtering: newly registered domain blocked (potential command-and-control)',
    ],
    userInfo: ['Workstation owner k.oliveira opened the ZIP attachment roughly 5 minutes before the malicious process launched'],
    processInfo: [
      '"invoice_report.exe" spawned from the Outlook attachment temp folder, unsigned, no valid code-signing certificate',
      'The process attempted injection into explorer.exe, which was blocked',
    ],
    timeline: [
      'Email with ZIP attachment arrives',
      'k.oliveira opens the attachment roughly 2 hours later',
      'The process executes and attempts file enumeration/encryption on the finance share',
      'EDR terminates and quarantines the process 4 seconds after launch',
      'A blocked outbound connection attempt to a newly registered domain follows shortly after',
    ],
    changeHistory: ['No recent patch or configuration change on finance-ws-07 relevant to this event'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A user executed a malicious email attachment that began ransomware behaviour, which layered controls (EDR and DNS filtering) contained before completing encryption or establishing command-and-control',
        correct: true,
        rationale:
          'The full chain — attachment, execution, blocked encryption attempt, blocked C2 domain — is visible and consistent, and both controls independently stopped a different stage of the same attack.',
      },
      {
        id: 'rc1',
        text: 'The file server itself was breached directly, independent of the workstation',
        correct: false,
        rationale:
          'The activity clearly originated from finance-ws-07 attempting to write to the share, not from any direct compromise of fileserver01 itself.',
      },
      {
        id: 'rc2',
        text: 'This is a false positive since EDR successfully blocked the file',
        correct: false,
        rationale:
          'The process executed and took malicious action (attempted encryption, attempted C2) before being stopped — automatic containment of an in-progress attack is not the same as nothing having happened.',
      },
      {
        id: 'rc3',
        text: 'The workstation has been compromised for months and this is unrelated ongoing activity',
        correct: false,
        rationale:
          'No prior change or dwell-time evidence exists; the entire chain traces to a single attachment opened roughly 5 minutes before detonation.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Isolate finance-ws-07 pending forensic review, verify the finance share was not actually modified, hunt for the malicious hash and C2 domain across the environment, and treat this as a full incident despite the automatic containment',
        correct: true,
        rationale:
          'Automatic tool containment stops one host in one moment — it does not confirm blast radius or rule out the same hash/domain appearing elsewhere, both of which require deliberate follow-up.',
      },
      {
        id: 'a1',
        text: 'Take no further action since the file was already quarantined',
        correct: false,
        rationale:
          'Containment of one endpoint is not equivalent to completed incident response — scoping and organisation-wide hunting are still required.',
      },
      {
        id: 'a2',
        text: 'Immediately wipe and rebuild fileserver01',
        correct: false,
        rationale:
          'Disproportionate — no evidence indicates the file server itself was compromised; the encryption attempt against it was blocked before any write occurred.',
      },
      {
        id: 'a3',
        text: 'Only counsel the employee about opening attachments and close the ticket',
        correct: false,
        rationale:
          'This addresses one contributing factor but skips verifying the share\'s integrity and hunting the indicator organisation-wide — both are required regardless of user education.',
      },
    ],
    debrief:
      'An EDR block is containment of a single moment on a single host, not a completed investigation. Scoping the blast radius (was anything on the share actually touched?) and hunting the same hash/domain across the rest of the environment are still required — automation stopping an attack does not mean the incident is closed.',
    hints: [
      'The alert says the process was terminated. Decide whether "contained" and "no incident" mean the same thing before you choose an action.',
      'Look at what the process attempted in the four seconds it ran, and where it came from. Two separate controls each did part of the work here.',
      'It tried to encrypt a file share and was blocked by a write hook, and it arrived as an email attachment two hours earlier. Something got through the gateway and was executed by a person — that part is not contained by EDR.',
    ],
    conceptIds: ['malware', 'ransomware', 'edr', 'incident-response'],
  },

  // -------------------------------------------------------------------
  // 4: Suspicious PowerShell
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-3',
    number: 4,
    title: 'Suspicious PowerShell',
    category: 'Endpoint',
    alertSummary:
      'Sysmon/EDR alert: an encoded, hidden-window PowerShell command was launched by winword.exe on ar-clerk-03, followed by an attempted LSASS memory access.',
    networkDiagram:
      'ar-clerk-03 (10.40.1.9) → outbound HTTPS to a domain registered 9 days ago → in-memory script execution (no file written to disk) → attempted local credential access (LSASS) blocked by EDR.',
    deviceStatus: [
      { device: 'ar-clerk-03', status: 'alert', detail: 'EDR blocked an LSASS memory-access attempt originating from a PowerShell process spawned by Word.' },
    ],
    logs: [
      'Sysmon Event ID 1: powershell.exe -nop -w hidden -enc <base64>, parent process WINWORD.EXE',
      'Decoded command (analyst tooling): downloads a script from a remote URL and executes it in memory, with no file written to disk',
      'Network: outbound HTTPS connection to a domain registered 9 days ago',
      'EDR: the process attempted to access LSASS process memory (credential dumping) — blocked',
    ],
    alerts: [
      'EDR: LSASS memory-access attempt blocked',
      'Sysmon correlation: hidden-window, encoded PowerShell spawned directly from a Word process',
    ],
    userInfo: ['Workstation owner d.nguyen opened a macro-enabled "invoice" attachment 2 minutes before the PowerShell process spawned'],
    processInfo: [
      'Process chain: WINWORD.EXE → powershell.exe (hidden, encoded) → attempted direct memory access to lsass.exe',
      'No file artifact was written to disk at any stage of the observed chain',
    ],
    timeline: [
      'A macro-enabled Word document is opened',
      'The macro spawns a hidden-window PowerShell process with an encoded command',
      'The command downloads and executes a script entirely in memory',
      'The process attempts to dump LSASS memory; EDR blocks the attempt',
    ],
    changeHistory: ['No approved change record for any script or tool installation on ar-clerk-03'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A malicious Office macro launched an obfuscated, hidden PowerShell command that downloaded and executed code entirely in memory (a fileless, living-off-the-land technique) and attempted credential theft',
        correct: true,
        rationale:
          'Every element — macro-spawned parent process, hidden window, base64 encoding, in-memory execution, and an LSASS access attempt — is a specific, recognised marker of fileless, living-off-the-land malicious activity, not routine administration.',
      },
      {
        id: 'rc1',
        text: 'd.nguyen intentionally ran a legitimate administrative script',
        correct: false,
        rationale:
          'The parent process is Microsoft Word, not an interactive administrative session, and a hidden window plus encoded command plus an LSASS access attempt are inconsistent with routine, authorised admin work.',
      },
      {
        id: 'rc2',
        text: 'This is a benign scheduled maintenance script',
        correct: false,
        rationale:
          'An attempted LSASS memory dump is inherently a credential-theft technique — no legitimate maintenance task requires reading another process\'s authentication memory.',
      },
      {
        id: 'rc3',
        text: 'PowerShell itself is inherently malicious and should never appear in any environment',
        correct: false,
        rationale:
          'PowerShell is a legitimate, widely used administrative tool — it is the hidden window, encoding, macro-spawned parent process, and LSASS access attempt together that make this specific execution malicious, not PowerShell\'s mere presence.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Isolate the host, treat local credentials as compromised and rotate anything that host could access, block the destination domain, and apply application controls (blocking macros from the internet, PowerShell constrained language mode) to prevent recurrence',
        correct: true,
        rationale:
          'Because the LSASS access was attempted, credential compromise must be assumed for containment purposes even though the attempt was blocked, and the preventive controls address the actual attack path (macro → PowerShell) rather than banning a legitimate tool outright.',
      },
      {
        id: 'a1',
        text: 'Disable PowerShell entirely across the organisation',
        correct: false,
        rationale:
          'This breaks legitimate administrative tooling everywhere; the attack path (macros spawning PowerShell) is better addressed with macro restrictions, logging, and constrained language mode than an outright ban.',
      },
      {
        id: 'a2',
        text: 'No action is needed since the LSASS access attempt was blocked',
        correct: false,
        rationale:
          'The host was still compromised at the initial-access stage (the macro executed and downloaded/ran code) — containment and credential rotation are still required regardless of whether the final credential-theft step succeeded.',
      },
      {
        id: 'a3',
        text: 'Only delete the original Word document',
        correct: false,
        rationale:
          'The macro has already executed; the live threat is now in the spawned PowerShell process and any in-memory code it ran, not in the original file.',
      },
    ],
    debrief:
      'Fileless malware and living-off-the-land techniques abuse legitimate binaries (like PowerShell) so that "no file on disk" does not mean "nothing happened." PowerShell logging, AMSI, and constrained language mode are the detective and preventive controls that address this pattern without removing a tool administrators genuinely need.',
    hints: [
      'Start with the parent process, not the command. Ask whether that parent has any legitimate reason to launch a shell.',
      'The parent is WINWORD.EXE. Now read the decoded command and note where the executed code lives — this determines whether a file scan would ever have found it.',
      'The code is downloaded and run in memory with nothing written to disk, and the session then reached for LSASS. The absence of a file on disk is the point, not a gap in the evidence.',
    ],
    conceptIds: ['powershell', 'fileless-malware', 'living-off-the-land', 'credential-access'],
  },

  // -------------------------------------------------------------------
  // 5: Failed authentication storm
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-4',
    number: 5,
    title: 'Failed Authentication Storm',
    category: 'Identity',
    alertSummary:
      '1,200 failed VPN authentication attempts across 340 distinct usernames occurred in 8 minutes, followed by one successful login on a service account.',
    networkDiagram:
      'Internet → 6 source IPs in a cloud-hosting range → corporate VPN gateway → internal network (reached only after the one successful authentication).',
    deviceStatus: [
      { device: 'vpn-gw-01', status: 'warning', detail: 'Individual per-account lockout thresholds (10 attempts) were never triggered; each account received only 3–4 attempts.' },
    ],
    logs: [
      'VPN gateway: 1,200 failed attempts across 340 distinct usernames in 8 minutes, roughly 3–4 attempts per username',
      'VPN gateway: attempts originated from 6 source IPs within one cloud-hosting range',
      'VPN gateway: username "svc-backup" succeeded on its 2nd attempt, from one of the 6 source IPs',
      'Directory: svc-backup is a service account exempted from MFA, last password change over 400 days ago',
    ],
    alerts: [
      'Password-spraying pattern: many usernames, few attempts each, no individual lockouts triggered',
      'Correlation alert: a successful login followed a spraying pattern on account svc-backup',
    ],
    userInfo: ['svc-backup — service account, MFA not enrolled (exempted for automation compatibility), last password change 400+ days ago'],
    processInfo: ['Not applicable to this scenario category'],
    timeline: [
      'Low-and-slow spray traffic begins across 340 usernames',
      'Each account stays under the 10-attempt lockout threshold individually',
      'svc-backup succeeds on its 2nd attempt',
      'An authenticated VPN session begins under svc-backup',
    ],
    changeHistory: ['14 months ago — svc-backup approved for an MFA exemption to support a legacy backup job; no review since'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A password-spraying attack — few attempts per account, spread across many accounts, deliberately avoiding lockout thresholds — succeeded against a service account that was exempted from MFA and had a stale password',
        correct: true,
        rationale:
          '3–4 attempts per username across 340 accounts is the defining shape of spraying (versus repeated attempts on one account), and it succeeded precisely against the one account lacking MFA.',
      },
      {
        id: 'rc1',
        text: 'This is normal background internet noise with no real risk',
        correct: false,
        rationale:
          'A successful login following the spraying pattern confirms this is a realised compromise, not background noise to be ignored.',
      },
      {
        id: 'rc2',
        text: 'The VPN lockout policy failed to trigger due to a bug',
        correct: false,
        rationale:
          'The lockout policy worked exactly as designed — each account individually stayed under its 10-attempt threshold. That is precisely why spraying is an effective technique against per-account lockout policies, not evidence of a bug.',
      },
      {
        id: 'rc3',
        text: "svc-backup's credentials were brute-forced by repeatedly guessing that single account",
        correct: false,
        rationale:
          'The evidence shows only 2 attempts against svc-backup specifically — the attack pattern is spraying across many accounts, not concentrated brute-forcing of one.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Disable/reset svc-backup immediately, review what that account can access and whether it was used during the authenticated session, enroll it in MFA or an equivalent compensating control, and lower the spray-detection threshold to catch distributed low-and-slow attempts',
        correct: true,
        rationale:
          'This addresses the compromised account directly, checks for actual impact, and closes the systemic gap (the MFA exemption and the detection threshold) that made the spray successful.',
      },
      {
        id: 'a1',
        text: 'Increase the per-account lockout threshold',
        correct: false,
        rationale:
          'Raising the threshold makes spraying easier, not harder, by giving an attacker even more attempts per account before triggering a lockout.',
      },
      {
        id: 'a2',
        text: 'Block the six source IPs and consider the incident resolved',
        correct: false,
        rationale:
          'Source IPs in a cloud-hosting range are trivially rotated; this does not address the compromised svc-backup account or the underlying MFA exemption gap.',
      },
      {
        id: 'a3',
        text: 'Require all 340 targeted usernames to reset their passwords',
        correct: false,
        rationale:
          'Only svc-backup was actually compromised — the other 339 accounts were targeted but not breached. Resetting all 340 blurs the important distinction between attempted and successful compromise.',
      },
    ],
    debrief:
      'Password spraying (few attempts, many accounts) defeats per-account lockout policies precisely because no single account ever crosses the threshold — detection has to look across accounts, not within one. MFA exemptions for service accounts are a recurring weak link precisely because they are usually approved once, for a specific reason, and then never reviewed again.',
    hints: [
      'Do the arithmetic on the log: 1,200 attempts across 340 usernames. What does that ratio tell you the attacker was trying to avoid?',
      'Three to four attempts per account stays under a lockout threshold deliberately. Now ask why exactly one account succeeded where 339 did not.',
      'The account that succeeded is a service account, and the change history shows it was exempted from MFA 14 months ago with no review since. The exemption is the finding, not the spray.',
    ],
    conceptIds: ['password-spraying', 'brute-force', 'service-accounts', 'mfa'],
  },

  // -------------------------------------------------------------------
  // 6: Privilege escalation
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-5',
    number: 6,
    title: 'Privilege Escalation',
    category: 'Endpoint',
    alertSummary:
      "EDR alert: standard-user session 'j.torres' added itself to the local Administrators group on build-srv-02, then created a new Domain Admin account.",
    networkDiagram:
      'j.torres session on build-srv-02 (internal build network) → exploited local SYSTEM service (unpatched, weak file permissions) → local Administrators group modified → new account added to Domain Admins in Active Directory.',
    deviceStatus: [
      { device: 'build-srv-02', status: 'alert', detail: 'A known local-privilege-escalation CVE has been outstanding and unpatched for 63 days on this host.' },
    ],
    logs: [
      "Windows Event 4732: 'j.torres' added to the local Administrators group on build-srv-02",
      "Windows Event 4728: new account 'svc-update01' added to Domain Admins, action performed under j.torres's session",
      'Sysmon: the session exploited an unpatched local service (running as SYSTEM) with weak file permissions, allowing an arbitrary DLL load',
      'Vulnerability scanner: build-srv-02 has had a known, patchable local-privilege-escalation CVE outstanding for 63 days',
    ],
    alerts: [
      'EDR: privilege-escalation technique detected on build-srv-02',
      'Directory monitoring: new Domain Admin account created outside any approved change window',
    ],
    userInfo: ["j.torres — standard build engineer, no administrative rights assigned by policy, no ticket or change record for this session's actions"],
    processInfo: [
      'A short-lived exploit binary executed, loaded a malicious DLL into the vulnerable SYSTEM service, then terminated',
    ],
    timeline: [
      'The exploit executes against the vulnerable local service',
      "j.torres's session is added to the local Administrators group",
      'A new account is created and added to Domain Admins',
      'The attacker now holds persistent elevated access independent of j.torres\'s own account',
    ],
    changeHistory: ['The CVE patch was scheduled but had not yet been applied — 63 days outstanding at the time of this incident'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: "An attacker, operating within j.torres's session (likely already compromised), exploited an unpatched local privilege-escalation vulnerability to gain SYSTEM-level access, then created a persistent Domain Admin account for continued access",
        correct: true,
        rationale:
          'The escalation required exploiting a specific unpatched vulnerability rather than using permissions j.torres already had — and creating a brand-new Domain Admin account is a classic persistence step once elevated access is achieved.',
      },
      {
        id: 'rc1',
        text: 'j.torres is a malicious insider misusing legitimate access',
        correct: false,
        rationale:
          "j.torres had no administrative rights by policy — the escalation itself required exploiting a vulnerability, which is inconsistent with someone simply using access they were already granted.",
      },
      {
        id: 'rc2',
        text: 'This is routine administrative activity for a build server',
        correct: false,
        rationale:
          'No change ticket exists for any of these actions, and they occurred outside any approved change window — routine administrative work is documented.',
      },
      {
        id: 'rc3',
        text: 'The vulnerability scanner produced a false positive on the outstanding CVE',
        correct: false,
        rationale:
          'The Sysmon evidence and resulting event-log actions directly demonstrate successful exploitation of that exact vulnerability class, not merely a scan-only finding.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Disable the newly created Domain Admin account immediately, treat j.torres\'s account/session as compromised and investigate its origin, apply the outstanding patch or a compensating control, and audit for any other unauthorised privileged accounts created the same way',
        correct: true,
        rationale:
          'The new Domain Admin account is the durable foothold and must be removed directly; the patch closes the exploited path; auditing catches any other account created via the same technique.',
      },
      {
        id: 'a1',
        text: "Only disable j.torres's account",
        correct: false,
        rationale:
          'This misses the newly created Domain Admin account, which is independent of j.torres and survives even if that original account is disabled.',
      },
      {
        id: 'a2',
        text: 'Wait for the previously scheduled patch cycle to apply the fix',
        correct: false,
        rationale:
          'The vulnerability is now confirmed under active exploitation — this is no longer a routine, schedulable patch situation and requires emergency remediation.',
      },
      {
        id: 'a3',
        text: 'Reset the local Administrators group membership on build-srv-02 only',
        correct: false,
        rationale:
          'This leaves the far more powerful and persistent new Domain Admin account completely untouched.',
      },
    ],
    debrief:
      'Escalation chains frequently end not with continued use of the originally compromised identity, but with the creation of a new, less-suspicious privileged account for persistence. A 63-day patch backlog is the direct enabler here — vulnerability management and incident response are the same discipline viewed at different points in time.',
    hints: [
      'A standard user cannot add itself to Administrators. Something made that possible — look for the mechanism before judging the user.',
      'Check the Sysmon detail and the change history together. One describes a weakness, the other explains why it was still there.',
      'An unpatched local service running as SYSTEM with weak file permissions allowed a DLL load, and the patch was 63 days outstanding. Then note what was created afterwards, and why that outlasts the exploit.',
    ],
    conceptIds: ['privilege-escalation', 'vulnerability-management', 'persistence', 'domain-admin'],
  },

  // -------------------------------------------------------------------
  // 7: Vulnerability finding
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-6',
    number: 7,
    title: 'Vulnerability Finding',
    category: 'Infrastructure',
    alertSummary:
      'A routine vulnerability scan flags a critical, unauthenticated remote-code-execution CVE (CVSS 9.8) on an internet-facing web application server, with a public exploit available.',
    networkDiagram:
      'Internet → DMZ firewall → web-app-03 (public-facing web server, DMZ) → internal order-processing database (not directly internet-reachable).',
    deviceStatus: [
      { device: 'web-app-03', status: 'warning', detail: 'Runs an outdated web framework version with a publicly disclosed, unauthenticated remote-code-execution vulnerability.' },
    ],
    logs: [
      'Vulnerability scan: CVSS 9.8 — remote code execution in an outdated web framework version, no authentication required, exploit publicly available',
      'WAF: no exploitation attempts matching this specific CVE pattern detected in the last 30 days of traffic',
      'Asset inventory: web-app-03 processes customer order data; the vendor patch for this CVE has been available for 21 days',
      'Change history: the last full patch cycle on web-app-03 occurred 45 days ago, before this CVE was disclosed',
    ],
    alerts: ['Vulnerability management: critical-severity finding on an internet-facing asset'],
    userInfo: ['Not applicable to this scenario category'],
    processInfo: ['Not applicable to this scenario category'],
    timeline: [
      'The vendor releases a patch for the CVE',
      'A routine vulnerability scan, run days later, flags web-app-03 as unpatched and internet-facing',
      'A WAF review confirms no exploitation attempts have been detected yet',
    ],
    changeHistory: ['45 days ago — last full patch cycle applied to web-app-03, before this CVE existed'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A critical, unauthenticated, internet-facing remote-code-execution vulnerability with a public exploit remains unpatched because it fell outside the last scheduled patch cycle, and no compensating control currently mitigates it',
        correct: true,
        rationale:
          'The vendor patch existed for 21 days but the last patch cycle (45 days ago) predates the CVE\'s disclosure — the gap is a timing/process issue, and nothing currently closes it.',
      },
      {
        id: 'rc1',
        text: 'The server has already been compromised via this vulnerability',
        correct: false,
        rationale:
          'WAF review shows no confirmed exploitation attempts — this is a vulnerability finding (a weakness), not yet a confirmed incident (an exploited event), and conflating the two leads to the wrong response.',
      },
      {
        id: 'rc2',
        text: 'This is a low-priority finding since no exploitation has occurred yet',
        correct: false,
        rationale:
          'A CVSS 9.8, internet-facing, unauthenticated vulnerability with a public exploit is about as high-priority as a vulnerability finding gets, independent of whether it has been exploited yet.',
      },
      {
        id: 'rc3',
        text: 'The WAF alone already fully mitigates this vulnerability',
        correct: false,
        rationale:
          'The WAF has not blocked anything specific to this CVE — the absence of a detected attack is not the same as a verified, targeted mitigation being in place.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Prioritise out-of-cycle emergency patching given the CVSS score, internet exposure, and public exploit availability; if immediate patching is not possible, apply a compensating control (a targeted WAF rule or temporarily restricting exposure) until the patch is applied',
        correct: true,
        rationale:
          'This is exactly the situation emergency/out-of-band patching processes exist for, and a compensating control bridges the gap if patching cannot happen immediately.',
      },
      {
        id: 'a1',
        text: 'Wait for the next regularly scheduled patch cycle',
        correct: false,
        rationale:
          'A critical, actively exploitable, internet-facing vulnerability with a public exploit does not fit a routine cycle timeline.',
      },
      {
        id: 'a2',
        text: 'Take the server offline permanently',
        correct: false,
        rationale:
          'Disproportionate — a faster mitigation (emergency patch or compensating control) is available and preserves business function.',
      },
      {
        id: 'a3',
        text: 'No action is needed since it has not been exploited yet',
        correct: false,
        rationale:
          'Waiting for exploitation before responding to a critical, actively exploitable vulnerability defeats the entire purpose of vulnerability management.',
      },
    ],
    debrief:
      'A vulnerability finding (a weakness) and a confirmed incident (an exploited event) are different things requiring different responses, but both matter. CVSS score, exposure (internet-facing), and public exploit availability together drive prioritisation, and a compensating control is the standard bridge until a permanent patch lands.',
    hints: [
      'A CVSS score on its own does not set priority. List the other three facts in the panels that change how urgent this is.',
      'Unauthenticated, internet-facing, and a public exploit exists. Each one raises real-world exploitability above what the base score alone implies.',
      'The WAF has seen no exploitation attempts yet — that is a reason to act now, not a reason to wait for the next patch cycle. Consider what you can do if patching today is not possible.',
    ],
    conceptIds: ['vulnerability-management', 'cvss', 'patch-management', 'risk-prioritization'],
  },

  // -------------------------------------------------------------------
  // 8: Misconfigured firewall
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-7',
    number: 8,
    title: 'Misconfigured Firewall',
    category: 'Infrastructure',
    alertSummary:
      'A routine firewall rule audit finds an ANY-source, ANY-port ALLOW rule permitting direct inbound internet traffic to the internal database subnet, added six days ago.',
    networkDiagram:
      'Internet (ANY source) → perimeter firewall rule #47 (ALLOW, ANY port) → internal database subnet 10.10.30.0/24, bypassing the normal DMZ-only access path.',
    deviceStatus: [
      { device: 'fw-perimeter-01', status: 'alert', detail: 'Rule #47 permits unrestricted internet access directly to the database subnet; no expiration date is set.' },
    ],
    logs: [
      'Firewall config diff: rule #47 added — Source: ANY, Destination: 10.10.30.0/24 (database subnet), Port: ANY, Action: ALLOW',
      'Firewall config diff: the change ticket describes the rule only as "temporary access for vendor testing," with no expiration or scheduled removal date',
      'Traffic log: 214 connection attempts from external IPs unrelated to the vendor\'s documented range reached the database subnet directly through this rule in the last 3 days',
      'Database server log: no successful authentication from any of those external connections — reachability only, not a confirmed breach',
    ],
    alerts: [
      'Firewall audit: critical finding — unrestricted external reachability to a protected subnet',
    ],
    userInfo: ['The rule was requested by a network engineer under a valid change ticket; the implemented scope was broader than the ticket described'],
    processInfo: ['Not applicable to this scenario category'],
    timeline: [
      'A change ticket is approved for narrow, temporary vendor testing access',
      'An overly broad rule (ANY source, ANY port) is implemented instead of the vendor\'s specific IP range',
      'The rule is left in place with no expiration date',
      'Unrelated external traffic begins reaching the database subnet within days',
    ],
    changeHistory: ['6 days ago — rule #47 added (ANY → database subnet, ANY port, ALLOW), attributed to net-eng-04'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: "A change intended to grant a specific vendor temporary, narrow access was implemented far too broadly (ANY source, ANY port, no expiration), exposing a sensitive subnet to the entire internet",
        correct: true,
        rationale:
          'The ticket described a scoped, temporary vendor need, but the deployed rule matches neither the scope nor the temporary nature described — a clear implementation-versus-intent gap.',
      },
      {
        id: 'rc1',
        text: 'The database itself has already been breached',
        correct: false,
        rationale:
          'No successful authentication occurred from any of the external connections — this is a reachability/exposure finding, not a confirmed breach, though the risk is severe.',
      },
      {
        id: 'rc2',
        text: "This rule was necessary and correctly scoped for the vendor's testing needs",
        correct: false,
        rationale:
          "The ticket presumably specified a scoped, temporary need, but the implemented rule is ANY-source with no expiration — that is a scope mismatch, not a correctly scoped exception.",
      },
      {
        id: 'rc3',
        text: 'External scanning of the database subnet is unavoidable regardless of firewall rules',
        correct: false,
        rationale:
          "A correctly scoped rule (the vendor's specific IP range only) would have prevented unrelated external IPs from reaching the subnet at all.",
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: "Immediately narrow or remove the overly broad rule to the vendor's documented IP range (or remove it entirely if testing is complete), add an expiration date to any future temporary rule, and review database logs/configuration for signs of unauthorised access during the exposure window",
        correct: true,
        rationale:
          "This directly restores the rule to its intended scope, prevents recurrence via mandatory expirations, and closes the loop on whether the exposure window was actually exploited.",
      },
      {
        id: 'a1',
        text: 'Leave the rule in place since the vendor might still need it',
        correct: false,
        rationale:
          "A rule this broad is unjustifiable regardless of ongoing need — it should be scoped to the vendor's specific IP range immediately, not left open-ended.",
      },
      {
        id: 'a2',
        text: 'Take the entire database subnet offline',
        correct: false,
        rationale:
          'Disproportionate — narrowing the rule to its intended scope resolves the exposure without an outage.',
      },
      {
        id: 'a3',
        text: 'No further action is needed since no successful login was detected',
        correct: false,
        rationale:
          'The reachability itself is the finding — the exposure window still needs review and the rule still needs correcting, regardless of whether it was exploited.',
      },
    ],
    debrief:
      "This is least privilege applied to firewall rules specifically: scope every rule to exactly what is needed, and give every temporary rule an expiration date. 'Temporary' changes without an expiration are one of the most common sources of long-lived, forgotten exposure.",
    hints: [
      'Read the change ticket against the rule that was actually written. The gap between intent and implementation is the whole scenario.',
      'The ticket says "temporary access for vendor testing"; the rule says ANY source, ANY port, no expiry. Ask what should have been scoped and what should have been scheduled.',
      'The traffic log shows 214 connection attempts from IPs unrelated to the vendor in three days — the exposure was not theoretical, so your action needs an investigation step as well as a fix.',
    ],
    conceptIds: ['firewall-misconfiguration', 'least-privilege', 'change-management', 'network-segmentation'],
  },

  // -------------------------------------------------------------------
  // 9: DNS anomaly
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-8',
    number: 9,
    title: 'DNS Anomaly',
    category: 'Network',
    alertSummary:
      'DNS security monitoring flags a workstation issuing roughly 2,600 DNS TXT queries per hour to a single external domain, each with a long, high-entropy subdomain.',
    networkDiagram:
      'contractor-ws-04 → internal DNS resolver → external domain "datasink.example" (TXT queries only; no direct HTTP/HTTPS connection to that domain observed from this host).',
    deviceStatus: [
      { device: 'contractor-ws-04', status: 'warning', detail: 'An unapproved scripting tool is present that was not deployed by IT; DNS query volume has climbed steadily over the last 6 hours.' },
    ],
    logs: [
      'DNS resolver: 2,600 TXT queries in the last hour to "datasink.example", subdomains 30–40 characters of random-looking hex',
      'Proxy/firewall: no direct outbound HTTP/HTTPS connection to datasink.example from this host — DNS is the only observed channel',
      'EDR: no known malware signature match, but an unapproved scripting tool is present that IT did not deploy',
      'Asset inventory: this host belongs to a contractor with temporary network access, scheduled for offboarding in 2 days',
    ],
    alerts: ['DNS anomaly: high-volume, high-entropy TXT queries to a single external domain'],
    userInfo: ["Contractor account with elevated local admin rights granted for a project; the access review for that grant is overdue"],
    processInfo: ['An unapproved process (not a recognised browser or approved application) is generating the DNS queries'],
    timeline: [
      'An unapproved tool is installed on the host (exact time unknown, discovered during this review)',
      'DNS query volume to the external domain begins climbing over the following 6 hours',
      'The monitoring threshold is crossed and the alert fires',
    ],
    changeHistory: ["30 days ago — the contractor's elevated local admin access was granted for a project; no access review has occurred since"],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'A host is very likely performing DNS tunnelling — using DNS TXT queries as a covert channel to exfiltrate data or communicate with external infrastructure — via an unapproved tool on a contractor machine with excessive standing access',
        correct: true,
        rationale:
          'The volume, single destination, and high-entropy subdomains together match the specific signature of DNS tunnelling, and the unapproved tool plus excessive standing access explain how it got there.',
      },
      {
        id: 'rc1',
        text: 'This volume of TXT queries is normal for a busy workstation',
        correct: false,
        rationale:
          '2,600 queries per hour to one external domain, all with high-entropy subdomains, does not resemble ordinary browsing or DNS resolution behaviour.',
      },
      {
        id: 'rc2',
        text: 'The DNS resolver itself is malfunctioning and generating the queries automatically',
        correct: false,
        rationale:
          'The queries trace back to a specific unapproved process on one host, not to resolver-side malfunction affecting the environment broadly.',
      },
      {
        id: 'rc3',
        text: 'Since no direct HTTP/HTTPS connection exists, no data can actually be leaving the network',
        correct: false,
        rationale:
          'DNS itself is the exfiltration channel in this pattern — the absence of an HTTP connection means the data is leaving via DNS instead, not that nothing is leaving.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Isolate the host immediately, block resolution of the destination domain, capture full packet data for forensic review, remove the unapproved tool, and revoke the excessive standing access pending investigation',
        correct: true,
        rationale:
          'This stops likely ongoing exfiltration, preserves evidence of what is actually being sent, and closes the standing-access gap that enabled the tool to persist unnoticed.',
      },
      {
        id: 'a1',
        text: 'Wait for the scheduled offboarding in 2 days to resolve this',
        correct: false,
        rationale:
          'Likely active exfiltration in progress cannot wait for a routine offboarding date two days out.',
      },
      {
        id: 'a2',
        text: 'Block only future TXT queries but leave the host connected',
        correct: false,
        rationale:
          'The host itself needs to be isolated to stop ongoing likely exfiltration, not merely have one query type blocked while everything else on the host continues.',
      },
      {
        id: 'a3',
        text: 'No action is needed since EDR found no matching malware signature',
        correct: false,
        rationale:
          'Absence of a known signature does not clear a host exhibiting an active, well-known behavioural tunnelling pattern — behaviour-based detection matters as much as signature matching here.',
      },
    ],
    debrief:
      'DNS tunnelling is a behavioural pattern — volume, entropy, and a single destination domain — rather than something a signature match will reliably catch. Excess standing privilege (a contractor grant with an overdue review) is a recurring contributing factor across many of these scenarios, not just this one.',
    hints: [
      'DNS is a legitimate protocol, so volume alone is not the signal. Look at the query type and the shape of the subdomains.',
      'TXT records carry arbitrary text, and the subdomains are 30-40 characters of random-looking hex. Ask what that structure is capable of carrying.',
      'The proxy shows no HTTP or HTTPS to that domain at all — DNS is the only channel in use. A protocol nobody blocks is being used as the transport.',
    ],
    conceptIds: ['dns-tunnelling', 'data-exfiltration', 'least-privilege', 'contractor-access'],
  },

  // -------------------------------------------------------------------
  // 10: Suspicious network traffic
  // -------------------------------------------------------------------
  {
    id: 'p22-scenario-9',
    number: 10,
    title: 'Suspicious Network Traffic',
    category: 'Network',
    alertSummary:
      'IDS/NetFlow alert: ws-analytics-11 generated SMB (port 445) connections to 42 distinct internal hosts within 10 minutes, a sharp deviation from its normal baseline of 1–2 SMB connections per day.',
    networkDiagram:
      'ws-analytics-11 → SMB (445) scan across 42 internal hosts → successful authentication on 3 hosts using a shared local administrator credential → scheduled task created on one accessed host, referencing ws-analytics-11.',
    deviceStatus: [
      { device: 'ws-analytics-11', status: 'alert', detail: 'Source of the SMB scanning burst; no approved change explains any new software or script on this host.' },
      { device: '3 accessed hosts', status: 'alert', detail: 'Successfully authenticated via a shared local administrator credential; one now has a malicious scheduled task.' },
    ],
    logs: [
      'NetFlow: ws-analytics-11 initiated SMB connections to 42 distinct internal hosts between 09:12–09:22, versus a baseline of 1–2 per day',
      'IDS: signature match for a known lateral-movement scanning tool pattern within the SMB negotiation traffic',
      'Successful authentication observed on 3 of the 42 targeted hosts, using a shared local administrator credential',
      'EDR: a scheduled task was created on one of the 3 accessed hosts shortly after access, referencing a script hosted on ws-analytics-11',
    ],
    alerts: [
      'IDS: lateral-movement scanning signature detected',
      'Behavioural alert: anomalous internal SMB scanning volume from a single host',
    ],
    userInfo: ['ws-analytics-11 is assigned to a data analyst; there is no legitimate business reason for this host to initiate SMB connections to dozens of other endpoints'],
    processInfo: ['The scanning and authentication activity is attributed to a process outside the standard analytics toolset installed on this host'],
    timeline: [
      'Baseline SMB behaviour (1–2 connections/day) is normal for weeks prior',
      'A burst of 42 SMB connection attempts occurs within 10 minutes',
      '3 of the 42 attempts succeed, using a shared local administrator credential',
      'A scheduled task referencing ws-analytics-11 is created on one of the 3 accessed hosts',
    ],
    changeHistory: ['No approved change for any new software or script on ws-analytics-11 in the past 30 days'],
    rootCauseOptions: [
      {
        id: 'rc0',
        text: 'ws-analytics-11 has been compromised and is being used to perform internal lateral movement — scanning for and authenticating to other hosts via a shared local administrator credential, then establishing persistence on the hosts it successfully accessed',
        correct: true,
        rationale:
          'The source, method (SMB scan matching a known lateral-movement signature), and outcome (persistence via a scheduled task referencing the source host) together describe a coherent lateral-movement chain originating from ws-analytics-11.',
      },
      {
        id: 'rc1',
        text: 'This is routine IT asset-management scanning software',
        correct: false,
        rationale:
          'No approved change or standard toolset explains this activity, and the IDS matched a known lateral-movement scanning-tool signature, not an inventory tool\'s signature.',
      },
      {
        id: 'rc2',
        text: 'The 42 target hosts were the ones actually compromised, not ws-analytics-11',
        correct: false,
        rationale:
          'The scanning and authentication activity originates from ws-analytics-11 — it is the source of the lateral movement, and the 3 hosts it successfully authenticated to are the ones now also compromised.',
      },
      {
        id: 'rc3',
        text: 'Shared local administrator credentials are a normal, low-risk convenience unrelated to this incident',
        correct: false,
        rationale:
          'Reuse of a single shared local administrator credential across many hosts is precisely what allowed the lateral movement to succeed on 3 of the 42 attempted hosts — it is a central, not incidental, factor.',
      },
    ],
    actionOptions: [
      {
        id: 'a0',
        text: 'Isolate ws-analytics-11 and the 3 confirmed-compromised hosts, rotate the shared local administrator credential across the environment to a unique-per-host solution, remove the malicious scheduled task, and hunt for further spread from the 3 compromised hosts',
        correct: true,
        rationale:
          'This addresses the source host, the confirmed victims, the specific persistence mechanism, and the systemic credential-reuse issue that enabled the spread — the full scope of what the evidence supports.',
      },
      {
        id: 'a1',
        text: 'Only remove the scheduled task from the one host where it was found',
        correct: false,
        rationale:
          'This does not address the still-active source host or the 2 other compromised hosts, and leaves the shared-credential problem — the root enabler of the spread — completely unaddressed.',
      },
      {
        id: 'a2',
        text: "Reset only the ws-analytics-11 assigned user's own password",
        correct: false,
        rationale:
          "The compromise operates at the host/process level, not via the assigned user's own credential — a user password reset neither removes the attacker's foothold nor fixes the shared local administrator credential issue.",
      },
      {
        id: 'a3',
        text: 'No action is needed since only 3 of 42 attempts succeeded',
        correct: false,
        rationale:
          'Three successfully compromised hosts, one already showing established persistence, is a confirmed active incident regardless of the failure rate on the other 39 attempts.',
      },
    ],
    debrief:
      'Lateral movement via SMB using a single shared local administrator credential is a systemic risk multiplier: one credential compromise cascades across every host that shares it. A unique-per-host local administrator credential strategy (such as a managed local-account password solution) is the durable fix, not just cleaning up the hosts found this time.',
    hints: [
      'Compare the observed SMB behaviour against this host\'s own baseline. One host reaching 42 peers is a shape, not a volume problem.',
      'Note that 3 of the 42 hosts accepted an authentication. Ask what one credential would have to be for that to work across unrelated machines.',
      'The successful logons all used the same shared local administrator credential — which is why containing only the original host would leave the spread mechanism intact.',
    ],
    conceptIds: ['lateral-movement', 'shared-credentials', 'smb', 'persistence'],
  },
];
