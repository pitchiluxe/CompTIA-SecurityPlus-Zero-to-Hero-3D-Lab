import { beforeEach, describe, expect, it } from 'vitest';
import { useProgressStore } from '../src/store/useProgressStore';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useNotesStore } from '../src/store/useNotesStore';
import { useEvidenceStore } from '../src/store/useEvidenceStore';

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  useNotesStore.setState({ notes: [] });
  useEvidenceStore.setState({ evidence: [] });
});

describe('progress store', () => {
  it('records lesson and lab completion in separate namespaces', () => {
    const s = useProgressStore.getState();
    s.markLessonComplete('phase-0', 'item', 90);
    s.markLabComplete('phase-0', 'item');

    expect(useProgressStore.getState().isLessonComplete('phase-0', 'item')).toBe(true);
    expect(useProgressStore.getState().isLabComplete('phase-0', 'item')).toBe(true);
    expect(useProgressStore.getState().countCompleted('phase-0')).toBe(2);
  });

  it('reports false for items never completed', () => {
    expect(useProgressStore.getState().isLessonComplete('phase-0', 'nope')).toBe(false);
  });

  it('computes phase percentage against the curriculum total, not stored rows', () => {
    useProgressStore.getState().markLessonComplete('phase-0', 'l1');
    // 1 of 4 items done -> 25%, not 100%.
    expect(useProgressStore.getState().phasePercent('phase-0', 4)).toBe(25);
  });

  it('returns 0 percent when the phase has no items', () => {
    expect(useProgressStore.getState().phasePercent('phase-0', 0)).toBe(0);
  });

  it('caps percentage at 100', () => {
    const s = useProgressStore.getState();
    s.markLessonComplete('phase-0', 'a');
    s.markLessonComplete('phase-0', 'b');
    expect(useProgressStore.getState().phasePercent('phase-0', 1)).toBe(100);
  });

  it('persists to localStorage under its own key', () => {
    useProgressStore.getState().markLessonComplete('phase-0', 'l1');
    expect(localStorage.getItem('securityplus-progress')).toContain('phase-0');
  });
});

describe('mastery store', () => {
  it('starts every concept at level 0', () => {
    expect(useMasteryStore.getState().getLevel('unknown')).toBe(0);
  });

  it('advances a concept on a correct outcome', () => {
    useMasteryStore.getState().recordOutcome('crypto', true);
    expect(useMasteryStore.getState().getLevel('crypto')).toBe(1);
  });

  it('drops two levels on a miss', () => {
    const s = () => useMasteryStore.getState();
    s().setLevel('crypto', 4);
    s().recordOutcome('crypto', false);
    expect(s().getLevel('crypto')).toBe(2);
  });

  it('classifies weak and strong areas by level', () => {
    const s = () => useMasteryStore.getState();
    s().setLevel('weak-one', 1);
    s().setLevel('strong-one', 5);

    expect(
      s()
        .getWeakAreas()
        .map((e) => e.conceptId)
    ).toEqual(['weak-one']);
    expect(
      s()
        .getStrongAreas()
        .map((e) => e.conceptId)
    ).toEqual(['strong-one']);
  });

  it('clamps increment and decrement to the ladder bounds', () => {
    const s = () => useMasteryStore.getState();
    s().setLevel('x', 6);
    s().increment('x');
    expect(s().getLevel('x')).toBe(6);

    s().setLevel('x', 0);
    s().decrement('x');
    expect(s().getLevel('x')).toBe(0);
  });

  it('computes an overall mastery percentage', () => {
    const s = () => useMasteryStore.getState();
    s().setLevel('a', 6);
    s().setLevel('b', 0);
    expect(s().overallPercent()).toBe(50);
  });
});

describe('notes store', () => {
  it('adds a note with an id and timestamp', () => {
    useNotesStore.getState().addNote({ content: 'hello' });
    const [note] = useNotesStore.getState().notes;

    expect(note.content).toBe('hello');
    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBeGreaterThan(0);
  });

  it('filters notes by lesson', () => {
    const s = () => useNotesStore.getState();
    s().addNote({ content: 'a', lessonId: 'p0-lesson-0' });
    s().addNote({ content: 'b', lessonId: 'other' });

    expect(s().getNotesForLesson('p0-lesson-0')).toHaveLength(1);
  });

  it('removes a note by id', () => {
    useNotesStore.getState().addNote({ content: 'gone' });
    const id = useNotesStore.getState().notes[0].id;
    useNotesStore.getState().removeNote(id);

    expect(useNotesStore.getState().notes).toHaveLength(0);
  });
});

describe('evidence store', () => {
  it('stores an artifact against its lab', () => {
    useEvidenceStore.getState().addEvidence('p0-lab-0', 'Log', 'log', 'output');
    const items = useEvidenceStore.getState().getEvidenceForLab('p0-lab-0');

    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('log');
    expect(items[0].capturedAt).toBeGreaterThan(0);
  });

  it('clears only the named lab', () => {
    const s = () => useEvidenceStore.getState();
    s().addEvidence('lab-a', 'A', 'text', 'x');
    s().addEvidence('lab-b', 'B', 'text', 'y');
    s().clearLabEvidence('lab-a');

    expect(s().evidence).toHaveLength(1);
    expect(s().evidence[0].labId).toBe('lab-b');
  });
});
