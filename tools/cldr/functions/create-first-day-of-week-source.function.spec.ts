import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FIRST_DAY_OF_WEEK_PATH } from '../constants/cldr-settings.constant.ts';
import { createFirstDayOfWeekSource } from './create-first-day-of-week-source.function.ts';
import { readCldrVersion } from './read-cldr-version.function.ts';
import { readEngineFirstDay } from './read-engine-first-day.function.ts';

const FAKE_FIRST_DAYS: Readonly<Record<string, number>> = { US: 0, MX: 0, ES: 1, MV: 5, EG: 6, AE: 1 };

describe('createFirstDayOfWeekSource', () => {
  it('writes the regions whose week does not start on Monday, in alphabetical order, with their first day', () => {
    const source: string = createFirstDayOfWeekSource((region) => FAKE_FIRST_DAYS[region] ?? null, '48');
    expect(source).toContain('in CLDR 48.');
    expect(source.split('\n').slice(4, 8)).toEqual(['  EG: 6,', '  MV: 5,', '  MX: 0,', '  US: 0,']);
    expect(source.split('\n')[8]).toBe('};');
  });

  it('generates the table that is in the repository from the CLDR data of Node', () => {
    expect(createFirstDayOfWeekSource(readEngineFirstDay, readCldrVersion())).toBe(readFileSync(FIRST_DAY_OF_WEEK_PATH, 'utf8'));
  });
});
