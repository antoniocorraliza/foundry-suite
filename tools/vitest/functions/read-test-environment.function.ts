import { readFileSync } from 'node:fs';
import { TEST_BROWSERS } from '../constants/test-browsers.constant.ts';
import type { TestEnvironment } from '../interfaces/test-environment.interface.ts';
import type { TestBrowser } from '../types/test-browser.type.ts';

function isTestBrowser(value: string): value is TestBrowser {
  return (TEST_BROWSERS as ReadonlyArray<string>).includes(value);
}

function parseSelectedBrowsers(variable: string | undefined): ReadonlyArray<TestBrowser> {
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

function parseExpectedAngularMajor(variable: string | undefined, manifestText: string): number {
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
    browsers: parseSelectedBrowsers(process.env['FOUNDRY_TEST_BROWSERS']),
    isCoverageEnabled: process.env['FOUNDRY_TEST_COVERAGE'] === 'true',
    expectedAngularMajor: parseExpectedAngularMajor(
      process.env['FOUNDRY_EXPECTED_ANGULAR_MAJOR'],
      readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
    ),
  };
}
