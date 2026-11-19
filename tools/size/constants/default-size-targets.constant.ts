import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';
import type { SizeTarget } from '../types/size-target.type.ts';

export const DEFAULT_SIZE_TARGETS: Readonly<Record<FoundryPackageFolder, SizeTarget>> = {
  'foundry-utils': 'bundle',
  'foundry-core': 'angular-app',
  'foundry-ui': 'angular-app-with-forms',
};
