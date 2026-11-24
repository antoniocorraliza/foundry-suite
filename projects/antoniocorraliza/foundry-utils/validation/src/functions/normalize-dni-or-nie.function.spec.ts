import { describe, expect, it } from 'vitest';
import { normalizeDniOrNie } from './normalize-dni-or-nie.function';

describe('normalizeDniOrNie', () => {
  it('returns DNIs and NIEs as the shared reader of this entry writes them', () => {
    expect(normalizeDniOrNie('12.345.678-z')).toBe('12345678Z');
    expect(normalizeDniOrNie('x-1234567-l')).toBe('X1234567L');
  });

  it('returns null for what is not a valid DNI or NIE', () => {
    expect(normalizeDniOrNie('12345678A')).toBeNull();
    expect(normalizeDniOrNie(12345678)).toBeNull();
    expect(normalizeDniOrNie(null)).toBeNull();
  });
});
