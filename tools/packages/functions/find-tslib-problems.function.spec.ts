import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { findTslibProblems } from './find-tslib-problems.function.ts';

function createTarball(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('findTslibProblems', () => {
  it('reports each line that imports tslib, statically or dynamically', () => {
    const files: Readonly<Record<string, string>> = {
      'fesm2022/a.mjs': "const x = 1;\nimport { __decorate } from 'tslib';",
      'fesm2022/b.mjs': "await import('tslib/modules/index.js');",
    };
    expect(findTslibProblems(createTarball('foundry-core', {}, files))).toEqual([
      'fesm2022/a.mjs:2 imports tslib',
      'fesm2022/b.mjs:1 imports tslib',
    ]);
  });

  it('ignores tslib mentioned outside an import and files that are not code', () => {
    const files: Readonly<Record<string, string>> = { 'fesm2022/a.mjs': '// compiled without tslib', 'README.md': "import 'tslib';" };
    expect(findTslibProblems(createTarball('foundry-core', {}, files))).toEqual([]);
  });

  it('reports tslib declared in a dependency field', () => {
    expect(findTslibProblems(createTarball('foundry-core', { peerDependencies: { tslib: '^2.8.0' } }))).toEqual([
      '"peerDependencies" declares tslib',
    ]);
  });
});
