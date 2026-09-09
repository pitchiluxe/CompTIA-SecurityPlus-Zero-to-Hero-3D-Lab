import type { FirewallRule } from '../lib/firewallAnalysis';

// ---------------------------------------------------------------------------
// Phase 11 — enterprise network configuration with injected errors.
//
// PROMPT.md: "Build and secure an enterprise network. Inject safe
// configuration errors. Make the learner identify them."
//
// Deliberately NOT presented as current-versus-recommended. The learner sees
// a plausible config listing and must know what right looks like — which is
// the difference between following a checklist and reviewing a network.
//
// Extends the Phase 4 zone architecture and the Phase 0 estate.
// ---------------------------------------------------------------------------

// ------------------------------ Firewall ------------------------------

export const FIREWALL_RULES: FirewallRule[] = [
  {
    id: 'fw1',
    seq: 10,
    action: 'permit',
    protocol: 'tcp',
    source: '192.168.10.0/24',
    destination: '192.168.30.0/24',
    port: '443',
    description: 'Users to servers, HTTPS',
  },
  {
    id: 'fw2',
    seq: 20,
    action: 'permit',
    protocol: 'ip',
    source: 'any',
    destination: 'any',
    port: 'any',
    description: 'Temporary — added during the migration, 2025-03',
  },
  {
    id: 'fw3',
    seq: 30,
    action: 'deny',
    protocol: 'tcp',
    source: '192.168.40.0/24',
    destination: '192.168.30.0/24',
    port: 'any',
    description: 'Guest must not reach servers',
  },
  {
    id: 'fw4',
    seq: 40,
    action: 'permit',
    protocol: 'tcp',
    source: '192.168.20.0/24',
    destination: '192.168.30.0/24',
    port: '22',
    description: 'Management to servers, SSH',
  },
  {
    id: 'fw5',
    seq: 50,
    action: 'deny',
    protocol: 'tcp',
    source: '192.168.10.0/24',
    destination: '192.168.20.0/24',
    port: 'any',
    description: 'Users must not reach management',
  },
  {
    id: 'fw6',
    seq: 60,
    action: 'deny',
    protocol: 'ip',
    source: 'any',
    destination: 'any',
    port: 'any',
    description: 'Explicit deny all',
  },
];

// --------------------------- Config review items ---------------------------

export type ConfigArea =
  'firewall' | 'vlan' | 'wireless' | 'nac' | 'dhcp' | 'dns' | 'monitoring' | 'vpn';

export const AREA_LABELS: Record<ConfigArea, string> = {
  firewall: 'Firewall and ACLs',
  vlan: 'VLANs and segmentation',
  wireless: 'Wireless',
  nac: 'Network access control',
  dhcp: 'DHCP',
  dns: 'DNS',
  monitoring: 'Monitoring and IDS/IPS',
  vpn: 'VPN and remote access',
};

export type ConfigVerdict = 'correct' | 'error';

export type ConfigItem = {
  id: string;
  area: ConfigArea;
  /** The configuration exactly as it would appear, with no hints. */
  config: string;
  verdict: ConfigVerdict;
  severity?: 'high' | 'medium' | 'low';
  /** Revealed after grading. */
  explanation: string;
};

export const CONFIG_ITEMS: ConfigItem[] = [
  // ------------------------------ Firewall ------------------------------
  {
    id: 'c00',
    area: 'firewall',
    config: 'seq 20  permit ip any any any    ! Temporary — added during the migration, 2025-03',
    verdict: 'error',
    severity: 'high',
    explanation:
      'A permit-any-any at sequence 20 matches every packet, so every rule below it is dead code — including the guest-to-server deny at 30 and the user-to-management deny at 50. The comment says temporary and the date says over a year ago. Temporary rules that outlive their reason are among the most common serious firewall findings.',
  },
  {
    id: 'c01',
    area: 'firewall',
    config: 'seq 60  deny ip any any any       ! Explicit deny all',
    verdict: 'correct',
    explanation:
      'An explicit deny-all at the end is correct practice. Most platforms have an implicit one, but stating it makes the intent readable and, crucially, gives you something to log against.',
  },
  {
    id: 'c02',
    area: 'firewall',
    config:
      'seq 40  permit tcp 192.168.20.0/24 192.168.30.0/24 eq 22   ! Management to servers, SSH',
    verdict: 'correct',
    explanation:
      'Specific source, specific destination, single port. This is what a well-formed rule looks like — though note it is currently unreachable because of the permit-any above it.',
  },

  // -------------------------------- VLANs --------------------------------
  {
    id: 'c10',
    area: 'vlan',
    config: 'interface GigabitEthernet0/5\n switchport mode access\n switchport access vlan 1',
    verdict: 'error',
    severity: 'medium',
    explanation:
      'VLAN 1 is the default on every Cisco switch and should carry no user traffic. Using it for access ports means an attacker who reaches any unconfigured port lands in the same VLAN as management traffic on many designs. Move user ports to a purpose-made VLAN.',
  },
  {
    id: 'c11',
    area: 'vlan',
    config:
      'interface GigabitEthernet0/24\n switchport mode trunk\n switchport trunk native vlan 1\n switchport trunk allowed vlan all',
    verdict: 'error',
    severity: 'high',
    explanation:
      'Two errors in one interface. The native VLAN is untagged, so leaving it as VLAN 1 enables VLAN hopping via double tagging. And "allowed vlan all" means this trunk carries every VLAN including management and guest — a trunk should carry only the VLANs it actually needs.',
  },
  {
    id: 'c12',
    area: 'vlan',
    config:
      'interface GigabitEthernet0/10\n switchport mode access\n switchport access vlan 40\n switchport nonegotiate\n spanning-tree portfast\n spanning-tree bpduguard enable',
    verdict: 'correct',
    explanation:
      'Access port pinned to the guest VLAN, DTP negotiation disabled so it cannot be talked into becoming a trunk, and BPDU guard shutting the port if someone plugs in a switch. This is a correctly hardened access port.',
  },

  // ------------------------------ Wireless ------------------------------
  {
    id: 'c20',
    area: 'wireless',
    config:
      'wlan corporate\n ssid NORTHWIND-CORP\n security wpa2 psk\n psk ascii [REDACTED]\n broadcast-ssid enable',
    verdict: 'error',
    severity: 'high',
    explanation:
      'A corporate wireless network using a pre-shared key means every employee shares one credential. It cannot be revoked for one leaver, it provides no per-user attribution, and it is usually written on a whiteboard somewhere. Corporate wireless should use WPA2-Enterprise or WPA3-Enterprise with 802.1X, so each user authenticates individually.',
  },
  {
    id: 'c21',
    area: 'wireless',
    config:
      'wlan guest\n ssid NORTHWIND-GUEST\n security wpa2 psk\n client-isolation enable\n vlan 40\n rate-limit 5mbps',
    verdict: 'correct',
    explanation:
      'A PSK is acceptable for a guest network — there is no identity to protect and the credential is meant to be shared. Client isolation stops guests reaching each other, the guest VLAN segregates them, and the rate limit prevents one guest degrading the link.',
  },
  {
    id: 'c22',
    area: 'wireless',
    config: 'wlan legacy-scanners\n ssid NW-SCAN\n security wep\n broadcast-ssid disable',
    verdict: 'error',
    severity: 'high',
    explanation:
      'WEP is broken and has been for two decades — it can be cracked in minutes regardless of key length. Disabling SSID broadcast adds nothing, since the SSID appears in client probe requests anyway. Legacy devices that only support WEP belong on an isolated segment with compensating controls, not on a WEP network.',
  },

  // --------------------------------- NAC ---------------------------------
  {
    id: 'c30',
    area: 'nac',
    config:
      'dot1x system-auth-control\ninterface range Gi0/1-20\n authentication port-control auto\n authentication host-mode multi-domain\n dot1x pae authenticator',
    verdict: 'correct',
    explanation:
      '802.1X enabled with port-control auto means devices must authenticate before the port forwards traffic. Multi-domain host mode allows one data device plus one voice device per port, which is the normal requirement where IP phones are deployed.',
  },
  {
    id: 'c31',
    area: 'nac',
    config:
      'interface range Gi0/21-23\n authentication port-control force-authorized\n ! exempted for conference room ports',
    verdict: 'error',
    severity: 'medium',
    explanation:
      'force-authorized disables 802.1X on those ports entirely — anything plugged in gets network access with no authentication. Conference rooms are exactly where an unattended port is most likely to be abused. If guests need access there, put the ports on the guest VLAN rather than exempting them from NAC.',
  },

  // --------------------------------- DHCP ---------------------------------
  {
    id: 'c40',
    area: 'dhcp',
    config:
      'ip dhcp snooping\nip dhcp snooping vlan 10,20,30,40\ninterface GigabitEthernet0/24\n ip dhcp snooping trust',
    verdict: 'correct',
    explanation:
      'DHCP snooping enabled on the user VLANs, with only the uplink to the legitimate DHCP server trusted. A rogue DHCP server on an access port is dropped, which closes the on-path attack from Phase 1 where an attacker supplies their own gateway and DNS.',
  },
  {
    id: 'c41',
    area: 'dhcp',
    config:
      'ip dhcp pool GUEST\n network 192.168.40.0 255.255.255.0\n default-router 192.168.40.1\n dns-server 8.8.8.8\n lease 7',
    verdict: 'error',
    severity: 'low',
    explanation:
      'A seven-day lease on a guest network is far too long — guests are transient, so the pool fills with leases for devices that left days ago. Hours, not days. The external DNS server is a defensible choice for guests, but it does mean guest DNS queries bypass your internal DNS logging.',
  },

  // ---------------------------------- DNS ----------------------------------
  {
    id: 'c50',
    area: 'dns',
    config:
      'ip access-list extended DNS-EGRESS\n permit udp 192.168.0.0/16 host 192.168.30.20 eq 53\n deny udp any any eq 53\n permit ip any any',
    verdict: 'correct',
    explanation:
      'Internal hosts may reach only the internal resolver on port 53, and all other DNS egress is denied. This forces every query through a server you can log, which is what made the DNS evidence in the Phase 7 investigation available at all.',
  },
  {
    id: 'c51',
    area: 'dns',
    config:
      'ip name-server 192.168.30.20\nip domain-lookup\nno ip dns server-validation\n! DNSSEC validation disabled — was causing resolution failures',
    verdict: 'error',
    severity: 'medium',
    explanation:
      'DNSSEC validation was turned off to make a resolution problem go away, and the comment records that decision honestly. Without validation the resolver cannot detect forged responses, which reopens the DNS poisoning path. The underlying resolution failure needed fixing, not the validation.',
  },

  // ------------------------------ Monitoring ------------------------------
  {
    id: 'c60',
    area: 'monitoring',
    config:
      'ids sensor SENSOR-CORE\n mode promiscuous\n interface span-session-1\n signature-set current\n action alert-only',
    verdict: 'correct',
    explanation:
      'A sensor in promiscuous mode off a SPAN session is an IDS — it observes a copy of the traffic and alerts. Alert-only is correct for this deployment: it cannot introduce latency or drop legitimate traffic, and it is the right first step before moving to inline blocking.',
  },
  {
    id: 'c61',
    area: 'monitoring',
    config:
      'ips sensor SENSOR-PERIMETER\n mode inline\n interface GigabitEthernet0/1\n signature-set 2024-11-02\n action deny-packet-inline\n fail-open enable',
    verdict: 'error',
    severity: 'high',
    explanation:
      "Two problems. The signature set is well over a year old, so the sensor is blocking last year's attacks. And fail-open on an inline IPS means that if the sensor fails, traffic passes uninspected — which is an availability choice with a security cost, and it should be a deliberate, documented decision rather than a default nobody revisited.",
  },
  {
    id: 'c62',
    area: 'monitoring',
    config:
      'logging host 192.168.20.30\nlogging trap informational\nlogging source-interface Loopback0\nntp server 192.168.20.10',
    verdict: 'correct',
    explanation:
      'Logs forwarded to the management-zone collector at informational level, with a stable source interface and NTP configured. That last part matters more than it looks: without synchronised time, correlating events across devices — the Phase 7 investigation — does not work.',
  },

  // ---------------------------------- VPN ----------------------------------
  {
    id: 'c70',
    area: 'vpn',
    config:
      'crypto ikev2 proposal CORP\n encryption aes-gcm-256\n prf sha384\n group 20\ncrypto ipsec transform-set CORP esp-gcm 256',
    verdict: 'correct',
    explanation:
      'AES-GCM-256 is authenticated encryption, group 20 is a 384-bit elliptic curve for key exchange, and SHA-384 for the pseudorandom function. This is a modern, correctly specified proposal — and the Phase 6 vocabulary applies directly.',
  },
  {
    id: 'c71',
    area: 'vpn',
    config:
      'crypto ikev2 authorization policy REMOTE\n pool VPN-POOL\n route set access-list SPLIT-TUNNEL\nip access-list standard SPLIT-TUNNEL\n permit 192.168.0.0 0.0.255.255',
    verdict: 'correct',
    explanation:
      'Split tunnelling sending only internal traffic over the VPN. This is a legitimate design trade-off — it reduces load and improves user experience, at the cost of internet traffic bypassing your inspection. It is correct here because the endpoints have their own controls; it would be an error in an environment relying on perimeter inspection.',
  },
];

export function getConfigItem(id: string): ConfigItem | undefined {
  return CONFIG_ITEMS.find((i) => i.id === id);
}

export function itemsInArea(area: ConfigArea): ConfigItem[] {
  return CONFIG_ITEMS.filter((i) => i.area === area);
}

export const ERROR_COUNT = CONFIG_ITEMS.filter((i) => i.verdict === 'error').length;
export const CORRECT_COUNT = CONFIG_ITEMS.filter((i) => i.verdict === 'correct').length;
