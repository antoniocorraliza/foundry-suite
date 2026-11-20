import { defineConfig, type ViteUserConfig } from 'vitest/config';
import type { TestEnvironment } from './tools/vitest/interfaces/test-environment.interface.ts';
import { readTestEnvironment, typescriptNodeProjects } from './tools/vitest/projects.ts';
import { smokeProjects } from './tools/vitest/smoke/smoke.projects.ts';
import { utilsProjects } from './tools/vitest/utils/utils.projects.ts';

export default defineConfig((): ViteUserConfig => {
  const environment: TestEnvironment = readTestEnvironment();
  return {
    test: {
      projects: [
        ...smokeProjects(environment),
        ...utilsProjects(environment),
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
        include: ['projects/antoniocorraliza/**/src/**/*.ts'],
        exclude: ['**/*.spec.ts', '**/*.test-d.ts', '**/*.d.ts'],
        // One threshold per entry, so a weak entry cannot hide behind the average.
        thresholds: {
          'projects/antoniocorraliza/foundry-utils/src/**': { lines: 95, branches: 90 },
          'projects/antoniocorraliza/foundry-utils/case/src/**': { lines: 95, branches: 90 },
          'projects/antoniocorraliza/foundry-utils/object/src/**': { lines: 95, branches: 90 },
        },
        reportsDirectory: 'coverage',
      },
    },
  };
});
