import { ɵgetValueTag } from '@antoniocorraliza/foundry-utils';

/** Returns the time of a `Date` of any context, `NaN` for an invalid one, or `null` when the value is not a `Date`. */
export function readDateTime(value: unknown): number | null {
  if (ɵgetValueTag(value) !== '[object Date]') return null;
  try {
    return Date.prototype.getTime.call(value);
  } catch {
    return null;
  }
}
