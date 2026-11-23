import { describe, expect, it } from 'vitest';
import { runWithoutWeekData } from './run-without-week-data.function.ts';

function hasWeekData(): boolean {
  return 'weekInfo' in Intl.Locale.prototype || 'getWeekInfo' in Intl.Locale.prototype;
}

describe('runWithoutWeekData', () => {
  it('removes the week data of the engine during the action and returns what it returns', () => {
    expect(runWithoutWeekData(() => hasWeekData())).toBe(false);
  });

  it('restores the week data after the action, also when it throws', () => {
    const hasWeekDataBefore: boolean = hasWeekData();
    expect(() =>
      runWithoutWeekData(() => {
        throw new Error('[test]: failure');
      }),
    ).toThrow();
    expect(hasWeekData()).toBe(hasWeekDataBefore);
  });
});
