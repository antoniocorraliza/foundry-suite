import type { BooleanOptionRequest } from '../interfaces/boolean-option-request.interface';

/**
 * Returns the value of an option that takes a boolean, or its fallback when the option is missing.
 * @throws {TypeError} When the value is not a boolean.
 */
export function ɵparseBooleanOption(request: BooleanOptionRequest): boolean {
  const value: unknown = request.options?.[request.name] ?? request.fallback;
  if (typeof value !== 'boolean') {
    throw new TypeError(`[foundry-utils]: the ${request.name} option must be a boolean, got ${String(value)}`);
  }
  return value;
}
