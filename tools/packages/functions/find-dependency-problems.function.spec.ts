import { describe, expect, it } from 'vitest';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import { createTarball } from './create-tarball.function.ts';
import { findDependencyProblems } from './find-dependency-problems.function.ts';

describe('findDependencyProblems', () => {
  it('accepts empty dependencies', () => {
    expect(findDependencyProblems(createTarball('foundry-utils', { dependencies: {} }))).toEqual([]);
  });

  it('reports dependencies, optional dependencies and bundled dependencies', () => {
    const manifest: PackageManifest = {
      dependencies: { tslib: '^2.8.0' },
      optionalDependencies: { fsevents: '*' },
      bundledDependencies: [],
    };
    expect(findDependencyProblems(createTarball('foundry-utils', manifest))).toEqual([
      '"dependencies" must be empty; it has: tslib',
      '"optionalDependencies" must not exist; it has: fsevents',
      '"bundleDependencies" must not exist',
    ]);
  });
});
