import { describe, expect, it } from 'vitest';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import { createTarball } from './create-tarball.function.ts';
import { findExportProblems } from './find-export-problems.function.ts';

const ROOT_ENTRY: PackageManifest = {
  module: './fesm2022/package.mjs',
  typings: './types/package.d.ts',
  exports: {
    './package.json': { default: './package.json' },
    '.': { types: './types/package.d.ts', default: './fesm2022/package.mjs' },
  },
};
const ROOT_FILES: Readonly<Record<string, string>> = { 'fesm2022/package.mjs': '', 'types/package.d.ts': '' };

describe('findExportProblems', () => {
  it('accepts a package whose entries are all exported and present', () => {
    expect(findExportProblems(createTarball('foundry-core', ROOT_ENTRY, ROOT_FILES), ['ng-package.json'])).toEqual([]);
  });

  it('reports an entry point of the source that is missing from exports', () => {
    const problems: Array<string> = findExportProblems(createTarball('foundry-core', ROOT_ENTRY, ROOT_FILES), [
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
    expect(findExportProblems(createTarball('foundry-core', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([
      'unexpected export "./extra" (no entry point and not in nonEntryExports)',
    ]);
  });

  it('requires types first, default last and files that exist', () => {
    const manifest: PackageManifest = {
      ...ROOT_ENTRY,
      exports: { ...ROOT_ENTRY.exports, '.': { default: './missing.mjs', types: './types/package.d.ts' } },
    };
    expect(findExportProblems(createTarball('foundry-core', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([
      'export ".": "types" must be the first condition',
      'export ".": "default" must be the last condition',
      'export "." -> "default": ./missing.mjs is not in the tarball',
    ]);
  });

  it('reports module and typings that are not in the tarball', () => {
    expect(findExportProblems(createTarball('foundry-core', ROOT_ENTRY, {}), ['ng-package.json'])).toContain(
      '"module" (./fesm2022/package.mjs) is not in the tarball',
    );
  });

  describe('pattern exports of the UI style sheets', () => {
    const manifest: PackageManifest = { ...ROOT_ENTRY, exports: { ...ROOT_ENTRY.exports, './styles/*.css': './styles/*.css' } };

    it('passes without matching files while the source has no styles folder', () => {
      expect(findExportProblems(createTarball('foundry-ui', manifest, ROOT_FILES), ['ng-package.json'])).toEqual([]);
    });

    it('fails without matching files once the source has a styles folder', () => {
      expect(findExportProblems(createTarball('foundry-ui', manifest, ROOT_FILES), ['ng-package.json', 'styles/theme.css'])).toEqual([
        'pattern export "./styles/*.css" matches no file in the tarball, but the source has styles/',
      ]);
    });

    it('passes when the tarball has matching files', () => {
      const files: Readonly<Record<string, string>> = { ...ROOT_FILES, 'styles/theme.css': '' };
      expect(findExportProblems(createTarball('foundry-ui', manifest, files), ['ng-package.json', 'styles/theme.css'])).toEqual([]);
    });

    it('requires a pattern export to map to a pattern', () => {
      const fixed: PackageManifest = { ...ROOT_ENTRY, exports: { ...ROOT_ENTRY.exports, './styles/*.css': './styles/theme.css' } };
      expect(findExportProblems(createTarball('foundry-ui', fixed, ROOT_FILES), ['ng-package.json'])).toEqual([
        'pattern export "./styles/*.css" must map to a pattern string',
      ]);
    });
  });
});
