import { ɵgetValueTag } from './get-value-tag.function';

/** Tells whether a value is an `ArrayBuffer`, of this context or another, by a brand check that a faked tag cannot pass. */
export function ɵisArrayBuffer(value: unknown): boolean {
  if (ɵgetValueTag(value) !== '[object ArrayBuffer]') return false;
  try {
    Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength')?.get?.call(value);
    return true;
  } catch {
    return false;
  }
}
