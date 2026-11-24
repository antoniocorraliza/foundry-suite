import { ɵgetOwnDataValue } from '@antoniocorraliza/foundry-utils';
import type { CustomEquality } from '../types/custom-equality.type';

/** Returns the `customEquality` of some options, or `null` when there is none or it is not a function. */
export function readCustomEquality(options: unknown): CustomEquality | null {
  const customEquality: unknown = ɵgetOwnDataValue(options, 'customEquality');
  return typeof customEquality === 'function' ? (customEquality as CustomEquality) : null;
}
