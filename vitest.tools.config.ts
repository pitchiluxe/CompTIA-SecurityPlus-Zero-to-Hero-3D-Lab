import { defineConfig } from 'vitest/config';

// Separate config for one-off maintenance scripts, so they never run as part
// of the normal test suite. Invoke via `npm run gen:index`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['scripts/**/*.script.ts'],
  },
});
