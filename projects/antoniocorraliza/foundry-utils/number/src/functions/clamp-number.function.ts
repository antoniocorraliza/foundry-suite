/**
 * Returns the value, or the nearest limit when it falls outside them.
 * @throws {RangeError} When the minimum is greater than the maximum, or an argument is `NaN`.
 * @throws {TypeError} When an argument is not a number.
 */
export function clampNumber(value: number, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || typeof minimum !== 'number' || typeof maximum !== 'number') {
    throw new TypeError('[foundry-utils]: the value and the limits of clampNumber must be numbers');
  }
  if (Number.isNaN(value) || Number.isNaN(minimum) || Number.isNaN(maximum)) {
    throw new RangeError('[foundry-utils]: the value and the limits of clampNumber must not be NaN');
  }
  if (minimum > maximum) throw new RangeError(`[foundry-utils]: the minimum ${minimum} is greater than the maximum ${maximum}`);
  return Math.min(Math.max(value, minimum), maximum);
}
