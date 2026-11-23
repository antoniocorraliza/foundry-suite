import { describe, expect, it } from 'vitest';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import { listPackageNotes } from './list-package-notes.function.ts';

function createTarball(files: ReadonlyArray<string>): Tarball {
  const foundryPackage: FoundryPackage = {
    folder: 'foundry-ui',
    name: '@antoniocorraliza/foundry-ui',
    peerDependencies: {},
    sideEffects: ['**/*.css'],
    nonEntryExports: ['./styles/*.css'],
    notices: [{ noticePath: 'styles/fonts/OFL.txt', description: 'fonts', whenTarballHas: /\.woff2$/, licenseId: 'OFL-1.1' }],
  } as unknown as FoundryPackage;
  return { foundryPackage, files: [...files], manifest: { exports: { './styles/*.css': './styles/*.css' } } } as unknown as Tarball;
}

describe('listPackageNotes', () => {
  it('counts the files of each pattern export and lists the notices that are not required yet', () => {
    expect(listPackageNotes(createTarball(['styles/tokens.css']), [])).toEqual([
      'exports: ./styles/*.css matches 1 file(s) in the tarball',
      'notices: styles/fonts/OFL.txt not required yet (nothing it covers is present)',
    ]);
  });

  it('leaves out a notice once something it covers is present', () => {
    expect(listPackageNotes(createTarball(['styles/fonts/inter.woff2']), [])).toEqual([
      'exports: ./styles/*.css matches 0 file(s) in the tarball',
    ]);
  });
});
