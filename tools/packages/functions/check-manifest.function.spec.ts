import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { FoundryPackageFolder } from '../interfaces/foundry-package-folder.type.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import { checkManifest } from './check-manifest.function.ts';

function tarballOf(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

const UTILS: PackageManifest = {
  name: '@antoniocorraliza/foundry-utils',
  type: 'module',
  engines: { node: '>=22.12.0' },
  sideEffects: false,
  repository: { url: 'git+https://github.com/antoniocorraliza/foundry-suite.git', directory: 'projects/antoniocorraliza/foundry-utils' },
};

describe('checkManifest', () => {
  it('accepts the expected manifest', () => {
    expect(checkManifest(tarballOf('foundry-utils', UTILS))).toEqual([]);
  });

  it('reports each field that differs', () => {
    const manifest: PackageManifest = {
      ...UTILS,
      type: 'commonjs',
      engines: { node: '>=20' },
      sideEffects: true,
      repository: { url: 'x' },
    };
    expect(checkManifest(tarballOf('foundry-utils', manifest))).toEqual([
      '"type" must be "module"',
      '"engines.node" must be ">=22.12.0"',
      '"sideEffects" is true, expected false',
      '"repository.url" must be "git+https://github.com/antoniocorraliza/foundry-suite.git"',
      '"repository.directory" must be "projects/antoniocorraliza/foundry-utils"',
    ]);
  });
});
