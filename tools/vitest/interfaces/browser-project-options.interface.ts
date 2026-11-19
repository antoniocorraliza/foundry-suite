import type { TestBrowser } from '../types/test-browser.type.ts';
import type { ProjectOptions } from './project-options.interface.ts';
import type { TestEnvironment } from './test-environment.interface.ts';

export interface BrowserProjectOptions extends ProjectOptions {
  readonly angular: boolean;
  readonly environment: TestEnvironment;
  readonly browsers?: ReadonlyArray<TestBrowser>;
  readonly timeZones?: ReadonlyArray<string>;
}
