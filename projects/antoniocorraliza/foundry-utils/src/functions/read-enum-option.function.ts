import type { ReadEnumOptionRequest } from '../interfaces/read-enum-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes one value of a closed list, or its fallback when it is missing or not in the list. */
export function ɵreadEnumOption<Value extends string, Fallback extends Value | null>(
  request: ReadEnumOptionRequest<Value, Fallback>,
): Value | Fallback {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name);
  return request.allowedValues.find((allowed) => allowed === value) ?? request.fallback;
}
