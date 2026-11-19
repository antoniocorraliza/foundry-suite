import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { checkLicense } from './check-license.function.ts';

function tarballOf(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('checkLicense', () => {
  it('accepts an MIT package with a copy of the root LICENSE', () => {
    expect(checkLicense(tarballOf('foundry-utils', { license: 'MIT' }, { LICENSE: 'root text' }), 'root text')).toEqual([]);
  });

  it('reports a different license field', () => {
    expect(checkLicense(tarballOf('foundry-utils', { license: 'ISC' }, { LICENSE: 'root text' }), 'root text')).toEqual([
      '"license" is "ISC", not "MIT"',
    ]);
  });

  it('reports a missing LICENSE file', () => {
    expect(checkLicense(tarballOf('foundry-utils', { license: 'MIT' }), 'root text')).toEqual(['LICENSE is not in the tarball']);
  });

  it('reports a LICENSE that differs from the root one', () => {
    expect(checkLicense(tarballOf('foundry-utils', { license: 'MIT' }, { LICENSE: 'old text' }), 'root text')).toEqual([
      'LICENSE in the tarball differs from the root LICENSE (copy it again)',
    ]);
  });
});
