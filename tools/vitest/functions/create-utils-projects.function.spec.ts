import { matchesGlob } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TestProjectInlineConfiguration } from 'vitest/config';
import { createUtilsProjects } from './create-utils-projects.function.ts';

const UTILS: string = 'projects/antoniocorraliza/foundry-utils';
const ZONE_PROJECTS: Array<string> = ['utils:Europe-Madrid', 'utils:America-Mexico_City', 'utils:America-Santiago', 'utils:UTC'];

function listProjectsRunning(file: string): Array<string> {
  const projects: Array<TestProjectInlineConfiguration> = createUtilsProjects({
    browsers: ['chromium'],
    isCoverageEnabled: false,
    expectedAngularMajor: 21,
  });
  return projects
    .filter((project) => {
      const include: Array<string> = project.test?.include ?? [];
      const exclude: Array<string> = project.test?.exclude ?? [];
      return include.some((pattern) => matchesGlob(file, pattern)) && !exclude.some((pattern) => matchesGlob(file, pattern));
    })
    .map((project) => {
      const name: string | { label: string } | undefined = project.test?.name;
      return typeof name === 'object' ? name.label : (name ?? '');
    });
}

describe('createUtilsProjects', () => {
  it('runs the date specs in the four time zones and in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/parse-date.function.spec.ts`)).toEqual([...ZONE_PROJECTS, 'utils-browser']);
  });

  it('runs the exhaustive date specs in the four time zones on Node only', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/build-local-date.exhaustive.function.spec.ts`)).toEqual(ZONE_PROJECTS);
  });

  it('runs the specs of a day that the time zone skips only in that time zone', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/get-days-in-range.apia.function.spec.ts`)).toEqual(['utils-apia:Pacific-Apia']);
  });

  it.each([
    `${UTILS}/src/public-api.spec.ts`,
    `${UTILS}/case/src/functions/to-camel-case.function.spec.ts`,
    `${UTILS}/object/src/functions/pick-properties.function.spec.ts`,
  ])('runs %s once, in UTC', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC']);
  });

  it('keeps the browser specs that do not depend on the time zone in UTC and in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/object/src/functions/deep-clone.function.spec.ts`)).toEqual(['utils:UTC', 'utils-browser']);
  });

  it('runs the time zone guard in every time zone project', () => {
    expect(listProjectsRunning('tools/vitest/smoke/timezone-node.smoke.spec.ts')).toEqual(ZONE_PROJECTS);
  });
});
