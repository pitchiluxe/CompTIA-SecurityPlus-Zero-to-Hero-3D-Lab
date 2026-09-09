import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 22 prepared outputs — Security Troubleshooting Center.
//
// PROMPT.md's Investigation Interface names eight panels: network diagram,
// device status, logs, alerts, user information, process information,
// timeline, and previous change history. These eight commands are that
// interface, modelled on the Phase 22 "Compromised Account" scenario as a
// worked example for Lab 0. Same closed-allowlist contract as every other
// phase — no command here executes anything.
//
// All hostnames, IPs, and usernames are fictional. IPs use RFC 1918 (private)
// or RFC 5737 (documentation) ranges only. No real credentials, keys, or
// tokens appear anywhere in this file.
// ---------------------------------------------------------------------------

export const PHASE_22_COMMANDS: PreparedCommand[] = [
  {
    match: 'show network diagram',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Network Diagram',
      '',
      'mchen-ws (10.20.4.15, office LAN)',
      '   |',
      '   v (normal path)',
      'Corporate VPN concentrator',
      '   |',
      '   v',
      'Identity provider (IdP)  ---->  SaaS email portal',
      '',
      'FLAGGED SESSION:',
      '203.0.113.44 (external) ------------------------> SaaS email portal',
      '(reached the public login endpoint directly — bypassed the VPN entirely)',
    ].join('\n'),
    teaches:
      'The diagram is the first thing to check, before any log line: it shows the flagged session took a path (direct-to-portal from an external IP) that never touches the normal VPN-mediated route at all.',
  },
  {
    match: 'show device status',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Device Status',
      '',
      'DEVICE       STATUS   DETAIL',
      '───────────  ───────  ──────────────────────────────────────────────────────',
      'mchen-ws     UP       EDR reports no malware; only the earlier legitimate office login is present.',
      'idp-01       WARNING  Authenticated the flagged session via an existing refresh token — no new MFA challenge occurred.',
    ].join('\n'),
    teaches:
      'A device can be fully "up" and still be the wrong place to look — mchen-ws is clean. The warning sits at the identity provider, where a token was honoured without a fresh authentication event.',
  },
  {
    match: 'show investigation logs',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Logs',
      '',
      '08:02  IdP           mchen authenticated with password + MFA from 10.20.4.15 (office network)',
      '08:41  SaaS portal   mchen session resumed via refresh token from 203.0.113.44 (external) — no new MFA challenge',
      '08:44  SaaS portal   mchen exported "Q3-Payroll-Export.xlsx" (312 records) — first bulk export in 90 days',
      '08:46  SaaS portal   new inbox rule created — auto-forward mail matching "invoice" to an external address',
    ].join('\n'),
    teaches:
      'Read logs for what is missing as much as what is present: there is no second authentication event at 08:41, only a session resumption — that absence is the single most important fact in this entire case.',
  },
  {
    match: 'show alert queue',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Alert Queue',
      '',
      'SEVERITY  ALERT',
      '────────  ────────────────────────────────────────────────────────────────',
      'HIGH      Impossible travel: mchen authenticated from the office and from',
      '          203.0.113.44 only 39 minutes apart',
      'MEDIUM    Anomalous mailbox rule creation for mchen (auto-forward to an',
      '          external address)',
    ].join('\n'),
    teaches:
      'Two separate alerts, two different detection logics (geo-velocity vs. rule-creation anomaly), both pointing at the same account within minutes of each other — correlation across alert types is what turns two mediumish signals into one clear incident.',
  },
  {
    match: 'show user account details',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — User Information',
      '',
      'User:            mchen',
      'Role:            Accounts Payable analyst',
      'Travel on file:  None scheduled for this week',
      'Recent tickets:  No password reset or MFA re-enrollment ticket in the last 30 days',
    ].join('\n'),
    teaches:
      'User context rules out the innocent explanation before it is even offered: no travel on file and no legitimate access-recovery ticket removes "mchen is just travelling" as a viable theory.',
  },
  {
    match: 'show process information',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Process Information',
      '',
      'Host: mchen-ws',
      'No suspicious process activity recorded around the 08:02 login.',
      'Only ordinary Outlook and Excel processes are present in the EDR timeline for this host.',
    ].join('\n'),
    teaches:
      'A clean process list on the endpoint does not clear the account — this incident lives entirely at the identity/session layer (a reused token against a SaaS portal), a layer process monitoring on the workstation cannot see at all.',
  },
  {
    match: 'show incident timeline',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Timeline',
      '',
      '08:02  mchen logs in normally from the office (password + MFA)',
      '08:41  A session resumes via refresh token from an external IP; no new MFA challenge occurs',
      '08:44  A bulk export of a payroll file occurs — first time in 90 days',
      '08:46  An auto-forward mail rule is created, targeting an external address',
    ].join('\n'),
    teaches:
      'Ordering the same facts as a timeline (rather than a log table) makes the escalation obvious: a legitimate login is followed by a token-only resumption, then data exposure, then persistence — each step depends on the one before it having gone unnoticed.',
  },
  {
    match: 'show change history',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INVESTIGATION INTERFACE — Previous Change History',
      '',
      '08:46  Mailbox auto-forward rule added, attributed to mchen via the SaaS portal',
      '       No help-desk ticket or administrator action is recorded for this change.',
    ].join('\n'),
    teaches:
      'Change history answers one specific question a log table cannot: was this change authorised through a known process? Here, the answer is no — the rule appeared with no accompanying ticket, which is itself evidence.',
  },
];
