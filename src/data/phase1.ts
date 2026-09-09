import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 1 — Computer, Network & Security Foundations
// Aligned with CompTIA Security+ SY0-701
//
// Teaching loop per lesson: concept -> example -> scenario -> review.
// Labs then apply it, the challenge stretches it, the quiz assesses it.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p1-lesson-0',
    phaseId: 'phase-1',
    title: 'Computers, Operating Systems and Processes',
    objectives: [
      'Describe what an operating system does and why that matters for security',
      'Explain processes, users, and permissions as one connected model',
      'Read a Linux permission string and a Windows ACL',
      'Identify least privilege and privilege separation in real output',
    ],
    concepts: ['os-fundamentals', 'processes', 'users-permissions', 'least-privilege'],
    homework:
      'On your own machine, list the ten processes using the most memory and identify what each one is for. Flag any you cannot account for — not as malware, but as a gap in your own baseline.',
    careerConnection:
      'SOC Analyst / Junior Sysadmin — every alert you triage names a process, a user, and a file. If those three words are fuzzy, the alert is unreadable.',
    sections: [
      {
        id: 'p1-l0-s0',
        title: 'Concept — What an operating system actually enforces',
        body: 'An OS is the referee between hardware and software. It decides which code runs, what memory it may touch, and which files it may open. Security is not a feature bolted on top of that — it is the same mechanism. When you hear "kernel mode" versus "user mode", that is the boundary that stops one program from reading another program\'s memory. Almost every privilege-escalation attack is an attempt to cross that line.',
      },
      {
        id: 'p1-l0-s1',
        title: 'Concept — Processes, users, and permissions are one model',
        body: 'A process is a running program. Every process runs as some user. That user has an identity (uid on Linux, SID on Windows) and group memberships. Files carry permissions that name users and groups. Put those together and you get the rule that governs everything: a process can do exactly what its user is permitted to do, no more. This is why "what account is this running as?" is the most useful question in incident response.',
      },
      {
        id: 'p1-l0-s2',
        title: 'Concept — Filesystems and permission models',
        body: 'Linux uses owner/group/other with read, write, execute — displayed as a ten-character string like -rwxr-xr-x. Windows uses ACLs: an ordered list of entries granting or denying specific rights to specific principals, with inheritance down the tree. Different syntax, same question: who can read this, who can change it, and who can run it.',
      },
      {
        id: 'p1-l0-s3',
        title: 'Example — Reading a permission string',
        body: 'In the lab, `ls -la /var/www` shows deploy.sh as -rwxrwxrwx. Break it apart: leading "-" means regular file; then rwx for owner (root), rwx for group (root), rwx for other (everyone else). Any user on the host can rewrite that script, and root runs it. That single character position is the whole finding.',
      },
      {
        id: 'p1-l0-s4',
        title: 'Scenario — Two accounts, one question',
        body: 'You are handed two hosts. On WS-01, `whoami` returns lab\\analyst1 and `net user analyst1` shows membership of Users only. On SRV-01, `id` returns groups including 27(sudo), and `sudo -l` shows exactly one permitted command. Neither account is an administrator, but both can do something privileged in a narrow way. That narrowness is the control. Your job when reviewing an account is to ask whether the narrowness still matches the job.',
      },
      {
        id: 'p1-l0-s5',
        title: 'Review — What must stick',
        body: 'Process runs as user; user has groups; files grant rights to users and groups. Linux shows this as rwx triplets, Windows as ACL entries with inheritance. Least privilege means the smallest set of rights that still lets the job get done. Privilege separation means splitting a program so the risky part runs with fewer rights — nginx master as root, workers as www-data.',
      },
    ],
    quiz: [
      {
        id: 'p1-q0',
        type: 'mcq',
        stem: 'A file listing shows: -rwxrwxrwx 1 root root 215 deploy.sh. What is the security concern?',
        options: [
          'The file is owned by root, which is always unsafe',
          'Any user can modify a script that root will execute',
          'The file is too small to be a real script',
          'Execute permission should never be set on any file',
        ],
        answer: 1,
        explanation:
          'Mode 777 grants write and execute to everyone. Any local user can rewrite the script, and it runs with root privileges when root executes it — a direct path to privilege escalation.',
        examClue:
          'When you see world-writable combined with privileged execution, the answer is almost always privilege escalation.',
        domain: 'Security Operations',
        conceptId: 'users-permissions',
      },
      {
        id: 'p1-q1',
        type: 'mcq',
        stem: 'nginx runs a master process as root and worker processes as www-data. What principle does this demonstrate?',
        options: [
          'Defence in depth',
          'Privilege separation',
          'Non-repudiation',
          'Fail-open design',
        ],
        answer: 1,
        explanation:
          'The privileged master binds the low port, then the workers that actually handle untrusted network input run unprivileged. Splitting a program so risky work runs with fewer rights is privilege separation.',
        domain: 'Security Architecture',
        conceptId: 'least-privilege',
      },
      {
        id: 'p1-q2',
        type: 'scenario',
        stem: 'During triage you find a process running as a service account whose shell in /etc/passwd is /bin/bash rather than /usr/sbin/nologin. Why is that worth investigating?',
        options: [
          'Service accounts cannot legitimately have any shell',
          'A service account with an interactive shell can be used for interactive logon, widening the attack surface',
          'It means the password hash is stored in /etc/passwd',
          'It always indicates the host is already compromised',
        ],
        answer: 1,
        explanation:
          'Service accounts do not need interactive logons. Giving one a real shell means anyone who obtains its credentials can log in directly. It is a hardening gap worth checking, not proof of compromise on its own.',
        domain: 'Security Operations',
        conceptId: 'users-permissions',
      },
      {
        id: 'p1-q3',
        type: 'mcq',
        stem: 'What does the "x" in the second field of an /etc/passwd line indicate?',
        options: [
          'The account is disabled',
          'The password hash is stored in /etc/shadow instead',
          'The account has no password',
          'The account is a system account',
        ],
        answer: 1,
        explanation:
          '/etc/passwd is world-readable, so hashes were moved to /etc/shadow, which is not. The x is a placeholder pointing there.',
        domain: 'General Security Concepts',
        conceptId: 'os-fundamentals',
      },
    ],
  },

  {
    id: 'p1-lesson-1',
    phaseId: 'phase-1',
    title: 'The Command Line on Windows and Linux',
    objectives: [
      'Run the equivalent triage command on either operating system',
      'Enumerate identity, processes, and connections from a shell',
      'Explain why command-line evidence beats screenshots',
    ],
    concepts: ['command-line', 'windows-basics', 'linux-basics', 'processes'],
    homework:
      'Pick five commands from this lesson and write the Windows and Linux equivalent side by side, with one sentence on what the output proves. Keep it as a reference card.',
    careerConnection:
      'Every SOC and IAM role assumes shell fluency. Interviews ask "how would you check X" and expect a command, not a description of a GUI.',
    sections: [
      {
        id: 'p1-l1-s0',
        title: 'Concept — Why the command line at all',
        body: 'A shell gives you three things a GUI does not: it is scriptable, it is repeatable, and its output is text you can store as evidence. When you write an incident report, "netstat -ano showed PID 6644 connected to 203.0.113.55:443" is verifiable. "I saw a suspicious connection in Task Manager" is not.',
      },
      {
        id: 'p1-l1-s1',
        title: 'Concept — The same questions, two dialects',
        body: 'Windows and Linux ask identical triage questions with different words. Who am I: `whoami` / `id`. What is running: `tasklist` / `ps aux`. What is my network config: `ipconfig /all` / `ip a`. What is listening or connected: `netstat -ano` / `ss -tulpn`. How do I reach the internet: `route print` / `ip route`. Learn the question first; the syntax is lookup.',
      },
      {
        id: 'p1-l1-s2',
        title: 'Example — A four-command baseline',
        body: 'On any host you have just been handed, run identity, then processes, then network config, then connections. Four commands and you can describe the host: who it runs as, what it is doing, where it sits, and who it talks to. Everything else in triage builds on that baseline.',
      },
      {
        id: 'p1-l1-s3',
        title: 'Scenario — Evidence that survives review',
        body: 'You escalate an incident. A week later, legal asks how you knew the connection was outbound to an external host. If you captured command output with timestamps, you can answer. If you did not, your finding is your memory. This is why labs on this platform push you to save transcripts to the evidence locker — the habit matters more than any single command.',
      },
      {
        id: 'p1-l1-s4',
        title: 'Review — What must stick',
        body: 'Identity, processes, network config, connections — in that order, on either OS. Capture the output, not a description of it. Know the pairs: whoami/id, tasklist/ps aux, ipconfig/ip a, netstat/ss, route print/ip route.',
      },
    ],
    quiz: [
      {
        id: 'p1-q4',
        type: 'mcq',
        stem: 'Which pair of commands answers the same question on Windows and Linux respectively?',
        options: [
          'ipconfig /all and ss -tulpn',
          'tasklist and ip route',
          'netstat -ano and ss -tulpn',
          'whoami and ps aux',
        ],
        answer: 2,
        explanation:
          'Both enumerate sockets — what is listening and what is connected. The other pairs mix unrelated questions.',
        domain: 'Security Operations',
        conceptId: 'command-line',
      },
      {
        id: 'p1-q5',
        type: 'pbq',
        stem: 'Order the four baseline triage commands for an unfamiliar host: [0] enumerate connections, [1] confirm identity, [2] list processes, [3] read network configuration.',
        options: [
          'Confirm identity',
          'List processes',
          'Read network configuration',
          'Enumerate connections',
        ],
        answer: [1, 2, 3, 0],
        explanation:
          'Identity first — it determines what everything else means. Then what is running, then where the host sits, then who it is talking to. Connections last, because attributing them needs the process list you already gathered.',
        domain: 'Security Operations',
        conceptId: 'command-line',
      },
      {
        id: 'p1-q6',
        type: 'scenario',
        stem: 'An analyst documents a finding as "I saw an odd connection in Task Manager." Why is this inadequate?',
        options: [
          'Task Manager cannot show network connections at all',
          'The observation is not reproducible or verifiable by anyone else',
          'GUI tools are less accurate than command-line tools',
          'Task Manager requires administrator rights',
        ],
        answer: 1,
        explanation:
          'Evidence has to be reviewable. Captured command output with a timestamp can be re-examined; a recollection of a GUI cannot. The GUI is not less accurate — it is less durable as evidence.',
        domain: 'Security Operations',
        conceptId: 'command-line',
      },
    ],
  },

  {
    id: 'p1-lesson-2',
    phaseId: 'phase-1',
    title: 'Networking Foundations — TCP/IP, Addressing, DNS and DHCP',
    objectives: [
      'Distinguish LAN from WAN and explain what a default gateway does',
      'Read an IPv4 address, subnet mask, and IPv6 address',
      'Explain DNS and DHCP and why both are security-relevant',
      'Map common ports to their protocols',
    ],
    concepts: ['tcp-ip', 'ip-addressing', 'dns', 'dhcp', 'ports-protocols'],
    homework:
      'Run ipconfig /all or ip addr on your own machine and write out your IP, mask, gateway, and DNS server. Then state which of those four would break which symptom if it were wrong.',
    careerConnection:
      'IAM and SOC work both assume you can read an IP plan. "Is this traffic internal?" is answered with a subnet mask, not a guess.',
    sections: [
      {
        id: 'p1-l2-s0',
        title: 'Concept — LAN, WAN, and the default gateway',
        body: 'A LAN is the network you are directly attached to; a WAN links networks across distance, the internet being the largest. A host decides which is which by comparing the destination against its own address and subnet mask. Same network, send directly. Different network, hand it to the default gateway. In our lab the default gateway is 192.168.1.1 — the firewall trust interface. That is why the firewall sees everything leaving the LAN.',
      },
      {
        id: 'p1-l2-s1',
        title: 'Concept — IPv4, subnet masks, and IPv6',
        body: '192.168.1.10 with mask 255.255.255.0 (/24) means the first three octets identify the network and the last identifies the host: everything 192.168.1.1–254 is local. IPv6 addresses are 128-bit and written in hex groups. Two ranges you will always see: fe80::/10 link-local, present on every interface automatically, and 2001:db8::/32, reserved for documentation. IPv6 is usually enabled even when nobody planned for it — an IPv6 path your firewall rules ignore is an unmonitored way in.',
      },
      {
        id: 'p1-l2-s2',
        title: 'Concept — DHCP and DNS',
        body: "DHCP hands out addressing automatically: address, mask, gateway, DNS server. DNS turns names into addresses. Both are trust decisions made before any traffic flows. A rogue DHCP server can make itself your gateway and see all your traffic. Poisoned DNS can send you to an attacker's address without touching the network path at all. This is why DNS query logs are among the highest-value telemetry a SOC collects.",
      },
      {
        id: 'p1-l2-s3',
        title: 'Concept — Ports and protocols',
        body: 'A port number identifies a service on a host. The ones Security+ expects on sight: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 143 IMAP, 389 LDAP, 443 HTTPS, 445 SMB, 636 LDAPS, 3389 RDP, 3306 MySQL, 5432 PostgreSQL. Note the pairs: 389/636 and 80/443 are the same service unencrypted and encrypted. Choosing the encrypted one is often the whole exam question.',
      },
      {
        id: 'p1-l2-s4',
        title: 'Example — Reading a routing table as a security control',
        body: '`route print` on WS-01 shows 0.0.0.0/0 via 192.168.1.1 and 192.168.1.0/24 on-link. Two rules: local traffic stays on the wire, everything else goes through the firewall. That single default route is what makes perimeter inspection possible. Remove it, or add a second path around it, and your monitoring has a blind spot.',
      },
      {
        id: 'p1-l2-s5',
        title: 'Scenario — Same LAN or not?',
        body: 'WS-01 (192.168.1.10/24) pings 192.168.1.30 and gets sub-millisecond replies with TTL 64. Same subnet by the mask, so no router hop — consistent with the timing. TTL 64 also hints the responder is a Linux stack, since Windows starts at 128. Small observations, but they let you sanity-check whether the network is behaving as documented.',
      },
      {
        id: 'p1-l2-s6',
        title: 'Review — What must stick',
        body: 'Mask decides local versus remote; default gateway carries everything remote. DHCP and DNS are pre-connection trust decisions and therefore attack targets. Know the port list, especially the encrypted/unencrypted pairs. IPv6 is on whether or not you planned for it.',
      },
    ],
    quiz: [
      {
        id: 'p1-q7',
        type: 'mcq',
        stem: 'A host is 192.168.1.10 with mask 255.255.255.0. Which destination is sent to the default gateway rather than directly?',
        options: ['192.168.1.1', '192.168.1.30', '192.168.1.254', '192.168.2.30'],
        answer: 3,
        explanation:
          'A /24 mask makes 192.168.1.0–255 local. 192.168.2.30 is a different network, so the host hands it to the default gateway.',
        examClue:
          'Subnetting questions are usually answered by comparing the network portion only. Do the mask first.',
        domain: 'Security Architecture',
        conceptId: 'ip-addressing',
      },
      {
        id: 'p1-q8',
        type: 'mcq',
        stem: 'Which port pair represents the same directory service unencrypted and encrypted?',
        options: ['80 and 443', '389 and 636', '22 and 23', '110 and 143'],
        answer: 1,
        explanation:
          'LDAP is 389; LDAPS is 636. 80/443 is HTTP/HTTPS — also a valid unencrypted/encrypted pair, but not a directory service. 22/23 are SSH and Telnet, different protocols. 110/143 are POP3 and IMAP, both mail retrieval.',
        domain: 'Security Architecture',
        conceptId: 'ports-protocols',
      },
      {
        id: 'p1-q9',
        type: 'scenario',
        stem: 'An attacker places a rogue DHCP server on the LAN that answers faster than the legitimate one. What is the most significant immediate risk?',
        options: [
          'Clients run out of IP addresses',
          'Clients accept an attacker-controlled default gateway and DNS server, putting the attacker on-path',
          'The legitimate DHCP server is permanently disabled',
          'Clients lose IPv6 connectivity',
        ],
        answer: 1,
        explanation:
          "DHCP supplies the gateway and DNS server, not just an address. Control those and you see and can redirect the client's traffic — an on-path position obtained without touching any router.",
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'dhcp',
      },
      {
        id: 'p1-q10',
        type: 'mcq',
        stem: 'Why is fe80::/10 present on interfaces nobody configured for IPv6?',
        options: [
          'It is a documentation range with no real traffic',
          'IPv6 link-local addresses are generated automatically on every enabled interface',
          'It is assigned by DHCP by default',
          'It indicates a misconfiguration',
        ],
        answer: 1,
        explanation:
          'Link-local addressing is automatic in IPv6. It matters for security because an IPv6 path can exist and carry traffic on a network whose firewall rules only consider IPv4.',
        domain: 'Security Architecture',
        conceptId: 'ip-addressing',
      },
    ],
  },

  {
    id: 'p1-lesson-3',
    phaseId: 'phase-1',
    title: 'Network Devices, Secure Protocols and the Connection Path',
    objectives: [
      'Explain what routers, switches, firewalls, and VPNs each do',
      'Contrast HTTP with HTTPS and Telnet with SSH from real output',
      'Trace a client-to-server connection end to end and name the control at each step',
    ],
    concepts: ['network-devices', 'secure-protocols', 'vpn', 'connection-path'],
    homework:
      'Draw the path a request from your browser takes to a public website, naming every device type it crosses and the protocol in use at each hop. Mark where TLS starts and ends.',
    careerConnection:
      'This path is the backbone of the rest of the course. Segmentation, IDS placement, Zero Trust, and incident scoping all attach to steps you learn here.',
    sections: [
      {
        id: 'p1-l3-s0',
        title: 'Concept — Switches, routers, firewalls',
        body: 'A switch forwards frames within one network using MAC addresses (Layer 2). A router moves packets between networks using IP addresses (Layer 3). A firewall is a router that also decides whether traffic is allowed, based on policy. The progression matters: switch asks "where is this MAC", router asks "which network", firewall asks "should this be permitted at all".',
      },
      {
        id: 'p1-l3-s1',
        title: 'Concept — VPNs',
        body: 'A VPN builds an encrypted tunnel across an untrusted network so remote traffic is treated as if it were internal. Two flavours: site-to-site links whole offices; remote-access connects one user. The security value is confidentiality and integrity in transit — but note the trade-off. A VPN extends your trusted network onto a laptop you may not control, which is exactly the assumption Zero Trust later challenges.',
      },
      {
        id: 'p1-l3-s2',
        title: 'Concept — Encrypted versus unencrypted protocols',
        body: 'Telnet, FTP, HTTP, and LDAP send credentials and content in cleartext. SSH, SFTP, HTTPS, and LDAPS do not. The exam tests this constantly, usually as "which should you use instead of X". The habit to build: whenever you name a protocol, name the port and say whether it is encrypted.',
      },
      {
        id: 'p1-l3-s3',
        title: 'Example — The same page over HTTP and HTTPS',
        body: 'In the lab, `curl -i http://srv-01.lab.local` returns Server: nginx/1.18.0 (Ubuntu) — an exact version, in cleartext, alongside the content. The HTTPS response trims the header to Server: nginx and adds Strict-Transport-Security. Two improvements: no cleartext, and less version disclosure. Compare those two responses and you have most of a web-hardening checklist.',
      },
      {
        id: 'p1-l3-s4',
        title: 'Concept — The connection path',
        body: 'User → Endpoint → Network → Server → Security Controls. Expanded: the user makes a request; the endpoint applies host policy; DNS resolves the name; ARP resolves the MAC; the switch forwards the frame; the firewall applies policy and logs the flow; the server accepts the connection; TLS negotiates; the response returns. Nine steps, each one a place to detect, block, or lose visibility.',
      },
      {
        id: 'p1-l3-s5',
        title: 'Scenario — Where would you have caught it?',
        body: 'Return to the Phase 0 incident: PowerShell on WS-01 talking to 203.0.113.55:443. Walk the path. Host policy allowed outbound 443. DNS resolved updates.example.net — the DNS log is a detection opportunity. The firewall permitted and logged the flow — a second opportunity. TLS hid the content, so payload inspection would not have helped. Detection here comes from metadata, not content. That conclusion is worth more than any single tool.',
      },
      {
        id: 'p1-l3-s6',
        title: 'Review — What must stick',
        body: 'Switch = Layer 2 MAC, router = Layer 3 IP, firewall = policy. VPN = encrypted tunnel plus an extended trust boundary. Know encrypted/unencrypted pairs on sight. And know the nine-step path well enough to say, for any incident, where it could have been seen.',
      },
    ],
    quiz: [
      {
        id: 'p1-q11',
        type: 'mcq',
        stem: 'At which layer does a switch make its forwarding decision, and using what address?',
        options: [
          'Layer 3, using IP addresses',
          'Layer 2, using MAC addresses',
          'Layer 4, using port numbers',
          'Layer 7, using hostnames',
        ],
        answer: 1,
        explanation:
          'Switches forward frames within a broadcast domain using MAC addresses at Layer 2. Routers use IP at Layer 3.',
        domain: 'Security Architecture',
        conceptId: 'network-devices',
      },
      {
        id: 'p1-q12',
        type: 'mcq',
        stem: 'A legacy system is administered over Telnet on port 23. What is the correct replacement and why?',
        options: [
          'FTP on port 21, because it supports file transfer',
          'SSH on port 22, because it encrypts credentials and session content',
          'HTTP on port 80, because it is more widely supported',
          'RDP on port 3389, because it provides a graphical interface',
        ],
        answer: 1,
        explanation:
          'Telnet sends credentials and session data in cleartext. SSH provides an encrypted, authenticated channel for the same job. FTP and HTTP are also cleartext; RDP solves a different problem.',
        domain: 'Security Architecture',
        conceptId: 'secure-protocols',
      },
      {
        id: 'p1-q13',
        type: 'scenario',
        stem: 'An endpoint holds a TLS session to an unfamiliar external host. Payload inspection reveals nothing because the traffic is encrypted. Which telemetry is most likely to support detection?',
        options: [
          'The contents of the encrypted payload',
          'Connection metadata: DNS queries, destination reputation, timing and volume patterns',
          'The endpoint screensaver settings',
          'The physical switch port LED status',
        ],
        answer: 1,
        explanation:
          'When content is unavailable, detection shifts to metadata — what name was resolved, what the destination is known for, and whether the timing looks like beaconing. This is why DNS and flow logs matter so much.',
        examClue:
          'If an option says "inspect the encrypted payload" with no mention of TLS interception, it is usually wrong.',
        domain: 'Security Operations',
        conceptId: 'connection-path',
      },
      {
        id: 'p1-q14',
        type: 'mcq',
        stem: 'What security trade-off does a remote-access VPN introduce?',
        options: [
          'It encrypts traffic but extends the trusted network onto a device the organisation may not fully control',
          'It prevents all malware from reaching the internal network',
          'It removes the need for authentication',
          'It makes internal traffic visible to the internet',
        ],
        answer: 0,
        explanation:
          'A VPN protects traffic in transit, but a compromised remote endpoint now sits inside the trust boundary. This assumption — that inside means trusted — is exactly what Zero Trust later removes.',
        domain: 'Security Architecture',
        conceptId: 'vpn',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p1-lab-0',
    phaseId: 'phase-1',
    title: 'Explore a Windows Endpoint',
    objective:
      'Build a complete profile of WS-01: operating system, domain membership, accounts, and file permissions.',
    securityConcepts: ['Host enumeration', 'Account review', 'NTFS permissions', 'Least privilege'],
    environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
    topology: 'WS-01 (Windows 11 Pro, 192.168.1.10, domain lab.local, logon server DC-01)',
    prerequisites: ['Complete Phase 0'],
    steps: [
      {
        id: 's0',
        instruction: 'Identify the operating system, build, and domain membership.',
        command: 'systeminfo',
        expected: 'Windows 11 Pro, build 22631, domain lab.local, logon server DC-01.',
      },
      {
        id: 's1',
        instruction: 'Confirm the identity you are operating as.',
        command: 'whoami',
        expected: 'lab\\analyst1.',
      },
      {
        id: 's2',
        instruction: 'Review the account: status, password policy, and group membership.',
        command: 'net user analyst1',
        expected: 'Active account, password expires, member of Users and Domain Users only.',
      },
      {
        id: 's3',
        instruction: 'Enumerate who holds local administrator rights.',
        command: 'net localgroup administrators',
        expected: 'Administrator and LAB\\Domain Admins — analyst1 is not present.',
      },
      {
        id: 's4',
        instruction: 'Inspect the permissions on a data directory.',
        command: 'icacls c:\\reports',
        expected: 'SYSTEM and Administrators hold full control; analyst1 has read and execute.',
      },
    ],
    expectedResults: [
      'OS, build, and domain recorded',
      'Operating identity confirmed as a standard user',
      'Local administrators enumerated',
      'Directory permissions read and interpreted',
    ],
    verification: [
      'Learner can state the OS build and domain',
      'Learner can say whether analyst1 is an administrator',
      'Learner can explain the difference between (F) and (RX) in the ACL',
    ],
    troubleshooting: [
      'Command not recognised → this is a closed allowlist, not a shell. Type help for the supported set.',
      'ACL syntax unclear → (OI) object inherit, (CI) container inherit, (F) full control, (RX) read and execute.',
    ],
    challenge:
      'Write the host profile a SOC would store in its asset inventory: hostname, OS build, domain, logon server, the operating account and its privilege level, and one permission observation. Six lines, no filler.',
    evidence: [
      {
        id: 'ev0',
        label: 'Windows host profile',
        type: 'report',
        placeholder: 'Hostname, OS build, domain, account, privilege level, permission note',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Enumeration is not an attacker-only activity. The defender who has enumerated their own hosts first is the one who notices when something changes.',
  },

  {
    id: 'p1-lab-1',
    phaseId: 'phase-1',
    title: 'Explore a Linux Endpoint',
    objective:
      'Build the same host profile on SRV-01 using Linux tooling, and find one permission defect.',
    securityConcepts: ['Linux enumeration', 'POSIX permissions', 'Service accounts', 'sudo scope'],
    environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
    topology: 'SRV-01 (Ubuntu 22.04, 192.168.1.30, nginx + sshd + loopback-bound PostgreSQL)',
    prerequisites: ['Complete "Explore a Windows Endpoint"'],
    steps: [
      {
        id: 's0',
        instruction: 'Identify the kernel and distribution.',
        command: 'uname -a',
        expected: 'Linux srv-01, kernel 5.15.0-91-generic, Ubuntu, x86_64.',
      },
      {
        id: 's1',
        instruction: 'Confirm your uid, gid, and supplementary groups.',
        command: 'id',
        expected: 'uid 1001 analyst1, member of group 27 (sudo).',
      },
      {
        id: 's2',
        instruction: 'Review the account list and note which accounts have interactive shells.',
        command: 'cat /etc/passwd',
        expected: 'Service accounts use nologin; postgres and analyst1 have /bin/bash.',
      },
      {
        id: 's3',
        instruction: 'Determine the exact scope of your sudo grant.',
        command: 'sudo -l',
        expected: 'One permitted command: systemctl restart nginx.',
      },
      {
        id: 's4',
        instruction: 'Inspect the web root permissions and find the defect.',
        command: 'ls -la /var/www',
        expected: 'deploy.sh is -rwxrwxrwx — world-writable and executable.',
      },
    ],
    expectedResults: [
      'Kernel and distribution recorded',
      'Identity and group membership confirmed',
      'Service accounts reviewed for interactive shells',
      'World-writable executable identified',
    ],
    verification: [
      'Learner can read a ten-character permission string',
      'Learner can name the world-writable file and explain the risk',
      'Learner can state the exact scope of the sudo grant',
    ],
    troubleshooting: [
      'Permission string confusing → read it as type, then owner, then group, then other, three characters each.',
      'Wondering why /etc/passwd has no hashes → they live in /etc/shadow, which is not world-readable.',
    ],
    challenge:
      'Write a two-sentence finding for deploy.sh: the observation, and the concrete remediation with the mode you would set instead. Justify the mode you choose.',
    evidence: [
      {
        id: 'ev0',
        label: 'Permission finding',
        type: 'report',
        placeholder: 'Observation, risk, remediation with target mode',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A single wrong character in a permission string can hand an attacker root. Hardening is largely the discipline of checking these small things consistently.',
  },

  {
    id: 'p1-lab-2',
    phaseId: 'phase-1',
    title: 'Inspect Processes on Both Platforms',
    objective:
      'Enumerate running processes on Windows and Linux, map them to accounts and services, and identify privilege separation.',
    securityConcepts: [
      'Process enumeration',
      'Process-to-account mapping',
      'Privilege separation',
      'LOLBins',
    ],
    environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
    topology: 'WS-01 (Windows) and SRV-01 (Linux)',
    prerequisites: ['Complete both endpoint exploration labs'],
    steps: [
      {
        id: 's0',
        instruction: 'List Windows processes and note anything running interactively.',
        command: 'tasklist',
        expected: 'powershell.exe PID 6644 in the Console session.',
      },
      {
        id: 's1',
        instruction: 'Map Windows processes to the services they host.',
        command: 'tasklist /svc',
        expected: 'lsass.exe hosts KeyIso, SamSs, VaultSvc; powershell.exe hosts no service.',
      },
      {
        id: 's2',
        instruction: 'List Linux processes with their owning accounts.',
        command: 'ps aux',
        expected: 'nginx master runs as root, workers as www-data.',
      },
      {
        id: 's3',
        instruction: 'Confirm which Linux services are reachable and which are not.',
        command: 'ss -tulpn',
        expected: 'sshd and nginx on 0.0.0.0; postgres on 127.0.0.1 only.',
      },
    ],
    expectedResults: [
      'Interactive Windows process identified',
      'Process-to-service mapping recorded',
      'Privilege separation observed in the nginx process tree',
      'Loopback-only service distinguished from externally reachable ones',
    ],
    verification: [
      'Learner can name the process holding an interactive session on WS-01',
      'Learner can explain why nginx runs as two different accounts',
      'Learner can say which Linux service is not reachable from the network',
    ],
    troubleshooting: [
      'ps aux columns unclear → USER, PID, %CPU, %MEM, then STAT and COMMAND at the end.',
      'Wondering why lsass matters → it holds credential material and is a primary attacker target.',
    ],
    challenge:
      'PowerShell is a legitimate administrative tool that attackers also use — a living-off-the-land binary. Write three questions you would ask to decide whether PID 6644 is malicious, without touching the host.',
    evidence: [
      {
        id: 'ev0',
        label: 'Process observations',
        type: 'text',
        placeholder: 'Notable processes, their accounts, and why each matters',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Malicious and legitimate processes often share a name. Attribution comes from context — the account, the session, the parent, and the connections — not from the binary name alone.',
  },

  {
    id: 'p1-lab-3',
    phaseId: 'phase-1',
    title: 'Inspect Network Configuration',
    objective:
      'Read the addressing, routing, ARP, and DNS configuration of a host, and explain how each one shapes what the firewall can see.',
    securityConcepts: ['IP addressing', 'Routing', 'ARP', 'DNS resolution', 'IPv6 exposure'],
    environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
    topology: 'WS-01 192.168.1.10/24, gateway 192.168.1.1 (FW-01 trust), DNS 192.168.1.20 (DC-01)',
    prerequisites: ['Complete the process inspection lab'],
    steps: [
      {
        id: 's0',
        instruction: 'Read the full Windows network configuration.',
        command: 'ipconfig /all',
        expected: 'Address, mask, gateway, DNS server, and MAC recorded.',
      },
      {
        id: 's1',
        instruction: 'Read the routing table and identify the default route.',
        command: 'route print',
        expected: '0.0.0.0/0 via 192.168.1.1; 192.168.1.0/24 on-link.',
      },
      {
        id: 's2',
        instruction: 'Inspect the ARP cache and check for duplicate MAC addresses.',
        command: 'arp -a',
        expected: 'Each IP maps to a distinct MAC; no duplicates.',
      },
      {
        id: 's3',
        instruction: 'Resolve a hostname and note which server answered.',
        command: 'nslookup srv-01.lab.local',
        expected: 'DC-01 (192.168.1.20) answers with 192.168.1.30.',
      },
      {
        id: 's4',
        instruction: 'Review the DNS cache for names this host has recently looked up.',
        command: 'ipconfig /displaydns',
        expected: 'updates.example.net resolves to 203.0.113.55 — the Phase 0 C2 address.',
      },
      {
        id: 's5',
        instruction: 'Check the Linux server for IPv6 addressing.',
        command: 'ip -6 addr',
        expected: 'Link-local fe80:: and global 2001:db8:: addresses present.',
      },
    ],
    expectedResults: [
      'Full addressing profile recorded',
      'Default route identified as the firewall trust interface',
      'ARP cache checked for spoofing indicators',
      'DNS cache links the suspicious IP to a domain name',
      'IPv6 exposure identified',
    ],
    verification: [
      'Learner can explain why all non-local traffic reaches the firewall',
      'Learner can name the domain that resolves to the suspicious external address',
      'Learner can explain why IPv6 matters even when unplanned',
    ],
    troubleshooting: [
      'Not sure which traffic is local → apply the mask. /24 means the first three octets must match.',
      'ARP cache looks clean → that is the expected baseline. You are learning what normal looks like.',
    ],
    challenge:
      'The DNS cache ties 203.0.113.55 to updates.example.net. Explain in three sentences why that name is more useful to an investigation than the IP address alone.',
    evidence: [
      {
        id: 'ev0',
        label: 'Network configuration profile',
        type: 'report',
        placeholder: 'Address, mask, gateway, DNS, notable cache entries',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The default route is a security control. Everything leaving the LAN passes the firewall because of one routing table entry — and any second path around it is a monitoring blind spot.',
  },

  {
    id: 'p1-lab-4',
    phaseId: 'phase-1',
    title: 'Identify Listening Ports and Attack Surface',
    objective:
      'Distinguish listening from established sockets, decide which services are actually exposed, and state the host attack surface.',
    securityConcepts: [
      'Attack surface',
      'Listening vs established sockets',
      'Bind addresses',
      'Service exposure',
    ],
    environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
    topology: 'WS-01 and SRV-01 on 192.168.1.0/24',
    prerequisites: ['Complete the network configuration lab'],
    steps: [
      {
        id: 's0',
        instruction: 'List Windows sockets with owning process IDs.',
        command: 'netstat -ano',
        expected: 'Ports 135 and 445 LISTENING; two ESTABLISHED sessions.',
      },
      {
        id: 's1',
        instruction: 'List Linux listeners and note each bind address.',
        command: 'ss -tulpn',
        expected: 'sshd and nginx on 0.0.0.0; postgres on 127.0.0.1.',
      },
      {
        id: 's2',
        instruction: 'Confirm the service versions visible from the network.',
        command: 'nmap -sv 192.168.1.0/24',
        expected: 'Three hosts up; SMB, SSH, HTTP, and PAN-OS management identified.',
      },
      {
        id: 's3',
        instruction: 'Compare an HTTP response against its HTTPS equivalent.',
        command: 'curl -i http://srv-01.lab.local',
        expected: 'Cleartext response; Server header discloses nginx/1.18.0 (Ubuntu).',
      },
      {
        id: 's4',
        instruction: 'Repeat the request over TLS and compare the headers.',
        command: 'curl -i https://srv-01.lab.local',
        expected: 'Server header trimmed; Strict-Transport-Security present.',
      },
    ],
    expectedResults: [
      'Listening and established sockets distinguished',
      'Bind addresses interpreted as exposure decisions',
      'Externally visible service versions enumerated',
      'HTTP and HTTPS responses compared',
    ],
    verification: [
      'Learner can explain why 127.0.0.1:5432 is not part of the attack surface',
      'Learner can name two findings in the plain HTTP response',
      'Learner can list the externally reachable services on SRV-01',
    ],
    troubleshooting: [
      'LISTENING vs ESTABLISHED unclear → LISTENING is a service waiting; ESTABLISHED is an active conversation.',
      'Nmap authorisation → only ever scan ranges you own or are contracted to test. This output is prepared.',
    ],
    challenge:
      'Write the attack surface statement for SRV-01: every externally reachable service, its port, its version, and whether it is encrypted. Then name the one service that is deliberately not on that list and say why.',
    evidence: [
      {
        id: 'ev0',
        label: 'Attack surface statement',
        type: 'report',
        placeholder: 'Service, port, version, encrypted yes/no',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Attack surface is what listens on a reachable address. Binding a service to loopback removes it from the network attack surface entirely — the cheapest hardening control there is.',
  },

  {
    id: 'p1-lab-5',
    phaseId: 'phase-1',
    title: 'Trace a Client-to-Server Connection',
    objective:
      'Follow a request from user to server across all nine steps and name the security control and detection opportunity at each one.',
    securityConcepts: [
      'Connection path',
      'Defence in depth',
      'Detection opportunities',
      'Perimeter inspection',
    ],
    environment: 'Deterministic simulation — prepared path trace, nothing is executed',
    topology: 'analyst1 → WS-01 → switch → FW-01 → SRV-01, with flow logs to SIEM-01',
    prerequisites: ['Complete the listening ports lab'],
    steps: [
      {
        id: 's0',
        instruction: 'Run the end-to-end connection trace.',
        command: 'trace connection ws-01 srv-01',
        expected: 'Nine steps from user request to HTTP 200, with the flow logged to the SIEM.',
      },
      {
        id: 's1',
        instruction: 'Confirm the name resolution step independently.',
        command: 'nslookup srv-01.lab.local',
        expected: 'DC-01 answers 192.168.1.30.',
      },
      {
        id: 's2',
        instruction: 'Confirm the Layer 2 resolution step.',
        command: 'arp -a',
        expected: '192.168.1.30 maps to aa-bb-cc-dd-ee-02.',
      },
      {
        id: 's3',
        instruction: 'Confirm the routing decision that sends external traffic to the firewall.',
        command: 'route print',
        expected: 'Default route via 192.168.1.1.',
      },
      {
        id: 's4',
        instruction: 'Trace the path to the external address from the Phase 0 incident.',
        command: 'tracert 203.0.113.55',
        expected: 'Four hops; hops 1 and 2 are the firewall trust and untrust interfaces.',
      },
      {
        id: 's5',
        instruction: 'Confirm the encrypted session characteristics at the server.',
        command: 'ssh -v analyst1@srv-01.lab.local',
        expected: 'Host key verified before authentication; publickey auth succeeds.',
      },
    ],
    expectedResults: [
      'Full nine-step path traced',
      'DNS, ARP, and routing steps independently confirmed',
      'Perimeter identified in the traceroute output',
      'Host key verification observed preceding authentication',
    ],
    verification: [
      'Learner can list the nine steps in order',
      'Learner can name a detection opportunity at three different steps',
      'Learner can explain why hops 1 and 2 in the traceroute are the same device',
    ],
    troubleshooting: [
      'Traceroute hops confusing → a firewall with two interfaces appears twice, once per interface.',
      'Wondering why TLS blocks payload inspection → that is the point of the exercise. Detection moves to metadata.',
    ],
    challenge:
      'Take the Phase 0 incident (PowerShell to 203.0.113.55:443) and walk it along this path. For each of the nine steps, state whether it offered a detection opportunity, and what specifically you would have looked for. Then say which single control would most likely have caught it first.',
    evidence: [
      {
        id: 'ev0',
        label: 'Path analysis',
        type: 'report',
        placeholder: 'Step, control present, detection opportunity',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Defence in depth is not a slogan — it is this path with a control at more than one step. When content is encrypted, detection moves to metadata: what name was resolved, where the traffic went, and how regularly it went there.',
  },
];

export const PHASE_1: Phase = {
  id: 'phase-1',
  number: 1,
  title: 'Computer, Network & Security Foundations',
  description:
    'How computers, operating systems, and networks actually work — and where the security controls sit. Everything later in the course attaches to this path.',
  examDomain: 'General Security Concepts',
  scene: 'path',
  lessons: LESSONS,
  labs: LABS,
};
