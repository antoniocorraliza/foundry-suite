import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import type { FoundryPackageFolder } from '../types/foundry-package-folder.type.ts';
import { checkExports } from './check-exports.function.ts';

function tarballOf(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

const ROOT_ENTRY: PackageManifest = {
  module: './fesm2022/package.mjs',
  typings: './types/package.d.ts',
  exports: {
    './package.json': { default: './package.json' },
    '.': { types: './types/package.d.ts', default: './fesm2022/package.mjs' },
  },
};
const ROOT_FILES: Readonly<Record<string, string>> = { 'fesm2022/package.mjs': '', 'types/package.d.ts': '' };

describe('checkExports', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('accepts a package whose entries are all exported and present', () => {
    expect(checkExports(tarballOf('foundry-core', ROOT_ENTRY, ROOT_FILES), ['ng-package.json'])).toEqual([]);
  });

  it('reports an entry point of the source that is missing from exports', () => {
    const problems: Array<string> = checkExports(tarballOf('foundry-core', ROOT_ENTRY, ROOT_FILES), [
      'configuration/ng-package.json',
      'ng-package.json',
    ]);
    expect(problems).toEqual(['entry "./configuration" is missing from "exports"']);
  });

  it('reports an export that is neither an entry point nor a non-entry export', () => {
    const manifest: PackageManifest = {
      ...ROOT_ENTRY,
      exports: { ...ROOT_ENTRY.exports, './extra': { types: './types/package.d.ts', default: './fesm2022/package.mjs' } },
    };
    expect(checkExports(tarballOf('foundry-core', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([
      'unexpected export "./extra" (no entry point and not in nonEntryExports)',
    ]);
  });

  it('requires types first, default last and files that exist', () => {
    const manifest: PackageManifest = {
      ...ROOT_ENTRY,
      exports: { ...ROOT_ENTRY.exports, '.': { default: './missing.mjs', types: './types/package.d.ts' } },
    };
    expect(checkExports(tarballOf('foundry-core', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([
      'export ".": "types" must be the first condition',
      'export ".": "default" must be the last condition',
      'export "." -> "default": ./missing.mjs is not in the tarball',
    ]);
  });

  it('reports module and typings that are not in the tarball', () => {
    expect(checkExports(tarballOf('foundry-core', ROOT_ENTRY, {}), ['ng-package.json'])).toContain(
      '"module" (./fesm2022/package.mjs) is not in the tarball',
    );
  });

  describe('pattern exports of the UI style sheets', () => {
    const manifest: PackageManifest = { ...ROOT_ENTRY, exports: { ...ROOT_ENTRY.exports, './styles/*.css': './styles/*.css' } };

    it('passes without matching files while the source has no styles folder', () => {
      expect(checkExports(tarballOf('foundry-ui', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([]);
    });

    it('fails without matching files once the source has a styles folder', () => {
      expect(checkExports(tarballOf('foundry-ui', manifest, ROOT_FILES), ['ng-package.json', 'styles/theme.css'])).toEqual([
        'pattern export "./styles/*.css" matches no file in the tarball, but the source has styles/',
      ]);
    });

    it('passes when the tarball has matching files', () => {
      const files: Readonly<Record<string, string>> = { ...ROOT_FILES, 'styles/theme.css': '' };
      expect(checkExports(tarballOf('foundry-ui', manifest, files), ['ng-package.json', 'styles/theme.css'])).toEqual([]);
    });

    it('requires a pattern export to map to a pattern', () => {
      const fixed: PackageManifest = { ...ROOT_ENTRY, exports: { ...ROOT_ENTRY.exports, './styles/*.css': './styles/theme.css' } };
      expect(checkExports(tarballOf('foundry-ui', fixed, ROOT_FILES), ['ng-package.json'])).toEqual([
        'pattern export "./styles/*.css" must map to a pattern string',
      ]);
    });
  });
});
