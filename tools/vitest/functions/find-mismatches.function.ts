import { MAXIMUM_MISMATCHES } from '../constants/maximum-mismatches.constant';
import type { FindMismatch } from '../types/find-mismatch.type.ts';

/** Checks the items in order and returns the mismatches found, stopping at the maximum so a broken walk still ends soon. */
export function findMismatches<T>(items: Iterable<T>, findMismatch: FindMismatch<T>, maximum: number = MAXIMUM_MISMATCHES): Array<string> {
  const mismatches: Array<string> = [];
  for (const item of items) {
    const mismatch: string | null = findMismatch(item);
    if (mismatch !== null) mismatches.push(mismatch);
    if (mismatches.length >= maximum) break;
  }
  return mismatches;
}
