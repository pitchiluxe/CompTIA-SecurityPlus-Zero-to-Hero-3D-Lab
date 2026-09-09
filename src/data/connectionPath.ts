// ---------------------------------------------------------------------------
// The Phase 1 connection path: User -> Endpoint -> Network -> Server -> Controls
//
// Single source of truth for both the 3D/2D visualisation and the teaching
// content. The `trace connection ws-01 srv-01` simulator output describes the
// same nine steps; keeping them in one file stops the two from drifting.
// ---------------------------------------------------------------------------

export type PathStageId = 'user' | 'endpoint' | 'network' | 'server' | 'controls';

export type PathStep = {
  /** 1-based, matching the numbering in the simulator transcript. */
  order: number;
  label: string;
  detail: string;
};

export type PathStage = {
  id: PathStageId;
  title: string;
  subtitle: string;
  /** World X position in the 3D scene; stages run left to right. */
  x: number;
  color: string;
  steps: PathStep[];
  /** Controls that can prevent or constrain traffic at this stage. */
  controls: string[];
  /** Places this stage produces evidence a defender can look at. */
  detectionOpportunities: string[];
};

export const PATH_STAGES: PathStage[] = [
  {
    id: 'user',
    title: 'User',
    subtitle: 'analyst1 requests a resource',
    x: -10,
    color: '#38bdf8',
    steps: [
      {
        order: 1,
        label: 'Request initiated',
        detail:
          'analyst1 requests https://srv-01.lab.local. Every connection starts with an identity and an intent — both are things you can authenticate and authorise.',
      },
    ],
    controls: [
      'Authentication',
      'Authorisation',
      'Security awareness training',
      'Acceptable use policy',
    ],
    detectionOpportunities: [
      'Authentication logs — who, when, from where',
      'Anomalous access time or location for this identity',
    ],
  },
  {
    id: 'endpoint',
    title: 'Endpoint',
    subtitle: 'WS-01 · 192.168.1.10',
    x: -5,
    color: '#3b82f6',
    steps: [
      {
        order: 2,
        label: 'Host policy evaluated',
        detail:
          'The host firewall permits outbound 443. Host policy is the first enforcement point, and the only one that sees the process behind the traffic.',
      },
      {
        order: 3,
        label: 'Name resolved',
        detail:
          'A DNS query goes to DC-01 (192.168.1.20) and returns 192.168.1.30. Resolution happens before any connection — poison it and you redirect traffic without touching the network path.',
      },
    ],
    controls: ['Host firewall', 'EDR / antimalware', 'Application allowlisting', 'Disk encryption'],
    detectionOpportunities: [
      'DNS query logs — the name is often more useful than the IP',
      'Process creation events (Windows 4688) tying a process to the connection',
      'EDR telemetry on the process making the request',
    ],
  },
  {
    id: 'network',
    title: 'Network',
    subtitle: 'Switch · router · firewall',
    x: 0,
    color: '#f59e0b',
    steps: [
      {
        order: 4,
        label: 'Layer 2 resolution',
        detail:
          'ARP resolves 192.168.1.30 to aa:bb:cc:dd:ee:02. Two IPs sharing one MAC, or a changing gateway MAC, is the signature of an on-path attack.',
      },
      {
        order: 5,
        label: 'Frame switched',
        detail:
          'The Cisco 2960X forwards the frame on VLAN 10. VLANs are the first segmentation control — traffic that never reaches a segment cannot attack it.',
      },
      {
        order: 6,
        label: 'Firewall policy applied',
        detail:
          'FW-01 matches policy "trust->trust allow-web", permits the flow, and logs it. This is the perimeter: the default route guarantees every non-local packet arrives here.',
      },
    ],
    controls: [
      'VLAN segmentation',
      'Firewall policy',
      'Routing and the default route',
      'IDS/IPS placement',
    ],
    detectionOpportunities: [
      'Firewall flow logs — source, destination, port, bytes, duration',
      'NetFlow patterns showing beaconing regularity',
      'IDS signatures on unencrypted traffic',
    ],
  },
  {
    id: 'server',
    title: 'Server',
    subtitle: 'SRV-01 · 192.168.1.30',
    x: 5,
    color: '#22c55e',
    steps: [
      {
        order: 7,
        label: 'Connection accepted',
        detail:
          'nginx accepts TCP 443. The server only sees what reached it — everything filtered earlier is invisible here, which is why server logs alone never tell the whole story.',
      },
      {
        order: 8,
        label: 'TLS handshake',
        detail:
          'The certificate is validated and the session encrypted. From this point payload inspection is unavailable to anything in the middle without TLS interception.',
      },
      {
        order: 9,
        label: 'Response returned',
        detail:
          'HTTP 200 travels back over the established session. Response headers matter: HSTS present, Server version trimmed.',
      },
    ],
    controls: [
      'Service hardening and version disclosure',
      'TLS configuration and HSTS',
      'Loopback-only binding for internal services',
      'Server-side authentication and authorisation',
    ],
    detectionOpportunities: [
      'Web server access and error logs',
      'Authentication failures at the application layer',
      'Certificate and TLS version anomalies',
    ],
  },
  {
    id: 'controls',
    title: 'Security Controls',
    subtitle: 'SIEM-01 · monitoring and response',
    x: 10,
    color: '#a855f7',
    steps: [
      {
        order: 9,
        label: 'Flow logged and correlated',
        detail:
          'FW-01 forwards the flow record to SIEM-01, where it joins endpoint and DNS telemetry. Correlation across stages is what turns three unremarkable events into one incident.',
      },
    ],
    controls: [
      'Centralised logging',
      'Correlation rules',
      'Alerting and escalation',
      'Retention policy',
    ],
    detectionOpportunities: [
      'Cross-source correlation — DNS plus process plus flow',
      'Baseline deviation over time',
      'Threat intelligence matches on the destination',
    ],
  },
];

/** Every step in order, flattened — matches the simulator transcript numbering. */
export const PATH_STEPS: (PathStep & { stage: PathStageId })[] = PATH_STAGES.flatMap((stage) =>
  stage.steps.map((step) => ({ ...step, stage: stage.id }))
);

export function getStage(id: PathStageId): PathStage | undefined {
  return PATH_STAGES.find((s) => s.id === id);
}
