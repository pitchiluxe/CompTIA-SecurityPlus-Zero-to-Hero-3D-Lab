import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 21 — Wireshark & Packet Analysis
// Aligned with CompTIA Security+ SY0-701 (Domain 4: Security Operations)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Packet Capture Fundamentals: ARP, ICMP, TCP, UDP ----------

const LESSON_21_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p21-l1-s0',
    title: 'Concept — Reading a Packet Capture',
    body:
      'A packet capture tool like Wireshark presents traffic as a list: a frame number, timestamp, source and destination address, the identified protocol, frame length, and an "Info" summary describing the specific contents of that frame. The protocol column reflects the highest-layer dissector Wireshark recognises — a DNS query travels inside a UDP datagram, but Wireshark labels it "DNS," not "UDP," because it understands the application-layer content. Reading a capture is a skill of recognising these patterns quickly: the Info column alone is usually enough to identify what is happening in a given frame.',
  },
  {
    id: 'p21-l1-s1',
    title: 'Concept — ARP (Address Resolution Protocol)',
    body:
      'ARP resolves an IPv4 address to a MAC address on the local network segment: a host broadcasts "Who has 192.168.1.1? Tell 192.168.1.50," and the device holding that IP replies with its MAC address. ARP has no built-in authentication, which is exactly what makes ARP spoofing (poisoning) possible: an attacker sends forged ARP replies claiming to own the gateway\'s IP, redirecting victim traffic through the attacker\'s machine. The unmistakable sign in a capture: two different MAC addresses both claiming to be the same IP address within the same capture window.',
  },
  {
    id: 'p21-l1-s2',
    title: 'Concept — ICMP (Internet Control Message Protocol)',
    body:
      'ICMP carries control and diagnostic messages — most familiarly, the echo request/reply pair behind the ping utility. ICMP is legitimate and essential for network troubleshooting, but it is also abused: ICMP can be used for host discovery and network mapping during reconnaissance, and unusually large or frequent ICMP payloads can indicate ICMP tunnelling, smuggling data inside what looks like ordinary diagnostic traffic. Context matters — occasional pings are normal; a sustained flood of oversized ICMP packets to many hosts is not.',
  },
  {
    id: 'p21-l1-s3',
    title: 'Concept — TCP Fundamentals and Flags',
    body:
      'TCP is connection-oriented and reliable: it numbers every byte sent (sequence number), acknowledges what has been received (acknowledgement number), and uses control flags to manage connection state. SYN requests a new connection; ACK acknowledges received data; FIN requests a graceful close; RST abruptly terminates or refuses a connection; PSH tells the receiver to push buffered data up to the application immediately rather than waiting to fill a buffer. Reading the flag combination on a segment tells you exactly what stage of the connection\'s lifecycle you are looking at.',
  },
  {
    id: 'p21-l1-s4',
    title: 'Concept — The TCP Three-Way Handshake',
    body:
      'Before any application data flows, TCP establishes the connection with three segments: the client sends SYN (proposing its initial sequence number); the server responds SYN-ACK (acknowledging the client and proposing its own sequence number); the client responds ACK (acknowledging the server). Only after this exchange completes is the connection considered established. A SYN flood attack exploits this process directly: the attacker sends a high volume of SYN segments, often from spoofed source addresses, and never completes the handshake — each half-open connection consumes server resources waiting for an ACK that will never arrive, eventually exhausting the server\'s capacity to accept new legitimate connections.',
  },
  {
    id: 'p21-l1-s5',
    title: 'Concept — UDP (User Datagram Protocol)',
    body:
      'UDP is connectionless: it sends datagrams with no handshake, no guaranteed delivery, and no built-in ordering — the sender fires and moves on. This trade-off favours speed over reliability, which is why UDP underlies DNS (fast lookups tolerate an occasional retry), DHCP (a broadcast-based bootstrap process), and real-time media like voice and video (a dropped frame is preferable to an old, delayed one). In a capture, a UDP-carried protocol is almost always identified by its application-layer dissector (DNS, DHCP) rather than shown as bare "UDP," which typically only appears for traffic Wireshark cannot further identify.',
  },
  {
    id: 'p21-l1-s6',
    title: 'Example — Spotting ARP spoofing in a capture',
    body:
      'A capture shows: ARP reply "192.168.1.1 is at AA:BB:CC:00:00:01" from one frame, followed shortly by ARP reply "192.168.1.1 is at AA:BB:CC:00:00:99" from a different frame — two different MAC addresses claiming ownership of the same gateway IP, in the same short window. This is not a coincidence or misconfiguration that resolves itself; it is the specific signature of an active ARP spoofing attempt, and it warrants immediate investigation of both source MAC addresses.',
  },
  {
    id: 'p21-l1-s7',
    title: 'Review — What must stick',
    body:
      'The Info column in a packet list is usually sufficient to identify what a frame is doing without deep protocol expertise. ARP has no authentication, making spoofing possible — the tell is two MACs claiming one IP. ICMP is legitimate diagnostic traffic that can also be abused for recon or tunnelling. TCP flags (SYN, ACK, FIN, RST, PSH) describe connection lifecycle stage. The three-way handshake (SYN → SYN-ACK → ACK) must complete before data flows, and a SYN flood specifically exploits the gap between SYN and completion. UDP trades reliability for speed and underlies DNS, DHCP, and real-time media.',
  },
];

const LESSON_21_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p21-q0',
    type: 'mcq',
    stem: 'What information does the "Protocol" column in a Wireshark packet list typically show for a DNS query travelling inside a UDP datagram?',
    options: [
      '"DNS" — Wireshark labels the frame by the highest-layer protocol it can identify, not the underlying transport alone',
      '"UDP" — Wireshark never identifies application-layer protocols',
      '"TCP" — all name resolution traffic uses TCP',
      'Nothing — DNS traffic cannot be seen in a packet capture',
    ],
    answer: 0,
    explanation:
      'Wireshark\'s protocol column reflects the highest-layer dissector it recognises; a DNS query over UDP is labelled "DNS," not "UDP."',
    domain: 'Security Operations',
    conceptId: 'packet-capture-basics',
  },
  {
    id: 'p21-q1',
    type: 'mcq',
    stem: 'What makes ARP spoofing possible at a protocol level?',
    options: [
      'ARP has no built-in authentication, so any device can claim to own any IP address on the local segment',
      'ARP requires a signed certificate for every reply',
      'ARP is encrypted, which paradoxically makes it easier to spoof',
      'ARP spoofing is not actually possible on modern networks',
    ],
    answer: 0,
    explanation:
      'ARP replies are trusted with no authentication mechanism, allowing an attacker to send forged replies claiming ownership of an IP (typically the gateway) that does not belong to them.',
    domain: 'Security Operations',
    conceptId: 'arp',
  },
  {
    id: 'p21-q2',
    type: 'mcq',
    stem: 'What is the unmistakable sign of ARP spoofing visible in a packet capture?',
    options: [
      'Two different MAC addresses both respond as the owner of the same IP address within the same capture window',
      'A single MAC address responding consistently to ARP requests',
      'ARP requests that receive no reply at all',
      'ARP traffic that uses TCP instead of a broadcast'
    ],
    answer: 0,
    explanation:
      'Conflicting ARP replies claiming the same IP from different MAC addresses is the specific signature of active ARP spoofing.',
    domain: 'Security Operations',
    conceptId: 'arp',
  },
  {
    id: 'p21-q3',
    type: 'mcq',
    stem: 'Besides network troubleshooting (ping), how can ICMP be abused?',
    options: [
      'For host discovery/reconnaissance and for tunnelling data covertly inside oversized or unusual ICMP payloads',
      'ICMP cannot be used for anything other than ping',
      'ICMP always requires a TCP handshake first',
      'ICMP is only used by DNS servers',
    ],
    answer: 0,
    explanation:
      'ICMP can be used to sweep a network for live hosts during reconnaissance, and unusually large/frequent ICMP traffic can indicate data smuggled via ICMP tunnelling.',
    domain: 'Security Operations',
    conceptId: 'icmp',
  },
  {
    id: 'p21-q4',
    type: 'mcq',
    stem: 'What is the purpose of the TCP three-way handshake?',
    options: [
      'It establishes a synchronised, reliable connection between client and server before any application data is exchanged',
      'It encrypts all subsequent traffic on the connection',
      'It is only used for UDP-based protocols',
      'It replaces the need for any IP addressing',
    ],
    answer: 0,
    explanation:
      'The handshake (SYN, SYN-ACK, ACK) confirms both sides can send and receive and synchronises initial sequence numbers before data flows.',
    domain: 'Security Operations',
    conceptId: 'tcp-handshake',
  },
  {
    id: 'p21-q5',
    type: 'mcq',
    stem: 'Which TCP flag signals a request to abruptly terminate or refuse a connection, as opposed to a graceful close?',
    options: ['RST', 'FIN', 'SYN', 'PSH'],
    answer: 0,
    explanation:
      'RST forcibly resets or refuses a connection. FIN requests a graceful close; SYN initiates a new connection; PSH requests immediate delivery to the application.',
    domain: 'Security Operations',
    conceptId: 'tcp-flags',
  },
  {
    id: 'p21-q6',
    type: 'mcq',
    stem: 'Why does UDP favour speed over reliability compared to TCP?',
    options: [
      'It sends datagrams with no handshake, no guaranteed delivery, and no built-in ordering, which suits use cases like DNS lookups and real-time media',
      'UDP is actually slower than TCP in every case',
      'UDP always retransmits lost packets automatically, just like TCP',
      'UDP requires more overhead per packet than TCP',
    ],
    answer: 0,
    explanation:
      'UDP\'s lack of handshake and delivery guarantees reduces overhead, favouring speed for use cases like DNS and real-time media where occasional loss is more tolerable than delay.',
    domain: 'Security Operations',
    conceptId: 'udp',
  },
  {
    id: 'p21-q7',
    type: 'scenario',
    stem: 'A capture shows a rapid burst of SYN segments from dozens of different source IPs targeting one server\'s port 443, with no corresponding SYN-ACK completions ever appearing for those attempts. What does this pattern indicate?',
    options: [
      'A SYN flood attack, exploiting the gap between an initial SYN and a completed handshake to exhaust server resources',
      'A normal, healthy volume of legitimate HTTPS connections',
      'A DNS tunnelling attempt',
      'An ARP spoofing attack',
    ],
    answer: 0,
    explanation:
      'A high volume of SYN segments with no completed handshakes, often from spoofed or numerous sources, is the classic SYN flood denial-of-service pattern.',
    domain: 'Security Operations',
    conceptId: 'tcp-handshake',
  },
  {
    id: 'p21-q8',
    type: 'scenario',
    stem: 'An analyst sees a TCP segment with Seq=0 Ack=1 and both the SYN and ACK flags set. What stage of the connection does this represent?',
    options: [
      'The server\'s response in the three-way handshake, acknowledging the client\'s SYN while proposing its own sequence number',
      'The final step of a graceful connection close',
      'A retransmission of already-acknowledged data',
      'An abrupt connection reset',
    ],
    answer: 0,
    explanation:
      'SYN+ACK together, with an acknowledgement number one greater than the client\'s initial sequence number, is specifically the server\'s reply in the handshake.',
    domain: 'Security Operations',
    conceptId: 'tcp-handshake',
  },
  {
    id: 'p21-q9',
    type: 'scenario',
    stem: 'A capture shows a workstation sending an unusually high volume of oversized ICMP echo requests to many different external hosts in a short period, none of which appear to be normal user-initiated pings. What should an analyst consider?',
    options: [
      'This pattern is consistent with network reconnaissance (host discovery) or potential ICMP tunnelling, and warrants further investigation',
      'This is always completely normal background network noise requiring no action',
      'ICMP traffic can never be malicious under any circumstances',
      'This can only be explained by a misconfigured printer',
    ],
    answer: 0,
    explanation:
      'A high-volume, oversized, sustained pattern of ICMP traffic to many hosts departs from normal diagnostic ping usage and is consistent with recon sweeping or covert tunnelling.',
    domain: 'Security Operations',
    conceptId: 'icmp',
  },
  {
    id: 'p21-q-pbq',
    type: 'pbq',
    stem: 'Order the TCP three-way handshake events.',
    options: [
      'Client sends SYN',
      'Server replies with SYN-ACK',
      'Client sends ACK',
      'Connection is established',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'The client opens, the server acknowledges and opens its side, the client acknowledges the server\'s sequence, and the connection is ready for data.',
    domain: 'Security Operations',
    conceptId: 'tcp-handshake',
  },
];

// ---------- Lesson 2: Application-Layer Protocols & Following Conversations ----------

const LESSON_21_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p21-l2-s0',
    title: 'Concept — DNS in a Packet Capture',
    body:
      'A DNS query/response pair in a capture shows the query name, record type (A for IPv4, AAAA for IPv6, MX for mail, TXT for arbitrary text), and the response\'s answer(s). Most DNS traffic is unremarkable: short, human-readable domain names resolved quickly. DNS tunnelling — using DNS queries to smuggle data in or out past network controls that only inspect DNS superficially — shows a distinct pattern: an unusually high volume of TXT (or similarly flexible) record queries to a single external domain, each query containing a long, random-looking subdomain that is actually encoded data rather than a real hostname.',
  },
  {
    id: 'p21-l2-s1',
    title: 'Concept — DHCP in a Packet Capture',
    body:
      'DHCP follows the DORA process: Discover (client broadcasts, seeking any DHCP server), Offer (a server proposes an IP lease), Request (the client formally asks for that offered lease), Acknowledge (the server confirms). All four steps are typically broadcast, since the client has no IP yet. The security concern: a rogue DHCP server can respond to Discover broadcasts faster than the legitimate server, handing out a lease that points the client\'s default gateway and DNS server at attacker-controlled infrastructure — the client accepts it as ordinary network configuration with no visible warning.',
  },
  {
    id: 'p21-l2-s2',
    title: 'Concept — HTTP in a Packet Capture',
    body:
      'HTTP is entirely cleartext: the method (GET, POST), the requested URI, headers, and — critically — the request or response body are all readable directly in the capture with no decryption required. This is why submitting a login form over plain HTTP is a severe finding: an analyst (or an attacker with capture access) can read the username and password directly out of the POST body. The remediation is not a packet-analysis technique — it is ensuring the application never accepts credentials over unencrypted HTTP in the first place.',
  },
  {
    id: 'p21-l2-s3',
    title: 'Concept — TLS in a Packet Capture',
    body:
      'A TLS-protected conversation still shows a visible handshake: ClientHello (proposing supported TLS versions and cipher suites, and — via the Server Name Indication extension — which hostname the client is trying to reach, even before the session is encrypted) and ServerHello (the server\'s chosen version and cipher). After the handshake completes, all subsequent Application Data is encrypted and shows only as opaque ciphertext in the capture — this is exactly why TLS protects the login credentials that plain HTTP exposes. A finding worth flagging: a ClientHello or ServerHello negotiating an old, deprecated TLS version (or a weak cipher suite) rather than TLS 1.2 or 1.3.',
  },
  {
    id: 'p21-l2-s4',
    title: 'Concept — Following a TCP Stream / Conversation',
    body:
      'A single request/response exchange is almost never contained in one packet — it is spread across many TCP segments, interleaved with ACKs, possibly out of order on the wire even though TCP reassembles them correctly. Wireshark\'s "Follow TCP Stream" feature reconstructs all packets belonging to one conversation into a single, readable transcript — showing the full HTTP request and response, or the full cleartext exchange, without the analyst manually piecing together dozens of individual frames. This is the practical tool that turns "I can see individual packets" into "I can read what actually happened in this conversation."',
  },
  {
    id: 'p21-l2-s5',
    title: 'Example — Following a stream reveals a cleartext credential',
    body:
      'An analyst notices a TCP conversation on port 80 to an internal HR portal. Following the stream reveals: GET /login HTTP/1.1 followed shortly by POST /login HTTP/1.1 with a body containing username=jsmith&password=Summer2026!. The three-way handshake completed normally, the HTTP request itself is unremarkable in isolation — but following the full stream is what surfaces the actual finding: a real employee credential transmitted in plaintext, readable by anyone positioned to capture that traffic segment.',
  },
  {
    id: 'p21-l2-s6',
    title: 'Review — What must stick',
    body:
      'DNS tunnelling shows as high-volume, random-looking TXT queries to one external domain. A rogue DHCP Offer from an unrecognised server address is a serious finding — DHCP has no built-in server authentication. HTTP is entirely cleartext, making credential submission over HTTP a critical finding by itself. TLS\'s handshake (including the SNI hostname) is visible, but Application Data after the handshake is encrypted — this is exactly what protects credentials that HTTP exposes. Following a TCP stream reconstructs a full conversation from many individual packets, which is often what surfaces the actual evidence.',
  },
];

const LESSON_21_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p21-q10',
    type: 'mcq',
    stem: 'What DNS record type is most associated with DNS tunnelling due to its flexibility for carrying arbitrary text data?',
    options: ['TXT', 'A', 'MX', 'PTR'],
    answer: 0,
    explanation:
      'TXT records can hold arbitrary text, making them a common vehicle for encoding smuggled data in DNS tunnelling, compared to the more rigid A/AAAA/MX record types.',
    domain: 'Security Operations',
    conceptId: 'dns-capture',
  },
  {
    id: 'p21-q11',
    type: 'mcq',
    stem: 'What are the four steps of the DHCP process, in order?',
    options: [
      'Discover, Offer, Request, Acknowledge (DORA)',
      'Request, Offer, Discover, Acknowledge',
      'Offer, Discover, Acknowledge, Request',
      'Discover, Acknowledge, Offer, Request',
    ],
    answer: 0,
    explanation:
      'DORA: the client broadcasts Discover, a server responds with an Offer, the client formally sends a Request for that lease, and the server confirms with an Acknowledge.',
    domain: 'Security Operations',
    conceptId: 'dhcp-capture',
  },
  {
    id: 'p21-q12',
    type: 'mcq',
    stem: 'Why is submitting login credentials over plain HTTP considered a critical finding?',
    options: [
      'HTTP is entirely cleartext, so the username and password are directly readable in the captured request body',
      'HTTP always encrypts the request body automatically',
      'This is only a concern if the server uses an outdated operating system',
      'HTTP credentials are hashed automatically by the browser',
    ],
    answer: 0,
    explanation:
      'HTTP transmits everything, including request bodies, in cleartext — anyone capturing the traffic can read submitted credentials directly.',
    domain: 'Security Operations',
    conceptId: 'http-capture',
  },
  {
    id: 'p21-q13',
    type: 'mcq',
    stem: 'What information is visible in a TLS ClientHello even before the encrypted session begins?',
    options: [
      'The proposed TLS version(s), cipher suites, and — via the SNI extension — the hostname the client is trying to reach',
      'The plaintext application data that will later be exchanged',
      'The user\'s password',
      'Nothing at all is visible; ClientHello is fully encrypted',
    ],
    answer: 0,
    explanation:
      'ClientHello is sent before encryption is established, so its contents — including proposed versions, ciphers, and the SNI hostname — are visible in a capture.',
    domain: 'Security Operations',
    conceptId: 'tls-capture',
  },
  {
    id: 'p21-q14',
    type: 'mcq',
    stem: 'What does Wireshark\'s "Follow TCP Stream" feature do?',
    options: [
      'It reassembles all packets belonging to one TCP conversation into a single, readable transcript of the full exchange',
      'It automatically blocks suspicious traffic',
      'It decrypts TLS traffic without a key',
      'It deletes all other packets not part of the selected conversation',
    ],
    answer: 0,
    explanation:
      'Follow TCP Stream reconstructs the full request/response conversation from many individual segments into one readable view, without deleting or altering the original capture.',
    domain: 'Security Operations',
    conceptId: 'follow-stream',
  },
  {
    id: 'p21-q15',
    type: 'scenario',
    stem: 'An analyst notices a workstation sending hundreds of DNS TXT queries per minute to a single external domain, each with a long, random-looking subdomain string. What should this indicate?',
    options: [
      'A likely DNS tunnelling attempt, using DNS as a covert channel for data exfiltration or command and control',
      'Completely normal DNS resolution behaviour requiring no further review',
      'A DHCP misconfiguration',
      'An ARP spoofing attempt',
    ],
    answer: 0,
    explanation:
      'High-volume TXT queries with long, random subdomains to one external domain is the specific pattern associated with DNS tunnelling.',
    domain: 'Security Operations',
    conceptId: 'dns-capture',
  },
  {
    id: 'p21-q16',
    type: 'scenario',
    stem: 'A client on the network receives a DHCP Offer from an IP address that does not match the organisation\'s known, authorised DHCP server. What risk does this represent?',
    options: [
      'A rogue DHCP server could be redirecting the client\'s default gateway or DNS server to attacker-controlled infrastructure',
      'This is always a harmless duplicate of the legitimate server',
      'DHCP cannot be spoofed under any circumstances',
      'This only affects the client\'s hostname, nothing else',
    ],
    answer: 0,
    explanation:
      'DHCP has no built-in server authentication, so a rogue server\'s Offer — if accepted — can silently redirect a client\'s gateway and DNS settings to malicious infrastructure.',
    domain: 'Security Operations',
    conceptId: 'dhcp-capture',
  },
  {
    id: 'p21-q17',
    type: 'scenario',
    stem: 'An analyst captures a TLS session and, following the stream, sees the ClientHello, ServerHello, and then only opaque Application Data for the rest of the conversation. What does this confirm?',
    options: [
      'The handshake completed and the actual application content (including any credentials) is encrypted and not readable in this capture',
      'The entire conversation, including credentials, is fully readable in cleartext',
      'The connection failed and no data was exchanged',
      'This confirms the traffic must be malicious',
    ],
    answer: 0,
    explanation:
      'Seeing only opaque Application Data after a completed TLS handshake confirms encryption is protecting the actual content from being readable in the capture.',
    domain: 'Security Operations',
    conceptId: 'tls-capture',
  },
  {
    id: 'p21-q18',
    type: 'scenario',
    stem: 'An analyst reviewing individual packets cannot make sense of a fragmented HTTP exchange spread across a dozen TCP segments. What single action would most efficiently reveal the full request and response?',
    options: [
      'Follow the TCP stream for that conversation to see the reassembled full exchange in one readable view',
      'Delete the segments that appear out of order',
      'Assume the traffic is TLS-encrypted and cannot be read',
      'Manually recalculate every sequence number by hand before reading any content',
    ],
    answer: 0,
    explanation:
      'Following the TCP stream is exactly the tool designed to reassemble a fragmented conversation into one readable transcript, rather than manually correlating dozens of individual frames.',
    domain: 'Security Operations',
    conceptId: 'follow-stream',
  },
];

// ---------- Lab 1: Identify Protocols and Follow a TCP Conversation ----------

const LAB_21_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the packet capture overview to identify the protocols present.',
    command: 'show packet capture overview',
    expected: 'A packet list showing a mix of ARP, ICMP, TCP, UDP, DNS, DHCP, HTTP, and TLS frames.',
  },
  {
    id: 's1',
    instruction: 'Review the TCP handshake trace for one specific connection in the capture.',
    command: 'show tcp handshake trace',
    expected: 'A three-segment trace showing SYN, SYN-ACK, and ACK, with sequence/acknowledgement numbers.',
  },
  {
    id: 's2',
    instruction: 'Follow the TCP stream for the HTTP conversation in the capture.',
    command: 'show follow tcp stream',
    expected: 'A reassembled, readable transcript of the full HTTP request and response.',
  },
];

const LAB_21_0: Lab = {
  id: 'p21-lab-0',
  phaseId: 'phase-21',
  title: 'Identify Protocols and Follow a TCP Conversation',
  objective:
    'Review a simulated packet capture, identify the protocol represented by each frame, trace a complete TCP three-way handshake, and follow a TCP stream to reconstruct a full application-layer exchange.',
  securityConcepts: [
    'Protocol identification in a packet capture',
    'TCP flags and connection lifecycle',
    'The TCP three-way handshake',
    'Following a TCP stream/conversation',
  ],
  environment: 'Deterministic packet-capture simulator — prepared outputs only; no real capture is performed and no traffic is generated',
  topology: 'A simulated 60-second capture on a small office LAN, mixing ARP, ICMP, TCP, UDP, DNS, DHCP, HTTP, and TLS traffic',
  prerequisites: ['Complete Phase 1 (Computer, Network & Security Foundations)', 'Complete Phase 11 (Network Security)'],
  steps: LAB_21_0_STEPS,
  expectedResults: [
    'Every sampled frame correctly identified by protocol',
    'The three-way handshake correctly traced with sequence/acknowledgement numbers explained',
    'The full HTTP request/response correctly read from the followed stream',
  ],
  verification: [
    'Learner can identify the protocol from the Info column alone for each sampled frame',
    'Learner can explain what each of the three handshake segments accomplishes',
    'Learner can explain why following the stream was necessary versus reading individual segments',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure how to tell DNS from generic UDP → if Wireshark names an application-layer protocol (DNS, DHCP, HTTP, TLS), use that specific name, not the underlying transport.',
    'Confused about ACK numbers → an ACK number is always "the next byte I expect from you," which is why it equals the peer\'s sequence number plus the number of bytes just received.',
  ],
  challenge:
    'Write a one-paragraph explanation, suitable for a non-technical stakeholder, of what a three-way handshake is and why it happens before any webpage content can load.',
  evidence: [
    {
      id: 'ev0',
      label: 'Packet capture review transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Protocol and handshake summary',
      type: 'report',
      placeholder: 'Protocol identified per frame, and handshake step-by-step explanation',
    },
  ],
  securityLesson:
    'Protocol identification is the entry-level skill every packet analysis task depends on — you cannot recognise an anomaly in traffic you cannot first correctly categorise as normal.',
};

// ---------- Lab 2: Find Suspicious Traffic and Explain the Evidence ----------

const LAB_21_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the ARP table activity for signs of spoofing.',
    command: 'show arp table anomaly',
    expected: 'Two conflicting ARP replies for the same gateway IP from two different MAC addresses.',
  },
  {
    id: 's1',
    instruction: 'Review the DNS query log for signs of tunnelling.',
    command: 'show dns query log',
    expected: 'An unusually high volume of TXT queries with random-looking subdomains to one external domain.',
  },
  {
    id: 's2',
    instruction: 'Review a cleartext HTTP capture for exposed credentials.',
    command: 'show http cleartext capture',
    expected: 'A followed HTTP POST stream showing a username and password in plaintext.',
  },
  {
    id: 's3',
    instruction: 'Review the TCP traffic pattern for signs of a SYN flood.',
    command: 'show syn flood pattern',
    expected: 'A burst of SYN segments from many source IPs with no completed handshakes.',
  },
];

const LAB_21_1: Lab = {
  id: 'p21-lab-1',
  phaseId: 'phase-21',
  title: 'Find Suspicious Traffic and Explain the Evidence',
  objective:
    'Review four distinct suspicious traffic patterns in a simulated capture — ARP spoofing, DNS tunnelling, cleartext HTTP credentials, and a SYN flood — and write an evidence-based explanation for each.',
  securityConcepts: [
    'ARP spoofing detection',
    'DNS tunnelling detection',
    'Cleartext credential exposure',
    'SYN flood detection',
  ],
  environment: 'Deterministic packet-capture simulator — prepared outputs only',
  topology: 'The same simulated office LAN capture from Lab 1, now containing four distinct anomalies alongside normal background traffic',
  prerequisites: ['Complete Lab 1 (Identify Protocols and Follow a TCP Conversation)'],
  steps: LAB_21_1_STEPS,
  expectedResults: [
    'ARP spoofing correctly identified from conflicting MAC-to-IP claims',
    'DNS tunnelling correctly identified from the TXT query volume/pattern',
    'Cleartext credentials correctly identified in the followed HTTP stream',
    'A SYN flood correctly identified from unanswered SYN volume',
  ],
  verification: [
    'Learner can state the specific packet-level evidence supporting each of the four findings',
    'Learner can distinguish each anomaly from its "normal" counterpart shown elsewhere in the capture',
    'Learner can recommend an appropriate response for each finding (not just describe it)',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure how to distinguish a real attack from noise → ask what a legitimate version of this traffic would look like, and compare — e.g., normal DNS is short, varied, human-readable domains, not one domain with hundreds of random-looking TXT lookups.',
    'Confused about writing "evidence-based" explanations → always cite the specific field or pattern (e.g., "two ARP replies for 192.168.1.1 from different MACs at 02:14:01Z and 02:14:03Z"), not just a conclusion.',
  ],
  challenge:
    'Write a one-page incident note: for each of the four findings, state the evidence, the likely attacker objective, and one specific, immediate containment action.',
  evidence: [
    {
      id: 'ev0',
      label: 'Suspicious traffic review transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Evidence-based findings note',
      type: 'report',
      placeholder: 'Evidence, likely objective, and containment action for each of the four findings',
    },
  ],
  securityLesson:
    'A finding is only as strong as the evidence cited for it. "This looks suspicious" convinces no one; "two MAC addresses claimed 192.168.1.1 within four seconds of each other" is what a report, a ticket, and a courtroom all require.',
};

// ---------- Lessons ----------

const LESSON_21_L1: Lesson = {
  id: 'p21-lesson-0',
  phaseId: 'phase-21',
  title: 'Packet Capture Fundamentals: ARP, ICMP, TCP, UDP',
  objectives: [
    'Read a packet capture\'s protocol and info columns to identify what a frame is doing',
    'Explain ARP and recognise the signature of ARP spoofing',
    'Explain ICMP\'s legitimate use and its potential abuse',
    'Explain TCP flags and the three-way handshake',
    'Explain UDP and why it favours speed over reliability',
  ],
  sections: LESSON_21_L1_SECTIONS,
  quiz: LESSON_21_L1_QUIZ,
  concepts: [
    'packet-capture-basics',
    'arp',
    'icmp',
    'tcp-handshake',
    'tcp-flags',
    'udp',
  ],
  homework:
    'Open a sample capture and find one complete TCP three-way handshake. Write down the flags and sequence numbers at each of the three steps.',
  careerConnection:
    'Network/SOC Analyst — reading a raw packet capture confidently, without waiting for a tool to summarise it, is one of the clearest signals of a capable Tier 2 SOC analyst.',
};

const LESSON_21_L2: Lesson = {
  id: 'p21-lesson-1',
  phaseId: 'phase-21',
  title: 'Application-Layer Protocols & Following Conversations',
  objectives: [
    'Recognise DNS traffic in a capture and identify signs of DNS tunnelling',
    'Explain the DHCP DORA process and recognise a rogue DHCP server',
    'Explain why HTTP is fully readable in a capture and the risk of cleartext credentials',
    'Explain what is visible versus encrypted in a TLS-protected conversation',
    'Use TCP stream following to reconstruct a full application-layer exchange',
  ],
  sections: LESSON_21_L2_SECTIONS,
  quiz: LESSON_21_L2_QUIZ,
  concepts: [
    'dns-capture',
    'dhcp-capture',
    'http-capture',
    'tls-capture',
    'follow-stream',
  ],
  homework:
    'In a sample capture, follow one DNS query through to the connection it enabled. Write the story of that conversation in four sentences.',
  careerConnection:
    'Packet/Traffic Analyst — the ability to follow a stream and produce evidence-cited findings (not vague suspicion) is exactly what separates a packet analysis report a manager can act on from one that gets ignored.',
};

// ---------- Phase export ----------

export const PHASE_21: Phase = {
  id: 'phase-21',
  number: 21,
  title: 'Wireshark & Packet Analysis',
  description:
    'Master reading a packet capture: ARP, ICMP, TCP (flags and the three-way handshake), UDP, DNS, DHCP, HTTP, and TLS, then apply that skill to identify protocols, follow full conversations, find suspicious traffic (ARP spoofing, DNS tunnelling, cleartext credentials, SYN floods), and explain the evidence.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: [LESSON_21_L1, LESSON_21_L2],
  labs: [LAB_21_0, LAB_21_1],
};
