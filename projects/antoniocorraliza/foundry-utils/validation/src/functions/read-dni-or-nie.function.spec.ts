import { describe, expect, it } from 'vitest';
import { readDniOrNie } from './read-dni-or-nie.function';

const BOTH: ReadonlyArray<'dni' | 'nie'> = ['dni', 'nie'];

describe('readDniOrNie', () => {
  it.each<string>(['12345678Z', '12345678-Z', '12.345.678-Z', ' 12345678Z ', '12 345 678 Z', '12345678z'])(
    'reads %j, with separators or in lower case, as a DNI',
    (text) => {
      expect(readDniOrNie(text, BOTH)).toBe('12345678Z');
    },
  );

  it.each<[string, string]>([
    ['X1234567L', 'X1234567L'],
    ['x1234567l', 'X1234567L'],
    ['x-1234567-l', 'X1234567L'],
    ['X0000000T', 'X0000000T'],
    ['Y0000000Z', 'Y0000000Z'],
    ['Z0000000M', 'Z0000000M'],
  ])('reads %j as a NIE', (text, normalized) => {
    expect(readDniOrNie(text, BOTH)).toBe(normalized);
  });

  it.each<string>(['12345678A', 'X1234567A', 'Y0000000T', '00000000A'])('returns null for %j, whose control letter is wrong', (text) => {
    expect(readDniOrNie(text, BOTH)).toBeNull();
  });

  it.each<string>(['K1234567L', 'L1234567L', 'M1234567L', 'K0000000J'])(
    'returns null for the NIF %j, which is outside its scope',
    (text) => {
      expect(readDniOrNie(text, BOTH)).toBeNull();
    },
  );

  it.each<string>(['1234567L', '123456789Z', 'X12345678L', '12345678', 'Z', '', '12_345_678Z', '12345678ZZ'])(
    'returns null for %j, which does not have the shape of a DNI or a NIE',
    (text) => {
      expect(readDniOrNie(text, BOTH)).toBeNull();
    },
  );

  it('reads only the accepted kinds', () => {
    expect(readDniOrNie('X1234567L', ['nie'])).toBe('X1234567L');
    expect(readDniOrNie('12345678Z', ['nie'])).toBeNull();
    expect(readDniOrNie('12345678Z', ['dni'])).toBe('12345678Z');
    expect(readDniOrNie('X1234567L', ['dni'])).toBeNull();
  });

  it.each<unknown>([12345678, null, undefined, new String('12345678Z'), ['12345678Z']])(
    'returns null for %j, which is not a string',
    (value) => {
      expect(readDniOrNie(value, BOTH)).toBeNull();
    },
  );
});
