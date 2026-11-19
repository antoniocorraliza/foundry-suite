import type { TestProjectInlineConfiguration } from 'vitest/config';
import { SMOKE_DIRECTORY } from '../constants/paths.constant.ts';
import { angularNodeProject, browserProjects, typescriptNodeProjects } from '../projects.ts';

// One project of each kind. The time zones only prove the mechanism; each library sets its own list.
export function smokeProjects(): Array<TestProjectInlineConfiguration> {
  return [
    angularNodeProject({
      name: 'smoke:ng-zoneless',
      changeDetection: 'zoneless',
      include: [`${SMOKE_DIRECTORY}/angular-node.smoke.spec.ts`],
    }),
    angularNodeProject({
      name: 'smoke:ng-zone',
      changeDetection: 'zone',
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
      include: [`${SMOKE_DIRECTORY}/angular-browser.smoke.spec.ts`],
    }),
    ...browserProjects({
      name: 'smoke:ts-browser',
      angular: false,
      timeZones: ['Europe/Madrid', 'America/Santiago'],
      include: [`${SMOKE_DIRECTORY}/timezone-browser.smoke.spec.ts`],
    }),
  ];
}
