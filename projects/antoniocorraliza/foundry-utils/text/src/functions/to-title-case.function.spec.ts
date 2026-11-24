import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { toTitleCase } from './to-title-case.function';

describe('toTitleCase', () => {
  it('writes each word with its first letter in upper case and the rest in lower case, also with accents', () => {
    expect(toTitleCase('ángel pérez')).toBe('Ángel Pérez');
    expect(toTitleCase('ÓSCAR')).toBe('Óscar');
    expect(toTitleCase('ángel óscar de la o')).toBe('Ángel Óscar De La O');
  });

  it('keeps an apostrophe inside a word and starts a new word after a hyphen', () => {
    expect(toTitleCase("o'brien")).toBe("O'brien");
    expect(toTitleCase('o’brien')).toBe('O’brien');
    expect(toTitleCase('jean-luc')).toBe('Jean-Luc');
  });

  it('starts a word at its first letter, after any digits', () => {
    expect(toTitleCase('3d model')).toBe('3D Model');
  });

  it('keeps combining marks inside the word', () => {
    expect(toTitleCase('ángel')).toBe('Ángel');
  });

  it('does not depend on the language of the device without a locale', () => {
    expect(toTitleCase('istanbul')).toBe('Istanbul');
    expect(toTitleCase('IŞIK')).toBe('Işik');
  });

  it('uses the rules of the language when a locale is given', () => {
    expect(toTitleCase('istanbul', { locale: 'tr' })).toBe('İstanbul');
    expect(toTitleCase('IŞIK', { locale: 'tr' })).toBe('Işık');
  });

  it('takes a null locale as none', () => {
    expect(toTitleCase('istanbul', { locale: null } as never)).toBe('Istanbul');
  });

  it('returns an empty text as it is', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('throws its own RangeError for an invalid language tag, with the error of the engine as the cause', () => {
    const error: unknown = catchThrown(() => toTitleCase('hola', { locale: 'es_ES' }));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toMatch(/^\[foundry-utils\]: /u);
    expect((error as RangeError).cause).toBeInstanceOf(RangeError);
  });

  it.each<unknown>([5, true, ['tr']])('throws a TypeError for the locale %j, which is not a string', (locale) => {
    expect(catchThrown(() => toTitleCase('hola', { locale } as never))).toBeInstanceOf(TypeError);
  });

  it.each<unknown>([null, undefined, 5, new String('a')])('throws a TypeError for the text %j, which is not a string', (text) => {
    expect(catchThrown(() => toTitleCase(text as string))).toBeInstanceOf(TypeError);
  });
});
