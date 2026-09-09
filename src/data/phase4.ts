import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 4 — Security Architecture
// Aligned with CompTIA Security+ SY0-701 (Domain 3.0, 18%)
//
// Completes the set: Phase 1 showed the path traffic takes, Phase 2 the layers
// protecting an asset, Phase 3 an attack crossing both. Phase 4 is the topology
// all three have been implicitly describing.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p4-lesson-0',
    phaseId: 'phase-4',
    title: 'Segmentation, VLANs and Security Zones',
    objectives: [
      'Explain why segmentation makes policy enforcement possible at all',
      'Describe VLANs and what they do and do not isolate',
      'Define a security zone by trust level rather than by department',
      'Explain the purpose of a DMZ and the rule that makes it work',
    ],
    concepts: ['segmentation', 'vlans', 'security-zones', 'dmz'],
    homework:
      'Draw a segmented network for a small office with users, servers, guests, and management. State the one rule you would write between each pair of zones, and which pairs need no path at all.',
    careerConnection:
      'Network and SOC roles both. "Which segment is that host in?" is the first scoping question of every incident, because it bounds what the attacker could reach.',
    sections: [
      {
        id: 'p4-l0-s0',
        title: 'Concept — Why segmentation works',
        body: 'Hosts on the same VLAN talk to each other through a switch, and switched traffic never passes a router. That means it never meets a firewall rule, an IDS sensor, or any policy at all. Put those hosts in separate VLANs and their traffic must be routed — and a router is somewhere you can attach policy. Segmentation is not primarily about tidiness; it is about creating the choke points where control becomes possible.',
      },
      {
        id: 'p4-l0-s1',
        title: 'Concept — VLANs and what they actually isolate',
        body: 'A VLAN is a logical broadcast domain: devices in different VLANs cannot reach each other without routing, even on the same physical switch. What a VLAN does not do is protect against anything at layer 2 within itself — two hosts in the same VLAN can still ARP-spoof each other. That is why the Users segment also blocks workstation-to-workstation traffic: the VLAN separates Users from Servers, and client isolation separates users from each other.',
      },
      {
        id: 'p4-l0-s2',
        title: 'Concept — Zones are defined by trust, not by org chart',
        body: 'A security zone groups systems you are willing to make the same assumptions about. In the reference architecture, Guest sits at trust 5, barely above the Internet, while Management sits at 95. Those numbers are not about importance or department — they express how much you assume about what is inside. A boundary exists wherever trust changes, and that is exactly where controls belong.',
      },
      {
        id: 'p4-l0-s3',
        title: 'Concept — The DMZ and the rule that makes it work',
        body: 'A DMZ, or screened subnet, holds services that must be reachable from the Internet. The point is not that those services are protected — they are the most exposed things you own. The point is containment: when one is compromised, and public services are the ones most likely to be, the attacker has landed somewhere with no path inward. The rule that makes this true is direction: a DMZ host may receive connections but may never initiate one into the Core.',
      },
      {
        id: 'p4-l0-s4',
        title: 'Example — Reading the policy matrix',
        body: 'Read the Guest row of the lab policy matrix: one permitted destination, the Internet, reached without transiting the Core. Read the Servers row: servers cannot initiate to Users, which stops a compromised server pivoting to workstations. Read the Management column: nothing may reach it. Administration flows one way, by design.',
      },
      {
        id: 'p4-l0-s5',
        title: 'Scenario — Why the guest denial is stronger than a rule',
        body: 'When a guest device tries to reach SRV-01, the packet is not filtered — it is discarded because no route to that network exists from VLAN 50. The firewall is never consulted. This is the network-scale version of the Phase 2 lesson that reducing surface beats protecting it: a rule can be misconfigured, a route that does not exist cannot be.',
      },
      {
        id: 'p4-l0-s6',
        title: 'Review — What must stick',
        body: 'Same VLAN means switched and unpoliced; different VLANs means routed and therefore controllable. VLANs separate segments but not hosts within a segment — client isolation does that. Zones are trust groupings, and boundaries live where trust changes. A DMZ contains rather than protects, and the containment depends on denying inbound-initiated traffic.',
      },
    ],
    quiz: [
      {
        id: 'p4-q0',
        type: 'scenario',
        stem: 'Two servers sit in the same VLAN. The firewall shows no traffic between them, yet they clearly communicate. Why?',
        options: [
          'The firewall is misconfigured and dropping log entries',
          'Same-VLAN traffic is switched, not routed, so it never passes the firewall',
          'The servers are using an encrypted protocol the firewall cannot log',
          'The servers must be communicating over IPv6',
        ],
        answer: 1,
        explanation:
          'Traffic within one broadcast domain is switched at layer 2 and never reaches a router. This is precisely why segmentation matters — putting hosts in separate VLANs forces routing, which creates the point where policy can apply.',
        examClue:
          'If a question asks why the firewall cannot see internal traffic, the answer usually involves same-segment switching.',
        domain: 'Security Architecture',
        conceptId: 'segmentation',
      },
      {
        id: 'p4-q1',
        type: 'mcq',
        stem: 'What is the primary purpose of a DMZ?',
        options: [
          'To make Internet-facing services harder to compromise',
          'To contain the compromise of Internet-facing services so it does not extend inward',
          'To encrypt traffic between the Internet and internal servers',
          'To increase available bandwidth for public services',
        ],
        answer: 1,
        explanation:
          'DMZ hosts are the most exposed systems you own and are the most likely to be compromised. The DMZ exists so that when one is, the attacker has landed somewhere with no route into the Core.',
        domain: 'Security Architecture',
        conceptId: 'dmz',
      },
      {
        id: 'p4-q2',
        type: 'scenario',
        stem: 'A guest device attempts to reach an internal server. The firewall logs show no deny entry for the attempt. What most likely happened?',
        options: [
          'The firewall failed open and the traffic was permitted',
          'No route to the internal network exists from the guest VLAN, so the packet was discarded before reaching the firewall',
          'The connection succeeded and simply was not logged',
          'The guest device is on the same VLAN as the server',
        ],
        answer: 1,
        explanation:
          'Guest egress is designed to bypass the Core entirely. With no route to the internal network, the packet is discarded at layer 3 and the firewall is never consulted — a stronger control than any rule, because there is no path to misconfigure.',
        domain: 'Security Architecture',
        conceptId: 'security-zones',
      },
      {
        id: 'p4-q3',
        type: 'pbq',
        stem: 'Order these zones from least to most trusted: [0] Management, [1] Internet, [2] Servers, [3] Guest, [4] Users.',
        options: ['Internet', 'Guest', 'Users', 'Servers', 'Management'],
        answer: [1, 3, 4, 2, 0],
        explanation:
          'Internet (0), Guest (5), Users (55), Servers (75), Management (95). Guest sits barely above the Internet because guest devices are unmanaged. Servers outrank Users because they are managed systems rather than machines where someone opens email.',
        domain: 'Security Architecture',
        conceptId: 'security-zones',
      },
    ],
  },

  {
    id: 'p4-lesson-1',
    phaseId: 'phase-4',
    title: 'Boundary Controls — Firewalls, IDS, IPS, WAF and Proxies',
    objectives: [
      'Distinguish IDS from IPS by placement and capability',
      'Explain what a WAF inspects that a firewall cannot',
      'Describe forward and reverse proxies and what each hides',
      'Choose the right control for a described requirement',
    ],
    concepts: ['firewalls', 'ids', 'ips', 'waf', 'proxy'],
    homework:
      'Write one sentence per control — firewall, IDS, IPS, WAF, proxy — naming the layer it works at and the one attack it stops that the others do not.',
    careerConnection:
      'Interviews probe IDS versus IPS relentlessly, because getting it wrong reveals that someone has read about controls without ever placing one.',
    sections: [
      {
        id: 'p4-l1-s0',
        title: 'Concept — Firewalls and what they decide on',
        body: 'A stateful firewall tracks connections and decides on source, destination, port, and direction of initiation. That last one carries more weight than learners expect: the DMZ-to-Core rule permits a proxy to forward an inbound request while forbidding any DMZ host from starting a conversation inward. Same hosts, same port, opposite direction, completely different security outcome.',
      },
      {
        id: 'p4-l1-s1',
        title: 'Concept — IDS versus IPS is a question of placement',
        body: 'An IDS sits out of band, receiving a copy of traffic from a span port or tap. It can alert but cannot block, because the real packet has already passed. An IPS sits inline: traffic flows through it, so it can drop. The trade-off follows from placement alone — an IDS cannot break your network but cannot stop an attack; an IPS can stop an attack and can also become a bottleneck or a single point of failure.',
      },
      {
        id: 'p4-l1-s2',
        title: 'Concept — What a WAF adds',
        body: 'A firewall reasons about packets, addresses, and ports. A WAF reasons about HTTP: request bodies, headers, parameters, and payload patterns. Only a WAF can see that a permitted TCP 443 request carries an SQL injection attempt in a form field, because to a firewall that is simply allowed web traffic. The limit is the mirror image: a WAF understands web traffic and is blind to everything else.',
      },
      {
        id: 'p4-l1-s3',
        title: 'Concept — Forward and reverse proxies',
        body: 'A forward proxy sits in front of your users, brokering their outbound requests. It hides internal clients, enforces category filtering, and produces the web logs Phase 3 relied on. A reverse proxy sits in front of your servers, brokering inbound requests. It hides the origin server, terminates TLS, and is where a WAF is usually deployed. Same mechanism, opposite direction, different thing being protected.',
      },
      {
        id: 'p4-l1-s4',
        title: 'Example — Four controls at one boundary',
        body: 'At the Internet-to-DMZ boundary the lab environment stacks all four: the firewall permits only 443 and 53, the reverse proxy terminates TLS and conceals the origin, the WAF inspects the decrypted HTTP content, and the IPS drops on signature match. Note the ordering — the WAF can only inspect content because the proxy has already terminated TLS. Control placement is a dependency graph, not a checklist.',
      },
      {
        id: 'p4-l1-s5',
        title: 'Scenario — Choosing between detection and prevention',
        body: 'A team asks whether to deploy IDS or IPS on a segment carrying clinical systems. The honest answer is a business question, not a technical one: an IPS that false-positives takes those systems offline, and for some environments an outage is worse than an intrusion. Deploying IDS on the critical segment and IPS at the perimeter is a legitimate, common design. "It depends what an outage costs you" is the correct professional answer.',
      },
      {
        id: 'p4-l1-s6',
        title: 'Review — What must stick',
        body: 'Firewall: addresses, ports, and direction of initiation. IDS: out of band, detects only. IPS: inline, can block, can break things. WAF: application-layer, HTTP-aware, web-only. Forward proxy fronts clients; reverse proxy fronts servers and hosts the WAF. Placement determines capability every time.',
      },
    ],
    quiz: [
      {
        id: 'p4-q4',
        type: 'mcq',
        stem: 'What fundamentally distinguishes an IPS from an IDS?',
        options: [
          'An IPS uses signatures while an IDS uses anomaly detection',
          'An IPS is deployed inline so traffic passes through it and can be dropped; an IDS sees only a copy',
          'An IPS operates at layer 7 while an IDS operates at layer 3',
          'An IPS is hardware and an IDS is software',
        ],
        answer: 1,
        explanation:
          'The distinction is placement, and capability follows from it. Out-of-band means a copy, which means detection only. Inline means the traffic passes through, which makes blocking possible — and makes availability a risk.',
        examClue:
          'IDS/IPS questions are answered by asking where the device sits, never by what detection method it uses.',
        domain: 'Security Architecture',
        conceptId: 'ips',
      },
      {
        id: 'p4-q5',
        type: 'scenario',
        stem: 'A permitted HTTPS request to a public web server contains an SQL injection attempt in a form field. Which control can detect it?',
        options: [
          'The stateful firewall, by inspecting the destination port',
          'A WAF, because it inspects HTTP request content rather than packets and ports',
          'The IDS, by matching the destination IP address',
          'NAC, by checking the client device posture',
        ],
        answer: 1,
        explanation:
          'To a firewall this is allowed traffic to an allowed port. Only an application-layer control that parses the HTTP request can see the payload. Note the dependency: the WAF needs TLS terminated first, which the reverse proxy does.',
        domain: 'Security Architecture',
        conceptId: 'waf',
      },
      {
        id: 'p4-q6',
        type: 'mcq',
        stem: 'Which control hides internal client identities and enforces web category filtering on outbound traffic?',
        options: ['Reverse proxy', 'Forward proxy', 'WAF', 'Network access control'],
        answer: 1,
        explanation:
          'A forward proxy fronts the clients, brokering their outbound requests and producing the web logs used in phishing investigations. A reverse proxy fronts the servers and handles inbound traffic.',
        domain: 'Security Architecture',
        conceptId: 'proxy',
      },
      {
        id: 'p4-q7',
        type: 'scenario',
        stem: 'A hospital will not accept the risk of a false positive taking clinical systems offline, but wants visibility on that segment. What is the appropriate design?',
        options: [
          'IPS inline on the clinical segment, tuned aggressively',
          'IDS out of band on the clinical segment, with IPS retained at the perimeter',
          'No monitoring on the clinical segment at all',
          'A WAF in front of every clinical device',
        ],
        answer: 1,
        explanation:
          'An out-of-band IDS gives visibility without the ability to interrupt clinical traffic, while the perimeter still gets active blocking. Availability is part of the CIA triad, and for some environments an outage is genuinely worse than an intrusion.',
        domain: 'Security Architecture',
        conceptId: 'ids',
      },
    ],
  },

  {
    id: 'p4-lesson-2',
    phaseId: 'phase-4',
    title: 'Trust, Access and Deception — Zero Trust, VPN, NAC, Honeypots',
    objectives: [
      'Explain how Zero Trust changes what a network boundary is allowed to conclude',
      'Describe what NAC decides and when it decides it',
      'Contrast a VPN trust boundary with a Zero Trust access decision',
      'Explain why honeypots produce unusually high-confidence alerts',
    ],
    concepts: ['zero-trust', 'vpn', 'nac', 'honeypot', 'honeynet'],
    homework:
      'Explain in writing why a VPN alone is not Zero Trust. Then name two signals a policy engine could evaluate that a VPN cannot.',
    careerConnection:
      'IAM and network security meet here. Zero Trust is the architecture that Phase 5 identity work actually implements.',
    sections: [
      {
        id: 'p4-l2-s0',
        title: 'Concept — Zero Trust as a change to what location proves',
        body: 'A traditional architecture concludes something from location: you are on the internal network, therefore you are somewhat trusted. Zero Trust removes that inference. Every request is authenticated, authorised, and evaluated on its own merits regardless of origin. Note what this does not mean: it does not remove the network boundaries you just spent a lesson building. Segmentation still limits reachability; Zero Trust simply stops reachability being mistaken for permission.',
      },
      {
        id: 'p4-l2-s1',
        title: 'Concept — NAC decides at the door',
        body: 'Network access control evaluates a device as it connects — is it known, is it patched, is it running the required agent, can it authenticate via 802.1X — and assigns a VLAN based on the answer. A compliant corporate laptop joins the Users segment; an unknown device is quarantined to a remediation VLAN or dropped onto Guest. NAC is the control that makes zone membership a decision rather than an accident of which port someone plugged into.',
      },
      {
        id: 'p4-l2-s2',
        title: 'Concept — The VPN trust problem',
        body: 'A remote-access VPN encrypts traffic and places the remote device logically inside the network. That second half is the problem: it extends your trust boundary onto a laptop you may not control, which is exactly the assumption Phase 3 attack chain exploited. Under Zero Trust the VPN still provides an encrypted transport, but arriving through it grants no standing — each service still demands authentication, device posture, and authorisation for the specific request.',
      },
      {
        id: 'p4-l2-s3',
        title: 'Concept — Honeypots and honeynets',
        body: 'A honeypot is a decoy system with no legitimate purpose. A honeynet is a whole decoy segment. Their value is the false-positive rate: normal monitoring drowns in benign activity, but nothing legitimate should ever touch a decoy, so any single interaction is a high-confidence signal. The limitation is equally clear — a honeypot detects, it does not protect, and an attacker who never touches it is invisible to it.',
      },
      {
        id: 'p4-l2-s4',
        title: 'Example — A high-confidence alert',
        body: 'The lab honeypot HP-02 presents a fake share named HR-Payroll-2026 on the Servers VLAN. At 02:51 a host in the Users VLAN enumerates SMB against it and then attempts access. No business process touches HP-02, so this is not something requiring triage to establish suspicion — it is a workstation probing for payroll data at three in the morning, and the only question is which incident it belongs to.',
      },
      {
        id: 'p4-l2-s5',
        title: 'Scenario — Where these controls meet identity',
        body: 'Zero Trust needs three things to make an access decision: who the user is, what the device posture is, and what the request is asking for. NAC supplies the device half. The identity half — authentication strength, group membership, conditional access — is Phase 5. Zero Trust is not a product you buy; it is a design that identity and network controls implement together.',
      },
      {
        id: 'p4-l2-s6',
        title: 'Review — What must stick',
        body: 'Zero Trust: location grants nothing; verify every request. It complements segmentation rather than replacing it. NAC decides zone membership at connection time on device posture. A VPN encrypts transport and, in traditional designs, extends trust — which is the assumption Zero Trust removes. Honeypots detect with very high confidence and protect nothing.',
      },
    ],
    quiz: [
      {
        id: 'p4-q8',
        type: 'mcq',
        stem: 'Under Zero Trust, what does being on the internal network entitle a request to?',
        options: [
          'Access to any resource in the same segment',
          'Nothing — every request is authenticated and authorised on its own merits',
          'Reduced authentication requirements',
          'Automatic trust for read-only operations',
        ],
        answer: 1,
        explanation:
          'Zero Trust removes location as a basis for trust. Network position may still determine what is reachable, but reachability is never treated as permission.',
        domain: 'Security Architecture',
        conceptId: 'zero-trust',
      },
      {
        id: 'p4-q9',
        type: 'scenario',
        stem: 'An unmanaged personal laptop connects to a corporate ethernet port. It is placed on a restricted VLAN with no internal access. Which control did this?',
        options: [
          'The perimeter firewall',
          'Network access control evaluating device posture at connection time',
          'The web application firewall',
          'The intrusion prevention system',
        ],
        answer: 1,
        explanation:
          'NAC evaluates the device as it joins and assigns a VLAN based on the result. Firewalls and IPS act on traffic that is already on the network; NAC acts at the moment of admission.',
        domain: 'Security Architecture',
        conceptId: 'nac',
      },
      {
        id: 'p4-q10',
        type: 'scenario',
        stem: 'A decoy file share that no business process uses records an access attempt from a workstation at 02:53. Why is this alert unusually valuable?',
        options: [
          'Honeypots block the attacker automatically',
          'Nothing legitimate should ever touch it, so the false-positive rate is near zero',
          'It proves conclusively which individual is responsible',
          'It encrypts the attacker traffic for later analysis',
        ],
        answer: 1,
        explanation:
          'Decoys have no legitimate use, so any interaction is a high-confidence signal without the triage burden normal monitoring carries. Note that a honeypot detects but does not protect — and it names a host, not a person.',
        domain: 'Security Operations',
        conceptId: 'honeypot',
      },
      {
        id: 'p4-q11',
        type: 'mcq',
        stem: 'What security trade-off does a traditional remote-access VPN introduce that Zero Trust addresses?',
        options: [
          'It encrypts traffic, which prevents inspection',
          'It extends the trusted network onto a device the organisation may not control',
          'It requires opening inbound ports on every internal server',
          'It prevents the use of multi-factor authentication',
        ],
        answer: 1,
        explanation:
          'The VPN places a potentially compromised remote endpoint logically inside the boundary. Zero Trust removes the inference that inside means trusted, so the endpoint still has to prove itself for every request.',
        domain: 'Security Architecture',
        conceptId: 'vpn',
      },
    ],
  },

  {
    id: 'p4-lesson-3',
    phaseId: 'phase-4',
    title: 'Secure Architecture, Redundancy and High Availability',
    objectives: [
      'Distinguish redundancy from high availability',
      'Identify single points of failure in a described design',
      'Explain why availability findings are security findings',
      'Apply secure design principles to an architecture review',
    ],
    concepts: ['secure-architecture', 'redundancy', 'high-availability', 'single-point-of-failure'],
    homework:
      'Find a single point of failure in a system you rely on and write down what redundancy would remove it — and what it would cost in money or complexity.',
    careerConnection:
      'Architecture review is where senior work begins. Being able to point at a diagram and name the single point of failure is a promotable skill.',
    sections: [
      {
        id: 'p4-l3-s0',
        title: 'Concept — Redundancy is not high availability',
        body: 'Redundancy means a second component exists. High availability means failover happens automatically, fast enough that service continues without a human. A spare firewall in a cupboard is redundancy; an active/passive pair failing over in three seconds is high availability. Exam questions exploit this difference, and so does reality — plenty of organisations own the spare and discover during the outage that nobody had configured the failover.',
      },
      {
        id: 'p4-l3-s1',
        title: 'Concept — Single points of failure',
        body: 'A single point of failure is any component whose loss stops the service. Finding them is a matter of walking the dependency chain and asking what breaks if each element disappears. In the lab architecture two remain: one domain controller and one ISP link. The domain controller is the more serious, because an authentication outage takes down every zone at once — nobody can log in anywhere.',
      },
      {
        id: 'p4-l3-s2',
        title: 'Concept — Availability is a security property',
        body: 'It is tempting to treat an outage as an operations problem. Availability is the A in the CIA triad, so a single point of failure is a security finding. This matters practically: ransomware attacks availability directly, and a denial-of-service attack targets nothing else. An architecture with no redundancy is one where an attacker needs only to break one thing.',
      },
      {
        id: 'p4-l3-s3',
        title: 'Concept — Secure design principles',
        body: 'Several principles recur across the whole architecture. Defence in depth: layer independent controls. Least privilege: including between zones, not just for users. Fail secure: when a control fails, it should deny rather than permit — though note this trades against availability, and a fail-secure door lock is a fire-safety problem. Separation of duties: no single person or system holds every capability. Keep it simple: a design nobody understands is a design nobody can secure.',
      },
      {
        id: 'p4-l3-s4',
        title: 'Example — Reviewing the reference architecture',
        body: 'Firewalls: active/passive pair, three-second failover — good. Core switching: stacked pair, sub-second — good. Application: two nodes behind a load balancer — good. Domain controller: single node, no failover — finding. Internet link: single ISP — finding. Two of five components are single points of failure, and the review writes itself once you have walked the chain.',
      },
      {
        id: 'p4-l3-s5',
        title: 'Scenario — When fail-secure is the wrong answer',
        body: 'Fail-secure sounds unambiguously correct until you apply it to a physical door in a building that might catch fire, or to a medical device. The professional position is that the failure mode is a deliberate design decision informed by what failure costs in that specific context — not a slogan. Being able to say "fail-secure here, fail-safe there, and here is why" is what distinguishes an architect from someone reciting principles.',
      },
      {
        id: 'p4-l3-s6',
        title: 'Review — What must stick',
        body: 'Redundancy is a spare; high availability is automatic failover. Find single points of failure by walking the dependency chain. Availability is part of CIA, so these are security findings. Principles: defence in depth, least privilege between zones, fail secure or fail safe as a deliberate choice, separation of duties, and simplicity.',
      },
    ],
    quiz: [
      {
        id: 'p4-q12',
        type: 'mcq',
        stem: 'An organisation keeps a configured spare firewall on a shelf, swapped in manually during an outage. What does this provide?',
        options: [
          'High availability',
          'Redundancy, but not high availability',
          'Fault tolerance with automatic failover',
          'Neither redundancy nor high availability',
        ],
        answer: 1,
        explanation:
          'The spare component exists, so this is redundancy. High availability additionally requires automatic failover fast enough that service continues without human intervention.',
        examClue:
          'If a human has to act for service to resume, it is redundancy rather than high availability.',
        domain: 'Security Architecture',
        conceptId: 'redundancy',
      },
      {
        id: 'p4-q13',
        type: 'scenario',
        stem: 'An architecture has redundant firewalls, stacked core switches, and a load-balanced application, but only one domain controller. Why is the domain controller the most serious finding?',
        options: [
          'Domain controllers are more expensive to replace',
          'Authentication failure affects every zone at once — nobody can log in anywhere',
          'Domain controllers are more frequently attacked than firewalls',
          'It is not serious, since the other components are redundant',
        ],
        answer: 1,
        explanation:
          'Every zone depends on authentication. Losing the single domain controller is an estate-wide outage regardless of how redundant the network path is — the dependency chain converges on it.',
        domain: 'Security Architecture',
        conceptId: 'single-point-of-failure',
      },
      {
        id: 'p4-q14',
        type: 'mcq',
        stem: 'Why is a single point of failure treated as a security finding rather than purely an operational one?',
        options: [
          'Because it usually indicates a misconfiguration',
          'Because availability is part of the CIA triad, and an attacker then needs to break only one thing',
          'Because auditors require full redundancy in all cases',
          'Because it always implies missing encryption',
        ],
        answer: 1,
        explanation:
          'Availability is one of the three properties security protects. Ransomware and denial-of-service attack it directly, and a design with a single point of failure hands an attacker a single target.',
        domain: 'Security Architecture',
        conceptId: 'high-availability',
      },
      {
        id: 'p4-q15',
        type: 'scenario',
        stem: 'A badge-controlled door is configured to fail secure. During a fire alarm the locks remain engaged. What does this illustrate?',
        options: [
          'Fail secure is always the correct configuration',
          'Failure mode is a design decision that must weigh security against safety and availability',
          'The door should have had no electronic lock',
          'Fail secure and fail safe mean the same thing',
        ],
        answer: 1,
        explanation:
          'Fail secure denies on failure; fail safe permits. Which is correct depends entirely on what failure costs in that context — and for a door people must escape through, life safety outranks access control.',
        domain: 'Security Architecture',
        conceptId: 'secure-architecture',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p4-lab-0',
    phaseId: 'phase-4',
    title: 'Map the Security Zones',
    objective:
      'Enumerate the seven zones of the enterprise architecture, order them by trust, and explain what each boundary is there to prevent.',
    securityConcepts: ['Security zones', 'Trust levels', 'VLANs', 'DMZ'],
    environment: 'Deterministic simulator — prepared architecture artifacts, nothing is executed',
    topology: 'Internet → DMZ → Core → Users / Servers / Management / Guest',
    prerequisites: ['Complete Phase 3'],
    steps: [
      {
        id: 's0',
        instruction: 'List the security zones with their trust levels and networks.',
        command: 'show zones',
        expected: 'Seven zones from Internet (trust 0) to Management (trust 95).',
      },
      {
        id: 's1',
        instruction: 'Inspect the perimeter boundary and note the four controls stacked there.',
        command: 'inspect boundary internet-dmz',
        expected: 'Firewall, WAF, reverse proxy, and inline IPS.',
      },
      {
        id: 's2',
        instruction: 'Inspect the DMZ-to-Core boundary and note the direction rule.',
        command: 'inspect boundary dmz-core',
        expected: 'DMZ hosts may never initiate a connection into the Core.',
      },
      {
        id: 's3',
        instruction: 'Inspect the steepest trust boundary in the design.',
        command: 'inspect boundary users-management',
        expected: 'Deny-all, jump host with MFA, privileged access workstation.',
      },
    ],
    expectedResults: [
      'Seven zones enumerated and ordered by trust',
      'Perimeter control stack identified',
      'DMZ direction-of-initiation rule understood',
      'Steepest trust delta matched to the strictest control',
    ],
    verification: [
      'Learner can order the zones by trust level',
      'Learner can explain what a DMZ contains rather than protects',
      'Learner can explain why Users-to-Management is deny-all rather than a port list',
    ],
    troubleshooting: [
      'Zones feel arbitrary → they express how much you assume about what is inside, not department or importance.',
      'Unsure why direction matters → a proxy forwarding inbound is safe; a DMZ host dialling inward is a foothold.',
    ],
    challenge:
      'Guest sits at trust 5, only slightly above the Internet. Write three sentences justifying that placement to a manager who thinks guests are "our visitors, so basically internal".',
    evidence: [
      {
        id: 'ev0',
        label: 'Zone inventory',
        type: 'report',
        placeholder: 'Zone, trust, VLAN, network, role, key rule',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A boundary exists wherever trust changes, and the size of the trust change should determine how strict the control is. The steepest delta in this design gets a deny-all rule, not a carefully curated port list.',
  },

  {
    id: 'p4-lab-1',
    phaseId: 'phase-4',
    title: 'Place the Boundary Controls',
    objective:
      'Distinguish IDS, IPS, WAF, and proxies by placement and capability, and justify a control choice for a described constraint.',
    securityConcepts: ['IDS', 'IPS', 'WAF', 'Proxy', 'Control placement'],
    environment: 'Deterministic simulator — prepared reference artifacts, nothing is executed',
    topology: 'Perimeter and internal boundaries of the reference architecture',
    prerequisites: ['Complete "Map the Security Zones"'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare the three inspection controls by placement and capability.',
        command: 'compare ids ips waf',
        expected: 'IDS out of band detects only; IPS inline can block; WAF is HTTP-aware.',
      },
      {
        id: 's1',
        instruction: 'Review the full control stack at the perimeter.',
        command: 'inspect boundary internet-dmz',
        expected: 'Four controls, with the WAF dependent on the proxy terminating TLS.',
      },
      {
        id: 's2',
        instruction: 'Read the inter-zone policy matrix.',
        command: 'show segmentation policy',
        expected: 'Rows initiate, columns receive; Guest has exactly one permitted destination.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the encrypted traffic problem from Phase 1.',
        command: 'curl -i https://srv-01.lab.local',
        expected:
          'TLS response — content invisible to anything that has not terminated the session.',
      },
    ],
    expectedResults: [
      'IDS, IPS, and WAF distinguished by placement',
      'Control dependency understood: WAF requires terminated TLS',
      'Policy matrix read by rows and by columns',
      'Encryption constraint on inspection connected to Phase 1',
    ],
    verification: [
      'Learner can state why an IDS cannot block',
      'Learner can explain what a WAF sees that a firewall cannot',
      'Learner can justify IDS on a critical segment and IPS at the perimeter',
    ],
    troubleshooting: [
      'IDS vs IPS confusion → ask where the device sits. Out of band means a copy; inline means the real traffic.',
      'Wondering why the WAF is listed after the proxy → it cannot inspect what it cannot decrypt.',
    ],
    challenge:
      'A hospital refuses any risk of a false positive interrupting clinical systems, but wants visibility on that segment. Write the design you would propose in four sentences, naming the control, its placement, and the trade-off you are accepting.',
    evidence: [
      {
        id: 'ev0',
        label: 'Control placement rationale',
        type: 'report',
        placeholder: 'Control, placement, what it sees, what it can do, trade-off',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Placement determines capability. An IDS cannot break your network and cannot stop an attack; an IPS can do both. Neither is the right answer in the abstract — the right answer depends on what an outage costs the organisation relative to a breach.',
  },

  {
    id: 'p4-lab-2',
    phaseId: 'phase-4',
    title: 'Trace Flows Across Zone Boundaries',
    objective:
      'Follow a permitted flow and a denied flow across the architecture, and explain why one is filtered and the other has no path at all.',
    securityConcepts: [
      'Segmentation enforcement',
      'Routing as a control point',
      'NAC',
      'Zero Trust',
    ],
    environment: 'Deterministic simulator — prepared flow traces, nothing is executed',
    topology: 'WS-01 (Users) → SRV-01 (Servers); guest device (Guest) → SRV-01',
    prerequisites: ['Complete "Place the Boundary Controls"'],
    steps: [
      {
        id: 's0',
        instruction: 'Trace a permitted flow from a workstation to an application server.',
        command: 'trace flow users servers',
        expected: 'Seven steps; policy applies at step 4 because step 3 routed the traffic.',
      },
      {
        id: 's1',
        instruction: 'Trace a denied flow from the guest network to the same server.',
        command: 'trace flow guest servers',
        expected: 'Denied at layer 3 — no route exists, so the firewall is never consulted.',
      },
      {
        id: 's2',
        instruction: 'Compare against the Phase 1 connection path on a flat network.',
        command: 'trace connection ws-01 srv-01',
        expected: 'The same nine-step path, now with zones and VLAN policy layered on.',
      },
      {
        id: 's3',
        instruction: 'Confirm the routing behaviour that makes inter-VLAN policy possible.',
        command: 'route print',
        expected: 'Default route via the firewall; non-local traffic must be routed.',
      },
    ],
    expectedResults: [
      'Permitted flow traced with the policy decision point identified',
      'Denied flow shown failing at routing rather than at the firewall',
      'Phase 1 path connected to Phase 4 zoning',
      'Routing understood as the enabler of segmentation policy',
    ],
    verification: [
      'Learner can identify the step at which inter-VLAN policy applies',
      'Learner can explain why the guest denial never reaches the firewall',
      'Learner can explain why same-VLAN traffic escapes policy entirely',
    ],
    troubleshooting: [
      'Confused why the guest flow shows no firewall entry → there is no path to filter, so no rule is evaluated.',
      'Unsure how this differs from Phase 1 → same path, with zone boundaries and VLAN policy added.',
    ],
    challenge:
      'Explain in three sentences why the absence of a route is a stronger control than a deny rule, then name one situation where you would still want the deny rule as well and say why.',
    evidence: [
      {
        id: 'ev0',
        label: 'Flow comparison',
        type: 'report',
        placeholder: 'Flow, path taken, decision point, outcome, control responsible',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Segmentation works because it forces routing, and routing creates a place to attach policy. Traffic that stays inside one VLAN never meets a rule — which is why "we have a firewall" says nothing about whether internal traffic is controlled.',
  },

  {
    id: 'p4-lab-3',
    phaseId: 'phase-4',
    title: 'Review the Architecture for Resilience and Deception',
    objective:
      'Identify single points of failure in the reference design and evaluate the deception assets deployed across the zones.',
    securityConcepts: ['High availability', 'Redundancy', 'Single point of failure', 'Honeypots'],
    environment: 'Deterministic simulator — prepared architecture artifacts, nothing is executed',
    topology: 'Full reference architecture with availability and deception layers',
    prerequisites: ['Complete "Trace Flows Across Zone Boundaries"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the availability design and find the single points of failure.',
        command: 'show high availability',
        expected: 'Two findings: single domain controller and single ISP link.',
      },
      {
        id: 's1',
        instruction: 'Review the deception assets and the alert they produced.',
        command: 'show honeypot',
        expected: 'Two honeypots and a honeynet; HP-02 recorded overnight SMB enumeration.',
      },
      {
        id: 's2',
        instruction: 'Confirm which zone the probing host belongs to.',
        command: 'show zones',
        expected: '192.168.30.44 falls in the Users VLAN 30 range.',
      },
      {
        id: 's3',
        instruction: 'Check what a Users-segment host is permitted to reach.',
        command: 'show segmentation policy',
        expected: 'Users may reach Servers on 443 and 389 only — not SMB.',
      },
    ],
    expectedResults: [
      'Two single points of failure identified',
      'Deception assets and their placement understood',
      'The probing host attributed to a zone',
      'The probe recognised as outside permitted policy',
    ],
    verification: [
      'Learner can distinguish redundancy from high availability',
      'Learner can explain why the domain controller is the more serious finding',
      'Learner can explain why a honeypot alert has a near-zero false-positive rate',
    ],
    troubleshooting: [
      'Unsure why availability is a security concern → it is the A in CIA; ransomware and DoS attack it directly.',
      'Honeypot value unclear → nothing legitimate touches it, so any interaction is high-confidence.',
    ],
    challenge:
      'Write the architecture review: the two single points of failure with their business impact, a remediation for each, and a triage note on the HP-02 alert stating what you know, what you infer, and what you would check next.',
    evidence: [
      {
        id: 'ev0',
        label: 'Architecture review',
        type: 'report',
        placeholder: 'Finding, impact, remediation; plus the honeypot triage note',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Two lessons converge here. Availability findings are security findings, because an attacker only needs to break the thing with no spare. And the most useful detection in the whole architecture is the cheapest: a decoy nothing should ever touch.',
  },
];

export const PHASE_4: Phase = {
  id: 'phase-4',
  number: 4,
  title: 'Security Architecture',
  description:
    'The topology the earlier phases have been implicitly describing. Zones and segmentation, the boundary controls that enforce them, Zero Trust and NAC, deception, and the resilience that makes availability a security property.',
  examDomain: 'Security Architecture',
  scene: 'zones',
  lessons: LESSONS,
  labs: LABS,
};
