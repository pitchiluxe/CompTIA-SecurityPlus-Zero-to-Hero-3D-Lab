import { PHASE_1_COMMANDS } from './phase1Commands';
import { PHASE_2_COMMANDS } from './phase2Commands';
import { PHASE_3_COMMANDS } from './phase3Commands';
import { PHASE_4_COMMANDS } from './phase4Commands';
import { PHASE_5_COMMANDS } from './phase5Commands';
import { PHASE_6_COMMANDS } from './phase6Commands';
import { PHASE_7_COMMANDS } from './phase7Commands';
import { PHASE_8_COMMANDS } from './phase8Commands';
import { PHASE_9_COMMANDS } from './phase9Commands';
import { PHASE_10_COMMANDS } from './phase10Commands';
import { PHASE_11_COMMANDS } from './phase11Commands';
import { PHASE_12_COMMANDS } from './phase12Commands';
import { PHASE_13_COMMANDS } from './phase13Commands';
import { PHASE_14_COMMANDS } from './phase14Commands';
import { PHASE_15_COMMANDS } from './phase15Commands';
import { PHASE_16_COMMANDS } from './phase16Commands';
import { PHASE_17_COMMANDS } from './phase17Commands';
import { PHASE_18_COMMANDS } from './phase18Commands';
import { PHASE_19_COMMANDS } from './phase19Commands';
import { PHASE_20_COMMANDS } from './phase20Commands';
import { PHASE_21_COMMANDS } from './phase21Commands';
import { PHASE_22_COMMANDS } from './phase22Commands';
import { PHASE_23_COMMANDS } from './phase23Commands';
import { PHASE_24_COMMANDS } from './phase24Commands';
import { PHASE_25_COMMANDS } from './phase25Commands';
import { PHASE_26_COMMANDS } from './phase26Commands';
import { PHASE_27_COMMANDS } from './phase27Commands';
import type { PreparedCommand, SimCommand, SimOutput } from './types';

// ---------------------------------------------------------------------------
// Prepared command outputs.
//
// This is a CLOSED ALLOWLIST. There is no execution path — a command either
// matches an entry here and returns its stored text, or it does not and the
// learner is told it is outside this lab's simulated environment.
//
// All hostnames, IPs and MACs below are RFC 5737 / RFC 1918 documentation
// ranges or private-lab values. No real credentials, keys, or tokens appear.
// ---------------------------------------------------------------------------

const PHASE_0_COMMANDS: PreparedCommand[] = [
  {
    match: 'navigate soc',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'Loading SOC environment...',
      '[OK] Scene "soc" mounted.',
      '[OK] 8 devices registered.',
      '[OK] Camera controls active (orbit / pan / zoom).',
    ].join('\n'),
    teaches: 'The SOC scene is the Phase 0 environment. Every device is inspectable.',
  },
  {
    match: 'inspect firewall-01',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'Device: firewall-01 (Palo Alto PA-220)',
      'Status: UP',
      'Mgmt IP: 10.0.0.1',
      'Interfaces:',
      '  ethernet1/1  10.0.0.1      up   (untrust)',
      '  ethernet1/2  192.168.1.1   up   (trust)',
      'Threat Prevention: enabled',
      'URL Filtering: enabled',
    ].join('\n'),
    teaches:
      'A firewall sits at a trust boundary. Note the untrust (Internet-facing) and trust (internal) interfaces — that boundary is what a security architecture is built around.',
  },
  {
    match: 'ipconfig /all',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Windows IP Configuration',
      '',
      '   Host Name . . . . . . . . . . . . : WS-01',
      '   Primary Dns Suffix  . . . . . . . : lab.local',
      '   Node Type . . . . . . . . . . . . : Hybrid',
      '   IP Routing Enabled. . . . . . . . : No',
      '',
      'Ethernet adapter Ethernet:',
      '',
      '   Connection-specific DNS Suffix  . : lab.local',
      '   Description . . . . . . . . . . . : Intel(R) Ethernet Connection',
      '   Physical Address. . . . . . . . . : AA-BB-CC-DD-EE-01',
      '   DHCP Enabled. . . . . . . . . . . : Yes',
      '   IPv4 Address. . . . . . . . . . . : 192.168.1.10(Preferred)',
      '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
      '   Default Gateway . . . . . . . . . : 192.168.1.1',
      '   DNS Servers . . . . . . . . . . . : 192.168.1.20',
    ].join('\n'),
    teaches:
      'MAC + IP + gateway + DNS is the minimum you record when scoping an incident. The default gateway here is the firewall trust interface.',
  },
  {
    match: 'whoami',
    tool: 'windows',
    provenance: 'prepared',
    output: 'lab\\analyst1',
    teaches: 'Always confirm which identity context you are operating in before you act.',
  },
  {
    match: 'whoami /priv',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'PRIVILEGES INFORMATION',
      '----------------------',
      '',
      'Privilege Name                 Description                     State',
      '============================== =============================== ========',
      'SeShutdownPrivilege            Shut down the system            Disabled',
      'SeChangeNotifyPrivilege        Bypass traverse checking        Enabled',
      'SeUndockPrivilege              Remove computer from dock       Disabled',
      'SeIncreaseWorkingSetPrivilege  Increase a process working set  Disabled',
    ].join('\n'),
    teaches:
      'A standard user holds few privileges. Privilege-escalation findings start as a diff against this baseline.',
  },
  {
    match: 'netstat -ano',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Active Connections',
      '',
      '  Proto  Local Address        Foreign Address      State           PID',
      '  TCP    0.0.0.0:135          0.0.0.0:0            LISTENING       968',
      '  TCP    0.0.0.0:445          0.0.0.0:0            LISTENING       4',
      '  TCP    192.168.1.10:52344   192.168.1.20:389     ESTABLISHED     712',
      '  TCP    192.168.1.10:52901   203.0.113.55:443     ESTABLISHED     6644',
      '  UDP    0.0.0.0:5353         *:*                                  2180',
    ].join('\n'),
    teaches:
      'PID 6644 is talking to 203.0.113.55:443 — an external host. Pair the PID with tasklist to name the process. This is the core triage move for suspected C2.',
  },
  {
    match: 'tasklist',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Image Name                     PID Session Name        Mem Usage',
      '========================= ======== ================ ============',
      'System                           4 Services            2,148 K',
      'svchost.exe                    968 Services           12,004 K',
      'lsass.exe                      712 Services           18,320 K',
      'explorer.exe                  3120 Console            84,116 K',
      'powershell.exe                6644 Console            62,880 K',
    ].join('\n'),
    teaches:
      'PID 6644 is powershell.exe holding an outbound TLS session. Interactive PowerShell beaconing outbound is a classic living-off-the-land indicator.',
  },
  {
    match: 'ip a',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN',
      '    inet 127.0.0.1/8 scope host lo',
      '2: ens18: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP',
      '    link/ether aa:bb:cc:dd:ee:02 brd ff:ff:ff:ff:ff:ff',
      '    inet 192.168.1.30/24 brd 192.168.1.255 scope global ens18',
    ].join('\n'),
    teaches: 'The Linux equivalent of ipconfig /all. Same triage data, different syntax.',
  },
  {
    match: 'ss -tulpn',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'Netid State  Local Address:Port  Peer Address:Port  Process',
      'tcp   LISTEN 0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=744))',
      'tcp   LISTEN 0.0.0.0:80          0.0.0.0:*          users:(("nginx",pid=901))',
      'tcp   LISTEN 127.0.0.1:5432      0.0.0.0:*          users:(("postgres",pid=1102))',
    ].join('\n'),
    teaches:
      'postgres binds to 127.0.0.1 only — correctly not exposed. sshd and nginx listen on 0.0.0.0. Attack surface is what listens on a routable address.',
  },
  {
    match: 'sudo -l',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'Matching Defaults entries for analyst1 on srv-01:',
      '    env_reset, secure_path=/usr/sbin:/usr/bin:/sbin:/bin',
      '',
      'User analyst1 may run the following commands on srv-01:',
      '    (ALL) /usr/bin/systemctl restart nginx',
    ].join('\n'),
    teaches:
      'Least privilege in practice: one scoped command, not (ALL) NOPASSWD: ALL. Overly broad sudo rules are a standard audit finding.',
  },
  {
    match: 'nmap -sv 192.168.1.0/24',
    tool: 'nmap',
    provenance: 'prepared',
    output: [
      'Starting Nmap 7.94 ( https://nmap.org )',
      'Nmap scan report for 192.168.1.1 (fw-01)',
      'Host is up (0.00080s latency).',
      'PORT    STATE SERVICE      VERSION',
      '443/tcp open  https        PAN-OS management',
      '',
      'Nmap scan report for 192.168.1.10 (ws-01)',
      'Host is up (0.00042s latency).',
      'PORT    STATE SERVICE      VERSION',
      '135/tcp open  msrpc        Microsoft Windows RPC',
      '445/tcp open  microsoft-ds Windows 11 Pro SMB',
      '',
      'Nmap scan report for 192.168.1.30 (srv-01)',
      'Host is up (0.00035s latency).',
      'PORT    STATE SERVICE      VERSION',
      '22/tcp  open  ssh          OpenSSH 8.9p1 Ubuntu',
      '80/tcp  open  http         nginx 1.18.0',
      '',
      'Nmap done: 256 IP addresses (3 hosts up) scanned',
    ].join('\n'),
    teaches:
      'Service/version detection (-sV) turns a port list into a vulnerability question. AUTHORISATION NOTE: only ever scan ranges you own or are contracted to test.',
  },
  {
    match: 'get-eventlog -logname security -newest 5',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      '   Index Time          EntryType   Source    InstanceID Message',
      '   ----- ----          ---------   ------    ---------- -------',
      '   88213 Sep 08 10:11  SuccessA... Microsoft       4688 A new process has been created (powershell.exe)',
      '   88212 Sep 08 10:10  SuccessA... Microsoft       4624 An account was successfully logged on (Type 2)',
      '   88211 Sep 08 10:04  FailureA... Microsoft       4625 An account failed to log on (Type 3)',
      '   88210 Sep 08 10:04  FailureA... Microsoft       4625 An account failed to log on (Type 3)',
      '   88209 Sep 08 10:03  FailureA... Microsoft       4625 An account failed to log on (Type 3)',
    ].join('\n'),
    teaches:
      'Three 4625 failures, then a 4624 success, then a 4688 process creation. That ordering is the shape of a successful password-guessing attempt followed by execution.',
  },
];

/**
 * The complete allowlist, composed per phase so each phase's prepared evidence
 * stays reviewable on its own.
 */
/** Stamp a phase number onto every entry of a per-phase set. */
const inPhase = (phase: number, commands: PreparedCommand[]): SimCommand[] =>
  commands.map((c) => ({ ...c, phase }));

export const SIM_COMMANDS: SimCommand[] = [
  ...inPhase(0, PHASE_0_COMMANDS),
  ...inPhase(1, PHASE_1_COMMANDS),
  ...inPhase(2, PHASE_2_COMMANDS),
  ...inPhase(3, PHASE_3_COMMANDS),
  ...inPhase(4, PHASE_4_COMMANDS),
  ...inPhase(5, PHASE_5_COMMANDS),
  ...inPhase(6, PHASE_6_COMMANDS),
  ...inPhase(7, PHASE_7_COMMANDS),
  ...inPhase(8, PHASE_8_COMMANDS),
  ...inPhase(9, PHASE_9_COMMANDS),
  ...inPhase(10, PHASE_10_COMMANDS),
  ...inPhase(11, PHASE_11_COMMANDS),
  ...inPhase(12, PHASE_12_COMMANDS),
  ...inPhase(13, PHASE_13_COMMANDS),
  ...inPhase(14, PHASE_14_COMMANDS),
  ...inPhase(15, PHASE_15_COMMANDS),
  ...inPhase(16, PHASE_16_COMMANDS),
  ...inPhase(17, PHASE_17_COMMANDS),
  ...inPhase(18, PHASE_18_COMMANDS),
  ...inPhase(19, PHASE_19_COMMANDS),
  ...inPhase(20, PHASE_20_COMMANDS),
  ...inPhase(21, PHASE_21_COMMANDS),
  ...inPhase(22, PHASE_22_COMMANDS),
  ...inPhase(23, PHASE_23_COMMANDS),
  ...inPhase(24, PHASE_24_COMMANDS),
  ...inPhase(25, PHASE_25_COMMANDS),
  ...inPhase(26, PHASE_26_COMMANDS),
  ...inPhase(27, PHASE_27_COMMANDS),
];

/** Normalise learner input so spacing and case do not matter. */
export function normaliseCommand(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Look up a command. Returns `recognised: false` for anything not in the
 * allowlist — there is deliberately no fallback that runs anything.
 */
export function runCommand(input: string): SimOutput {
  const command = normaliseCommand(input);
  const hit = SIM_COMMANDS.find((c) => c.match === command);

  if (!hit) {
    return {
      command,
      provenance: 'simulated',
      recognised: false,
      output: [
        `"${command}" is not part of this lab's simulated environment.`,
        '',
        'This is a safe simulator, not a shell — no command is ever executed on your machine.',
        "Type 'help' to list the commands this lab understands.",
      ].join('\n'),
    };
  }

  return {
    command,
    provenance: hit.provenance,
    output: hit.output,
    teaches: hit.teaches,
    recognised: true,
  };
}

export type CommandSummary = {
  command: string;
  tool: SimCommand['tool'];
  phase: number;
};

/**
 * Commands available for the in-lab `help` listing.
 *
 * `maxPhase` scopes the listing to what the learner has reached — showing a
 * Phase 0 learner the Phase 3 phishing artifacts is both noise and a spoiler.
 * Omit it to list the whole allowlist.
 */
export function listCommands(maxPhase?: number): CommandSummary[] {
  return SIM_COMMANDS.filter((c) => maxPhase === undefined || c.phase <= maxPhase).map((c) => ({
    command: c.match,
    tool: c.tool,
    phase: c.phase,
  }));
}
