import { ɵisEmptyValue } from '@antoniocorraliza/foundry-utils';

/** Tells whether a value is not empty: not `null`, `undefined`, blank text, `NaN`, an invalid date or an empty collection. */
export function hasValue(value: unknown): boolean {
  return !ɵisEmptyValue(value, () => false);
}
