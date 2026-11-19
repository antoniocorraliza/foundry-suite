import type { TestBrowser } from '../types/test-browser.type.ts';

export interface TestEnvironment {
  readonly browsers: ReadonlyArray<TestBrowser>;
  readonly coverage: boolean;
  readonly expectedAngularMajor: number;
}
