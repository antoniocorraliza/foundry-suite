import type { FoundryTestBrowser } from './foundry-test-browser.type.ts';
import type { ProjectOptions } from './project-options.interface.ts';

export interface BrowserProjectOptions extends ProjectOptions {
  readonly angular: boolean;
  readonly browsers?: ReadonlyArray<FoundryTestBrowser>;
  readonly timeZones?: ReadonlyArray<string>;
}
