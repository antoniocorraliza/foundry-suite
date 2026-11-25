import { describe, expect, it } from 'vitest';
import { cleanPhoneNumber } from './clean-phone-number.function';
import { normalizePhoneNumber } from './normalize-phone-number.function';

describe('normalizePhoneNumber', () => {
  it('returns numbers as cleanPhoneNumber writes them with the generic rule, or null', () => {
    const phoneNumbers: ReadonlyArray<unknown> = [
      '+34 600 000 000',
      '+34 (600) 00-00-00',
      '0034 600 000 000',
      '600.000.000',
      '500 000 000',
      '000000000',
      '12',
      '',
      600000000,
      null,
    ];
    phoneNumbers.forEach((phoneNumber) => expect(normalizePhoneNumber(phoneNumber)).toBe(cleanPhoneNumber(phoneNumber, null)));
  });

  it('returns null for what is not a phone number', () => {
    expect(normalizePhoneNumber('000000000')).toBeNull();
    expect(normalizePhoneNumber('hola')).toBeNull();
    expect(normalizePhoneNumber(null)).toBeNull();
  });
});
