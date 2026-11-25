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
  throw new Error('[foundry-utils]: not implemented');
}
