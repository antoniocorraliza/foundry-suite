import { describe, expect, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { parseCalendarDay } from './parse-calendar-day.function';
import { parseDate } from './parse-date.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

type ReadDay = (text: string, format: FoundryDateFormat) => string | null;

interface DayReader {
  readonly name: string;
  readonly read: ReadDay;
}

function addTimeAfterDate(text: string): string {
  return text.replace(/\S+/, (date) => `${date} 09:30`);
}

const READERS: ReadonlyArray<DayReader> = [
  {
    name: 'parseDate',
    read: (text, format) => {
      const date: Date | null = parseDate(text, { format });
      return date === null ? null : readWallClock(date).slice(0, 10);
    },
  },
  { name: 'parseCalendarDay', read: (text, format) => parseCalendarDay(text, { format }) },
  { name: 'parseLocalDateTime', read: (text, format) => parseLocalDateTime(addTimeAfterDate(text), { format })?.slice(0, 10) ?? null },
];

describe('readDateText', () => {
  describe.each(READERS)('through $name', ({ read }) => {
    it.each<[FoundryDateFormat, string, string]>([
      ['iso', '2026-03-01', '2026-03-01'],
      ['iso', '2024-02-29', '2024-02-29'],
      ['iso', '0001-01-01', '0001-01-01'],
      ['iso', '0050-01-01', '0050-01-01'],
      ['iso', '9999-12-31', '9999-12-31'],
      ['eu', '13/03/2026', '2026-03-13'],
      ['eu', '13-03-2026', '2026-03-13'],
      ['eu', '13.3.2026', '2026-03-13'],
      ['eu', '01/03/2026', '2026-03-01'],
      ['eu', '1/3/2026', '2026-03-01'],
      ['us', '03/01/2026', '2026-03-01'],
      ['us', '3-13-2026', '2026-03-13'],
      ['us', '03.13.2026', '2026-03-13'],
    ])('reads the %s text %j as %s', (format, text, expected) => {
      expect(read(text, format)).toBe(expected);
    });

    it.each<[FoundryDateFormat, string]>([
      ['iso', ' 2026-03-01'],
      ['iso', '2026-03-01\n'],
      ['iso', ' 2026-03-01 '],
      ['eu', '\t01/03/2026 '],
    ])('trims the spaces around the %s text %j', (format, text) => {
      expect(read(text, format)).toBe('2026-03-01');
    });

    it.each<[FoundryDateFormat, string]>([
      ['eu', '01/03-2026'],
      ['eu', '01.03/2026'],
      ['us', '03-01/2026'],
    ])('gives null for the %s text %j, whose separators differ', (format, text) => {
      expect(read(text, format)).toBeNull();
    });

    it.each<[FoundryDateFormat, string]>([
      ['iso', '2026-02-30'],
      ['iso', '2025-02-29'],
      ['iso', '2026-13-01'],
      ['iso', '2026-00-10'],
      ['iso', '0000-01-01'],
      ['eu', '31/04/2026'],
      ['eu', '29/02/2025'],
      ['us', '04/31/2026'],
    ])('gives null for the %s text %j, a day that does not exist', (format, text) => {
      expect(read(text, format)).toBeNull();
    });

    it.each<[FoundryDateFormat, string]>([
      ['iso', '26-03-01'],
      ['iso', '10000-01-01'],
      ['iso', '+2026-03-01'],
      ['iso', '-2026-03-01'],
      ['iso', '2026-3-1'],
      ['iso', '2026-003-01'],
      ['iso', '2026/03/01'],
      ['iso', '20260301'],
      ['eu', '01/03/26'],
      ['eu', '001/03/2026'],
      ['eu', '01/003/2026'],
      ['eu', '2026-03-01'],
      ['us', '13/01/2026'],
    ])('gives null for the %s text %j, which is outside the format', (format, text) => {
      expect(read(text, format)).toBeNull();
    });

    it.each(['', '   ', 'March 1, 2026', '2026-03-01 extra'])('gives null for %j', (text) => {
      expect(read(text, 'iso')).toBeNull();
    });
  });
});
