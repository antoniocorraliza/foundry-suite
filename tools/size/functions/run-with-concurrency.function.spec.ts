import { describe, expect, it } from 'vitest';
import { runWithConcurrency } from './run-with-concurrency.function.ts';

describe('runWithConcurrency', () => {
  it('keeps the order of the results and never runs more tasks at once than the limit', async () => {
    let running: number = 0;
    let highest: number = 0;
    const tasks: Array<() => Promise<number>> = [30, 10, 20, 0].map((delay, index) => async () => {
      running += 1;
      highest = Math.max(highest, running);
      await new Promise((resolve) => setTimeout(resolve, delay));
      running -= 1;
      return index;
    });
    expect(await runWithConcurrency(tasks, 2)).toEqual([0, 1, 2, 3]);
    expect(highest).toBe(2);
  });

  it('returns an empty list for no tasks', async () => {
    expect(await runWithConcurrency([], 4)).toEqual([]);
  });
});
