/**
 * Writes an integer with zeros on the left up to `length` digits, with the sign in front and without cutting longer numbers.
 * @throws {RangeError} When the value is not a safe integer or `length` is not an integer of at least 1.
 */
export function padNumber(value: number, length: number): string {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`[foundry-utils]: the value of padNumber must be a safe integer, got ${String(value)}`);
  }
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError(`[foundry-utils]: the length of padNumber must be an integer of at least 1, got ${String(length)}`);
  }
  const digits: string = String(Math.abs(value)).padStart(length, '0');
  return value < 0 ? `-${digits}` : digits;
}
