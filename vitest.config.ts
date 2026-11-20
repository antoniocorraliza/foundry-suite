import { defineConfig, type ViteUserConfig } from 'vitest/config';
import { addSourceAliases } from './tools/vitest/functions/add-source-aliases.function.ts';
import { createSmokeProjects } from './tools/vitest/functions/create-smoke-projects.function.ts';
import { createTypescriptNodeProjects } from './tools/vitest/functions/create-typescript-node-projects.function.ts';
import { createUtilsProjects } from './tools/vitest/functions/create-utils-projects.function.ts';
import { readTestEnvironment } from './tools/vitest/functions/read-test-environment.function.ts';
import type { TestEnvironment } from './tools/vitest/interfaces/test-environment.interface.ts';

export default defineConfig((): ViteUserConfig => {
  const environment: TestEnvironment = readTestEnvironment();
  return {
    test: {
      projects: [
        ...createSmokeProjects(environment),
        ...createUtilsProjects(environment),
        ...createTypescriptNodeProjects({
          name: 'tools',
          timeZones: ['UTC'],
          include: ['tools/**/*.spec.ts'],
          exclude: ['**/node_modules/**', 'tools/vitest/smoke/**'],
        }),
      ].map(addSourceAliases),
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
