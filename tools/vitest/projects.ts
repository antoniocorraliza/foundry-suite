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
 */
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

interface ProjectFiles {
  /** Project name. It must be unique in the monorepo. */
  readonly name: string;
  readonly include: readonly string[];
  readonly exclude?: readonly string[];
}

/** 'America/Santiago' → 'America-Santiago': project names without slashes. */
function timeZoneSlug(timeZone: string): string {
  return timeZone.replaceAll('/', '-');
}

function angularPlugin() {
  return angular({ tsconfig: SPEC_TSCONFIG });
}

function browsersToRun(browsers: readonly FoundryTestBrowser[]): readonly FoundryTestBrowser[] {
  return isCoverageRun ? browsers.filter((browser) => browser === 'chromium') : browsers;
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
      provide: { changeDetection: options.changeDetection },
    },
  };
}

/** Plain TypeScript on Node, without the Angular plugin: one forked process per time zone. */
export function typescriptNodeProjects(
  options: ProjectFiles & { readonly timeZones: readonly string[] },
): TestProjectInlineConfiguration[] {
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
 */
export function browserProject(
  options: ProjectFiles & {
    readonly angular: boolean;
    readonly browsers?: readonly FoundryTestBrowser[];
    readonly timeZones?: readonly string[];
  },
): TestProjectInlineConfiguration {
  const browsers = browsersToRun(options.browsers ?? FOUNDRY_TEST_BROWSERS);
  const instances = options.timeZones
    ? browsers.flatMap((browser) =>
        (options.timeZones ?? []).map((timeZone) => ({
          browser,
          name: `${options.name}:${browser}:${timeZoneSlug(timeZone)}`,
          provider: playwright({ contextOptions: { timezoneId: timeZone } }),
          provide: { expectedTimeZone: timeZone },
        })),
      )
    : browsers.map((browser) => ({ browser, name: `${options.name}:${browser}` }));

  return {
    plugins: options.angular ? [angularPlugin()] : [],
    optimizeDeps: options.angular ? { include: ANGULAR_OPTIMIZED_DEPENDENCIES } : {},
    test: {
      name: options.name,
      globals: options.angular,
      setupFiles: options.angular ? [`${SETUP_DIRECTORY}/angular-browser.ts`] : [],
      include: [...options.include],
      exclude: [...(options.exclude ?? [])],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances,
      },
    },
  };
}
