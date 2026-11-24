import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { capitalizeFirstLetter } from './capitalize-first-letter.function';

describe('capitalizeFirstLetter', () => {
  it('writes the first letter in upper case and leaves the rest as it is', () => {
    expect(capitalizeFirstLetter('iPhone')).toBe('IPhone');
    expect(capitalizeFirstLetter('hola MUNDO')).toBe('Hola MUNDO');
    expect(capitalizeFirstLetter('élan')).toBe('Élan');
  });

  it('returns an empty text as it is', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('changes only the first character, also when it is not a letter', () => {
    expect(capitalizeFirstLetter('¡hola')).toBe('¡hola');
    expect(capitalizeFirstLetter(' hola')).toBe(' hola');
    expect(capitalizeFirstLetter('1a')).toBe('1a');
  });

  it('does not split a first character outside the basic plane', () => {
    expect(capitalizeFirstLetter('𐐨bc')).toBe('𐐀bc');
  });

  it('uses the upper case of the language-independent rules, even when it is longer', () => {
    expect(capitalizeFirstLetter('ßtraße')).toBe('SStraße');
    expect(capitalizeFirstLetter('ǆemal')).toBe('Ǆemal');
    expect(capitalizeFirstLetter('istanbul')).toBe('Istanbul');
  });

  it.each<unknown>([null, undefined, 5, ['a'], new String('a')])('throws a TypeError for %j, which is not a string', (text) => {
    expect(catchThrown(() => capitalizeFirstLetter(text as string))).toBeInstanceOf(TypeError);
  });
});
