import { describe, expect, it } from 'vitest';
import { visitCivilDays } from '@foundry-test/functions/visit-civil-days.function';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { addCalendarDays } from './add-calendar-days.function';
import { compareCalendarDays } from './compare-calendar-days.function';
import { formatCalendarDay } from './format-calendar-day.function';
import { getCalendarDayParts } from './get-calendar-day-parts.function';
import { getCalendarDaysBetween } from './get-calendar-days-between.function';
import { isCalendarDay } from './is-calendar-day.function';
import { parseCalendarDay } from './parse-calendar-day.function';

const FORMATS: ReadonlyArray<FoundryDateFormat> = ['iso', 'eu', 'us'];

const MAXIMUM_MISMATCHES: number = 10;

function findDayMismatch(day: string, index: number, weekday: number, previousDay: string | null): string | null {
  if (!isCalendarDay(day) || parseCalendarDay(day) !== day) return `${day} is not read as canonical`;
  if (getCalendarDayParts(day).weekday !== weekday) return `${day} has another weekday`;
  if (getCalendarDaysBetween('0001-01-01', day) !== index || addCalendarDays('0001-01-01', index) !== day) {
    return `${day} has another index`;
  }
  if (previousDay !== null && (addCalendarDays(previousDay, 1) !== day || compareCalendarDays(previousDay, day) !== -1)) {
    return `${day} does not follow`;
  }
  const unreadFormat: FoundryDateFormat | undefined = FORMATS.find(
    (format) => parseCalendarDay(formatCalendarDay(day, { format }), { format }) !== day,
  );
  return unreadFormat === undefined ? null : `${day} does not come back in ${unreadFormat}`;
}

describe('readCalendarDay on every day of the range', () => {
  it('agrees with a reference that counts day by day, from 0001-01-01 to 9999-12-31, in every time zone', () => {
    const mismatches: Array<string> = [];
    let previousDay: string | null = null;
    visitCivilDays((day, index, weekday) => {
      if (mismatches.length >= MAXIMUM_MISMATCHES) return;
      const mismatch: string | null = findDayMismatch(day, index, weekday, previousDay);
      if (mismatch !== null) mismatches.push(mismatch);
      previousDay = day;
    });
    expect(mismatches).toEqual([]);
  });
});
