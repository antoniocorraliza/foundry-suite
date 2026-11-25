import { MAX_TIMER_DELAY } from '../constants/max-timer-delay.constant';

/**
 * Checks that a delay is a number of milliseconds that `setTimeout` keeps; `label` names it in the error.
 * @throws {RangeError} When the delay is not an integer from 0 to `MAX_TIMER_DELAY`.
 */
export function checkTimerDelay(delay: number, label: string): void {
  if (Number.isInteger(delay) && delay >= 0 && delay <= MAX_TIMER_DELAY) return;
  throw new RangeError(`[foundry-utils]: the ${label} must be an integer from 0 to ${MAX_TIMER_DELAY}, got ${String(delay)}`);
}
