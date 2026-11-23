import { afterEach, beforeEach, describe, expect, inject, it, vi } from 'vitest';
import { getTodayCalendarDay } from './get-today-calendar-day.function';

const timeZone: string = inject('expectedTimeZone');

const TODAY_AT_HALF_PAST_THREE_UTC: Readonly<Record<string, string>> = {
  'Europe/Madrid': '2026-09-06',
  'America/Mexico_City': '2026-09-05',
  'America/Santiago': '2026-09-05',
  UTC: '2026-09-06',
};

describe('getTodayCalendarDay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-06T03:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gives the local day of the clock', () => {
    expect(getTodayCalendarDay()).toBe(TODAY_AT_HALF_PAST_THREE_UTC[timeZone]);
  });

  it('gives the UTC day of the clock when asked, in every time zone', () => {
    expect(getTodayCalendarDay({ timeZone: 'utc' })).toBe('2026-09-06');
  });
});
