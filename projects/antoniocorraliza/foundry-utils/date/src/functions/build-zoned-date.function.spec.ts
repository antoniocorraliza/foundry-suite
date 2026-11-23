import { describe, expect, inject, it } from 'vitest';
import { findInstantsWithWallClock } from '@foundry-test/functions/find-instants-with-wall-clock.function';
import { listClockChangeDays } from '@foundry-test/functions/list-clock-change-days.function';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { parseDate } from './parse-date.function';

type BuildLocalDate = (text: string) => Date | null;

interface LocalDateBuilder {
  readonly name: string;
  readonly build: BuildLocalDate;
  readonly buildInUtc: BuildLocalDate;
}

const timeZone: string = inject('expectedTimeZone');

function readParts(text: string): FoundryDateParts {
  const [year, month, day, hours, minutes]: Array<number> = text.split(/[-T:]/).map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0, hours: hours ?? 0, minutes: minutes ?? 0 };
}

const BUILDERS: ReadonlyArray<LocalDateBuilder> = [
  { name: 'parseDate with a text', build: (text) => parseDate(text), buildInUtc: (text) => parseDate(text, { timeZone: 'utc' }) },
  {
    name: 'parseDate with parts',
    build: (text) => parseDate(readParts(text)),
    buildInUtc: (text) => parseDate(readParts(text), { timeZone: 'utc' }),
  },
  {
    name: 'localDateTimeToDate',
    build: (text) => localDateTimeToDate(text),
    buildInUtc: (text) => localDateTimeToDate(text, { timeZone: 'utc' }),
  },
];

function listTimesOfDay(stepInMinutes: number): Array<string> {
  return Array.from({ length: 1440 / stepInMinutes }, (_entry, index) => index * stepInMinutes).map(
    (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
  );
}

function listCheckedDays(): Array<string> {
  return [...new Set<string>([...listClockChangeDays(2020, 2030), '2026-09-06'])];
}

function findFirstInstantWithWallClock(text: string): number | null {
  const instants: Array<number> = findInstantsWithWallClock(text);
  return instants.length === 0 ? null : Math.min(...instants);
}

describe('buildZonedDate', () => {
  describe.each(BUILDERS)('through $name', ({ build, buildInUtc }) => {
    it('builds the written local time', () => {
      const date: Date | null = build('2026-11-14T09:30');
      expect(date === null ? null : readWallClock(date)).toBe('2026-11-14T09:30:00.000');
    });

    it('builds the years 1 to 99 as those years, never as 1900 and later', () => {
      const date: Date | null = build('0050-01-01T10:00');
      expect(date === null ? null : readWallClock(date)).toBe('0050-01-01T10:00:00.000');
    });

    it('builds the written time as UTC when asked, in every time zone', () => {
      expect(buildInUtc('2026-09-06T00:00')?.toISOString()).toBe('2026-09-06T00:00:00.000Z');
      expect(buildInUtc('2026-03-29T02:30')?.toISOString()).toBe('2026-03-29T02:30:00.000Z');
      expect(buildInUtc('0050-01-01T10:00')?.toISOString()).toBe('0050-01-01T10:00:00.000Z');
    });

    it('gives null for a written time the clock skips and the first instant for a repeated one, every quarter hour of the clock change days', () => {
      const mismatches: Array<string> = listCheckedDays()
        .flatMap((day) => listTimesOfDay(15).map((time) => `${day}T${time}`))
        .filter((text) => (build(text)?.getTime() ?? null) !== findFirstInstantWithWallClock(text));
      expect(mismatches).toEqual([]);
    });

    describe.runIf(timeZone === 'Europe/Madrid')('in a time zone that moves the clock at 02:00', () => {
      it.each(['2026-03-29T02:00', '2026-03-29T02:30', '2026-03-29T02:59'])('gives null for %s, which the clock skips', (text) => {
        expect(build(text)).toBeNull();
      });

      it.each([
        ['2026-03-29T01:59', '2026-03-29T00:59:00.000Z'],
        ['2026-03-29T03:00', '2026-03-29T01:00:00.000Z'],
        ['2026-10-25T02:30', '2026-10-25T00:30:00.000Z'],
        ['2026-10-25T03:00', '2026-10-25T02:00:00.000Z'],
      ])('builds %s as %s, the first one when the time repeats', (text, expected) => {
        expect(build(text)?.toISOString()).toBe(expected);
      });
    });

    describe.runIf(timeZone === 'America/Santiago')('in a time zone whose clock skips midnight', () => {
      it.each(['2026-09-06T00:00', '2026-09-06T00:30', '2026-09-06T00:59'])('gives null for %s, which the clock skips', (text) => {
        expect(build(text)).toBeNull();
      });

      it.each([
        ['2026-09-06T01:00', '2026-09-06T04:00:00.000Z'],
        ['2026-04-04T22:59', '2026-04-05T01:59:00.000Z'],
        ['2026-04-04T23:30', '2026-04-05T02:30:00.000Z'],
        ['2026-04-05T00:00', '2026-04-05T04:00:00.000Z'],
      ])('builds %s as %s, the first one when the time repeats', (text, expected) => {
        expect(build(text)?.toISOString()).toBe(expected);
      });
    });

    describe.runIf(timeZone === 'UTC')('in UTC, where no time is skipped or repeated', () => {
      it.each(['2026-03-29T02:30', '2026-10-25T02:30', '2026-09-06T00:00'])('builds %s as that instant', (text) => {
        expect(build(text)?.toISOString()).toBe(`${text}:00.000Z`);
      });
    });
  });

  it('gives the same instant, or null in both, through parseDate and localDateTimeToDate, every minute of the clock change days', () => {
    const mismatches: Array<string> = listCheckedDays()
      .flatMap((day) => listTimesOfDay(1).map((time) => `${day}T${time}`))
      .filter(
        (text) =>
          parseDate(text)?.getTime() !== localDateTimeToDate(text)?.getTime() ||
          parseDate(text, { timeZone: 'utc' })?.getTime() !== localDateTimeToDate(text, { timeZone: 'utc' })?.getTime(),
      );
    expect(mismatches).toEqual([]);
  });
});
