import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY } from '../constants/smoke-directory.constant.ts';
import { UTILS_BROWSER_SPECS } from '../constants/utils-browser-specs.constant.ts';
import { UTILS_DIRECTORY } from '../constants/utils-directory.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { createBrowserProjects } from './create-browser-projects.function.ts';
import { createTypescriptJsdomProject } from './create-typescript-jsdom-project.function.ts';
import { createTypescriptNodeProjects } from './create-typescript-node-projects.function.ts';
import { createTypescriptTypesProject } from './create-typescript-types-project.function.ts';

export function createUtilsProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  const specs: string = `${UTILS_DIRECTORY}/**/*.spec.ts`;
  return [
    ...createTypescriptNodeProjects({
      name: 'utils',
      timeZones: ['Europe/Madrid', 'America/Mexico_City', 'America/Santiago', 'UTC'],
      include: [specs, `${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
      exclude: ['**/node_modules/**', '**/*.apia.*spec.ts', '**/*.jsdom.*spec.ts'],
    }),
    ...createTypescriptNodeProjects({
      name: 'utils-apia',
      timeZones: ['Pacific/Apia'],
      include: [`${UTILS_DIRECTORY}/**/*.apia.*spec.ts`],
    }),
    createTypescriptJsdomProject({ name: 'utils-jsdom', include: [`${UTILS_DIRECTORY}/**/*.jsdom.*spec.ts`] }),
    createTypescriptTypesProject({ name: 'utils-types', include: [`${UTILS_DIRECTORY}/**/*.test-d.ts`] }),
    ...createBrowserProjects({
      name: 'utils-browser',
      isAngular: false,
      environment,
      timeZones: ['Europe/Madrid', 'America/Santiago'],
      include: [...UTILS_BROWSER_SPECS.map((spec) => `${UTILS_DIRECTORY}/${spec}`), `${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`],
    }),
  ];
}
