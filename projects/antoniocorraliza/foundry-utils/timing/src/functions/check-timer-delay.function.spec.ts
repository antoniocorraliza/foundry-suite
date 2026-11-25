import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { MAX_TIMER_DELAY } from '../constants/max-timer-delay.constant';
import { checkTimerDelay } from './check-timer-delay.function';

describe('checkTimerDelay', () => {
  it.each<number>([0, 1, MAX_TIMER_DELAY])('accepts %d', (delay) => {
    expect(() => checkTimerDelay(delay, 'wait of a test')).not.toThrow();
  });

  it.each<number>([-1, 0.5, MAX_TIMER_DELAY + 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'throws a RangeError for %d that names the delay, its limits and the value',
    (delay) => {
      expect(catchError(() => checkTimerDelay(delay, 'wait of a test'), RangeError).message).toBe(
        `[foundry-utils]: the wait of a test must be an integer from 0 to 2147483647, got ${String(delay)}`,
      );
    },
  );
});
