import { defineConfig } from 'vitest/config';
import { readTestEnvironment, typescriptNodeProjects } from './tools/vitest/projects.ts';
import { smokeProjects } from './tools/vitest/smoke/smoke.projects.ts';

export default defineConfig({
  test: {
    projects: [
      ...smokeProjects(readTestEnvironment()),
      ...typescriptNodeProjects({
        name: 'tools',
        timeZones: ['UTC'],
        include: ['tools/**/*.spec.ts'],
        exclude: ['**/node_modules/**', 'tools/vitest/smoke/**'],
      }),
    ],
    coverage: {
      // `npm run test:coverage` sets FOUNDRY_TEST_COVERAGE; without it, Firefox and WebKit break the coverage run.
      provider: 'v8',
      include: ['projects/antoniocorraliza/*/src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.d.ts'],
      reportsDirectory: 'coverage',
    },
  },
});
