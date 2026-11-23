import { describe, expect, it } from 'vitest';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import { endOfDay } from './end-of-day.function';
import { toInstantRange } from './to-instant-range.function';

describe('getStartOfLocalDay in a time zone that skips a whole day', () => {
  it('ends the day before the skipped day at its own last instant', () => {
    expect(endOfDay(new Date(2011, 11, 29, 10)).toISOString()).toBe('2011-12-30T09:59:59.999Z');
  });

  it('gives the skipped day an empty range that starts and ends when the next day starts', () => {
    const range: FoundryInstantRange = toInstantRange('2011-12-30');
    expect([range.start.toISOString(), range.endExclusive.toISOString()]).toEqual(['2011-12-30T10:00:00.000Z', '2011-12-30T10:00:00.000Z']);
  });

  it('gives a range across the skipped day without a gap', () => {
    const range: FoundryInstantRange = toInstantRange({ start: '2011-12-29', end: '2011-12-31' });
    expect([range.start.toISOString(), range.endExclusive.toISOString()]).toEqual(['2011-12-29T10:00:00.000Z', '2011-12-31T10:00:00.000Z']);
  });
});
