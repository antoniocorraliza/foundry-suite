import type { ɵValueKind } from '@antoniocorraliza/foundry-utils';
import { ɵgetOwnDataEntries, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';

/** Tells whether a value is not empty: not `null`, `undefined`, blank text, `NaN`, an invalid date or an empty collection. */
export function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value !== 'object') return true;
  const kind: ɵValueKind = ɵgetValueKind(value);
  if (kind === 'array' || kind === 'plainObject') return ɵgetOwnDataEntries(value).length > 0;
  if (kind === 'date') return !Number.isNaN(Date.prototype.getTime.call(value));
  if (kind === 'map') return readCollectionSize(Map.prototype, value) > 0;
  if (kind === 'set') return readCollectionSize(Set.prototype, value) > 0;
  return true;
}

function readCollectionSize(prototype: object, collection: object): number {
  return Number(Object.getOwnPropertyDescriptor(prototype, 'size')?.get?.call(collection));
}
