import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 1 prepared command outputs — Computer, Network & Security Foundations.
//
// Same closed-allowlist contract as Phase 0: no execution path exists.
//
// Every value below is consistent with the Phase 0 environment:
//   WS-01   192.168.1.10  Windows 11, user lab\analyst1, PID 6644 = powershell
//   SRV-01  192.168.1.30  Ubuntu 22.04, nginx + sshd + loopback postgres
//   DC-01   192.168.1.20  DNS / directory
//   FW-01   192.168.1.1   default gateway (firewall trust interface)
// External addresses are RFC 5737 documentation space only.
// ---------------------------------------------------------------------------

export const PHASE_1_COMMANDS: PreparedCommand[] = [
  // ----------------------------- Windows host -----------------------------
  {
    match: 'systeminfo',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Host Name:                 WS-01',
      'OS Name:                   Microsoft Windows 11 Pro',
      'OS Version:                10.0.22631 N/A Build 22631',
      'System Type:               x64-based PC',
      'Processor(s):              1 Processor(s) Installed.',
      '                           [01]: Intel64 Family 6 Model 158 ~2900 Mhz',
      'Total Physical Memory:     16,384 MB',
      'Domain:                    lab.local',
      'Logon Server:              \\\\DC-01',
      'Hotfix(s):                 4 Hotfix(s) Installed.',
    ].join('\n'),
    teaches:
      'OS build, domain membership, and patch count in one command. "Domain: lab.local" means this host trusts DC-01 for authentication — that is a security boundary, not just a naming detail.',
  },
  {
    match: 'net user analyst1',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'User name                    analyst1',
      'Full Name                    Lab Analyst',
      'Account active               Yes',
      'Account expires              Never',
      '',
      'Password last set            2026-08-02 09:14:11',
      'Password expires             2026-10-31 09:14:11',
      'Password required            Yes',
      'User may change password     Yes',
      '',
      'Local Group Memberships      *Users',
      'Global Group memberships     *Domain Users',
    ].join('\n'),
    teaches:
      'analyst1 is in Users, not Administrators — least privilege applied. When triaging, the first question about any account is what it can do, not who owns it.',
  },
  {
    match: 'net localgroup administrators',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Alias name     administrators',
      'Comment        Administrators have complete and unrestricted access',
      '',
      'Members',
      '-------------------------------------------------------------------------------',
      'Administrator',
      'LAB\\Domain Admins',
      'The command completed successfully.',
    ].join('\n'),
    teaches:
      'Enumerating local administrators is a standard audit step. An unexpected user here is a privilege-escalation finding.',
  },
  {
    match: 'icacls c:\\reports',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'C:\\reports NT AUTHORITY\\SYSTEM:(OI)(CI)(F)',
      '           BUILTIN\\Administrators:(OI)(CI)(F)',
      '           LAB\\analyst1:(OI)(CI)(RX)',
      '           BUILTIN\\Users:(OI)(CI)(RX)',
      '',
      'Successfully processed 1 files; Failed processing 0 files',
    ].join('\n'),
    teaches:
      'F = full control, RX = read and execute. analyst1 can read but not modify. (OI)(CI) means the ACE is inherited by files and subfolders — permission mistakes propagate.',
  },
  {
    match: 'tasklist /svc',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Image Name                     PID Services',
      '========================= ======== ============================================',
      'System                           4 N/A',
      'lsass.exe                      712 KeyIso, SamSs, VaultSvc',
      'svchost.exe                    968 RpcSs',
      'spoolsv.exe                   1544 Spooler',
      'explorer.exe                  3120 N/A',
      'powershell.exe                6644 N/A',
    ].join('\n'),
    teaches:
      'Mapping processes to the services they host. lsass.exe holds credential material — it is a primary attacker target and should never be spawning child processes.',
  },
  {
    match: 'route print',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'IPv4 Route Table',
      '===========================================================================',
      'Network Destination        Netmask          Gateway       Interface  Metric',
      '          0.0.0.0          0.0.0.0      192.168.1.1   192.168.1.10      25',
      '        127.0.0.0        255.0.0.0         On-link       127.0.0.1     331',
      '      192.168.1.0    255.255.255.0         On-link    192.168.1.10     281',
      '  192.168.1.255  255.255.255.255         On-link    192.168.1.10     281',
      '===========================================================================',
    ].join('\n'),
    teaches:
      'The 0.0.0.0/0 route is the default route: anything not local goes to 192.168.1.1, the firewall. That is why the firewall sees all outbound traffic — including the PowerShell session from Lab 1.',
  },
  {
    match: 'arp -a',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Interface: 192.168.1.10 --- 0x5',
      '  Internet Address      Physical Address      Type',
      '  192.168.1.1           00-11-22-33-44-56     dynamic',
      '  192.168.1.20          aa-bb-cc-dd-ee-20     dynamic',
      '  192.168.1.30          aa-bb-cc-dd-ee-02     dynamic',
      '  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
    ].join('\n'),
    teaches:
      'ARP maps Layer 3 addresses to Layer 2. Two IPs sharing one MAC, or the gateway MAC changing, is the signature of ARP spoofing / on-path attacks.',
  },
  {
    match: 'ping 192.168.1.30',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Pinging 192.168.1.30 with 32 bytes of data:',
      'Reply from 192.168.1.30: bytes=32 time<1ms TTL=64',
      'Reply from 192.168.1.30: bytes=32 time<1ms TTL=64',
      'Reply from 192.168.1.30: bytes=32 time=1ms TTL=64',
      'Reply from 192.168.1.30: bytes=32 time<1ms TTL=64',
      '',
      'Ping statistics for 192.168.1.30:',
      '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
      'Approximate round trip times in milli-seconds:',
      '    Minimum = 0ms, Maximum = 1ms, Average = 0ms',
    ].join('\n'),
    teaches:
      'TTL 64 suggests a Linux/Unix stack (Windows starts at 128). Sub-millisecond replies mean the host is on the same LAN segment — no router hop.',
  },
  {
    match: 'tracert 203.0.113.55',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Tracing route to 203.0.113.55 over a maximum of 30 hops',
      '',
      '  1    <1 ms    <1 ms    <1 ms  192.168.1.1   [fw-01 trust]',
      '  2     3 ms     2 ms     2 ms  10.0.0.1      [fw-01 untrust]',
      '  3    11 ms    10 ms    11 ms  198.51.100.1  [isp-edge]',
      '  4    24 ms    23 ms    24 ms  203.0.113.55',
      '',
      'Trace complete.',
    ].join('\n'),
    teaches:
      'Every hop is a decision point where traffic can be inspected or blocked. Hops 1 and 2 are the same firewall seen from its trust and untrust interfaces — that is the perimeter.',
  },
  {
    match: 'nslookup srv-01.lab.local',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Server:  dc-01.lab.local',
      'Address:  192.168.1.20',
      '',
      'Name:    srv-01.lab.local',
      'Address:  192.168.1.30',
    ].join('\n'),
    teaches:
      'Name resolution happens before the connection does. Poison DNS and you redirect traffic without touching the network path — which is why DNS logs are prime SOC telemetry.',
  },
  {
    match: 'ipconfig /displaydns',
    tool: 'windows',
    provenance: 'prepared',
    output: [
      'Windows IP Configuration',
      '',
      '    srv-01.lab.local',
      '    ----------------------------------------',
      '    Record Name . . . . . : srv-01.lab.local',
      '    Record Type . . . . . : 1',
      '    Time To Live  . . . . : 1042',
      '    A (Host) Record . . . : 192.168.1.30',
      '',
      '    updates.example.net',
      '    ----------------------------------------',
      '    Record Name . . . . . : updates.example.net',
      '    Record Type . . . . . : 1',
      '    Time To Live  . . . . : 58',
      '    A (Host) Record . . . : 203.0.113.55',
    ].join('\n'),
    teaches:
      'The DNS cache is a record of what this host looked up. updates.example.net resolving to 203.0.113.55 ties the suspicious PowerShell connection to a name — a lead worth pulling.',
  },

  // ------------------------------ Linux host ------------------------------
  {
    match: 'uname -a',
    tool: 'linux',
    provenance: 'prepared',
    output: 'Linux srv-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux',
    teaches:
      'Kernel version is the first input to "is this host vulnerable?". Version enumeration is step one of both vulnerability management and attack planning.',
  },
  {
    match: 'ls -la /var/www',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'total 20',
      'drwxr-xr-x  3 root     root     4096 Aug 14 09:02 .',
      'drwxr-xr-x 14 root     root     4096 Aug 14 09:01 ..',
      'drwxr-xr-x  2 www-data www-data 4096 Sep 01 11:20 html',
      '-rw-r--r--  1 root     root      612 Aug 14 09:02 README',
      '-rwxrwxrwx  1 root     root      215 Sep 05 16:44 deploy.sh',
    ].join('\n'),
    teaches:
      'Read the permission string left to right: type, owner, group, other. deploy.sh is -rwxrwxrwx (777) — world-writable and executable. Any user can rewrite what root will later run. That is a finding.',
  },
  {
    match: 'id',
    tool: 'linux',
    provenance: 'prepared',
    output: 'uid=1001(analyst1) gid=1001(analyst1) groups=1001(analyst1),27(sudo)',
    teaches:
      'uid, gid, and supplementary groups define everything this account may do. Membership of group 27 (sudo) is why `sudo -l` returns a rule at all.',
  },
  {
    match: 'cat /etc/passwd',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'root:x:0:0:root:/root:/bin/bash',
      'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
      'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
      'sshd:x:110:65534::/run/sshd:/usr/sbin/nologin',
      'postgres:x:111:117:PostgreSQL admin:/var/lib/postgresql:/bin/bash',
      'analyst1:x:1001:1001:Lab Analyst:/home/analyst1:/bin/bash',
    ].join('\n'),
    teaches:
      'The x in field two means the password hash lives in /etc/shadow, not here — /etc/passwd is world-readable by design. Service accounts end in nologin; any service account with /bin/bash deserves a second look.',
  },
  {
    match: 'ps aux',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'USER       PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND',
      'root         1  0.0  0.1 167404 11292 ?     Ss   09:01   0:02 /sbin/init',
      'root       744  0.0  0.1  15852  9204 ?     Ss   09:01   0:00 sshd: /usr/sbin/sshd -D',
      'root       901  0.0  0.0  55184  5512 ?     Ss   09:01   0:00 nginx: master process',
      'www-data   904  0.0  0.1  55836  7420 ?     S    09:01   0:01 nginx: worker process',
      'postgres  1102  0.0  0.9 217640 74880 ?     Ss   09:02   0:03 /usr/lib/postgresql/14/bin/postgres',
      'analyst1  2210  0.0  0.0  17064  5308 pts/0 Ss   10:05   0:00 -bash',
    ].join('\n'),
    teaches:
      'nginx runs a root master and an unprivileged www-data worker. Only the master needs port 80; the workers that touch untrusted input drop privileges. That is privilege separation in practice.',
  },
  {
    match: 'ip route',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'default via 192.168.1.1 dev ens18 proto static metric 100',
      '192.168.1.0/24 dev ens18 proto kernel scope link src 192.168.1.30',
    ].join('\n'),
    teaches:
      'The Linux equivalent of route print. Same default gateway, same perimeter — the firewall sees this host outbound too.',
  },
  {
    match: 'dig srv-01.lab.local +short',
    tool: 'linux',
    provenance: 'prepared',
    output: '192.168.1.30',
    teaches:
      'dig is the Linux counterpart to nslookup. +short strips everything but the answer — useful when scripting, but you lose the TTL and authority section a real investigation wants.',
  },
  {
    match: 'curl -i http://srv-01.lab.local',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'HTTP/1.1 200 OK',
      'Server: nginx/1.18.0 (Ubuntu)',
      'Date: Tue, 08 Sep 2026 10:22:41 GMT',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Length: 612',
      'Connection: keep-alive',
      '',
      '<!doctype html><html><head><title>SRV-01</title></head><body>Lab web server</body></html>',
    ].join('\n'),
    teaches:
      'Plain HTTP: headers and body travel in cleartext, and the Server header leaks the exact version. Two findings in one response — no transport encryption, and unnecessary version disclosure.',
  },
  {
    match: 'curl -i https://srv-01.lab.local',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'HTTP/1.1 200 OK',
      'Server: nginx',
      'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Length: 612',
      '',
      '<!doctype html><html><head><title>SRV-01</title></head><body>Lab web server</body></html>',
    ].join('\n'),
    teaches:
      'Same content over TLS. The Server header is trimmed and HSTS tells the browser never to try plain HTTP again. Compare this response to the HTTP one — that difference is the lesson.',
  },
  {
    match: 'ssh -v analyst1@srv-01.lab.local',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      'OpenSSH_8.9p1, OpenSSL 3.0.2',
      'debug1: Connecting to srv-01.lab.local [192.168.1.30] port 22.',
      'debug1: Connection established.',
      'debug1: Local version string SSH-2.0-OpenSSH_8.9p1',
      'debug1: Remote protocol version 2.0, remote software version OpenSSH_8.9p1',
      'debug1: Server host key: ssh-ed25519 SHA256:V0xLQb...redacted...',
      'debug1: Host "srv-01.lab.local" is known and matches the ED25519 host key.',
      'debug1: Authentications that can continue: publickey,password',
      'debug1: Offering public key: /home/analyst1/.ssh/id_ed25519',
      'debug1: Authentication succeeded (publickey).',
      'Welcome to Ubuntu 22.04.3 LTS',
    ].join('\n'),
    teaches:
      'Host key verification happens before authentication — that is what stops an on-path attacker impersonating the server. "Authentication succeeded (publickey)" means no password crossed the wire at all.',
  },
  {
    match: 'ip -6 addr',
    tool: 'linux',
    provenance: 'prepared',
    output: [
      '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
      '    inet6 ::1/128 scope host',
      '2: ens18: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
      '    inet6 2001:db8:acad:1::30/64 scope global',
      '    inet6 fe80::a8bb:ccff:fedd:ee02/64 scope link',
    ].join('\n'),
    teaches:
      'IPv6 is usually on even when nobody configured it. fe80::/10 is link-local and always present; 2001:db8::/32 is documentation space. An IPv6 path your firewall rules ignore is an unmonitored way in.',
  },

  // -------------------------- Connection tracing --------------------------
  {
    match: 'trace connection ws-01 srv-01',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'Tracing client-to-server connection: WS-01 -> SRV-01 (HTTPS/443)',
      '',
      '  [1] USER      analyst1 requests https://srv-01.lab.local',
      '  [2] ENDPOINT  WS-01 192.168.1.10 - host firewall permits outbound 443',
      '  [3] RESOLVE   DNS query to DC-01 192.168.1.20 -> 192.168.1.30',
      '  [4] LAYER 2   ARP resolves 192.168.1.30 -> aa:bb:cc:dd:ee:02',
      '  [5] SWITCH    Cisco 2960X forwards frame on VLAN 10',
      '  [6] FIREWALL  FW-01 policy "trust->trust allow-web" permits, logs flow',
      '  [7] SERVER    SRV-01 192.168.1.30 nginx accepts TCP 443',
      '  [8] TLS       Handshake completes, certificate validated',
      '  [9] RESPONSE  HTTP 200 returned over the established session',
      '',
      'Flow logged by FW-01 and forwarded to SIEM-01.',
    ].join('\n'),
    teaches:
      'Nine steps between a click and a response, and each one is a place to detect or block. Learn this path once and every later topic — segmentation, IDS placement, Zero Trust — has somewhere to attach.',
  },
];
