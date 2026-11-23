import { describe, expect, it } from 'vitest';
import { listClockChangeDays } from './list-clock-change-days.function.ts';

describe('listClockChangeDays', () => {
  it('lists no day in a time zone whose offset never changes', () => {
    expect(listClockChangeDays(2020, 2030)).toEqual([]);
  });
});
