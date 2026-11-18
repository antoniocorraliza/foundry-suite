/*
 * B1 smoke projects: one per kind of Vitest project in the monorepo.
 * The time zones here only prove the mechanism; each library sets its own list.
 */
import type { TestProjectInlineConfiguration } from 'vitest/config';
import { angularNodeProject, browserProjects, typescriptNodeProjects } from '../projects.ts';

const SMOKE = 'tools/vitest/smoke';

export const smokeProjects: TestProjectInlineConfiguration[] = [
  angularNodeProject({
    name: 'smoke:ng-zoneless',
    changeDetection: 'zoneless',
    include: [`${SMOKE}/angular-node.smoke.spec.ts`],
  }),
  angularNodeProject({
    name: 'smoke:ng-zone',
    changeDetection: 'zone',
    include: [`${SMOKE}/angular-node.smoke.spec.ts`],
  }),
  ...typescriptNodeProjects({
    name: 'smoke:ts-node',
    timeZones: ['UTC', 'America/Santiago'],
    include: [`${SMOKE}/timezone-node.smoke.spec.ts`],
  }),
  ...browserProjects({
    name: 'smoke:ng-browser',
    angular: true,
    include: [`${SMOKE}/angular-browser.smoke.spec.ts`],
  }),
  ...browserProjects({
    name: 'smoke:ts-browser',
    angular: false,
    timeZones: ['Europe/Madrid', 'America/Santiago'],
    include: [`${SMOKE}/timezone-browser.smoke.spec.ts`],
  }),
];
