import { readFileSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import type { Plugin, TestProjectInlineConfiguration } from 'vitest/config';
import type { BrowserInstanceOption } from 'vitest/node';
import { ANGULAR_OPTIMIZED_DEPENDENCIES } from './constants/angular-optimized-dependencies.constant.ts';
import { SETUP_DIRECTORY, SPEC_TSCONFIG } from './constants/paths.constant.ts';
import { TEST_BROWSERS } from './constants/test-browsers.constant.ts';
import type { AngularNodeProjectOptions } from './interfaces/angular-node-project-options.interface.ts';
import type { BrowserProjectOptions } from './interfaces/browser-project-options.interface.ts';
import type { TestEnvironment } from './interfaces/test-environment.interface.ts';
import type { TypescriptNodeProjectOptions } from './interfaces/typescript-node-project-options.interface.ts';
import type { TestBrowser } from './types/test-browser.type.ts';

function isTestBrowser(value: string): value is TestBrowser {
  return (TEST_BROWSERS as ReadonlyArray<string>).includes(value);
}

function selectedBrowsers(variable: string | undefined): ReadonlyArray<TestBrowser> {
  const value: string | undefined = variable?.trim();
  if (value === undefined || value === '') return TEST_BROWSERS;
  if (value === 'none') return [];
  const names: Array<string> = value.split(',').map((name) => name.trim());
  const unknownNames: Array<string> = names.filter((name) => !isTestBrowser(name));
  if (unknownNames.length > 0) {
    throw new Error(
      `[test-projects]: unknown browser in FOUNDRY_TEST_BROWSERS: ${unknownNames.join(', ')}; use ${TEST_BROWSERS.join(', ')} or none`,
    );
  }
  return names.filter(isTestBrowser);
}

function expectedAngularMajor(variable: string | undefined, manifestText: string): number {
  const manifest: unknown = JSON.parse(manifestText);
  const fromManifest: string | null =
    typeof manifest === 'object' && manifest !== null && 'dependencies' in manifest
      ? ((manifest.dependencies as Record<string, string | undefined>)['@angular/core'] ?? null)
      : null;
  const major: number = Number.parseInt(variable?.trim() || (fromManifest ?? ''), 10);
  if (Number.isInteger(major)) return major;
  throw new Error('[test-projects]: cannot tell the expected Angular major, set FOUNDRY_EXPECTED_ANGULAR_MAJOR');
}

export function readTestEnvironment(): TestEnvironment {
  return {
    browsers: selectedBrowsers(process.env['FOUNDRY_TEST_BROWSERS']),
    isCoverageEnabled: process.env['FOUNDRY_TEST_COVERAGE'] === 'true',
    expectedAngularMajor: expectedAngularMajor(
      process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR'],
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ),
  };
}

// Project names cannot contain slashes.
function timeZoneSlug(timeZone: string): string {
  return timeZone.replaceAll('/', '-');
}

function angularPlugin(): Array<Plugin> {
  return angular({ tsconfig: SPEC_TSCONFIG });
}

function browsersToRun(browsers: ReadonlyArray<TestBrowser>, environment: TestEnvironment): ReadonlyArray<TestBrowser> {
  // V8 coverage only works with Chromium in browser mode, so a coverage run drops the other browsers.
  return browsers.filter((browser) => environment.browsers.includes(browser) && (!environment.isCoverageEnabled || browser === 'chromium'));
}

// The zone.js setup patches the global describe and it, so Angular projects need `globals: true`.
export function angularNodeProject(options: AngularNodeProjectOptions): TestProjectInlineConfiguration {
  return {
    plugins: [angularPlugin()],
    optimizeDeps: { include: [...ANGULAR_OPTIMIZED_DEPENDENCIES] },
    test: {
      name: options.name,
      environment: 'jsdom',
      globals: true,
      setupFiles: [`${SETUP_DIRECTORY}/angular-${options.changeDetection}.ts`],
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      provide: { changeDetection: options.changeDetection, expectedAngularMajor: options.environment.expectedAngularMajor },
    },
  };
}

// TZ is only read when the process starts, so each time zone gets its own forked process.
export function typescriptNodeProjects(options: TypescriptNodeProjectOptions): Array<TestProjectInlineConfiguration> {
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

// Returns an empty list when none of its browsers is selected: Vitest rejects a browser project without instances.
export function browserProjects(options: BrowserProjectOptions): Array<TestProjectInlineConfiguration> {
  const browsers: ReadonlyArray<TestBrowser> = browsersToRun(options.browsers ?? TEST_BROWSERS, options.environment);
  if (browsers.length === 0) return [];
  const timeZones: ReadonlyArray<string> | undefined = options.timeZones;
  // Each time zone needs its own browser context, so its own provider.
  const instances: Array<BrowserInstanceOption> = timeZones
    ? browsers.flatMap((browser) =>
        timeZones.map((timeZone) => ({
          browser,
          name: `${options.name}:${browser}:${timeZoneSlug(timeZone)}`,
          provider: playwright({ contextOptions: { timezoneId: timeZone } }),
          provide: { expectedTimeZone: timeZone },
        })),
      )
    : browsers.map((browser) => ({ browser, name: `${options.name}:${browser}` }));

  return [
    {
      plugins: options.isAngular ? [angularPlugin()] : [],
      optimizeDeps: options.isAngular ? { include: [...ANGULAR_OPTIMIZED_DEPENDENCIES] } : {},
      test: {
        name: options.name,
        globals: options.isAngular,
        setupFiles: options.isAngular ? [`${SETUP_DIRECTORY}/angular-browser.ts`] : [],
        include: [...options.include],
        exclude: [...(options.exclude ?? [])],
        provide: { expectedAngularMajor: options.environment.expectedAngularMajor },
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
