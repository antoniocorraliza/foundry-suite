import type { CustomEquality } from '../types/custom-equality.type';

/** Returns the `customEquality` of some options, or `null` when there is none or it is not a function. */
export function readCustomEquality(options: unknown): CustomEquality | null {
  if (typeof options !== 'object' || options === null) return null;
  const customEquality: unknown = (options as Readonly<Record<string, unknown>>)['customEquality'];
  return typeof customEquality === 'function' ? (customEquality as CustomEquality) : null;
}
