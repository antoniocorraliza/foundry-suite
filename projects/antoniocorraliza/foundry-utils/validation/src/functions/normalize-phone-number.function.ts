import { cleanPhoneNumber } from './clean-phone-number.function';

/** Returns a phone number without spaces, dots, hyphens or brackets and with `+` for a leading `00`, or `null` when it is not one. */
export function normalizePhoneNumber(value: unknown): string | null {
  return cleanPhoneNumber(value, null);
}
