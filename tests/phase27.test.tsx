import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PHASES, allQuestions } from '../src/data/curriculum';
import { PHASE_27 } from '../src/data/phase27';
import {
  IAM_BRIDGE_TOPICS,
  IAM_VENDORS,
  VENDOR_MAPPING_ITEMS,
  getBridgeTopic,
  getVendor,
} from '../src/data/iamBridge';
import {
  assessTopic,
  assessTopics,
  bridgeReadiness,
  gradeVendorMapping,
  isVendorMappingComplete,
  lockedVendors,
  topicsForConcept,
  topicsForConcepts,
  unlockedVendors,
  vendorGate,
  vendorGates,
  weakTopics,
  type MappingAnswer,
} from '../src/lib/iamBridgeEngine';
import { PHASE_27_COMMANDS } from '../src/sim/phase27Commands';
import { SIM_COMMANDS } from '../src/sim/commands';
import { IamBridgeView } from '../src/components/IamBridgeView';
import { LessonView } from '../src/components/LessonView';
import { useProgressStore } from '../src/store/useProgressStore';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { __setWebGLAvailable } from '../src/lib/webgl';
import type { MasteryLevel } from '../src/types';

/** The vendor tier is clickable in both the 2D fallback and the gate list, so scope the query. */
function vendorGateButton(name: string): HTMLElement {
  const list = screen.getByTestId('vendor-gates');
  const match = Array.from(list.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(name)
  );
  if (!match) throw new Error(`no vendor gate button for ${name}`);
  return match;
}

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

function phaseText(): string {
  const lessons = PHASE_27.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_27.labs.flatMap((lab) => [
    lab.title,
    lab.objective,
    ...lab.securityConcepts,
    ...lab.steps.flatMap((s) => [s.instruction, s.expected ?? '', s.command ?? '']),
    ...lab.expectedResults,
    ...lab.verification,
    ...lab.troubleshooting,
    lab.challenge ?? '',
    lab.securityLesson,
  ]);
  return [...lessons, ...labs].join('\n');
}

/** Every mastery lookup returns the same level — the simplest way to drive the gates. */
const flat = (level: MasteryLevel) => () => level;

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('iamBridge data — bridge topics', () => {
  it('answers all nine PROMPT.md bridge questions', () => {
    expect(IAM_BRIDGE_TOPICS).toHaveLength(9);
  });

  it('covers authentication, authorization, MFA, SSO, RBAC, Zero Trust, PAM, logs, and investigation', () => {
    const ids = IAM_BRIDGE_TOPICS.map((t) => t.id);
    for (const required of [
      'authentication-implementation',
      'authorization-implementation',
      'mfa-implementation',
      'sso-implementation',
      'rbac-implementation',
      'zero-trust-identity',
      'privileged-access',
      'identity-events-logs',
      'iam-incident-investigation',
    ]) {
      expect(ids, `missing bridge topic ${required}`).toContain(required);
    }
  });

  it('gives every topic an exam view, an implementation, log evidence, and an investigation habit', () => {
    for (const t of IAM_BRIDGE_TOPICS) {
      expect(t.examView.length, `${t.id} exam view`).toBeGreaterThan(40);
      expect(t.implementation.length, `${t.id} implementation`).toBeGreaterThan(40);
      expect(t.logEvidence.length, `${t.id} log evidence`).toBeGreaterThan(0);
      expect(t.investigation.length, `${t.id} investigation`).toBeGreaterThan(40);
      expect(t.vendors.length, `${t.id} vendors`).toBeGreaterThan(0);
    }
  });

  it('builds every topic on concept IDs that earlier phases already teach and track', () => {
    const tracked = new Set(PHASES.flatMap((p) => p.lessons.flatMap((l) => l.concepts)));
    for (const t of IAM_BRIDGE_TOPICS) {
      for (const c of t.conceptIds) {
        expect(tracked, `${t.id} references untracked concept "${c}"`).toContain(c);
      }
    }
  });

  it('has unique topic ids and resolves them by id', () => {
    const ids = IAM_BRIDGE_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getBridgeTopic('sso-implementation')?.conceptIds).toContain('saml');
    expect(getBridgeTopic('missing')).toBeUndefined();
  });
});

describe('iamBridge data — vendor platforms', () => {
  it('declares the six vendors PROMPT.md names', () => {
    const ids = IAM_VENDORS.map((v) => v.id);
    expect(ids).toHaveLength(6);
    for (const required of [
      'entra-id',
      'active-directory',
      'okta',
      'ping-identity',
      'cyberark',
      'sailpoint',
    ]) {
      expect(ids, `missing vendor ${required}`).toContain(required);
    }
  });

  it('gates every vendor behind prerequisite concepts that are already tracked', () => {
    const tracked = new Set(PHASES.flatMap((p) => p.lessons.flatMap((l) => l.concepts)));
    for (const v of IAM_VENDORS) {
      expect(v.prerequisiteConceptIds.length, `${v.id} has no concept gate`).toBeGreaterThan(0);
      for (const c of v.prerequisiteConceptIds) {
        expect(tracked, `${v.id} gates on untracked concept "${c}"`).toContain(c);
      }
      expect(v.conceptFirst.length, `${v.id} concept-first guidance`).toBeGreaterThan(40);
      expect(v.category.length).toBeGreaterThan(0);
    }
  });

  it('resolves vendors by id', () => {
    expect(getVendor('cyberark')?.category).toBe('Privileged access management');
    expect(getVendor('missing')).toBeUndefined();
  });

  it('references only declared vendors from topic mappings', () => {
    const known = new Set(IAM_VENDORS.map((v) => v.id));
    for (const t of IAM_BRIDGE_TOPICS) {
      for (const m of t.vendors) expect(known).toContain(m.vendorId);
    }
  });
});

describe('iamBridgeEngine — continuous connection', () => {
  it('maps a concept to the bridge topics it feeds', () => {
    expect(topicsForConcept('saml').map((t) => t.id)).toContain('sso-implementation');
    expect(topicsForConcept('pam').map((t) => t.id)).toContain('privileged-access');
  });

  it('stays silent for concepts with no identity dimension rather than inventing a link', () => {
    expect(topicsForConcept('dns-tunnelling')).toHaveLength(0);
  });

  it('maps a whole lesson concept list to its bridge topics, de-duplicated', () => {
    const topics = topicsForConcepts(['mfa', 'phishing-resistant-mfa', 'sso']);
    const ids = topics.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('mfa-implementation');
    expect(ids).toContain('sso-implementation');
  });
});

describe('iamBridgeEngine — topic readiness', () => {
  it('flags a topic as weak when its concepts sit at or below the threshold', () => {
    const topic = getBridgeTopic('mfa-implementation')!;
    expect(assessTopic(topic, flat(2)).weak).toBe(true);
    expect(assessTopic(topic, flat(3)).weak).toBe(false);
  });

  it('treats never-encountered concepts (level 0) as weak', () => {
    const assessments = assessTopics(flat(0));
    expect(assessments.every((a) => a.weak)).toBe(true);
    expect(bridgeReadiness(assessments)).toMatchObject({ ready: 0, weak: 9, percentage: 0 });
  });

  it('reports full readiness once every concept is strong', () => {
    const readiness = bridgeReadiness(assessTopics(flat(5)));
    expect(readiness).toMatchObject({ total: 9, ready: 9, weak: 0, percentage: 100 });
  });

  it('orders weak topics weakest first', () => {
    const getLevel = (id: string): MasteryLevel => (id === 'pam' ? 0 : 2);
    const ordered = weakTopics(assessTopics(getLevel));
    expect(ordered.length).toBeGreaterThan(1);
    expect(ordered[0].averageLevel).toBeLessThanOrEqual(ordered[1].averageLevel);
  });
});

describe('iamBridgeEngine — concepts before vendors', () => {
  it('locks every vendor when no mastery data exists', () => {
    const gates = vendorGates(flat(0));
    expect(lockedVendors(gates)).toHaveLength(IAM_VENDORS.length);
    expect(unlockedVendors(gates)).toHaveLength(0);
  });

  it('unlocks every vendor once all prerequisite concepts are above the threshold', () => {
    const gates = vendorGates(flat(3));
    expect(unlockedVendors(gates)).toHaveLength(IAM_VENDORS.length);
  });

  it('requires EVERY prerequisite concept, not the average', () => {
    const okta = IAM_VENDORS.find((v) => v.id === 'okta')!;
    // One prerequisite left at 0, the rest at full mastery — average is high,
    // but "learn the concept first" fails if a single prerequisite is missing.
    const getLevel = (id: string): MasteryLevel => (id === 'oidc' ? 0 : 6);
    const gate = vendorGate(okta, getLevel);

    expect(gate.averageLevel).toBeGreaterThan(3);
    expect(gate.unlocked).toBe(false);
    expect(gate.missingConceptIds).toEqual(['oidc']);
  });

  it('names the missing concepts weakest first so the learner knows what to revisit', () => {
    const ad = IAM_VENDORS.find((v) => v.id === 'active-directory')!;
    const getLevel = (id: string): MasteryLevel =>
      id === 'kerberos' ? 0 : id === 'ldap' ? 1 : 5;
    const gate = vendorGate(ad, getLevel);

    expect(gate.unlocked).toBe(false);
    expect(gate.missingConceptIds).toEqual(['kerberos', 'ldap']);
  });
});

describe('iamBridgeEngine — vendor feature to concept exercise', () => {
  it('grades a fully correct classification', () => {
    const answer: MappingAnswer = {};
    VENDOR_MAPPING_ITEMS.forEach((i) => {
      answer[i.id] = i.topicId;
    });

    const result = gradeVendorMapping(answer);
    expect(result.correctCount).toBe(VENDOR_MAPPING_ITEMS.length);
    expect(result.percentage).toBe(100);
    expect(result.items.every((r) => r.correct && r.answered)).toBe(true);
  });

  it('marks a wrong classification incorrect and still returns its rationale', () => {
    const item = VENDOR_MAPPING_ITEMS[0];
    const wrong = IAM_BRIDGE_TOPICS.find((t) => t.id !== item.topicId)!.id;
    const result = gradeVendorMapping({ [item.id]: wrong }, [item]);

    expect(result.correctCount).toBe(0);
    expect(result.items[0].correctTopicId).toBe(item.topicId);
    expect(result.items[0].rationale.length).toBeGreaterThan(10);
  });

  it('detects incomplete and complete submissions', () => {
    expect(isVendorMappingComplete({})).toBe(false);
    const answer: MappingAnswer = {};
    VENDOR_MAPPING_ITEMS.forEach((i) => {
      answer[i.id] = i.topicId;
    });
    expect(isVendorMappingComplete(answer)).toBe(true);
  });

  it('points every exercise item at a real bridge topic and a declared vendor', () => {
    const topicIds = new Set(IAM_BRIDGE_TOPICS.map((t) => t.id));
    const vendorIds = new Set(IAM_VENDORS.map((v) => v.id));
    expect(VENDOR_MAPPING_ITEMS.length).toBeGreaterThanOrEqual(9);
    for (const item of VENDOR_MAPPING_ITEMS) {
      expect(topicIds, `${item.id} topic`).toContain(item.topicId);
      expect(vendorIds, `${item.id} vendor`).toContain(item.vendorId);
      expect(item.rationale.length).toBeGreaterThan(20);
    }
    expect(new Set(VENDOR_MAPPING_ITEMS.map((i) => i.id)).size).toBe(VENDOR_MAPPING_ITEMS.length);
  });
});

describe('Phase 27 curriculum and safety', () => {
  it('has two lessons and two labs, in the roadmap as phase 27', () => {
    expect(PHASE_27.number).toBe(27);
    expect(PHASE_27.lessons).toHaveLength(2);
    expect(PHASE_27.labs).toHaveLength(2);
    expect(PHASES.some((p) => p.id === 'phase-27')).toBe(true);
  });

  it('gives every lesson objectives, sections, and a quiz', () => {
    for (const l of PHASE_27.lessons) {
      expect(l.objectives.length).toBeGreaterThan(0);
      expect(l.sections.length).toBeGreaterThan(0);
      expect(l.quiz.length).toBeGreaterThan(0);
      expect(l.concepts.length).toBeGreaterThan(0);
    }
  });

  it('teaches the concepts before naming the vendors', () => {
    const text = phaseText().toLowerCase();
    expect(text).toContain('concept');
    expect(text).toContain('vendor');
    // The gating rule itself must be stated in the curriculum, not only in code.
    expect(text).toMatch(/before .*vendor|concepts before vendors|concepts first/);
  });

  it('covers the nine bridge questions in its lesson text', () => {
    const text = phaseText().toLowerCase();
    for (const term of [
      'authentication',
      'authorization',
      'mfa',
      'sso',
      'rbac',
      'zero trust',
      'privileged access',
      'containment',
    ]) {
      expect(text, `curriculum never mentions ${term}`).toContain(term);
    }
  });

  it('names all six vendor platforms somewhere in the phase or its bridge data', () => {
    const text = [
      phaseText(),
      PHASE_27_COMMANDS.map((c) => c.output).join('\n'),
      IAM_VENDORS.map((v) => v.name).join('\n'),
    ]
      .join('\n')
      .toLowerCase();
    for (const vendor of ['entra id', 'active directory', 'okta', 'ping identity', 'cyberark', 'sailpoint']) {
      expect(text, `${vendor} is never introduced`).toContain(vendor);
    }
  });

  it('registers every lab step command in the simulator allowlist', () => {
    const allowed = new Set(SIM_COMMANDS.map((c) => c.match));
    for (const lab of PHASE_27.labs) {
      for (const step of lab.steps) {
        if (!step.command) continue;
        expect(allowed, `${lab.id} step ${step.id}: "${step.command}"`).toContain(
          step.command.trim().toLowerCase()
        );
      }
    }
  });

  it('labels every prepared command with a provenance and keeps it non-executing', () => {
    for (const c of PHASE_27_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
      expect(c.tool).toBe('platform');
      expect(c.output.length).toBeGreaterThan(0);
    }
  });

  it('contains no credential, key, or token material', () => {
    const text = [
      phaseText(),
      PHASE_27_COMMANDS.map((c) => `${c.output}\n${c.teaches ?? ''}`).join('\n'),
      IAM_BRIDGE_TOPICS.map((t) => `${t.implementation}\n${t.logEvidence.join('\n')}`).join('\n'),
    ].join('\n');

    expect(text).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(text).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(text).not.toMatch(/\bapi[_-]?key\s*[:=]/i);
    expect(text).not.toMatch(/secret\s*[:=]/i);
    expect(text).not.toMatch(/\bbearer\s+[A-Za-z0-9._-]{10,}/i);
  });

  it('uses only private or documentation IP ranges in prepared identity evidence', () => {
    const allowed =
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/;
    const text = PHASE_27_COMMANDS.map((c) => c.output).join('\n') + '\n' + phaseText();
    const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) ?? [];
    for (const ip of ips) {
      expect(ip, `${ip} is outside the private/documentation ranges`).toMatch(allowed);
    }
  });

  it('tags every quiz question with a recognised exam domain and a concept', () => {
    const ids = new Set(PHASE_27.lessons.flatMap((l) => l.quiz.map((q) => q.id)));
    expect(ids.size).toBe(PHASE_27.lessons.flatMap((l) => l.quiz).length);
    for (const q of PHASE_27.lessons.flatMap((l) => l.quiz)) {
      expect(q.conceptId, `${q.id} has no conceptId`).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(10);
    }
    // No id collisions with the rest of the platform.
    const all = allQuestions().map((q) => q.id);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('IAM Bridge view', () => {
  it('renders all nine bridge questions as selectable buttons', () => {
    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);
    const buttons = screen.getAllByRole('button');
    for (const t of IAM_BRIDGE_TOPICS) {
      expect(buttons.some((b) => b.textContent === t.question), t.question).toBe(true);
    }
  });

  it('falls back to the 2D bridge when WebGL is unavailable', () => {
    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);
    expect(screen.getByTestId('iam-bridge-fallback-2d')).toBeInTheDocument();
  });

  it('shows the selected topic\'s implementation, log evidence, and investigation habit', () => {
    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);
    const first = IAM_BRIDGE_TOPICS[0];

    expect(screen.getByTestId('bridge-topic-detail')).toBeInTheDocument();
    expect(screen.getByText('What Security+ teaches')).toBeInTheDocument();
    expect(screen.getByText('How it is actually implemented')).toBeInTheDocument();
    expect(screen.getByText('How it appears in logs')).toBeInTheDocument();
    expect(screen.getByText('How it is investigated')).toBeInTheDocument();
    expect(screen.getByText(first.implementation)).toBeInTheDocument();
  });

  it('locks every vendor with no mastery data and names the concepts to revisit', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);

    expect(screen.getAllByText('Locked')).toHaveLength(IAM_VENDORS.length);

    await user.click(vendorGateButton('CyberArk'));
    const detail = screen.getByTestId('vendor-detail');
    expect(detail).toHaveTextContent('CyberArk');
    expect(detail).toHaveTextContent(/Prerequisite concepts still at or below mastery 2/);
    expect(detail).toHaveTextContent('pam');
  });

  it('unlocks a vendor once its prerequisite concepts are above the threshold', async () => {
    const user = userEvent.setup({ delay: null });
    const setLevel = useMasteryStore.getState().setLevel;
    for (const c of IAM_VENDORS.find((v) => v.id === 'cyberark')!.prerequisiteConceptIds) {
      setLevel(c, 5);
    }

    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);

    expect(screen.getAllByText('Unlocked')).toHaveLength(1);

    await user.click(vendorGateButton('CyberArk'));
    expect(screen.getByTestId('vendor-detail')).toHaveTextContent(
      /vaults and rotates privileged credentials/
    );
  });

  it('reports bridge readiness from the learner\'s own mastery data', () => {
    const setLevel = useMasteryStore.getState().setLevel;
    for (const c of getBridgeTopic('mfa-implementation')!.conceptIds) setLevel(c, 6);

    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);

    expect(screen.getByTestId('weak-bridge-topics')).toBeInTheDocument();
    expect(screen.getByText(/Topics on solid concepts — 1\/9/)).toBeInTheDocument();
  });

  it('grades the concept-before-vendor exercise once every feature is classified', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-bridge', '/iam-bridge', <IamBridgeView />);

    const submit = screen.getByRole('button', { name: 'Submit exercise' });
    expect(submit).toBeDisabled();

    for (const item of VENDOR_MAPPING_ITEMS) {
      const row = screen.getByText(item.feature).closest('li')!;
      const correctLabel = getBridgeTopic(item.topicId)!.title.split(' — ')[0];
      const choice = Array.from(row.querySelectorAll('button')).find(
        (b) => b.textContent === correctLabel
      )!;
      await user.click(choice);
    }

    await user.click(screen.getByRole('button', { name: 'Submit exercise' }));

    expect(
      screen.getByText(`Correct — ${VENDOR_MAPPING_ITEMS.length}/${VENDOR_MAPPING_ITEMS.length}`)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry exercise' })).toBeInTheDocument();
  });
});

describe('continuous IAM connection inside earlier lessons', () => {
  it('surfaces the bridge on a Phase 5 identity lesson', () => {
    renderAt('/lesson/p5-lesson-2', '/lesson/:lessonId', <LessonView />);
    const panel = screen.getByTestId('lesson-iam-bridge');
    expect(panel).toHaveTextContent('How does SSO work?');
  });

  it('stays absent on a lesson with no identity dimension', () => {
    renderAt('/lesson/p0-lesson-0', '/lesson/:lessonId', <LessonView />);
    expect(screen.queryByTestId('lesson-iam-bridge')).not.toBeInTheDocument();
  });
});
