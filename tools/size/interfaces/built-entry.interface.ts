import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';

export interface BuiltEntry {
  readonly packageFolder: FoundryPackageFolder;
  readonly entry: string;
  readonly specifier: string;
  readonly file: string;
  readonly exports: ReadonlyArray<string>;
}
