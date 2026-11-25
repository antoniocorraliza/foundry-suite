import { MAX_ARRAY_INDEX } from '../constants/max-array-index.constant';

/** Tells whether a property key is an index of an array: a decimal integer without leading zeros, up to 2 ** 32 - 2. */
export function ɵisArrayIndex(key: string): boolean {
  return /^(?:0|[1-9]\d*)$/u.test(key) && Number(key) <= MAX_ARRAY_INDEX;
}
