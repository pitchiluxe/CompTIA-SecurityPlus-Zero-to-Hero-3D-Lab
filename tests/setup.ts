// jest-dom v7 ships a Vitest-specific entry that augments Vitest's Assertion
// interface. Importing the bare package registers the matchers at runtime but
// not in the type system, which is why this path is the one to use.
import '@testing-library/jest-dom/vitest';
