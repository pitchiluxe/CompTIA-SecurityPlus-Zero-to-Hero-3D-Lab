import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 7 — Security Operations / SOC
// Aligned with CompTIA Security+ SY0-701 (Domain 4.0, the largest at 28%)
//
// PROMPT.md: build a simulated SOC with a dashboard and an investigation lab
// following "multiple failed logins -> successful login -> unusual location
// -> suspicious process". That is the incident this platform has carried since
// Phase 0; here the learner finally works it as an analyst.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p7-lesson-0',
    phaseId: 'phase-7',
    title: 'The SOC Toolchain — SIEM, EDR, XDR and SOAR',
    objectives: [
      'Distinguish SIEM, EDR, XDR and SOAR by what each one sees and does',
      'Explain why SOAR detects nothing',
      'Describe log management as the foundation the rest depends on',
      'Choose the right tool for a described detection requirement',
    ],
    concepts: ['siem', 'edr', 'xdr', 'soar', 'log-management'],
    homework:
      'Write one sentence each for SIEM, EDR, XDR, and SOAR that states what question the tool answers. Then name a question none of them answers.',
    careerConnection:
      'Every SOC job description lists these four. Being able to say what each actually does — rather than reciting the expansion — is what separates a candidate who has used them from one who has read about them.',
    sections: [
      {
        id: 'p7-l0-s0',
        title: 'Concept — SIEM',
        body: 'A Security Information and Event Management platform ingests logs from everything, normalises them into a common schema, and runs correlation rules across the result. Its defining property is breadth: it sees the whole estate but only what other systems send it. If a log source is not forwarding, the SIEM is blind to it — which is why "are we actually collecting this?" is the first question in any detection gap.',
      },
      {
        id: 'p7-l0-s1',
        title: 'Concept — EDR and XDR',
        body: 'Endpoint Detection and Response runs an agent on the host and generates its own telemetry: process trees, file writes, registry changes, network connections with the owning process. That last part matters enormously — EDR can tell you which process opened a connection, which a firewall log never can. XDR extends the same correlation beyond the endpoint to network, identity, email and cloud, so the product itself does what you would otherwise build in the SIEM.',
      },
      {
        id: 'p7-l0-s2',
        title: 'Concept — SOAR detects nothing',
        body: 'Security Orchestration, Automation and Response is an automation layer. It takes an alert that already exists and runs a playbook: enrich the indicator against threat intelligence, open the ticket, isolate the host, notify the on-call. This is worth being precise about because it is a common exam trap — if a question asks what found the incident, SOAR is never the answer. SOAR is what happens next.',
      },
      {
        id: 'p7-l0-s3',
        title: 'Concept — Log management underneath it all',
        body: 'None of the above works without logs arriving, in a usable form, and being retained long enough. Three practical failures recur: sources that silently stop forwarding, timestamps in inconsistent time zones so correlation windows break, and retention shorter than the time it takes to notice an incident. An estate with a mean time to detect of three weeks and a fourteen-day retention cannot investigate its own incidents.',
      },
      {
        id: 'p7-l0-s4',
        title: 'Example — Which tool answered which question',
        body: 'In the incident you are about to investigate: the firewall log said 192.168.1.10 talked to 203.0.113.55 three times. It could not say what did the talking. The EDR said powershell.exe with pid 6644, spawned from explorer.exe. The SIEM joined those two plus a DNS query and an authentication event into one alert. Three tools, three different contributions, and no single one of them saw the whole thing.',
      },
      {
        id: 'p7-l0-s5',
        title: 'Review — What must stick',
        body: 'SIEM: ingests everything, correlates broadly, blind to what it is not sent. EDR: own agent, own telemetry, ties processes to connections. XDR: EDR correlating beyond the endpoint. SOAR: automates response, detects nothing. Log management is the foundation, and its failure modes are silent sources, inconsistent timestamps, and retention shorter than detection time.',
      },
    ],
    quiz: [
      {
        id: 'p7-q0',
        type: 'mcq',
        stem: 'Which capability can tell you which process opened a network connection?',
        options: ['Firewall flow log', 'EDR endpoint telemetry', 'DNS query log', 'SOAR playbook'],
        answer: 1,
        explanation:
          'A firewall sees addresses and ports but has no visibility into the host. EDR runs on the endpoint and attributes connections to the owning process — that attribution is what turns a flow into a finding.',
        examClue:
          'When a question needs process-to-connection attribution, the answer is endpoint telemetry, never network telemetry.',
        domain: 'Security Operations',
        conceptId: 'edr',
      },
      {
        id: 'p7-q1',
        type: 'scenario',
        stem: 'An organisation deploys SOAR to reduce the volume of alerts reaching analysts. Why will this not work on its own?',
        options: [
          'SOAR requires a separate licence for each analyst',
          'SOAR automates response to alerts that already exist; it does not detect or reduce what is generated',
          'SOAR only works with cloud workloads',
          'SOAR replaces the SIEM entirely',
        ],
        answer: 1,
        explanation:
          'SOAR acts on alerts, it does not produce or filter them. Reducing alert volume is a detection tuning problem. SOAR can make each alert cheaper to handle, which is valuable but different.',
        domain: 'Security Operations',
        conceptId: 'soar',
      },
      {
        id: 'p7-q2',
        type: 'scenario',
        stem: 'A SIEM shows no events at all from a critical server for the past nine days. What is the most likely explanation?',
        options: [
          'The server has had no security-relevant activity',
          'Log forwarding from that host has silently failed',
          'The SIEM automatically suppresses low-risk hosts',
          'The events are queued and will appear eventually',
        ],
        answer: 1,
        explanation:
          'Total silence from an active server means collection has broken, not that nothing happened. A SIEM only knows what it is sent, which is why monitoring for the absence of expected logs is itself a detection.',
        examClue: 'Silence from a log source is a finding, not a clean bill of health.',
        domain: 'Security Operations',
        conceptId: 'log-management',
      },
    ],
  },

  {
    id: 'p7-lesson-1',
    phaseId: 'phase-7',
    title: 'Reading the Log Sources',
    objectives: [
      'Name the key Windows security event IDs and what each means',
      'Read Linux authentication and sudo events',
      'Explain what firewall, DNS and web logs can and cannot answer',
      'Choose the right source for a given investigative question',
    ],
    concepts: ['windows-logs', 'linux-logs', 'firewall-logs', 'dns-logs', 'web-logs'],
    homework:
      'Take four investigation questions — who logged in, what did the host talk to, what name did it resolve, which process did it — and name the single log source that answers each. Note the wasted effort of asking the wrong source.',
    careerConnection:
      'Interviewers ask "what does 4625 mean" precisely because it is a fast check on whether someone has actually read a log.',
    sections: [
      {
        id: 'p7-l1-s0',
        title: 'Concept — Windows event IDs worth memorising',
        body: '4624 is a successful logon, 4625 a failed one, and the logon type attached to each matters: type 2 is interactive at the console, type 3 is over the network, type 10 is remote desktop. 4688 is process creation, and with command-line auditing enabled it records the full command. 4672 records that special privileges were assigned at logon, which is how you spot administrative sessions. Those four carry most of the weight in Windows investigations.',
      },
      {
        id: 'p7-l1-s1',
        title: 'Concept — Linux authentication logs',
        body: 'On Linux the equivalents live in auth.log or the journal. sshd records accepted and failed authentications with the source address and method. sudo records the invoking user, the terminal, and the exact command. CRON records scheduled execution, which is where a great many "suspicious" overnight activities turn out to be legitimate. The pattern to internalise is the same as Windows: who, from where, doing what.',
      },
      {
        id: 'p7-l1-s2',
        title: 'Concept — What network logs can and cannot answer',
        body: 'A firewall flow log gives you source, destination, port, bytes, duration, and which policy permitted it. It cannot tell you which process was responsible or what was inside an encrypted session. DNS logs tell you a name was resolved, which is often the earliest usable signal in an intrusion, but not what happened after. Web proxy logs give URLs, categories and verdicts. Each answers a narrow question well and adjacent questions not at all.',
      },
      {
        id: 'p7-l1-s3',
        title: 'Concept — Choosing the source for the question',
        body: 'Match the question to the source before you start searching. "Who logged in?" is Windows or Linux authentication. "What did this host talk to?" is firewall. "What name did it look up?" is DNS. "Which process did it?" is EDR. "What URL was fetched?" is web proxy. Analysts waste enormous time searching the wrong source for a question it structurally cannot answer.',
      },
      {
        id: 'p7-l1-s4',
        title: 'Example — Three 4625s and a 4624',
        body: 'The incident log shows failed logons for "analyst", "a.analyst" and "analyst.1" from one external address, then a success for "analyst1" from the same address three minutes later. Read what that sequence means: the attacker had the password but was guessing the username convention. That is a very different story from a brute-force against a known account, and the difference is visible only in the usernames.',
      },
      {
        id: 'p7-l1-s5',
        title: 'Review — What must stick',
        body: '4624 success, 4625 failure, 4688 process creation, 4672 privileged logon; logon type 2 console, 3 network, 10 RDP. Linux: sshd, sudo, CRON. Firewall gives addresses and volume but no process. DNS is often the earliest signal. Match the question to the source before searching.',
      },
    ],
    quiz: [
      {
        id: 'p7-q3',
        type: 'mcq',
        stem: 'Which Windows event ID records a failed logon attempt?',
        options: ['4624', '4625', '4688', '4672'],
        answer: 1,
        explanation:
          '4625 is a failed logon; 4624 is a success. 4688 records process creation and 4672 records special privileges assigned at logon.',
        domain: 'Security Operations',
        conceptId: 'windows-logs',
      },
      {
        id: 'p7-q4',
        type: 'scenario',
        stem: 'You need to determine which process on a host opened a connection to an external address. Which source answers this?',
        options: [
          'Firewall flow log',
          'DNS query log',
          'EDR telemetry or Windows 4688 with the connection correlated by PID',
          'Web proxy log',
        ],
        answer: 2,
        explanation:
          'Only endpoint telemetry attributes a connection to a process. The firewall sees the flow but not what caused it; DNS and proxy logs answer different questions entirely.',
        domain: 'Security Operations',
        conceptId: 'firewall-logs',
      },
      {
        id: 'p7-q5',
        type: 'scenario',
        stem: 'Failed logons appear for "analyst", "a.analyst" and "analyst.1" from one address, followed by a success for "analyst1" from the same address. What does the username pattern indicate?',
        options: [
          'A brute-force attack against a known account',
          'The attacker held valid credentials but was guessing the username format',
          'A misconfigured service account',
          'Password spraying across multiple users',
        ],
        answer: 1,
        explanation:
          'Each attempt is a different spelling of the same person, not a different password against one account. That means the password was already known — consistent with credential phishing — and only the naming convention had to be worked out.',
        examClue:
          'Read what varies between failed attempts. Varying usernames and varying passwords tell completely different stories.',
        domain: 'Security Operations',
        conceptId: 'windows-logs',
      },
    ],
  },

  {
    id: 'p7-lesson-2',
    phaseId: 'phase-7',
    title: 'Alert Triage and the False Positive Problem',
    objectives: [
      'Work the six-step triage loop',
      'Explain why enrichment is the step analysts skip',
      'Distinguish a missed incident from a false escalation and weigh both',
      'Explain why closing a false positive without tuning is incomplete',
    ],
    concepts: ['alert-triage', 'false-positives', 'security-dashboards', 'event-monitoring'],
    homework:
      'Write a triage note for an alert you invent: what fired, what corroborates it, what contradicts it, and your verdict. Include the specific evidence that would change your verdict.',
    careerConnection:
      'This is the day job for a SOC analyst I. Doing it well — and tuning as you go — is what gets you promoted off the queue.',
    sections: [
      {
        id: 'p7-l2-s0',
        title: 'Concept — The triage loop',
        body: 'Validate that the alert is what it claims, by reading the rule logic. Scope it: one host or many, one user or many. Enrich it with reputation data, asset ownership, business context and change tickets. Pivot across sources to build a timeline. Decide: escalate or close. Document what you saw and concluded. Six steps, and they are in that order for a reason — deciding before enriching is how false escalations happen.',
      },
      {
        id: 'p7-l2-s1',
        title: 'Concept — Enrichment is the step people skip',
        body: 'Under queue pressure, enrichment is what gets dropped, and it is the step that most often changes the answer. A 4.2 GB outbound transfer at 03:00 looks alarming until you check: a cron job started four seconds earlier, the destination is the documented backup store, and the permitting policy is named backup-egress. Thirty seconds of context turned a critical-looking alert into a tuning task.',
      },
      {
        id: 'p7-l2-s2',
        title: 'Concept — Two error directions, weighted differently',
        body: 'A missed incident means you closed something real, and the attacker keeps working uncontested. A false escalation means you raised noise, burning analyst hours and, repeated enough, your own credibility. Both are errors and they are not symmetric — but an analyst who escalates everything to avoid the first has simply converted a detection problem into a capacity problem, and the queue eventually gets skimmed anyway.',
      },
      {
        id: 'p7-l2-s3',
        title: 'Concept — Alert fatigue is a security failure',
        body: 'This is worth stating plainly rather than as a complaint about workload. When most alerts in a queue are noise, analysts adapt by skimming — and the one that mattered gets skimmed too. A 40% false positive rate is a tuning problem, not an analyst performance problem, and measuring analysts on alerts-closed-per-hour makes it worse by rewarding exactly the skimming that causes misses.',
      },
      {
        id: 'p7-l2-s4',
        title: 'Concept — Closing without tuning is half the job',
        body: 'When you close a false positive, the rule that produced it is unchanged. It will fire again next week, and the week after, consuming triage time forever. Tuning means adjusting the rule so that specific benign pattern no longer matches — excluding the backup egress policy by name, or the monitoring agent by process path. Tune by the narrowest attribute that distinguishes the benign case, never by destination address, which an attacker can simply change.',
      },
      {
        id: 'p7-l2-s5',
        title: 'Scenario — Reading a dashboard honestly',
        body: 'Mean time to detect is the number that matters most, because everything between compromise and detection is uncontested attacker time. Alert volume without a false positive rate is meaningless. And disposition matters more than throughput: five alerts closed quickly is not better than three escalated correctly and two tuned out permanently.',
      },
      {
        id: 'p7-l2-s6',
        title: 'Review — What must stick',
        body: 'Validate, scope, enrich, pivot, decide, document. Enrichment is the step that gets skipped and the one that most often changes the answer. Missed incident is dangerous, false escalation is expensive, and escalating everything is not a solution. Alert fatigue is a security failure. Closing a false positive without tuning leaves the problem in place.',
      },
    ],
    quiz: [
      {
        id: 'p7-q6',
        type: 'scenario',
        stem: 'A 4.2 GB outbound transfer alert fires at 03:00. Which enrichment step most efficiently resolves it?',
        options: [
          'Isolate the host immediately',
          'Check for a scheduled job, the destination reputation, and the permitting firewall policy name',
          'Escalate to the incident response team',
          'Block the destination address at the perimeter',
        ],
        answer: 1,
        explanation:
          'Enrichment before action. A cron job four seconds earlier, a documented backup destination, and a policy named backup-egress resolve this in under a minute. Isolating or blocking first causes an outage over a routine backup.',
        examClue:
          'When an option acts destructively before establishing context, it is usually the wrong first step.',
        domain: 'Security Operations',
        conceptId: 'alert-triage',
      },
      {
        id: 'p7-q7',
        type: 'mcq',
        stem: 'An analyst closes a false positive but does not change the rule. What is the consequence?',
        options: [
          'None — the alert is resolved',
          'The same alert will recur, consuming triage capacity indefinitely',
          'The rule is automatically disabled after three closures',
          'The SIEM will reclassify future instances as low severity',
        ],
        answer: 1,
        explanation:
          'Closing is a per-instance action; tuning is the permanent fix. Without it the rule fires again on the same benign pattern, and untuned noise is a standing tax on every future shift.',
        domain: 'Security Operations',
        conceptId: 'false-positives',
      },
      {
        id: 'p7-q8',
        type: 'scenario',
        stem: 'A SOC reports a 40% false positive rate. What does this most directly indicate?',
        options: [
          'Analysts need additional training',
          'Detection rules need tuning',
          'The SIEM licence should be upgraded',
          'The organisation is under sustained attack',
        ],
        answer: 1,
        explanation:
          'False positive rate is a property of the rules, not the analysts. Treating it as a performance issue produces faster skimming, which increases missed incidents — the opposite of the intended outcome.',
        domain: 'Security Operations',
        conceptId: 'false-positives',
      },
      {
        id: 'p7-q9',
        type: 'pbq',
        stem: 'Order the triage loop: [0] Pivot across sources, [1] Validate the alert against its rule, [2] Decide and tune, [3] Enrich with context, [4] Scope the affected hosts and users.',
        options: [
          'Validate the alert against its rule',
          'Scope the affected hosts and users',
          'Enrich with context',
          'Pivot across sources',
          'Decide and tune',
        ],
        answer: [1, 4, 3, 0, 2],
        explanation:
          'Validate, scope, enrich, pivot, decide. Enrichment comes before pivoting because context frequently resolves the alert without any pivoting at all — and deciding before enriching is how false escalations happen.',
        domain: 'Security Operations',
        conceptId: 'alert-triage',
      },
    ],
  },

  {
    id: 'p7-lesson-3',
    phaseId: 'phase-7',
    title: 'Threat Intelligence, IOCs and IOAs',
    objectives: [
      'Distinguish an indicator of compromise from an indicator of attack',
      'Explain why IOAs are more durable than IOCs',
      'Describe how threat intelligence is used in enrichment',
      'Write a detection that survives the attacker changing infrastructure',
    ],
    concepts: ['threat-intelligence', 'ioc', 'ioa'],
    homework:
      'Pick one IOC and one IOA for the same attacker behaviour, then state what it costs the attacker to defeat each. That cost difference is the whole point.',
    careerConnection:
      'The IOC/IOA distinction is asked constantly, and the good answer is about durability rather than definitions.',
    sections: [
      {
        id: 'p7-l3-s0',
        title: 'Concept — Indicators of compromise',
        body: 'An IOC is an artifact: a file hash, an IP address, a domain, a filename, a registry key. It is precise, easy to share, and easy to search retrospectively — "has anything in the estate ever contacted this address?" is an extremely useful question. It is also brittle. The attacker registers a new domain and every IOC-based detection you built stops working, at zero cost to them.',
      },
      {
        id: 'p7-l3-s1',
        title: 'Concept — Indicators of attack',
        body: 'An IOA describes behaviour: what the attacker is trying to do. "An interactive shell holding a long-lived outbound TLS session at a regular interval" is an IOA. It is harder to write and harder to tune, but it is durable — the attacker can change the address freely, and to evade the detection they must stop beaconing regularly, which costs them capability. Mature detection favours IOAs and keeps IOCs for retrospective search.',
      },
      {
        id: 'p7-l3-s2',
        title: 'Concept — Threat intelligence in practice',
        body: 'Threat intelligence supplies context an analyst does not have locally: this address has been associated with known infrastructure, this hash is a known tool, this technique is used by a particular group. Its most common practical use is enrichment during triage — turning "an unfamiliar address" into "an address with a reputation". Note the failure mode: intelligence with no local context produces alerts on addresses nobody in your estate has ever contacted.',
      },
      {
        id: 'p7-l3-s3',
        title: 'Example — Writing a beacon detection that lasts',
        body: 'An IOC detection would block 203.0.113.55. The IOA detection groups flows by source, destination and port over thirty minutes, and fires when there are at least five connections, the standard deviation of the interval is under fifteen seconds, and the payload size barely varies. Note what is absent: any volume threshold. The beacon moved about 4 KB per check-in, and a volume rule would have missed it entirely while catching the nightly backup.',
      },
      {
        id: 'p7-l3-s4',
        title: 'Scenario — Tuning without creating a blind spot',
        body: 'The beacon rule will fire on legitimate monitoring agents, which also check in regularly. Tune by process path — exclude the specific agent binary — not by destination address. Excluding an address creates a permanent blind spot that an attacker who learns of it can occupy. Always tune by the narrowest attribute that distinguishes the benign case.',
      },
      {
        id: 'p7-l3-s5',
        title: 'Review — What must stick',
        body: 'IOC is an artifact: precise, shareable, brittle. IOA is a behaviour: durable, harder to write, costs the attacker capability to evade. Threat intelligence is most useful as enrichment during triage. Detect on regularity rather than volume for beaconing. Tune by the narrowest distinguishing attribute, never by destination.',
      },
    ],
    quiz: [
      {
        id: 'p7-q10',
        type: 'mcq',
        stem: 'Which is an indicator of attack rather than an indicator of compromise?',
        options: [
          'The file hash of a known tool',
          'A command-and-control IP address',
          'An interactive shell maintaining regular outbound connections',
          'A malicious domain name',
        ],
        answer: 2,
        explanation:
          'The first, second and fourth are artifacts — IOCs. The third describes behaviour, which is what an IOA captures. Changing the address defeats an IOC; defeating the IOA requires abandoning the technique.',
        domain: 'Security Operations',
        conceptId: 'ioa',
      },
      {
        id: 'p7-q11',
        type: 'scenario',
        stem: 'A beacon detection fires on a legitimate monitoring agent. How should it be tuned?',
        options: [
          'Exclude the agent destination address from the rule',
          'Exclude the specific agent process path from the rule',
          'Raise the connection count threshold until it stops firing',
          'Disable the rule during business hours',
        ],
        answer: 1,
        explanation:
          'Tune by the narrowest attribute that distinguishes the benign case. Excluding a destination address creates a blind spot an attacker could occupy; raising thresholds or disabling by time weakens the detection generally.',
        examClue:
          'A tuning option that widens a blind spot beyond the specific benign case is the wrong answer.',
        domain: 'Security Operations',
        conceptId: 'threat-intelligence',
      },
      {
        id: 'p7-q12',
        type: 'scenario',
        stem: 'Why did the beaconing rule deliberately exclude any volume threshold?',
        options: [
          'Volume data is unavailable in firewall logs',
          'The beacon transferred only about 4 KB per check-in, so a volume rule would miss it while catching routine backups',
          'Volume thresholds are computationally expensive',
          'Encrypted traffic has no measurable volume',
        ],
        answer: 1,
        explanation:
          'Beacons are small and periodic. Regularity is the signal, not size. A volume threshold in this environment would have missed the actual intrusion and fired on the 4.2 GB nightly backup instead.',
        domain: 'Security Operations',
        conceptId: 'ioc',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p7-lab-0',
    phaseId: 'phase-7',
    title: 'Know Your Tools and Your Logs',
    objective:
      'Distinguish the four SOC platforms by capability, and match each investigative question to the log source that can answer it.',
    securityConcepts: ['SIEM', 'EDR', 'XDR', 'SOAR', 'Log sources'],
    environment: 'Deterministic simulator — prepared reference artifacts, nothing is executed',
    topology: 'Reference SOC toolchain and six log sources',
    prerequisites: ['Complete Phase 6'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare the four detection and response platforms.',
        command: 'compare detection tooling',
        expected: 'SIEM ingests, EDR generates, XDR correlates wider, SOAR automates response.',
      },
      {
        id: 's1',
        instruction: 'Review what each log source can and cannot answer.',
        command: 'show log sources',
        expected: 'Six sources with their key fields and event IDs.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the Windows Security log from your first triage lab.',
        command: 'get-eventlog -logname security -newest 5',
        expected: '4625 failures, a 4624 success, then a 4688 process creation.',
      },
    ],
    expectedResults: [
      'Four platforms distinguished by capability',
      'Six log sources mapped to the questions they answer',
      'Windows event IDs recognised on sight',
    ],
    verification: [
      'Learner can explain why SOAR detects nothing',
      'Learner can name the source that attributes a connection to a process',
      'Learner can state what 4624, 4625, 4688 and 4672 mean',
    ],
    troubleshooting: [
      'SIEM vs XDR unclear → SIEM ingests what it is sent; XDR generates and correlates its own telemetry across layers.',
      'Unsure which source to search → match the question first. Most wasted investigation time is searching a source that structurally cannot answer.',
    ],
    challenge:
      'For each of these questions, name the single best source and say what it would show: who authenticated, what a host talked to, what name was resolved, which process opened a connection. Then name one question none of your sources can answer, and say what you would need to collect.',
    evidence: [
      {
        id: 'ev0',
        label: 'Source-to-question mapping',
        type: 'report',
        placeholder: 'Question, best source, what it shows, what it cannot show',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'No single source sees a whole attack. Knowing what each one structurally cannot answer is as valuable as knowing what it can — it stops you concluding "nothing happened" from a source that was never going to show it.',
  },

  {
    id: 'p7-lab-1',
    phaseId: 'phase-7',
    title: 'Triage the Alert Queue',
    objective:
      'Work five alerts in the SOC Console: escalate the real incidents, close the noise, and explain both decisions.',
    securityConcepts: ['Alert triage', 'False positives', 'Enrichment', 'Rule tuning'],
    environment: 'Interactive SOC Console plus the deterministic simulator',
    topology: 'Five alerts across DC-01, WS-01 and SRV-01',
    prerequisites: ['Complete "Know Your Tools and Your Logs"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the triage workflow before starting.',
        command: 'show triage workflow',
        expected: 'Validate, scope, enrich, pivot, decide, document.',
      },
      {
        id: 's1',
        instruction: 'View the alert queue.',
        command: 'show alert queue',
        expected: 'Five alerts — and the warning that five alerts is not five incidents.',
      },
      {
        id: 's2',
        instruction:
          'Open the SOC Console alert dashboard and triage all five alerts. Enrich before deciding.',
        expected: 'Three escalations and two false positives, graded in both error directions.',
      },
      {
        id: 's3',
        instruction: 'Review the dashboard metrics and note the false positive rate.',
        command: 'show dashboard summary',
        expected: 'MTTD 11 minutes, 40% false positive rate presented as a tuning problem.',
      },
    ],
    expectedResults: [
      'All five alerts triaged',
      'Two false positives correctly identified',
      'Three genuine incidents escalated',
      'Both error directions understood',
    ],
    verification: [
      'Learner can explain why the 4.2 GB transfer is not an incident',
      'Learner can explain why the sudo alert is noise given the Phase 1 configuration',
      'Learner can state what tuning each false positive requires',
    ],
    troubleshooting: [
      'Tempted to escalate everything → that converts a detection problem into a capacity problem. The queue still gets skimmed.',
      'Unsure about an alert → enrich it. Check for a change ticket, a scheduled job, or a documented configuration.',
    ],
    challenge:
      'Write the tuning change for each false positive: the exact attribute you would exclude and why that attribute rather than a broader one. Then explain what blind spot you would have created if you had tuned by destination address instead.',
    evidence: [
      {
        id: 'ev0',
        label: 'Triage decisions',
        type: 'report',
        placeholder: 'Alert, decision, enrichment that decided it, tuning required',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Alert fatigue is a security failure, not a workload complaint. When most of a queue is noise, analysts adapt by skimming — and the one that mattered gets skimmed too. Tuning out false positives is defensive work.',
  },

  {
    id: 'p7-lab-2',
    phaseId: 'phase-7',
    title: 'Investigate the Intrusion',
    objective:
      'Pivot across log sources to reconstruct the full intrusion from a single process alert, and produce the incident timeline.',
    securityConcepts: ['Pivoting', 'Correlation', 'Incident timeline', 'Evidence gathering'],
    environment: 'Interactive SOC Console investigation tab plus the deterministic simulator',
    topology: 'Six log sources across WS-01, DC-01, SRV-01 and FW-01',
    prerequisites: ['Complete "Triage the Alert Queue"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review how pivoting works before starting.',
        command: 'show pivot example',
        expected: 'Five pivots turning one process alert into a full timeline.',
      },
      {
        id: 's1',
        instruction:
          'In the SOC Console investigation tab, pivot on PID 6644 and identify the process and its parent.',
        expected: 'powershell.exe spawned from explorer.exe in an interactive session.',
      },
      {
        id: 's2',
        instruction:
          'Pivot on host WS-01 and find the DNS query preceding the outbound connection.',
        expected: 'updates.example.net resolving to 203.0.113.55.',
      },
      {
        id: 's3',
        instruction: 'Pivot on 203.0.113.55 and characterise the traffic pattern.',
        expected: 'Three flows five minutes apart, roughly 4 KB each — a beacon.',
      },
      {
        id: 's4',
        instruction: 'Pivot on user analyst1 and find how the account was accessed.',
        expected: 'A 4624 success from 198.51.100.77, preceded by three 4625 failures.',
      },
      {
        id: 's5',
        instruction: 'Review the correlated timeline in the SOC Console.',
        expected: 'The full intrusion, in order, across all sources.',
      },
      {
        id: 's6',
        instruction: 'Review the behavioural rule that caught the beacon.',
        command: 'show siem rule beacon',
        expected: 'Regularity-based logic with no volume threshold.',
      },
    ],
    expectedResults: [
      'Process attributed to its parent and session',
      'DNS query linked to the outbound connection',
      'Beacon pattern characterised by regularity',
      'Account compromise traced to its source address',
      'Full timeline reconstructed across six sources',
    ],
    verification: [
      'Learner can reconstruct the intrusion from the process alert alone',
      'Learner can explain what the username variants in the 4625 events reveal',
      'Learner can explain why the beacon rule uses regularity rather than volume',
    ],
    troubleshooting: [
      'Pivot returns nothing → check the exact indicator value. An empty result is sometimes itself a finding.',
      'Unsure what to pivot on next → each pivot answers one question and raises the next. Follow the newest unexplained value.',
    ],
    challenge:
      'Produce the incident report: the timeline with source system per event, the earliest point detection was possible, why the SIEM alert fired when it did rather than earlier, and one collection change that would have shortened mean time to detect.',
    evidence: [
      {
        id: 'ev0',
        label: 'Incident timeline',
        type: 'report',
        placeholder: 'Time, source, event, what it established',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Pivoting is the core investigative skill. Each pivot answers one question and raises the next, and a single process alert becomes a full intrusion timeline in about five moves. No single source would have got you there.',
  },

  {
    id: 'p7-lab-3',
    phaseId: 'phase-7',
    title: 'Indicators and Durable Detection',
    objective:
      'Distinguish IOCs from IOAs, and write a detection that survives the attacker changing infrastructure.',
    securityConcepts: ['IOC', 'IOA', 'Threat intelligence', 'Detection engineering'],
    environment: 'Deterministic simulator — prepared rule definitions, nothing is executed',
    topology: 'Detection rules over firewall and EDR telemetry',
    prerequisites: ['Complete "Investigate the Intrusion"'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare indicators of compromise with indicators of attack.',
        command: 'compare ioc ioa',
        expected: 'IOCs are artifacts and brittle; IOAs are behaviours and durable.',
      },
      {
        id: 's1',
        instruction: 'Read the behavioural rule that caught the beacon.',
        command: 'show siem rule beacon',
        expected: 'Grouping, window, regularity thresholds, and the tuning guidance.',
      },
      {
        id: 's2',
        instruction: 'Review the dashboard indicators observed during the incident.',
        command: 'show dashboard summary',
        expected: 'Top indicators by event count, and the false positive rate.',
      },
    ],
    expectedResults: [
      'IOC and IOA distinguished by durability',
      'Behavioural rule logic read and understood',
      'Tuning guidance understood as narrowest-attribute exclusion',
    ],
    verification: [
      'Learner can classify an indicator as IOC or IOA',
      'Learner can explain why the rule omits a volume threshold',
      'Learner can explain why tuning by destination creates a blind spot',
    ],
    troubleshooting: [
      'IOC vs IOA unclear → ask whether the attacker can change it for free. If yes, it is an IOC.',
      'Rule logic dense → read the WHERE clauses one at a time and ask what each excludes.',
    ],
    challenge:
      'The attacker abandons 203.0.113.55 and registers new infrastructure. State which of your detections still fire and which are now useless, then write one additional IOA for a technique from the Phase 3 chain that currently has no behavioural detection.',
    evidence: [
      {
        id: 'ev0',
        label: 'Detection assessment',
        type: 'report',
        placeholder: 'Indicator, type, survives infrastructure change?, proposed IOA',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'An IOC tells you a specific attacker was here. An IOA tells you something is beaconing regardless of where. Building detections the attacker cannot cheaply evade is the difference between chasing indicators and actually raising their cost.',
  },
];

export const PHASE_7: Phase = {
  id: 'phase-7',
  number: 7,
  title: 'Security Operations / SOC',
  description:
    'The largest exam domain at 28%, and where every earlier phase converges. The SOC toolchain, the log sources, alert triage and the false positive problem, and a full investigation of the intrusion this platform has carried since Phase 0.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: LESSONS,
  labs: LABS,
};
