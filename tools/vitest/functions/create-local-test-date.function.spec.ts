import { describe, expect, it } from 'vitest';
import { createLocalTestDate } from './create-local-test-date.function.ts';
import { readWallClock } from './read-wall-clock.function.ts';

describe('createLocalTestDate', () => {
  it('creates the local date of the day at noon', () => {
    expect(readWallClock(createLocalTestDate('2026-09-06'))).toBe('2026-09-06T12:00:00.000');
  });

  it('creates the local date of the day at the given time', () => {
    expect(readWallClock(createLocalTestDate('2026-11-14', 9, 30))).toBe('2026-11-14T09:30:00.000');
  });

  it('keeps the years 1 to 99 instead of moving them to 1900 and later', () => {
    expect(readWallClock(createLocalTestDate('0050-06-14', 0, 0))).toBe('0050-06-14T00:00:00.000');
  });
});
