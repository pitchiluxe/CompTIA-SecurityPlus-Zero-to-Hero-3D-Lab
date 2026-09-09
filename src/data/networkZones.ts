// ---------------------------------------------------------------------------
// Phase 4 — enterprise network architecture.
//
// PROMPT.md asks for: Internet -> Firewall -> DMZ -> Core -> Users / Servers /
// Management / Guest, with inspectable security boundaries.
//
// Source of truth for the 3D scene, the 2D fallback, and the `show zones` /
// `inspect boundary` simulator artifacts. Trust level is the organising idea:
// a boundary exists wherever trust changes, and that is where controls go.
// ---------------------------------------------------------------------------

export type ZoneId = 'internet' | 'dmz' | 'core' | 'users' | 'servers' | 'management' | 'guest';

export type NetworkZone = {
  id: ZoneId;
  name: string;
  /** 0 = untrusted, 100 = most trusted. Drives ordering and colour. */
  trust: number;
  /** Depth tier in the 3D scene: 0 outermost (Internet) to 3 (segments). */
  tier: number;
  /** Horizontal offset within the tier, for the segment row. */
  offset: number;
  color: string;
  vlan?: string;
  cidr?: string;
  summary: string;
  contains: string[];
  /** What must never be true of this zone. */
  rules: string[];
};

export const NETWORK_ZONES: NetworkZone[] = [
  {
    id: 'internet',
    name: 'Internet',
    trust: 0,
    tier: 0,
    offset: 0,
    color: '#ef4444',
    summary:
      'Wholly untrusted. Everything arriving from here is hostile until proven otherwise, and nothing inside should depend on the Internet behaving well.',
    contains: ['Unknown clients', 'Partner traffic', 'Attacker infrastructure'],
    rules: [
      'No inbound connection reaches an internal zone directly',
      'All inbound traffic terminates in the DMZ',
    ],
  },
  {
    id: 'dmz',
    name: 'DMZ',
    trust: 25,
    tier: 1,
    offset: 0,
    color: '#f59e0b',
    vlan: 'VLAN 20',
    cidr: '172.16.20.0/24',
    summary:
      'The screened subnet. Services that must be reachable from the Internet live here, and only here. The DMZ exists so that compromising a public service does not put the attacker on your internal network.',
    contains: ['Reverse proxy / WAF', 'Public web server', 'External DNS resolver'],
    rules: [
      'DMZ hosts may be reached from the Internet on specific ports only',
      'DMZ hosts may NOT initiate connections into the Core',
      'A compromised DMZ host must gain the attacker nothing internally',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    trust: 60,
    tier: 2,
    offset: 0,
    color: '#38bdf8',
    vlan: 'VLAN 10',
    cidr: '192.168.1.0/24',
    summary:
      'The internal routed network joining the segments. Traffic between segments passes through here and can therefore be inspected — which is exactly why segments are separate in the first place.',
    contains: ['Core switching', 'Internal routing', 'Internal firewall / IDS sensor'],
    rules: [
      'Inter-segment traffic is routed, not switched, so policy can apply',
      'The Core is a transit zone — it hosts no user data',
    ],
  },
  {
    id: 'users',
    name: 'Users',
    trust: 55,
    tier: 3,
    offset: -7.5,
    color: '#3b82f6',
    vlan: 'VLAN 30',
    cidr: '192.168.30.0/24',
    summary:
      'Analyst and staff workstations, including WS-01. The highest-volume zone and the one most likely to be compromised first, because it is where humans open email.',
    contains: ['WS-01 analyst workstation', 'WS-02 analyst workstation', 'Staff endpoints'],
    rules: [
      'Users may reach Servers only on published application ports',
      'Users may NOT reach Management at all',
      'Workstations may not talk to each other — east-west traffic is blocked',
    ],
  },
  {
    id: 'servers',
    name: 'Servers',
    trust: 75,
    tier: 3,
    offset: -2.5,
    color: '#22c55e',
    vlan: 'VLAN 40',
    cidr: '192.168.40.0/24',
    summary:
      'Internal application and data servers, including SRV-01 and the domain controller. Higher trust than Users, because the systems here are managed rather than driven by a person reading email.',
    contains: ['SRV-01 application server', 'DC-01 domain controller', 'Database hosts'],
    rules: [
      'Servers accept connections from Users only on published ports',
      'Servers do not initiate outbound Internet connections except via proxy',
      'Database services bind to loopback or the server segment only',
    ],
  },
  {
    id: 'management',
    name: 'Management',
    trust: 95,
    tier: 3,
    offset: 2.5,
    color: '#a855f7',
    vlan: 'VLAN 99',
    cidr: '10.99.0.0/24',
    summary:
      'Out-of-band administration: switch and firewall management interfaces, the SIEM console, backup infrastructure. The most trusted zone, and the one an attacker most wants — reaching it means reaching everything.',
    contains: ['FW-01 management interface', 'SIEM-01 console', 'Backup infrastructure'],
    rules: [
      'Reachable only from a privileged access workstation, never from Users',
      'Requires MFA and a jump host — no direct path exists',
      'Management traffic never shares a VLAN with user traffic',
    ],
  },
  {
    id: 'guest',
    name: 'Guest',
    trust: 5,
    tier: 3,
    offset: 7.5,
    color: '#64748b',
    vlan: 'VLAN 50',
    cidr: '10.50.0.0/24',
    summary:
      'Visitor wireless. Trust barely above the Internet, and deliberately so — a guest device is unmanaged, unpatched, and belongs to someone you have no relationship with.',
    contains: ['Visitor devices', 'Guest wireless SSID'],
    rules: [
      'Internet access only — no route to any internal zone exists',
      'Client isolation prevents guest devices reaching each other',
      'Guest traffic egresses without traversing the Core',
    ],
  },
];

export type Boundary = {
  id: string;
  from: ZoneId;
  to: ZoneId;
  /** Controls enforcing this boundary. */
  controls: string[];
  /** What is permitted across it. */
  allowed: string[];
  /** What is explicitly denied, and why it matters. */
  denied: string[];
  /** What the boundary is actually there to prevent. */
  purpose: string;
};

export const BOUNDARIES: Boundary[] = [
  {
    id: 'internet-dmz',
    from: 'internet',
    to: 'dmz',
    controls: ['Perimeter firewall (FW-01)', 'WAF', 'Reverse proxy', 'IPS in inline mode'],
    allowed: ['TCP 443 to the reverse proxy', 'TCP 53 to the external resolver'],
    denied: [
      'Every other inbound port',
      'Any direct inbound connection past the DMZ',
      'Inbound management protocols (SSH, RDP, SNMP)',
    ],
    purpose:
      'The trust boundary that defines the perimeter. This is where an IPS sits inline to block, and where a WAF inspects application-layer requests before they reach the web server.',
  },
  {
    id: 'dmz-core',
    from: 'dmz',
    to: 'core',
    controls: ['Internal firewall', 'IDS sensor on the span port', 'Application-layer proxy'],
    allowed: ['Reverse proxy to SRV-01 on TCP 443 only, initiated inbound'],
    denied: [
      'DMZ hosts initiating any connection into the Core',
      'DMZ hosts reaching the domain controller',
      'Any management protocol from the DMZ',
    ],
    purpose:
      'The most important boundary in the architecture. If a DMZ host is compromised — and public services are the ones most likely to be — this boundary decides whether the attacker gained a foothold or gained the estate.',
  },
  {
    id: 'core-users',
    from: 'core',
    to: 'users',
    controls: ['VLAN segmentation', 'NAC posture check at connection', '802.1X authentication'],
    allowed: ['Authenticated, posture-compliant devices onto VLAN 30'],
    denied: [
      'Unknown devices (quarantined to a remediation VLAN)',
      'Workstation-to-workstation traffic within the segment',
    ],
    purpose:
      'NAC decides whether a device joins at all, and on which VLAN. Blocking east-west traffic between workstations is what stops one compromised endpoint spreading laterally to its neighbours.',
  },
  {
    id: 'users-servers',
    from: 'users',
    to: 'servers',
    controls: ['Internal firewall policy', 'Application authentication and authorisation'],
    allowed: ['TCP 443 to SRV-01', 'TCP 389/636 to DC-01 for authentication'],
    denied: [
      'Direct database access (TCP 5432)',
      'SMB from Users to Servers',
      'Any port not required by a published application',
    ],
    purpose:
      'Users need applications, not servers. Publishing only the application ports means a compromised workstation cannot reach the database directly even though the database is running.',
  },
  {
    id: 'users-management',
    from: 'users',
    to: 'management',
    controls: ['Deny-all firewall rule', 'Jump host with MFA', 'Privileged access workstation'],
    allowed: ['Nothing directly — administration goes via a jump host from a PAW'],
    denied: [
      'All traffic from the Users segment to VLAN 99',
      'Administrative protocols from a general-purpose workstation',
    ],
    purpose:
      'The hardest boundary in the design. If a phished workstation could reach the management VLAN, one click would compromise the firewall, the SIEM, and the backups at once.',
  },
  {
    id: 'guest-internet',
    from: 'guest',
    to: 'internet',
    controls: ['Guest firewall policy', 'Client isolation', 'Bandwidth shaping'],
    allowed: ['Outbound HTTP/HTTPS and DNS to the Internet'],
    denied: [
      'Any route into the Core or any internal segment',
      'Guest-to-guest traffic',
      'Access to internal DNS',
    ],
    purpose:
      'Guest devices are unmanaged and untrusted. Giving them Internet-only egress that bypasses the Core entirely means a hostile guest device has nothing internal to attack.',
  },
];

export function getZone(id: ZoneId): NetworkZone | undefined {
  return NETWORK_ZONES.find((z) => z.id === id);
}

export function getBoundary(id: string): Boundary | undefined {
  return BOUNDARIES.find((b) => b.id === id);
}

/** Boundaries touching a zone, in either direction. */
export function boundariesFor(zoneId: ZoneId): Boundary[] {
  return BOUNDARIES.filter((b) => b.from === zoneId || b.to === zoneId);
}

/**
 * The trust delta a boundary spans. A large delta means a boundary doing a lot
 * of work — Users (55) to Management (95) is the steepest in this design, which
 * is why it is enforced with a deny-all rule rather than a port list.
 */
export function trustDelta(boundary: Boundary): number {
  const from = getZone(boundary.from)?.trust ?? 0;
  const to = getZone(boundary.to)?.trust ?? 0;
  return Math.abs(to - from);
}
