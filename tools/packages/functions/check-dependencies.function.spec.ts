import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { checkDependencies } from './check-dependencies.function.ts';

function createTarball(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('checkDependencies', () => {
  it('accepts empty dependencies', () => {
    expect(checkDependencies(createTarball('foundry-utils', { dependencies: {} }))).toEqual([]);
  });

  it('reports dependencies, optional dependencies and bundled dependencies', () => {
    const manifest: PackageManifest = {
      dependencies: { tslib: '^2.8.0' },
      optionalDependencies: { fsevents: '*' },
      bundledDependencies: [],
    };
    expect(checkDependencies(createTarball('foundry-utils', manifest))).toEqual([
      '"dependencies" must be empty; it has: tslib',
      '"optionalDependencies" must not exist; it has: fsevents',
      '"bundleDependencies" must not exist',
    ]);
  });
});
