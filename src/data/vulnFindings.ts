import type { CvssVector } from '../lib/cvss';

// ---------------------------------------------------------------------------
// Phase 10 — vulnerability scan findings.
//
// A scanner reports many things. Deciding which actually matter is the skill,
// so this set deliberately contains false positives and a finding whose CVSS
// score overstates its real risk in this environment.
//
// Findings describe the estate carried since Phase 0. CVE identifiers are
// illustrative placeholders in the reserved CVE-2026-xxxxx range rather than
// real advisories, so nothing here can be mistaken for live threat intel.
// ---------------------------------------------------------------------------

export type FindingVerdict = 'confirmed' | 'false-positive';

export type RemediationState = 'open' | 'remediated' | 'accepted' | 'mitigated';

export type VulnFinding = {
  id: string;
  cve: string;
  title: string;
  host: string;
  service: string;
  /** Raw CVSS base metrics — the score is computed, never stored. */
  vector: CvssVector;
  /** What the scanner reported. */
  scannerEvidence: string;
  /** What manual verification actually found. */
  verificationEvidence: string;
  verdict: FindingVerdict;
  /** Why it is confirmed or a false positive. */
  verdictRationale: string;
  /**
   * Whether this environment's context raises or lowers the priority relative
   * to the raw CVSS score. This is the judgement CVSS alone cannot make.
   */
  contextNote: string;
  /** True when environmental context should outrank the raw score. */
  contextOverridesScore: boolean;
  remediation: string;
  validation: string;
};

export const VULN_FINDINGS: VulnFinding[] = [
  {
    id: 'v0',
    cve: 'CVE-2026-10001',
    title: 'OpenSSH permits root login with password authentication',
    host: 'SRV-01',
    service: '22/tcp OpenSSH 8.9p1',
    vector: { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' },
    scannerEvidence:
      'Banner grab plus config probe: PermitRootLogin yes, PasswordAuthentication yes',
    verificationEvidence:
      'Confirmed in /etc/ssh/sshd_config and by sshd -T. Root is directly reachable over the network with a password.',
    verdict: 'confirmed',
    verdictRationale:
      'Verified against the live configuration. This is the Phase 9 finding, reported here by a scanner instead of found by hand — and the scanner is right.',
    contextNote:
      'SRV-01 is reachable from the user segment, and the Phase 9 logs show this port already receiving credential attacks. Context supports the high score.',
    contextOverridesScore: false,
    remediation:
      'Set PermitRootLogin prohibit-password and PasswordAuthentication no. Verify key login in a second session, run sshd -t, then reload.',
    validation:
      'Re-run the scan and confirm the finding clears; attempt a password login and confirm it is refused.',
  },
  {
    id: 'v1',
    cve: 'CVE-2026-10002',
    title: 'PostgreSQL 14 remote code execution',
    host: 'SRV-01',
    service: '5432/tcp PostgreSQL 14.2',
    vector: { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'H', A: 'H' },
    scannerEvidence: 'Version 14.2 detected on port 5432; version is within the affected range',
    verificationEvidence:
      'Service confirmed at 14.2. However ss -tulpn shows it bound to 127.0.0.1 only — the scanner detected it from the host itself, not across the network.',
    verdict: 'confirmed',
    verdictRationale:
      'The vulnerable version is genuinely present, so this is not a false positive. But the exploitability in this environment is far lower than the vector suggests.',
    contextNote:
      'CVSS scores 10.0 because the vector assumes network reachability. postgres binds to loopback only, so no network attacker can reach it. Real priority is well below the score — patch it, but not ahead of the SSH finding.',
    contextOverridesScore: true,
    remediation: 'Patch PostgreSQL to a fixed release during the normal maintenance window.',
    validation:
      'Confirm the version after patching, and re-confirm the loopback binding is unchanged.',
  },
  {
    id: 'v2',
    cve: 'CVE-2026-10003',
    title: 'nginx 1.18.0 HTTP request smuggling',
    host: 'SRV-01',
    service: '80/tcp nginx 1.18.0',
    vector: { AV: 'N', AC: 'H', PR: 'N', UI: 'N', S: 'C', C: 'L', I: 'H', A: 'N' },
    scannerEvidence: 'Server header discloses nginx/1.18.0, matching the affected version range',
    verificationEvidence:
      'Version confirmed. The service is internet-reachable through the firewall and fronts the application.',
    verdict: 'confirmed',
    verdictRationale:
      'Version confirmed and the service is genuinely exposed. High attack complexity keeps the score below the SSH finding.',
    contextNote:
      'The Server header also discloses the exact version, which is a separate hardening finding worth fixing in the same change.',
    contextOverridesScore: false,
    remediation:
      'Upgrade nginx to a patched release and suppress the version in the Server header.',
    validation: 'Re-scan and confirm both the version and the header disclosure are resolved.',
  },
  {
    id: 'v3',
    cve: 'CVE-2026-10004',
    title: 'Windows SMB signing not required',
    host: 'WS-01',
    service: '445/tcp Microsoft-DS',
    vector: { AV: 'A', AC: 'H', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'N' },
    scannerEvidence: 'SMB negotiation shows signing supported but not required',
    verificationEvidence:
      'Confirmed. An on-path attacker on the same segment could relay authentication.',
    verdict: 'confirmed',
    verdictRationale:
      'Genuine misconfiguration. Adjacent rather than network attack vector, and high complexity, so it scores below the remotely reachable findings.',
    contextNote:
      'Phase 4 placed WS-01 in a segmented user zone, which limits who can be adjacent. That constrains exposure without removing the finding.',
    contextOverridesScore: false,
    remediation: 'Require SMB signing via Group Policy on both clients and servers.',
    validation: 'Re-run the scan and confirm signing is required; verify file access still works.',
  },
  {
    id: 'v4',
    cve: 'CVE-2026-10005',
    title: 'Apache Struts remote code execution',
    host: 'SRV-01',
    service: '80/tcp nginx 1.18.0',
    vector: { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' },
    scannerEvidence: 'Generic web fingerprint matched a Struts signature on the HTTP response',
    verificationEvidence:
      'SRV-01 runs nginx serving static content. No Java runtime, no servlet container, and no Struts installed anywhere on the host.',
    verdict: 'false-positive',
    verdictRationale:
      'FALSE POSITIVE. The scanner matched a generic response fingerprint rather than confirming the software. Struts is not present — there is no Java on this host at all. Reporting this would waste a maintenance window and cost credibility with the server team.',
    contextNote:
      'Verify before you report. A 9.8 that does not exist is still a 9.8 in the report, and the team you send it to will find the mistake before you do.',
    contextOverridesScore: false,
    remediation:
      'None required. Suppress this plugin for this host with a documented justification.',
    validation: 'Confirm no Java runtime is installed and record the suppression rationale.',
  },
  {
    id: 'v5',
    cve: 'CVE-2026-10006',
    title: 'TLS 1.0 and 1.1 enabled',
    host: 'FW-01',
    service: '443/tcp PAN-OS management',
    vector: { AV: 'N', AC: 'H', PR: 'N', UI: 'N', S: 'U', C: 'L', I: 'L', A: 'N' },
    scannerEvidence: 'TLS handshake succeeded with TLS 1.0 and TLS 1.1',
    verificationEvidence:
      'Confirmed. Deprecated protocol versions are accepted by the management interface.',
    verdict: 'confirmed',
    verdictRationale:
      'Genuine, and correctly scored as medium rather than critical. Exploitation needs a favourable position and the impact is limited.',
    contextNote:
      'This is a management interface. Phase 4 placed management in its own zone, so exposure is limited — but it is also the interface that controls the firewall, so it should not be the last thing fixed.',
    contextOverridesScore: false,
    remediation: 'Disable TLS 1.0 and 1.1 on the management interface; require TLS 1.2 or higher.',
    validation: 'Re-scan and confirm only TLS 1.2 and above negotiate successfully.',
  },
  {
    id: 'v6',
    cve: 'CVE-2026-10007',
    title: 'Default credentials on network device',
    host: 'SW-01',
    service: '23/tcp Telnet',
    vector: { AV: 'A', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'H', A: 'H' },
    scannerEvidence: 'Telnet service detected; default credential check reported a match',
    verificationEvidence:
      'Telnet is not enabled on SW-01. The scanner probed 23/tcp on the management VLAN gateway and attributed the response to the wrong host.',
    verdict: 'false-positive',
    verdictRationale:
      'FALSE POSITIVE, caused by host attribution rather than a bad signature. The response came from a different device. Always confirm which host actually answered before reporting a credential finding — accusing a team of default credentials they do not have is expensive.',
    contextNote:
      'Attribution errors are common when scanning across VLAN boundaries. Check the scan configuration and the ARP or switch tables before escalating.',
    contextOverridesScore: false,
    remediation:
      'None on SW-01. Correct the scan target definitions and re-scan the management VLAN.',
    validation: 'Confirm 23/tcp is closed on SW-01 and identify which device actually responded.',
  },
  {
    id: 'v7',
    cve: 'CVE-2026-10008',
    title: 'Outdated OpenSSL library on endpoint',
    host: 'WS-01',
    service: 'Local package',
    vector: { AV: 'L', AC: 'H', PR: 'L', UI: 'R', S: 'U', C: 'L', I: 'N', A: 'N' },
    scannerEvidence: 'Installed package version is below the fixed release',
    verificationEvidence:
      'Confirmed present. Exploitation requires local access, user interaction, and favourable conditions.',
    verdict: 'confirmed',
    verdictRationale:
      'Real but genuinely low. Local vector, high complexity, requires privileges and user interaction, limited impact.',
    contextNote:
      'This is the kind of finding that belongs in the normal patch cycle. Escalating it alongside the SSH finding would dilute the report.',
    contextOverridesScore: false,
    remediation: 'Update the package during the next scheduled patch cycle.',
    validation: 'Confirm the installed version after patching.',
  },
];

export function getFinding(id: string): VulnFinding | undefined {
  return VULN_FINDINGS.find((f) => f.id === id);
}

export const CONFIRMED_COUNT = VULN_FINDINGS.filter((f) => f.verdict === 'confirmed').length;
export const FALSE_POSITIVE_COUNT = VULN_FINDINGS.filter(
  (f) => f.verdict === 'false-positive'
).length;
