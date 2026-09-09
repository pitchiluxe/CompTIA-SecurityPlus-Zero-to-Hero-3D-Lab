import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 11 — Network Security
// Aligned with CompTIA Security+ SY0-701
//
// PROMPT.md: "Build and secure an enterprise network. Inject safe
// configuration errors. Make the learner identify them."
//
// The review deliberately does not show a recommended value alongside each
// setting — the learner sees the config as it would appear and must know what
// right looks like. That is the difference between following a checklist and
// reviewing a network.
//
// Builds directly on the Phase 4 zone architecture.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p11-lesson-0',
    phaseId: 'phase-11',
    title: 'Firewalls, ACLs and Rule Order',
    objectives: [
      'Explain how firewall rules are evaluated and why order decides behaviour',
      'Identify a shadowed rule and say why it never fires',
      'Distinguish stateless from stateful filtering',
      'Read match counters to find unreachable rules on a live device',
    ],
    concepts: ['firewalls', 'acls', 'rule-ordering', 'stateful-filtering'],
    homework:
      'Write a five-rule firewall ACL in order, then move one rule to the top and describe exactly what breaks. Rule order is the lesson.',
    careerConnection:
      'Firewall rule review is a recurring audit task, and shadowed rules are the finding auditors most often miss because the config reads correctly line by line.',
    sections: [
      {
        id: 'p11-l0-s0',
        title: 'Concept — A rule set is a program, not a list',
        body: 'Firewall rules are evaluated top-down and the first match wins; evaluation stops there. That single property is what people get wrong. Reviewers read a rule set as a list of independent policy statements, but earlier lines change what later lines mean. A rule set has to be simulated, not read.',
      },
      {
        id: 'p11-l0-s1',
        title: 'Concept — Shadowing',
        body: 'A rule is shadowed when an earlier rule matches every packet it would match, so it can never fire. If the actions are the same the later rule is merely redundant. If the actions differ, the intent is actively defeated — a deny sitting below a broad permit is dead code that still reads like a control. The rule appears in the config, survives code review, and does nothing.',
      },
      {
        id: 'p11-l0-s2',
        title: 'Concept — Ordering principle',
        body: 'Specific rules first, general rules last, explicit deny at the bottom. That ordering is not stylistic — it is what makes specific rules reachable at all. And the explicit deny-all matters even where the platform has an implicit one, because you can log an explicit rule and an implicit one gives you nothing to count.',
      },
      {
        id: 'p11-l0-s3',
        title: 'Concept — Stateless and stateful',
        body: 'A stateless filter evaluates each packet in isolation, so return traffic needs its own rule. A stateful firewall tracks connections, so it permits return traffic for sessions it already allowed outbound. Stateful is the default expectation on any modern firewall, and it is why an outbound-permit rule does not need a matching inbound rule for the responses.',
      },
      {
        id: 'p11-l0-s4',
        title: 'Example — Reading the match counters',
        body: 'On the lab perimeter, sequence 20 is a permit-any with 2.8 million matches. Every rule below it shows zero. Those are not unused rules — they are unreachable ones, and the counters are the fastest way to tell the difference on a live device. A broad permit with millions of matches above a wall of zeroes is the signature.',
      },
      {
        id: 'p11-l0-s5',
        title: 'Scenario — The temporary rule',
        body: 'The offending rule is commented "Temporary — added during the migration, 2025-03". It is over a year old. This is the most common serious firewall finding in real environments: a broad permit added to unblock a deployment, never removed, and quietly defeating every control beneath it. Change processes that require an expiry date on temporary rules exist for exactly this reason.',
      },
      {
        id: 'p11-l0-s6',
        title: 'Review — What must stick',
        body: 'Top-down, first match wins, evaluation stops. Shadowed means an earlier rule covers everything a later one would — redundant if the actions match, contradicted if they differ. Specific first, general last, explicit deny at the end. Stateful tracks connections so return traffic is implicit. Match counters find unreachable rules.',
      },
    ],
    quiz: [
      {
        id: 'p11-q0',
        type: 'scenario',
        stem: 'A firewall has "permit ip any any" at sequence 20 and "deny tcp guest to servers" at sequence 30. What is the effect of the deny rule?',
        options: [
          'It blocks guest traffic to servers as intended',
          'None — the permit at 20 matches first, so the deny never fires',
          'It blocks all traffic including the permitted flows',
          'It applies only to traffic the permit did not match',
        ],
        answer: 1,
        explanation:
          'Rules evaluate top-down and the first match wins. A permit-any at 20 matches every packet, so sequence 30 is unreachable. The config still lists the deny and it does nothing.',
        examClue:
          'Whenever a broad permit sits above specific rules, check whether those rules can be reached at all.',
        domain: 'Security Architecture',
        conceptId: 'rule-ordering',
      },
      {
        id: 'p11-q1',
        type: 'mcq',
        stem: 'On a live firewall, several rules show zero match counts while one broad rule above them shows millions. What does this most likely indicate?',
        options: [
          'The zero-match rules are unused and can be deleted',
          'Those rules are unreachable because the broad rule shadows them',
          'The counters have been reset',
          'The firewall is not processing traffic correctly',
        ],
        answer: 1,
        explanation:
          'Unused and unreachable look identical in the configuration. The counters distinguish them, and a broad rule with heavy matches above a wall of zeroes is the shadowing signature.',
        domain: 'Security Operations',
        conceptId: 'acls',
      },
      {
        id: 'p11-q2',
        type: 'mcq',
        stem: 'Why does a stateful firewall not need an explicit rule to permit return traffic?',
        options: [
          'It permits all inbound traffic by default',
          'It tracks established connections and permits responses to sessions it already allowed',
          'Return traffic uses a different protocol',
          'It only filters inbound traffic',
        ],
        answer: 1,
        explanation:
          'Connection tracking is the defining feature. A stateless filter evaluates each packet alone and therefore needs an explicit rule for the return direction.',
        domain: 'Security Architecture',
        conceptId: 'stateful-filtering',
      },
      {
        id: 'p11-q-pbq',
        type: 'pbq',
        stem: 'Order the firewall rule review steps an analyst should follow from first to last.',
        options: [
          'List every rule by sequence number, including implied defaults',
          'Check match counts to identify which rules are actually being hit',
          'Compare each hit rule against the current network diagram and owner',
          'Remove or reorder shadowed rules and document the change',
        ],
        answer: [0, 1, 2, 3],
        explanation:
          'Sequence first, then evidence from counters, then validation against current need, then remediation. Skipping the match-count step makes it impossible to distinguish unused rules from unreachable rules.',
        domain: 'Security Architecture',
        conceptId: 'rule-ordering',
      },
    ],
  },

  {
    id: 'p11-lesson-1',
    phaseId: 'phase-11',
    title: 'Segmentation, VLANs and Monitoring',
    objectives: [
      'Explain VLANs as a segmentation control and their limits',
      'Identify VLAN hopping conditions and the configuration that prevents it',
      'Distinguish IDS from IPS by placement and capability',
      'Explain the fail-open decision on an inline sensor',
    ],
    concepts: ['network-segmentation', 'vlans', 'ids-ips', 'network-monitoring'],
    homework:
      'Design VLANs for a small office and write the inter-VLAN rules. Mark which VLAN you would monitor most heavily and why.',
    careerConnection:
      'VLAN misconfiguration is a standard finding, and the native-VLAN detail is one interviewers use to separate people who have configured switches from people who have read about them.',
    sections: [
      {
        id: 'p11-l1-s0',
        title: 'Concept — VLANs and their limits',
        body: 'A VLAN separates one physical switch into multiple broadcast domains, so hosts in different VLANs cannot reach each other without passing a router or firewall. That is the segmentation Phase 4 relied on. The limit worth stating: a VLAN is a configuration boundary, not a cryptographic one. It depends entirely on the switch being configured correctly, which is why the misconfigurations below matter.',
      },
      {
        id: 'p11-l1-s1',
        title: 'Concept — VLAN 1 and the native VLAN',
        body: 'VLAN 1 is the default on every port before anyone configures anything, which is precisely why it should carry no traffic. The native VLAN on a trunk is the one sent untagged — and if that is a VLAN an attacker can reach, double-tagging lets them inject frames into another VLAN. Two fixes, both simple: set the native VLAN to an unused blackholed ID, and restrict each trunk to the VLANs it actually needs.',
      },
      {
        id: 'p11-l1-s2',
        title: 'Concept — Hardening an access port',
        body: 'Four settings make an access port safe. Pin it to the right VLAN. Disable DTP with switchport nonegotiate, so it cannot be negotiated into a trunk. Enable BPDU guard, so plugging in a switch shuts the port rather than reshaping the spanning tree. And shut down unused ports entirely, in an unused VLAN — an open port in a meeting room is a network connection anyone can take.',
      },
      {
        id: 'p11-l1-s3',
        title: 'Concept — IDS versus IPS',
        body: 'An IDS sits out of band, receiving a copy of traffic from a SPAN port or TAP. It can alert and cannot block, which means it adds no latency and cannot drop legitimate traffic. An IPS sits inline in the traffic path and can drop packets in real time. The capability is better and the cost is that a false positive now breaks a real session rather than generating an unnecessary alert.',
      },
      {
        id: 'p11-l1-s4',
        title: 'Concept — Fail-open and the detection methods',
        body: 'An inline sensor that fails has to do something: fail-open passes traffic uninspected, fail-closed drops it. That is an availability-versus-security decision and it should be deliberate and documented rather than left at a default. On detection: signature matching is precise and blind to anything new, anomaly detection catches novel activity but needs a clean baseline and produces more noise, and behavioural detection looks at sequences of actions rather than payloads.',
      },
      {
        id: 'p11-l1-s5',
        title: 'Scenario — A sensor that is not helping',
        body: 'The lab perimeter IPS is inline with deny-packet-inline, which sounds strong. Its signature set is from November of the previous year, so it blocks last year\'s attacks, and fail-open is enabled, so anything that kills the sensor removes inspection entirely. Neither is visible from "IPS: enabled" on a dashboard, which is the recurring lesson from Phase 8 in a different domain.',
      },
      {
        id: 'p11-l1-s6',
        title: 'Review — What must stick',
        body: 'VLANs separate broadcast domains and depend on correct configuration. Keep user ports off VLAN 1, set the native VLAN to an unused ID, restrict trunks. Harden access ports with nonegotiate and BPDU guard, and shut unused ports. IDS is out of band and alerts; IPS is inline and blocks. Fail-open versus fail-closed is a deliberate decision. Signature, anomaly, behavioural.',
      },
    ],
    quiz: [
      {
        id: 'p11-q3',
        type: 'scenario',
        stem: 'A trunk port is configured with "switchport trunk native vlan 1" and "switchport trunk allowed vlan all". What is the risk?',
        options: [
          'Only a performance impact from carrying extra VLANs',
          'VLAN hopping via double tagging, plus the trunk carrying management and guest VLANs it does not need',
          'The trunk will not pass traffic',
          'Spanning tree will disable the port',
        ],
        answer: 1,
        explanation:
          'The native VLAN is untagged, so leaving it as VLAN 1 enables double-tagging attacks. "allowed vlan all" additionally carries every VLAN across that trunk, including management — removing the segmentation everything else depends on.',
        examClue:
          'Native VLAN questions are almost always about double tagging. Set it to an unused, blackholed ID.',
        domain: 'Security Architecture',
        conceptId: 'vlans',
      },
      {
        id: 'p11-q4',
        type: 'mcq',
        stem: 'Which deployment allows a sensor to drop malicious traffic in real time?',
        options: [
          'IDS on a SPAN port',
          'IPS deployed inline',
          'IDS with a network TAP',
          'A syslog collector',
        ],
        answer: 1,
        explanation:
          'Only an inline sensor sits in the traffic path and can drop packets. An IDS receives a copy and can alert but never block, which is also why it cannot break anything.',
        domain: 'Security Architecture',
        conceptId: 'ids-ips',
      },
      {
        id: 'p11-q5',
        type: 'scenario',
        stem: 'An inline IPS is configured fail-open. What happens if the sensor fails?',
        options: [
          'All traffic is blocked until the sensor recovers',
          'Traffic passes uninspected, preserving availability at the cost of inspection',
          'The sensor automatically restarts and buffers traffic',
          'Traffic is rerouted to a secondary sensor',
        ],
        answer: 1,
        explanation:
          'Fail-open keeps traffic flowing without inspection; fail-closed stops traffic entirely. Neither is universally right — it is an availability-versus-security decision that should be deliberate and documented.',
        domain: 'Security Architecture',
        conceptId: 'ids-ips',
      },
    ],
  },

  {
    id: 'p11-lesson-2',
    phaseId: 'phase-11',
    title: 'Wireless, NAC, VPN and Infrastructure Services',
    objectives: [
      'Choose between PSK and Enterprise wireless and justify it',
      'Explain 802.1X roles and port states',
      'Describe DHCP snooping and Dynamic ARP Inspection',
      'Explain DNS security controls and the DNS-over-HTTPS tension',
      'Explain VPN types and when split tunnelling is a trade-off rather than an error',
      'Choose secure protocols for managing network infrastructure',
    ],
    concepts: [
      'wireless-security',
      'nac',
      'dhcp-security',
      'dns-security',
      'secure-protocols',
      'vpn',
    ],
    homework:
      'Check the wireless security mode on a network you own and write down what an attacker gains if it were downgraded a generation. Then state what NAC would add.',
    careerConnection:
      'The PSK-versus-Enterprise argument is one you will actually have to make to a budget holder, and the leaver argument is the one that lands.',
    sections: [
      {
        id: 'p11-l2-s0',
        title: 'Concept — Wireless standards, briefly',
        body: 'WEP is broken and crackable in minutes. WPA with TKIP is deprecated. WPA2 is adequate, WPA3 is current. The more important axis is PSK versus Enterprise: a pre-shared key is one credential everyone shares, while Enterprise uses 802.1X so each user authenticates individually. Hiding the SSID contributes nothing, because the name appears in client probe requests regardless.',
      },
      {
        id: 'p11-l2-s1',
        title: 'Concept — Why PSK fails on a corporate network',
        body: 'The argument that lands is the leaver. With a shared key, revoking one person means changing the key for everyone — so nobody does it, and every former employee retains wireless access indefinitely. With Enterprise, revoking their directory account revokes their wireless with it. PSK also provides no attribution: the logs cannot tell you who did anything. For a guest network none of that matters, which is why PSK is the right choice there.',
      },
      {
        id: 'p11-l2-s2',
        title: 'Concept — 802.1X',
        body: 'Three roles: the supplicant is the device, the authenticator is the switch or AP holding the port closed, and the authentication server is RADIUS checking against the directory. Port control auto enforces it; force-authorized leaves the port permanently open and effectively disables 802.1X on it. Beyond identity, NAC can check device posture — patch level, encryption, EDR agent — and place failing devices in a remediation VLAN.',
      },
      {
        id: 'p11-l2-s3',
        title: 'Concept — DHCP snooping and DAI',
        body: 'A rogue DHCP server that answers faster than the real one supplies its own gateway and DNS, giving an on-path position without compromising a router. DHCP snooping fixes it: the switch drops DHCP offers from any port not explicitly trusted. Dynamic ARP Inspection then uses the snooping table to drop forged ARP, closing the Phase 3 ARP spoofing path. Two switch features that close two on-path attacks.',
      },
      {
        id: 'p11-l2-s4',
        title: 'Concept — DNS security',
        body: 'DNSSEC validates that a response genuinely came from the authoritative source, closing the poisoning path. Egress filtering forces every query through a resolver you control and log — which is precisely what made the DNS evidence in the Phase 7 investigation exist. DNS filtering blocks known-bad and newly registered domains, which would have stopped the Phase 3 attack chain at stage two.',
      },
      {
        id: 'p11-l2-s5',
        title: 'Concept — The DNS over HTTPS tension',
        body: 'DoH encrypts DNS queries inside HTTPS, which protects user privacy from network observers and simultaneously bypasses your internal resolver — so you lose the logging that made your investigation possible. This is a genuine trade-off rather than a problem with an obvious answer, and it is worth deciding deliberately. Pretending otherwise produces policies people quietly ignore.',
      },
      {
        id: 'p11-l2-s6',
        title: 'Concept — VPN as a network control',
        body: 'Phase 4 treated the VPN as a trust boundary and Phase 6 covered the cryptography. Here it is a network configuration. Site-to-site VPNs join two networks permanently and are usually IPsec; remote-access VPNs connect one user and are increasingly TLS-based because TLS traverses restrictive networks that block IPsec. The configuration detail that matters is the proposal — a modern one uses authenticated encryption such as AES-GCM and an elliptic-curve group for key exchange, and an old one silently negotiates something weaker.',
      },
      {
        id: 'p11-l2-s7',
        title: 'Concept — Split tunnelling is a trade-off, not an error',
        body: 'Full tunnelling sends all client traffic over the VPN, so internet traffic passes your inspection. Split tunnelling sends only internal traffic, which reduces load and improves user experience while allowing internet traffic to bypass your controls entirely. Neither is universally right. It is correct where endpoints carry their own EDR and filtering, and an error where the organisation relies on perimeter inspection — which is why reviewing it means asking about the endpoints before deciding.',
      },
      {
        id: 'p11-l2-s8',
        title: 'Concept — Secure protocols on the infrastructure itself',
        body: 'Phases 1 and 6 covered secure protocols for application traffic. The network devices themselves need the same treatment and are routinely forgotten. Manage switches and routers over SSH rather than Telnet, and over HTTPS rather than HTTP. Use SNMPv3, which authenticates and encrypts, rather than SNMPv1 or v2c, which send a community string in cleartext that functions as a password. Send syslog over TLS where the collector supports it. A network whose devices are managed in cleartext has a management plane an on-path attacker can read and modify.',
      },
      {
        id: 'p11-l2-s9',
        title: 'Review — What must stick',
        body: 'WEP broken, WPA2 adequate, WPA3 current; PSK versus Enterprise matters more than the version. PSK cannot support a leaver process and gives no attribution — correct for guest, wrong for corporate. 802.1X: supplicant, authenticator, RADIUS; watch for force-authorized exemptions. DHCP snooping stops rogue servers, DAI stops forged ARP. DNSSEC validates, egress filtering gives you logs, and DoH trades visibility for privacy.',
      },
    ],
    quiz: [
      {
        id: 'p11-q6',
        type: 'scenario',
        stem: 'A corporate wireless network uses WPA2-PSK. An employee leaves. What is the practical problem?',
        options: [
          'The network must be rebooted',
          'Revoking their access requires changing the shared key for everyone, so in practice it never happens',
          'WPA2 does not support revocation at all',
          'Their device retains a cached certificate',
        ],
        answer: 1,
        explanation:
          'A shared credential cannot participate in a leaver process. Enterprise mode ties wireless access to the individual directory account, so revoking the account revokes the access — and the logs show who did what.',
        examClue: 'PSK versus Enterprise questions usually turn on revocation or attribution.',
        domain: 'Security Architecture',
        conceptId: 'wireless-security',
      },
      {
        id: 'p11-q7',
        type: 'scenario',
        stem: 'Several switch ports are set to "authentication port-control force-authorized" for a conference room. What is the effect?',
        options: [
          'Devices must authenticate with stronger credentials',
          '802.1X is disabled on those ports, so anything plugged in gets network access',
          'Only registered MAC addresses are permitted',
          'Traffic is placed in a quarantine VLAN',
        ],
        answer: 1,
        explanation:
          'force-authorized holds the port permanently open. Conference rooms are exactly where an unattended port is most likely to be abused — if guests need access, put those ports on the guest VLAN rather than exempting them from NAC.',
        domain: 'Security Architecture',
        conceptId: 'nac',
      },
      {
        id: 'p11-q8',
        type: 'mcq',
        stem: 'Which control prevents a rogue DHCP server from supplying clients with an attacker-controlled gateway?',
        options: [
          'Port security',
          'DHCP snooping with only legitimate server ports trusted',
          'BPDU guard',
          'DNSSEC',
        ],
        answer: 1,
        explanation:
          'DHCP snooping drops DHCP offers from untrusted ports, so only the real server can answer. Dynamic ARP Inspection then builds on its table to drop forged ARP as well.',
        domain: 'Security Architecture',
        conceptId: 'dhcp-security',
      },
      {
        id: 'p11-q9',
        type: 'scenario',
        stem: 'An organisation is considering allowing DNS over HTTPS on endpoints. What is the security trade-off?',
        options: [
          'DoH is less secure than plain DNS',
          'It protects query privacy from network observers while bypassing the internal resolver, removing DNS logging and filtering',
          'It prevents all DNS-based attacks',
          'It requires disabling DNSSEC',
        ],
        answer: 1,
        explanation:
          'DoH improves privacy and removes the visibility that made the Phase 7 investigation possible. It is a genuine trade-off to decide deliberately, not a problem with an obvious answer.',
        domain: 'Security Architecture',
        conceptId: 'dns-security',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p11-lab-0',
    phaseId: 'phase-11',
    title: 'Analyse a Firewall Rule Set',
    objective:
      'Find the unreachable rules in a perimeter rule set, explain why they never fire, and fix the ordering.',
    securityConcepts: ['Firewall rules', 'Rule ordering', 'Shadowing', 'ACLs'],
    environment: 'Interactive rule analysis computed from CIDR and port containment',
    topology: 'Perimeter firewall between the Phase 4 zones',
    prerequisites: ['Complete Phase 10'],
    steps: [
      {
        id: 's0',
        instruction: 'Review how firewall rules are evaluated.',
        command: 'explain rule ordering',
        expected: 'Top-down, first match wins, evaluation stops.',
      },
      {
        id: 's1',
        instruction: 'Read the live rule set and note the match counters.',
        command: 'show access-list perimeter',
        expected: 'Sequence 20 has 2.8 million matches; everything below shows zero.',
      },
      {
        id: 's2',
        instruction:
          'Open the Network Review firewall tab and identify every unreachable rule and what shadows it.',
        expected: 'Three rules unreachable, all shadowed by the permit-any at sequence 20.',
      },
      {
        id: 's3',
        instruction:
          'Use the reorder control to move the broad permit below the denies, and observe the change.',
        expected: 'The unreachable count falls — the analysis is computed, not scripted.',
      },
    ],
    expectedResults: [
      'Evaluation order understood as first-match-wins',
      'Match counters used to distinguish unused from unreachable',
      'Shadowed rules identified with the rule that swallows each',
      'Reordering demonstrated to change the analysis',
    ],
    verification: [
      'Learner can explain why a deny below a broad permit never fires',
      'Learner can state the correct general ordering principle',
      'Learner can distinguish a redundant rule from a contradicted one',
    ],
    troubleshooting: [
      'Rule looks correct in isolation → it probably is. Shadowing is a property of the set, not the line.',
      'Unsure whether a zero-match rule is unused or unreachable → check what sits above it.',
    ],
    challenge:
      'The offending rule is commented "Temporary — added during the migration, 2025-03". Write the change-process rule you would introduce so this cannot recur, and explain how you would enforce it rather than merely document it.',
    evidence: [
      {
        id: 'ev0',
        label: 'Rule set analysis',
        type: 'report',
        placeholder: 'Rule, reachable?, shadowed by, action required',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A firewall rule set is a program executed in order, not a list of intentions. A deny below a broad permit reads like a control, passes review, and does nothing — which is why match counters matter more than the config text.',
  },

  {
    id: 'p11-lab-1',
    phaseId: 'phase-11',
    title: 'Review an Enterprise Network Configuration',
    objective:
      'Identify the injected configuration errors across firewall, VLANs, wireless, NAC, DHCP, DNS, monitoring and VPN — with no recommended values to compare against.',
    securityConcepts: [
      'Network hardening',
      'Configuration review',
      'Segmentation',
      'Wireless security',
    ],
    environment: 'Interactive configuration review with errors injected into a plausible config',
    topology: 'Enterprise network built on the Phase 4 zone architecture',
    prerequisites: ['Complete "Analyse a Firewall Rule Set"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the VLAN and trunk configuration.',
        command: 'show vlan config',
        expected: 'A user port on VLAN 1, and a trunk with native VLAN 1 carrying all VLANs.',
      },
      {
        id: 's1',
        instruction: 'Compare the wireless security options.',
        command: 'compare wireless security',
        expected: 'PSK versus Enterprise, and why hiding the SSID achieves nothing.',
      },
      {
        id: 's2',
        instruction: 'Review how NAC port states work.',
        command: 'explain nac',
        expected: 'Three roles, three port states, and the force-authorized warning.',
      },
      {
        id: 's3',
        instruction: 'Review the DHCP and DNS controls.',
        command: 'explain dhcp dns security',
        expected: 'Snooping, DAI, DNSSEC, egress filtering, and the DoH trade-off.',
      },
      {
        id: 's4',
        instruction:
          'Open the Network Review configuration tab and classify every item as correct or an error.',
        expected: 'Eight errors among twenty items, graded in both directions.',
      },
    ],
    expectedResults: [
      'All configuration areas reviewed',
      'Errors identified without a recommended value to compare against',
      'Correct configuration recognised as correct',
      'High-severity errors distinguished from low',
    ],
    verification: [
      'Learner can explain why VLAN 1 should carry no traffic',
      'Learner can explain why corporate wireless should not use PSK',
      'Learner can identify a force-authorized exemption as a finding',
    ],
    troubleshooting: [
      'Tempted to flag everything → several items are correct, including a split-tunnel VPN and an alert-only IDS. Flagging them wastes the network team time.',
      'Unsure about an item → ask what an attacker gains from it. If nothing, it is probably correct.',
    ],
    challenge:
      'Two items in this configuration are defensible design decisions rather than errors — the alert-only IDS and the split-tunnel VPN. For each, describe the environment in which it would become an error, and say what you would check before deciding.',
    evidence: [
      {
        id: 'ev0',
        label: 'Configuration review findings',
        type: 'report',
        placeholder: 'Area, config, verdict, severity, remediation',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Reviewing a configuration without a recommended value beside each line is the real skill. It requires knowing what right looks like — and recognising that some settings are legitimate design trade-offs rather than mistakes.',
  },

  {
    id: 'p11-lab-2',
    phaseId: 'phase-11',
    title: 'Harden the Network',
    objective:
      'Produce the remediation plan for the reviewed network, ordered by what an attacker gains, and connect each control back to the attack it closes.',
    securityConcepts: ['Network hardening', 'Defence in depth', 'Control mapping'],
    environment: 'Deterministic simulator — prepared reference artifacts',
    topology: 'The reviewed enterprise network',
    prerequisites: ['Complete "Review an Enterprise Network Configuration"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the network hardening checklist.',
        command: 'show network hardening checklist',
        expected: 'Switching, filtering, access and services, with NTP included.',
      },
      {
        id: 's1',
        instruction: 'Confirm the IDS and IPS trade-offs before recommending changes.',
        command: 'compare ids ips',
        expected: 'Placement, blocking capability, and the fail-open decision.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the Phase 4 zone model this network implements.',
        command: 'show zones',
        expected: 'The zone architecture these VLANs and rules are enforcing.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the ARP spoofing path that DHCP snooping and DAI close.',
        command: 'arp -a',
        expected: 'The ARP cache from Phase 1, with no duplicates.',
      },
    ],
    expectedResults: [
      'Hardening checklist reviewed across all four areas',
      'IDS and IPS trade-offs understood before recommending',
      'Controls mapped back to the zone architecture',
      'Switch features connected to the attacks they close',
    ],
    verification: [
      'Learner can order the remediation by what an attacker gains',
      'Learner can name the attack each switch feature closes',
      'Learner can explain why NTP appears on a security checklist',
    ],
    troubleshooting: [
      'Unsure how to order remediation → put the items that give an attacker a path above the ones that only give information.',
      'Wondering why NTP matters → correlation across devices needs synchronised time. Without it the Phase 7 investigation does not work.',
    ],
    challenge:
      'Take the four highest-severity errors and map each one to a specific attack from Phase 3 that it enables. Then state which single change would close the most attack paths, and why you would sequence it first.',
    evidence: [
      {
        id: 'ev0',
        label: 'Network hardening plan',
        type: 'report',
        placeholder: 'Finding, severity, attack enabled, remediation, order',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Network hardening is a small set of items that recur in every review. The one that surprises people is NTP — it looks operational, and without synchronised clocks no cross-device investigation is possible at all.',
  },
];

export const PHASE_11: Phase = {
  id: 'phase-11',
  number: 11,
  title: 'Network Security',
  description:
    'Building and securing an enterprise network on the Phase 4 zone architecture. Firewall rule order and shadowing, VLAN segmentation and its failure modes, IDS and IPS placement, wireless and NAC, and the DHCP and DNS controls that close on-path attacks.',
  examDomain: 'Security Architecture',
  scene: 'zones',
  lessons: LESSONS,
  labs: LABS,
};
