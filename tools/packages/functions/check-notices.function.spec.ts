import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOUNDRY_PACKAGES } from '../constants/foundry-packages.constant.ts';
import type { FoundryPackage } from '../interfaces/foundry-package.interface.ts';
import type { FoundryPackageFolder } from '../interfaces/foundry-package-folder.type.ts';
import type { PackageManifest } from '../interfaces/package-manifest.interface.ts';
import type { Tarball } from '../interfaces/tarball.interface.ts';
import { checkNotices } from './check-notices.function.ts';

function tarballOf(folder: FoundryPackageFolder, manifest: PackageManifest, contents: Readonly<Record<string, string>> = {}): Tarball {
  const foundryPackage: FoundryPackage | undefined = FOUNDRY_PACKAGES.find((candidate) => candidate.folder === folder);
  if (foundryPackage === undefined) throw new Error(`[spec]: unknown package folder ${folder}`);
  return { foundryPackage, files: Object.keys(contents).sort(), contents: new Map(Object.entries(contents)), manifest };
}

describe('checkNotices', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('does not require a notice while nothing it covers is present', () => {
    expect(checkNotices(tarballOf('foundry-utils', {}), ['date/src/functions/parse-date.function.ts'])).toEqual([]);
  });

  it('requires the Unicode notice once the source has the CLDR table', () => {
    const sourceFiles: ReadonlyArray<string> = ['date/src/constants/first-day-of-week.cldr.constant.ts'];
    expect(checkNotices(tarballOf('foundry-utils', {}), sourceFiles)).toEqual([
      'UNICODE-LICENSE.txt is missing (Unicode license for the table derived from CLDR (getFirstDayOfWeek)); required because of date/src/constants/first-day-of-week.cldr.constant.ts',
    ]);
    expect(checkNotices(tarballOf('foundry-utils', {}, { 'UNICODE-LICENSE.txt': '' }), sourceFiles)).toEqual([]);
  });

  it('requires the font license once the tarball has a font', () => {
    expect(checkNotices(tarballOf('foundry-ui', {}, { 'styles/fonts/inter.woff2': '' }), [])).toEqual([
      'styles/fonts/OFL.txt is missing (SIL Open Font License of the bundled fonts (Inter and Urbanist)); required because of styles/fonts/inter.woff2',
    ]);
  });
});
