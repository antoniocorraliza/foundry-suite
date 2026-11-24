import type { TextOptionRequest } from '../interfaces/text-option-request.interface';

/**
 * Returns the value of an option that takes a text, or its fallback when the option is missing.
 * @throws {TypeError} When the value is not a text, or it is missing and has no fallback.
 */
export function ɵparseTextOption<Fallback extends string | null = string>(request: TextOptionRequest<Fallback>): string | Fallback {
  throw new Error(`[foundry-utils]: not implemented yet: ${request.name}`);
}
