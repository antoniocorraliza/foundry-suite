import type { ReadBooleanOptionRequest } from '../interfaces/read-boolean-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes a boolean, or its fallback when it is missing or not a boolean. */
export function ɵreadBooleanOption(request: ReadBooleanOptionRequest): boolean {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name);
  return typeof value === 'boolean' ? value : request.fallback;
}
