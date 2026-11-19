import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';
import type { SizeImports } from '../types/size-imports.type.ts';
import type { SizeTarget } from '../types/size-target.type.ts';
import type { SizeBudget } from './size-budget.interface.ts';

export interface SizeMeasurement {
  readonly name: string;
  readonly packageFolder: FoundryPackageFolder;
  readonly target: SizeTarget;
  readonly imports: SizeImports;
  readonly files?: ReadonlyArray<string>;
  readonly budget: SizeBudget | null;
}
