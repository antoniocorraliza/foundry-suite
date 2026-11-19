import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';

export interface MeasurementSubject {
  readonly packageFolder: FoundryPackageFolder;
  readonly specifier: string;
}
