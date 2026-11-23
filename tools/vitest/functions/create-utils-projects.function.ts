import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY, UTILS_DIRECTORY } from '../constants/test-paths.constant.ts';
import { UTILS_BROWSER_SPECS } from '../constants/utils-browser-specs.constant.ts';
import { UTILS_TIME_ZONES, UTILS_ZONED_FOLDERS } from '../constants/utils-time-zones.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { createBrowserProjects } from './create-browser-projects.function.ts';
import { createTypescriptJsdomProject } from './create-typescript-jsdom-project.function.ts';
import { createTypescriptNodeProjects } from './create-typescript-node-projects.function.ts';
import { createTypescriptTypesProject } from './create-typescript-types-project.function.ts';

// Only the folders that depend on the time zone run in every time zone; the rest of Utils runs once, in UTC.
function listSpecsForTimeZone(timeZone: string): Array<string> {
  if (timeZone === 'UTC') return [`${UTILS_DIRECTORY}/**/*.spec.ts`];
  return UTILS_ZONED_FOLDERS.map((folder) => `${UTILS_DIRECTORY}/${folder}/**/*.spec.ts`);
}

export function createUtilsProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  const otherEnvironmentSpecs: Array<string> = ['**/*.apia.*spec.ts', '**/*.jsdom.*spec.ts'];
  return [
    ...UTILS_TIME_ZONES.flatMap((timeZone) =>
      createTypescriptNodeProjects({
        name: 'utils',
        timeZones: [timeZone],
        include: [...listSpecsForTimeZone(timeZone), `${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
        exclude: ['**/node_modules/**', ...otherEnvironmentSpecs],
      }),
    ),
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
      // Walking every minute or every day of the calendar proves nothing new about the browser engine.
      exclude: ['**/*.exhaustive.*spec.ts', ...otherEnvironmentSpecs],
    }),
  ];
}
