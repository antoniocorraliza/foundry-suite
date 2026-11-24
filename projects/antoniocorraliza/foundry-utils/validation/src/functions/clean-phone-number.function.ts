import { INTERNATIONAL_PHONE_PATTERN, LOCAL_PHONE_PATTERN, SPANISH_PHONE_PATTERN } from '../constants/validation-patterns.constant';

/** Returns a phone number without separators, or `null` when it is not a phone number with the generic rule or the one of the country. */
export function cleanPhoneNumber(value: unknown, country: 'ES' | null): string | null {
  if (typeof value !== 'string') return null;
  const compact: string = value.replace(/[\s.()-]/gu, '');
  const cleaned: string = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  if (country === 'ES') return SPANISH_PHONE_PATTERN.test(cleaned) ? cleaned : null;
  if (INTERNATIONAL_PHONE_PATTERN.test(cleaned)) return cleaned;
  return LOCAL_PHONE_PATTERN.test(cleaned) && /[1-9]/u.test(cleaned) ? cleaned : null;
}
