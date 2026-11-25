import { BLOB_TAGS } from '../constants/blob-tags.constant';
import type { ɵValueKind } from '../types/value-kind.type';
import { ɵgetValueTag } from './get-value-tag.function';
import { ɵisArrayBuffer } from './is-array-buffer.function';
import { ɵisPlainObject } from './is-plain-object.function';
import { ɵreadRegExpSource } from './read-reg-exp-source.function';

function isBrandCheckPassed(check: () => unknown): boolean {
  try {
    check();
    return true;
  } catch {
    return false;
  }
}

function getTaggedObjectKind(value: object, tag: string): ɵValueKind {
  if (tag === '[object Date]') return isBrandCheckPassed(() => Date.prototype.getTime.call(value)) ? 'date' : 'other';
  if (tag === '[object RegExp]') return isBrandCheckPassed(() => ɵreadRegExpSource(value)) ? 'regExp' : 'other';
  if (tag === '[object Map]') return isBrandCheckPassed(() => Map.prototype.has.call(value, null)) ? 'map' : 'other';
  if (tag === '[object Set]') return isBrandCheckPassed(() => Set.prototype.has.call(value, null)) ? 'set' : 'other';
  if (tag === '[object ArrayBuffer]') return ɵisArrayBuffer(value) ? 'arrayBuffer' : 'other';
  if (BLOB_TAGS.includes(tag)) return 'blob';
  if (tag === '[object Error]') return 'error';
  if (tag === '[object WeakMap]' || tag === '[object WeakSet]') return 'weakCollection';
  return 'other';
}

/**
 * Classifies a value by its tag and, for the types whose internal slots are read, by a brand check that a faked tag
 * cannot pass.
 */
export function ɵgetValueKind(value: unknown): ɵValueKind {
  if (typeof value === 'function') return 'function';
  if (typeof value !== 'object' || value === null) return 'primitive';
  if (Array.isArray(value)) return 'array';
  if (ArrayBuffer.isView(value)) return 'view';
  if (ɵisPlainObject(value)) return 'plainObject';
  return getTaggedObjectKind(value, ɵgetValueTag(value));
}
