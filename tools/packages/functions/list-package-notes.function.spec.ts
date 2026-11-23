import { describe, expect, it } from 'vitest';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import { createTarball } from './create-tarball.function.ts';
import { listPackageNotes } from './list-package-notes.function.ts';

const STYLE_EXPORTS: PackageManifest = { exports: { './styles/*.css': './styles/*.css' } };

describe('listPackageNotes', () => {
  it('counts the files of each pattern export and lists the notices that are not required yet', () => {
    expect(listPackageNotes(createTarball('foundry-ui', STYLE_EXPORTS, { 'styles/tokens.css': '' }), [])).toEqual([
      'exports: ./styles/*.css matches 1 file(s) in the tarball',
      'notices: styles/fonts/OFL.txt not required yet (nothing it covers is present)',
    ]);
  });

  it('leaves out a notice once something it covers is present', () => {
    expect(listPackageNotes(createTarball('foundry-ui', STYLE_EXPORTS, { 'styles/fonts/inter.woff2': '' }), [])).toEqual([
      'exports: ./styles/*.css matches 0 file(s) in the tarball',
    ]);
  });
});
