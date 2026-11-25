import { describe, expect, it, vi } from 'vitest';
import { isDniOrNie } from './is-dni-or-nie.function';

describe('isDniOrNie', () => {
  it('checks documents with the shared reader of this entry', () => {
    expect(isDniOrNie('12.345.678-Z')).toBe(true);
    expect(isDniOrNie('x1234567l')).toBe(true);
    expect(isDniOrNie('12345678A')).toBe(false);
    expect(isDniOrNie('K1234567L')).toBe(false);
    expect(isDniOrNie(null)).toBe(false);
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
