import { describe, expect, it } from 'vitest';
import type { GrownMeasurement } from '../interfaces/grown-measurement.interface.ts';
import { findChangelogProblems } from './find-changelog-problems.function.ts';

const CHANGELOG: string = 'projects/antoniocorraliza/foundry-utils/CHANGELOG.md';

describe('findChangelogProblems', () => {
  const grown: ReadonlyArray<GrownMeasurement> = [
    { name: 'utils/date: parseDate', mentions: ['@antoniocorraliza/foundry-utils/date'] },
    { name: 'utils: every entry', mentions: ['@antoniocorraliza/foundry-utils'] },
  ];

  it('accepts an added line that names the entry', () => {
    const addedLines: ReadonlyArray<string> = ['+- `@antoniocorraliza/foundry-utils/date`: parseDate reads week dates (+0.3 kB).'];
    expect(findChangelogProblems({ changelogPath: CHANGELOG, grown, addedLines })).toEqual([]);
  });

  it('asks for a line for every grown measurement that no line names', () => {
    expect(findChangelogProblems({ changelogPath: CHANGELOG, grown, addedLines: ['+- Fix a typo in the README.'] })).toEqual([
      `utils/date: parseDate grew: add a line to ${CHANGELOG} that names @antoniocorraliza/foundry-utils/date`,
      `utils: every entry grew: add a line to ${CHANGELOG} that names @antoniocorraliza/foundry-utils`,
    ]);
  });

  it('asks for nothing when nothing grew', () => {
    expect(findChangelogProblems({ changelogPath: CHANGELOG, grown: [], addedLines: [] })).toEqual([]);
  });
});
