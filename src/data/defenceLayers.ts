// ---------------------------------------------------------------------------
// Phase 2 — defence-in-depth layers.
//
// Concentric rings around a single asset. Ordered outermost (policy) to
// innermost (data). Shared by the 3D scene, the 2D fallback, and the
// `show defense layers` simulator output.
// ---------------------------------------------------------------------------

import type { RiskField } from '../types';

export type ControlFunction = 'preventive' | 'detective' | 'corrective' | 'deterrent';
export type ControlType = 'physical' | 'technical' | 'administrative';

export type LayerControl = {
  name: string;
  function: ControlFunction;
  type: ControlType;
};

export type DefenceLayer = {
  id: string;
  /** 1 = outermost. */
  order: number;
  title: string;
  /** Ring radius in the 3D scene; larger = further from the asset. */
  radius: number;
  color: string;
  controls: LayerControl[];
  /** What this layer still does once every layer outside it has failed. */
  whenOuterLayersFail: string;
};

export const ASSET_LABEL = 'Patient records';
export const ASSET_DETAIL = '12,000 medical histories — Northwind Clinic';

export const DEFENCE_LAYERS: DefenceLayer[] = [
  {
    id: 'policy',
    order: 1,
    title: 'Policy',
    radius: 9,
    color: '#a855f7',
    controls: [
      { name: 'Acceptable use policy', function: 'preventive', type: 'administrative' },
      { name: 'Quarterly access review', function: 'detective', type: 'administrative' },
      { name: 'Disciplinary policy', function: 'deterrent', type: 'administrative' },
      { name: 'Incident response plan', function: 'corrective', type: 'administrative' },
    ],
    whenOuterLayersFail:
      'Outermost layer — governs everything inside it. Policy failure does not stop traffic, but it removes the authority to enforce and the process to respond.',
  },
  {
    id: 'physical',
    order: 2,
    title: 'Physical',
    radius: 7.6,
    color: '#f472b6',
    controls: [
      { name: 'Door badge reader', function: 'preventive', type: 'physical' },
      { name: 'CCTV recording', function: 'detective', type: 'physical' },
      { name: 'Visitor escort procedure', function: 'preventive', type: 'administrative' },
    ],
    whenOuterLayersFail:
      'Still denies physical access to the server room. An attacker who has defeated policy governance has gained nothing physically.',
  },
  {
    id: 'perimeter',
    order: 3,
    title: 'Perimeter',
    radius: 6.2,
    color: '#ef4444',
    controls: [
      { name: 'Firewall deny rule', function: 'preventive', type: 'technical' },
      { name: 'VPN with MFA', function: 'preventive', type: 'technical' },
      { name: 'Firewall flow logging', function: 'detective', type: 'technical' },
    ],
    whenOuterLayersFail:
      'Still filters and logs every non-local packet, because the default route guarantees traffic arrives here. This is the layer Zero Trust refuses to treat as a trust boundary.',
  },
  {
    id: 'network',
    order: 4,
    title: 'Network',
    radius: 4.8,
    color: '#f59e0b',
    controls: [
      { name: 'VLAN segmentation', function: 'preventive', type: 'technical' },
      { name: 'IDS signatures', function: 'detective', type: 'technical' },
      { name: 'Network access control', function: 'preventive', type: 'technical' },
    ],
    whenOuterLayersFail:
      'Still contains lateral movement. An attacker past the perimeter reaches only the segment they landed in, not the whole estate.',
  },
  {
    id: 'endpoint',
    order: 5,
    title: 'Endpoint',
    radius: 3.4,
    color: '#3b82f6',
    controls: [
      { name: 'Host firewall', function: 'preventive', type: 'technical' },
      { name: 'EDR telemetry', function: 'detective', type: 'technical' },
      { name: 'Patch management', function: 'preventive', type: 'technical' },
      { name: 'Disk encryption', function: 'preventive', type: 'technical' },
    ],
    whenOuterLayersFail:
      'Still the only layer that sees the process behind the traffic. EDR attributes an action to a binary and a user where the network layers see only an address.',
  },
  {
    id: 'application',
    order: 6,
    title: 'Application',
    radius: 2.2,
    color: '#22c55e',
    controls: [
      { name: 'Input validation', function: 'preventive', type: 'technical' },
      { name: 'Authorisation checks', function: 'preventive', type: 'technical' },
      { name: 'Application audit log', function: 'detective', type: 'technical' },
    ],
    whenOuterLayersFail:
      'Still enforces who may read which record. Network access does not imply application authorisation — this is where Zero Trust is actually implemented.',
  },
  {
    id: 'data',
    order: 7,
    title: 'Data',
    radius: 1.2,
    color: '#38bdf8',
    controls: [
      { name: 'Encryption at rest', function: 'preventive', type: 'technical' },
      { name: 'Automated backup restore', function: 'corrective', type: 'technical' },
      { name: 'Database access audit', function: 'detective', type: 'technical' },
    ],
    whenOuterLayersFail:
      'Last layer before the asset. Encryption at rest means stolen storage is unreadable, and backups mean destruction is recoverable — protection that survives every other failure.',
  },
];

export function getLayer(id: string): DefenceLayer | undefined {
  return DEFENCE_LAYERS.find((l) => l.id === id);
}

/** Every control across every layer, for classification exercises. */
export function allControls(): (LayerControl & { layer: string })[] {
  return DEFENCE_LAYERS.flatMap((l) => l.controls.map((c) => ({ ...c, layer: l.title })));
}

/**
 * Layers that still stand once the named layers have failed. Defence in depth
 * is the claim that this set is never empty until the innermost layer falls.
 */
export function remainingLayers(failed: Set<string>): DefenceLayer[] {
  return DEFENCE_LAYERS.filter((l) => !failed.has(l.id));
}

/** Phase 2 vocabulary that the risk workbench also uses. */
export const RISK_FIELDS_TAUGHT: RiskField[] = [
  'asset',
  'threat',
  'vulnerability',
  'risk',
  'control',
  'residualRisk',
];
