import { fileURLToPath } from 'node:url';
import type { Alias } from 'vite';
import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY, UTILS_DIRECTORY } from '../constants/paths.constant.ts';
import { UTILS_BROWSER_SPECS } from '../constants/utils-browser-specs.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { browserProjects, typescriptJsdomProject, typescriptNodeProjects, typescriptTypesProject } from '../projects.ts';

// The tsconfig paths point to dist/, so the tests of Utils resolve its own entries to the source.
function utilsSourceAliases(): Array<Alias> {
  const directory: string = fileURLToPath(new URL(`../../../${UTILS_DIRECTORY}`, import.meta.url));
  return [
    { find: /^@antoniocorraliza\/foundry-utils$/, replacement: `${directory}/src/public-api.ts` },
    { find: /^@antoniocorraliza\/foundry-utils\/([a-z-]+)$/, replacement: `${directory}/$1/src/public-api.ts` },
  ];
}

function withUtilsSource(project: TestProjectInlineConfiguration): TestProjectInlineConfiguration {
  return { ...project, resolve: { alias: utilsSourceAliases() } };
}

export function utilsProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  const specs: string = `${UTILS_DIRECTORY}/**/*.spec.ts`;
  return [
    ...typescriptNodeProjects({
      name: 'utils',
      timeZones: ['Europe/Madrid', 'America/Mexico_City', 'America/Santiago', 'UTC'],
      include: [specs, `${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
      exclude: ['**/node_modules/**', '**/*.apia.*spec.ts', '**/*.jsdom.*spec.ts'],
    }),
    ...typescriptNodeProjects({
      name: 'utils-apia',
      timeZones: ['Pacific/Apia'],
      include: [`${UTILS_DIRECTORY}/**/*.apia.*spec.ts`],
    }),
    typescriptJsdomProject({ name: 'utils-jsdom', include: [`${UTILS_DIRECTORY}/**/*.jsdom.*spec.ts`] }),
    typescriptTypesProject({ name: 'utils-types', include: [`${UTILS_DIRECTORY}/**/*.test-d.ts`] }),
    ...browserProjects({
      name: 'utils-browser',
      isAngular: false,
      environment,
      timeZones: ['Europe/Madrid', 'America/Santiago'],
      include: [...UTILS_BROWSER_SPECS.map((spec) => `${UTILS_DIRECTORY}/${spec}`), `${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`],
    }),
  ].map(withUtilsSource);
}
