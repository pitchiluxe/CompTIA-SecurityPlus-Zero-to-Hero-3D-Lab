// ---------------------------------------------------------------------------
// Phase 12 — incident response.
//
// PROMPT.md names eight incident types and an eight-step console workflow.
// The primary worked incident is the one this platform has carried since
// Phase 0 — spear phishing to PowerShell beaconing — which this phase finally
// closes.
//
// Containment options are modelled on TWO axes: does the action stop the
// attacker, and does it preserve evidence? That tension is what makes
// containment hard, and modelling it makes the judgement gradeable rather
// than merely described.
// ---------------------------------------------------------------------------

export type IrPhase =
  | 'preparation'
  | 'detection'
  | 'analysis'
  | 'containment'
  | 'eradication'
  | 'recovery'
  | 'lessons-learned';

export const IR_PHASES: { id: IrPhase; name: string; question: string }[] = [
  { id: 'preparation', name: 'Preparation', question: 'Are we ready before anything happens?' },
  { id: 'detection', name: 'Detection', question: 'Do we know something is wrong?' },
  {
    id: 'analysis',
    name: 'Analysis',
    question: 'What actually happened, and how far does it reach?',
  },
  {
    id: 'containment',
    name: 'Containment',
    question: 'How do we stop it spreading without destroying evidence?',
  },
  {
    id: 'eradication',
    name: 'Eradication',
    question: 'Is the attacker actually gone, including persistence?',
  },
  { id: 'recovery', name: 'Recovery', question: 'Are we back to normal, and are we watching?' },
  {
    id: 'lessons-learned',
    name: 'Lessons learned',
    question: 'What do we change so it does not recur?',
  },
];

export type IncidentCategory =
  | 'phishing'
  | 'malware'
  | 'ransomware'
  | 'compromised-account'
  | 'privilege-escalation'
  | 'suspicious-powershell'
  | 'data-exfiltration'
  | 'unauthorised-access';

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  phishing: 'Phishing',
  malware: 'Malware',
  ransomware: 'Ransomware',
  'compromised-account': 'Compromised account',
  'privilege-escalation': 'Privilege escalation',
  'suspicious-powershell': 'Suspicious PowerShell',
  'data-exfiltration': 'Data exfiltration',
  'unauthorised-access': 'Unauthorised access',
};

// --------------------------- Containment options ---------------------------

export type ContainmentOption = {
  id: string;
  action: string;
  /** Does it actually stop the attacker's current access? */
  stopsAttacker: boolean;
  /** Does it preserve the evidence needed to answer what happened? */
  preservesEvidence: boolean;
  /** Whether this is the right call for this incident. */
  recommended: boolean;
  rationale: string;
};

export type Incident = {
  id: string;
  reference: string;
  category: IncidentCategory;
  title: string;
  /** What the SOC handed over. */
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Assets in scope, for the identify-affected-assets step. */
  affectedAssets: { name: string; role: string; confirmed: boolean }[];
  /** Timeline events in the correct order; the learner reconstructs this. */
  timeline: { time: string; event: string; source: string }[];
  containmentOptions: ContainmentOption[];
  eradicationSteps: string[];
  recoverySteps: string[];
  lessonsLearned: string[];
  /** The control change that would most have reduced impact. */
  keyLesson: string;
};

export const INCIDENTS: Incident[] = [
  {
    id: 'inc-0',
    reference: 'IR-2026-0908-01',
    category: 'suspicious-powershell',
    title: 'Interactive PowerShell beaconing from WS-01',
    summary:
      'The SOC escalated a correlated alert: PowerShell spawned from explorer.exe on WS-01 holding a regular outbound TLS session to 203.0.113.55. Investigation traced it back through a successful authentication from an unfamiliar ASN and, before that, a spear-phishing email. This is the incident the platform has carried since Phase 0.',
    severity: 'critical',
    affectedAssets: [
      { name: 'WS-01', role: 'Endpoint — beaconing host, persistence installed', confirmed: true },
      { name: 'analyst1', role: 'Identity — credentials phished and used', confirmed: true },
      { name: 'SRV-01', role: 'Server — SUID binary and systemd unit installed', confirmed: true },
      { name: 'DC-01', role: 'Authenticated the attacker session', confirmed: true },
      { name: 'FW-01', role: 'Permitted and logged the egress', confirmed: false },
      { name: 'SW-01', role: 'No evidence of involvement', confirmed: false },
    ],
    timeline: [
      {
        time: '02:41:58',
        event: 'DNS query for the lookalike domain from WS-01',
        source: 'DNS log',
      },
      {
        time: '02:42:31',
        event: 'Credentials submitted to the lookalike page',
        source: 'Web proxy',
      },
      {
        time: '02:44:07',
        event: 'First of three failed logons, varying usernames',
        source: 'Windows 4625',
      },
      {
        time: '02:47:02',
        event: 'Successful logon from an unfamiliar ASN',
        source: 'Windows 4624',
      },
      { time: '02:47:31', event: 'SSH accepted by publickey on SRV-01', source: 'auth.log' },
      {
        time: '02:51:44',
        event: 'PowerShell created from explorer.exe on WS-01',
        source: 'Windows 4688',
      },
      { time: '02:51:53', event: 'First outbound beacon to 203.0.113.55', source: 'Firewall flow' },
      { time: '02:53:02', event: 'Root shell obtained on SRV-01 via sudo', source: 'auth.log' },
      {
        time: '02:54:00',
        event: 'SUID root binary written to /usr/local/bin',
        source: 'Filesystem',
      },
      { time: '02:55:00', event: 'systemd unit created for persistence', source: 'systemd' },
      { time: '03:02:10', event: 'EDR raises behavioural beaconing detection', source: 'EDR' },
    ],
    containmentOptions: [
      {
        id: 'co0',
        action: 'Capture memory from WS-01, then isolate it at the network level',
        stopsAttacker: true,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Both axes satisfied. Memory is the most volatile evidence and holds the running process, its command line, and any keys or tokens in use. Capturing first and isolating second stops the attacker without losing what only RAM holds.',
      },
      {
        id: 'co1',
        action: 'Disable the analyst1 account and revoke its sessions and tokens',
        stopsAttacker: true,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Necessary and evidence-safe. Note that disabling alone is not enough — the Phase 5 lesson applies: existing sessions and refresh tokens survive a disable and must be revoked explicitly.',
      },
      {
        id: 'co2',
        action: 'Block 203.0.113.55 at the perimeter firewall',
        stopsAttacker: false,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Worth doing and not sufficient on its own. It cuts this channel and tells you if the host tries again, but the attacker can register new infrastructure cheaply. This is an IOC-based control with the Phase 7 brittleness.',
      },
      {
        id: 'co3',
        action: 'Reboot WS-01 to clear the malicious process',
        stopsAttacker: false,
        preservesEvidence: false,
        recommended: false,
        rationale:
          'The worst available option. Rebooting destroys memory — the most volatile and most valuable evidence — and does not remove the attacker, because the scheduled task re-establishes the beacon at startup. Feels decisive, achieves the opposite.',
      },
      {
        id: 'co4',
        action: 'Reimage WS-01 immediately',
        stopsAttacker: true,
        preservesEvidence: false,
        recommended: false,
        rationale:
          'Stops this host and destroys everything. You lose the ability to answer how the attacker got in, what they took, and whether other hosts are affected — and the credentials are still valid, so they simply return through another door.',
      },
      {
        id: 'co5',
        action: 'Do nothing yet and continue monitoring to learn more',
        stopsAttacker: false,
        preservesEvidence: true,
        recommended: false,
        rationale:
          'A legitimate strategy in some engagements and wrong here. Monitoring is defensible when the attacker is contained and you are mapping their infrastructure. With active root access on a second host and credentials in use, every minute of observation is a minute of uncontested access.',
      },
      {
        id: 'co6',
        action: 'Isolate SRV-01 at the network level and preserve the disk',
        stopsAttacker: true,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'The second host is genuinely compromised — SUID binary and systemd unit both installed — and is often forgotten because the alert named WS-01. Containment scope follows the investigation, not the alert.',
      },
    ],
    eradicationSteps: [
      'Remove the scheduled task SystemHealthCheck from WS-01 after capturing it as evidence',
      'Remove the SUID binary /usr/local/bin/backup-helper and the cloud-sync.service unit from SRV-01',
      'Remove analyst1 from the local Administrators group on WS-01',
      'Remove the deploy account from the sudo group on SRV-01, or reduce its grant to a scoped command',
      'Reset credentials for analyst1 and re-enrol MFA on a phishing-resistant factor',
      'Confirm no other hosts carry the same persistence artifacts',
    ],
    recoverySteps: [
      'Restore WS-01 from a known-good image after evidence capture is complete',
      'Return SRV-01 to service once persistence is removed and the host is verified',
      'Re-enable analyst1 with a new credential and a FIDO2 authenticator',
      'Monitor both hosts and the account at elevated sensitivity for a defined period',
      'Confirm business function is restored, not just that the threat is gone',
    ],
    lessonsLearned: [
      'DMARC was not enforced, so the spoofed sender was delivered rather than quarantined',
      'MFA was push-based and therefore relayable — the factor choice decided the outcome',
      'PowerShell script block logging was disabled, so the investigation relied on network telemetry',
      'auditd was not watching /usr/local/bin or /etc/systemd/system, where the persistence was placed',
      'A firewall permit-any rule from a 2025 migration was still in place, defeating egress restrictions',
      'Mean time to detect was 11 minutes from first beacon, but 20 minutes from initial delivery',
    ],
    keyLesson:
      'Phishing-resistant MFA would have ended the chain at stage three. The user still clicks, the password is still submitted, and the authentication simply fails because a FIDO2 authenticator will not respond to a lookalike origin. Every subsequent stage of this incident depended on that one credential working.',
  },

  // ---------------------------------------------------------------------
  // Phase 23 — Full SOC Capstone. A second full incident, deliberately
  // ransomware: PROMPT.md's phishing -> compromised credentials ->
  // suspicious authentication -> malicious process -> lateral movement ->
  // alert -> incident response chain, carried across the full enterprise
  // topology (VPN/network, servers, identity infrastructure, SIEM/EDR).
  // Its containment options demonstrate the exception this platform's
  // Phase 12 report flagged for here: spread rate outweighs the usual
  // capture-before-isolate evidence order.
  // ---------------------------------------------------------------------
  {
    id: 'inc-1',
    reference: 'IR-2026-0909-01',
    category: 'ransomware',
    title: 'Enterprise ransomware event via a compromised vendor VPN account',
    summary:
      'A third-party support account with standing VPN access was phished, authenticated from an unfamiliar country with no MFA challenge, and used to deploy a ransomware loader on a file server. The loader spread via SMB using a shared local administrator credential before a SIEM correlation rule caught simultaneous mass file-rename and shadow-copy-deletion activity across two servers.',
    severity: 'critical',
    affectedAssets: [
      {
        name: 'vendor-support',
        role: 'Identity — third-party VPN account, credentials phished and reused',
        confirmed: true,
      },
      {
        name: 'FILESRV-02',
        role: 'Server — patient zero, ransomware loader deployed via mapped VPN drive',
        confirmed: true,
      },
      {
        name: 'APPSRV-03',
        role: 'Server — reached via SMB using a shared local administrator credential',
        confirmed: true,
      },
      {
        name: 'VPN-GW-01',
        role: 'Network — authenticated the attacker\'s VPN session',
        confirmed: true,
      },
      {
        name: 'CORE-FW-01',
        role: 'Firewall — permitted and logged the VPN session per normal function',
        confirmed: false,
      },
      {
        name: 'BACKUP-SRV-01',
        role: 'Server — nightly backup target on an isolated VLAN, not reachable from the affected hosts',
        confirmed: false,
      },
    ],
    timeline: [
      {
        time: '03:10:02',
        event: "Phishing email impersonating the internal IT ticketing system arrives in vendor-support's inbox",
        source: 'Mail gateway',
      },
      {
        time: '03:11:40',
        event: 'vendor-support submits VPN credentials to a lookalike portal',
        source: 'Web proxy',
      },
      {
        time: '03:12:15',
        event: 'VPN authentication succeeds for vendor-support from an unfamiliar country, no MFA challenge',
        source: 'VPN gateway log',
      },
      {
        time: '03:19:50',
        event: 'Ransomware loader executed on FILESRV-02 via the mapped VPN drive',
        source: 'EDR',
      },
      {
        time: '03:21:05',
        event: 'Loader authenticates to APPSRV-03 over SMB using a shared local administrator credential',
        source: 'Windows Security',
      },
      {
        time: '03:22:40',
        event: 'Volume Shadow Copies deleted on both FILESRV-02 and APPSRV-03',
        source: 'Windows Security',
      },
      {
        time: '03:22:55',
        event: "Mass file rename (encryption) begins across both servers' shared volumes",
        source: 'File server audit',
      },
      {
        time: '03:24:12',
        event: 'SIEM correlation rule fires on simultaneous mass-rename and shadow-copy-deletion activity across multiple hosts',
        source: 'SIEM',
      },
    ],
    containmentOptions: [
      {
        id: 'rco0',
        action:
          'Immediately isolate FILESRV-02, APPSRV-03, and vendor-support\'s VPN session from the network, then capture whatever memory and disk evidence remains',
        stopsAttacker: true,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Ransomware is the documented exception to "capture before isolate." Encryption and further spread are happening in real time across multiple hosts — every additional minute spent capturing evidence first is a minute of continued spread. Isolate first here; capture what evidence remains immediately after.',
      },
      {
        id: 'rco1',
        action: 'Capture full memory images from both servers before touching any network connection',
        stopsAttacker: false,
        preservesEvidence: true,
        recommended: false,
        rationale:
          'This is the correct order for a single-host beacon like IR-2026-0908-01, but wrong here — while memory capture is in progress, the loader continues encrypting and can continue spreading to additional reachable hosts. Spread rate outweighs evidence order in an active ransomware event.',
      },
      {
        id: 'rco2',
        action: "Disable vendor-support's account and revoke its VPN session and any issued tokens",
        stopsAttacker: true,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Necessary and evidence-safe. As with any compromised account, disabling alone is not enough if a session or token was already issued — both the account and its active session must be revoked.',
      },
      {
        id: 'rco3',
        action: 'Pay the ransom to receive a decryption key',
        stopsAttacker: false,
        preservesEvidence: true,
        recommended: false,
        rationale:
          'Paying does not remove the attacker\'s foothold, does not guarantee a working decryptor, and modern ransomware routinely exfiltrates data before encrypting — payment does not undo that disclosure. This is a business and legal decision sitting above containment, never a substitute for it.',
      },
      {
        id: 'rco4',
        action: 'Restore both servers from backup immediately and consider the incident closed',
        stopsAttacker: false,
        preservesEvidence: false,
        recommended: false,
        rationale:
          'Restoring overwrites the ransom note, the encrypted file samples, and potentially the logs needed to confirm scope — and does not address the still-valid vendor-support credential or the shared local administrator credential that let the loader spread. Modern ransomware exfiltrates before encrypting, so the confidentiality breach survives the restore regardless.',
      },
      {
        id: 'rco5',
        action: "Block the attacker's external VPN source address at the perimeter firewall",
        stopsAttacker: false,
        preservesEvidence: true,
        recommended: true,
        rationale:
          'Worth doing and not sufficient alone. It cuts this specific path and confirms if the attacker retries, but does not stop an already-active loader running locally on two servers, and new source infrastructure is cheap for an attacker to obtain.',
      },
      {
        id: 'rco6',
        action: 'Hard power off FILESRV-02 and APPSRV-03 immediately',
        stopsAttacker: true,
        preservesEvidence: false,
        recommended: false,
        rationale:
          'This does stop the encryption process, but destroys memory — where the loader binary and any encryption keys held only in RAM exist — and risks filesystem corruption stacked on top of the ransomware\'s own damage. Network isolation, not a power cut, is how to stop the spread while preserving what evidence remains.',
      },
    ],
    eradicationSteps: [
      'Remove the ransomware loader and any dropped binaries from FILESRV-02 and APPSRV-03 after evidence capture is complete',
      'Rotate the shared local administrator credential used to spread via SMB, replacing it with a unique-per-host solution',
      "Disable and reissue vendor-support's VPN credentials, and enforce MFA for every third-party/vendor account going forward",
      'Confirm no other hosts reachable from FILESRV-02 or APPSRV-03 carry the same loader or any persistence mechanism',
      'Verify that Volume Shadow Copies and backups on every other host in the environment were not tampered with',
    ],
    recoverySteps: [
      'Restore FILESRV-02 and APPSRV-03 from a verified, pre-incident clean backup only after root cause and full scope are confirmed',
      "Re-enable vendor-support with new MFA-enrolled credentials and VPN access scoped to only what the support contract actually requires",
      'Monitor FILESRV-02, APPSRV-03, and the vendor-support account at elevated sensitivity for a defined period',
      'Confirm business file-sharing function is restored, not just that the ransomware process is gone',
      'Determine whether data was exfiltrated before encryption began, and notify affected parties if confirmed',
    ],
    lessonsLearned: [
      'MFA was not enforced for third-party vendor VPN accounts, unlike employee accounts',
      'A shared local administrator credential was reused across multiple servers, letting a single compromised VPN account become a multi-server event',
      "Vendor VPN access was not scoped to only the specific systems the support contract required — excess standing access",
      'No SIEM correlation rule existed for simultaneous mass file-rename activity across multiple hosts before this incident — it fired here for the first time',
      'Backup verification had not been tested against a scenario where ransomware could reach systems adjacent to backup infrastructure',
    ],
    keyLesson:
      'Ransomware is the one incident category where spread rate outweighs the usual evidence order: isolating every reachable host immediately — even before a full memory capture — is the correct call, unlike a single-host beacon where capturing memory first is right. The single control that would have kept this incident on one host is a unique-per-host local administrator credential — the shared credential is what let one compromised VPN account become an enterprise-wide event.',
  },
];

export function getIncident(id: string): Incident | undefined {
  return INCIDENTS.find((i) => i.id === id);
}

// -------------------- The other categories, as reference --------------------

/**
 * PROMPT.md names eight incident types. One is worked end to end above; the
 * rest are modelled at the level a responder needs to recognise and triage
 * them, so the phase covers the full set without pretending to eight complete
 * investigations.
 */
export type IncidentPattern = {
  category: IncidentCategory;
  firstIndicators: string[];
  containmentPriority: string;
  evidenceToPreserve: string[];
  commonMistake: string;
};

export const INCIDENT_PATTERNS: IncidentPattern[] = [
  {
    category: 'phishing',
    firstIndicators: [
      'User report',
      'Mail gateway verdict',
      'DNS query to a newly registered domain',
    ],
    containmentPriority: 'Find everyone else who received it and whether any of them clicked',
    evidenceToPreserve: [
      'Original message with full headers',
      'URL and its resolution',
      'Proxy logs for clicks',
    ],
    commonMistake:
      'Deleting the message from mailboxes before extracting the headers and recipient list, so you can no longer tell who else was targeted.',
  },
  {
    category: 'malware',
    firstIndicators: [
      'EDR detection',
      'Unexpected process tree',
      'Unsigned binary in a user-writable path',
    ],
    containmentPriority: 'Isolate the host, then determine whether it spread',
    evidenceToPreserve: ['Memory image', 'The sample itself', 'Process tree and parentage'],
    commonMistake:
      'Letting antivirus quarantine and delete the sample before it is preserved, removing the only copy you could analyse.',
  },
  {
    category: 'ransomware',
    firstIndicators: [
      'Mass file rename',
      'Shadow copies deleted',
      'Ransom note written to many directories',
    ],
    containmentPriority: 'Isolate immediately — spread rate outweighs evidence in this one case',
    evidenceToPreserve: [
      'Ransom note',
      'A sample of encrypted files',
      'Firewall logs for prior exfiltration',
    ],
    commonMistake:
      'Restoring from backup and declaring it over. Modern ransomware exfiltrates before encrypting, so the confidentiality breach survives the restore.',
  },
  {
    category: 'compromised-account',
    firstIndicators: [
      'Impossible travel',
      'Unfamiliar ASN',
      'Authentication outside working hours',
    ],
    containmentPriority: 'Disable AND revoke sessions and tokens — disabling alone is insufficient',
    evidenceToPreserve: [
      'Sign-in logs',
      'Mailbox rule changes',
      'Anything the account accessed while compromised',
    ],
    commonMistake:
      'Resetting the password and stopping there, while an issued refresh token keeps working for its full lifetime.',
  },
  {
    category: 'privilege-escalation',
    firstIndicators: [
      'Unexpected group membership change',
      'New SUID binary',
      'Elevation outside a change window',
    ],
    containmentPriority: 'Remove the privilege first — it can undo everything else you do',
    evidenceToPreserve: ['Audit log of the grant', 'Who authorised it', 'What was done with it'],
    commonMistake:
      'Removing the elevated access without establishing how it was obtained, so the same path is used again next week.',
  },
  {
    category: 'suspicious-powershell',
    firstIndicators: [
      'Interactive shell with outbound TLS',
      'Regular beacon interval',
      'Encoded command line',
    ],
    containmentPriority:
      'Capture memory before isolating — the command line may exist nowhere else',
    evidenceToPreserve: ['Memory image', '4688 and script block logs', 'Network flows with timing'],
    commonMistake:
      'Killing the process to stop the beacon, which discards the memory that held what it was actually doing.',
  },
  {
    category: 'data-exfiltration',
    firstIndicators: [
      'Large or sustained outbound transfer',
      'Unusual destination',
      'Access to records outside a role',
    ],
    containmentPriority: 'Stop the egress, then determine exactly what left',
    evidenceToPreserve: [
      'Flow records with byte counts',
      'Data access logs',
      'The destination and its reputation',
    ],
    commonMistake:
      'Reporting that data "may have been accessed" without establishing what actually left, which turns a scoped incident into an unbounded disclosure.',
  },
  {
    category: 'unauthorised-access',
    firstIndicators: [
      'Access to a system outside a role',
      'Physical access anomaly',
      'Use of a dormant account',
    ],
    containmentPriority: 'Establish whether it is malicious or a permissions error before acting',
    evidenceToPreserve: ['Access logs', 'Entitlement history', 'Change tickets around the access'],
    commonMistake:
      'Treating it as an attack when it is a provisioning error, which damages trust with a colleague who did nothing wrong.',
  },
];

export function getPattern(category: IncidentCategory): IncidentPattern | undefined {
  return INCIDENT_PATTERNS.find((p) => p.category === category);
}

// --------------------------- Order of volatility ---------------------------

/**
 * RFC 3227 order of volatility, most volatile first. Collecting out of order
 * loses the volatile items — which is why "reboot it" is the single most
 * destructive instinct in incident response.
 */
export const ORDER_OF_VOLATILITY: { rank: number; source: string; note: string }[] = [
  { rank: 1, source: 'CPU registers and cache', note: 'Gone the instant the process stops' },
  {
    rank: 2,
    source: 'Memory (RAM)',
    note: 'Running processes, command lines, keys, network state',
  },
  {
    rank: 3,
    source: 'Network state and running processes',
    note: 'Live connections, routing, ARP',
  },
  { rank: 4, source: 'Temporary filesystems', note: 'Cleared on reboot' },
  { rank: 5, source: 'Disk', note: 'Survives reboot; the usual forensic image' },
  {
    rank: 6,
    source: 'Remote logs and monitoring data',
    note: 'Already off the host, bounded by retention',
  },
  { rank: 7, source: 'Physical configuration and topology', note: 'Stable, documented separately' },
  { rank: 8, source: 'Archival media and backups', note: 'Most durable' },
];
