import { describe, expect, it } from 'vitest';
import { listInstantsOfYear } from './list-instants-of-year.function.ts';

describe('listInstantsOfYear', () => {
  it('starts at the first instant of the UTC year and adds the step and the drift each time', () => {
    const instants: Array<Date> = listInstantsOfYear(2026, 97, 1001);
    expect(instants.slice(0, 2).map((date) => date.toISOString())).toEqual(['2026-01-01T00:00:00.000Z', '2026-01-01T01:37:01.001Z']);
  });

  it('lists as many instants as steps fit in the year', () => {
    expect(listInstantsOfYear(2026, 433, 7)).toHaveLength(1213);
    expect(listInstantsOfYear(2024, 1440, 0)).toHaveLength(366);
  });
});
