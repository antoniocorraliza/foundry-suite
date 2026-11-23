import type { FoundryDuration } from '../interfaces/foundry-duration.interface';
import { splitDuration } from './split-duration.function';

/**
 * Writes a number of seconds as `'HH:mm:ss'`, with a minus sign when negative.
 * @throws {RangeError} When the number is not finite or is above `Number.MAX_SAFE_INTEGER`.
 */
export function formatDuration(totalSeconds: number): string {
  const duration: FoundryDuration = splitDuration(totalSeconds);
  const parts: Array<string> = [duration.hours, duration.minutes, duration.seconds].map((part) => String(part).padStart(2, '0'));
  return `${duration.sign < 0 ? '-' : ''}${parts.join(':')}`;
}
