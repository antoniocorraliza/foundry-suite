import { describe, expect, it } from 'vitest';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import { createTarball } from './create-tarball.function.ts';
import { findManifestProblems } from './find-manifest-problems.function.ts';

const UTILS: PackageManifest = {
  name: '@antoniocorraliza/foundry-utils',
  type: 'module',
  engines: { node: '>=22.12.0' },
  sideEffects: false,
  repository: { url: 'git+https://github.com/antoniocorraliza/foundry-suite.git', directory: 'projects/antoniocorraliza/foundry-utils' },
};

describe('findManifestProblems', () => {
  it('accepts the expected manifest', () => {
    expect(findManifestProblems(createTarball('foundry-utils', UTILS))).toEqual([]);
  });

  it('reports each field that differs', () => {
    const manifest: PackageManifest = {
      ...UTILS,
      type: 'commonjs',
      engines: { node: '>=20' },
      sideEffects: true,
      repository: { url: 'x' },
    };
    expect(findManifestProblems(createTarball('foundry-utils', manifest))).toEqual([
      '"type" must be "module"',
      '"engines.node" must be ">=22.12.0"',
      '"sideEffects" is true, expected false',
      '"repository.url" must be "git+https://github.com/antoniocorraliza/foundry-suite.git"',
      '"repository.directory" must be "projects/antoniocorraliza/foundry-utils"',
    ]);
  });
});
