import { ɵgetValueTag, ɵisOptionsValue } from '@antoniocorraliza/foundry-utils';
import { MAX_TIMER_DELAY } from '../constants/max-timer-delay.constant';

/**
 * Resolves after that many milliseconds, or rejects with `signal.reason` when the signal aborts. Every error comes as a rejected promise.
 * @throws {RangeError} When the milliseconds are not an integer from 0 to 2147483647.
 * @throws {TypeError} When the options or the signal are not valid.
 */
export async function sleep(milliseconds: number, options?: { readonly signal?: AbortSignal }): Promise<void> {
  if (!Number.isInteger(milliseconds) || milliseconds < 0 || milliseconds > MAX_TIMER_DELAY) {
    throw new RangeError(`[foundry-utils]: the milliseconds of sleep must be an integer from 0 to 2147483647, got ${String(milliseconds)}`);
  }
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of sleep must be an object');
  const signal: AbortSignal | null = readSignal(options);
  if (signal?.aborted) throw signal.reason;
  return new Promise((resolve, reject) => {
    const onAbort: () => void = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function readSignal(options: Readonly<Record<string, unknown>> | undefined): AbortSignal | null {
  const signal: unknown = options?.['signal'] ?? null;
  if (signal === null || ɵgetValueTag(signal) === '[object AbortSignal]') return signal as AbortSignal | null;
  throw new TypeError('[foundry-utils]: the signal option of sleep must be an AbortSignal');
}
