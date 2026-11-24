import type { NumberWriter } from '../interfaces/number-writer.interface';

/**
 * Writes a number with a number format, or returns its fallback when there is no finite number to write.
 * @throws {TypeError} When the value is not a number, `null` or `undefined`.
 */
export function writeNumber(value: unknown, writer: NumberWriter): string {
  throw new Error('[foundry-utils]: not implemented yet');
}
