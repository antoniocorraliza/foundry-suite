import { describe, expect, it } from 'vitest';
import { readWallClock } from './read-wall-clock.function.ts';

describe('readWallClock', () => {
  it('reads the local clock with milliseconds and without a time zone', () => {
    expect(readWallClock(new Date(2026, 8, 6, 9, 5, 7, 42))).toBe('2026-09-06T09:05:07.042');
  });

  it('writes years below 1000 with four digits', () => {
    const date: Date = new Date(2026, 0, 1, 10);
    date.setFullYear(50);
    expect(readWallClock(date)).toBe('0050-01-01T10:00:00.000');
  });
});
