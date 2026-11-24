import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { toSlug } from './to-slug.function';

describe('toSlug', () => {
  it('writes lower-case words joined by hyphens, without accents', () => {
    expect(toSlug('Año Nuevo')).toBe('ano-nuevo');
    expect(toSlug('Canción de Ángel Pérez')).toBe('cancion-de-angel-perez');
  });

  it('transliterates the letters that have no accent to remove', () => {
    expect(toSlug('Straße Œuvre')).toBe('strasse-oeuvre');
    expect(toSlug('Æsir Øresund Łódź Đakovo')).toBe('aesir-oresund-lodz-dakovo');
    expect(toSlug('æ œ ø ł đ ß')).toBe('ae-oe-o-l-d-ss');
  });

  it('removes the hyphens at both ends and joins repeated hyphens and spaces into one', () => {
    expect(toSlug('- hola -')).toBe('hola');
    expect(toSlug('hola   --  mundo')).toBe('hola-mundo');
    expect(toSlug('--hola--')).toBe('hola');
  });

  it('removes other characters without turning them into hyphens', () => {
    expect(toSlug('v1.2')).toBe('v12');
    expect(toSlug('R&D')).toBe('rd');
    expect(toSlug('a_b/c')).toBe('abc');
    expect(toSlug('hola 😀 mundo')).toBe('hola-mundo');
  });

  it('separates words with any space, also a no-break space', () => {
    expect(toSlug('hola mundo')).toBe('hola-mundo');
    expect(toSlug('hola mundo')).toBe('hola-mundo');
  });

  it('returns an empty text for a text without Latin letters or digits', () => {
    expect(toSlug('日本語')).toBe('');
    expect(toSlug('')).toBe('');
    expect(toSlug(' - ')).toBe('');
  });

  it.each<unknown>([null, undefined, 5, new String('a')])('throws a TypeError for %j, which is not a string', (text) => {
    expect(catchThrown(() => toSlug(text as string))).toBeInstanceOf(TypeError);
  });
});
