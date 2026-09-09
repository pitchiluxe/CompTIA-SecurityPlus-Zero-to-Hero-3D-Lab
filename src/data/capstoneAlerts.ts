import type { Alert } from './socTelemetry';

// ---------------------------------------------------------------------------
// Phase 23 — Full SOC Capstone triage alerts.
//
// A small, purpose-built alert set for IR-2026-0909-01 (the ransomware
// capstone incident), reusing the Phase 7 Alert shape and triageEngine so the
// capstone genuinely exercises the discrimination skill taught there — two
// real signals, two noise/near-miss signals — rather than re-teaching triage
// from scratch. relatedEventIds is left empty: this set has no companion
// LOG_EVENTS table to pivot into, only the decision itself.
// ---------------------------------------------------------------------------

export const CAPSTONE_ALERTS: Alert[] = [
  {
    id: 'ca0',
    timestamp: '03:12:15',
    title: "VPN authentication for vendor-support from an unfamiliar country, no MFA challenge",
    severity: 'high',
    source: 'VPN-GW-01',
    destination: 'Internal VPN pool',
    user: 'vendor-support',
    host: 'VPN-GW-01',
    raisedBy: 'firewall',
    correctVerdict: 'true-positive',
    verdictRationale:
      "A third-party account authenticating from a country it has never used, with no MFA challenge at all, is a strong anomaly on its own — and it immediately precedes the ransomware deployment. Escalate.",
    relatedEventIds: [],
  },
  {
    id: 'ca1',
    timestamp: '03:00:00',
    title: 'Scheduled nightly antivirus signature update on FILESRV-02',
    severity: 'low',
    source: 'FILESRV-02',
    destination: 'Vendor update service',
    user: 'system',
    host: 'FILESRV-02',
    raisedBy: 'edr',
    correctVerdict: 'false-positive',
    verdictRationale:
      'Matches the documented nightly maintenance window exactly, with no other correlating signal. Routine scheduled activity, not an indicator of compromise. Close as a false positive.',
    relatedEventIds: [],
  },
  {
    id: 'ca2',
    timestamp: '14:02:00',
    title: 'Single failed VPN login for vendor-support, immediately followed by a successful login',
    severity: 'low',
    source: 'VPN-GW-01',
    destination: 'Internal VPN pool',
    user: 'vendor-support',
    host: 'VPN-GW-01',
    raisedBy: 'firewall',
    correctVerdict: 'false-positive',
    verdictRationale:
      'One mistyped credential during normal business hours, from the account\'s usual location, followed immediately by a normal successful login. Consistent with ordinary user error, not an attack. Close as a false positive.',
    relatedEventIds: [],
  },
  {
    id: 'ca3',
    timestamp: '03:24:12',
    title: 'Simultaneous mass file-rename and shadow-copy-deletion activity across FILESRV-02 and APPSRV-03',
    severity: 'critical',
    source: 'FILESRV-02, APPSRV-03',
    destination: 'N/A',
    user: 'N/A',
    host: 'FILESRV-02, APPSRV-03',
    raisedBy: 'edr',
    correctVerdict: 'true-positive',
    verdictRationale:
      'This exact pattern — many files renamed in a short window plus shadow copies deleted, across more than one host at once — has no legitimate business explanation. Escalate immediately.',
    relatedEventIds: [],
  },
];
