import type { ChangeDetection } from '../types/change-detection.type.ts';
import type { ProjectOptions } from './project-options.interface.ts';
import type { TestEnvironment } from './test-environment.interface.ts';

export interface AngularNodeProjectOptions extends ProjectOptions {
  readonly changeDetection: ChangeDetection;
  readonly environment: TestEnvironment;
}
