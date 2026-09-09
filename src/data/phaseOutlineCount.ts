// The number of phases declared in the roadmap outline.
//
// Dashboard shows "N of M phases built" and needs only M. Importing
// PHASE_OUTLINE from curriculum.ts would pull the whole curriculum graph into
// the eager landing route, so the count lives here on its own.
//
// tests/curriculum.test.ts asserts this matches PHASE_OUTLINE.length.
export const PHASE_OUTLINE_COUNT = 28;
