import { describe, expect, it } from 'vitest';
import { isPhoneNumber } from './is-phone-number.function';

describe('isPhoneNumber', () => {
  it('checks numbers with the shared cleaning of this entry', () => {
    expect(isPhoneNumber('+34 600 000 000')).toBe(true);
    expect(isPhoneNumber('600.000.000')).toBe(true);
    expect(isPhoneNumber('000000000')).toBe(false);
    expect(isPhoneNumber(600000000)).toBe(false);
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
