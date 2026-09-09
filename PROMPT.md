# PROMPT — Build the CompTIA Security+ Zero-to-Hero Professional 3D Cybersecurity Lab Platform

## MASTER ROLE

Act as a senior software architect, full-stack engineer, cybersecurity lab architect, CompTIA Security+ instructor, SOC analyst mentor, IAM engineer, incident-response instructor, 3D/WebGL engineer, UX designer, QA engineer, and technical writer.

Build a professional **CompTIA Security+ Zero-to-Hero Interactive 3D Cybersecurity Training Platform**.

The platform must take a learner from absolute beginner to:
**Security+ exam-ready → hands-on cybersecurity capable → junior security/SOC/IAM job-ready.**

This is NOT a flashcard or quiz application.

The learner must understand, implement, investigate, troubleshoot, document, and explain cybersecurity concepts through realistic authorized labs.

Read `CLAUDE.md` before starting.

---

# PHASE 0 — PLATFORM FOUNDATION & SECURITY LAB

Build:

- Professional dashboard
- Course roadmap
- Domain/lesson navigation
- Lab library
- Progress tracking
- Quiz engine
- Mastery tracking
- Notes/bookmarks
- Evidence collection
- GitHub project generator foundation

### 3D

Create a professional SOC/security lab environment:

- SOC workstations
- Server racks
- Network rack
- Firewall
- Router/switch
- Windows endpoint
- Linux server
- Security monitoring display
- Interactive camera
- Device inspection

Acceptance:
Learner can enter the lab, inspect systems, navigate the roadmap, and track progress.

---

# PHASE 1 — COMPUTER, NETWORK & SECURITY FOUNDATIONS

Teach:

- Computer architecture
- Operating systems
- Filesystems
- Processes
- Users
- Permissions
- Windows basics
- Linux basics
- Command line
- LAN/WAN
- TCP/IP
- IPv4/IPv6
- DNS
- DHCP
- HTTP/HTTPS
- SSH
- Ports
- Protocols
- Routers
- Switches
- Firewalls
- VPNs

### Labs

- Explore a Windows endpoint.
- Explore a Linux endpoint.
- Inspect processes.
- Inspect network configuration.
- Identify listening ports.
- Trace a simple client-to-server connection.

### 3D

Visualize:
User → Endpoint → Network → Server → Security Controls

---

# PHASE 2 — SECURITY FUNDAMENTALS

Teach:

- CIA triad
- Authentication
- Authorization
- Accounting
- Non-repudiation
- Least privilege
- Defense in depth
- Zero Trust
- Attack surface
- Threat
- Vulnerability
- Exploit
- Risk
- Security controls
- Preventive/detective/corrective controls
- Physical/technical/administrative controls

### Interactive Scenarios

Give a business scenario and make the learner identify:

- Asset
- Threat
- Vulnerability
- Risk
- Control
- Residual risk

---

# PHASE 3 — THREATS, VULNERABILITIES & ATTACKS

Teach:

- Malware
- Virus
- Worm
- Trojan
- Ransomware
- Spyware
- Rootkit
- Botnet
- Phishing
- Spear phishing
- Whaling
- Smishing
- Vishing
- Social engineering
- Password attacks
- Brute force
- Credential stuffing
- Password spraying
- Insider threats
- Supply-chain attacks
- Web attacks
- Network attacks
- Wireless attacks
- Application attacks
- Cloud attacks
- Mobile attacks
- IoT attacks

### Safe Simulation

Create simulated incidents and evidence.

Example:
A user clicks a phishing email.

Show:
Email → User → Credential capture simulation → Suspicious login → Alert

Do not implement credential theft against real users/systems.

---

# PHASE 4 — SECURITY ARCHITECTURE

Teach:

- Network segmentation
- VLANs
- DMZ
- Zero Trust
- Security zones
- Firewalls
- IDS
- IPS
- WAF
- Proxy
- VPN
- NAC
- Honeypots
- Honeynets
- Secure architecture
- High availability
- Redundancy

### 3D

Create an enterprise network architecture:

Internet
↓
Firewall
↓
DMZ
↓
Core
↓
Users / Servers / Management / Guest

Allow the learner to inspect security boundaries.

---

# PHASE 5 — IDENTITY & ACCESS MANAGEMENT

Make IAM a major career-oriented component.

Teach:

- Identity
- Authentication
- Authorization
- Accounting
- MFA
- SSO
- Federation
- SAML
- OAuth
- OpenID Connect
- LDAP
- Active Directory
- Kerberos
- RBAC
- ABAC
- Least privilege
- PAM
- Password policies
- Account lifecycle
- Joiner/Mover/Leaver
- Provisioning
- Deprovisioning
- Service accounts
- Machine identities
- Certificates
- Identity providers
- Conditional access
- Zero Trust

### Major Lab

Employee lifecycle:

HR System
↓
Identity Platform
↓
Account Creation
↓
MFA
↓
SSO
↓
Application Access
↓
Authorization
↓
Audit Logs
↓
Deprovisioning

Make the learner design and troubleshoot the workflow.

### 3D

Create an interactive identity architecture.

---

# PHASE 6 — CRYPTOGRAPHY & PKI

Teach:

- Encryption
- Hashing
- Encoding
- Symmetric encryption
- Asymmetric encryption
- AES
- RSA
- ECC
- SHA-256
- Digital signatures
- Certificates
- PKI
- CA
- Certificate lifecycle
- TLS
- HTTPS
- Key exchange
- Key management

### Interactive Demonstration

Show:

Plaintext
↓
Hash
↓
Encryption
↓
Digital Signature
↓
Certificate
↓
TLS session

Make the learner distinguish encryption vs hashing vs encoding vs signing.

---

# PHASE 7 — SECURITY OPERATIONS / SOC

Build a simulated SOC.

Teach:

- SIEM
- SOAR
- EDR
- XDR
- Log management
- Event monitoring
- Alert triage
- Threat intelligence
- IOC
- IOA
- Security dashboards
- Windows Event Logs
- Linux logs
- Firewall logs
- DNS logs
- Web logs

### SOC Dashboard

Display:

- Alerts
- Severity
- Source
- Destination
- Timestamp
- User
- Host
- IOC
- Investigation status

### Investigation Lab

Example:
Multiple failed logins → successful login → unusual location → suspicious process.

Make the learner investigate the evidence.

---

# PHASE 8 — WINDOWS SECURITY

Teach:

- Windows accounts
- Groups
- Permissions
- NTFS
- UAC
- Defender
- Firewall
- Event Viewer
- PowerShell security concepts
- Services
- Processes
- Scheduled tasks
- Registry security concepts
- Sysmon
- Active Directory security basics
- Kerberos concepts

### Labs

- Create users/groups in an isolated lab.
- Apply permissions.
- Inspect Windows events.
- Identify suspicious process behavior.
- Investigate failed authentication.
- Harden a Windows endpoint.

---

# PHASE 9 — LINUX SECURITY

Teach:

- Users
- Groups
- Permissions
- sudo
- Processes
- Services
- systemd
- SSH
- Logs
- File permissions
- Firewall concepts
- Package management
- Secure configuration

### Labs

- Create users.
- Configure permissions.
- Harden SSH.
- Inspect authentication logs.
- Investigate suspicious activity.

---

# PHASE 10 — VULNERABILITY MANAGEMENT

Teach:

- Vulnerabilities
- CVE
- CVSS
- Vulnerability scanning
- Patch management
- Configuration management
- Risk prioritization
- Remediation
- Validation
- False positives
- Vulnerability reports

### Tools

Where appropriate and safe:

- Nmap
- OpenVAS/Greenbone
- Nessus Essentials
- Wireshark
- Windows tools
- Linux tools

Only authorized/isolated environments.

### Lab

Scan an intentionally vulnerable lab system.

Produce:

- Findings
- Severity
- Evidence
- Risk
- Remediation
- Validation

---

# PHASE 11 — NETWORK SECURITY

Teach:

- Firewalls
- IDS/IPS
- ACLs
- Network segmentation
- VLANs
- VPN
- Secure protocols
- Network monitoring
- Wireless security
- NAC
- DHCP security
- DNS security

### Lab

Build and secure an enterprise network.

Inject safe configuration errors.

Make the learner identify them.

---

# PHASE 12 — INCIDENT RESPONSE

Teach:

1. Preparation
2. Detection
3. Analysis
4. Containment
5. Eradication
6. Recovery
7. Lessons learned

### Incident Simulations

Create:

- Phishing
- Malware
- Ransomware
- Compromised account
- Privilege escalation
- Suspicious PowerShell
- Data exfiltration simulation
- Unauthorized access

### Incident Console

Learner should:

- Open incident
- Review evidence
- Build timeline
- Identify affected assets
- Contain
- Recommend remediation
- Close incident
- Write report

---

# PHASE 13 — THREAT INTELLIGENCE

Teach:

- Threat intelligence
- IOC
- IOA
- TTPs
- Threat actors
- Malware intelligence
- Indicators
- Intelligence lifecycle
- STIX/TAXII concepts
- MITRE ATT&CK concepts

Create safe simulated threat-intelligence exercises.

---

# PHASE 14 — CLOUD SECURITY

Teach:

- IaaS
- PaaS
- SaaS
- Shared responsibility
- Cloud IAM
- Security groups
- Cloud logging
- Encryption
- Misconfiguration
- Containers
- Serverless
- APIs
- Secrets management

Use AWS/Azure concepts where useful without requiring paid cloud resources.

### Lab

Identify intentionally insecure cloud configurations in a simulated environment.

---

# PHASE 15 — MOBILE / IoT / EMBEDDED SECURITY

Teach:

- Mobile threats
- Mobile device management
- BYOD
- Application security
- IoT risks
- Embedded devices
- Firmware
- Device identity
- Network segmentation

### Lab

Design a secure enterprise IoT network.

---

# PHASE 16 — APPLICATION & DATA SECURITY

Teach:

- Secure development
- Input validation
- Authentication
- Authorization
- Session management
- API security
- OWASP concepts
- Data classification
- Data protection
- Data loss prevention
- Encryption
- Tokenization
- Masking

Keep offensive exercises inside intentionally vulnerable authorized labs.

---

# PHASE 17 — GOVERNANCE, RISK & COMPLIANCE

Teach:

- Risk management
- Risk assessment
- Risk treatment
- Policies
- Standards
- Procedures
- Guidelines
- Security awareness
- Business continuity
- Disaster recovery
- Incident response plans
- Data classification
- Retention
- Privacy
- Compliance
- Audits
- Third-party risk
- Vendor risk
- Business impact analysis

### Lab

Conduct a simulated security risk assessment for a fictional company.

---

# PHASE 18 — BUSINESS CONTINUITY & DISASTER RECOVERY

Teach:

- BCP
- DR
- RTO
- RPO
- MTTR
- MTBF
- Backups
- Recovery strategies
- High availability
- Redundancy
- Alternate sites
- Disaster scenarios

### Lab

Design recovery plans for:

- Ransomware
- Server outage
- Network outage
- Cloud outage

---

# PHASE 19 — SECURITY HARDENING

Teach endpoint and infrastructure hardening.

### Windows

- Firewall
- Defender
- User rights
- Services
- Patch management
- Logging
- PowerShell controls

### Linux

- SSH
- Permissions
- Firewall
- Services
- Updates
- Logging

### Network

- SSH
- Disable unused ports
- Strong authentication
- Segmentation
- ACLs
- Secure management

### Lab

Take a deliberately insecure authorized VM and harden it.

---

# PHASE 20 — SECURITY AUTOMATION

Teach:

- Python security basics
- JSON
- APIs
- Automation
- Log parsing
- IOC processing
- Report generation
- SOAR concepts

### Projects

- Parse authentication logs.
- Detect repeated failed logins.
- Extract indicators.
- Generate security reports.
- Query a simulated API.
- Automate evidence collection.

---

# PHASE 21 — WIRESHARK & PACKET ANALYSIS

Teach:

- ARP
- ICMP
- TCP
- UDP
- DNS
- DHCP
- HTTP
- TLS
- TCP handshake

### Labs

Give safe packet captures and make the learner:

- Identify protocols.
- Follow conversations.
- Find suspicious traffic.
- Explain the evidence.

---

# PHASE 22 — SECURITY TROUBLESHOOTING CENTER

Build an interactive troubleshooting simulator.

Scenarios:

1. Compromised account.
2. Phishing incident.
3. Malware alert.
4. Suspicious PowerShell.
5. Failed authentication storm.
6. Privilege escalation.
7. Vulnerability finding.
8. Misconfigured firewall.
9. DNS anomaly.
10. Suspicious network traffic.

### Investigation Interface

Provide:

- Network diagram
- Device status
- Logs
- Alerts
- User information
- Process information
- Timeline
- Previous change history

Make the learner investigate rather than immediately revealing the answer.

---

# PHASE 23 — FULL SOC CAPSTONE

Build a fictional enterprise SOC.

Environment:

Internet
↓
Firewall
↓
Network
↓
Servers
↓
Endpoints
↓
Identity Infrastructure
↓
SIEM/EDR

Create a simulated multi-stage incident.

Example:
Phishing → compromised credentials → suspicious authentication → malicious process → lateral movement simulation → alert → incident response.

The learner must:

1. Detect.
2. Triage.
3. Investigate.
4. Collect evidence.
5. Contain.
6. Recommend remediation.
7. Recover.
8. Document lessons learned.

---

# PHASE 24 — SECURITY+ EXAM PREPARATION

Build:

- Domain quizzes
- Scenario questions
- Performance-based questions
- Timed assessments
- Mock exams
- Weak-area review
- Adaptive testing

Do not reveal answers before the learner attempts them.

Explain:

- Correct answer
- Why it is correct
- Why distractors are wrong
- What exam clue identifies the answer

---

# PHASE 25 — GITHUB CYBERSECURITY PORTFOLIO

Every major lab should become a professional GitHub project.

Use:

README.md
architecture/
configs/
screenshots/
logs/
evidence/
reports/
troubleshooting/
lessons-learned/

Generate:

- Project summary
- Objectives
- Architecture
- Technologies
- Implementation
- Findings
- Remediation
- Validation
- Lessons learned

Never include secrets or sensitive information.

---

# PHASE 26 — CAREER MODE

Prepare for:

- SOC Analyst I
- Junior Security Analyst
- Cybersecurity Analyst
- Security Operations Analyst
- IT Security Technician
- IAM Analyst
- Junior IAM Engineer
- Security Support Specialist

When given a job description:

1. Extract required skills.
2. Map them to Security+ concepts.
3. Identify gaps.
4. Build targeted labs.
5. Generate interview questions.
6. Generate troubleshooting scenarios.
7. Recommend portfolio projects.

Never fabricate professional experience.

---

# PHASE 27 — SECURITY+ → IAM CAREER BRIDGE

Continuously connect Security+ concepts to IAM.

For relevant lessons explain:

- How authentication is implemented.
- How authorization is implemented.
- How MFA works.
- How SSO works.
- How RBAC works.
- How Zero Trust affects identity.
- How privileged access is managed.
- How identity events appear in logs.
- How IAM incidents are investigated.

Later introduce:

- Microsoft Entra ID
- Active Directory
- Okta
- Ping Identity
- CyberArk
- SailPoint

Teach the underlying concepts before vendor-specific implementations.

---

# 3D EXPERIENCE REQUIREMENTS

The 3D lab must be an actual training interface.

### Interactive Objects

- Router
- Switch
- Firewall
- Server
- PC
- Laptop
- AP
- Domain Controller
- SIEM
- Security workstation
- Cloud environment

### Interaction

Click device → inspect:

- IP
- MAC
- Interfaces
- Status
- Users
- Security state
- Events

### Visualizations

Create:

- Authentication flow
- Packet flow
- Attack path
- Incident timeline
- Network segmentation
- Vulnerability severity
- Security alert propagation
- IAM lifecycle
- Encryption/TLS flow

Provide:

- Orbit
- Pan
- Zoom
- Labels
- Tooltips
- Search
- 2D fallback

---

# MASTER LEARNING ENGINE

Every lesson should follow:

1. Learning objectives
2. Beginner explanation
3. Technical explanation
4. Visual explanation
5. Real-world example
6. Security scenario
7. Hands-on lab
8. Troubleshooting challenge
9. Quiz
10. Review
11. Homework
12. Career connection

---

# QUIZ SYSTEM

After major lessons:

### Beginner

5 questions

### Intermediate

5 questions

### Advanced

5 questions

### Scenario

5 questions

### PBQ

1 practical exercise

Do not reveal answers until submitted.

Track:

- Score
- Accuracy
- Weak concepts
- Improvement
- Time

---

# MASTERY SYSTEM

Use:

LEVEL 0 — Never encountered
LEVEL 1 — Recognize
LEVEL 2 — Understand
LEVEL 3 — Explain
LEVEL 4 — Apply
LEVEL 5 — Implement/Troubleshoot
LEVEL 6 — Teach

Do not mark mastery from memorization alone.

---

# SPACED REPETITION

Maintain weak areas.

Example:

- Kerberos
- PKI
- IAM
- ACLs
- Incident response
- CVSS

Reintroduce weak areas into future assessments.

---

# PROGRESS DASHBOARD

Maintain:

SECURITY+ PROGRESS

Overall: 0%

Foundations: 0%
Threats: 0%
Architecture: 0%
IAM: 0%
Cryptography: 0%
Security Operations: 0%
Vulnerability Management: 0%
Incident Response: 0%
Cloud Security: 0%
Governance/Risk: 0%
Automation: 0%

Labs Completed: 0
Quiz Average: N/A
PBQ Score: N/A
Troubleshooting Score: N/A
GitHub Projects: 0
Exam Readiness: NOT READY

Weak Areas:
None

Strong Areas:
None

---

# DAILY MODE

When I say:

**START TODAY'S SECURITY+ LESSON**

do:

1. Check progress.
2. Review weak areas.
3. Select next lesson.
4. Teach it.
5. Run a hands-on exercise.
6. Give troubleshooting challenge.
7. Quiz me.
8. Grade me.
9. Update progress.
10. Give homework.
11. Preview the next lesson.

---

# MOCK EXAM MODE

When I say:

**START SECURITY+ MOCK EXAM**

simulate a realistic exam.

Do not reveal answers during the exam.

Afterward provide:

- Overall score
- Domain scores
- PBQ performance
- Weak areas
- Strong areas
- Study recommendations
- Exam-readiness assessment

Create multiple versions.

---

# TROUBLESHOOTING / SOCRATIC MODE

Do not immediately provide solutions.

Ask:

- What happened?
- What evidence do you have?
- What would you check first?
- Which log would help?
- What hypothesis are you testing?
- What would prove/disprove it?

Give progressive hints.

---

# ETHICAL SECURITY REQUIREMENTS

All offensive/security testing must be performed only against:

- The learner's own systems.
- An intentionally vulnerable lab.
- Systems for which explicit authorization exists.

Do not build functionality designed to attack public or unauthorized targets.

Use simulations when possible.

---

# PHASE GATES

Do not build all phases in one pass.

At the end of each phase produce:

## PHASE COMPLETION REPORT

- Features
- Labs
- 3D components
- Tests
- Security review
- Known issues
- Documentation
- Acceptance criteria
- Evidence
- Next phase

---

# FIRST TASK

Do NOT build the entire application now.

First:

1. Inspect the repository.
2. Verify the current official CompTIA Security+ exam version/objectives if internet access is available.
3. Propose application architecture.
4. Propose technology stack.
5. Propose 3D architecture.
6. Propose lab simulation architecture.
7. Propose data models.
8. Propose progress/mastery architecture.
9. Propose the complete implementation roadmap.
10. Build PHASE 0 only.
11. Test PHASE 0.
12. Produce a Phase 0 completion report.

Wait for approval before proceeding to the next phase.

The final goal is:

**ZERO → SECURITY FUNDAMENTALS → SECURITY+ → HANDS-ON LABS → SOC/IAM SKILLS → GITHUB PORTFOLIO → INTERVIEWS → JUNIOR CYBERSECURITY PROFESSIONAL**
