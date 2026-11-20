import type { ɵValueKind } from '@antoniocorraliza/foundry-utils';
import { ɵgetOwnDataEntries, ɵgetValueKind, ɵgetValueTag } from '@antoniocorraliza/foundry-utils';
import type { CompareValues } from '../types/compare-values.type';
import type { CustomEquality } from '../types/custom-equality.type';
import { readMapSize } from './read-map-size.function';
import { readSetSize } from './read-set-size.function';

function getBytes(value: ArrayBuffer | ArrayBufferView): Uint8Array {
  return ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
}

function areBytesEqual(first: ArrayBuffer | ArrayBufferView, second: ArrayBuffer | ArrayBufferView): boolean {
  const firstBytes: Uint8Array = getBytes(first);
  const secondBytes: Uint8Array = getBytes(second);
  return firstBytes.length === secondBytes.length && firstBytes.every((byte, index) => byte === secondBytes[index]);
}

function getRegExpParts(value: object): string {
  const source: unknown = Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')?.get?.call(value);
  const flags: unknown = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')?.get?.call(value);
  return `${String(source)}/${String(flags)}`;
}

function areEntriesEqual(first: object, second: object, compare: CompareValues): boolean {
  const firstEntries: Array<[string, unknown]> = ɵgetOwnDataEntries(first);
  const secondValues: Map<string, unknown> = new Map<string, unknown>(ɵgetOwnDataEntries(second));
  return (
    firstEntries.length === secondValues.size &&
    firstEntries.every(([key, value]) => secondValues.has(key) && compare(value, secondValues.get(key)))
  );
}

function areSameKind(first: object, second: object, kind: ɵValueKind, compare: CompareValues): boolean {
  switch (kind) {
    case 'date':
      return Object.is(Date.prototype.getTime.call(first), Date.prototype.getTime.call(second));
    case 'regExp':
      return getRegExpParts(first) === getRegExpParts(second);
    case 'map': {
      if (readMapSize(first) !== readMapSize(second)) return false;
      const firstEntries: Array<[unknown, unknown]> = Array.from(Map.prototype.entries.call(first) as Iterable<[unknown, unknown]>);
      return firstEntries.every(
        ([key, value]) => Map.prototype.has.call(second, key) && compare(value, Map.prototype.get.call(second, key)),
      );
    }
    case 'set': {
      if (readSetSize(first) !== readSetSize(second)) return false;
      const firstItems: Array<unknown> = Array.from(Set.prototype.values.call(first) as Iterable<unknown>);
      return firstItems.every((item) => Set.prototype.has.call(second, item));
    }
    case 'arrayBuffer':
      return areBytesEqual(first as ArrayBuffer, second as ArrayBuffer);
    case 'view':
      return ɵgetValueTag(first) === ɵgetValueTag(second) && areBytesEqual(first as ArrayBufferView, second as ArrayBufferView);
    case 'array': {
      const firstItems: ReadonlyArray<unknown> = first as ReadonlyArray<unknown>;
      const secondItems: ReadonlyArray<unknown> = second as ReadonlyArray<unknown>;
      return firstItems.length === secondItems.length && Array.from(firstItems).every((item, index) => compare(item, secondItems[index]));
    }
    case 'plainObject':
      return areEntriesEqual(first, second, compare);
    default:
      return false;
  }
}

/** Compares two values in depth with the rules of `isDeepEqual`, asking the custom comparison first for every pair. */
export function areValuesEqual(first: unknown, second: unknown, customEquality: CustomEquality | null): boolean {
  const visited: WeakMap<object, WeakSet<object>> = new WeakMap<object, WeakSet<object>>();
  function compare(left: unknown, right: unknown): boolean {
    const isCustomEqual: boolean | undefined = customEquality?.(left, right);
    if (isCustomEqual !== undefined) return isCustomEqual;
    if (left === right || (Number.isNaN(left) && Number.isNaN(right))) return true;
    if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) return false;
    const kind: ɵValueKind = ɵgetValueKind(left);
    if (kind !== ɵgetValueKind(right)) return false;
    const seen: WeakSet<object> = visited.get(left) ?? new WeakSet<object>();
    if (seen.has(right)) return true;
    seen.add(right);
    visited.set(left, seen);
    return areSameKind(left, right, kind, compare);
  }
  return compare(first, second);
}
