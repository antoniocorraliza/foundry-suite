import { describe, expect, inject, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import { endOfDay } from './end-of-day.function';
import { parseDate } from './parse-date.function';
import { startOfDay } from './start-of-day.function';
import { toInstantRange } from './to-instant-range.function';

type FindStartOfDay = () => Date | null;

const timeZone: string = inject('expectedTimeZone');

const DAY_IN_MILLISECONDS: number = 86_400_000;

const STARTS_OF_SEPTEMBER_SIXTH: Readonly<Record<string, string>> = {
  'Europe/Madrid': '2026-09-05T22:00:00.000Z',
  'America/Mexico_City': '2026-09-06T06:00:00.000Z',
  'America/Santiago': '2026-09-06T04:00:00.000Z',
  UTC: '2026-09-06T00:00:00.000Z',
};

const ENDS_OF_APRIL_FOURTH: Readonly<Record<string, string>> = {
  'Europe/Madrid': '2026-04-04T21:59:59.999Z',
  'America/Mexico_City': '2026-04-05T05:59:59.999Z',
  'America/Santiago': '2026-04-05T03:59:59.999Z',
  UTC: '2026-04-04T23:59:59.999Z',
};

const STARTS_OF_SEPTEMBER_SIXTH_FINDERS: ReadonlyArray<[string, FindStartOfDay]> = [
  ['startOfDay', () => startOfDay(new Date(2026, 8, 6, 15, 30))],
  ['parseDate with an iso day', () => parseDate('2026-09-06')],
  ['parseDate with an eu day', () => parseDate('06/09/2026', { format: 'eu' })],
  ['parseDate with a us day', () => parseDate('09/06/2026', { format: 'us' })],
  ['parseDate with parts without hours', () => parseDate({ year: 2026, month: 9, day: 6 })],
  ['toInstantRange', () => toInstantRange('2026-09-06').start],
];

function listDaysBetweenYears(firstYear: number, lastYear: number): Array<string> {
  const first: number = Date.UTC(firstYear, 0, 1);
  const last: number = Date.UTC(lastYear, 11, 31);
  return Array.from({ length: (last - first) / DAY_IN_MILLISECONDS + 1 }, (_entry, index) =>
    new Date(first + index * DAY_IN_MILLISECONDS).toISOString().slice(0, 10),
  );
}

function isFirstInstantOfDay(date: Date, day: string): boolean {
  return readWallClock(date).startsWith(day) && !readWallClock(new Date(date.getTime() - 1)).startsWith(day);
}

describe('getStartOfLocalDay', () => {
  it.each(STARTS_OF_SEPTEMBER_SIXTH_FINDERS)('gives the first instant of the local day through %s', (_name, findStart) => {
    expect(findStart()?.toISOString()).toBe(STARTS_OF_SEPTEMBER_SIXTH[timeZone]);
  });

  it('gives the last instant of the local day through endOfDay, just before the next day starts', () => {
    expect(endOfDay(new Date(2026, 3, 4, 12)).toISOString()).toBe(ENDS_OF_APRIL_FOURTH[timeZone]);
  });

  it('ends a day one millisecond before the end of its instant range', () => {
    expect(endOfDay(new Date(2026, 3, 4, 12)).getTime()).toBe(toInstantRange('2026-04-04').endExclusive.getTime() - 1);
  });

  it('ends the last day of the range in its own year', () => {
    expect(readWallClock(endOfDay(new Date(9999, 11, 31, 12)))).toBe('9999-12-31T23:59:59.999');
  });

  it('agrees on the frontier between days through every function, every day from 2020 to 2030', () => {
    const mismatches: Array<string> = listDaysBetweenYears(2020, 2030).filter((day) => {
      const start: Date | null = parseDate(day);
      if (start === null || !isFirstInstantOfDay(start, day)) return true;
      const end: Date = endOfDay(start);
      const range: FoundryInstantRange = toInstantRange(day);
      return (
        startOfDay(new Date(end.getTime())).getTime() !== start.getTime() ||
        range.start.getTime() !== start.getTime() ||
        range.endExclusive.getTime() !== end.getTime() + 1 ||
        readWallClock(range.endExclusive).startsWith(day)
      );
    });
    expect(mismatches).toEqual([]);
  });
});
