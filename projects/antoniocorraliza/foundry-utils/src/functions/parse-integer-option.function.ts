import type { ParseIntegerOptionRequest } from '../interfaces/parse-integer-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/**
 * Returns the value of an option that takes an integer within limits, or its fallback when the option is missing.
 * A value inherited from a prototype, or behind a getter, counts as missing.
 * @throws {TypeError} When the value is not a number, or it is missing and has no fallback.
 * @throws {RangeError} When the value is a number but not an integer within the limits.
 */
export function ɵparseIntegerOption<Fallback extends number | null = number>(
  request: ParseIntegerOptionRequest<Fallback>,
): number | Fallback {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name) ?? null;
  if (value === null && request.fallback !== undefined) return request.fallback;
  if (typeof value !== 'number') {
    throw new TypeError(`[foundry-utils]: the ${request.name} option must be a number, got ${value === null ? 'null' : typeof value}`);
  }
  const maximum: number = request.maximum ?? Number.POSITIVE_INFINITY;
  if (Number.isInteger(value) && value >= request.minimum && value <= maximum) return value;
  const limits: string = request.maximum === undefined ? `of at least ${request.minimum}` : `from ${request.minimum} to ${request.maximum}`;
  throw new RangeError(`[foundry-utils]: the ${request.name} option must be an integer ${limits}, got ${String(value)}`);
}
