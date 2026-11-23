import { describe, expect, inject, it } from 'vitest';
import { findInstantsWithWallClock } from '@foundry-test/functions/find-instants-with-wall-clock.function';
import { listClockChangeDays } from '@foundry-test/functions/list-clock-change-days.function';
import { listTimesOfDay } from '@foundry-test/functions/list-times-of-day.function';
import { localDateTimeToDate } from './local-date-time-to-date.function';

const timeZone: string = inject('expectedTimeZone');

function isRepeatedTime(text: string): boolean {
  return localDateTimeToDate(text, { repeatedTime: 'later' })?.getTime() !== localDateTimeToDate(text)?.getTime();
}

describe('findLaterLocalDate', () => {
  it.runIf(timeZone !== 'UTC')('finds clock change days to walk in a time zone that moves its clock', () => {
    expect(listClockChangeDays(2020, 2030)).not.toEqual([]);
  });

  describe('through localDateTimeToDate with the later reading', () => {
    it('gives the last instant with the written time, every quarter hour of the clock change days', () => {
      const mismatches: Array<string> = [...listClockChangeDays(2020, 2030), '2026-11-14']
        .flatMap((day) => listTimesOfDay(15).map((time) => `${day}T${time}`))
        .filter(
          (text) =>
            (localDateTimeToDate(text, { repeatedTime: 'later' })?.getTime() ?? null) !== (findInstantsWithWallClock(text).at(-1) ?? null),
        );
      expect(mismatches).toEqual([]);
    });

    it('gives the same instant as the earlier reading when the time does not repeat', () => {
      expect(localDateTimeToDate('2026-11-14T09:30', { repeatedTime: 'later' })?.getTime()).toBe(
        localDateTimeToDate('2026-11-14T09:30')?.getTime(),
      );
    });

    it('reads the time as UTC with the later reading too', () => {
      expect(localDateTimeToDate('2026-10-25T02:30', { timeZone: 'utc', repeatedTime: 'later' })?.toISOString()).toBe(
        '2026-10-25T02:30:00.000Z',
      );
    });

    describe.runIf(timeZone === 'Europe/Madrid')('in a time zone that moves the clock back at 03:00', () => {
      it('gives the second 02:30 of the night the clock moves back', () => {
        expect(localDateTimeToDate('2026-10-25T02:30', { repeatedTime: 'later' })?.toISOString()).toBe('2026-10-25T01:30:00.000Z');
      });

      it('gives the only 03:00 with both readings', () => {
        expect(localDateTimeToDate('2026-10-25T03:00', { repeatedTime: 'later' })?.toISOString()).toBe('2026-10-25T02:00:00.000Z');
      });

      it('gives null for a skipped time with the later reading too', () => {
        expect(localDateTimeToDate('2026-03-29T02:30', { repeatedTime: 'later' })).toBeNull();
      });

      it('lets an app tell a repeated time by comparing the earlier and the later readings', () => {
        expect(isRepeatedTime('2026-10-25T02:30')).toBe(true);
        expect(isRepeatedTime('2026-10-25T03:30')).toBe(false);
      });
    });

    describe.runIf(timeZone === 'America/Santiago')('in a time zone that moves the clock back at midnight', () => {
      it('gives the second 23:30 of the night the clock moves back', () => {
        expect(localDateTimeToDate('2026-04-04T23:30', { repeatedTime: 'later' })?.toISOString()).toBe('2026-04-05T03:30:00.000Z');
      });

      it('gives the only 22:59 with both readings', () => {
        expect(localDateTimeToDate('2026-04-04T22:59', { repeatedTime: 'later' })?.toISOString()).toBe('2026-04-05T01:59:00.000Z');
      });

      it('gives null for a skipped time with the later reading too', () => {
        expect(localDateTimeToDate('2026-09-06T00:30', { repeatedTime: 'later' })).toBeNull();
      });
    });

    describe.runIf(timeZone === 'UTC')('in UTC, where no time repeats', () => {
      it('lets an app see, by comparing both readings, that no time repeats', () => {
        expect(isRepeatedTime('2026-10-25T02:30')).toBe(false);
        expect(localDateTimeToDate('2026-10-25T02:30', { repeatedTime: 'later' })?.toISOString()).toBe('2026-10-25T02:30:00.000Z');
      });
    });
  });
});
