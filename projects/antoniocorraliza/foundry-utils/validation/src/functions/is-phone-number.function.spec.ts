import { describe, expect, it } from 'vitest';
import { cleanPhoneNumber } from './clean-phone-number.function';
import { isPhoneNumber } from './is-phone-number.function';

describe('isPhoneNumber', () => {
  it('accepts and rejects numbers as cleanPhoneNumber reads them with the generic rule', () => {
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
    phoneNumbers.forEach((phoneNumber) => expect(isPhoneNumber(phoneNumber)).toBe(cleanPhoneNumber(phoneNumber, null) !== null));
  });

  it('uses the Spanish rule with the country option', () => {
    expect(isPhoneNumber('912345678', { country: 'ES' })).toBe(true);
    expect(isPhoneNumber('500000000', { country: 'ES' })).toBe(false);
    expect(isPhoneNumber('500000000')).toBe(true);
  });

  it.each<unknown>(['FR', 'es', 5, null])('uses the generic rule when the country is %j', (country) => {
    expect(isPhoneNumber('500000000', { country } as never)).toBe(true);
  });
});
