import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';

export interface DiscardableValue {
  readonly packageFolder: FoundryPackageFolder;
  readonly entry: string;
  readonly valueName: string;
  readonly keptSymbol: string;
  readonly absentText: string;
}
