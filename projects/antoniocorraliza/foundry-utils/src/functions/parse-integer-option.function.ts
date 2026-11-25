import type { ParseIntegerOptionRequest } from '../interfaces/parse-integer-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/**
 * Returns the value of an option that takes an integer within limits, or its fallback when the option is missing.
 * A value inherited from a prototype, or behind a getter, counts as missing.
 * @throws {RangeError} When the value is not an integer within the limits, or it is missing and has no fallback.
 */
export function ɵparseIntegerOption<Fallback extends number | null = number>(
  request: ParseIntegerOptionRequest<Fallback>,
): number | Fallback {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name) ?? null;
  if (value === null && request.fallback !== undefined) return request.fallback;
  const maximum: number = request.maximum ?? Number.POSITIVE_INFINITY;
  if (typeof value === 'number' && Number.isInteger(value) && value >= request.minimum && value <= maximum) return value;
  const limits: string = request.maximum === undefined ? `of at least ${request.minimum}` : `from ${request.minimum} to ${request.maximum}`;
  throw new RangeError(`[foundry-utils]: the ${request.name} option must be an integer ${limits}, got ${String(value)}`);
}
