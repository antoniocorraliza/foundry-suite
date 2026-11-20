import type { ɵFoundryValueKind } from '../types/value-kind.type';
import { ɵgetFoundryValueTag } from './get-value-tag.function';
import { ɵisFoundryPlainObject } from './is-plain-object.function';

function passesBrandCheck(check: () => unknown): boolean {
  try {
    check();
    return true;
  } catch {
    return false;
  }
}

function regExpSource(value: object): unknown {
  return Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')?.get?.call(value);
}

function arrayBufferLength(value: object): unknown {
  return Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength')?.get?.call(value);
}

function kindOfTaggedObject(value: object, tag: string): ɵFoundryValueKind {
  if (tag === '[object Date]') return passesBrandCheck(() => Date.prototype.getTime.call(value)) ? 'date' : 'other';
  if (tag === '[object RegExp]') return passesBrandCheck(() => regExpSource(value)) ? 'regExp' : 'other';
  if (tag === '[object Map]') return passesBrandCheck(() => Map.prototype.has.call(value, null)) ? 'map' : 'other';
  if (tag === '[object Set]') return passesBrandCheck(() => Set.prototype.has.call(value, null)) ? 'set' : 'other';
  if (tag === '[object ArrayBuffer]') return passesBrandCheck(() => arrayBufferLength(value)) ? 'arrayBuffer' : 'other';
  if (tag === '[object Blob]' || tag === '[object File]') return 'blob';
  if (tag === '[object Error]') return 'error';
  if (tag === '[object WeakMap]' || tag === '[object WeakSet]') return 'weakCollection';
  return 'other';
}

/**
 * Classifies a value by its tag and, for the types whose internal slots are read, by a brand check that a faked tag
 * cannot pass; for internal use of the entries.
 */
export function ɵgetFoundryValueKind(value: unknown): ɵFoundryValueKind {
  if (typeof value === 'function') return 'function';
  if (typeof value !== 'object' || value === null) return 'primitive';
  if (Array.isArray(value)) return 'array';
  if (ArrayBuffer.isView(value)) return 'view';
  if (ɵisFoundryPlainObject(value)) return 'plainObject';
  return kindOfTaggedObject(value, ɵgetFoundryValueTag(value));
}
