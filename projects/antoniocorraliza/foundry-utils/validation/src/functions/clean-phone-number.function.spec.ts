import { describe, expect, it } from 'vitest';
import { cleanPhoneNumber } from './clean-phone-number.function';

describe('cleanPhoneNumber', () => {
  it.each<[string, string]>([
    ['+34 (600) 00-00-00', '+34600000000'],
    ['0034 600 000 000', '+34600000000'],
    ['600 000 000', '600000000'],
    ['600.000.000', '600000000'],
    ['600-000-000', '600000000'],
    ['600 000 000', '600000000'],
    ['(600) 000 000', '600000000'],
  ])('removes spaces, dots, hyphens and brackets, and writes a leading 00 as a plus: %j', (text, cleaned) => {
    expect(cleanPhoneNumber(text, null)).toBe(cleaned);
  });

  it('accepts from 8 to 15 digits after a plus, not starting with 0', () => {
    expect(cleanPhoneNumber('+12345678', null)).toBe('+12345678');
    expect(cleanPhoneNumber('+123456789012345', null)).toBe('+123456789012345');
    expect(cleanPhoneNumber('+1234567', null)).toBeNull();
    expect(cleanPhoneNumber('+1234567890123456', null)).toBeNull();
    expect(cleanPhoneNumber('+0034600000000', null)).toBeNull();
  });

  it('accepts from 9 to 15 digits without a plus, not all of them zeros', () => {
    expect(cleanPhoneNumber('123456789', null)).toBe('123456789');
    expect(cleanPhoneNumber('123456789012345', null)).toBe('123456789012345');
    expect(cleanPhoneNumber('60000000', null)).toBeNull();
    expect(cleanPhoneNumber('1234567890123456', null)).toBeNull();
    expect(cleanPhoneNumber('000000000', null)).toBeNull();
    expect(cleanPhoneNumber('000 000 000', null)).toBeNull();
  });

  it.each<string>(['600 000 000 ext. 2', '600000000x', 'seiscientos', '600+000000', '++34600000000', '+', '', '   ', '600_000_000'])(
    'returns null for %j, which has other characters',
    (text) => {
      expect(cleanPhoneNumber(text, null)).toBeNull();
    },
  );

  it.each<[string, string]>([
    ['600 000 000', '600000000'],
    ['700000000', '700000000'],
    ['800000000', '800000000'],
    ['+34 912 345 678', '+34912345678'],
    ['0034600000000', '+34600000000'],
  ])('accepts %j as a Spanish number: 9 digits starting with 6, 7, 8 or 9, with an optional prefix', (text, cleaned) => {
    expect(cleanPhoneNumber(text, 'ES')).toBe(cleaned);
  });

  it.each<string>(['500000000', '+34 500 000 000', '+33 6 12 34 56 78', '6000000000', '60000000', '+34 60000000'])(
    'returns null for %j, which is not a Spanish number',
    (text) => {
      expect(cleanPhoneNumber(text, 'ES')).toBeNull();
    },
  );

  it.each<unknown>([600000000, null, undefined, ['600000000'], new String('600000000')])(
    'returns null for %j, which is not a string',
    (value) => {
      expect(cleanPhoneNumber(value, null)).toBeNull();
      expect(cleanPhoneNumber(value, 'ES')).toBeNull();
    },
  );
});
