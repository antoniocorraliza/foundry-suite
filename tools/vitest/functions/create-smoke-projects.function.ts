import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY } from '../constants/paths.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { createAngularNodeProject } from './create-angular-node-project.function.ts';
import { createBrowserProjects } from './create-browser-projects.function.ts';
import { createTypescriptNodeProjects } from './create-typescript-node-projects.function.ts';

export function createSmokeProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  return [
    createAngularNodeProject({
      name: 'smoke:ng-zoneless',
      changeDetection: 'zoneless',
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-node.smoke.spec.ts`],
    }),
    createAngularNodeProject({
      name: 'smoke:ng-zone',
      changeDetection: 'zone',
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-node.smoke.spec.ts`],
    }),
    ...createTypescriptNodeProjects({
      name: 'smoke:ts-node',
      timeZones: ['UTC', 'America/Santiago'],
      include: [`${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
    }),
    ...createBrowserProjects({
      name: 'smoke:ng-browser',
      isAngular: true,
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-browser.smoke.spec.ts`],
    }),
    ...createBrowserProjects({
      name: 'smoke:ts-browser',
      isAngular: false,
      environment,
      timeZones: ['Europe/Madrid', 'America/Santiago'],
      include: [`${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`],
    }),
  ];
}
