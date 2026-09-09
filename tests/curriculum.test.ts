import { describe, expect, it } from 'vitest';
import {
  allQuestions,
  getLab,
  getLesson,
  getPhase,
  PHASE_OUTLINE,
  PHASES,
  phaseItemCount,
} from '../src/data/curriculum';
import { EXAM_DOMAINS, EXAM_PASSING_SCORE, EXAM_VERSION } from '../src/data/examBlueprint';
import { PHASE_INDEX, indexItemCount } from '../src/data/phaseIndex';
import { PHASE_OUTLINE_COUNT } from '../src/data/phaseOutlineCount';
import { SOC_DEVICES } from '../src/data/socDevices';
import { SIM_COMMANDS } from '../src/sim/commands';

describe('exam blueprint', () => {
  it('targets SY0-701 with a 750 pass mark', () => {
    expect(EXAM_VERSION).toBe('SY0-701');
    expect(EXAM_PASSING_SCORE).toBe(750);
  });

  it('has five domains whose weights total 100 percent', () => {
    expect(EXAM_DOMAINS).toHaveLength(5);
    expect(EXAM_DOMAINS.reduce((sum, d) => sum + d.weight, 0)).toBe(100);
  });
});

describe('curriculum structure', () => {
  it.each(PHASES.map((p) => [`Phase ${p.number} — ${p.title}`, p] as const))(
    '%s has lessons, labs, and a consistent item count',
    (_name, phase) => {
      expect(phase.lessons.length).toBeGreaterThan(0);
      expect(phase.labs.length).toBeGreaterThan(0);
      expect(phaseItemCount(phase)).toBe(phase.lessons.length + phase.labs.length);
    }
  );

  it('gives every phase a unique id and number', () => {
    expect(new Set(PHASES.map((p) => p.id)).size).toBe(PHASES.length);
    expect(new Set(PHASES.map((p) => p.number)).size).toBe(PHASES.length);
  });

  it('keeps every lesson and lab tagged with its own phase id', () => {
    for (const phase of PHASES) {
      for (const lesson of phase.lessons) expect(lesson.phaseId).toBe(phase.id);
      for (const lab of phase.labs) expect(lab.phaseId).toBe(phase.id);
    }
  });

  it('resolves phases, lessons, and labs by id', () => {
    expect(getPhase('phase-0')?.number).toBe(0);
    expect(getLesson('p0-lesson-0')?.phaseId).toBe('phase-0');
    expect(getLab('p0-lab-0')?.phaseId).toBe('phase-0');
    expect(getLab('missing')).toBeUndefined();
  });

  it('marks exactly the built phases as available in the roadmap outline', () => {
    // Catches the drift of building a phase and forgetting to flip its status.
    const available = PHASE_OUTLINE.filter((p) => p.status === 'available').map((p) => p.number);
    const built = PHASES.map((p) => p.number);
    expect(available.sort((a, b) => a - b)).toEqual(built.sort((a, b) => a - b));
  });

  it('gives every built phase a matching roadmap outline entry', () => {
    for (const phase of PHASES) {
      const outline = PHASE_OUTLINE.find((o) => o.number === phase.number);
      expect(outline, `no roadmap entry for phase ${phase.number}`).toBeDefined();
      expect(outline!.title).toBe(phase.title);
    }
  });

  it('numbers roadmap phases contiguously from 0', () => {
    PHASE_OUTLINE.forEach((p, i) => expect(p.number).toBe(i));
  });
});

describe('lightweight phase index', () => {
  // The index exists so Dashboard does not pull the whole curriculum into the
  // eager bundle. It is generated, but generated-then-committed drifts unless
  // something checks — these are that check.
  it('lists exactly the built phases, in order', () => {
    expect(PHASE_INDEX.map((p) => p.id)).toEqual(PHASES.map((p) => p.id));
    expect(PHASE_INDEX.map((p) => p.number)).toEqual(PHASES.map((p) => p.number));
  });

  it('matches each phase title and description', () => {
    for (const [i, entry] of PHASE_INDEX.entries()) {
      expect(entry.title, `phase ${entry.number} title drifted`).toBe(PHASES[i].title);
      expect(entry.description, `phase ${entry.number} description drifted`).toBe(
        PHASES[i].description
      );
    }
  });

  it('matches every lesson and lab id and title', () => {
    for (const [i, entry] of PHASE_INDEX.entries()) {
      expect(entry.lessons).toEqual(PHASES[i].lessons.map((l) => ({ id: l.id, title: l.title })));
      expect(entry.labs).toEqual(PHASES[i].labs.map((l) => ({ id: l.id, title: l.title })));
    }
  });

  it('computes the same item count as the full curriculum', () => {
    for (const [i, entry] of PHASE_INDEX.entries()) {
      expect(indexItemCount(entry)).toBe(phaseItemCount(PHASES[i]));
    }
  });

  it('keeps the standalone outline count accurate', () => {
    expect(PHASE_OUTLINE_COUNT).toBe(PHASE_OUTLINE.length);
  });
});

describe('quiz data integrity', () => {
  const questions = allQuestions();

  it('has unique question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every answer index inside its option list', () => {
    for (const q of questions) {
      const options = q.options ?? [];
      const indices = Array.isArray(q.answer) ? q.answer : [q.answer];
      for (const i of indices) {
        expect(i, `${q.id} answer index out of range`).toBeGreaterThanOrEqual(0);
        expect(i, `${q.id} answer index out of range`).toBeLessThan(options.length);
      }
    }
  });

  it('gives every question an explanation', () => {
    for (const q of questions) {
      expect(q.explanation.length, `${q.id} has no explanation`).toBeGreaterThan(10);
    }
  });

  it('tags every question with a recognised exam domain', () => {
    const titles = EXAM_DOMAINS.map((d) => d.title);
    for (const q of questions) {
      expect(titles, `${q.id} domain "${q.domain}" is not an SY0-701 domain`).toContain(q.domain);
    }
  });

  it('orders the PBQ answer as a full permutation of its options', () => {
    const pbq = questions.filter((q) => q.type === 'pbq');
    expect(pbq.length).toBeGreaterThan(0);
    for (const q of pbq) {
      const answer = q.answer as number[];
      expect(answer).toHaveLength(q.options!.length);
      expect(new Set(answer).size).toBe(answer.length);
    }
  });
});

describe('lab completeness', () => {
  const allLabs = PHASES.flatMap((p) => p.labs);

  // PROMPT.md requires every lab to carry the full documentation set.
  it.each(allLabs.map((l) => [l.title, l] as const))(
    '"%s" includes every required section',
    (_title, lab) => {
      expect(lab.objective.length).toBeGreaterThan(10);
      expect(lab.securityConcepts.length).toBeGreaterThan(0);
      expect(lab.environment.length).toBeGreaterThan(0);
      expect(lab.topology.length).toBeGreaterThan(0);
      expect(lab.prerequisites.length).toBeGreaterThan(0);
      expect(lab.steps.length).toBeGreaterThan(0);
      expect(lab.expectedResults.length).toBeGreaterThan(0);
      expect(lab.verification.length).toBeGreaterThan(0);
      expect(lab.troubleshooting.length).toBeGreaterThan(0);
      expect(lab.challenge).toBeTruthy();
      expect(lab.evidence.length).toBeGreaterThan(0);
      expect(lab.securityLesson.length).toBeGreaterThan(10);
    }
  );

  it('has unique lab and lesson ids across every phase', () => {
    const ids = PHASES.flatMap((p) => [...p.labs.map((l) => l.id), ...p.lessons.map((l) => l.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every lab step that names a command a command in the allowlist', () => {
    const allowed = new Set(SIM_COMMANDS.map((c) => c.match));
    for (const lab of allLabs) {
      for (const step of lab.steps) {
        if (!step.command) continue;
        expect(
          allowed,
          `${lab.id} step ${step.id} references "${step.command}", which is not in the simulator allowlist`
        ).toContain(step.command.trim().toLowerCase());
      }
    }
  });
});

describe('SOC device data', () => {
  it('has unique device ids', () => {
    const ids = SOC_DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes the devices Phase 0 requires', () => {
    const types = new Set(SOC_DEVICES.map((d) => d.type));
    for (const required of ['firewall', 'server', 'pc', 'siem']) {
      expect(types, `missing a ${required} in the SOC scene`).toContain(required);
    }
  });

  it('has at least one device needing triage, so the SOC room is not inert', () => {
    expect(SOC_DEVICES.filter((d) => d.status !== 'up').length).toBeGreaterThan(0);
  });

  it('uses only private or documentation IP ranges', () => {
    // RFC 1918 (10/8, 172.16/12, 192.168/16) and RFC 5737 documentation ranges.
    const allowed =
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/;
    for (const d of SOC_DEVICES) {
      if (d.ip) expect(d.ip, `${d.id} uses a public IP`).toMatch(allowed);
      for (const i of d.interfaces ?? []) {
        expect(i.ip, `${d.id}/${i.name} uses a public IP`).toMatch(allowed);
      }
    }
  });

  it('carries no credential-shaped values in its security state', () => {
    const forbidden = /(password|secret|token|apikey|api_key|private[_-]?key)/i;
    for (const d of SOC_DEVICES) {
      for (const key of Object.keys(d.securityState ?? {})) {
        expect(key, `${d.id} exposes ${key}`).not.toMatch(forbidden);
      }
    }
  });
});
