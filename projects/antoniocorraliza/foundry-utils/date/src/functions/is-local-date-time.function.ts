import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';
import { readLocalDateTime } from './read-local-date-time.function';

/** Tells whether a value is a canonical `'YYYY-MM-DDTHH:mm'` value. */
export function isLocalDateTime(value: unknown): value is FoundryLocalDateTime {
  return readLocalDateTime(value) !== null;
}
