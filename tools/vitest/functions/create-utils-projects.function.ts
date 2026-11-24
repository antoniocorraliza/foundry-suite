import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY, UTILS_DIRECTORY } from '../constants/test-paths.constant.ts';
import {
  APIA_SPECS,
  DOM_SPECS,
  EXHAUSTIVE_SPECS,
  EXHAUSTIVE_TEST_TIMEOUT,
  JSDOM_SPECS,
  LORD_HOWE_SPECS,
  NODE_ONLY_SPECS,
  UTILS_BROWSER_SPECS,
} from '../constants/utils-spec-patterns.constant.ts';
import { UTILS_BROWSER_TIME_ZONES, UTILS_TIME_ZONES, UTILS_ZONED_FOLDERS } from '../constants/utils-time-zones.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { createBrowserProjects } from './create-browser-projects.function.ts';
import { createTypescriptJsdomProject } from './create-typescript-jsdom-project.function.ts';
import { createTypescriptNodeProjects } from './create-typescript-node-projects.function.ts';
import { createTypescriptTypesProject } from './create-typescript-types-project.function.ts';

function listSpecsForTimeZone(timeZone: string): Array<string> {
  if (timeZone === 'UTC') return [`${UTILS_DIRECTORY}/**/*.spec.ts`];
  return UTILS_ZONED_FOLDERS.map((folder) => `${UTILS_DIRECTORY}/${folder}/**/*.spec.ts`);
}

export function createUtilsProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  const otherEnvironmentSpecs: Array<string> = [APIA_SPECS, LORD_HOWE_SPECS, JSDOM_SPECS];
  return [
    ...UTILS_TIME_ZONES.flatMap((timeZone) =>
      createTypescriptNodeProjects({
        name: 'utils',
        timeZones: [timeZone],
        include: [...listSpecsForTimeZone(timeZone), `${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
        exclude: ['**/node_modules/**', EXHAUSTIVE_SPECS, DOM_SPECS, ...otherEnvironmentSpecs],
      }),
    ),
    ...(environment.isExhaustiveEnabled
      ? createTypescriptNodeProjects({
          name: 'utils-exhaustive',
          timeZones: UTILS_TIME_ZONES,
          include: [`${UTILS_DIRECTORY}/${EXHAUSTIVE_SPECS}`],
          testTimeout: EXHAUSTIVE_TEST_TIMEOUT,
        })
      : []),
    ...createTypescriptNodeProjects({ name: 'utils-apia', timeZones: ['Pacific/Apia'], include: [`${UTILS_DIRECTORY}/${APIA_SPECS}`] }),
    ...createTypescriptNodeProjects({
      name: 'utils-lord-howe',
      timeZones: ['Australia/Lord_Howe'],
      include: [`${UTILS_DIRECTORY}/${LORD_HOWE_SPECS}`],
    }),
    createTypescriptJsdomProject({
      name: 'utils-jsdom',
      include: [`${UTILS_DIRECTORY}/${JSDOM_SPECS}`, `${UTILS_DIRECTORY}/${DOM_SPECS}`],
    }),
    createTypescriptTypesProject({ name: 'utils-types', include: [`${UTILS_DIRECTORY}/**/*.test-d.ts`] }),
    ...createBrowserProjects({
      name: 'utils-browser',
      isAngular: false,
      environment,
      timeZones: UTILS_BROWSER_TIME_ZONES,
      include: [
        ...UTILS_BROWSER_SPECS.map((spec) => `${UTILS_DIRECTORY}/${spec}`),
        `${UTILS_DIRECTORY}/${DOM_SPECS}`,
        `${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`,
      ],
      // The walks prove nothing new about an engine, and the Node-only specs read data that each engine updates at its own pace.
      exclude: [EXHAUSTIVE_SPECS, NODE_ONLY_SPECS, ...otherEnvironmentSpecs],
    }),
  ];
}
