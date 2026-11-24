import type { NumberWriter } from '../interfaces/number-writer.interface';

/**
 * Writes a number with a number format, or returns its fallback when there is no finite number to write.
 * @throws {TypeError} When the value is not a number, `null` or `undefined`.
 */
export function writeNumber(value: unknown, writer: NumberWriter): string {
  if (value === null || value === undefined) return writer.fallback;
  if (typeof value !== 'number') throw new TypeError(`[foundry-utils]: the value to format must be a number, got ${typeof value}`);
  return Number.isFinite(value) ? writer.format.format(value) : writer.fallback;
}
