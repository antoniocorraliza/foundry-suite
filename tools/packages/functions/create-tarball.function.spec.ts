import { describe, expect, it } from 'vitest';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import { createTarball } from './create-tarball.function.ts';

describe('createTarball', () => {
  it('uses the settings of the package, the manifest and the files of the contents in alphabetical order', () => {
    const tarball: Tarball = createTarball('foundry-ui', { name: 'x' }, { 'b.js': 'b', 'a.js': 'a' });
    expect([tarball.foundryPackage.name, tarball.manifest, tarball.files, tarball.contents.get('a.js')]).toEqual([
      '@antoniocorraliza/foundry-ui',
      { name: 'x' },
      ['a.js', 'b.js'],
      'a',
    ]);
  });
});
