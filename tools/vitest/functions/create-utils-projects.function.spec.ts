import { matchesGlob } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TestProjectInlineConfiguration } from 'vitest/config';
import { createUtilsProjects } from './create-utils-projects.function.ts';

const UTILS: string = 'projects/antoniocorraliza/foundry-utils';
const ZONE_PROJECTS: Array<string> = ['utils:Europe-Madrid', 'utils:America-Mexico_City', 'utils:America-Santiago', 'utils:UTC'];

const EXHAUSTIVE_PROJECTS: Array<string> = ZONE_PROJECTS.map((project) => project.replace('utils:', 'utils-exhaustive:'));

function createProjects(isExhaustiveEnabled: boolean): Array<TestProjectInlineConfiguration> {
  return createUtilsProjects({ browsers: ['chromium'], isCoverageEnabled: false, isExhaustiveEnabled, expectedAngularMajor: 21 });
}

function listProjectsRunning(file: string, isExhaustiveEnabled: boolean = false): Array<string> {
  return createProjects(isExhaustiveEnabled)
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

  it('leaves the exhaustive date specs out of every project unless they are asked for', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/parse-date.exhaustive.function.spec.ts`)).toEqual([]);
  });

  it('runs the exhaustive date specs, when asked for, only in their own project of each time zone, on Node', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/parse-date.exhaustive.function.spec.ts`, true)).toEqual(EXHAUSTIVE_PROJECTS);
    expect(listProjectsRunning(`${UTILS}/date/src/functions/parse-date.function.spec.ts`, true)).toEqual([
      ...ZONE_PROJECTS,
      'utils-browser',
    ]);
  });

  it('gives each exhaustive date spec ten minutes and keeps the time zone of its project', () => {
    const projects: Array<TestProjectInlineConfiguration> = createProjects(true).filter((project) => {
      const name: string | { label: string } | undefined = project.test?.name;
      return typeof name === 'string' && name.startsWith('utils-exhaustive:');
    });
    expect(projects.map((project) => [project.test?.testTimeout, project.test?.env?.['TZ']])).toEqual([
      [600_000, 'Europe/Madrid'],
      [600_000, 'America/Mexico_City'],
      [600_000, 'America/Santiago'],
      [600_000, 'UTC'],
    ]);
  });

  it('runs the Node-only date specs in the four time zones and not in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/get-first-day-of-week.node.function.spec.ts`)).toEqual(ZONE_PROJECTS);
  });

  it('runs the specs of a day that the time zone skips only in that time zone', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/build-local-days.apia.function.spec.ts`)).toEqual(['utils-apia:Pacific-Apia']);
  });

  it('runs the specs of a repeated half hour only in a time zone whose offset changes by 30 minutes', () => {
    expect(listProjectsRunning(`${UTILS}/date/src/functions/find-later-local-date.lord-howe.function.spec.ts`)).toEqual([
      'utils-lord-howe:Australia-Lord_Howe',
    ]);
  });

  it.each([
    `${UTILS}/src/public-api.spec.ts`,
    `${UTILS}/case/src/functions/to-camel-case.function.spec.ts`,
    `${UTILS}/object/src/functions/pick-properties.function.spec.ts`,
    `${UTILS}/validation/src/functions/is-uuid.function.spec.ts`,
    `${UTILS}/validation/src/public-api.spec.ts`,
  ])('runs %s once, in UTC', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC']);
  });

  it('keeps the browser specs that do not depend on the time zone in UTC and in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/object/src/functions/deep-clone.function.spec.ts`)).toEqual(['utils:UTC', 'utils-browser']);
  });

  it.each([
    `${UTILS}/number/src/functions/read-decimal.function.spec.ts`,
    `${UTILS}/number/src/functions/round-to-decimals.function.spec.ts`,
    `${UTILS}/number/src/public-api.spec.ts`,
    `${UTILS}/text/src/functions/truncate-text.function.spec.ts`,
    `${UTILS}/text/src/public-api.spec.ts`,
    `${UTILS}/validation/src/functions/read-url.function.spec.ts`,
  ])('runs %s once in UTC and in the browser', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC', 'utils-browser']);
  });

  it.each([
    `${UTILS}/number/src/functions/get-parse-decimal-options.node.function.spec.ts`,
    `${UTILS}/number/src/functions/format-currency.node.function.spec.ts`,
    `${UTILS}/text/src/functions/split-graphemes.node.function.spec.ts`,
  ])('runs the Node-only spec %s once, in UTC, and not in the browser', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC']);
  });

  it('runs the csv specs in the four time zones and in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/csv/src/functions/to-csv.function.spec.ts`)).toEqual([...ZONE_PROJECTS, 'utils-browser']);
    expect(listProjectsRunning(`${UTILS}/csv/src/public-api.spec.ts`)).toEqual([...ZONE_PROJECTS, 'utils-browser']);
  });

  it('runs the Node-only csv specs in the four time zones and not in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/csv/src/functions/parse-csv.node.function.spec.ts`)).toEqual(ZONE_PROJECTS);
  });

  it.each([
    `${UTILS}/csv/src/functions/read-csv-file.jsdom.function.spec.ts`,
    `${UTILS}/browser/src/functions/download-blob.jsdom.function.spec.ts`,
  ])('runs the jsdom spec %s only in jsdom', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils-jsdom']);
  });

  it('runs the specs that need a document in jsdom and in the browser, and never on Node', () => {
    expect(listProjectsRunning(`${UTILS}/browser/src/functions/download-blob.dom.function.spec.ts`)).toEqual([
      'utils-jsdom',
      'utils-browser',
    ]);
  });

  it.each([
    `${UTILS}/browser/src/functions/sanitize-file-name.function.spec.ts`,
    `${UTILS}/browser/src/functions/download-blob.node.function.spec.ts`,
    `${UTILS}/browser/src/public-api.spec.ts`,
  ])('runs the browser entry spec %s once, in UTC, and not in the browser', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC']);
  });

  it.each([
    `${UTILS}/random/src/functions/create-random-code.function.spec.ts`,
    `${UTILS}/random/src/public-api.spec.ts`,
    `${UTILS}/hash/src/functions/create-hex-digest.function.spec.ts`,
    `${UTILS}/hash/src/functions/sha256.function.spec.ts`,
    `${UTILS}/form-data/src/functions/create-form-data.function.spec.ts`,
    `${UTILS}/form-data/src/public-api.spec.ts`,
  ])('runs %s once in UTC and in the browser, where each engine brings its own crypto and FormData', (file) => {
    expect(listProjectsRunning(file)).toEqual(['utils:UTC', 'utils-browser']);
  });

  it('runs the comparison of the hash with node:crypto once, in UTC, and not in the browser', () => {
    expect(listProjectsRunning(`${UTILS}/hash/src/functions/create-hex-digest.node.function.spec.ts`)).toEqual(['utils:UTC']);
  });

  it.each([`${UTILS}/timing/src/functions/sleep.function.spec.ts`, `${UTILS}/timing/src/public-api.spec.ts`])(
    'runs the timing spec %s once, in UTC, and not in the browser',
    (file) => {
      expect(listProjectsRunning(file)).toEqual(['utils:UTC']);
    },
  );

  it('runs the spec of createFormData with the File of jsdom only in jsdom', () => {
    expect(listProjectsRunning(`${UTILS}/form-data/src/functions/create-form-data.jsdom.function.spec.ts`)).toEqual(['utils-jsdom']);
  });

  it('runs the time zone guard in every time zone project', () => {
    expect(listProjectsRunning('tools/vitest/smoke/timezone-node.smoke.spec.ts')).toEqual(ZONE_PROJECTS);
  });
});
