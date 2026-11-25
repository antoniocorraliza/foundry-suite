import { readRandomBytes } from './read-random-bytes.function';

function applyVersionAndVariant(byte: number, index: number): number {
  if (index === 6) return (byte & 0x0f) | 0x40;
  if (index === 8) return (byte & 0x3f) | 0x80;
  return byte;
}

/**
 * Returns a random version 4 UUID in lowercase, from `crypto.randomUUID`, or built with `crypto.getRandomValues` when it is missing.
 * @throws {FoundryCryptoUnavailableError} When `crypto` or `crypto.getRandomValues` is missing.
 */
export function createUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const hex: string = Array.from(readRandomBytes(16), (byte, index) =>
    applyVersionAndVariant(byte, index).toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
