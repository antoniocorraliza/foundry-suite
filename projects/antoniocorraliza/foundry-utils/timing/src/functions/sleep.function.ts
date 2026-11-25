/**
 * Resolves after that many milliseconds, or rejects with `signal.reason` when the signal aborts. Every error comes as a rejected promise.
 * @throws {RangeError} When the milliseconds are not an integer from 0 to 2147483647.
 * @throws {TypeError} When the options or the signal are not valid.
 */
export function sleep(milliseconds: number, options?: { readonly signal?: AbortSignal }): Promise<void> {
  throw new Error('[foundry-utils]: not implemented');
}
