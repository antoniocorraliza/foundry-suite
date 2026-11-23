import { describe, expect, it } from 'vitest';
import { findInstantsWithWallClock } from './find-instants-with-wall-clock.function.ts';

describe('findInstantsWithWallClock', () => {
  it('finds the one instant that shows the text in UTC', () => {
    expect(findInstantsWithWallClock('2026-10-25T02:30')).toEqual([Date.UTC(2026, 9, 25, 2, 30)]);
  });

  it('finds nothing for a time that does not exist', () => {
    expect(findInstantsWithWallClock('2026-02-30T10:00')).toEqual([]);
  });
});
