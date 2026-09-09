import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 23 prepared outputs — Full SOC Capstone.
//
// Narrative artifacts for IR-2026-0909-01, the ransomware capstone incident.
// Same closed-allowlist contract as every other phase — nothing here executes
// anything. All hostnames, usernames, and IPs are fictional; addresses use
// RFC 1918 (private) or RFC 5737 (documentation) ranges only.
// ---------------------------------------------------------------------------

export const PHASE_23_COMMANDS: PreparedCommand[] = [
  {
    match: 'show vpn authentication log',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'VPN GATEWAY LOG — VPN-GW-01',
      '',
      '03:11:40  vendor-support  Credential submission observed at lookalike portal (web proxy correlation)',
      '03:12:15  vendor-support  Authentication SUCCESS from an unfamiliar country — no MFA challenge recorded',
      '03:12:16  vendor-support  Session established, mapped drive access to FILESRV-02 granted',
    ].join('\n'),
    teaches:
      'No MFA challenge appears anywhere in this log for a third-party account — that absence, not any single present-tense line, is what should stand out first.',
  },
  {
    match: 'show ransomware detection alert',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'SIEM CORRELATION ALERT — CRITICAL',
      '',
      'Rule: Simultaneous mass file-rename + shadow-copy deletion across multiple hosts',
      'Hosts: FILESRV-02, APPSRV-03',
      'Window: 03:22:40 - 03:24:12 (92 seconds)',
      'First fired: this incident — no prior baseline for this correlation rule',
    ].join('\n'),
    teaches:
      'This rule fired for the first time during this incident, which is itself a lessons-learned finding: the detection existed only after the environment needed it, not before.',
  },
  {
    match: 'explain ransomware containment exception',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'CONTAINMENT ORDER — RANSOMWARE EXCEPTION',
      '',
      'Default order (most incident types): capture volatile evidence (memory), THEN isolate.',
      'Ransomware exception: ISOLATE FIRST, capture whatever evidence remains after.',
      '',
      'Reason: active encryption and lateral spread continue for every minute containment is',
      'delayed. The evidence lost by isolating first is outweighed by the hosts saved from',
      'encryption. This is the one incident category in this platform where the usual order',
      'is deliberately reversed.',
    ].join('\n'),
    teaches:
      'Compare this directly against IR-2026-0908-01\'s recommended first action (capture memory, then isolate) — the contrast is the entire point of this lesson.',
  },
  {
    match: 'show capstone timeline',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INCIDENT TIMELINE (sample) — IR-2026-0909-01',
      '',
      '03:10:02  Mail gateway     Phishing email impersonating IT ticketing arrives',
      '03:11:40  Web proxy        Credentials submitted to a lookalike portal',
      '03:12:15  VPN gateway      VPN authentication succeeds, unfamiliar country, no MFA',
      '03:19:50  EDR              Ransomware loader executed on FILESRV-02',
      '03:21:05  Windows Security Loader authenticates to APPSRV-03 via SMB (shared local admin credential)',
      '03:22:40  Windows Security Shadow copies deleted on both servers',
      '03:22:55  File server audit Mass file rename begins on both servers\' shared volumes',
      '03:24:12  SIEM             Correlation rule fires across multiple hosts',
    ].join('\n'),
    teaches:
      'Eight events, five different sources — no single source saw the whole chain, which is exactly why correlation across sources is the SOC\'s job, not any one tool\'s.',
  },
  {
    match: 'show capstone containment options',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'CONTAINMENT DECISION SUPPORT — IR-2026-0909-01',
      '',
      'OPTION                                          STOPS ATTACKER  PRESERVES EVIDENCE',
      '───────────────────────────────────────────────  ──────────────  ──────────────────',
      'Isolate both servers + VPN session, then capture  YES             YES  (recommended)',
      'Capture memory first, isolate second              NO              YES',
      'Pay the ransom                                     NO              YES',
      'Restore from backup immediately                    NO              NO',
      'Block the external VPN source IP                   NO              YES  (recommended)',
      'Hard power off both servers                         YES             NO',
    ].join('\n'),
    teaches:
      'Two rows show "stops attacker: NO" and are still worth doing (blocking the source IP) or actively wrong (paying) — stopping the attacker and being the right call are not the same test.',
  },
  {
    match: 'show capstone eradication checklist',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'ERADICATION CHECKLIST — IR-2026-0909-01',
      '',
      '[ ] Remove the ransomware loader and dropped binaries from FILESRV-02 and APPSRV-03',
      '[ ] Rotate the shared local administrator credential to a unique-per-host solution',
      '[ ] Disable and reissue vendor-support VPN credentials; enforce MFA for all vendor accounts',
      '[ ] Confirm no other reachable host carries the same loader or persistence',
      '[ ] Verify shadow copies and backups elsewhere in the environment were not tampered with',
    ].join('\n'),
    teaches:
      'The second item — rotating the shared credential — is the one that actually prevents recurrence; the others clean up this specific event.',
  },
  {
    match: 'show capstone recovery plan',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'RECOVERY PLAN — IR-2026-0909-01',
      '',
      '[ ] Restore FILESRV-02 and APPSRV-03 from verified clean backup after scope is confirmed',
      '[ ] Re-enable vendor-support with new MFA-enrolled credentials, scoped VPN access only',
      '[ ] Monitor both servers and the vendor account at elevated sensitivity for a defined period',
      '[ ] Confirm business file-sharing function is restored, not only that the process is gone',
      '[ ] Determine whether data was exfiltrated before encryption; notify affected parties if so',
    ].join('\n'),
    teaches:
      'Recovery is not the same checklist as eradication — eradication removes the attacker, recovery restores confirmed-clean business function and re-verifies it.',
  },
  {
    match: 'show capstone lessons learned',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'LESSONS LEARNED — IR-2026-0909-01 (blameless)',
      '',
      '· MFA was not enforced for third-party vendor VPN accounts',
      '· A shared local administrator credential let one compromised account become a multi-server event',
      '· Vendor VPN access was not scoped to only what the support contract required',
      '· No correlation rule existed for simultaneous mass-rename activity before this incident',
      '· Backup verification had not been tested against ransomware reaching adjacent systems',
      '',
      'KEY LESSON: a unique-per-host local administrator credential would have kept this incident',
      'on one host.',
    ].join('\n'),
    teaches:
      'Every line is a control gap, not a person\'s mistake — the vendor account owner did not cause the shared-credential design decision or the missing MFA policy.',
  },
];
