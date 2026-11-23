import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { findLicenseProblems } from './find-license-problems.function.ts';

function createTarball(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('findLicenseProblems', () => {
  it('accepts an MIT package with a copy of the root LICENSE', () => {
    expect(findLicenseProblems(createTarball('foundry-utils', { license: 'MIT' }, { LICENSE: 'root text' }), 'root text', [])).toEqual([]);
  });

  it('reports a different license field', () => {
    expect(findLicenseProblems(createTarball('foundry-utils', { license: 'ISC' }, { LICENSE: 'root text' }), 'root text', [])).toEqual([
      '"license" is "ISC", not "MIT"',
    ]);
  });

  it('reports a missing LICENSE file', () => {
    expect(findLicenseProblems(createTarball('foundry-utils', { license: 'MIT' }), 'root text', [])).toEqual([
      'LICENSE is not in the tarball',
    ]);
  });

  it('expects MIT and the license of each third-party material in the package', () => {
    const tarball: Tarball = createTarball('foundry-utils', { license: 'MIT AND Unicode-3.0' }, { LICENSE: 'root text' });
    expect(findLicenseProblems(tarball, 'root text', ['date/src/constants/first-day-of-week.cldr.constant.ts'])).toEqual([]);
  });

  it('reports an MIT license field when the package has third-party material', () => {
    const tarball: Tarball = createTarball('foundry-utils', { license: 'MIT' }, { LICENSE: 'root text' });
    expect(findLicenseProblems(tarball, 'root text', ['date/src/constants/first-day-of-week.cldr.constant.ts'])).toEqual([
      '"license" is "MIT", not "MIT AND Unicode-3.0"',
    ]);
  });

  it('reports a LICENSE that differs from the root one', () => {
    expect(findLicenseProblems(createTarball('foundry-utils', { license: 'MIT' }, { LICENSE: 'old text' }), 'root text', [])).toEqual([
      'LICENSE in the tarball differs from the root LICENSE (copy it again)',
    ]);
  });
});
