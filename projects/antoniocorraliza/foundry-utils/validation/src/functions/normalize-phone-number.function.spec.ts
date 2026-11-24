import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber } from './normalize-phone-number.function';

describe('normalizePhoneNumber', () => {
  it('returns numbers as the shared cleaning of this entry writes them, with the generic rule', () => {
    expect(normalizePhoneNumber('+34 (600) 00-00-00')).toBe('+34600000000');
    expect(normalizePhoneNumber('0034 600 000 000')).toBe('+34600000000');
    expect(normalizePhoneNumber('600 000 000')).toBe('600000000');
    expect(normalizePhoneNumber('500 000 000')).toBe('500000000');
  });

  it('returns null for what is not a phone number', () => {
    expect(normalizePhoneNumber('000000000')).toBeNull();
    expect(normalizePhoneNumber('hola')).toBeNull();
    expect(normalizePhoneNumber(null)).toBeNull();
  });
});
