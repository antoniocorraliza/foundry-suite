import { describe, expect, it, vi } from 'vitest';
import { IDENTITY_DOCUMENT_KINDS } from '../constants/identity-document-kinds.constant';
import { isDniOrNie } from './is-dni-or-nie.function';
import { readDniOrNie } from './read-dni-or-nie.function';

describe('isDniOrNie', () => {
  it('accepts and rejects documents as readDniOrNie reads them', () => {
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
    documents.forEach((document) => expect(isDniOrNie(document)).toBe(readDniOrNie(document, IDENTITY_DOCUMENT_KINDS) !== null));
  });

  it('accepts only the kinds of the accept option', () => {
    expect(isDniOrNie('12345678Z', { accept: ['nie'] })).toBe(false);
    expect(isDniOrNie('X1234567L', { accept: ['nie'] })).toBe(true);
    expect(isDniOrNie('X1234567L', { accept: ['dni'] })).toBe(false);
  });

  it.each<unknown>([[], ['cif'], ['nie', 'cif'], 'nie', [5], null])('accepts both kinds when accept is %j', (accept) => {
    expect(isDniOrNie('12345678Z', { accept } as never)).toBe(true);
    expect(isDniOrNie('X1234567L', { accept } as never)).toBe(true);
  });

  it('does not run a getter of its options', () => {
    const getter: () => ReadonlyArray<string> = vi.fn(() => ['nie']);
    expect(isDniOrNie('12345678Z', Object.defineProperty({}, 'accept', { get: getter, enumerable: true }))).toBe(true);
    expect(getter).not.toHaveBeenCalled();
  });
});
