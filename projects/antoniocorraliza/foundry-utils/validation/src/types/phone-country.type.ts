import type { PHONE_COUNTRIES } from '../constants/phone-countries.constant';

/** Country whose rule `isPhoneNumber` applies. */
export type PhoneCountry = (typeof PHONE_COUNTRIES)[number];
