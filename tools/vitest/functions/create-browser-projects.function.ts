import { playwright } from '@vitest/browser-playwright';
import type { TestProjectInlineConfiguration } from 'vitest/config';
import type { BrowserInstanceOption } from 'vitest/node';
import { ANGULAR_OPTIMIZED_DEPENDENCIES } from '../constants/angular-optimized-dependencies.constant.ts';
import { TEST_BROWSERS } from '../constants/test-browsers.constant.ts';
import { SETUP_DIRECTORY } from '../constants/test-paths.constant.ts';
import type { BrowserProjectOptions } from '../interfaces/browser-project-options.interface.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import type { TestBrowser } from '../types/test-browser.type.ts';
import { createAngularPlugin } from './create-angular-plugin.function.ts';
import { getTimeZoneSlug } from './get-time-zone-slug.function.ts';

function filterBrowsersToRun(browsers: ReadonlyArray<TestBrowser>, environment: TestEnvironment): ReadonlyArray<TestBrowser> {
  // V8 coverage only works with Chromium in browser mode, so a coverage run drops the other browsers.
  return browsers.filter((browser) => environment.browsers.includes(browser) && (!environment.isCoverageEnabled || browser === 'chromium'));
}

// Returns an empty list when none of its browsers is selected: Vitest rejects a browser project without instances.
export function createBrowserProjects(options: BrowserProjectOptions): Array<TestProjectInlineConfiguration> {
  const browsers: ReadonlyArray<TestBrowser> = filterBrowsersToRun(options.browsers ?? TEST_BROWSERS, options.environment);
  if (browsers.length === 0) return [];
  const timeZones: ReadonlyArray<string> | undefined = options.timeZones;
  // Each time zone needs its own browser context, so its own provider.
  const instances: Array<BrowserInstanceOption> = timeZones
    ? browsers.flatMap((browser) =>
        timeZones.map((timeZone) => ({
          browser,
          name: `${options.name}:${browser}:${getTimeZoneSlug(timeZone)}`,
          provider: playwright({ contextOptions: { timezoneId: timeZone } }),
          provide: { expectedTimeZone: timeZone },
        })),
      )
    : browsers.map((browser) => ({ browser, name: `${options.name}:${browser}` }));

  return [
    {
      plugins: options.isAngular ? [createAngularPlugin()] : [],
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
