import type { TestBrowser } from '../types/test-browser.type.ts';

export interface TestEnvironment {
  readonly browsers: ReadonlyArray<TestBrowser>;
  readonly isCoverageEnabled: boolean;
  readonly expectedAngularMajor: number;
}
