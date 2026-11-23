import { describe, expect, it } from 'vitest';
import { listDaysOfYears } from './list-days-of-years.function.ts';

describe('listDaysOfYears', () => {
  it('lists every day of the years, both included, with the leap days', () => {
    const days: Array<string> = listDaysOfYears(2020, 2021);
    expect([days.length, days[0], days[59], days.at(-1)]).toEqual([731, '2020-01-01', '2020-02-29', '2021-12-31']);
  });

  it('lists the days of a single year', () => {
    expect(listDaysOfYears(2026, 2026)).toHaveLength(365);
  });
});
