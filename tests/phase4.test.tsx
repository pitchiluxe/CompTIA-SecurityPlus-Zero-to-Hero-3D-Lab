import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  BOUNDARIES,
  NETWORK_ZONES,
  boundariesFor,
  getBoundary,
  getZone,
  trustDelta,
} from '../src/data/networkZones';
import { PHASE_4 } from '../src/data/phase4';
import { ZonesView } from '../src/components/ZonesView';
import { ZoneFallback2D } from '../src/scenes/ZoneFallback2D';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { listCommands, runCommand } from '../src/sim/commands';
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

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 4 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_4.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'segmentation',
      'vlan',
      'dmz',
      'zero trust',
      'security zone',
      'firewall',
      'ids',
      'ips',
      'waf',
      'proxy',
      'vpn',
      'nac',
      'honeypot',
      'honeynet',
      'secure design',
      'high availability',
      'redundancy',
    ];

    for (const topic of required) {
      expect(text, `Phase 4 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('ships four lessons and four labs in the architecture domain', () => {
    expect(PHASE_4.lessons).toHaveLength(4);
    expect(PHASE_4.labs).toHaveLength(4);
    expect(PHASE_4.examDomain).toBe('Security Architecture');
  });
});

describe('network zone data', () => {
  it('models the seven zones PROMPT.md specifies', () => {
    expect(NETWORK_ZONES.map((z) => z.id)).toEqual([
      'internet',
      'dmz',
      'core',
      'users',
      'servers',
      'management',
      'guest',
    ]);
  });

  it('orders trust so Internet is lowest and Management highest', () => {
    const byTrust = [...NETWORK_ZONES].sort((a, b) => a.trust - b.trust);
    expect(byTrust[0].id).toBe('internet');
    expect(byTrust[byTrust.length - 1].id).toBe('management');
  });

  it('places Guest barely above the Internet', () => {
    const guest = getZone('guest')!;
    const users = getZone('users')!;
    expect(guest.trust).toBeLessThan(10);
    expect(guest.trust).toBeLessThan(users.trust);
  });

  it('gives every internal zone a VLAN and a network', () => {
    for (const z of NETWORK_ZONES.filter((z) => z.id !== 'internet')) {
      expect(z.vlan, `${z.id} has no VLAN`).toBeTruthy();
      expect(z.cidr, `${z.id} has no network`).toBeTruthy();
    }
  });

  it('uses only private address space for internal zones', () => {
    const privateRange = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
    for (const z of NETWORK_ZONES) {
      if (z.cidr) expect(privateRange.test(z.cidr), `${z.cidr} is not RFC 1918`).toBe(true);
    }
  });

  it('keeps the Core network consistent with the Phase 0 estate', () => {
    expect(getZone('core')?.cidr).toBe('192.168.1.0/24');
  });

  it('lays tiers out from Internet down to the segments', () => {
    expect(getZone('internet')?.tier).toBe(0);
    expect(getZone('dmz')?.tier).toBe(1);
    expect(getZone('core')?.tier).toBe(2);
    for (const id of ['users', 'servers', 'management', 'guest'] as const) {
      expect(getZone(id)?.tier).toBe(3);
    }
  });
});

describe('boundary data', () => {
  it('references only zones that exist', () => {
    const ids = new Set(NETWORK_ZONES.map((z) => z.id));
    for (const b of BOUNDARIES) {
      expect(ids, `${b.id} names unknown zone ${b.from}`).toContain(b.from);
      expect(ids, `${b.id} names unknown zone ${b.to}`).toContain(b.to);
    }
  });

  it('gives every boundary controls, allowed traffic, denied traffic, and a purpose', () => {
    for (const b of BOUNDARIES) {
      expect(b.controls.length, `${b.id} has no controls`).toBeGreaterThan(0);
      expect(b.allowed.length, `${b.id} has no allowed list`).toBeGreaterThan(0);
      expect(b.denied.length, `${b.id} has no denied list`).toBeGreaterThan(0);
      expect(b.purpose.length).toBeGreaterThan(40);
    }
  });

  it('computes the trust delta a boundary spans', () => {
    const usersToMgmt = getBoundary('users-management')!;
    expect(trustDelta(usersToMgmt)).toBe(40);
  });

  it('gives the steepest trust delta the strictest control', () => {
    const steepest = [...BOUNDARIES].sort((a, b) => trustDelta(b) - trustDelta(a))[0];
    expect(steepest.id).toBe('users-management');
    // Deny-all rather than a curated port list.
    expect(steepest.allowed.join(' ')).toMatch(/nothing directly/i);
  });

  it('forbids DMZ hosts initiating into the Core', () => {
    const dmzCore = getBoundary('dmz-core')!;
    expect(dmzCore.denied.join(' ')).toMatch(/initiating any connection into the core/i);
  });

  it('gives Guest no route to any internal zone', () => {
    const guest = getBoundary('guest-internet')!;
    expect(guest.denied.join(' ')).toMatch(/route into the core/i);
  });

  it('finds the boundaries touching a zone in either direction', () => {
    const dmzBoundaries = boundariesFor('dmz').map((b) => b.id);
    expect(dmzBoundaries).toContain('internet-dmz');
    expect(dmzBoundaries).toContain('dmz-core');
  });

  it('resolves zones and boundaries by id', () => {
    expect(getZone('management')?.name).toBe('Management');
    expect(getBoundary('nope')).toBeUndefined();
  });
});

describe('Phase 4 simulated evidence', () => {
  it('lists the zones in ascending trust order', () => {
    const out = runCommand('show zones').output;
    expect(out.indexOf('Internet')).toBeLessThan(out.indexOf('Guest'));
    expect(out.indexOf('Guest')).toBeLessThan(out.indexOf('Management'));
  });

  it('distinguishes IDS, IPS, and WAF by placement', () => {
    const out = runCommand('compare ids ips waf').output;
    expect(out).toMatch(/IDS\s+Out of band/);
    expect(out).toMatch(/IPS\s+Inline/);
    expect(out).toMatch(/HTTP request content/);
  });

  it('shows the guest flow denied at routing rather than at the firewall', () => {
    const out = runCommand('trace flow guest servers').output;
    expect(out).toMatch(/No route to/);
    expect(out).toMatch(/Firewall rule not even consulted/);
  });

  it('shows inter-VLAN routing as the point where policy applies', () => {
    const out = runCommand('trace flow users servers').output;
    expect(out).toMatch(/Routed between VLANs/);
    expect(out).toMatch(/Rule "users->servers allow 443" matched/);
  });

  it('identifies two single points of failure in the availability design', () => {
    const out = runCommand('show high availability').output;
    const findings = out.split('\n').filter((l) => l.includes('<-- finding'));
    expect(findings).toHaveLength(2);
    expect(out).toMatch(/DC-01/);
  });

  it('presents honeypot alerts as near-zero false positive', () => {
    const out = runCommand('show honeypot').output;
    expect(out).toMatch(/No legitimate business process touches HP-02/);
  });

  it('keeps the zone transcript consistent with the zone data', () => {
    const out = runCommand('show zones').output;
    for (const z of NETWORK_ZONES) {
      expect(out, `${z.name} missing from the transcript`).toContain(z.name);
    }
  });
});

describe('scoped command help', () => {
  it('tags every command with a phase', () => {
    for (const c of listCommands()) {
      expect(typeof c.phase).toBe('number');
    }
  });

  it('widens the listing as the phase increases', () => {
    const p0 = listCommands(0).length;
    const p2 = listCommands(2).length;
    const all = listCommands().length;

    expect(p0).toBeGreaterThan(0);
    expect(p2).toBeGreaterThan(p0);
    expect(all).toBeGreaterThan(p2);
  });

  it('excludes later-phase evidence from an early-phase listing', () => {
    const p0 = listCommands(0).map((c) => c.command);
    expect(p0).not.toContain('show zones');
    expect(p0).not.toContain('show email headers phish-01');
    expect(p0).toContain('netstat -ano');
  });
});

describe('ZoneFallback2D', () => {
  it('renders an accessible control per zone and per boundary', () => {
    render(
      <ZoneFallback2D
        selectedZone={null}
        selectedBoundary={null}
        onSelectZone={() => {}}
        onSelectBoundary={() => {}}
      />
    );

    expect(screen.getAllByRole('button', { name: /^Inspect zone / })).toHaveLength(
      NETWORK_ZONES.length
    );
    // Only boundaries spanning tiers are drawn as gates.
    expect(screen.getAllByRole('button', { name: /^Inspect boundary / }).length).toBeGreaterThan(0);
  });

  it('reports the selected zone', async () => {
    const user = userEvent.setup({ delay: null });
    const seen: string[] = [];
    render(
      <ZoneFallback2D
        selectedZone={null}
        selectedBoundary={null}
        onSelectZone={(id) => seen.push(id)}
        onSelectBoundary={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /Inspect zone Management/ }));
    expect(seen).toEqual(['management']);
  });
});

describe('ZonesView', () => {
  it('falls back to the 2D architecture when WebGL is unavailable', () => {
    renderAt('/zones', '/zones', <ZonesView />);
    expect(screen.getByTestId('zone-fallback-2d')).toBeInTheDocument();
  });

  it('shows a selected zone with its trust level, VLAN, and rules', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/zones', '/zones', <ZonesView />);

    await user.click(screen.getByRole('button', { name: 'Management trust 95' }));

    // The network also appears inside the SVG diagram, so scope to the panel.
    const panel = screen.getByRole('heading', { name: 'Management' }).closest('div')!;
    expect(within(panel).getByText('VLAN 99')).toBeInTheDocument();
    expect(within(panel).getByText('10.99.0.0/24')).toBeInTheDocument();
    expect(screen.getByText(/Requires MFA and a jump host/)).toBeInTheDocument();
  });

  it('shows allowed and denied traffic when a boundary is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/zones', '/zones', <ZonesView />);

    await user.click(screen.getByRole('button', { name: /Δ40 Users → Management/ }));

    expect(screen.getByText('Allowed')).toBeInTheDocument();
    expect(screen.getByText('Denied')).toBeInTheDocument();
    expect(screen.getByText(/one click would compromise the firewall/)).toBeInTheDocument();
  });

  it('orders the boundary list by trust delta, steepest first', () => {
    renderAt('/zones', '/zones', <ZonesView />);

    const list = screen.getByText('All boundaries by trust delta').closest('div')!;
    const buttons = within(list).getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Δ40');
  });

  it('selecting a boundary clears the zone panel, and vice versa', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/zones', '/zones', <ZonesView />);

    // Starts on the DMZ zone.
    expect(screen.getByText('VLAN 20')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Δ40 Users → Management/ }));
    expect(screen.queryByText('Contains')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Servers trust 75' }));
    expect(screen.getByText('Contains')).toBeInTheDocument();
    expect(screen.queryByText('Allowed')).not.toBeInTheDocument();
  });
});

describe('Phase 4 labs run end to end', () => {
  it('inspects a boundary in the zone mapping lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p4-lab-0', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'inspect boundary dmz-core{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/delta 35/)).toBeInTheDocument();
  });

  it('contrasts permitted and denied flows in the flow lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p4-lab-2', '/lab/:labId', <LabView />);

    const input = screen.getByLabelText('Simulated command input');
    await user.type(input, 'trace flow users servers{Enter}');
    await user.type(input, 'trace flow guest servers{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(
      within(transcript).getByText(/Rule "users->servers allow 443" matched/)
    ).toBeInTheDocument();
    expect(within(transcript).getByText(/DENIED at layer 3/)).toBeInTheDocument();
  });
});

describe('Phase 4 quizzes', () => {
  it('grades the segmentation quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p4-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'Same-VLAN traffic is switched, not routed, so it never passes the firewall',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('segmentation')).toBe(1);
  });
});
