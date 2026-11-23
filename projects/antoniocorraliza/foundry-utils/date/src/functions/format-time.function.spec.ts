import { describe, expect, it } from 'vitest';
import { formatTime } from './format-time.function';

describe('formatTime', () => {
  it('writes only the local time with seconds by default, without date or zone', () => {
    expect(formatTime(new Date(2026, 2, 1, 9, 30, 15, 42))).toBe('09:30:15');
  });

  it('writes the UTC time with a final Z in every time zone', () => {
    expect(formatTime(new Date('2026-03-01T08:30:15.042Z'), { timeZone: 'utc' })).toBe('08:30:15Z');
  });
});
