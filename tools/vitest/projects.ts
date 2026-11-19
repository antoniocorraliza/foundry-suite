import { readFileSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';
import type { Plugin, TestProjectInlineConfiguration } from 'vitest/config';
import type { BrowserInstanceOption } from 'vitest/node';
import { ANGULAR_OPTIMIZED_DEPENDENCIES } from './constants/angular-optimized-dependencies.constant.ts';
import { FOUNDRY_TEST_BROWSERS } from './constants/foundry-test-browsers.constant.ts';
import { SETUP_DIRECTORY, SPEC_TSCONFIG } from './constants/paths.constant.ts';
import type { AngularNodeProjectOptions } from './interfaces/angular-node-project-options.interface.ts';
import type { BrowserProjectOptions } from './interfaces/browser-project-options.interface.ts';
import type { FoundryTestBrowser } from './interfaces/foundry-test-browser.type.ts';
import type { TypescriptNodeProjectOptions } from './interfaces/typescript-node-project-options.interface.ts';

// V8 coverage only works with Chromium in browser mode, so a coverage run drops the other browsers.
function isCoverageRun(): boolean {
  return process.env['FOUNDRY_TEST_COVERAGE'] === 'true';
}

function isFoundryTestBrowser(value: string): value is FoundryTestBrowser {
  return (FOUNDRY_TEST_BROWSERS as ReadonlyArray<string>).includes(value);
}

function selectedBrowsers(): ReadonlyArray<FoundryTestBrowser> {
  const value: string | undefined = process.env['FOUNDRY_TEST_BROWSERS']?.trim();
  if (value === undefined || value === '') return FOUNDRY_TEST_BROWSERS;
  if (value === 'none') return [];
  const names: Array<string> = value.split(',').map((name) => name.trim());
  const unknownNames: Array<string> = names.filter((name) => !isFoundryTestBrowser(name));
  // An unknown name fails instead of silently running fewer tests.
  if (unknownNames.length > 0) {
    throw new Error(
      `[vitest]: unknown browser in FOUNDRY_TEST_BROWSERS: ${unknownNames.join(', ')}; use ${FOUNDRY_TEST_BROWSERS.join(', ')} or none`,
    );
  }
  return names.filter(isFoundryTestBrowser);
}

function expectedAngularMajor(): number {
  const fromEnvironment: string | undefined = process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR']?.trim();
  const manifest: unknown = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const fromManifest: string | undefined =
    typeof manifest === 'object' && manifest !== null && 'dependencies' in manifest
      ? (manifest.dependencies as Record<string, string | undefined>)['@angular/core']
      : undefined;
  const major: number = Number.parseInt(fromEnvironment || (fromManifest ?? ''), 10);
  if (!Number.isInteger(major)) throw new Error('[vitest]: cannot tell the expected Angular major, set FOUNDRY_EXPECTED_ANGULAR_MAJOR');
  return major;
}

// Project names cannot contain slashes: 'America/Santiago' becomes 'America-Santiago'.
function timeZoneSlug(timeZone: string): string {
  return timeZone.replaceAll('/', '-');
}

function angularPlugin(): Array<Plugin> {
  return angular({ tsconfig: SPEC_TSCONFIG });
}

function browsersToRun(browsers: ReadonlyArray<FoundryTestBrowser>): ReadonlyArray<FoundryTestBrowser> {
  const selected: ReadonlyArray<FoundryTestBrowser> = selectedBrowsers();
  return browsers.filter((browser) => selected.includes(browser) && (!isCoverageRun() || browser === 'chromium'));
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
      provide: { changeDetection: options.changeDetection, expectedAngularMajor: expectedAngularMajor() },
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
  const browsers: ReadonlyArray<FoundryTestBrowser> = browsersToRun(options.browsers ?? FOUNDRY_TEST_BROWSERS);
  if (browsers.length === 0) return [];
  const timeZones: ReadonlyArray<string> | undefined = options.timeZones;
  // Each time zone needs its own browser context, so its own provider.
  const instances: Array<BrowserInstanceOption> = timeZones
    ? browsers.flatMap((browser) =>
        timeZones.map((timeZone) => ({
          browser,
          name: `${options.name}:${browser}:${timeZoneSlug(timeZone)}`,
          provider: playwright({ contextOptions: { timezoneId: timeZone } }),
          provide: { expectedTimeZone: timeZone, expectedAngularMajor: expectedAngularMajor() },
        })),
      )
    : browsers.map((browser) => ({ browser, name: `${options.name}:${browser}` }));

  return [
    {
      plugins: options.angular ? [angularPlugin()] : [],
      optimizeDeps: options.angular ? { include: [...ANGULAR_OPTIMIZED_DEPENDENCIES] } : {},
      test: {
        name: options.name,
        globals: options.angular,
        setupFiles: options.angular ? [`${SETUP_DIRECTORY}/angular-browser.ts`] : [],
        include: [...options.include],
        exclude: [...(options.exclude ?? [])],
        provide: { expectedAngularMajor: expectedAngularMajor() },
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
