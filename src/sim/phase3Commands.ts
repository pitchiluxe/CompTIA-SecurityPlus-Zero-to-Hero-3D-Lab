import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 3 prepared outputs — Threats, Vulnerabilities & Attacks.
//
// SAFETY: every artifact below is a DESCRIPTION of evidence an attack leaves
// behind, written for recognition and defence. Nothing here is executable,
// no working malicious code appears, and no credential-handling logic exists
// anywhere in this project. Domains are RFC 2606 / example.* reserved names;
// addresses are RFC 5737 documentation space.
// ---------------------------------------------------------------------------

export const PHASE_3_COMMANDS: PreparedCommand[] = [
  // --------------------------- Phishing analysis ---------------------------
  {
    match: 'show email headers phish-01',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'Return-Path: <no-reply@it-servicedesk-portal.example>',
      'Received: from mail.it-servicedesk-portal.example ([203.0.113.90])',
      '        by mx.lab.local with ESMTPS; Tue, 08 Sep 2026 09:41:02 +0000',
      'Authentication-Results: mx.lab.local;',
      '        spf=softfail (domain does not designate 203.0.113.90 as permitted sender);',
      '        dkim=none;',
      '        dmarc=none (p=NONE) header.from=it-servicedesk-portal.example',
      'From: "IT Service Desk" <no-reply@it-servicedesk-portal.example>',
      'Reply-To: <helpdesk-response@mail-relay-svc.example>',
      'To: <analyst1@lab.local>',
      'Subject: Action required: re-authenticate to the SRV-01 portal within 2 hours',
      'X-Originating-Domain-Age: 4 days',
      '',
      'Body link target: https://srv01-portal-login.example/session/renew',
    ].join('\n'),
    teaches:
      'Five indicators in one header block: SPF softfail, no DKIM, DMARC p=NONE, a Reply-To on a different domain from the From, and a sender domain registered four days ago. The subject supplies urgency and authority — the two social-engineering principles most used together.',
  },
  {
    match: 'analyse url srv01-portal-login.example',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'URL:              https://srv01-portal-login.example/session/renew',
      'Registered:       2026-09-04  (4 days ago)',
      'Registrar:        [redacted — privacy service]',
      'TLS certificate:  issued 2026-09-04, free DV cert, CN=srv01-portal-login.example',
      'Hosting ASN:      AS64500 (bulletproof-adjacent, documentation example)',
      'Category:         Newly Registered Domain',
      'Reputation:       No history',
      '',
      'Legitimate portal for comparison:',
      '  URL:            https://srv-01.lab.local/portal',
      '  TLS:            internal CA, issued 2025-11-02',
      '  Category:       Internal Business Application',
    ].join('\n'),
    teaches:
      'A valid TLS certificate proves the domain controls itself, not that it is trustworthy. Free DV certificates are issued to anyone in minutes — the padlock has never meant "safe", and teaching users otherwise is actively harmful.',
  },
  {
    match: 'compare phishing types',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'TYPE             CHANNEL   TARGETING              DISTINGUISHING FEATURE',
      '---------------  --------  ---------------------  ------------------------------',
      'Phishing         Email     Bulk, untargeted       Generic pretext, mass send',
      'Spear phishing   Email     One person or team     Uses real internal detail',
      'Whaling          Email     Senior executive       Targets authority to move money',
      'Smishing         SMS       Varies                 Shortened links, no headers to check',
      'Vishing          Voice     Varies                 Live pressure, no artifact to inspect',
      'Pharming         DNS/host  Anyone resolving       No user click needed at all',
      '',
      'The Phase 3 incident is SPEAR PHISHING: one named recipient, and the pretext',
      'references SRV-01, a system that actually exists in this environment.',
    ].join('\n'),
    teaches:
      'The channel names the technique: email, SMS, or voice. Targeting names the intensity: bulk, individual, or executive. Vishing and smishing are hardest to investigate because they leave no header to analyse.',
  },

  // --------------------------- Password attacks ---------------------------
  {
    match: 'show auth log brute-force',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'TIME      EVENT  ACCOUNT     SOURCE          STATUS',
      '10:03:01  4625   analyst1    203.0.113.77    Failure  (bad password)',
      '10:03:02  4625   analyst1    203.0.113.77    Failure  (bad password)',
      '10:03:02  4625   analyst1    203.0.113.77    Failure  (bad password)',
      '10:03:03  4625   analyst1    203.0.113.77    Failure  (bad password)',
      '10:03:03  4625   analyst1    203.0.113.77    Failure  (bad password)',
      '  ... 1,847 further failures against analyst1 in 4 minutes ...',
      '10:07:44  4624   analyst1    203.0.113.77    Success',
      '',
      'PATTERN: one account, one source, very high attempt rate.',
    ].join('\n'),
    teaches:
      'Brute force is loud: one account hammered with many passwords. It is the easiest password attack to detect and the easiest to stop — account lockout defeats it outright, which is why attackers moved on to the two patterns below.',
  },
  {
    match: 'show auth log password-spraying',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'TIME      EVENT  ACCOUNT     SOURCE          STATUS',
      '02:14:07  4625   ahmed.k     198.51.100.32   Failure  (bad password)',
      '02:14:39  4625   bfernandez  198.51.100.32   Failure  (bad password)',
      '02:15:11  4625   c.owusu     198.51.100.32   Failure  (bad password)',
      '02:15:43  4625   dlin        198.51.100.32   Failure  (bad password)',
      '02:16:15  4625   e.novak     198.51.100.32   Failure  (bad password)',
      '  ... 312 accounts, one attempt each, ~32 seconds apart ...',
      '02:41:02  4624   r.tembo     198.51.100.32   Success',
      '',
      'PATTERN: many accounts, ONE attempt each, deliberately slow.',
    ].join('\n'),
    teaches:
      'Password spraying inverts brute force: one common password tried against many accounts, slowly. It never trips account lockout because no single account sees a second failure. Detecting it requires correlating failures ACROSS accounts by source — a per-account threshold is blind to it.',
  },
  {
    match: 'show auth log credential-stuffing',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'TIME      EVENT  ACCOUNT     SOURCE          STATUS',
      '14:22:01  4625   j.harper    198.51.100.14   Failure  (bad password)',
      '14:22:01  4624   m.oyelaran  198.51.100.51   Success',
      '14:22:02  4625   s.dubois    198.51.100.88   Failure  (bad password)',
      '14:22:02  4624   t.nakamura  198.51.100.23   Success',
      '  ... 4,610 accounts, one attempt each, from 900+ distinct sources ...',
      '',
      'PATTERN: many accounts, one attempt each, MANY sources, high success rate.',
      'Successful accounts share a trait: the password matches a public breach corpus.',
    ].join('\n'),
    teaches:
      'Credential stuffing replays username/password pairs leaked from somewhere else. The unusually high success rate and the distributed sources are the tells. It works entirely because of password reuse — which is why breach-corpus checking at password set time is the control that actually addresses it.',
  },
  {
    match: 'compare password attacks',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'ATTACK               ACCOUNTS  ATTEMPTS/ACCT  SOURCES  DEFEATED BY',
      '-------------------  --------  -------------  -------  --------------------------',
      'Brute force          One       Very many      One      Account lockout, rate limit',
      'Password spraying    Many      One or two     One/few  Cross-account correlation',
      'Credential stuffing  Many      One            Many     Breach-corpus checks, MFA',
      '',
      'All three are defeated outright by phishing-resistant MFA, because a',
      'password alone stops being sufficient to authenticate.',
    ].join('\n'),
    teaches:
      'Read the shape, not the volume. The three attacks differ on accounts, attempts per account, and source count — and each needs a different detection rule. MFA is the single control that addresses all three at once.',
  },

  // --------------------------- Malware behaviour ---------------------------
  {
    match: 'show malware behaviour',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'TYPE        SPREADS BY              PRIMARY BEHAVIOUR        TELL IN TELEMETRY',
      '----------  ----------------------  -----------------------  ---------------------------',
      'Virus       Host file, user action  Infects other files      File writes across many dirs',
      'Worm        Network, no user needed Self-propagates          Outbound scanning to peers',
      'Trojan      Disguise, user installs Hidden payload           Legit-looking exe, odd child',
      'Ransomware  Any of the above        Encrypts, extorts        Mass file rename + high IO',
      'Spyware     Bundling, drive-by      Observes and exfiltrates Steady small outbound flows',
      'Rootkit     Post-compromise         Hides presence           Discrepancy between tools',
      'Botnet      Any of the above        Remote control at scale  Regular beacon to C2',
      '',
      'The Phase 3 incident used NO malware file at all — living off the land.',
    ].join('\n'),
    teaches:
      'Classify by propagation and behaviour, not by name. Worm versus virus is decided by one question: does it need a user to act? Ransomware is a behaviour that any delivery method can carry, which is why it appears in every row above.',
  },
  {
    match: 'show ransomware indicators',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'Host: WS-07 (simulated incident — no files were altered)',
      '',
      'T+00:00  4688  Process created: legitimate archiving utility',
      'T+00:04  ---   Volume shadow copies enumerated',
      'T+00:05  ---   Volume shadow copies deleted        <-- recovery being removed first',
      'T+00:06  ---   File rename rate: 4,120 files/minute',
      'T+00:06  ---   New extension observed on renamed files',
      'T+00:31  ---   Outbound connection to 203.0.113.55:443 (exfiltration before encryption)',
      'T+01:12  ---   Ransom note written to 214 directories',
      '',
      'CIA impact: availability lost at T+00:06; confidentiality lost at T+00:31.',
    ].join('\n'),
    teaches:
      'Shadow copies are deleted BEFORE encryption starts — the attacker removes your recovery first. Note the exfiltration step: modern ransomware steals before it encrypts, so "we restored from backup" no longer means the incident is over. That is double extortion.',
  },
  {
    match: 'show rootkit discrepancy',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'Comparing process listings from two vantage points — SRV-02 (simulated)',
      '',
      'FROM THE LIVE HOST (ps aux)          FROM OFFLINE DISK ANALYSIS',
      '  744  sshd                            744  sshd',
      '  901  nginx                           901  nginx',
      ' 1102  postgres                       1102  postgres',
      '  ---  (nothing)                      2290  /usr/lib/.sysmond   <-- hidden',
      '',
      'The live host does not report PID 2290. Offline analysis of the same disk does.',
    ].join('\n'),
    teaches:
      'A rootkit subverts the tools you would use to find it, so a clean live listing proves nothing. The detection method is comparison from a vantage point the rootkit does not control — offline disk analysis, memory forensics, or a trusted boot measurement.',
  },

  // --------------------------- Attack surfaces ---------------------------
  {
    match: 'show attack categories',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'CATEGORY      REPRESENTATIVE ATTACKS              PRIMARY DEFENCE',
      '------------  ----------------------------------  ---------------------------',
      'Web           SQL injection, XSS, CSRF            Input validation, parameterised queries',
      'Network       On-path, ARP spoofing, DNS poison   Segmentation, encrypted protocols',
      'Wireless      Evil twin, rogue AP, deauth         WPA3, 802.1X, rogue AP detection',
      'Application   Buffer overflow, race condition     Memory-safe languages, patching',
      'Cloud         Misconfigured storage, over-scoped  Least privilege IAM, config baselines',
      '              roles, exposed metadata service',
      'Mobile        Sideloading, unsafe app permissions MDM, app allowlisting',
      'IoT           Default credentials, no patching    Segmentation, credential rotation',
      'Supply chain  Compromised dependency or update    SBOM, signing, vendor assessment',
      'Insider       Misuse of legitimate access         Least privilege, separation of duties,',
      '                                                  behavioural monitoring',
      '',
      'Note: insider threat is the one category no perimeter control addresses.',
    ].join('\n'),
    teaches:
      'Each category has a characteristic defence. Cloud attacks are overwhelmingly misconfiguration rather than exotic exploitation, and IoT attacks are overwhelmingly default credentials — the unglamorous answers are usually the correct ones on the exam.',
  },
  {
    match: 'show supply chain incident',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'Simulated supply-chain compromise — build pipeline',
      '',
      'STEP  EVENT',
      '  1   Upstream package "lab-logging-utils" publishes version 2.4.1',
      '  2   Version 2.4.1 adds a post-install script absent from 2.4.0',
      '  3   Build server installs 2.4.1 during a routine dependency update',
      '  4   Post-install script contacts 203.0.113.55 during the build',
      '  5   Artifact signed and distributed to 42 internal hosts',
      '',
      'What made this work: the organisation trusted the vendor, so it trusted',
      'everything the vendor shipped. Trust was transitive and unverified.',
      '',
      'Controls: dependency pinning, SBOM, build-time egress restriction,',
      'reproducible builds, and reviewing what a version bump actually changed.',
    ].join('\n'),
    teaches:
      'Supply-chain attacks bypass every perimeter control because the malicious code arrives through a trusted channel you invited in. The defence is not a better firewall — it is verifying what you consume and restricting what your build process may reach.',
  },
  {
    match: 'show insider indicators',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'Simulated insider risk indicators — 30-day window',
      '',
      'INDICATOR                                        WEIGHT  NOTE',
      'Access to records outside job function             High  312 records, role needs ~10',
      'Bulk export outside working hours                  High  02:40, no change ticket',
      'Repeated access to a departing colleague folder     Med  Context matters',
      'Failed access attempts to restricted shares         Med  Curiosity or probing',
      'Use of personal cloud storage from a work host      Med  Policy violation, not proof',
      '',
      'IMPORTANT: none of these alone proves malice. Insider investigations affect',
      'a real person; they follow HR and legal process, not analyst intuition.',
    ].join('\n'),
    teaches:
      'Insider threat is the hardest category because the access is legitimate — there is no exploit to find, only a pattern of use that does not match the role. Handle these cases through defined HR and legal process; an analyst acting alone on a hunch causes real harm.',
  },

  // --------------------------- The chain itself ---------------------------
  {
    match: 'trace attack chain phish-01',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'Simulated attack chain — spear phishing to command and control',
      'NOTHING IS EXECUTED. This describes evidence, not actions.',
      '',
      '  [1] DELIVERY       Spoofed IT Service Desk email reaches analyst1',
      '                     Evidence: SPF softfail, DMARC none, 4-day-old domain',
      '  [2] USER ACTION    Link clicked; lookalike domain resolved',
      '                     Evidence: DNS query, proxy fetch, no prior history',
      '  [3] CRED CAPTURE   Credentials submitted to the lookalike page (simulated)',
      '                     Evidence: POST to non-IdP domain; no matching real login',
      '  [4] SUSPICIOUS     Attacker authenticates to the real portal — succeeds',
      '      LOGIN          Evidence: 4624 success, unfamiliar ASN, 02:47 local',
      '  [5] EXECUTION      PowerShell opens TLS to 203.0.113.55:443, beacons',
      '                     Evidence: 4688, netstat PID 6644, regular interval',
      '  [6] ALERT          SIEM correlates DNS + process + flow into one incident',
      '                     Evidence: correlated alert, full timeline',
      '',
      'Six stages, six places this could have been stopped or seen.',
      'The earliest catch is always the cheapest one.',
    ].join('\n'),
    teaches:
      'This is the Phase 0 incident explained end to end. The PowerShell session you triaged in your very first lab was stage 5 of six — and by then the attacker had already been through four earlier stages, each of which left evidence somebody could have looked at.',
  },
];
