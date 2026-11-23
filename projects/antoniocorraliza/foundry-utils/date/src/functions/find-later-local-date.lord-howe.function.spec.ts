import { describe, expect, it } from 'vitest';
import { findInstantsWithWallClock } from '@foundry-test/functions/find-instants-with-wall-clock.function';
import { listClockChangeDays } from '@foundry-test/functions/list-clock-change-days.function';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { parseDate } from './parse-date.function';

function listQuarterHourTexts(day: string): Array<string> {
  return Array.from(
    { length: 96 },
    (_entry, index) => `${day}T${String(Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`,
  );
}

describe('findLaterLocalDate in a time zone whose clock moves back 30 minutes', () => {
  it('runs with an offset of 10 hours and a half after the clock moves back', () => {
    expect(new Date('2026-04-04T15:00:00.000Z').getTimezoneOffset()).toBe(-630);
  });

  it('gives the second reading of a time in the repeated half hour', () => {
    expect(localDateTimeToDate('2026-04-05T01:45')?.toISOString()).toBe('2026-04-04T14:45:00.000Z');
    expect(localDateTimeToDate('2026-04-05T01:45', { repeatedTime: 'later' })?.toISOString()).toBe('2026-04-04T15:15:00.000Z');
  });

  it.each([
    ['2026-04-05T01:29', '2026-04-04T14:29:00.000Z'],
    ['2026-04-05T02:00', '2026-04-04T15:30:00.000Z'],
  ])('gives the only instant of %s with both readings', (text, expected) => {
    expect(localDateTimeToDate(text)?.toISOString()).toBe(expected);
    expect(localDateTimeToDate(text, { repeatedTime: 'later' })?.toISOString()).toBe(expected);
  });

  it('gives null for a time in the skipped half hour with both readings', () => {
    expect(localDateTimeToDate('2026-10-04T02:15')).toBeNull();
    expect(localDateTimeToDate('2026-10-04T02:15', { repeatedTime: 'later' })).toBeNull();
    expect(localDateTimeToDate('2026-10-04T02:30')?.toISOString()).toBe('2026-10-03T15:30:00.000Z');
  });

  it('gives the first and the last instant of each written time, every quarter hour of the clock change days', () => {
    const mismatches: Array<string> = listClockChangeDays(2020, 2030)
      .flatMap(listQuarterHourTexts)
      .filter((text) => {
        const instants: Array<number> = findInstantsWithWallClock(text);
        return (
          (localDateTimeToDate(text)?.getTime() ?? null) !== (instants.at(0) ?? null) ||
          (localDateTimeToDate(text, { repeatedTime: 'later' })?.getTime() ?? null) !== (instants.at(-1) ?? null) ||
          (parseDate(text)?.getTime() ?? null) !== (instants.at(0) ?? null)
        );
      });
    expect(mismatches).toEqual([]);
  });
});
