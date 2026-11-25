import type { ParseBooleanOptionRequest } from '../interfaces/parse-boolean-option-request.interface';

/**
 * Returns the value of an option that takes a boolean, or its fallback when the option is missing.
 * @throws {TypeError} When the value is not a boolean.
 */
export function ɵparseBooleanOption(request: ParseBooleanOptionRequest): boolean {
  const value: unknown = request.options?.[request.name] ?? null;
  if (value === null) return request.fallback;
  if (typeof value !== 'boolean') throw new TypeError(`[foundry-utils]: the ${request.name} option must be a boolean, got ${typeof value}`);
  return value;
}
