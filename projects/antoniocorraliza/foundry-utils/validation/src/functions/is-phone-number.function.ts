import { ɵreadEnumOption } from '@antoniocorraliza/foundry-utils';
import { PHONE_COUNTRIES } from '../constants/phone-countries.constant';
import { cleanPhoneNumber } from './clean-phone-number.function';

/** Tells whether a value is a phone number, with the generic rule or the one of a country. */
export function isPhoneNumber(value: unknown, options?: { readonly country?: 'ES' }): boolean {
  return cleanPhoneNumber(value, ɵreadEnumOption({ options, name: 'country', allowedValues: PHONE_COUNTRIES, fallback: null })) !== null;
}
