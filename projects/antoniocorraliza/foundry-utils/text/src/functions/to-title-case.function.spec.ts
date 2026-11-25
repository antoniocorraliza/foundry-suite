import { describe, expect, it } from 'vitest';
import { ɵparseLanguageTag, ɵparseTextOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
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

  it('rejects a locale that is not a text as parseTextOption does', () => {
    expect(catchError(() => toTitleCase('hola', { locale: 5 } as never), TypeError).message).toBe(
      catchError(() => ɵparseTextOption({ options: { locale: 5 }, name: 'locale', fallback: null }), TypeError).message,
    );
  });

  it('rejects an invalid language tag as parseLanguageTag does', () => {
    expect(catchError(() => toTitleCase('hola', { locale: 'es_ES' }), RangeError).message).toBe(
      catchError(() => ɵparseLanguageTag('es_ES'), RangeError).message,
    );
  });

  it.each<unknown>([null, undefined, 5, new String('a')])('throws a TypeError for the text %j, which is not a string', (text) => {
    expect(catchThrown(() => toTitleCase(text as string))).toBeInstanceOf(TypeError);
  });
});
