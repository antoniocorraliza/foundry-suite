import { describe, expect, it } from 'vitest';
import { createTarball } from './create-tarball.function.ts';
import { findNoticeProblems } from './find-notice-problems.function.ts';

describe('findNoticeProblems', () => {
  it('does not require a notice while nothing it covers is present', () => {
    expect(findNoticeProblems(createTarball('foundry-utils', {}), ['date/src/functions/parse-date.function.ts'])).toEqual([]);
  });

  it('requires the Unicode notice once the source has the CLDR table', () => {
    const sourceFiles: ReadonlyArray<string> = ['date/src/constants/first-day-of-week.cldr.constant.ts'];
    expect(findNoticeProblems(createTarball('foundry-utils', {}), sourceFiles)).toEqual([
      'UNICODE-LICENSE.txt is missing (Unicode license for the table derived from CLDR (getFirstDayOfWeek)); required because of date/src/constants/first-day-of-week.cldr.constant.ts',
    ]);
    expect(findNoticeProblems(createTarball('foundry-utils', {}, { 'UNICODE-LICENSE.txt': '' }), sourceFiles)).toEqual([]);
  });

  it('requires the font license once the tarball has a font', () => {
    expect(findNoticeProblems(createTarball('foundry-ui', {}, { 'styles/fonts/inter.woff2': '' }), [])).toEqual([
      'styles/fonts/OFL.txt is missing (SIL Open Font License of the bundled fonts (Inter and Urbanist)); required because of styles/fonts/inter.woff2',
    ]);
  });
});
