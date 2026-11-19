import type { FoundryPackage } from './foundry-package.interface.ts';
import type { PackageManifest } from './package-manifest.interface.ts';

export interface Tarball {
  readonly foundryPackage: FoundryPackage;
  // Relative paths, always with '/', also on Windows.
  readonly files: ReadonlyArray<string>;
  readonly contents: ReadonlyMap<string, string>;
  readonly manifest: PackageManifest;
}
