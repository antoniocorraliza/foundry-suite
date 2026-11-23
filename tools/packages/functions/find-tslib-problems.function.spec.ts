import { describe, expect, it } from 'vitest';
import { createTarball } from './create-tarball.function.ts';
import { findTslibProblems } from './find-tslib-problems.function.ts';

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
