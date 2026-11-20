import { describe, expect, it } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { checkAny } from './check-any.function.ts';

function createTarball(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('checkAny', () => {
  it('reports the any keyword in a declaration file', () => {
    const files: Readonly<Record<string, string>> = {
      'types/a.d.ts': 'export declare const value: string;\nexport declare function read(input: any): void;',
    };
    expect(checkAny(createTarball('foundry-utils', {}, files))).toEqual(['types/a.d.ts:2 uses `any`: input: any']);
  });

  it('ignores any inside comments and names', () => {
    const files: Readonly<Record<string, string>> = { 'types/a.d.ts': '/** Accepts any day. */\nexport declare const company: string;' };
    expect(checkAny(createTarball('foundry-utils', {}, files))).toEqual([]);
  });
});
