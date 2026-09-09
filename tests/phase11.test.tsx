import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  cidrContains,
  findOverlyBroadPermits,
  findShadowedRules,
  hasExplicitDenyAll,
  parseCidr,
  parsePorts,
  portsContain,
  shadows,
  type FirewallRule,
} from '../src/lib/firewallAnalysis';
import {
  AREA_LABELS,
  CONFIG_ITEMS,
  CORRECT_COUNT,
  ERROR_COUNT,
  FIREWALL_RULES,
  getConfigItem,
  itemsInArea,
  type ConfigArea,
} from '../src/data/networkConfig';
import {
  countConfigReviewed,
  gradeConfigReview,
  isConfigReviewComplete,
  type ConfigAnswer,
} from '../src/lib/configReview';
import { PHASE_11 } from '../src/data/phase11';
import { NetworkReviewView } from '../src/components/NetworkReviewView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_11_COMMANDS } from '../src/sim/phase11Commands';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

function perfectReview(): ConfigAnswer {
  return Object.fromEntries(CONFIG_ITEMS.map((i) => [i.id, i.verdict]));
}

const rule = (over: Partial<FirewallRule> & { seq: number }): FirewallRule => ({
  id: `r${over.seq}`,
  action: 'permit',
  protocol: 'tcp',
  source: 'any',
  destination: 'any',
  port: 'any',
  description: '',
  ...over,
});

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('CIDR containment', () => {
  it('parses dotted-quad CIDR and normalises host bits', () => {
    expect(parseCidr('192.168.1.0/24')).toEqual(parseCidr('192.168.1.5/24'));
    expect(parseCidr('any')).toEqual({ base: 0, bits: 0 });
  });

  it('rejects malformed input rather than throwing', () => {
    expect(parseCidr('not-an-address')).toBeUndefined();
    expect(parseCidr('192.168.1')).toBeUndefined();
    expect(parseCidr('192.168.1.300/24')).toBeUndefined();
    expect(parseCidr('192.168.1.0/33')).toBeUndefined();
  });

  it('recognises a supernet containing a subnet', () => {
    expect(cidrContains('192.168.0.0/16', '192.168.10.0/24')).toBe(true);
    expect(cidrContains('any', '192.168.10.0/24')).toBe(true);
    expect(cidrContains('0.0.0.0/0', '10.0.0.0/8')).toBe(true);
  });

  it('rejects a subnet claiming to contain a supernet', () => {
    expect(cidrContains('192.168.10.0/24', '192.168.0.0/16')).toBe(false);
  });

  it('rejects disjoint networks', () => {
    expect(cidrContains('192.168.10.0/24', '192.168.20.0/24')).toBe(false);
    expect(cidrContains('10.0.0.0/8', '192.168.1.0/24')).toBe(false);
  });

  it('treats an identical network as contained', () => {
    expect(cidrContains('192.168.10.0/24', '192.168.10.0/24')).toBe(true);
  });
});

describe('port containment', () => {
  it('parses single ports, ranges and any', () => {
    expect(parsePorts('443')).toEqual({ from: 443, to: 443 });
    expect(parsePorts('1000-2000')).toEqual({ from: 1000, to: 2000 });
    expect(parsePorts('any')).toEqual({ from: 0, to: 65535 });
  });

  it('rejects malformed ports', () => {
    expect(parsePorts('http')).toBeUndefined();
    expect(parsePorts('99999')).toBeUndefined();
    expect(parsePorts('2000-1000')).toBeUndefined();
  });

  it('recognises containment', () => {
    expect(portsContain('any', '443')).toBe(true);
    expect(portsContain('1000-2000', '1500')).toBe(true);
    expect(portsContain('443', 'any')).toBe(false);
    expect(portsContain('443', '22')).toBe(false);
  });
});

describe('rule shadowing', () => {
  it('detects a broad permit shadowing a specific deny', () => {
    const broad = rule({ seq: 10, action: 'permit', protocol: 'ip' });
    const specific = rule({
      seq: 20,
      action: 'deny',
      source: '192.168.40.0/24',
      destination: '192.168.30.0/24',
    });
    expect(shadows(broad, specific)).toBe(true);
  });

  it('does not treat a specific rule as shadowing a broad one', () => {
    const specific = rule({ seq: 10, source: '192.168.40.0/24' });
    const broad = rule({ seq: 20 });
    expect(shadows(specific, broad)).toBe(false);
  });

  it('requires the protocol to cover the later rule', () => {
    const udpBroad = rule({ seq: 10, protocol: 'udp' });
    const tcpRule = rule({ seq: 20, protocol: 'tcp' });
    expect(shadows(udpBroad, tcpRule)).toBe(false);

    const ipBroad = rule({ seq: 10, protocol: 'ip' });
    expect(shadows(ipBroad, tcpRule)).toBe(true);
  });

  it('classifies same-action shadowing as redundant and differing as contradicted', () => {
    const rules = [
      rule({ seq: 10, action: 'permit', protocol: 'ip' }),
      rule({ seq: 20, action: 'permit', source: '10.0.0.0/8' }),
      rule({ seq: 30, action: 'deny', source: '10.0.0.0/8' }),
    ];
    const findings = findShadowedRules(rules);
    expect(findings.find((f) => f.shadowedRule.seq === 20)?.kind).toBe('redundant');
    expect(findings.find((f) => f.shadowedRule.seq === 30)?.kind).toBe('contradicted');
  });

  it('reports no shadowing when rules are correctly ordered', () => {
    const rules = [
      rule({ seq: 10, action: 'deny', source: '192.168.40.0/24', destination: '192.168.30.0/24' }),
      rule({
        seq: 20,
        action: 'permit',
        source: '192.168.10.0/24',
        destination: '192.168.30.0/24',
        port: '443',
      }),
    ];
    expect(findShadowedRules(rules)).toHaveLength(0);
  });

  it('evaluates in sequence order rather than array order', () => {
    // Deliberately out of order in the array; seq decides evaluation.
    const rules = [
      rule({ seq: 30, action: 'deny', source: '10.0.0.0/8' }),
      rule({ seq: 10, action: 'permit', protocol: 'ip' }),
    ];
    const findings = findShadowedRules(rules);
    expect(findings).toHaveLength(1);
    expect(findings[0].shadowedRule.seq).toBe(30);
  });
});

describe('the lab firewall rule set', () => {
  it('contains an overly broad permit', () => {
    expect(findOverlyBroadPermits(FIREWALL_RULES)).toHaveLength(1);
  });

  it('ends with an explicit deny all', () => {
    expect(hasExplicitDenyAll(FIREWALL_RULES)).toBe(true);
  });

  it('has rules made unreachable by the broad permit', () => {
    const findings = findShadowedRules(FIREWALL_RULES);
    expect(findings.length).toBeGreaterThan(0);
    // Every shadowed rule is swallowed by the permit-any at seq 20.
    expect(findings.every((f) => f.shadowedBy.seq === 20)).toBe(true);
  });

  it('becomes reachable again when the broad permit is moved down', () => {
    // This is the phase's central demonstration, so it is asserted rather
    // than left to the UI.
    const before = findShadowedRules(FIREWALL_RULES).length;
    const reordered = FIREWALL_RULES.map((r) => (r.id === 'fw2' ? { ...r, seq: 55 } : r));
    const after = findShadowedRules(reordered).length;

    expect(before).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });
});

describe('Phase 11 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_11.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'firewall',
      'ids',
      'ips',
      'acl',
      'segmentation',
      'vlan',
      'vpn',
      'secure protocol',
      'monitoring',
      'wireless',
      'nac',
      'dhcp',
      'dns',
    ];

    for (const topic of required) {
      expect(text, `Phase 11 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('ships three lessons and three labs', () => {
    expect(PHASE_11.lessons).toHaveLength(3);
    expect(PHASE_11.labs).toHaveLength(3);
  });

  it('builds on the Phase 4 zone architecture', () => {
    expect(PHASE_11.scene).toBe('zones');
    const text = PHASE_11.labs.map((l) => `${l.topology} ${l.environment}`).join(' ');
    expect(text).toMatch(/Phase 4/);
  });
});

describe('injected configuration errors', () => {
  it('contains both errors and correct configuration', () => {
    expect(ERROR_COUNT).toBeGreaterThan(0);
    expect(CORRECT_COUNT).toBeGreaterThan(0);
    expect(ERROR_COUNT + CORRECT_COUNT).toBe(CONFIG_ITEMS.length);
  });

  it('covers every declared configuration area', () => {
    for (const area of Object.keys(AREA_LABELS) as ConfigArea[]) {
      expect(itemsInArea(area).length, `${area} has no items`).toBeGreaterThan(0);
    }
  });

  it('never reveals the verdict in the config text itself', () => {
    // The learner must decide from the configuration, not from a hint.
    for (const item of CONFIG_ITEMS) {
      expect(item.config.toLowerCase(), `${item.id} leaks its verdict`).not.toMatch(
        /\berror\b|\bincorrect\b|\bmisconfigur|\bshould be\b|\brecommended\b/
      );
    }
  });

  it('gives every error a severity and every correct item none', () => {
    for (const item of CONFIG_ITEMS) {
      if (item.verdict === 'error') {
        expect(item.severity, `${item.id} is an error with no severity`).toBeTruthy();
      } else {
        expect(item.severity, `${item.id} is correct but carries a severity`).toBeUndefined();
      }
    }
  });

  it('gives every item a substantive explanation', () => {
    for (const item of CONFIG_ITEMS) {
      expect(item.explanation.length, `${item.id} explanation too thin`).toBeGreaterThan(80);
    }
  });

  it('includes correct items that look questionable, so flagging everything fails', () => {
    // Split-tunnel VPN and alert-only IDS are legitimate design decisions.
    const splitTunnel = CONFIG_ITEMS.find((i) => i.config.includes('SPLIT-TUNNEL'))!;
    expect(splitTunnel.verdict).toBe('correct');

    const alertOnly = CONFIG_ITEMS.find((i) => i.config.includes('action alert-only'))!;
    expect(alertOnly.verdict).toBe('correct');
  });

  it('resolves an item by id', () => {
    expect(getConfigItem('c00')?.verdict).toBe('error');
    expect(getConfigItem('nope')).toBeUndefined();
  });
});

describe('config review grading', () => {
  it('scores a perfect review', () => {
    const result = gradeConfigReview(perfectReview());
    expect(result.correctCount).toBe(CONFIG_ITEMS.length);
    expect(result.missedErrors).toBe(0);
    expect(result.falseErrors).toBe(0);
    expect(result.missedHighSeverity).toBe(0);
  });

  it('names passing a real error a missed error', () => {
    const answer = { ...perfectReview() };
    const err = CONFIG_ITEMS.find((i) => i.verdict === 'error')!;
    answer[err.id] = 'correct';

    const result = gradeConfigReview(answer);
    expect(result.missedErrors).toBe(1);
    expect(result.items.find((i) => i.itemId === err.id)?.errorKind).toBe('missed-error');
  });

  it('names flagging correct config a false error', () => {
    const answer = { ...perfectReview() };
    const ok = CONFIG_ITEMS.find((i) => i.verdict === 'correct')!;
    answer[ok.id] = 'error';

    const result = gradeConfigReview(answer);
    expect(result.falseErrors).toBe(1);
    expect(result.items.find((i) => i.itemId === ok.id)?.errorKind).toBe('false-error');
  });

  it('penalises flagging everything as an error', () => {
    const answer: ConfigAnswer = Object.fromEntries(
      CONFIG_ITEMS.map((i) => [i.id, 'error' as const])
    );
    const result = gradeConfigReview(answer);
    expect(result.falseErrors).toBe(CORRECT_COUNT);
  });

  it('counts missed high-severity errors separately', () => {
    const answer: ConfigAnswer = Object.fromEntries(
      CONFIG_ITEMS.map((i) => [i.id, 'correct' as const])
    );
    const result = gradeConfigReview(answer);
    expect(result.missedErrors).toBe(ERROR_COUNT);
    expect(result.missedHighSeverity).toBeGreaterThan(0);
  });

  it('tracks completeness and count', () => {
    expect(isConfigReviewComplete({})).toBe(false);
    expect(countConfigReviewed({})).toBe(0);
    expect(isConfigReviewComplete(perfectReview())).toBe(true);
  });
});

describe('Phase 11 simulated evidence', () => {
  it('shows match counters exposing unreachable rules', () => {
    const out = runCommand('show access-list perimeter').output;
    expect(out).toMatch(/2,847,113 matches/);
    expect(out).toMatch(/unreachable rules/i);
  });

  it('states the first-match-wins rule explicitly', () => {
    const out = runCommand('explain rule ordering').output;
    expect(out).toMatch(/FIRST match wins/i);
    expect(out).toMatch(/PROGRAM, not a list of intentions/i);
  });

  it('distinguishes IDS from IPS by placement and blocking', () => {
    const out = runCommand('compare ids ips').output;
    expect(out).toMatch(/Out of band/);
    expect(out).toMatch(/Inline/);
    expect(out).toMatch(/FAIL-OPEN vs FAIL-CLOSED/);
  });

  it('flags the native VLAN and trunk problems', () => {
    const out = runCommand('show vlan config').output;
    expect(out).toMatch(/native vlan 1/);
    expect(out).toMatch(/allowed vlan all/);
    expect(out).toMatch(/VLAN HOPPING/);
  });

  it('states that hiding an SSID is not security', () => {
    expect(runCommand('compare wireless security').output).toMatch(
      /HIDING THE SSID IS NOT SECURITY/
    );
  });

  it('warns about force-authorized NAC exemptions', () => {
    const out = runCommand('explain nac').output;
    expect(out).toMatch(/force-authorized/);
    expect(out).toMatch(/never get removed/i);
  });

  it('connects DHCP snooping and DAI to the on-path attacks', () => {
    const out = runCommand('explain dhcp dns security').output;
    expect(out).toMatch(/DHCP snooping/);
    expect(out).toMatch(/Dynamic ARP Inspection/);
    expect(out).toMatch(/DNS over HTTPS/);
  });

  it('includes NTP on the hardening checklist with its reason', () => {
    const out = runCommand('show network hardening checklist').output;
    expect(out).toMatch(/NTP configured/);
    expect(out).toMatch(/correlation needs synchronised time/i);
  });

  it('labels every artifact with a provenance', () => {
    for (const c of PHASE_11_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
    }
  });
});

describe('NetworkReviewView', () => {
  it('opens on the configuration review with no recommended values shown', () => {
    renderAt('/network-review', '/network-review', <NetworkReviewView />);
    expect(
      screen.getByText(/there is no recommended value to compare against/)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /: Error$/ })).toHaveLength(CONFIG_ITEMS.length);
  });

  it('blocks submission until every item is reviewed', () => {
    renderAt('/network-review', '/network-review', <NetworkReviewView />);
    expect(screen.getByRole('button', { name: 'Submit review' })).toBeDisabled();
  });

  it('grades a perfect review and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/network-review', '/network-review', <NetworkReviewView />);

    for (const item of CONFIG_ITEMS) {
      const label = item.verdict === 'correct' ? 'Correct' : 'Error';
      await user.click(screen.getByRole('button', { name: `${item.id}: ${label}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(screen.getByTestId('review-score')).toHaveTextContent(`${CONFIG_ITEMS.length}/`);
    expect(screen.getByTestId('missed-errors')).toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('network-hardening')).toBe(1);
  }, 20_000);

  it('reports false errors when the learner flags everything', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/network-review', '/network-review', <NetworkReviewView />);

    for (const item of CONFIG_ITEMS) {
      await user.click(screen.getByRole('button', { name: `${item.id}: Error` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(screen.getByTestId('false-errors')).toHaveTextContent(String(CORRECT_COUNT));
  }, 20_000);

  it('shows the shadowed rules on the firewall tab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/network-review', '/network-review', <NetworkReviewView />);

    await user.click(screen.getByRole('button', { name: 'Firewall rule analysis' }));

    const expected = findShadowedRules(FIREWALL_RULES).length;
    expect(screen.getByTestId('shadowed-count')).toHaveTextContent(String(expected));
    expect(screen.getByTestId('broad-permits')).toHaveTextContent('1');
    expect(screen.getByTestId('deny-all')).toHaveTextContent('Present');
  });

  it('recomputes the analysis when the rules are reordered', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/network-review', '/network-review', <NetworkReviewView />);

    await user.click(screen.getByRole('button', { name: 'Firewall rule analysis' }));
    const before = screen.getByTestId('shadowed-count').textContent;

    await user.click(screen.getByRole('button', { name: 'Move permit-any to seq 55' }));
    expect(screen.getByTestId('shadowed-count').textContent).not.toBe(before);

    await user.click(screen.getByRole('button', { name: 'Restore original order' }));
    expect(screen.getByTestId('shadowed-count').textContent).toBe(before);
  });
});

describe('Phase 11 labs and quizzes', () => {
  it('shows the match counters in the firewall lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p11-lab-0', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'show access-list perimeter{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/unreachable rules/i).length).toBeGreaterThan(0);
  });

  it('shows the VLAN hopping conditions in the review lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p11-lab-1', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'show vlan config{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/VLAN HOPPING/)).toBeInTheDocument();
  });

  it('grades the rule-ordering quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p11-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'None — the permit at 20 matches first, so the deny never fires',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('rule-ordering')).toBe(1);
  });
});
