import { MAX_TIMER_DELAY } from '../constants/max-timer-delay.constant';
import type { FoundryDebouncer } from '../interfaces/foundry-debouncer.interface';

/**
 * Creates a debouncer with its own timer, which runs the callback `waitInMilliseconds` after the last `schedule`.
 * @throws {RangeError} When the wait is not an integer from 0 to 2147483647.
 * @throws {TypeError} When the callback is not a function.
 */
export function createDebouncer<Arguments extends ReadonlyArray<unknown>>(
  callback: (...args: Arguments) => void,
  waitInMilliseconds: number,
): FoundryDebouncer<Arguments> {
  if (typeof callback !== 'function') throw new TypeError('[foundry-utils]: the callback of createDebouncer must be a function');
  if (!Number.isInteger(waitInMilliseconds) || waitInMilliseconds < 0 || waitInMilliseconds > MAX_TIMER_DELAY) {
    throw new RangeError(
      `[foundry-utils]: the wait of createDebouncer must be an integer from 0 to 2147483647, got ${String(waitInMilliseconds)}`,
    );
  }
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArguments: Arguments | null = null;
  let isDisposed: boolean = false;
  const cancel: () => void = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    pendingArguments = null;
  };
  const flush: () => void = () => {
    const lastArguments: Arguments | null = pendingArguments;
    if (lastArguments === null) return;
    cancel();
    callback(...lastArguments);
  };
  const schedule: (...args: Arguments) => void = (...args) => {
    if (isDisposed) return;
    cancel();
    pendingArguments = args;
    timer = setTimeout(flush, waitInMilliseconds);
  };
  const dispose: () => void = () => {
    isDisposed = true;
    cancel();
  };
  const isPending: () => boolean = () => pendingArguments !== null;
  return { schedule, cancel, flush, dispose, isPending };
}
