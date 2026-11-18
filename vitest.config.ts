/*
 * Vitest configuration of the monorepo (block B1). Version and lessons: claude/b0-vitest-versiones.md.
 * Each library adds its projects here, built with the factories of tools/vitest/projects.ts.
 */
import { defineConfig } from 'vitest/config';
import { smokeProjects } from './tools/vitest/smoke/smoke.projects.ts';

export default defineConfig({
  test: {
    projects: [...smokeProjects],
    coverage: {
      // Run it with `npm run test:coverage`: Node projects and Chromium only (PF-INF3).
      provider: 'v8',
      include: ['projects/antoniocorraliza/*/src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.d.ts'],
      reportsDirectory: 'coverage',
    },
  },
});
