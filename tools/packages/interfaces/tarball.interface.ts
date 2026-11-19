import type { FoundryPackage } from './foundry-package.interface.ts';
import type { PackageManifest } from './package-manifest.interface.ts';

export interface Tarball {
  readonly foundryPackage: FoundryPackage;
  readonly unpackedDirectory: string;
  // Relative to unpackedDirectory and always with '/', also on Windows.
  readonly files: ReadonlyArray<string>;
  readonly manifest: PackageManifest;
}
