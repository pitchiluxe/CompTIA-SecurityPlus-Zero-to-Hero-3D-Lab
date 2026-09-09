// ---------------------------------------------------------------------------
// Firewall rule-set analysis.
//
// Firewall rules evaluate top-down, first match wins. That single property
// causes the most common real-world firewall error: a broad permit placed
// above a specific deny makes the deny dead code, and the rule set looks
// correct to anyone reading it as a list of intentions rather than as an
// ordered program.
//
// Shadowing is COMPUTED from CIDR and port containment rather than hard-coded,
// so a learner can reorder rules and watch the analysis change.
// ---------------------------------------------------------------------------

export type RuleAction = 'permit' | 'deny';

export type FirewallRule = {
  id: string;
  seq: number;
  action: RuleAction;
  protocol: 'tcp' | 'udp' | 'ip';
  /** CIDR notation, or 'any'. */
  source: string;
  destination: string;
  /** Single port, 'start-end' range, or 'any'. */
  port: string;
  description: string;
};

// --------------------------------- CIDR ---------------------------------

type Cidr = { base: number; bits: number };

/** Parse dotted-quad CIDR into a numeric base and prefix length. */
export function parseCidr(input: string): Cidr | undefined {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'any') return { base: 0, bits: 0 };

  const [addr, prefix] = trimmed.split('/');
  const octets = addr.split('.');
  if (octets.length !== 4) return undefined;

  let base = 0;
  for (const octet of octets) {
    const n = Number(octet);
    if (!Number.isInteger(n) || n < 0 || n > 255) return undefined;
    base = base * 256 + n;
  }

  const bits = prefix === undefined ? 32 : Number(prefix);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return undefined;

  // Normalise: zero the host bits so 192.168.1.5/24 and 192.168.1.0/24 compare
  // as the same network, which is how a firewall would treat them.
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { base: (base & mask) >>> 0, bits };
}

/** True when `outer` covers every address `inner` covers. */
export function cidrContains(outer: string, inner: string): boolean {
  const o = parseCidr(outer);
  const i = parseCidr(inner);
  if (!o || !i) return false;
  if (o.bits > i.bits) return false; // a smaller network cannot contain a larger one

  const mask = o.bits === 0 ? 0 : (0xffffffff << (32 - o.bits)) >>> 0;
  return (i.base & mask) >>> 0 === o.base;
}

// --------------------------------- Ports ---------------------------------

type PortRange = { from: number; to: number };

export function parsePorts(input: string): PortRange | undefined {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'any') return { from: 0, to: 65535 };

  if (trimmed.includes('-')) {
    const [a, b] = trimmed.split('-').map(Number);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a > b) return undefined;
    return { from: a, to: b };
  }

  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 0 || n > 65535) return undefined;
  return { from: n, to: n };
}

export function portsContain(outer: string, inner: string): boolean {
  const o = parsePorts(outer);
  const i = parsePorts(inner);
  if (!o || !i) return false;
  return o.from <= i.from && o.to >= i.to;
}

// ------------------------------- Shadowing -------------------------------

/** True when `earlier` matches every packet `later` would match. */
export function shadows(earlier: FirewallRule, later: FirewallRule): boolean {
  const protocolCovers = earlier.protocol === 'ip' || earlier.protocol === later.protocol;

  return (
    protocolCovers &&
    cidrContains(earlier.source, later.source) &&
    cidrContains(earlier.destination, later.destination) &&
    portsContain(earlier.port, later.port)
  );
}

export type ShadowFinding = {
  /** The rule that never fires. */
  shadowedRule: FirewallRule;
  /** The earlier rule that swallows it. */
  shadowedBy: FirewallRule;
  /**
   * Same action means the later rule is merely redundant. Different action
   * means the intent is actively defeated — the serious case.
   */
  kind: 'redundant' | 'contradicted';
};

/**
 * Every rule that can never match, because an earlier rule already covers
 * everything it would. Rules are evaluated in sequence order.
 */
export function findShadowedRules(rules: FirewallRule[]): ShadowFinding[] {
  const ordered = [...rules].sort((a, b) => a.seq - b.seq);
  const findings: ShadowFinding[] = [];

  for (let i = 0; i < ordered.length; i++) {
    for (let j = 0; j < i; j++) {
      if (!shadows(ordered[j], ordered[i])) continue;
      findings.push({
        shadowedRule: ordered[i],
        shadowedBy: ordered[j],
        kind: ordered[j].action === ordered[i].action ? 'redundant' : 'contradicted',
      });
      break; // the first rule that shadows it is the one that matters
    }
  }

  return findings;
}

/** True when the rule set ends in an explicit deny-all. */
export function hasExplicitDenyAll(rules: FirewallRule[]): boolean {
  const ordered = [...rules].sort((a, b) => a.seq - b.seq);
  const last = ordered[ordered.length - 1];
  if (!last) return false;
  return (
    last.action === 'deny' &&
    last.source === 'any' &&
    last.destination === 'any' &&
    last.port === 'any'
  );
}

/** Rules permitting any source to any destination on any port. */
export function findOverlyBroadPermits(rules: FirewallRule[]): FirewallRule[] {
  return rules.filter(
    (r) =>
      r.action === 'permit' && r.source === 'any' && r.destination === 'any' && r.port === 'any'
  );
}
