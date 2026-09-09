import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 9 — Linux Security
// Aligned with CompTIA Security+ SY0-701
//
// The direct counterpart to Phase 8. Same questions — who has privilege, what
// runs at boot, what is logged, what is exposed — asked in a different
// dialect. The final lesson makes that mapping explicit, because the transfer
// is the point rather than a bonus.
//
// Two labs are hands-on ("create users", "harden SSH"), so both carry the same
// owned-environment scoping as Phase 8.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p9-lesson-0',
    phaseId: 'phase-9',
    title: 'Users, Groups and sudo',
    objectives: [
      'Read /etc/passwd, /etc/shadow and /etc/group correctly',
      'Explain what UID 0 means and why it is not about the name',
      'Interpret a sudoers grant and identify an over-broad one',
      'Distinguish service accounts from human accounts',
    ],
    concepts: ['linux-users', 'linux-groups', 'sudo', 'least-privilege'],
    homework:
      'On a Linux machine or VM you own, run sudo -l and write down exactly what you are permitted to run as root. Explain why a scoped grant beats full sudo.',
    careerConnection:
      'Reading a sudoers entry correctly is a routine review task, and spotting NOPASSWD: ALL is the finding that matters most.',
    sections: [
      {
        id: 'p9-l0-s0',
        title: 'Concept — Where account data lives',
        body: '/etc/passwd holds the account list and is world-readable by design: username, UID, GID, home directory and login shell. Password hashes live in /etc/shadow, which is not readable by ordinary users. /etc/group defines group membership. The shell field matters for security — a service account with /usr/sbin/nologin cannot log in interactively, and one with /bin/bash can.',
      },
      {
        id: 'p9-l0-s1',
        title: 'Concept — UID 0 is what matters, not the name',
        body: 'Linux privilege is defined by UID 0, not by the name "root". An account named anything at all with UID 0 has full privilege, and a second UID 0 account is a classic backdoor precisely because it does not look like root in a casual listing. This is the same lesson as the Windows RID 500: the identifier is authoritative and the name is decoration.',
      },
      {
        id: 'p9-l0-s2',
        title: 'Concept — Reading /etc/shadow safely',
        body: 'The second field encodes account state. An asterisk means no password login is possible. An exclamation mark means locked. A value starting $6$ is a SHA-512 hash, $y$ is yescrypt, and older $1$ is MD5 and should not still exist. The later fields carry ageing policy — maximum age of 99999 days means the password effectively never expires, which is common and usually deliberate for service accounts.',
      },
      {
        id: 'p9-l0-s3',
        title: 'Concept — sudo and the sudoers file',
        body: 'sudo grants specific elevation rather than a general one. A well-scoped entry names exact commands, as analyst1 had in Phase 1: one systemctl invocation. The entry to look for and question is (ALL : ALL) NOPASSWD: ALL, which permits becoming any user including root, running anything, without re-entering a password. Note that even a narrow grant can be dangerous if the permitted command can spawn a shell — an editor or an interpreter granted through sudo is effectively full root.',
      },
      {
        id: 'p9-l0-s4',
        title: 'Example — Two grants, very different risk',
        body: 'On SRV-01, analyst1 may run exactly one command: systemctl restart nginx. The account "deploy" holds (ALL : ALL) NOPASSWD: ALL. The first is least privilege working correctly. The second is unrestricted root without even a password prompt — and "deploy" was not present in the Phase 1 enumeration, so it was added at some point and nobody reviewed it.',
      },
      {
        id: 'p9-l0-s5',
        title: 'Review — What must stick',
        body: 'passwd is world-readable and holds accounts; shadow holds hashes and is not. Shell field decides interactive logon. UID 0 is privilege, regardless of name — a second UID 0 account is a backdoor. Scoped sudo entries are the goal; (ALL : ALL) NOPASSWD: ALL is unrestricted root. A sudo grant on any command that can spawn a shell is effectively full root.',
      },
    ],
    quiz: [
      {
        id: 'p9-q0',
        type: 'scenario',
        stem: 'An account named "backup" has UID 0 in /etc/passwd. What does this mean?',
        options: [
          'It is a normal service account with backup privileges',
          'It has full root privilege, because privilege is defined by UID 0 rather than the name',
          'It can only read files, not modify them',
          'The entry is invalid and will be ignored',
        ],
        answer: 1,
        explanation:
          'UID 0 is root privilege regardless of the account name. A second UID 0 account is a well-known backdoor precisely because it does not look like root in a casual listing.',
        examClue:
          'On Linux check the UID, not the name — the same way you check the SID and not the name on Windows.',
        domain: 'Security Operations',
        conceptId: 'linux-users',
      },
      {
        id: 'p9-q1',
        type: 'mcq',
        stem: 'Which sudoers entry represents the greatest risk?',
        options: [
          'analyst1 ALL=(ALL) /usr/bin/systemctl restart nginx',
          'deploy ALL=(ALL : ALL) NOPASSWD: ALL',
          'backup ALL=(root) /usr/bin/rsync',
          'ops ALL=(ALL) /usr/bin/systemctl status *',
        ],
        answer: 1,
        explanation:
          'It permits running anything, as any user, without re-entering a password. The others are scoped to specific commands — though note a scoped grant on a command that can spawn a shell is also effectively full root.',
        domain: 'Security Operations',
        conceptId: 'sudo',
      },
      {
        id: 'p9-q2',
        type: 'mcq',
        stem: 'Why is /etc/passwd world-readable while /etc/shadow is not?',
        options: [
          'Historical accident with no security rationale',
          'passwd holds non-sensitive account metadata many programs need; hashes were moved to shadow so they are not exposed',
          'shadow is encrypted, so it needs different permissions',
          'passwd is only readable on servers, not workstations',
        ],
        answer: 1,
        explanation:
          'Many programs need to map UIDs to names, so that data stays readable. Password hashes were split into /etc/shadow specifically so a world-readable file would not expose them to offline cracking.',
        domain: 'Security Architecture',
        conceptId: 'linux-users',
      },
    ],
  },

  {
    id: 'p9-lesson-1',
    phaseId: 'phase-9',
    title: 'File Permissions and the Special Bits',
    objectives: [
      'Read and compute permission modes in symbolic and numeric form',
      'Explain SUID, SGID and the sticky bit',
      'Explain why directory permissions behave differently from file permissions',
      'Identify a SUID binary as a privilege-escalation path',
    ],
    concepts: ['linux-permissions', 'file-permissions', 'suid', 'privilege-escalation'],
    homework:
      'Write out the permission string for a file that its owner can read and write, its group can read, and nobody else can access — in both symbolic and octal form. Then explain what SUID would add and why that is dangerous.',
    careerConnection:
      'Finding an unexpected SUID root binary is one of the highest-value things a Linux audit turns up.',
    sections: [
      {
        id: 'p9-l1-s0',
        title: 'Concept — Reading a mode',
        body: 'A mode string is type plus three triplets: owner, group, other. -rwxr-xr-x is a regular file the owner may read, write and execute, and everyone else may read and execute. Numerically r is 4, w is 2 and x is 1, so rwx is 7, rw- is 6 and r-x is 5 — giving 755 for that example. Both notations describe the same thing and you will meet both.',
      },
      {
        id: 'p9-l1-s1',
        title: 'Concept — Directories do not mean what files mean',
        body: 'This trips people up constantly. On a directory, read lists the names inside, execute permits traversing into it, and write permits creating and deleting entries. The consequence is important: write permission on a directory lets you delete files you have no write permission on, because deletion modifies the directory rather than the file. That is exactly what the sticky bit exists to prevent.',
      },
      {
        id: 'p9-l1-s2',
        title: 'Concept — SUID, SGID and sticky',
        body: 'SUID (4000) makes a binary run as its owner rather than as the invoking user, so a root-owned SUID binary runs as root for anyone who executes it. SGID (2000) does the same for the group, and on a directory it makes new files inherit the directory group. The sticky bit (1000) on a directory means only a file owner may delete their own files — which is why /tmp is mode 1777 and yet not chaos.',
      },
      {
        id: 'p9-l1-s3',
        title: 'Concept — Why SUID is a privilege-escalation path',
        body: 'A SUID root binary is code running as root that an unprivileged user can invoke. If it has any flaw — a command injection, a path it trusts, an ability to spawn a shell — that flaw becomes root access. This is why enumerating SUID binaries is a standard step in both attack and audit, and why anything unexpected under /usr/local deserves investigation before anything else on the host.',
      },
      {
        id: 'p9-l1-s4',
        title: 'Example — Two findings, different weights',
        body: 'Phase 1 showed deploy.sh at mode 777 — world-writable and executable, meaning any user can rewrite what root later runs. This phase finds /usr/local/bin/backup-helper as SUID root, created two minutes after the Phase 7 intrusion. Both are serious, but the second is not a hardening finding at all: it is active persistence, and the creation timestamp is what tells you so.',
      },
      {
        id: 'p9-l1-s5',
        title: 'Review — What must stick',
        body: 'Owner, group, other; r4 w2 x1. Directories: read lists, execute traverses, write creates and deletes — so directory write lets you delete files you cannot write. SUID runs as the owner, SGID as the group, sticky restricts deletion to owners. Unexpected SUID root binaries are escalation paths and are worth checking first.',
      },
    ],
    quiz: [
      {
        id: 'p9-q3',
        type: 'scenario',
        stem: 'A user has write permission on a directory but no write permission on a file inside it. Can they delete the file?',
        options: [
          'No — file permissions prevent it',
          'Yes — deletion modifies the directory, not the file, unless the sticky bit is set',
          'Only if they own the file',
          'Only with sudo',
        ],
        answer: 1,
        explanation:
          'Removing a directory entry is a directory write operation. This is precisely why /tmp carries the sticky bit — without it any user could delete another user temporary files.',
        examClue:
          'For directory questions, think about what the operation modifies: creating and deleting entries modifies the directory.',
        domain: 'Security Architecture',
        conceptId: 'file-permissions',
      },
      {
        id: 'p9-q4',
        type: 'mcq',
        stem: 'What does the mode -rwsr-xr-x indicate?',
        options: [
          'A directory with the sticky bit set',
          'A SUID binary that executes with the privileges of its owner',
          'A symbolic link to a system binary',
          'A file that cannot be executed',
        ],
        answer: 1,
        explanation:
          'The s in the owner execute position is SUID. If the owner is root, the binary runs as root for any user who executes it — which is why an unexpected one is a privilege-escalation path.',
        domain: 'Security Operations',
        conceptId: 'suid',
      },
      {
        id: 'p9-q5',
        type: 'scenario',
        stem: 'An audit finds /usr/local/bin/backup-helper is SUID root and was created during a known intrusion window. What is the correct first action?',
        options: [
          'Remove the SUID bit and continue the audit',
          'Investigate it as active persistence, preserving evidence of how it was created',
          'Move it to /usr/bin so it matches other binaries',
          'Change its owner to a service account',
        ],
        answer: 1,
        explanation:
          'A creation timestamp inside an incident window turns a configuration finding into an investigation. Removing it first destroys evidence of how it was placed and whether anything else was left behind — the same judgement as the Phase 8 scheduled task.',
        domain: 'Security Operations',
        conceptId: 'privilege-escalation',
      },
    ],
  },

  {
    id: 'p9-lesson-2',
    phaseId: 'phase-9',
    title: 'SSH, Services and systemd',
    objectives: [
      'Identify the SSH settings that matter most for hardening',
      'Sequence SSH changes so you do not lock yourself out',
      'Read a systemd unit and identify persistence',
      'Explain firewall and package-management exposure',
    ],
    concepts: ['ssh', 'systemd', 'linux-services', 'firewall-concepts', 'package-management'],
    homework:
      'Write an SSH hardening checklist of five settings, and for each one name the attack it removes. Apply them to a VM you own, not a system you do not.',
    careerConnection:
      'SSH hardening is a standard first task on any new Linux host, and the lockout mistake is one people make exactly once.',
    sections: [
      {
        id: 'p9-l2-s0',
        title: 'Concept — The SSH settings that matter',
        body: 'PermitRootLogin and PasswordAuthentication are the pair that decides whether root is directly brute-forceable over the network. Setting either to no breaks that path; setting both correctly is the goal. Beyond those: MaxAuthTries limits attempts per connection, AllowUsers gives an explicit allowlist, ClientAliveInterval expires idle sessions, and X11Forwarding is attack surface a server does not need.',
      },
      {
        id: 'p9-l2-s1',
        title: 'Concept — The sequencing that prevents lockout',
        body: 'Disabling password authentication before confirming key-based login works is how people lock themselves out of remote servers, and the fix requires console access you may not have. Always: configure keys, open a second session and verify it works, validate the config with sshd -t, then reload. Keep the first session open throughout. This is a practical habit rather than a security control, and it is the difference between a routine change and an outage.',
      },
      {
        id: 'p9-l2-s2',
        title: 'Concept — systemd units',
        body: 'systemd manages services through unit files. Four fields matter when reviewing one: ExecStart is what runs, User decides with what privilege, Restart=always makes it survive being killed, and WantedBy=multi-user.target makes it start at boot. A unit combining a benign name, root, always-restart and boot persistence is the systemd expression of exactly the pattern Phase 8 found in a scheduled task.',
      },
      {
        id: 'p9-l2-s3',
        title: 'Concept — Host firewall and redundant rules',
        body: 'ufw, firewalld and nftables are front-ends to the same kernel filtering. Default-deny inbound with an explicit allowlist is the target configuration. Watch for redundant rules: SRV-01 permits 5432 from the local subnet while postgres is bound to loopback only, so the rule grants nothing. That is either deliberate layering or a leftover from an earlier design — and knowing which requires asking, because redundant rules accumulate until nobody dares remove any of them.',
      },
      {
        id: 'p9-l2-s4',
        title: 'Concept — Package management as a trust decision',
        body: 'apt and dnf install software as root, so every configured repository is something you have decided to trust completely. Two settings undo that trust: trusted=yes disables signature verification, and a plain http source means the transport is unauthenticated as well. Together they mean anyone who can intercept the connection can install packages as root. This is the Phase 3 supply-chain lesson reduced to a single configuration line.',
      },
      {
        id: 'p9-l2-s5',
        title: 'Review — What must stick',
        body: 'PermitRootLogin and PasswordAuthentication are the pair that matters; MaxAuthTries, AllowUsers, ClientAliveInterval and X11Forwarding follow. Verify key login in a second session, run sshd -t, then reload. systemd persistence reads as root plus Restart=always plus WantedBy=multi-user.target. Default-deny inbound. trusted=yes plus http is remote root.',
      },
    ],
    quiz: [
      {
        id: 'p9-q6',
        type: 'scenario',
        stem: 'You are hardening SSH on a remote server. In what order should you disable password authentication?',
        options: [
          'Set PasswordAuthentication no, reload, then configure keys',
          'Configure keys, verify key login works in a second session, validate with sshd -t, then disable passwords and reload',
          'Disable passwords and root login simultaneously, then test',
          'Reboot the server first to clear existing sessions',
        ],
        answer: 1,
        explanation:
          'Verify the replacement works before removing the existing method, and keep the original session open. Disabling passwords before confirming keys work locks you out of a remote host, and recovery needs console access you may not have.',
        examClue:
          'On remote-access changes, the safe answer always verifies the new path before removing the old one.',
        domain: 'Security Operations',
        conceptId: 'ssh',
      },
      {
        id: 'p9-q7',
        type: 'scenario',
        stem: 'A systemd unit runs as root with Restart=always and WantedBy=multi-user.target, created during an intrusion window. What do those three settings achieve for an attacker?',
        options: [
          'Faster execution and lower resource usage',
          'Root privilege, survival if the process is killed, and automatic start at boot',
          'Encrypted communication with the attacker infrastructure',
          'Concealment from the process list',
        ],
        answer: 1,
        explanation:
          'Those three fields give privilege, resilience and boot persistence. It is the same pattern as a malicious Windows scheduled task, expressed through systemd.',
        domain: 'Security Operations',
        conceptId: 'systemd',
      },
      {
        id: 'p9-q8',
        type: 'scenario',
        stem: 'An apt source is configured as: deb [trusted=yes] http://packages.vendor.example/ubuntu jammy main. What is the risk?',
        options: [
          'Slower package downloads',
          'Signature verification is disabled and the transport is unauthenticated, so an interceptor can install packages as root',
          'Packages will fail to install without a GPG key',
          'The repository will be ignored by apt',
        ],
        answer: 1,
        explanation:
          'trusted=yes skips signature checks and http provides no transport authentication. Since apt installs as root, this is a remote root compromise waiting for someone on the path.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'package-management',
      },
    ],
  },

  {
    id: 'p9-lesson-3',
    phaseId: 'phase-9',
    title: 'Linux Logs, auditd and Secure Configuration',
    objectives: [
      'Read Linux authentication and sudo logs',
      'Explain what auditd adds and how rules are written',
      'Identify logging gaps that hide an intrusion',
      'Map Windows security concepts onto their Linux equivalents',
    ],
    concepts: ['linux-logs', 'auditd', 'secure-configuration', 'platform-mapping'],
    homework:
      'Find the authentication log on a Linux machine you own and locate one successful and one failed login. Write down which fields let you tell them apart.',
    careerConnection:
      'Being fluent in both platforms is what makes an analyst useful on a mixed estate, which is nearly all of them.',
    sections: [
      {
        id: 'p9-l3-s0',
        title: 'Concept — Where Linux logs live',
        body: 'Authentication events land in /var/log/auth.log on Debian-family systems and /var/log/secure on RHEL-family, or in the systemd journal via journalctl. sshd records accepted and failed authentications with the source address and the method used. sudo records the invoking user, the terminal, the working directory, the target user and the exact command. Between those two you can reconstruct most of what a person did.',
      },
      {
        id: 'p9-l3-s1',
        title: 'Concept — Reading the method, not just the outcome',
        body: 'The SRV-01 log shows more than a thousand password failures followed by a success — but the success reads "Accepted publickey". The brute force never worked; the attacker already had a key. That single word changes the whole story, and an analyst who only counted failures and successes would conclude the opposite. Read what the log actually says, not the shape you expect.',
      },
      {
        id: 'p9-l3-s2',
        title: 'Concept — auditd',
        body: 'auditd is the Linux counterpart to Sysmon: kernel-level auditing beyond what applications log themselves. Rules read simply once you know the flags — -w watches a path, -p wa means alert on write and attribute changes, and -k tags events with a searchable key. Watching /etc/passwd, /etc/shadow and /etc/sudoers catches identity and privilege changes that no application would report.',
      },
      {
        id: 'p9-l3-s3',
        title: 'Concept — The gaps matter more than the rules',
        body: 'SRV-01 watches the standard identity and privilege files, which is a reasonable baseline. It does not watch /etc/systemd/system/ or /usr/local/bin/ — and the intrusion placed a unit file in one and a SUID binary in the other. A rule set is only as good as its coverage of the places an attacker actually writes to, and reviewing coverage against known persistence locations is a concrete, useful exercise.',
      },
      {
        id: 'p9-l3-s4',
        title: 'Concept — The Windows-to-Linux mapping',
        body: 'Every question from Phase 8 has an answer here. Privileged identity: RID 500 becomes UID 0. Elevation: UAC and the administrators group become sudo and sudoers. Escalation via a file: a writable service binary becomes a SUID root binary. Persistence: scheduled tasks and Run keys become systemd units, cron and SUID binaries. Process auditing: Sysmon becomes auditd. The concepts are identical and only the dialect changes.',
      },
      {
        id: 'p9-l3-s5',
        title: 'Scenario — One intrusion, two platforms',
        body: 'The same attacker touched both hosts. On WS-01 they left a scheduled task running hidden PowerShell as SYSTEM every thirty minutes. On SRV-01 they left a SUID root binary and a systemd unit that restarts always and starts at boot. Different mechanisms, identical intent: privilege, resilience, persistence. Recognising that shape on any platform is more durable than memorising either mechanism.',
      },
      {
        id: 'p9-l3-s6',
        title: 'Review — What must stick',
        body: 'auth.log or secure or journalctl; sshd and sudo carry most of the story. Read the authentication method, not just success or failure. auditd: -w watches, -p wa is write and attribute, -k tags. Check rule coverage against real persistence locations. And carry the mapping: UID 0 for RID 500, sudo for UAC, SUID for writable service binary, systemd for scheduled task, auditd for Sysmon.',
      },
    ],
    quiz: [
      {
        id: 'p9-q9',
        type: 'scenario',
        stem: 'auth.log shows 1,204 failed password attempts from one address, then "Accepted publickey for deploy" from the same address. What actually happened?',
        options: [
          'The brute force eventually succeeded',
          'The password attempts failed; the attacker authenticated with a key they already possessed',
          'The account was locked and then reset',
          'The log entries are unrelated',
        ],
        answer: 1,
        explanation:
          'The success reads publickey, not password. The brute force was noise; the attacker already had a key. Reading the method rather than just the outcome is what separates the two conclusions.',
        examClue:
          'In authentication logs, always read which method succeeded — it often contradicts the obvious narrative.',
        domain: 'Security Operations',
        conceptId: 'linux-logs',
      },
      {
        id: 'p9-q10',
        type: 'mcq',
        stem: 'In the auditd rule -w /etc/sudoers -p wa -k privilege, what does -p wa specify?',
        options: [
          'Watch for process and application events',
          'Alert on write and attribute changes to the path',
          'Set the priority to warning',
          'Permit all access to the file',
        ],
        answer: 1,
        explanation:
          '-p sets the permissions to watch: w for write and a for attribute change. -w names the path and -k tags matching events with a searchable key.',
        domain: 'Security Operations',
        conceptId: 'auditd',
      },
      {
        id: 'p9-q11',
        type: 'mcq',
        stem: 'Which Linux mechanism is the closest counterpart to a malicious Windows scheduled task?',
        options: [
          'An entry in /etc/passwd',
          'A systemd unit with Restart=always and WantedBy=multi-user.target',
          'A ufw firewall rule',
          'An apt repository entry',
        ],
        answer: 1,
        explanation:
          'Both give privilege, survival and boot persistence. cron is the other common answer; the shape to recognise is privilege plus resilience plus automatic start.',
        domain: 'Security Operations',
        conceptId: 'platform-mapping',
      },
      {
        id: 'p9-q12',
        type: 'pbq',
        stem: 'Map each Windows concept to its Linux counterpart. Select in this order: RID 500, UAC elevation, Sysmon, malicious scheduled task.',
        options: ['UID 0', 'sudo', 'auditd', 'systemd unit'],
        answer: [0, 1, 2, 3],
        explanation:
          'RID 500 maps to UID 0, UAC elevation to sudo, Sysmon to auditd, and a malicious scheduled task to a systemd unit or cron job. The questions are identical across platforms; only the dialect changes.',
        domain: 'Security Operations',
        conceptId: 'platform-mapping',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p9-lab-0',
    phaseId: 'phase-9',
    title: 'Create Users and Review sudo',
    objective:
      'Enumerate accounts and sudo grants on SRV-01, identify an over-broad grant, then create a correctly scoped user on a Linux VM you own.',
    securityConcepts: ['Linux users', 'Groups', 'sudo scope', 'Least privilege'],
    environment:
      'Simulated enumeration in-platform, plus real commands for a Linux VM you own or are authorised to administer',
    topology: 'SRV-01 (Ubuntu 22.04)',
    prerequisites: ['Complete Phase 8'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the account list and note which accounts can log in interactively.',
        command: 'cat /etc/passwd',
        expected: 'Service accounts use nologin; postgres and analyst1 have /bin/bash.',
      },
      {
        id: 's1',
        instruction: 'Review account state and password ageing.',
        command: 'cat /etc/shadow',
        expected: 'Hashes redacted; * means no password login, ! means locked.',
      },
      {
        id: 's2',
        instruction: 'Check who holds sudo group membership.',
        command: 'getent group sudo',
        expected: 'analyst1 and deploy — deploy was not in the Phase 1 enumeration.',
      },
      {
        id: 's3',
        instruction: 'Inspect the sudo grant held by deploy.',
        command: 'sudo -l -u deploy',
        expected: '(ALL : ALL) NOPASSWD: ALL — unrestricted root without a password.',
      },
      {
        id: 's4',
        instruction:
          'ON YOUR OWN VM ONLY: create a user and a group, then grant one scoped sudo command. Do this on a machine you own or are authorised to administer.',
        expected:
          'sudo adduser labuser; sudo groupadd labreaders; sudo usermod -aG labreaders labuser; then visudo to add: labuser ALL=(root) /usr/bin/systemctl status nginx',
      },
    ],
    expectedResults: [
      'Accounts enumerated with interactive shells identified',
      'Account state read from the shadow fields',
      'Over-broad sudo grant identified',
      'A correctly scoped user and sudo rule created on the learner own VM',
    ],
    verification: [
      'Learner can explain why /etc/passwd is world-readable and /etc/shadow is not',
      'Learner can explain why UID 0 matters more than the account name',
      'Learner can explain why NOPASSWD: ALL is the finding that matters',
    ],
    troubleshooting: [
      'Always edit sudoers with visudo — it validates syntax before saving, and a broken sudoers file can lock out all elevation.',
      'Commands refused → you need root on YOUR OWN lab VM. Never work around this on a machine you do not administer.',
    ],
    challenge:
      'A scoped sudo grant can still be full root if the permitted command can spawn a shell. Name three commands that would be dangerous to grant even narrowly, and explain the mechanism for each.',
    evidence: [
      {
        id: 'ev0',
        label: 'Account and sudo review',
        type: 'report',
        placeholder: 'Account, UID, shell, groups, sudo grant, risk',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Privilege on Linux is UID 0 and sudo scope, in the same way it is SID and group membership on Windows. An account added to a privileged group outside your process is the same finding on both platforms.',
  },

  {
    id: 'p9-lab-1',
    phaseId: 'phase-9',
    title: 'Configure and Audit File Permissions',
    objective:
      'Read permission modes including the special bits, and find the SUID binary that should not be there.',
    securityConcepts: ['File permissions', 'SUID', 'SGID', 'Sticky bit', 'Privilege escalation'],
    environment: 'Deterministic simulator — prepared filesystem artifacts, nothing is executed',
    topology: 'SRV-01 filesystem',
    prerequisites: ['Complete "Create Users and Review sudo"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review how Linux permissions and the special bits work.',
        command: 'explain linux permissions',
        expected: 'Triplets, numeric values, SUID/SGID/sticky, and the directory rules.',
      },
      {
        id: 's1',
        instruction: 'Enumerate SUID binaries on the host.',
        command: 'find / -perm -4000',
        expected: 'Eight results; one under /usr/local is not standard.',
      },
      {
        id: 's2',
        instruction: 'Inspect the non-standard SUID binary in detail.',
        command: 'ls -la /usr/local/bin/backup-helper',
        expected: 'Mode 4755, owner root, created during the intrusion window.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the world-writable file found in Phase 1.',
        command: 'ls -la /var/www',
        expected: 'deploy.sh at mode 777 — a separate finding.',
      },
    ],
    expectedResults: [
      'Permission modes read in both notations',
      'Directory permission semantics understood',
      'Non-standard SUID binary identified',
      'Creation timestamp correlated with the incident',
    ],
    verification: [
      'Learner can compute a numeric mode from a symbolic one',
      'Learner can explain why directory write permits deleting files you cannot write',
      'Learner can explain why an unexpected SUID root binary is investigated first',
    ],
    troubleshooting: [
      'Mode string confusing → read type, owner, group, other; an s in an execute position is SUID or SGID.',
      'Unsure whether a SUID binary is legitimate → anything under /usr/local is locally installed and deserves scrutiny.',
    ],
    challenge:
      'Explain why /tmp is mode 1777 and why that is safe. Then describe what would go wrong on a shared host if the sticky bit were removed.',
    evidence: [
      {
        id: 'ev0',
        label: 'Permission findings',
        type: 'report',
        placeholder: 'Path, mode, owner, why it matters',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A SUID root binary is code running as root that any user can invoke, so any flaw in it becomes root access. Enumerating SUID binaries is a standard step in both attack and audit — do it before anything else on a suspect host.',
  },

  {
    id: 'p9-lab-2',
    phaseId: 'phase-9',
    title: 'Harden SSH',
    objective:
      'Audit an sshd configuration, identify the settings that matter, and apply the changes in an order that cannot lock you out.',
    securityConcepts: ['SSH hardening', 'Key-based authentication', 'Change sequencing'],
    environment:
      'Simulated configuration review in-platform, plus real commands for a Linux VM you own',
    topology: 'SRV-01 sshd on port 22',
    prerequisites: ['Complete "Configure and Audit File Permissions"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the current sshd configuration and identify the findings.',
        command: 'show sshd config',
        expected: 'PermitRootLogin yes and PasswordAuthentication yes among six findings.',
      },
      {
        id: 's1',
        instruction: 'Review the recommended changes and the sequencing warning.',
        command: 'harden sshd',
        expected: 'Six changes, with a warning about verifying keys before disabling passwords.',
      },
      {
        id: 's2',
        instruction: 'Check the host firewall exposure alongside SSH.',
        command: 'show ufw status',
        expected: 'Default deny inbound; 22, 80, 443 open; a redundant postgres rule.',
      },
      {
        id: 's3',
        instruction:
          'ON YOUR OWN VM ONLY: apply the hardening to a Linux VM you own. Keep your current session open, verify key login in a second session, run sshd -t, then reload.',
        expected: 'sudo sshd -t && sudo systemctl reload sshd, with a verified second session.',
      },
    ],
    expectedResults: [
      'Six sshd findings identified',
      'The PermitRootLogin and PasswordAuthentication pairing understood',
      'Firewall exposure reviewed alongside the service',
      'Changes applied safely on the learner own VM',
    ],
    verification: [
      'Learner can name the two settings that decide whether root is brute-forceable',
      'Learner can state the order that prevents lockout',
      'Learner can explain what sshd -t does and why it comes before reload',
    ],
    troubleshooting: [
      'Locked out after a change → this is why you keep the first session open and test in a second. Recovery otherwise needs console access.',
      'Config looks right but behaviour is wrong → later directives can override earlier ones. Verify with sshd -T rather than reading the file.',
    ],
    challenge:
      'Write the change plan you would submit for review: each setting, its current and target value, the risk it addresses, and the rollback step if the change goes wrong.',
    evidence: [
      {
        id: 'ev0',
        label: 'SSH hardening plan',
        type: 'report',
        placeholder: 'Setting, from, to, risk addressed, rollback',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Verify the replacement before removing what it replaces. Disabling password authentication before confirming keys work is the classic way to lock yourself out of a remote host, and the recovery needs access you may not have.',
  },

  {
    id: 'p9-lab-3',
    phaseId: 'phase-9',
    title: 'Inspect Authentication Logs',
    objective:
      'Read Linux authentication logs, distinguish the attack from the actual compromise, and identify the audit coverage gaps.',
    securityConcepts: ['Linux logs', 'Authentication analysis', 'auditd', 'Logging gaps'],
    environment: 'Deterministic simulator — prepared log artifacts, nothing is executed',
    topology: 'SRV-01 auth.log and auditd',
    prerequisites: ['Complete "Harden SSH"'],
    steps: [
      {
        id: 's0',
        instruction: 'Read the authentication log around the intrusion.',
        command: 'show auth log linux',
        expected: 'Over a thousand password failures, then a publickey success.',
      },
      {
        id: 's1',
        instruction: 'Review the auditd rules and find the coverage gaps.',
        command: 'show auditd rules',
        expected: 'Identity and privilege files watched; systemd and /usr/local are not.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the Windows authentication events for comparison.',
        command: 'get-eventlog -logname security -newest 5',
        expected: 'The same story in Windows event IDs.',
      },
    ],
    expectedResults: [
      'Authentication method distinguished from outcome',
      'The brute force recognised as noise rather than the compromise',
      'Privilege escalation to a root shell identified',
      'auditd coverage gaps mapped to the persistence locations used',
    ],
    verification: [
      'Learner can explain why "Accepted publickey" changes the conclusion',
      'Learner can read an auditd rule',
      'Learner can name the two audit gaps the intrusion used',
    ],
    troubleshooting: [
      'Log volume overwhelming → filter by source address first, then look at what changed between failure and success.',
      'auditd syntax unclear → -w is the path watched, -p is which operations, -k is the search tag.',
    ],
    challenge:
      'Write the two auditd rules that would have caught this intrusion, and explain for each what event it would have produced and at what point in the timeline.',
    evidence: [
      {
        id: 'ev0',
        label: 'Log analysis',
        type: 'report',
        placeholder: 'Time, event, what it establishes, audit rule that would catch it',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Read the authentication method, not just success and failure. A thousand password failures followed by a publickey success means the brute force was noise and the attacker already had a key — the opposite of the obvious conclusion.',
  },

  {
    id: 'p9-lab-4',
    phaseId: 'phase-9',
    title: 'Investigate Suspicious Activity',
    objective:
      'Reconstruct the Linux side of the intrusion, identify all three persistence mechanisms, and map them onto their Windows equivalents.',
    securityConcepts: ['Linux persistence', 'systemd units', 'Investigation', 'Platform mapping'],
    environment: 'Deterministic simulator — prepared artifacts, nothing is executed',
    topology: 'SRV-01 services, filesystem and package configuration',
    prerequisites: ['Complete all earlier Phase 9 labs'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the running units and identify the suspicious one.',
        command: 'systemctl list-units suspicious',
        expected: 'cloud-sync.service — root, Restart=always, created during the intrusion.',
      },
      {
        id: 's1',
        instruction: 'Confirm the binary the unit executes.',
        command: 'ls -la /usr/local/bin/backup-helper',
        expected: 'The same SUID root binary found earlier.',
      },
      {
        id: 's2',
        instruction: 'Check the package sources for an unauthenticated repository.',
        command: 'show package status',
        expected: 'A third-party repo with trusted=yes over plain HTTP.',
      },
      {
        id: 's3',
        instruction: 'Confirm the escalation to a root shell in the logs.',
        command: 'show auth log linux',
        expected: 'deploy running /bin/bash as root at 02:53.',
      },
      {
        id: 's4',
        instruction: 'Map the Linux findings onto their Windows counterparts.',
        command: 'compare windows linux security',
        expected: 'A concept-by-concept mapping across both platforms.',
      },
    ],
    expectedResults: [
      'All three persistence mechanisms identified',
      'The systemd unit linked to the SUID binary',
      'Unauthenticated repository identified as a supply-chain exposure',
      'Findings mapped onto the Windows equivalents from Phase 8',
    ],
    verification: [
      'Learner can name three persistence mechanisms on this host',
      'Learner can explain how the unit and the SUID binary relate',
      'Learner can map five Windows concepts onto Linux equivalents',
    ],
    troubleshooting: [
      'Unsure what makes a unit suspicious → check ExecStart, User, Restart and WantedBy together, plus the creation time.',
      'Too many findings → order them by whether an attacker gains privilege, persistence, or only information.',
    ],
    challenge:
      'The same attacker compromised WS-01 and SRV-01. Write the combined incident summary: what they did on each host, which mechanisms served the same purpose on both, and the single control that would have had the largest effect across both platforms.',
    evidence: [
      {
        id: 'ev0',
        label: 'Cross-platform incident summary',
        type: 'report',
        placeholder: 'Host, mechanism, purpose, Windows/Linux counterpart',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The same attacker used a scheduled task on Windows and a systemd unit plus SUID binary on Linux. Different mechanisms, identical intent: privilege, resilience, persistence. Recognising that shape transfers to any platform you meet next.',
  },
];

export const PHASE_9: Phase = {
  id: 'phase-9',
  number: 9,
  title: 'Linux Security',
  description:
    'The counterpart to Windows Security, asking the same questions in a different dialect. Users and sudo, permissions and the special bits, SSH hardening, systemd and persistence, logs and auditd — closing with an explicit mapping between the two platforms.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: LESSONS,
  labs: LABS,
};
