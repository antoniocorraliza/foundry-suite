import type { ParseTextOptionRequest } from '../interfaces/parse-text-option-request.interface';

/**
 * Returns the value of an option that takes a text, or its fallback when the option is missing.
 * @throws {TypeError} When the value is not a text, or it is missing and has no fallback.
 */
export function ɵparseTextOption<Fallback extends string | null = string>(request: ParseTextOptionRequest<Fallback>): string | Fallback {
  const value: unknown = request.options?.[request.name] ?? null;
  if (value === null && request.fallback !== undefined) return request.fallback;
  if (typeof value === 'string') return value;
  throw new TypeError(`[foundry-utils]: the ${request.name} option must be a string, got ${value === null ? 'null' : typeof value}`);
}
