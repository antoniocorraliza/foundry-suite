/*
 * Shared Vitest project factories for the whole monorepo (block B1).
 *
 * Each library builds its own projects with these factories and adds them to the
 * root vitest.config.ts. Lessons from block B0 (claude/b0-vitest-versiones.md):
 * - Angular projects load the Analog plugin and need `globals: true`, because the
 *   zone.js setup patches the global `describe`/`it`.
 * - Plain TypeScript projects do NOT load the Angular plugin.
 * - Time zones on Node: one forked process per zone, with TZ set before it starts.
 * - Time zones in the browser: one Playwright context per zone (`timezoneId`).
 * - V8 coverage only works with Chromium in browser mode (PF-INF3): in a coverage
 *   run (FOUNDRY_TEST_COVERAGE=true) browser projects keep only their Chromium instances.
 *
 * Environment variables (CI in two levels; see tools/ci/README.md):
 * - FOUNDRY_TEST_BROWSERS: comma-separated subset of chromium,firefox,webkit, or `none`
 *   for a run without browser projects. Unset: the three browsers.
 * - FOUNDRY_EXPECTED_ANGULAR_MAJOR: the Angular major the tests must run with. Unset: the
 *   major of @angular/core in the root package.json. The Angular smoke tests check it, so
 *   a CI job for Angular 22 cannot run with Angular 21 by mistake.
 */
import { readFileSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import type { TestProjectInlineConfiguration } from 'vitest/config';

export const FOUNDRY_TEST_BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export type FoundryTestBrowser = (typeof FOUNDRY_TEST_BROWSERS)[number];
export type FoundryChangeDetection = 'zone' | 'zoneless';

const SETUP_DIRECTORY = 'tools/vitest/setup';
const SPEC_TSCONFIG = 'tsconfig.spec.json';

/** Pre-bundled up front so a cold Vite start does not fail to load them (UI2-R27). */
const ANGULAR_OPTIMIZED_DEPENDENCIES = [
  '@angular/common',
  '@angular/common/http',
  '@angular/common/http/testing',
  '@angular/core',
  '@angular/core/testing',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser/testing',
  '@angular/router',
  'rxjs',
  'rxjs/operators',
];

const isCoverageRun = process.env['FOUNDRY_TEST_COVERAGE'] === 'true';

function isFoundryTestBrowser(value: string): value is FoundryTestBrowser {
  return (FOUNDRY_TEST_BROWSERS as ReadonlyArray<string>).includes(value);
}

/** Browsers selected with FOUNDRY_TEST_BROWSERS. An unknown name fails at once instead of running fewer tests. */
function selectedBrowsers(): ReadonlyArray<FoundryTestBrowser> {
  const value = process.env['FOUNDRY_TEST_BROWSERS']?.trim();
  if (value === undefined || value === '') {
    return FOUNDRY_TEST_BROWSERS;
  }
  if (value === 'none') {
    return [];
  }
  const names = value.split(',').map((name) => name.trim());
  const unknown = names.filter((name) => !isFoundryTestBrowser(name));
  if (unknown.length > 0) {
    throw new Error(`FOUNDRY_TEST_BROWSERS: unknown browser(s) ${unknown.join(', ')}. Use ${FOUNDRY_TEST_BROWSERS.join(', ')} or none.`);
  }
  return names.filter(isFoundryTestBrowser);
}

/** Angular major the tests must see: FOUNDRY_EXPECTED_ANGULAR_MAJOR, or the one in the root package.json. */
function expectedAngularMajor(): number {
  const fromEnvironment = process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR']?.trim();
  const manifest: unknown = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const fromManifest =
    typeof manifest === 'object' && manifest !== null && 'dependencies' in manifest
      ? (manifest.dependencies as Record<string, string | undefined>)['@angular/core']
      : undefined;
  const major = Number.parseInt(fromEnvironment || (fromManifest ?? ''), 10);
  if (!Number.isInteger(major)) {
    throw new Error('Cannot tell the expected Angular major: set FOUNDRY_EXPECTED_ANGULAR_MAJOR.');
  }
  return major;
}

const ANGULAR_MAJOR = expectedAngularMajor();

interface ProjectFiles {
  readonly name: string;
  readonly include: ReadonlyArray<string>;
  readonly exclude?: ReadonlyArray<string>;
}

/** 'America/Santiago' → 'America-Santiago': project names without slashes. */
function timeZoneSlug(timeZone: string): string {
  return timeZone.replaceAll('/', '-');
}

function angularPlugin() {
  return angular({ tsconfig: SPEC_TSCONFIG });
}

function browsersToRun(browsers: ReadonlyArray<FoundryTestBrowser>): ReadonlyArray<FoundryTestBrowser> {
  const selected = selectedBrowsers();
  return browsers.filter((browser) => selected.includes(browser) && (!isCoverageRun || browser === 'chromium'));
}

/** Angular on Node with jsdom, zoneless or with zone.js. */
export function angularNodeProject(
  options: ProjectFiles & { readonly changeDetection: FoundryChangeDetection },
): TestProjectInlineConfiguration {
  return {
    plugins: [angularPlugin()],
    optimizeDeps: { include: ANGULAR_OPTIMIZED_DEPENDENCIES },
    test: {
      name: options.name,
      environment: 'jsdom',
      globals: true,
      setupFiles: [`${SETUP_DIRECTORY}/angular-${options.changeDetection}.ts`],
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      provide: { changeDetection: options.changeDetection, expectedAngularMajor: ANGULAR_MAJOR },
    },
  };
}

/** Plain TypeScript on Node, without the Angular plugin: one forked process per time zone. */
export function typescriptNodeProjects(
  options: ProjectFiles & { readonly timeZones: ReadonlyArray<string> },
): Array<TestProjectInlineConfiguration> {
  return options.timeZones.map((timeZone) => ({
    test: {
      name: `${options.name}:${timeZoneSlug(timeZone)}`,
      environment: 'node',
      pool: 'forks',
      env: { TZ: timeZone },
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      provide: { expectedTimeZone: timeZone },
    },
  }));
}

/**
 * Real browsers through Playwright. With `angular: true` the project compiles Angular
 * and sets up a zoneless TestBed. With `timeZones`, there is one instance per browser
 * and zone, each one with its own browser context (`timezoneId`).
 *
 * Returns a list, like `typescriptNodeProjects`: it is empty when none of its browsers
 * is selected (FOUNDRY_TEST_BROWSERS=none, or coverage without Chromium), because
 * Vitest does not accept a browser project without instances.
 */
export function browserProjects(
  options: ProjectFiles & {
    readonly angular: boolean;
    readonly browsers?: ReadonlyArray<FoundryTestBrowser>;
    readonly timeZones?: ReadonlyArray<string>;
  },
): Array<TestProjectInlineConfiguration> {
  const browsers = browsersToRun(options.browsers ?? FOUNDRY_TEST_BROWSERS);
  if (browsers.length === 0) {
    return [];
  }
  const instances = options.timeZones
    ? browsers.flatMap((browser) =>
        (options.timeZones ?? []).map((timeZone) => ({
          browser,
          name: `${options.name}:${browser}:${timeZoneSlug(timeZone)}`,
          provider: playwright({ contextOptions: { timezoneId: timeZone } }),
          provide: { expectedTimeZone: timeZone, expectedAngularMajor: ANGULAR_MAJOR },
        })),
      )
    : browsers.map((browser) => ({ browser, name: `${options.name}:${browser}` }));

  return [
    {
      plugins: options.angular ? [angularPlugin()] : [],
      optimizeDeps: options.angular ? { include: ANGULAR_OPTIMIZED_DEPENDENCIES } : {},
      test: {
        name: options.name,
        globals: options.angular,
        setupFiles: options.angular ? [`${SETUP_DIRECTORY}/angular-browser.ts`] : [],
        include: [...options.include],
        exclude: [...(options.exclude ?? [])],
        provide: { expectedAngularMajor: ANGULAR_MAJOR },
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances,
        },
      },
    },
  ];
}
