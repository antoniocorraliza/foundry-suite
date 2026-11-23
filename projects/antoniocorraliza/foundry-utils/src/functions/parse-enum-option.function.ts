import type { EnumOptionRequest } from '../interfaces/enum-option-request.interface';

/**
 * Returns the value of an option that takes one value of a closed list, or its fallback when the option is missing.
 * @throws {TypeError} When the value is not in the list.
 */
export function ɵparseEnumOption<Value extends string>(request: EnumOptionRequest<Value>): Value {
  const value: unknown = request.options?.[request.name] ?? request.fallback;
  const allowedValue: Value | undefined = request.allowedValues.find((allowed) => allowed === value);
  if (allowedValue === undefined) throw new TypeError(`[foundry-utils]: unknown ${request.name} option ${String(value)}`);
  return allowedValue;
}
