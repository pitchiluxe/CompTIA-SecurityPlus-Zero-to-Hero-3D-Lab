import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { PHASES } from '../src/data/curriculum';

/**
 * Regenerates src/data/phaseIndex.json from the real curriculum.
 *
 * Run after adding or renaming a phase, lesson or lab:
 *   npm run gen:index
 *
 * tests/curriculum.test.ts asserts the generated index matches PHASES, so
 * forgetting to run this fails the suite rather than shipping stale data.
 */
it('generates the phase index', () => {
  const index = PHASES.map((p) => ({
    id: p.id,
    number: p.number,
    title: p.title,
    description: p.description,
    lessons: p.lessons.map((l) => ({ id: l.id, title: l.title })),
    labs: p.labs.map((l) => ({ id: l.id, title: l.title })),
  }));

  writeFileSync('src/data/phaseIndex.json', JSON.stringify(index, null, 2) + '\n', 'utf8');
});
