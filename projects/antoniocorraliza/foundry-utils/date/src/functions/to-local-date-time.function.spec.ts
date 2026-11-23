import { describe, expect, inject, it } from 'vitest';
import { toLocalDateTime } from './to-local-date-time.function';

const timeZone: string = inject('expectedTimeZone');

describe('toLocalDateTime', () => {
  it('gives the local parts truncated to the minute', () => {
    expect(toLocalDateTime(new Date(2026, 10, 14, 9, 30, 59, 999))).toBe('2026-11-14T09:30');
  });

  it('gives the UTC parts when asked', () => {
    expect(toLocalDateTime(new Date('2026-11-14T09:30:59.999Z'), { timeZone: 'utc' })).toBe('2026-11-14T09:30');
  });

  it.runIf(timeZone === 'America/Santiago')('gives the same text for the two instants of a repeated time', () => {
    expect(toLocalDateTime(new Date('2026-04-05T02:30:00.000Z'))).toBe('2026-04-04T23:30');
    expect(toLocalDateTime(new Date('2026-04-05T03:30:00.000Z'))).toBe('2026-04-04T23:30');
  });

  it.runIf(timeZone === 'Europe/Madrid')('gives the same text for the two instants of a repeated time', () => {
    expect(toLocalDateTime(new Date('2026-10-25T00:30:00.000Z'))).toBe('2026-10-25T02:30');
    expect(toLocalDateTime(new Date('2026-10-25T01:30:00.000Z'))).toBe('2026-10-25T02:30');
  });
});
