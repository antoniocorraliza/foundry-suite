import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';

/**
 * Turns the bytes of a CSV file into text, choosing the encoding from its first bytes with `'auto'`.
 * @throws {FoundryCsvParseError} When the bytes are not valid in the chosen encoding, or have zero bytes without a byte order mark.
 */
export function decodeCsvBytes(bytes: Uint8Array, encoding: FoundryTextEncoding): string {
  throw new Error('[foundry-utils]: decodeCsvBytes is not implemented yet');
}
