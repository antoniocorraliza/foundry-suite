import { describe, expect, it } from 'vitest';
import { listTimesOfDay } from './list-times-of-day.function.ts';

describe('listTimesOfDay', () => {
  it('lists the 96 quarter hours of a day', () => {
    const times: Array<string> = listTimesOfDay(15);
    expect([times.length, times[0], times[1], times[95]]).toEqual([96, '00:00', '00:15', '23:45']);
  });

  it('lists every minute of a day', () => {
    const times: Array<string> = listTimesOfDay(1);
    expect([times.length, times[61], times[1439]]).toEqual([1440, '01:01', '23:59']);
  });
});
