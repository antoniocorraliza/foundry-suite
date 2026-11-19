import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';

export interface PublicErrorClass {
  readonly packageFolder: FoundryPackageFolder;
  readonly entry: string;
  readonly className: string;
  readonly constructorArguments: string;
}
