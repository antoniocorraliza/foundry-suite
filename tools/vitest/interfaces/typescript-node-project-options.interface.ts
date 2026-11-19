import type { ProjectOptions } from './project-options.interface.ts';

export interface TypescriptNodeProjectOptions extends ProjectOptions {
  readonly timeZones: ReadonlyArray<string>;
}
