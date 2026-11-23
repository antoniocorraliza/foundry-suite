import { describe, expect, inject, it } from 'vitest';
import { toLocalDateTime } from './to-local-date-time.function';

const timeZone: string = inject('expectedTimeZone');

const INSTANTS_OF_A_REPEATED_TIME: Readonly<Record<string, [string, string, string]>> = {
  'Europe/Madrid': ['2026-10-25T00:30:00.000Z', '2026-10-25T01:30:00.000Z', '2026-10-25T02:30'],
  'America/Santiago': ['2026-04-05T02:30:00.000Z', '2026-04-05T03:30:00.000Z', '2026-04-04T23:30'],
};

describe('toLocalDateTime', () => {
  it('gives the local parts truncated to the minute', () => {
    expect(toLocalDateTime(new Date(2026, 10, 14, 9, 30, 59, 999))).toBe('2026-11-14T09:30');
  });

  it('gives the UTC parts when asked', () => {
    expect(toLocalDateTime(new Date('2026-11-14T09:30:59.999Z'), { timeZone: 'utc' })).toBe('2026-11-14T09:30');
  });

  it.runIf(timeZone in INSTANTS_OF_A_REPEATED_TIME)('gives the same text for the two instants of a repeated time', () => {
    const [first, second, expected]: [string, string, string] = INSTANTS_OF_A_REPEATED_TIME[timeZone] ?? ['', '', ''];
    expect([toLocalDateTime(new Date(first)), toLocalDateTime(new Date(second))]).toEqual([expected, expected]);
  });
});
