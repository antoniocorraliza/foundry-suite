import type { FoundryChangeDetection } from './foundry-test-browser.type.ts';
import type { ProjectOptions } from './project-options.interface.ts';

export interface AngularNodeProjectOptions extends ProjectOptions {
  readonly changeDetection: FoundryChangeDetection;
}
