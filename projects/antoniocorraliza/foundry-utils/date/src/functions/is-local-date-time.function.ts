import type { FoundryLocalDateTime } from '../types/foundry-local-date-time.type';

/** Tells whether a value is a canonical `'YYYY-MM-DDTHH:mm'` value. */
export function isLocalDateTime(value: unknown): value is FoundryLocalDateTime {
  throw new Error('[foundry-utils]: not implemented');
}
