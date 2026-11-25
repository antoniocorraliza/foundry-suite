import type { ParseBooleanOptionRequest } from '../interfaces/parse-boolean-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/**
 * Returns the value of an option that takes a boolean, or its fallback when the option is missing.
 * A value inherited from a prototype, or behind a getter, counts as missing.
 * @throws {TypeError} When the value is not a boolean.
 */
export function ɵparseBooleanOption(request: ParseBooleanOptionRequest): boolean {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name) ?? null;
  if (value === null) return request.fallback;
  if (typeof value !== 'boolean') throw new TypeError(`[foundry-utils]: the ${request.name} option must be a boolean, got ${typeof value}`);
  return value;
}
