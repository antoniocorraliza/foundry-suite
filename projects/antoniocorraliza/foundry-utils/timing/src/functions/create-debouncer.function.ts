import type { FoundryDebouncer } from '../interfaces/foundry-debouncer.interface';
import { checkTimerDelay } from './check-timer-delay.function';

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
  checkTimerDelay(waitInMilliseconds, 'wait of createDebouncer');
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
