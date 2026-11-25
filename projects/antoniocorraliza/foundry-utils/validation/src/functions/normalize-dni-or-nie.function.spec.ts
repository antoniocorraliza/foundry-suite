import { describe, expect, it } from 'vitest';
import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import { normalizeDniOrNie } from './normalize-dni-or-nie.function';
import { readDniOrNie } from './read-dni-or-nie.function';

describe('normalizeDniOrNie', () => {
  it('returns DNIs and NIEs as readDniOrNie writes them, or null', () => {
    const documents: ReadonlyArray<unknown> = [
      '12.345.678-Z',
      '12.345.678-z',
      'x1234567l',
      'x-1234567-l',
      '12345678A',
      'K1234567L',
      'Y1234567X',
      '',
      null,
    ];
    documents.forEach((document) => expect(normalizeDniOrNie(document)).toBe(readDniOrNie(document, IDENTITY_DOCUMENT_KINDS)));
  });

  it('returns null for what is not a valid DNI or NIE', () => {
    expect(normalizeDniOrNie('12345678A')).toBeNull();
    expect(normalizeDniOrNie(12345678)).toBeNull();
    expect(normalizeDniOrNie(null)).toBeNull();
  });
});
