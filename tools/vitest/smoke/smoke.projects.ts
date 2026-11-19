import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY } from '../constants/paths.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import { angularNodeProject, browserProjects, typescriptNodeProjects } from '../projects.ts';

export function smokeProjects(environment: TestEnvironment): Array<TestProjectInlineConfiguration> {
  return [
    angularNodeProject({
      name: 'smoke:ng-zoneless',
      changeDetection: 'zoneless',
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-node.smoke.spec.ts`],
    }),
    angularNodeProject({
      name: 'smoke:ng-zone',
      changeDetection: 'zone',
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-node.smoke.spec.ts`],
    }),
    ...typescriptNodeProjects({
      name: 'smoke:ts-node',
      timeZones: ['UTC', 'America/Santiago'],
      include: [`${SMOKE_DIRECTORY}/timezone-node.smoke.spec.ts`],
    }),
    ...browserProjects({
      name: 'smoke:ng-browser',
      angular: true,
      environment,
      include: [`${SMOKE_DIRECTORY}/angular-browser.smoke.spec.ts`],
    }),
    ...browserProjects({
      name: 'smoke:ts-browser',
      angular: false,
      environment,
      timeZones: ['Europe/Madrid', 'America/Santiago'],
      include: [`${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`],
    }),
  ];
}
