import type { ReadIntegerOptionRequest } from '../interfaces/read-integer-option-request.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes an integer within limits, or its fallback when it is missing or not such an integer. */
export function ɵreadIntegerOption<Fallback extends number | null>(request: ReadIntegerOptionRequest<Fallback>): number | Fallback {
  const value: unknown = ɵgetOwnDataValue(request.options, request.name);
  const maximum: number = request.maximum ?? Number.POSITIVE_INFINITY;
  return typeof value === 'number' && Number.isInteger(value) && value >= request.minimum && value <= maximum ? value : request.fallback;
}
