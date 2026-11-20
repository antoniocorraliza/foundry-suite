import type { FoundryPackageFolder } from '../../packages/types/foundry-package-folder.type.ts';

export function getEntryMeasurementName(packageFolder: FoundryPackageFolder, entry: string): string {
  const shortName: string = packageFolder.replace(/^foundry-/, '');
  return entry === '' ? `${shortName} (root)` : `${shortName}/${entry}`;
}
