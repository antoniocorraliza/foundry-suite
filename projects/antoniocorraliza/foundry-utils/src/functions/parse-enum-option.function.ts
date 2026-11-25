import type { ParseEnumOptionRequest } from '../interfaces/parse-enum-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/**
 * Returns the value of an option that takes one value of a closed list, or its fallback when the option is missing.
 * A value inherited from a prototype, or behind a getter, counts as missing.
 * @throws {TypeError} When the value is not in the list, or it is missing and has no fallback.
 */
export function ɵparseEnumOption<Value extends string, Fallback extends Value | null = Value>(
  request: ParseEnumOptionRequest<Value, Fallback>,
): Value | Fallback {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name) ?? null;
  if (value === null && request.fallback !== undefined) return request.fallback;
  const allowedValue: Value | undefined = request.allowedValues.find((allowed) => allowed === value);
  if (allowedValue !== undefined) return allowedValue;
  throw new TypeError(
    `[foundry-utils]: the ${request.name} option must be one of ${request.allowedValues.join(', ')}, got ${String(value)}`,
  );
}
